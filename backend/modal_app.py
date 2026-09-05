"""Modal deployment entry point for the Enterprise Sales Copilot FastAPI API."""

from pathlib import Path

import modal

ROOT = Path(__file__).resolve().parent.parent

image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_sync(
        str(ROOT),
        frozen=True,
        extra_options="--no-dev",
    )
    .env({"DB_PATH": "/tmp/sales_copilot.db"})
    .add_local_python_source("backend")
    .add_local_dir(str(ROOT / "seed_data"), remote_path="/root/seed_data")
)

app = modal.App("enterprise-sales-copilot")

# Create/update with:
#   modal secret create sales-copilot --from-dotenv credentials.env --force
# Keep this list unconditional. Mixing Secret.from_dotenv only when a local
# file exists makes local and remote dependency counts diverge and breaks boot.
secrets = [modal.Secret.from_name("sales-copilot")]


@app.function(
    image=image,
    secrets=secrets,
    env={
        # Accept local Next.js + any Vercel preview/production hostname.
        # After you have a stable frontend domain, set FRONTEND_URL in the
        # sales-copilot secret and optionally tighten CORS_ORIGIN_REGEX.
        "CORS_ORIGINS": "http://localhost:3000",
        "CORS_ORIGIN_REGEX": r"https://.*\.vercel\.app",
    },
    scaledown_window=300,
    timeout=3600,
)
@modal.concurrent(max_inputs=50)
@modal.asgi_app()
def fastapi_app():
    """Expose the existing FastAPI application as one Modal web function."""
    from backend.main import app as web_app

    return web_app
