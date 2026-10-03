# RAG ops agent

**Resume line:** You shipped a production RAG and LLM ops agent in Python with LangChain and PgVector. The agent uses incident runbooks plus ServiceNow and Jira APIs. Suggestions are retrieval-grounded. A human stays in the loop. No unattended production changes. MTTR fell by about 40% on the pilot set.

---

## 1. Say this first (30 seconds)

> I built a Python LangChain RAG assistant over runbooks in PgVector. It drafts grounded next steps for ops through ServiceNow and Jira. A human approves production actions. MTTR fell by about 40% on the pilot class.

**CAUTION:** Do not say the LLM fixes production alone.

---

## 2. Words you must know

| Word | Meaning |
|------|---------|
| LLM | Model that predicts text. It can invent facts |
| Embedding | Numeric vector that represents meaning |
| RAG | Retrieve documents first. Then generate an answer |
| PgVector | Postgres extension for vector search |
| HITL | Human in the loop. A person approves risky actions |
| MTTR | Mean time to resolve an incident |

> **ELI5:** Do not force the model to memorize every runbook. Let it open the correct page first.

---

## 3. How it works

```
Incident in ServiceNow
  → agent receives text
  → retrieve top runbook chunks from PgVector
  → draft suggestion with citations
  → optional guarded tools (ticket note, Jira)
  → human reviews before risky actions
```

Safety rules:

- Treat ticket text as untrusted data.
- Allow only listed tools.
- If retrieval is empty or weak, escalate to a human.
- Do not execute destructive production actions without approval.

---

## 4. Say this (2 minutes)

> Ops spent time searching runbooks during repetitive incidents. I built a RAG assistant in Python with LangChain. Runbook chunks live in Postgres with PgVector. The agent retrieves relevant steps, then drafts a grounded suggestion. It can update ticket notes through APIs, but a human remains in the loop for production actions. We measured MTTR on a pilot incident class before and after. MTTR fell by about 40%. The value is faster context, not unsupervised remediation.

---

## 5. Top questions

<details>
<summary>How do you reduce hallucinations?</summary>

Retrieve first. Require citations. Refuse weak retrieval. Keep HITL for actions. Use a small eval set.

</details>

<details>
<summary>What is prompt injection here?</summary>

Untrusted ticket text tries to change tool behavior. Delimit that text. Allowlist tools. Do not let retrieved text raise privilege.

</details>

<details>
<summary>Why RAG instead of fine-tuning?</summary>

Runbooks change. RAG stays current. You can show the retrieved source.

</details>

---

## 6. Blind check

- [ ] Draw retrieve → generate → human approve.
- [ ] Say the HITL safety line.
- [ ] Speak the 30-second answer.

Next: [Samsung, OSS, CodeReviewer](#/11-samsung-oss-project)
