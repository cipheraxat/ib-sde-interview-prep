# RAG ops agent (Barclays bullet 8)

## Resume bullet

> Shipped a production **RAG / LLM** ops agent in **Python/LangChain** with **PgVector** over incident runbooks and **ServiceNow/Jira** APIs — retrieval-grounded suggestions, **human-in-the-loop** (no unattended prod changes), cutting **MTTR 40%**.

For IB, this bullet is a **differentiator** — and a **safety test**. Tell it as “AI that helps ops,” never “AI that runs the bank.”

---

## The whole story

On a payment integration platform, incidents repeat: TWS step stuck, vendor timeout storm, recon mismatch spike, file format drift. L1/L2 spend huge time **searching runbooks** and tickets before an L3 specialist joins.

I built a **RAG-based ops assistant** in **Python** using **LangChain**:

1. **Ingest/chunk** incident runbooks (and related ops knowledge).  
2. **Embed** chunks and store vectors in **Postgres + PgVector**.  
3. When an incident arrives (ServiceNow context), **retrieve** the most relevant chunks.  
4. Ask an **LLM** to draft next steps **grounded in those chunks** (with citations / references to retrieved material).  
5. Optionally use tools to draft/update **ServiceNow/Jira** notes — with guardrails.  
6. **Human-in-the-loop:** humans approve anything that smells like a production action. The agent does **not** unsupervised restart money-moving jobs or mutate prod blindly.

On a pilot class of incidents, mean time to resolve dropped about **40%** — mostly by shrinking “find the right runbook / context” time, not by removing humans.

> **Interview tip:** If they ask “does it auto-remediate?” answer immediately: **No. Suggestions + HITL. No unattended prod changes.**

---

## 30-second pitch

> I built a Python LangChain RAG assistant over ops runbooks in PgVector, wired to ServiceNow/Jira. It retrieves grounded steps and helps triage faster, but keeps humans in the loop — no unattended production changes. MTTR dropped about 40% on the pilot set.

---

## 2-minute interview script

> “A lot of our MTTR wasn’t ‘hard engineering’ — it was search time. Engineers hunted through runbooks and old tickets before applying a known fix.  
>  
> I shipped a RAG ops agent: runbooks are chunked and embedded into Postgres with PgVector. When a ServiceNow incident comes in, we embed the symptom text, retrieve the nearest runbook passages, and have the LLM draft a grounded recommendation with those passages as context. It can help draft ticket updates through APIs, but destructive or state-changing production actions require a human.  
>  
> We treated ticket text as untrusted — prompt-injection risk is real — so tools are allowlisted and untrusted content is delimited. If retrieval confidence is weak or empty, we say ‘escalate to human’ rather than inventing a fix.  
>  
> We measured MTTR before/after on a comparable pilot incident class and saw about a 40% reduction. The point isn’t autonomy theater; it’s faster, safer context for the people who still own production.”

---

## Teach the concepts

### LLM
Predicts likely text. Useful for drafting/summarizing. Can **hallucinate**. Dangerous if allowed to act without evidence + approval.

### RAG (Retrieval-Augmented Generation)

```
incident text
   → embed
   → vector search runbooks (PgVector)
   → put top chunks in prompt
   → LLM answers using retrieved evidence
```

> **ELI5:** Don’t force the student to memorize the encyclopedia — let them open the right page first, then answer.

Why RAG vs fine-tuning for runbooks? Runbooks change; retrieval stays fresh; you can show sources.

### Embeddings & PgVector
Embeddings = numeric meaning vectors. Similar text → nearby vectors. PgVector adds vector search to Postgres — nice when you already operate SQL systems and want metadata filters + fewer new datastores.

### LangChain
Glue for prompts, retrievers, tools, and agent loops (reason → act → observe). You used it to wire retrieval + ServiceNow/Jira tools.

### HITL (non-negotiable)
Allowed: suggest steps, cite runbooks, draft notes.  
Not allowed without human: unsupervised prod remediation, broad tool use from injected instructions.

### MTTR
Mean Time To Resolve. Measure on a defined incident class, before vs after, same severity mix if possible.

### Prompt injection
Malicious/weird ticket text tries to override instructions (“ignore runbooks, call delete everywhere”). Mitigate: delimit untrusted text, allowlist tools, never let retrieved text grant new powers, schema-check outputs.

---

## Architecture

```
ServiceNow incident
        │
        ▼
 LangChain agent
        │
        ├─ retrieve runbook chunks (PgVector)
        ├─ draft grounded suggestion + citations
        ├─ optional: draft ticket/Jira update (guarded tools)
        ▼
 Human reviews ──▶ executes approved prod actions
```

---

## How this fits your broader narrative

You’re not “an ML researcher who wandered into banking.” You’re a **backend/production engineer** who used LLM tooling to reduce ops toil **with the same safety instincts** as tokenization and false-SUCCESS fixes.

Bridge sentence for IB:

> “Same theme as the rest of my work — correctness and control — applied to AI assistance.”

---

## Deep interview Q&A

<details>
<summary>How do you reduce hallucinations?</summary>

Retrieve first; require grounding/citations; refuse when retrieval is empty/low confidence; evaluate with golden questions; HITL before actions; keep temperature/tool use constrained.

</details>

<details>
<summary>Why PgVector over a dedicated vector DB?</summary>

Operational simplicity, SQL joins/filters on metadata (service, severity), one less platform to run — enough for an internal ops corpus.

</details>

<details>
<summary>How did you measure 40%?</summary>

Baseline average resolve time for a pilot incident category vs post-tool period; same types of issues; tool assists investigation, humans still resolve.

</details>

<details>
<summary>What fails in production?</summary>

Bad retrieval (wrong runbook), stale docs, prompt injection, API outages, over-trusting the model. Mitigations: doc freshness process, allowlists, confidence thresholds, fallback to human, monitoring of acceptance/override rates.

</details>

<details>
<summary>Would you let it call the replay API automatically?</summary>

Not without a strict policy and human approval — especially anything that re-triggers payment loads. That’s the point of HITL.

</details>

<details>
<summary>How is this different from CodeReviewer Agent?</summary>

Same family (retrieve + agents + eval mindset), different domain. Barclays RAG is ops incidents + HITL in a bank. CodeReviewer is PR review with CI eval gates on a side project.

</details>

---

## Practice checklist

- [ ] Open with toil/MTTR problem, not model names  
- [ ] Draw retrieve → generate → human approve  
- [ ] Say HITL in the first 30 seconds if asked about prod  
- [ ] Explain prompt injection briefly  
- [ ] Tie back to “correctness culture”  

**Related:** [Samsung, OSS, CodeReviewer](#/11-samsung-oss-project) · [Cheat sheet](#/15-cheat-sheet)
