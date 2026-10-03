# Personal facts & honesty bounds

This page is the **truth layer**. If a story isn’t here, don’t invent it in the interview.

> **Interview tip:** It’s better to say “I don’t remember the exact table name; conceptually it was …” than to fabricate proprietary details.

## Identity

| Field | Value |
|-------|--------|
| Name | Akshat Anand |
| Role | Software Development Engineer II (BA-4) |
| Company | Barclays, Pune |
| Tenure | Aug 2022 – Present (~4 years) |
| Prior | Samsung Prism Intern, Jul–Nov 2021 |
| Education | SRM B.Tech CSE, CGPA 9.5/10 |
| Target | Interactive Brokers SDE (Java backend) |

## Domain framing (locked)

- You work on a **payment / treasury integration** platform.  
- You do **not** claim brokerage trading, matching engines, or IB Trader Workstation.  
- **TWS on resume = IBM Tivoli Workload Scheduler**, not IB Trader Workstation. Say it early.

## Ownership map (what you can claim)

| Area | You can say | Don’t say |
|------|-------------|-----------|
| Migration program | Contributed; built integration services for workflows in scope | “I migrated the entire bank alone” |
| Tokenization | Drove HLD/LLD for the path; recon/retry design | “I built DPaaS” |
| Async workers | Owned app-level worker + failure semantics | “I rewrote all of TWS” |
| Kafka events | Published from your services to audit/reporting | “I own the whole Kafka platform” |
| Replay API | Built ops replay for failed steps | “Ops never needs eng now” |
| Jenkins/Veracode | Pipeline + packaging for **your** service | “I own enterprise CI for Barclays” |
| RAG agent | Built HITL ops assistant; measured MTTR on pilot class | “LLM auto-remediates production” |

## Numbers — evidence notes

Fill the blank cells with your real evidence before interviews. Until then, use the careful wording in the “Safe line” column.

| Number | Meaning | Safe line | Your evidence (fill) |
|--------|---------|-----------|----------------------|
| 80+ | TWS-orchestrated business processes in scope | Workflows/job defs, not 80 microservices | |
| 5,000+/day | Transactions via integration layer | Peaks matter more than average TPS | |
| 100K+ | Accounts in migration/tokenization scope | Distinct account IDs in recon population | |
| 60% | Batch throughput after async workers | Same input volume / comparable window | before ___ → after ___ |
| 25% | Release cycle time cut | Commit→prod for your service | |
| 40% | MTTR cut from RAG pilot | Pilot incident class + HITL still required | sample size ___ |
| 20% | Samsung accuracy | Holdout metric vs baseline | metric name ___ |

## Tools you actually used (claim only these)

Java, Spring Boot / Spring Framework, Spring Data JPA, Maven, JUnit, Mockito, MySQL, Oracle SQL, Apache Kafka, Jenkins, Git, Linux, Unix Shell, IBM TWS, ServiceNow, Jira, Veracode, Python, LangChain, PgVector, AWS (as vendor hosting / integration context).

## Honesty bounds — refuse or soften

| Topic | Stance |
|-------|--------|
| Perl / deep PL/SQL | Not a primary skill; SQL via app/JDBC is your lane |
| Front-end at Barclays | Not your core; OSS vscode touches are separate |
| Trading systems | Do not claim |
| Exact proprietary vendor product internals | Stay at integration-contract level |
| Unsupervised LLM prod actions | Never — HITL only |

## Blind checklist

- [ ] Say 60s opener including TWS disambiguation  
- [ ] Name two deep stories (Tokenization + Async)  
- [ ] State one thing you did **not** own for each story  

Next: [Your story & framing](#/02-framing-and-story)
