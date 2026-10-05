# RAG ops agent

**Resume:** Production **RAG** agent in **Python / LangChain / PgVector**. Runbooks + ServiceNow / Jira. **Human in the loop.** **MTTR about 40% lower** on the pilot.

**CAUTION:** Do not say the model fixes production by itself.

---

## STAR — the story

### S — Situation (the problem)

Ops handled repeat incidents by **searching runbooks by hand**. Time to resolve was high. A plain LLM can **invent steps** that are not in the runbook. Ticket text is also **untrusted** — it can try to trick the model into calling tools (prompt injection). An agent that restarts payments with no human is not acceptable in a bank.

### T — Task (your job)

Help ops find the right runbook steps faster, **without** unsupervised production changes.

### A — Action (what you did)

1. Split runbooks into chunks and store **embeddings in Postgres (PgVector)**.
2. On an incident, **retrieve** the closest chunks first (RAG).
3. The model drafts next steps **from those chunks** and can cite them.
4. If retrieval is empty or weak, **do not guess**. Send it to a human.
5. Tools (ServiceNow / Jira notes) are an **allowlist**. Ticket text is data, not instructions.
6. A **human approves** any production action.

```
Incident → search runbook vectors → draft with citations
        → human approves before a risky action
```

> **ELI5:** The model must open the right page of the runbook before it answers. It does not answer from memory alone.

### R — Result

On the **pilot incident class**, mean time to resolve fell by about **40%**. Humans still approve production actions. The gain is faster context, not auto-remediation.

Fill the sample size in [Personal facts](#/02a-personal-facts).

---

## Say the STAR in 60 seconds

> Ops lost time hunting runbooks, and a free-form model would invent steps or take ticket text as orders. I built a RAG assistant: runbooks live as vectors in Postgres, the model answers from retrieved chunks, and a human approves production actions. If nothing relevant is retrieved, it does not guess. On the pilot set, MTTR fell about 40%.

---

## If they go deeper

| Word | One line |
|------|----------|
| RAG | Retrieve documents, then generate |
| Embedding | Numbers that represent meaning |
| PgVector | Vector search inside Postgres |
| HITL | Human in the loop |
| MTTR | Average time to resolve |
| Prompt injection | Untrusted text tries to control tools |

| Control | Rule |
|---------|------|
| Grounding | Cite the chunk |
| Empty search | Escalate. Do not invent |
| Tools | Allowlist only |
| PII | Redact before the model when needed |

<details>
<summary>Why RAG instead of fine-tuning?</summary>
Runbooks change. Retrieval stays current and you can show the page you used.
</details>

<details>
<summary>Why Postgres for vectors?</summary>
One database ops already know. You can filter by service or severity in SQL.
</details>

## Blind check

- [ ] Tell S-T-A-R without notes
- [ ] Draw retrieve → draft → human
- [ ] Say the sentence: the model does not fix production alone

Next: [Samsung, OSS, CodeReviewer](#/11-samsung-oss-project)
