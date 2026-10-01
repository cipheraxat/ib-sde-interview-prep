# One-Page Cheat Sheet (memorize night before)

## 60-second opener

Backend engineer, 4 years Barclays (SDE II). Payment **integration** platform: legacy Unix → vendor SaaS on AWS. Java/Spring Boot behind **IBM TWS** (Workload Scheduler — *not* IB Trader Workstation). REST, SQL recon, Kafka, replay APIs. OSS (vscode, playwright, k8s, pkl) + CodeReviewer Agent. Want backend role where correctness/ops discipline matter → IB.

## Numbers

| # | Meaning |
|---|---|
| 80+ | TWS-orchestrated business processes |
| 5,000+/day | Transactions through integration layer |
| 100K+ | Accounts in migration/tokenization scope |
| 60% | Batch throughput after async workers |
| 25% | Faster release cycle (Jenkins/fat JAR) |
| 40% | MTTR cut (RAG ops agent, HITL) |
| 20% | Samsung accuracy lift |
| 9.5/10 | CGPA |

## Bullet map (pick 2 deep + 1 light)

1. Unix → SaaS migration (Spring + vendor REST)  
2. Tokenization HLD/LLD + recon  
3. Async workers + failure semantics  
4. Spring/Maven refactor + tests  
5. Kafka to audit/reporting  
6. Batch replay API  
7. Jenkins + Veracode  
8. RAG ops agent  

## Acronyms

- **IBM TWS** = Tivoli Workload Scheduler (batch)  
- **DPaaS** = bank tokenization platform  
- **DTU** = encrypted data transfer to cloud  
- **HITL** = human-in-the-loop (no unattended prod LLM actions)

## If stuck

1. Restate problem  
2. Draw boxes  
3. Say assumptions  
4. Prefer correct > clever  
5. Call out monitoring + rollback  

## Never

- Claim brokerage/trading-engine experience  
- Confuse TWS meanings  
- Oversell solo ownership of 80+ workflows
