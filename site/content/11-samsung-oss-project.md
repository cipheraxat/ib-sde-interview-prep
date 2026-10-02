# Samsung, OSS & CodeReviewer

These prove curiosity and code quality beyond your day job. Keep answers short and concrete.

---

## Samsung Research — Prism Intern (Jul–Nov 2021)

### Bullet

Built a multi-modal ML pipeline in Python/Pandas over **10,000+** sensor points across **3** datasets; **+20%** accuracy with a 4-person team.

### Teach quickly

**Multi-modal** = combine multiple signal types (e.g. motion + physiology), not one sensor alone.

Typical internship workflow:

1. Clean/join sensor data (Pandas)  
2. Train/validation split  
3. Fight overfitting  
4. Track metrics on holdout  
5. Improve accuracy ~20% vs baseline  

### 30-second pitch

> At Samsung Research I worked on a multi-modal ML pipeline over 10k+ sensor points across three datasets. Using Python/Pandas with a 4-person team, we improved holdout accuracy by about 20% after fixing overfitting.

If they go deep and you don’t remember model details, be honest about internship scope and emphasize experimental discipline (splits, metrics, overfitting).

---

## Open Source — how to talk about PRs

Formula for any PR:

1. **Symptom** users/devs hit  
2. **Root cause**  
3. **Minimal fix**  
4. **Tests / review iteration**  
5. **Merged**

### microsoft/vscode (PR1, PR2)

- Reserved Modern UI tab close-button column so it doesn’t overlay filename  
- Fixed tab decoration colors applying to full label  

> Frontend/CSS/layout correctness in a huge TypeScript codebase — shows you can navigate unfamiliar code.

### microsoft/playwright (PR3)

- VS Code extension connect path now passes client name on token-bypass connections  

> Integration bug between tools — careful API contract fix.

### kubernetes/kubernetes (PR4)

- EndpointSlice controller metric renamed with `_total` suffix per stable metrics conventions  

> Tiny change, high bar: metrics stability conventions in core infra.

### apple/pkl (PR5)

- Fixed incorrect `super` method resolution inside `let` expressions  

> Language runtime correctness — reading interpreter/compiler-adjacent code.

### 30-second OSS umbrella pitch

> I contribute upstream fixes when I hit real bugs — VS Code UI correctness, Playwright extension connect behavior, Kubernetes metrics naming, and a Pkl runtime resolution bug. It keeps me sharp outside Barclays tickets.

---

## CodeReviewer Agent (side project)

### What it is

Production-style **multi-agent GitHub PR reviewer**:

- **LangGraph** orchestration  
- Parallel **security** + **pattern** agents  
- **Supabase pgvector** RAG over code / JIRA / Confluence  
- Ensemble dedupe + fact-check against the diff  
- Inline GitHub comments  
- Golden-set **CI eval** (precision/recall gates)

### Why it matters in interviews

Shows you can ship agent systems with **eval gates**, not just demos.

### 45-second pitch

> I built CodeReviewer Agent — a LangGraph multi-agent PR reviewer. It indexes code and ticket context into pgvector, runs security/pattern agents in parallel, fact-checks findings against the diff, and posts inline comments. CI blocks regressions using a golden PR set with precision/recall thresholds.

### Safety talking points

- Deny lists / size gates on files  
- Prompt-injection hardening (untrusted PR text delimited; tools allowlisted)  
- Don’t post low-confidence noise  

---

## When to use which story

| Interview need | Story |
|----------------|-------|
| ML exposure | Samsung |
| Collaboration / humility | OSS review iterations |
| AI systems depth | CodeReviewer or Barclays RAG |
| Backend core | Prefer Barclays bullets first |

Next: [Coding & SQL drills](#/12-coding-sql)
