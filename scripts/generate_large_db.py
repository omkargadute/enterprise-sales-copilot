"""Generate a large insurance product database using GPT.

Targets ~2-3 million tokens of diverse insurance product data:
- 50 products across 10 categories
- 500+ coverage details
- 50+ policy terms docs
- 2000+ FAQs
- 300+ pricing tiers
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path

import openai

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Salesforce gateway config
API_KEY = os.environ.get("OPENAI_API_KEY", "")
BASE_URL = os.environ.get(
    "OPENAI_BASE_URL", "https://gateway.salesforceresearch.ai/openai/process/v1"
)

client = openai.AsyncOpenAI(
    base_url=BASE_URL,
    api_key="dummy",
    default_headers={"X-Api-Key": API_KEY},
)

MODEL = "gpt-4o"

INSURANCE_CATEGORIES = [
    "life",
    "health",
    "auto",
    "home",
    "travel",
    "disability",
    "dental",
    "vision",
    "pet",
    "business",
]

PRODUCTS_PER_CATEGORY = 5  # 50 total


async def generate(system: str, prompt: str, temperature: float = 0.9) -> str:
    """Call GPT and return the response text."""
    for attempt in range(3):
        try:
            resp = await client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
                max_tokens=4096,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            print(f"  Retry {attempt + 1}/3: {e}")
            await asyncio.sleep(2**attempt)
    return ""


def _parse_items(raw: str) -> list | None:
    """Parse a JSON array from an LLM response, or None on failure."""
    data = parse_json(raw)
    return data if isinstance(data, list) else None


async def generate_products() -> list[dict]:
    """Generate 50 diverse insurance products."""
    products = []
    product_id = 1

    for category in INSURANCE_CATEGORIES:
        print(f"Generating {PRODUCTS_PER_CATEGORY} {category} insurance products...")
        prompt = f"""Generate exactly {PRODUCTS_PER_CATEGORY} unique {category} insurance products.
For each product, provide a JSON object with:
- "name": a realistic product name (e.g., "SecureLife Premium Term 30")
- "category": "{category}"
- "description": 3-5 plain sentences stating who it is for, what it covers, and notable limits. No marketing fluff.

Return a JSON array of {PRODUCTS_PER_CATEGORY} products. Only JSON, no other text."""

        raw = await generate(
            "You write plain insurance product catalog copy. Return valid JSON only.",
            prompt,
        )
        items = _parse_items(raw)
        if items is None:
            print(f"  Failed to parse products for {category}, skipping")
            continue
        for item in items[:PRODUCTS_PER_CATEGORY]:
            item["id"] = product_id
            item["category"] = category
            products.append(item)
            product_id += 1

    return products


async def generate_coverage_details(products: list[dict]) -> list[dict]:
    """Generate 8-12 coverage details per product."""
    all_coverage = []

    # Process in batches of 5 products
    for i in range(0, len(products), 5):
        batch = products[i : i + 5]
        batch_names = ", ".join(f'"{p["name"]}" (id={p["id"]}, {p["category"]})' for p in batch)
        print(f"Generating coverage details for products {i + 1}-{i + len(batch)}...")

        prompt = f"""For each of these insurance products, generate 8-12 coverage items:
{batch_names}

For each coverage item, provide:
- "product_id": the product's id number
- "coverage_type": specific type (e.g., "Accidental Death & Dismemberment", "Emergency Room Co-pay", "Collision Damage Waiver")
- "coverage_amount": dollar amount (0 for unlimited or included services)
- "deductible": dollar amount (0 if none)
- "conditions": 2-3 factual sentences on limits, exclusions, and how the benefit applies

Return a JSON array. Use concrete dollar amounts. Only JSON, no other text."""

        raw = await generate(
            "You write insurance coverage specs. Return valid JSON only.",
            prompt,
        )
        items = _parse_items(raw)
        if items is None:
            print(f"  Failed to parse coverage for batch {i // 5 + 1}")
            continue
        all_coverage.extend(items)

    return all_coverage


async def generate_policy_terms(products: list[dict]) -> list[dict]:
    """Generate detailed policy terms for each product."""
    all_terms = []

    for i in range(0, len(products), 5):
        batch = products[i : i + 5]
        batch_names = ", ".join(f'"{p["name"]}" (id={p["id"]}, {p["category"]})' for p in batch)
        print(f"Generating policy terms for products {i + 1}-{i + len(batch)}...")

        prompt = f"""For each of these insurance products, generate policy terms:
{batch_names}

For each, provide:
- "product_id": the product's id
- "term_length": specific options (e.g., "1 year, 3 year, 5 year", "Per-trip up to 90 days")
- "renewal_policy": 3-4 sentences on renewal conditions, notice periods, and premium changes
- "cancellation_policy": 3-4 sentences on refunds, penalties, and notice requirements

