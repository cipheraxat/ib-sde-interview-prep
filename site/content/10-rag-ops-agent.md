# RAG operations assistant

**On your resume:** You built a **Python** assistant with **LangChain** and **PgVector**. It reads operations tickets (ServiceNow / Jira) and runbooks, suggests a likely cause and the next step, and a **person still approves** before anything changes. Mean time to resolve dropped about **40%**.

**Say this carefully:** The model **suggests**. It does **not** fix production by itself.

**In the night:** After that night fails, this is what helps on-call find the old write-up. A person still does the fix.

---

## STAR — the story

### S — Situation (what the world looked like)

When a night job fails, the on-call engineer opens a ticket in **ServiceNow** or **Jira**, then hunts through old tickets, wiki pages, and runbooks to find a similar failure. That search is slow at 2 a.m. The same timeout might have happened last month, but the write-up is buried.

A tempting shortcut is “let a chatbot read the ticket and restart the job.” That is unsafe. The model can sound confident and still be wrong. Restarting the wrong step can post a payment twice or hide a real data problem.

### T — Task (what you were asked to do)

Shorten the time from “ticket opened” to “engineer knows the likely next step,” **without** letting the model change production on its own.

### A — Action (what you actually built)

This pattern is called **RAG**: retrieval-augmented generation. In plain words, the model is not asked to remember the bank. You **look up** the relevant notes first, then the model writes an answer **from those notes**.

1. Runbooks and resolved tickets are split into chunks and stored as vectors in **Postgres with PgVector**. A vector is a numeric fingerprint of the text so “vendor timeout on payment sync” can find older write-ups that use different words.
2. A new ticket comes in. The app turns the ticket text into the same kind of numeric fingerprint and searches for the closest chunks.
3. **LangChain** sends the model only those chunks plus the question: what is the likely cause, and what should the human check next?
4. The answer comes back as a **suggestion** on the ticket: possible cause, the runbook section, and the checks (scheduler log, your status row, vendor status).
5. A **person** reads it. If they agree, they follow the runbook or call the replay API. The model never gets a button that restarts jobs or edits the database.
6. If the search finds nothing useful, the assistant says it does not know. It does not invent a procedure.

```
Ticket text
  → search similar runbooks and old tickets (PgVector)
  → model writes a suggestion from those pages only
  → human reads it and decides
  → human runs the real fix (replay API or the runbook)
```

### R — Result (what changed)

Engineers spent less time hunting for the same failure. **Mean time to resolve** (how long a ticket stays open) dropped about **40%** on the incidents this assistant covered. The model stayed a reader and a drafter. Production changes stayed with people.

Write the sample size and how you measured the 40% in [Personal facts](#/02a-personal-facts) before the interview.

---

## Say it in about 60 seconds

> On-call used to spend a long time searching old tickets and runbooks after a batch failure. I built a Python assistant that stores those documents in Postgres with PgVector, finds the closest ones for a new ticket, and asks the model to suggest a cause and a next check using only those pages. A person still approves every action. The model does not restart jobs. On the incidents we measured, time to resolve dropped about 40 percent.

---

## If they ask more

| They ask | You say |
|----------|---------|
| What if the suggestion is wrong? | The human ignores it. Nothing in production has changed yet. |
| Why not fine-tune a model on all tickets? | The runbooks change. Retrieval uses the current pages. You can also see which page the answer came from. |
| What data is in the index? | Operational notes and runbooks. Not a dump of customer personal data into the prompt. |
| What is a vector here? | A list of numbers that represents the meaning of a paragraph, so search is by similarity, not only exact words. |

## Blind check

- [ ] Explain the 2 a.m. problem in plain words
- [ ] Explain RAG as “search first, then write from those pages”
- [ ] Say who is allowed to restart a job

Next: [Samsung and open source](#/11-samsung-oss-project)
