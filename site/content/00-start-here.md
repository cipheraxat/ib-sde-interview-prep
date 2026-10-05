# Start here

Welcome. This site is your **Interactive Brokers SDE** study guide, rewritten so you can learn every idea from scratch and then connect it to **your** Barclays resume.

## What this site is for

Interactive Brokers (IB) is hiring Software Engineers who are strong in:

- **Java** on **Unix/Linux**
- **SQL** (Oracle / MySQL)
- **REST** backends
- Production systems (troubleshooting, reliability)
- Ideally some **Kafka**, **Git/Jenkins**, and financial-domain awareness

Your resume already maps to that. Your job in interviews is to **explain clearly**, not to sound fancy.

## Critical warning (say this early)

> **Interview tip:** On your resume, **TWS = IBM Tivoli Workload Scheduler** (enterprise batch job scheduler). At Interactive Brokers, people often hear **TWS = Trader Workstation** (IB’s trading desktop app).  
> In the first 60 seconds, say: *“When I say TWS I mean IBM Workload Scheduler for batch jobs — not IB’s Trader Workstation.”*

If you don’t clarify, the interviewer may think you claimed trading-platform experience you don’t have.

## How to study (by round)

| Round | Focus | Lessons |
|-------|--------|---------|
| Recruiter / HR | Story, Why IB, notice period | Personal facts → Framing → Traps → Behavioral → Cheat sheet |
| Technical screen | 2 Barclays bullets + Java/SQL | Tokenization or Async + Java/Spring core + [Coding solutions](#/12-coding-sql) + [Java DSA pen and paper](#/12b-java-dsa) |
| Deep technical | Design + failure modes | Tokenization (proof/recovery/cutover), Async, Kafka, System design |
| Hiring manager | Ownership, judgment, culture | Behavioral + RAG HITL + Traps |
| Every week | Practice loop | [7-day drills & mocks](#/16-drill-schedule) |

**Rule:** Don’t skim every lesson the night before. Pick **2 Barclays bullets** you can teach on a whiteboard (recommended: **Tokenization** + **Async**). Know the others at “30-second pitch” level.

## One night

Say this before you open a deep dive. Every Barclays page hangs on it.

> Overnight, IBM TWS starts a job. My Spring service calls the vendor and writes SUCCESS or FAILED in MySQL. If the step succeeded, Kafka tells audit and reporting. If it failed, operations uses the replay API. Jenkins is how that service was built and released. When on-call is stuck, the RAG assistant suggests the runbook. A person still does the fix.

The timeout rule lives on the Async page. Migration, Spring, and Replay point back to it. Say it once.

**Read in this order** so each page adds one piece of that night. The sidebar stays in resume order.

1. [Async](#/05-async-throughput) — the batch was slow, and a timeout could be stored as success
2. [Spring](#/06-spring-refactor) — the code shape that lets a test prove the timeout rule
3. [Replay](#/08-replay-api) — a person retries the FAILED row
4. [Kafka](#/07-kafka) — audit and reporting hear the outcome
5. [Unix to SaaS](#/03-migration-unix-saas) — that service sits between the scheduler and the vendor
6. [PII](#/04-pii-tokenization) — how customer data is allowed to reach the vendor
7. [Jenkins](#/09-cicd-jenkins) — how the service was built, scanned, and released
8. [RAG](#/10-rag-ops-agent) — how on-call finds the runbook after the night fails

**Done means blind:** draw diagram, speak 2 minutes, answer 3 hard follow-ups — then Mark done.

## How each deep dive page works

Every Barclays deep dive uses the same order. Read top to bottom. Stop when the blind check passes.

| Block | Purpose |
|-------|---------|
| STAR | Plain-English story: what the bank looked like, what your job was, what you changed, and the result |
| 60-second STAR | Speak that story in one pass |
| If they go deeper | Diagrams, SQL, failure tables |
| Blind check | Pass this before Mark done |

Read the Situation first. It is written so you can picture the problem before the technical detail.

Use **Mark done** only after you speak the answer with no notes.

## Your resume at a glance (memorize)

- **Role:** Software Development Engineer II (BA-4), Barclays, Pune, Aug 2022 – Present  
- **Domain:** Payment / treasury **integration** platform (not brokerage trading)  
- **Big program:** Legacy Unix → vendor **SaaS on AWS**  
- **Stack:** Java, Spring Boot, SQL (MySQL/Oracle), Kafka, Jenkins, Linux, IBM TWS  
- **AI add-on:** Python RAG ops agent (LangChain + PgVector), human-in-the-loop, −40% MTTR  
- **Side:** OSS (VS Code, Playwright, Kubernetes, Pkl) + CodeReviewer Agent  
- **Education:** SRM B.Tech CSE, CGPA **9.5/10**

## Numbers you must not mix up

| Number | Meaning |
|--------|---------|
| 80+ | Business processes / TWS workflows in migration scope |
| 5,000+/day | Transactions through the integration layer |
| 100K+ | Accounts in migration / tokenization |
| 60% | Batch throughput improvement after async workers |
| 25% | Faster release cycle (Jenkins / packaging) |
| 40% | MTTR reduction from RAG ops agent |
| 20% | Samsung model accuracy improvement |

## What “good” looks like in an IB interview

They want someone who:

1. Writes correct Java and SQL  
2. Thinks about **failures** (timeouts, retries, duplicates)  
3. Respects **money / data correctness**  
4. Can explain a system without buzzword soup  
5. Owns production problems calmly  

Next: [Backend basics (from zero)](#/01-concepts-backend-basics)
