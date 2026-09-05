# Enterprise Sales Copilot

<p align="center">
  <a href="https://github.com/SalesforceAIResearch/enterprise-sales-copilot"><img src="https://img.shields.io/badge/GitHub-Repository-blue?logo=github" alt="GitHub"></a>
  <a href="Tech-Report/main.pdf"><img src="https://img.shields.io/badge/Paper-PDF-red?logo=adobeacrobatreader" alt="Paper"></a>
  <a href="https://www.apache.org/licenses/LICENSE-2.0"><img src="https://img.shields.io/badge/License-Apache%202.0-green.svg" alt="License: Apache 2.0"></a>
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/Python-3.11+-blue?logo=python" alt="Python 3.11+"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React 18"></a>
</p>

On a live sales call, a customer asks something specific about a product. The rep switches to CRM or a knowledge base and digs. That search takes 25-65 seconds. Enterprise Sales Copilot listens to the call, picks out product questions, looks them up, and puts a short answer on the rep's screen in about 3 seconds. On our benchmark that is roughly 14× faster than manual search.

## What it does

- Detects product questions in live speech with an LLM
- Retrieves answers via FAQ match plus LLM-written SQL over a product database
- Works with OpenAI, Anthropic, or Google Gemini
- Ships with a demo mode that plays a scripted call through ElevenLabs TTS
- Swaps domains by swapping the product database

## Architecture

```
Browser Mic ──→ WebSocket ──→ FastAPI ──→ Deepgram (streaming STT)
                                               │
                                     Conversation Manager (buffer)
                                               │
                                     Question Detector (LLM)
                                               │
                                     Knowledge Retriever (FAQ + SQL)
                                               │
                                     Answer Generator (LLM)
                                               │
                                     WebSocket ──→ React Dashboard
```

## Quick start

### Prerequisites

- Python 3.11+ with [uv](https://docs.astral.sh/uv/)
- [Bun](https://bun.sh/) 1.1+
- API keys for [Deepgram](https://deepgram.com), [OpenAI](https://openai.com) (or Anthropic/Gemini), and optionally [ElevenLabs](https://elevenlabs.io) for demo mode

### Tooling

| Layer | Tools |
|-------|--------|
| Python deps / runner | [uv](https://docs.astral.sh/uv/) |
| Python lint + format | [Ruff](https://docs.astral.sh/ruff/) |
| Python types | [ty](https://docs.astral.sh/ty/) |
| Frontend package manager | [Bun](https://bun.sh/) |
| Frontend bundler / transforms | [Vite 8](https://vite.dev/) (Rolldown + Oxc) |
| Frontend lint | [oxlint](https://oxc.rs/docs/guide/usage/linter) |

```bash
# Python
uv run ruff check .
uv run ruff format .
uv run ty check

# Frontend
cd frontend && bun run lint
```

### 1. Clone and install

```bash
git clone https://github.com/SalesforceAIResearch/enterprise-sales-copilot.git
cd enterprise-sales-copilot

# Backend
uv sync

# Frontend
cd frontend && bun install && cd ..
```

### 2. Configure API keys

Create a `credentials.env` file in the project root:

```bash
# Required: Deepgram for speech-to-text
export DEEPGRAM_API_KEY="your-deepgram-key"

# LLM provider (pick one)
export LLM_PROVIDER="openai"       # "openai", "anthropic", or "gemini"
export LLM_MODEL="gpt-4o"          # model name for chosen provider

# OpenAI (standard API)
export OPENAI_API_KEY="your-openai-key"

# Anthropic (standard API)
export ANTHROPIC_API_KEY="your-anthropic-key"

# Google Gemini
export GEMINI_API_KEY="your-gemini-key"

# Optional: for demo mode TTS
export ELEVENLABS_API_KEY="your-elevenlabs-key"

# Optional: custom OpenAI-compatible gateway
# export OPENAI_BASE_URL="https://your-gateway.com/v1"
```

### 3. Run

```bash
# Terminal 1: Backend
source credentials.env
uv run uvicorn backend.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && bun run dev
```

Open http://localhost:5173 in your browser.

### 4. Use

| Mode | How |
|------|-----|
| Live | Click Start Mic, speak or let the customer speak. Suggestions show up in the right panel. |
| Demo | Click Demo to run a simulated insurance sales call with voice audio and live suggestions. |
| Text | Type a question in the bottom box to trigger retrieval without a microphone. |

## Benchmark results

Measured on 20 questions across 6 categories with GPT-4o, against an internal CRM study for manual search:

| Metric | Manual search | SalesCopilot | Improvement |
|--------|---------------|--------------|-------------|
| Avg. response time | 39.7s | 2.8s | 14× faster |
| Response time std. dev. | 12-18s | 0.5s | ~25× lower |
| Question detection rate | n/a | 100% (20/20) | n/a |
| Time per 10-question call | 6.6 min | 0.5 min | 5.7 min saved |
| Time per 20 calls/day | 2.2 hrs | 0.2 hrs | 1.9 hrs saved |

## Example database (insurance)

The repo includes a sample insurance knowledge base with 50 products across 10 categories:

| Category | Products | FAQs | Coverage details | Pricing tiers |
|----------|:--------:|:----:|:----------------:|:-------------:|
| Life, Health, Auto, Home, Travel | 5 each | ~250 each | ~30 each | ~16 each |
| Disability, Dental, Vision, Pet, Business | 5 each | ~250 each | ~30 each | ~16 each |
| **Total** | **50** | **2,490** | **290** | **162** |

To regenerate with fresh data:

```bash
source credentials.env && uv run python scripts/generate_large_db.py
```

Want a different sales domain? Replace `seed_data/insurance_products.json` with your own product data.

## Citation

If you use this work, please cite:

```bibtex
@article{qiu2025salescopliot,
  title={Enterprise Sales Copilot: Enabling Real-Time AI Support with Automatic Information Retrieval in Live Sales Calls},
  author={Qiu, Jielin and Yang, Liangwei and Zhu, Ming and Zhao, Wenting and Liu, Zhiwei and Tan, Juntao and Chen, Zixiang and Ram, Roshan and Prabhakar, Akshara and Murthy, Rithesh and Heinecke, Shelby and Xiong, Caiming and Savarese, Silvio and Wang, Huan},
  year={2025},
  institution={Salesforce AI Research}
}
```

## License

Apache License 2.0. See [LICENSE](LICENSE) for details.
