# Behavioral & Why IB

## Why Interactive Brokers? (45–60s)

> IB builds transactional backend systems where correctness and uptime matter — that matches what I’ve done in banking integration at Barclays. I work daily in Java on Linux with SQL, batch orchestration, REST integrations, Kafka, and production recovery tooling. I want to apply that discipline to brokerage technology and learn the trading/back-office domain while contributing immediately on backend services.

## Why leave Barclays?

Growth and domain expansion — deeper ownership of customer/back-office systems and a sharper product loop. Stay positive about what Barclays taught you (regulated scale, production discipline).

---

## STAR stories (prepare cold)

### 1) Tokenization under regulatory constraint

- **S:** Vendor SaaS can’t store plaintext PII  
- **T:** HLD/LLD + recon for 100K+ accounts, zero downtime  
- **A:** Trust zones, DPaaS, DTU, SQL recon, retries, phased cutover  
- **R:** Confirmed tokenization at scale; security sign-off  

### 2) Throughput + false-success fix

- **S:** Sync vendor REST bottlenecked EOD; timeouts risked bad SUCCESS  
- **T:** Raise throughput without lying about success  
- **A:** Async workers, JPA state, timeout ⇒ FAILED  
- **R:** ~60% throughput; fewer silent bad successes  

### 3) Month-end replay recovery

- **S:** Failed steps blocked downstream; DB edits unsafe  
- **T:** Safe re-trigger  
- **A:** Replay API + auth + audit + idempotent requeue  
- **R:** Faster unblock; safer ops  

### 4) RAG with HITL

- **S:** Repetitive triage  
- **T:** Assist without unsupervised prod changes  
- **A:** LangChain + PgVector; guarded tools; HITL  
- **R:** ~40% MTTR on pilot class  

### 5) OSS PR through review

- **S:** Real upstream bug  
- **T:** Fix + tests + review cycles  
- **A:** Minimal diff; follow norms; iterate  
- **R:** Merged PR  

---

## Classic questions

| Question | Angle |
|----------|-------|
| Walk me through resume | Framing opener + 2-min story |
| Biggest achievement | Tokenization **or** throughput correctness |
| Failure | False SUCCESS on timeout — what changed |
| Conflict | Design review → trade-offs → align with data |
| Ambiguity | Migration undocumented edge cases |
| Production incident | Alert → logs → SQL state → vendor → fix → replay → postmortem |

---

## Questions to ask them

1. What does this team own in trading/back-office?  
2. Deploy model (VMs, containers, K8s)?  
3. Oracle vs MySQL as source of truth?  
4. On-call culture?  
5. What does success look like in 6 months?  

---

## Never say

- “I built trading/matching systems at Barclays”  
- “TWS means Trader Workstation” (yours is IBM scheduler)  
- “I did the whole 80-workflow migration alone”  
- “Kafka is exactly-once everywhere”  
- “The LLM auto-fixes production”  

Next: [Cheat sheet](#/15-cheat-sheet)
