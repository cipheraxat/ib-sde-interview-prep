# Behavioral & IB-Specific

## Why Interactive Brokers?

**Sample answer (45–60s)**  
“IB builds transactional backend systems where correctness and uptime matter — that matches what I’ve done in banking integration at Barclays. I work daily in Java on Linux with SQL, batch orchestration, REST integrations, Kafka, and production recovery tooling. I’m excited to apply that discipline to brokerage technology and learn the trading / back-office domain while contributing immediately on backend services.”

**Why leave Barclays?**  
Growth and domain expansion — want deeper ownership of customer-facing trading/back-office systems and a sharper product-engineering loop, not dissatisfaction. Stay positive about Barclays (regulated scale taught you production discipline).

**Why you / why now?**  
JD alignment: Java, Oracle/MySQL, Unix/Linux, Kafka, REST, Git/Jenkins, financial-services background, production troubleshooting. 4 years SDE II. OSS shows initiative beyond tickets.

---

## STAR stories — prepare these 5 cold

### 1) Tokenization HLD under regulatory constraint
- **S:** Vendor SaaS on AWS cannot hold plaintext PII.  
- **T:** Design HLD/LLD + recon for 100K+ accounts, zero downtime.  
- **A:** Trust zones, DPaaS tokenize, DTU encrypt transit, SQL recon + retry queue, phased cutover.  
- **R:** Confirmed tokenization at scale without outage; security/architecture sign-off.

**Use for:** system design, pressure, leadership without authority.

### 2) 60% throughput + false-success bug
- **S:** Sync vendor REST inside TWS jobs bottlenecked EOD.  
- **T:** Raise throughput without lying about success.  
- **A:** Async workers (one file/exec), persist step state, timeout/non-2xx ⇒ FAILED.  
- **R:** ~60% throughput; fewer silent bad SUCCESS rows.

**Use for:** technical depth, correctness mindset.

### 3) Month-end replay / recovery
- **S:** Failed TWS steps blocked downstream; ops editing DB is unsafe.  
- **T:** Safe re-trigger of failed payment-load steps.  
- **A:** Spring Boot replay API with auth, audit log, idempotent re-queue.  
- **R:** Ops recovers without DBA; shorter unblock time.

**Use for:** ownership, ops partnership, calm under fire.

### 4) RAG ops agent with human-in-the-loop
- **S:** Repetitive L1/L2 triage on runbooks.  
- **T:** Assist ops without unsupervised prod changes.  
- **A:** Python/LangChain + PgVector RAG; ServiceNow/Jira tools; HITL gate.  
- **R:** ~40% MTTR on pilot class; engineers freed from repetitive triage.

**Use for:** innovation + safety (critical for IB culture).

### 5) OSS PR merged after review iterations
- **S:** Real bugs in vscode / playwright / k8s / pkl.  
- **T:** Fix, tests, respond to maintainers.  
- **A:** Minimal diff, follow project conventions, iterate on review.  
- **R:** Merged PRs; demonstrates collaboration outside employer.

**Use for:** learning agility, code quality.

---

## Classic behavioral bank

| Question | Angle |
|---|---|
| Walk me through resume | Use 02-framing opener + 03 summary 2-min |
| Biggest achievement | Tokenization **or** throughput+correctness |
| Failure / mistake | False SUCCESS on timeout — what you changed |
| Conflict | Design review disagreement → data + trade-offs → align |
| Ambiguity | Migration scope / undocumented edge cases |
| Mentoring | Pairing on incidents, code review as teaching |
| Production incident | Alert → logs → SQL state → vendor → fix → replay → postmortem |
| Disagreement with manager | Propose options with risk; escalate with evidence |
| Tell me about a time you said no | Unsafe unattended LLM action / incomplete change |

---

## Ownership language (precision)

| Say | Don’t say |
|---|---|
| Contributed to platform migration (80+ workflows) | I migrated the entire bank |
| Owned integration service / recon / replay APIs | I designed everything alone |
| Drove HLD/LLD for tokenization path | I built DPaaS |
| Partnered with ops, vendor, security | No dependencies |

---

## Questions to ask IB

1. What does this team own in the trading / back-office stack?  
2. Java deployment model — bare metal, VMs, containers/K8s?  
3. Oracle vs MySQL — which is source of truth for your services?  
4. On-call rotation and incident culture?  
5. How are changes released (Jenkins, CAB-like gates)?  
6. What does success look like in the first 6 months?  
7. How do new joiners ramp on domain (order lifecycle, clearing)?  

---

## Red flags — never say

- “I worked on trading systems / matching engines at Barclays”  
- “TWS means Trader Workstation” (yours is **IBM Tivoli Workload Scheduler**)  
- “I built the whole migration alone”  
- “Kafka is exactly-once everywhere”  
- “The LLM auto-fixes production” (you use **human-in-the-loop**)  
- Bashing Barclays or managers
