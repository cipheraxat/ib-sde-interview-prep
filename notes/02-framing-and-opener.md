# Framing — say this before they misread your resume

**Critical:** `TWS` on your resume = **IBM TWS (Tivoli Workload Scheduler)** — enterprise batch job orchestration. It is *not* Interactive Brokers’ Trader Workstation. Say that in the first 60 seconds if the interviewer is from IB.

Your domain = **investment-bank payment / treasury integration platform** (vendor SaaS migration, batch, REST, SQL recon). Not brokerage order flow or market making. Frame as *transactional backend at scale in a regulated environment* — that maps well to IB’s reliability expectations.

**60-second opener (memorize)** “I’m a backend engineer with four years at Barclays on a payment integration platform. We migrated a legacy Unix batch stack to a vendor SaaS on AWS — I built Java Spring Boot services behind IBM Workload Scheduler, handling REST integrations, SQL reconciliation, Kafka events to internal audit systems, and operational tooling like batch replay APIs. I’m strongest in Java, Spring, SQL on Linux production systems, and I also ship OSS fixes to VS Code and Kubernetes and run a multi-agent PR review project on the side. I’m looking for a backend role where correctness, observability, and production discipline matter — which is why IB interests me.”

## Ownership language — be precise

| Say | When | Don’t say |
|----|----|----|
| “Contributed to the platform migration” | Cross-team program, 80+ workflows | “I migrated the entire bank” |
| “Owned the integration service / recon design / replay APIs” | Your direct deliverables | “I designed everything alone” |
| “Drove HLD/LLD for tokenization path” | You wrote design docs, led reviews | “I built DPaaS” (bank platform) |
| “Partnered with ops, vendor, security” | Real bank delivery | “No dependencies on anyone” |

## All numbers — what they measure

| Number | Meaning | If pressed |
|----|----|----|
| 4 years | Aug 2022 – present at Barclays | SDE II (BA-4) since promotion path |
| 80+ | Distinct TWS-orchestrated business processes in scope | Job streams / workflows, not 80 microservices |
| 5,000+ daily | Business transactions processed per day | Payment/account events through integration layer |
| 100K+ accounts | Account entities in migration + tokenization scope | Distinct account IDs in recon tables |
| 60% | Batch throughput improvement after async workers | Records/hour or wall-clock for same input volume |
| 25% | Release cycle time reduction | Commit-to-prod for your service |
| 40% MTTR | Mean time to resolve for pilot incident class | Before/after RAG tool; cite sample size |
| 20% (Samsung) | Model accuracy vs baseline on holdout set | State metric (accuracy/F1) you used |
