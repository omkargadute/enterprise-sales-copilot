"""Knowledge retriever that searches FAQs and generates SQL to answer customer questions."""

from __future__ import annotations

import asyncio
import logging
import re
from typing import Any

from backend.database import SCHEMA_DESCRIPTION, execute_query
from backend.llm_parse import extract_sql
from backend.models import DetectedQuestion

logger = logging.getLogger(__name__)

SQL_SYSTEM_PROMPT = f"""\
You are a SQL query generator. Given a customer question about insurance products and the database schema, generate a SQLite SELECT query to retrieve the relevant information.

Schema:
{SCHEMA_DESCRIPTION}

Rules:
- Only generate SELECT statements (no INSERT, UPDATE, DELETE)
- Use JOINs to include product names in results
- Return only the SQL query, no explanation
- If the question is about a specific product, filter by product name or category
- Limit results to 10 rows"""

_UNSAFE_SQL = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|ATTACH|DETACH|PRAGMA)\b",
    re.IGNORECASE,
)


class KnowledgeRetriever:
    """Retrieves relevant product data from the database."""

    def __init__(self, llm_client: Any):
        self._llm = llm_client

    async def retrieve(self, question: DetectedQuestion) -> list[dict]:
        """Retrieve relevant data using FAQ match + SQL generation in parallel."""
        faq_task = asyncio.create_task(self._search_faqs(question.question))
        sql_task = asyncio.create_task(self._generate_and_execute_sql(question))
        faq_result, sql_result = await asyncio.gather(faq_task, sql_task, return_exceptions=True)

        faq_results: list[dict] = []
        sql_results: list[dict] = []

        if isinstance(faq_result, Exception):
            logger.error("FAQ search failed", exc_info=faq_result)
        else:
            faq_results = faq_result

        if isinstance(sql_result, Exception):
            logger.error("SQL generation/execution failed", exc_info=sql_result)
        else:
            sql_results = sql_result

        seen: set[str] = set()
        combined: list[dict] = []
        for item in faq_results + sql_results:
            key = str(sorted(item.items()))
            if key not in seen:
                seen.add(key)
                combined.append(item)
        return combined

    async def _search_faqs(self, question: str) -> list[dict]:
        """Search FAQs table using keyword matching."""
        keywords = [w for w in question.lower().split() if len(w) > 3]
        if not keywords:
            return []

        conditions = " OR ".join(["f.question LIKE ?"] * len(keywords))
        params = [f"%{kw}%" for kw in keywords]
        query = (
            "SELECT f.question, f.answer, p.name AS product_name, p.category "
            "FROM faqs f JOIN products p ON f.product_id = p.id "
            f"WHERE {conditions} LIMIT 10"
        )
        return await execute_query(query, params, source="faqs")

    async def _generate_and_execute_sql(self, question: DetectedQuestion) -> list[dict]:
        """Use LLM to generate SQL and execute it."""
        user_prompt = f"Customer question: {question.question}"
        if question.category:
            user_prompt += f"\nDetected category: {question.category}"

        sql = extract_sql(await self._llm.complete(SQL_SYSTEM_PROMPT, user_prompt))

        if not sql.upper().startswith("SELECT"):
            logger.warning("LLM did not return a SELECT query: %s", sql[:100])
            return []

        if _UNSAFE_SQL.search(sql):
            logger.warning("Unsafe SQL detected, skipping: %s", sql[:100])
            return []

        return await execute_query(sql, source="sql_generation")
