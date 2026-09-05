"""SQLite database layer for insurance product data."""

from __future__ import annotations

import json
import logging
from pathlib import Path

import aiosqlite

from backend.config import settings

logger = logging.getLogger(__name__)

DB_SCHEMA = """\
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT
);
CREATE TABLE IF NOT EXISTS coverage_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES products(id),
    coverage_type TEXT NOT NULL,
    coverage_amount REAL,
    deductible REAL,
    conditions TEXT
);
CREATE TABLE IF NOT EXISTS policy_terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES products(id),
    term_length TEXT,
    renewal_policy TEXT,
    cancellation_policy TEXT
);
CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES products(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES products(id),
    tier_name TEXT NOT NULL,
    monthly_premium REAL,
    annual_premium REAL,
    age_range TEXT,
    conditions TEXT
);
"""

# Compact schema text for LLM SQL generation (single source of truth).
SCHEMA_DESCRIPTION = """\
- products(id, name, category, description) — category values: life, health, auto, home, travel
- coverage_details(id, product_id, coverage_type, coverage_amount, deductible, conditions)
- policy_terms(id, product_id, term_length, renewal_policy, cancellation_policy)
- faqs(id, product_id, question, answer)
- pricing_tiers(id, product_id, tier_name, monthly_premium, annual_premium, age_range, conditions)\
"""

_SEED_FILE = Path(__file__).resolve().parent.parent / "seed_data" / "insurance_products.json"

_TABLE_ORDER = (
    ("products", ("id", "name", "category", "description")),
    (
        "coverage_details",
        ("product_id", "coverage_type", "coverage_amount", "deductible", "conditions"),
    ),
    ("policy_terms", ("product_id", "term_length", "renewal_policy", "cancellation_policy")),
    ("faqs", ("product_id", "question", "answer")),
    (
        "pricing_tiers",
        ("product_id", "tier_name", "monthly_premium", "annual_premium", "age_range", "conditions"),
    ),
)


def db_path() -> str:
    """Return the absolute database path, creating parent dirs if needed."""
    path = Path(settings.db_path)
    if not path.is_absolute():
        path = Path(__file__).resolve().parent.parent / path
    path.parent.mkdir(parents=True, exist_ok=True)
    return str(path)


async def get_db() -> aiosqlite.Connection:
    """Return a connection with row_factory set to aiosqlite.Row."""
    db = await aiosqlite.connect(db_path())
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA foreign_keys = ON")
    return db


async def init_db() -> None:
    """Create tables and seed data from insurance_products.json if tables are empty."""
    db = await get_db()
    try:
        await db.executescript(DB_SCHEMA)
        await db.commit()

        cursor = await db.execute("SELECT COUNT(*) FROM products")
        row = await cursor.fetchone()
        if row[0] > 0:
            logger.info("Database already seeded (%d products).", row[0])
            return

        logger.info("Seeding database from %s", _SEED_FILE)
        data = json.loads(_SEED_FILE.read_text())

        for table, columns in _TABLE_ORDER:
            placeholders = ", ".join("?" * len(columns))
            col_list = ", ".join(columns)
            sql = f"INSERT INTO {table} ({col_list}) VALUES ({placeholders})"
            for record in data[table]:
                await db.execute(sql, tuple(record[c] for c in columns))

        await db.commit()
        logger.info("Database seeded successfully.")
    finally:
        await db.close()


async def execute_query(
    query: str,
    params: list | tuple | None = None,
    *,
    source: str = "",
) -> list[dict]:
    """Execute a SQL query and return results as dicts, optionally tagged with *source*."""
    db = await get_db()
    try:
        cursor = await db.execute(query, params or [])
        rows = await cursor.fetchall()
        results = [dict(row) for row in rows]
        if source:
            for row in results:
                row["_source"] = source
        return results
    finally:
        await db.close()
