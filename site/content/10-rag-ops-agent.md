# RAG ops agent (Barclays bullet 8)

## Resume bullet

> Shipped a production **RAG / LLM** ops agent in **Python/LangChain** with **PgVector** over incident runbooks and **ServiceNow/Jira** APIs — retrieval-grounded suggestions, **human-in-the-loop** (no unattended prod changes), cutting **MTTR 40%**.

This differentiates you — but IB will care most about **safety**.

## Teach first: What is an LLM?

A **Large Language Model** predicts likely next tokens. It’s great at drafting and summarizing, but it can **hallucinate** (make things up).

Never let an LLM freely restart payments in production without controls.

## What is RAG?

**RAG = Retrieval-Augmented Generation**

1. Convert the incident question to an embedding (vector)  
2. Retrieve nearest runbook chunks from a vector index  
3. Put those chunks into the prompt  
4. LLM answers **using retrieved evidence**

> **ELI5:** Instead of asking a student to memorize the entire encyclopedia, you let them open the right textbook page first, then answer.

Why RAG over fine-tuning for runbooks? Runbooks change; retrieval stays fresh; you can cite sources.

## Embeddings & PgVector

An **embedding** is a list of numbers representing meaning. Similar text → similar vectors.

**PgVector** is a PostgreSQL extension storing vectors + doing similarity search.

Why Postgres? Already understood ops model, joins with metadata filters, one less new datastore.

## LangChain (what to say)

Framework to wire:

- Prompt templates
- Retrievers / vector stores
- Tool calls (ServiceNow/Jira APIs)
- Agent loops (reason → act → observe)

## Human-in-the-loop (HITL) — non-negotiable

Your agent may:

- Suggest next steps  
- Draft ticket notes  
- Point to runbook sections  

Your agent must **not** (without human approval):

- Execute destructive prod actions unsupervised  
- Blindly trust untrusted ticket text (prompt injection risk)

> **Interview tip:** If asked “did it auto-remediate?”, answer: *suggestions + HITL; humans approve production actions.*

## Architecture

```
Incident (ServiceNow)
   → Agent (LangChain)
   → Retrieve runbook chunks (PgVector)
   → Draft grounded suggestion + citations
   → Optional tools: update ticket / open Jira (guarded)
   → Human reviews before risky actions
```

## MTTR −40%

**MTTR = Mean Time To Resolve**

Measure average time from incident open → resolve for a pilot class of issues, before vs after the tool.

Be ready to mention: comparable incident types, human still in loop, tool reduces search/context time.

## 30-second pitch

> I built a Python LangChain RAG assistant over runbooks in PgVector, integrated with ServiceNow/Jira. It retrieves grounded steps and helps ops faster, but keeps humans in the loop — no unattended prod changes. MTTR dropped about 40% on the pilot set.

## Interview Q&A

<details>
<summary>How do you reduce hallucinations?</summary>

Retrieve first; require citations; refuse when retrieval is empty/low confidence; evaluate with golden questions; HITL for actions.

</details>

<details>
<summary>Prompt injection?</summary>

Treat ticket text as untrusted data; delimit it; allowlist tools; never let retrieved “instructions” escalate privileges.

</details>

<details>
<summary>Why not only keyword search?</summary>

Semantic search catches paraphrases (“payment file stuck” vs “TWS step hung on load”). Hybrid (keyword + vector) is even better when codes/IDs matter.

</details>

Next: [Samsung, OSS, CodeReviewer](#/11-samsung-oss-project)
