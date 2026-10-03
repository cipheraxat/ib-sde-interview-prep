# RAG ops agent

**Resume:** Prod **RAG/LLM** ops agent — **Python/LangChain/PgVector** over runbooks + **ServiceNow/Jira**. Retrieval-grounded. **HITL** — no unattended prod changes. **MTTR −40%** on pilot.

**CAUTION:** Never say LLM auto-fixes production.

---

## 1. Say this first (30s)

> LangChain RAG over runbooks in PgVector; drafts grounded next steps for ops via ServiceNow/Jira; human approves prod actions; MTTR ~−40% on pilot class.

---

## 2. Words

| Word | Meaning | Trap |
|------|---------|------|
| LLM | Predicts text; can hallucinate | Not source of truth |
| Embedding | Meaning as vector | Retrieval quality bottleneck |
| RAG | Retrieve then generate | Better than stale fine-tune for runbooks |
| Chunking | Split docs for embed/retrieve | Size vs context trade-off |
| PgVector | Vectors in Postgres | Joins + metadata filters |
| HITL | Human approves risky acts | Required line for IB |
| MTTR | Mean time to resolve | Measure before/after pilot |
| Prompt injection | Untrusted text steers tools | Delimit + allowlist tools |

> **ELI5:** Open the right runbook page first; then answer.

---

## 3. How it works

```
ServiceNow incident
  → embed/query → top-k runbook chunks (PgVector ± filters)
  → LLM drafts suggestion + citations
  → guarded tools (notes/Jira) 
  → human approves before risky prod actions
```

| Control | Rule |
|---------|------|
| Grounding | Prefer retrieved steps; cite chunk ids |
| Empty retrieval | No guess — escalate human |
| Untrusted ticket text | Delimit as data; not instructions |
| Tools | Allowlist per step; no broad shell |
| Eval | Golden questions; block regressions in CI if you have them |
| PII | Redact before model when needed |

**MTTR:** same incident class, before vs after, HITL still on. Fill sample size in Personal facts.

---

## 4. Say this (2 min)

> Ops lost time searching runbooks. RAG assistant: chunk+embed runbooks into PgVector; retrieve; draft grounded suggestion; optional ticket updates; human in loop for prod. Pilot MTTR −~40%. Value = faster context + consistency, not unsupervised remediation. Injection defenses: delimit ticket text, allowlist tools, fail closed on weak retrieval.

---

## 5. Top questions

<details><summary>Hallucinations?</summary>
Retrieve first; citations; refuse weak retrieval; HITL; eval set.
</details>
<details><summary>RAG vs fine-tune?</summary>
Runbooks change; RAG stays fresh and citable.
</details>
<details><summary>Why Postgres vectors?</summary>
One ops model, SQL filters, ACID metadata, less new infra.
</details>
<details><summary>What must never be automated?</summary>
Destructive prod changes / unattended remediations without approval.
</details>

---

## 6. Blind check

- [ ] Draw retrieve → generate → HITL
- [ ] HITL safety one-liner
- [ ] Injection defense two bullets
- [ ] Speak 30s cold

Next: [Samsung, OSS, CodeReviewer](#/11-samsung-oss-project)
