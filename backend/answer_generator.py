"""LLM-based answer generation for salesperson suggestion cards."""

from __future__ import annotations

import json

from backend.models import DetectedQuestion, SuggestionCard

SYSTEM_PROMPT = """\
Write a short answer a salesperson can read aloud on a live call. Use the customer's question and the product database rows provided.

Rules:
- 2-4 sentences
- Include prices, deductibles, and limits when the data has them
- Plain language, no markdown
- If the data is incomplete, say what you know and what is missing"""


class AnswerGenerator:
    """Generates salesperson-friendly answers from retrieved data."""

    def __init__(self, llm_client):
        self._llm = llm_client

    async def generate(
        self,
        question: DetectedQuestion,
        db_results: list[dict],
    ) -> SuggestionCard:
        """Generate a suggestion card with a concise answer."""
        context_lines: list[str] = []
        source_tables: list[str] = []
        for row in db_results:
            source = row.get("_source")
            if source and source not in source_tables:
                source_tables.append(source)
            payload = {k: v for k, v in row.items() if k != "_source"}
            context_lines.append(json.dumps(payload))

        context_text = "\n".join(context_lines) if context_lines else "(no matching data found)"

        user_prompt = (
            f"Customer question: {question.question}\n"
            f"Category: {question.category}\n\n"
            f"Relevant product data:\n{context_text}"
        )

        answer = await self._llm.complete(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=user_prompt,
        )

        return SuggestionCard(
            question=question.question,
            answer=answer.strip(),
            source=", ".join(source_tables) if source_tables else "",
            confidence=question.confidence,
        )
