# CodeReviewer Agent — Technical Project

Multi-agent GitHub PR reviewer: LangGraph, security + pattern agents, GitHub Actions; RAG with Supabase pgvector, BM25 fallback, eval harness with precision/recall in CI.

**60 seconds** Personal project: on each PR, GitHub Actions runs my pipeline — indexes diff context, retrieves related code and JIRA/Confluence via Supabase pgvector, runs parallel security and pattern agents orchestrated by LangGraph, dedupes findings, posts inline review comments. CI runs a golden-set eval for precision and recall so quality doesn’t regress.

## LangGraph orchestration

START
  → ingest_pr (fetch diff, changed files)
  → build_context (RAG: embed query, pgvector top-k, BM25 fallback)
  → fork parallel:
        security_agent (OWASP, secrets, injection)
        pattern_agent (style, conventions, anti-patterns)
  → ensemble (dedupe by file+line+rule, score, filter low confidence)
  → publish (GitHub Review API + JSON artifact)
END
  

**Q:** Why multi-agent?

Separation of concerns — security prompts/rules differ from style rules; parallel execution faster; tune and eval agents independently; ensemble reduces false positives from single monolithic prompt.

**Q:** RAG indexing

Batch job: walk repo AST-aware chunks; pull JIRA/Confluence via API; chunk 400–800 tokens; embed (OpenRouter/OpenAI); upsert to Supabase `documents` table with pgvector column + metadata (path, source_type, updated_at). HNSW or IVFFlat index for search.

**Q:** BM25 fallback

When semantic search returns low scores (new symbol names, rare tokens), combine with BM25 keyword search — hybrid retrieval improves recall on exact identifiers like class names.

**Q:** Eval harness

Golden set: PR fixtures with expected findings (file, line, category). Run pipeline in CI; compare predicted vs expected; precision = TP/(TP+FP), recall = TP/(TP+FN). Gate merge if below thresholds (e.g. recall ≥ 0.9, precision ≥ 0.65 — verify in your repo README).

**Q:** GitHub Actions integration

`pull_request` trigger → checkout → setup Python → run indexer if needed → run reviewer → post comments via `gh api` or PyGithub → upload SARIF or JSON report artifact.

**Q:** vs Barclays RAG

Barclays: ops incidents, internal runbooks, human executes fixes. CodeReviewer: developer workflow, public GitHub, multi-agent + eval-driven quality, posts automated review comments (still not auto-merge).

Advanced: reducing false positives, cost, latency

**Q:** Too many false positives?

Raise confidence threshold; ensemble voting; require two agents agree; few-shot examples in prompt; expand golden set with false positive cases.

**Q:** LLM cost?

Cache embeddings; retrieve only changed files + neighbors; smaller model for pattern agent; batch API calls.