Return a JSON array. Be specific. Only JSON, no other text."""

        raw = await generate(
            "You write insurance policy terms. Return valid JSON only.",
            prompt,
        )
        items = _parse_items(raw)
        if items is None:
            print(f"  Failed to parse terms for batch {i // 5 + 1}")
            continue
        all_terms.extend(items)

    return all_terms


async def generate_faqs(products: list[dict]) -> list[dict]:
    """Generate 30-50 FAQs per product."""
    all_faqs = []

    for product in products:
        print(f"Generating FAQs for {product['name']}...")

        topics_batches = [
            "coverage limits, exclusions, and what is included",
            "pricing, payments, discounts, and billing cycles",
            "claims filing, documentation, timelines, and disputes",
            "eligibility, enrollment, beneficiaries, and life events",
            "regulatory requirements and how this product compares on common features",
        ]

        for batch_idx, topics in enumerate(topics_batches):
            prompt = f"""Generate 10 FAQ pairs for this insurance product:
Product: {product["name"]} ({product["category"]} insurance)
Description: {product["description"]}

Focus on: {topics}

For each FAQ, provide:
- "product_id": {product["id"]}
- "question": a specific customer question (15-30 words)
- "answer": a direct answer (50-150 words) with concrete numbers and next steps. No marketing language.

Return a JSON array of 10 FAQs. Only JSON, no other text."""

            raw = await generate(
                "You write insurance FAQ answers customers would actually get on a call. Return valid JSON only.",
                prompt,
            )
            items = _parse_items(raw)
            if items is None:
                print(f"  Failed to parse FAQs batch {batch_idx + 1} for {product['name']}")
                continue
            for item in items:
                item["product_id"] = product["id"]
            all_faqs.extend(items)

    return all_faqs


async def generate_pricing_tiers(products: list[dict]) -> list[dict]:
    """Generate 4-8 pricing tiers per product."""
    all_pricing = []

    for i in range(0, len(products), 5):
        batch = products[i : i + 5]
        batch_info = "\n".join(
            f'- "{p["name"]}" (id={p["id"]}, {p["category"]}): {p["description"][:100]}'
            for p in batch
        )
        print(f"Generating pricing tiers for products {i + 1}-{i + len(batch)}...")

        prompt = f"""For each of these insurance products, generate 4-6 pricing tiers:
{batch_info}

For each tier, provide:
- "product_id": the product's id
- "tier_name": name (e.g., "Bronze Individual", "Family Premium Plus")
- "monthly_premium": dollar amount
- "annual_premium": dollar amount (usually about 11x monthly if there is an annual discount)
- "age_range": applicable age range or "N/A"
- "conditions": 2-3 sentences on deductibles, what the tier includes, and who qualifies

Return a JSON array. Use realistic pricing. Only JSON, no other text."""

        raw = await generate(
            "You write insurance pricing tiers. Return valid JSON only.",
            prompt,
        )
        items = _parse_items(raw)
        if items is None:
            print(f"  Failed to parse pricing for batch {i // 5 + 1}")
            continue
        all_pricing.extend(items)

    return all_pricing


async def main():
    print("=" * 60)
    print("Generating large insurance product database")
    print("=" * 60)

    # Step 1: Products
    products = await generate_products()
    print(f"\nGenerated {len(products)} products")

    if not products:
        print("No products generated, aborting")
        sys.exit(1)

    # Step 2: Coverage details (parallel with policy terms)
    print("\n--- Generating coverage details and policy terms ---")
    coverage_task = asyncio.create_task(generate_coverage_details(products))
    terms_task = asyncio.create_task(generate_policy_terms(products))

    coverage = await coverage_task
    terms = await terms_task
    print(f"Generated {len(coverage)} coverage details, {len(terms)} policy terms")

    # Step 3: FAQs (the bulk of the data)
    print("\n--- Generating FAQs (this is the big one) ---")
    faqs = await generate_faqs(products)
    print(f"Generated {len(faqs)} FAQs")

    # Step 4: Pricing tiers
    print("\n--- Generating pricing tiers ---")
    pricing = await generate_pricing_tiers(products)
    print(f"Generated {len(pricing)} pricing tiers")

    # Assemble and save
    data = {
        "products": products,
        "coverage_details": coverage,
        "policy_terms": terms,
        "faqs": faqs,
        "pricing_tiers": pricing,
    }

    output_path = Path(__file__).resolve().parent.parent / "seed_data" / "insurance_products.json"
    output_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))

    # Stats
    total_text = json.dumps(data)
    word_count = len(total_text.split())
    char_count = len(total_text)
    est_tokens = char_count // 4

    print("\n" + "=" * 60)
    print("Database generation complete!")
    print(f"  Products:         {len(products)}")
    print(f"  Coverage details: {len(coverage)}")
    print(f"  Policy terms:     {len(terms)}")
    print(f"  FAQs:             {len(faqs)}")
    print(f"  Pricing tiers:    {len(pricing)}")
    print(f"  Total words:      ~{word_count:,}")
    print(f"  Total chars:      ~{char_count:,}")
    print(f"  Est. tokens:      ~{est_tokens:,}")
    print(f"  Saved to:         {output_path}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
