# Unix to SaaS migration

**Resume:** Legacy Unix → vendor SaaS on AWS. Java/Spring Boot integration for **80+** TWS processes via vendor REST. **5,000+/day** txns, **100K+** accounts.

**CAUTION:** TWS = IBM Workload Scheduler, not IB Trader Workstation.

---

## 1. Say this first (30s)

> We replaced a legacy Unix payment-ops stack with vendor SaaS on AWS. I build Spring Boot integration services that IBM TWS invokes. Services call vendor REST, persist step state in MySQL, and cover 80+ workflows, 5,000+ daily transactions, 100K+ accounts.

---

## 2. Words

| Word | Meaning | Interview use |
|------|---------|---------------|
| Legacy Unix | Shell, file drops, cron/TWS, weak tests | What you replaced |
| SaaS | Vendor hosts app; you integrate by API | AWS-hosted third party |
| IBM TWS | Batch scheduler: jobs, streams, calendars | Triggers your HTTP/shell jobs |
| Job stream | DAG: B waits for A success | Why FAILED blocks downstream |
| Integration service | Your Spring Boot between TWS and vendor | Your ownership |
| Parallel run | Old + new path; compare before cutover | Zero-customer-impact migration |
| Idempotency | Replay must not double-post | Vendor PUT/retry design |
| Circuit breaker | Stop calling a sick dependency | Protect TWS window |

---

## 3. How it works

```
IBM TWS (schedule/deps)
    → Spring Boot integration (Linux)
         → Vendor REST → AWS SaaS
         → MySQL: step state, correlation id, audit
Legacy Unix (phased out / parallel compare)
```

**Payment status sync (memorize):**
1. TWS fires → `POST /integration/payment-sync`
2. Read pending rows or inbound file
3. Validate → map ids → vendor `PUT/POST`
4. Persist SUCCESS/FAILED + vendor ref + timestamps
5. Return to TWS only if acceptance rules pass
6. Downstream recon/report jobs depend on this step

**TWS terms:** job definition, job stream, dependency, calendar/run cycle, restart from failed job.

---

## 4. Ownership / scale / parallel run

| Claim | Safe wording |
|-------|----------------|
| Scope | Contributed to program; owned integration services in your area |
| 80+ | Workflows/job defs — not 80 microservices |
| 5k/day | Batch-window load; design for EOD peaks + vendor rate limits |
| Parallel run | Dual path + compare reports; rollback = old TWS defs |
| Stakeholders | PO, ops L2/L3, vendor TAM, security, audit/reporting |

**Hard parts:** undocumented shell edge cases, encoding, no legacy tests, coexistence, typed Java rewrite of script rules.

---

## 5. Failure / security matrix

| Case | Action |
|------|--------|
| 5xx / network | Retry only if idempotent; exponential backoff |
| 4xx business | No blind retry; FAILED + alert |
| Timeout | FAILED until confirmed (never invent SUCCESS) |
| Vendor down | Circuit break / fail fast — do not hang stream |
| Same file replay | Dedupe / idempotency key |
| Auth to vendor | OAuth2 client credentials or mTLS; secrets in vault |
| Internal APIs | Private network; RBAC on ops endpoints; Veracode in CI |

---

## 6. Say this (2 min)

> Bank moved payment ops from Unix batch to vendor SaaS on AWS. I own integration: TWS starts streams → Spring Boot on Linux → vendor REST → MySQL step state. Parallel run with compare reports before cutover; rollback restores old TWS jobs. Not HFT — EOD peaks, rate limits, correctness. Timeouts and clear FAILED semantics protect downstream dependencies.

---

## 7. Top questions

<details><summary>Strangler / cutover?</summary>
Replace slices behind TWS routing; parallel compare; flip authority when reports green; keep old defs for rollback.
</details>
<details><summary>Why Spring Boot vs scripts?</summary>
Typed APIs, DI, JPA state, profiles, actuator health, testability, fat JAR deploys.
</details>
<details><summary>How do you debug a stuck stream?</summary>
TWS log → app log/correlation id → SQL step table → vendor status → replay or fix → unblock deps.
</details>
<details><summary>Data loss prevention?</summary>
Durable step state, recon counts, no SUCCESS on timeout, compare reports before decommission.
</details>

---

## 8. Blind check

- [ ] Draw TWS → Spring → vendor → DB
- [ ] IBM TWS one-liner
- [ ] Five failure rules + one security control
- [ ] Speak 2 min cold

Next: [PII and tokenization](#/04-pii-tokenization)
