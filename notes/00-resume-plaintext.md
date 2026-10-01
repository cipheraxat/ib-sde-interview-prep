# Resume — plaintext extract (Varkala PDF)

Source: `/Users/Admin/Downloads/Varkala/Akshat_Anand_Resume.pdf`

## Header

**Akshat Anand**  
github.com/cipheraxat · linkedin.com/in/akshatanand1999 · akshatanandmallik@gmail.com · +91 91783 73933  
Pune, India

## Professional Summary

Software Development Engineer II with 4 years at Barclays owning back-end Java / Spring Boot microservices, web services, and AWS on Linux. Strong in Oracle/MySQL SQL database work, Unix Shell, Python, Git, Jenkins, Kafka, system design (HLD/LLD), and production ownership.

## Professional Experience

### Barclays — Software Development Engineer II (BA-4) — Pune — Aug 2022 – Present

1. Migrating legacy Unix platform → third-party SaaS on AWS; Java/Spring Boot integration for 80+ TWS-orchestrated processes via vendor REST; 5,000+ daily txns; 100K+ accounts.
2. HLD/LLD so vendor SaaS stores tokenized PII: DPaaS tokenize on-prem, DTU encrypted transit to AWS; batch recon confirms 100K+ accounts; fault-tolerant retries; zero downtime.
3. +60% batch throughput: async workers (one file per execution) instead of sync vendor REST inside TWS jobs; SQL/JPA step state; timeout/non-2xx ⇒ fail step (not false success).
4. Refactored Core Java → Maven multi-module Spring Framework / Spring Boot + Spring Data JPA; OOP, SOLID, design patterns; JUnit/Mockito; integration tests; code reviews.
5. Apache Kafka payment/account-status events from Spring Boot to internal audit/reporting (async, non-blocking for TWS).
6. Spring Boot batch replay / step-level recovery API after TWS failures (ops re-trigger without manual DB intervention).
7. Fat JAR + Jenkins promote test→staging→prod; −25% release cycle time; Veracode zero critical.
8. Production RAG/LLM ops agent (Python/LangChain/PgVector) over runbooks + ServiceNow/Jira; HITL; −40% MTTR.

### Samsung Research — Prism Intern — Bangalore — Jul 2021 – Nov 2021

Multi-modal ML pipeline in Python/Pandas over 10,000+ sensor points, 3 datasets; +20% accuracy; 4-person team.

## Open Source

- microsoft/vscode (PR1, PR2): Modern UI tab close-button column; tab decoration colors on full label  
- microsoft/playwright (PR3): VS Code extension connect path client name on token-bypass  
- kubernetes/kubernetes (PR4): EndpointSlice metric `_total` suffix  
- apple/pkl (PR5): `super` method resolution inside `let`

## Technical Projects

**CodeReviewer Agent** — LangGraph multi-agent GitHub PR reviewer; security/pattern agents; Supabase pgvector RAG (code/JIRA/Confluence); BM25 fallback; golden-set CI eval.

## Skills

Java, Python, SQL, Spring Boot/Framework/Data JPA, REST, Maven, Mockito, FastAPI, LangChain, AWS, PostgreSQL, MySQL, Oracle, Redis, Kafka, Linux, Unix Shell, IBM TWS, Jenkins, Git, Jira, ServiceNow, Veracode, microservices, HLD/LLD, OOP, SOLID, multithreading, event-driven, Agile.

## Education

SRM IST — B.Tech CSE — CGPA 9.5/10 — Jul 2018 – May 2022
