# Unix to SaaS migration

**Resume line:** You helped migrate a legacy Unix platform to a third-party SaaS on AWS. You built Java Spring Boot integration services for more than 80 TWS business processes. The path uses vendor REST APIs. The system handles more than 5,000 daily transactions across more than 100K accounts.

---

## 1. Say this first (30 seconds)

> We replaced a legacy Unix payment-ops stack with a vendor SaaS on AWS. I built Spring Boot integration services. IBM TWS starts the batch jobs. The jobs call our REST APIs. The APIs call the vendor. The scope covers more than 80 workflows, more than 5,000 daily transactions, and more than 100K accounts.

**CAUTION:** TWS on your resume is IBM Workload Scheduler. It is not IB Trader Workstation. Say this early.

---

## 2. Words you must know

| Word | Meaning |
|------|---------|
| Legacy Unix | Old scripts, file drops, and scheduled jobs on Unix or Linux |
| SaaS | Vendor hosts the app. You integrate through APIs |
| IBM TWS | Batch scheduler. Jobs and job streams with dependencies |
| Job stream | A DAG of jobs. Job B waits for job A |
| Integration service | Your Spring Boot app between TWS and the vendor |
| Parallel run | Old path and new path run together for a compare period |

---

## 3. How it works

```
IBM TWS → Spring Boot integration (Linux) → Vendor REST → AWS SaaS
                │
                ▼
         MySQL control DB (step state, audit)
```

Example flow: payment status sync

1. TWS starts at the schedule time.
2. TWS calls `POST /integration/payment-sync`.
3. The service reads pending records or an inbound file.
4. The service validates data, maps ids, and calls the vendor API.
5. The service stores SUCCESS or FAILED with a vendor correlation id.
6. The service returns success to TWS only if acceptance rules pass.
7. Downstream TWS jobs wait on this step.

---

## 4. What you owned

- Spring Boot integration services for workflows in scope.
- REST calls to the vendor with timeouts and clear failure rules.
- Durable step state in SQL.
- Work with ops, vendor, and security.

**Do not say:** You migrated the full bank alone.  
**Do say:** You contributed to the program. You owned the integration pieces in your area.

---

## 5. Failure rules (must say)

| Case | Action |
|------|--------|
| Network blip or 5xx | Retry only if the call is idempotent |
| 4xx business error | Do not blind-retry. Mark FAILED. Alert |
| Vendor down | Fail fast. Do not hang the full TWS stream |
| Timeout | Treat as failure until you confirm success |
| Replay of the same file | Must not double-post |

---

## 6. Say this (2 minutes)

> The bank moved payment operations from a legacy Unix batch stack to a vendor SaaS on AWS. My work sits in the integration layer. IBM TWS starts job streams. Those jobs call Spring Boot services that I build and run on Linux. The services call vendor REST APIs and store step state in MySQL.  
> During migration, old and new paths can run in parallel. Compare reports find gaps before cutover. Rollback points TWS back to the old job definitions.  
> Scale here is batch-window scale, not high-frequency trading. Correctness, timeouts, and recovery matter more than microsecond latency.

---

## 7. Top questions

<details>
<summary>What was hard about Unix migration?</summary>

Missing tests on old scripts. Undocumented edge cases. Character encoding. Parallel run. Translation of shell rules into typed Java.

</details>

<details>
<summary>Is 5,000 transactions per day high scale?</summary>

Not HFT. Load concentrates in EOD and month-end windows. Design for peaks, vendor rate limits, and correctness.

</details>

<details>
<summary>How do you secure vendor REST calls?</summary>

OAuth2 or mTLS. Secrets in a vault. Private network paths. Audit logs. Veracode in CI.

</details>

---

## 8. Blind check

- [ ] Draw TWS → Spring Boot → vendor.
- [ ] Clarify IBM TWS in one sentence.
- [ ] List five failure rules.
- [ ] Speak the 2-minute answer.

Next: [PII and tokenization](#/04-pii-tokenization)
