"""Canonical detect → retrieve → generate pipeline."""

from __future__ import annotations

from backend.answer_generator import AnswerGenerator
from backend.conversation import ConversationManager
from backend.models import SuggestionCard, TranscriptUpdate
from backend.question_detector import QuestionDetector
from backend.retriever import KnowledgeRetriever


async def run_pipeline(
    update: TranscriptUpdate,
    conversation: ConversationManager,
    detector: QuestionDetector,
    retriever: KnowledgeRetriever,
    generator: AnswerGenerator,
) -> SuggestionCard | None:
    """Process one transcript segment. Returns a suggestion card when a question is detected."""
    if not conversation.add_transcript(update):
        return None

    question = await detector.detect(conversation.get_recent_context())
    if not question:
        return None

    results = await retriever.retrieve(question)
    return await generator.generate(question, results)
