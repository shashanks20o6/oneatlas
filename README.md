# OneAtlas — AI Model Infrastructure & Intelligence Catalog

OneAtlas is a full-stack AI model discovery, benchmarking, and provider telemetry platform built with **Next.js App Router, TypeScript, TailwindCSS, Prisma ORM, Zod, and PostgreSQL**.

Developers can search and filter foundation models across creator labs and inference providers, compare token pricing and latency side-by-side, inspect standardized benchmark leaderboards, and estimate monthly production API spend.

---

## Core Features

- **Model Discovery Catalog (`/models`)**: Real-time debounced search (`300ms`), URL-synced filters (Creator Lab, Inference Provider, Model Type, Capabilities), and sorting by lowest input price, context length, or release date.
- **Model Detail & Telemetry (`/models/[slug]`)**: Full context window and max output specs, provider-by-provider pricing (`$/1M` input & output), Time-to-First-Token (`TTFT`) latency, throughput (`tokens/sec`), and visual benchmark progress bars.
- **Monthly Workload Cost Estimator**: Interactive sliders on every Model Detail page to calculate estimated 30-day spend per provider based on daily request volume and average prompt/output token counts.
- **Side-by-Side Comparison (`/compare`)**: Compare up to 4 models simultaneously with automatic trophy highlighting for lowest pricing, largest context window, and top benchmark scores.
- **Benchmark Rankings (`/rankings`)**: Filterable leaderboard across `Coding`, `Reasoning`, `Knowledge`, and `Math` evaluations.
- **Labs & Providers Directories (`/labs`, `/providers`)**: Browse model creators and GPU inference providers with direct deep-links into pre-filtered catalog views.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript
- **Styling**: TailwindCSS & Lucide Icons
- **Database & ORM**: PostgreSQL (Neon) & Prisma ORM
- **Validation**: Zod (runtime URL query parameter validation)
- **Deployment**: Vercel

---

## Relational Database Schema

The PostgreSQL database is structured around 5 relational tables in `prisma/schema.prisma`:

1. **`Lab`** (`1:N` with `Model`): Foundation model creators (e.g., OpenAI, Anthropic, Google, Meta, DeepSeek, Mistral, xAI).
2. **`Model`**: Core model specifications including `contextWindow`, `maxOutputTokens`, `modelType`, `capabilities[]`, `modalities[]`, and `releaseDate`.
3. **`Provider`** (`M:N` with `Model`): Inference hosting endpoints (e.g., OpenAI Direct, Anthropic Direct, AWS Bedrock, Together AI, Groq, Fireworks).
4. **`ModelProvider`**: Join table linking `Model` and `Provider` (`@@unique([modelId, providerId])`) with pairing-specific `inputPricePer1M`, `outputPricePer1M`, `latencyMs`, and `throughputTps`.
5. **`BenchmarkScore`**: Standardized evaluation metrics (`MMLU-Pro`, `SWE-bench`, `GPQA`, `HumanEval`, etc.) categorized by domain.

---

## API Endpoints

All endpoints validate query parameters with **Zod** and return structured JSON from PostgreSQL:

- `GET /api/models` — Search, filter (`lab`, `provider`, `capability`, `modality`, `modelType`), sort (`price_asc`, `price_desc`, `context_desc`, `newest`), and paginate models.
- `GET /api/models/[slug]` — Retrieve complete model specs, hosting providers ordered by lowest price, and benchmark scores.
- `GET /api/compare?slugs=model-a,model-b` — Fetch up to 4 models in parallel for matrix comparison.
- `GET /api/rankings?category=Coding&benchmark=SWE-bench` — Retrieve ordered leaderboard scores.
- `GET /api/labs` & `GET /api/providers` — Directory listings with relational model counts.

---

## Local Setup Instructions

1. **Clone the repository and install dependencies:**
   ```bash
   git clone [https://github.com/shashanks20o6/oneatlas.git](https://github.com/shashanks20o6/oneatlas.git)
   cd oneatlas
   npm install