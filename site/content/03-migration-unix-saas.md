# Unix to SaaS migration

**Resume:** Legacy Unix → vendor SaaS on AWS. Java/Spring Boot for **80+** TWS processes. **5,000+/day** txns. **100K+** accounts.

**CAUTION:** TWS = IBM Workload Scheduler. Not IB Trader Workstation.

---

## STAR — the story

### S — Situation (the problem)

Payment ops ran on a **legacy Unix** stack: shell scripts, file drops, and scheduled jobs. Change was slow. Tests were weak. Edge cases lived in people’s heads. The bank moved the product to a **vendor SaaS on AWS**, but the bank still had to call the vendor, track each step, and keep overnight batches correct.

### T — Task (your job)

Build the **integration layer**: Java / Spring Boot services that **IBM TWS** starts. Call vendor **REST** APIs. Store step state in **MySQL**. Cover workflows in a program of **80+** processes, **5,000+** daily transactions, **100K+** accounts. Do not claim you migrated the whole bank alone.

### A — Action (what you did)

1. TWS job calls your API (example: `POST /integration/payment-sync`).
2. Service reads pending rows or an inbound file.
3. Validate → map ids → call vendor REST.
4. Persist **SUCCESS** or **FAILED** plus a vendor correlation id.
5. Return success to TWS only when acceptance rules pass. Downstream jobs wait on this step.
6. During migration, run **old and new paths in parallel**. Compare reports. Flip only when the compare is clean.
7. Rollback = point TWS back to the **old job definitions**.

```
IBM TWS → Spring Boot (Linux) → Vendor REST → AWS SaaS
                ↓
         MySQL step state
Legacy Unix stays until compare is clean
```

**Failure rules you must say**

| Case | What you do |
|------|-------------|
| 5xx / network blip | Retry only if the call is idempotent |
| 4xx business error | Do not blind-retry. Mark FAILED. Alert |
| Timeout | FAILED until you confirm. Never invent SUCCESS |
| Vendor down | Fail fast. Do not hang the TWS stream |
| Same file replay | Must not double-post |

### R — Result

Integration services in production for that scope. Batches stay correct because state is in SQL and failures block downstream jobs instead of lying. Cutover is reversible.

---

## Say the STAR in 60 seconds

> Payment ops sat on old Unix scripts. The bank moved the product to a vendor SaaS on AWS, but someone still had to call the vendor and track each step. I built Spring Boot services that IBM TWS starts. They call vendor REST and store SUCCESS or FAILED in MySQL. Scope is 80+ workflows, 5,000+ daily transactions, 100K+ accounts. We ran old and new paths together and compared results before cutover. Rollback is the old TWS jobs.

---

## If they go deeper

| Word | Meaning |
|------|---------|
| Job stream | A chain of jobs. Job B waits for job A |
| Parallel run | Old path and new path at the same time |
| Idempotency | Replay does not create a second payment |
| Circuit breaker | Stop calling a dead vendor |

**Safe ownership:** “I contributed to the program. I owned the integration services in my area.”  
**80+** = workflows, not 80 microservices. **5,000/day** is batch-window load, not high-frequency trading.

**Debug a stuck stream:** TWS log → app log / correlation id → SQL step table → vendor status → replay or fix → unblock the next job.

<details>
<summary>Why Spring Boot instead of more shell?</summary>
Typed APIs, dependency injection, JPA state, health checks, tests, one fat JAR per environment.
</details>

<details>
<summary>How do you secure vendor calls?</summary>
OAuth2 or mTLS. Secrets in a vault. Private network. Audit log. Veracode in CI.
</details>

## Blind check

- [ ] Tell S-T-A-R without notes
- [ ] Draw TWS → Spring → vendor → DB
- [ ] Name five failure rules

Next: [PII and tokenization](#/04-pii-tokenization)
