# Barclays Bullet 8 — RAG / LLM Ops Agent

Production RAG / LLM ops agent in Python/LangChain/PgVector over runbooks and ServiceNow/Jira APIs; human-in-the-loop; MTTR cut 40%.

**30 seconds** On-call engineers searched scattered runbooks and tickets. I built a RAG tool that retrieves relevant docs and similar incidents, suggests recovery steps with citations, and never auto-changes prod — MTTR dropped about 40% on our pilot queue.

## Architecture

┌─────────────┐    ┌─────────────────────────────────────────────┐
│ Indexing    │    │  Runbooks (Markdown/PDF)                    │
│ (batch)     │───▶│  ServiceNow API (resolved incidents)        │
│             │    │  Jira API (RCA tickets)                       │
└──────┬──────┘    └──────────────────┬──────────────────────────┘
       │ chunk + embed                 │
       ▼                               │
┌──────────────┐                       │
│ PostgreSQL   │◀──────────────────────┘
│ + PgVector   │
└──────┬───────┘
       │ top-k similarity
       ▼
┌──────────────┐    ┌─────────────┐    ┌──────────────────┐
│ Ops UI / CLI │───▶│ LangChain   │───▶│ LLM (internal/   │
│ query        │    │ RAG chain   │    │  approved model) │
└──────────────┘    └─────────────┘    └──────────────────┘
       ▲                                      │
       └──────── cited answer + steps ────────┘
                    (human executes manually)
  

**Q:** RAG pipeline step-by-step

1.  **Ingest:** fetch docs from Confluence/runbook repo + SN/Jira APIs.
2.  **Chunk:** 500–1000 tokens, overlap 100; metadata: source, date, system.
3.  **Embed:** sentence-transformer or OpenAI ada — store vector in PgVector.
4.  **Query:** embed user question; cosine similarity top-k=5.
5.  **Generate:** prompt LLM with chunks + “answer only from context; cite sources.”
6.  **Guardrails:** no prod write tools; confidence threshold → “escalate to L3.”

**Q:** Why RAG not fine-tuning?

Runbooks change weekly; fine-tuning expensive and stale fast. RAG gives citations ops can verify. Lower compliance risk — no model stores PII if indexing scrubs it. Faster iteration — re-embed changed docs only.

**Q:** LangChain components you used

`DocumentLoader`, `RecursiveCharacterTextSplitter`, `OpenAIEmbeddings` or local embeddings, `PGVector` vectorstore, `RetrievalQA` or LCEL chain, `ChatPromptTemplate` with system message for safety.

**Q:** ServiceNow / Jira integration

Read-only API keys; pull resolved incidents with resolution notes; index as “past incident” chunks; at query time retrieve similar tickets — “last time vendor 503, we replayed from checkpoint X.” Rate limit API calls; PII redaction before embed.

**Q:** How measured 40% MTTR?

MTTR = resolve_time - open_time for Sev-2 integration incidents. Baseline: 90 days pre-tool median. Pilot: 60 days post-tool same category, same team. Result: e.g. 120 min → 72 min = 40% reduction. Caveat: sample size ~N; correlation not perfect; controlled for vendor outages.

**Q:** Human-in-the-loop — what exactly?

Tool suggests steps; engineer reads citations; engineer runs kubectl/sql/replay API manually; tool has no credentials to mutate prod. Disclaimer in UI. Feedback thumbs up/down for improvement loop.

**Q:** Failure modes of RAG

Hallucination when retrieval misses → say “insufficient context”; stale runbook → show doc date; wrong chunk → low similarity score filter; prompt injection in ticket text → sanitize inputs.
