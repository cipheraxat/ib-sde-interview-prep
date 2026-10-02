# Your story & framing

This lesson is about **how you present yourself**. Wrong framing loses interviews even with strong tech.

## Who you are (one sentence)

Backend Software Development Engineer II at Barclays with ~4 years building **Java/Spring Boot payment-integration systems** on Linux — batch orchestration, REST vendor APIs, SQL reconciliation, Kafka, and production recovery tooling — plus a production RAG ops assistant with human-in-the-loop.

## Domain framing (say this clearly)

You work on an **investment-bank payment / treasury integration platform**.

You do **not** claim:

- Brokerage order matching
- Market making
- IB Trader Workstation development
- “I built trading systems”

You **do** claim:

- Transactional backends in a regulated bank
- High correctness / auditability
- Batch + API integrations at account scale

> **Interview tip:** Map your experience to IB as *reliability + Java/SQL production discipline*, then say you’re eager to learn brokerage domain (orders, positions, back office).

## 60-second opener (memorize)

> “I’m a backend engineer with four years at Barclays on a payment integration platform. We migrated a legacy Unix batch stack to a vendor SaaS on AWS. I built Java Spring Boot services behind **IBM Workload Scheduler** — that’s batch job scheduling, not IB’s Trader Workstation — handling REST integrations, SQL reconciliation, Kafka events to audit systems, and ops tooling like batch replay APIs. I’m strongest in Java, Spring, and SQL on Linux production systems. Outside work I contribute to VS Code and Kubernetes and built a multi-agent PR reviewer. I want a backend role where correctness and production discipline matter — which is why IB interests me.”

Practice until you can say it without reading.

## Ownership language (precision = trust)

| Say | When | Don’t say |
|-----|------|-----------|
| Contributed to the platform migration | Cross-team program, 80+ workflows | I migrated the entire bank |
| Owned the integration service / recon design / replay APIs | Your deliverables | I designed everything alone |
| Drove HLD/LLD for tokenization path | You wrote/led design reviews | I built DPaaS |
| Partnered with ops, vendor, security | Real bank delivery | No dependencies |

## Every number — what it means if pressed

| Number | Meaning | If they dig |
|--------|---------|-------------|
| 4 years | Aug 2022 – present | SDE II (BA-4) |
| 80+ | Distinct TWS-orchestrated business processes | Workflows/job defs, **not** 80 microservices |
| 5,000+ daily | Business transactions via integration layer | Peaks matter more than average TPS |
| 100K+ accounts | Migration + tokenization scope | Distinct account IDs in recon |
| 60% | Batch throughput after async workers | Same input volume, less wall-clock / more records/hour |
| 25% | Release cycle time cut | Commit-to-prod for your service |
| 40% MTTR | Mean time to resolve for pilot incident class | Before/after RAG tool; HITL still required |
| 20% | Samsung accuracy vs baseline | Holdout metric |

## 2-minute “Tell me about yourself”

1. **Present:** SDE II Barclays, payment integration  
2. **Scale story:** Unix → SaaS; Spring Boot + TWS + vendor REST  
3. **Three wins:** tokenization design, +60% async throughput, replay + Kafka + RAG ops  
4. **Proof of craft:** OSS + CodeReviewer  
5. **Ask:** Backend Java role with correctness culture → IB

## Common traps

1. Overclaiming trading experience  
2. Confusing TWS meanings  
3. Saying LLM “auto-fixes prod” (you use human-in-the-loop)  
4. Listing 10 bullets with no depth — pick 2 deep stories  

Next deep dive: [Unix → SaaS migration](#/03-migration-unix-saas)
