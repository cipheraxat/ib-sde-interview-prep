# Cheat sheet (night before)

## 60-second opener

Backend engineer, 4 years Barclays (SDE II). Payment **integration** platform: legacy Unix → vendor SaaS on AWS. Java/Spring Boot behind **IBM TWS** (Workload Scheduler — *not* IB Trader Workstation). REST, SQL recon, Kafka, replay APIs. OSS + CodeReviewer. Want backend correctness culture → IB.

## Numbers

| # | Meaning |
|---|---------|
| 80+ | TWS workflows |
| 5,000+/day | Integration transactions |
| 100K+ | Accounts tokenized/migrated |
| 60% | Async throughput gain |
| 25% | Faster releases |
| 40% | MTTR (RAG, HITL) |
| 20% | Samsung accuracy |
| 9.5 | CGPA |

## Pick 2 deep bullets

1. Tokenization HLD/LLD + recon  
2. Async workers + false SUCCESS fix  

Know others at 30s pitch level.

## Draw from memory

- DPaaS → DTU → vendor tokens + recon loop  
- Async workers + JPA state machine  
- Kafka topic / consumer groups / outbox / idempotency  
- Replay API safety rails  
- RAG retrieve → suggest → human approves  

## Acronyms

- **IBM TWS** = Tivoli Workload Scheduler  
- **DPaaS** = tokenization platform  
- **DTU** = encrypted transfer utility  
- **HITL** = human-in-the-loop  
- **MTTR** = mean time to resolve  

## If stuck in interview

1. Restate problem  
2. Draw boxes  
3. State assumptions  
4. Prefer correct > clever  
5. Call out monitoring + rollback  

## Red lines

No fake trading experience. No TWS confusion. No unsupervised LLM prod actions.
