"""Benchmark SalesCopilot: measure real end-to-end latency and answer accuracy.

Sends 20 questions across different categories through the full pipeline
(question detection → retrieval → answer generation) and measures latency.

Usage:
    source credentials.env
    uv run python scripts/benchmark.py
"""

from __future__ import annotations

import asyncio
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.answer_generator import AnswerGenerator
from backend.config import settings
from backend.conversation import ConversationManager
from backend.database import init_db
from backend.llm_client import LLMClient
from backend.models import TranscriptUpdate
from backend.pipeline import run_pipeline
from backend.question_detector import QuestionDetector
from backend.retriever import KnowledgeRetriever

BENCHMARK_QUESTIONS = [
    ("coverage", "What is the deductible for the home insurance dwelling coverage?"),
    ("coverage", "Does the health plan cover emergency room visits?"),
    ("coverage", "What's the collision coverage limit on the auto insurance?"),
    ("coverage", "Is accidental death covered under the term life policy?"),
    ("pricing", "How much does the 20-year term life insurance cost per month?"),
    ("pricing", "What's the monthly premium for the gold tier health plan?"),
    ("pricing", "How much is the premium auto insurance plan?"),
    ("pricing", "What does the annual multi-trip travel insurance cost?"),
    ("policy_terms", "What is the cancellation policy for auto insurance?"),
    ("policy_terms", "Can I renew my health insurance plan automatically?"),
    ("policy_terms", "What's the term length for the home insurance policy?"),
    ("claims", "How do I file a claim after a car accident?"),
    ("claims", "What's the process for a travel insurance medical claim?"),
    ("claims", "How long does it take to process a life insurance claim?"),
    ("eligibility", "Is there an age limit for travel insurance?"),
    ("eligibility", "Are pre-existing conditions covered under health insurance?"),
    ("eligibility", "What health rating is required for the 30-year term life plan?"),
    ("cross_product", "Which insurance plans cover mental health services?"),
    ("cross_product", "What are the cheapest insurance options you offer across all categories?"),
    ("cross_product", "Compare the deductibles across home, auto, and health insurance."),
]


async def run_benchmark():
    """Run the full benchmark."""
    print("=" * 70)
    print("SalesCopilot Benchmark: Real End-to-End Latency Measurement")
    print("=" * 70)

    print("\nInitializing components...")
    await init_db()
    llm = LLMClient(provider=settings.llm_provider, model=settings.llm_model)
    conv = ConversationManager()
    detector = QuestionDetector(llm)
    retriever = KnowledgeRetriever(llm)
    generator = AnswerGenerator(llm)
    print(f"LLM Provider: {settings.llm_provider}, Model: {settings.llm_model}")

    results = []
    print(f"\nRunning {len(BENCHMARK_QUESTIONS)} questions...\n")
    print(f"{'#':<3} {'Category':<15} {'Latency':>8} {'Detected':>9} {'Answer (first 60 chars)'}")
    print("-" * 100)

    for i, (category, question) in enumerate(BENCHMARK_QUESTIONS):
        conv.clear()
        update = TranscriptUpdate(text=question, is_final=True)

        t_start = time.monotonic()
        card = await run_pipeline(update, conv, detector, retriever, generator)
        t_total = time.monotonic() - t_start

        answer_text = card.answer if card else ""
        result = {
            "index": i + 1,
            "category": category,
            "question": question,
            "detected": card is not None,
            "detected_question": card.question if card else None,
            "answer": answer_text,
            "latency_total_ms": round(t_total * 1000),
        }
        results.append(result)

        answer_preview = answer_text[:60] + "..." if len(answer_text) > 60 else answer_text
        status = "✓" if card else "✗"
        print(f"{i + 1:<3} {category:<15} {t_total * 1000:>7.0f}ms {status:>9} {answer_preview}")

    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)

    latencies = [r["latency_total_ms"] for r in results]
    detected_count = sum(1 for r in results if r["detected"])
    mean = sum(latencies) / len(latencies)
    variance = sum((x - mean) ** 2 for x in latencies) / len(latencies)

    print(f"\nQuestions tested:     {len(results)}")
    print(
        f"Questions detected:  {detected_count}/{len(results)} ({detected_count / len(results) * 100:.0f}%)"
    )
    print("\nEnd-to-end latency:")
    print(f"  Mean:   {mean:.0f} ms")
    print(f"  Median: {sorted(latencies)[len(latencies) // 2]:.0f} ms")
    print(f"  Min:    {min(latencies):.0f} ms")
    print(f"  Max:    {max(latencies):.0f} ms")
    print(f"  Std:    {variance**0.5:.0f} ms")

    print("\nPer-category latency:")
    for cat in sorted({r["category"] for r in results}):
        cat_results = [r for r in results if r["category"] == cat]
        cat_latencies = [r["latency_total_ms"] for r in cat_results]
        cat_detected = sum(1 for r in cat_results if r["detected"])
        print(
            f"  {cat:<15} mean={sum(cat_latencies) / len(cat_latencies):>6.0f}ms  "
            f"detected={cat_detected}/{len(cat_results)}"
        )

    output_path = Path(__file__).resolve().parent.parent / "Tech-Report" / "benchmark_results.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(results, indent=2))
    print(f"\nResults saved to: {output_path}")
    return results


if __name__ == "__main__":
    asyncio.run(run_benchmark())
