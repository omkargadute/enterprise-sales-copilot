"""LLM-based answer generation for salesperson suggestion cards."""

from __future__ import annotations

import json

from backend.models import DetectedQuestion, SuggestionCard

SYSTEM_PROMPT = """\
You are an AI assistant helping a salesperson during a live customer call. Given the customer's question and relevant data from the product database, generate a concise, accurate answer that the salesperson can quickly read and relay.

Rules:
- Be concise (2-4 sentences max)
- Include specific numbers (prices, deductibles, limits) when available
- Use natural language, not technical jargon
- If the data doesn't fully answer the question, say what you know and note what's missing
- Do not use markdown formatting; plain text only"""


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
