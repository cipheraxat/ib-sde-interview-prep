# Unix → SaaS migration (Barclays bullet 1)

## Resume bullet

> Contributed to migrating a legacy Unix platform to a third-party SaaS on AWS, developing Java / Spring Boot integration services for **80+** TWS-orchestrated business processes via vendor REST APIs, automating **5,000+** daily transactions across **100K+** accounts.

---

## The whole story (read this until you can tell it without notes)

At Barclays I work on a **payment / treasury integration platform**. For years, a big part of that world ran on a **legacy Unix stack**: shell scripts, file drops, scheduled overnight jobs, and tribal knowledge. It worked, but every change was slow and risky — hard to test, hard to audit, hard to scale cleanly.

The bank’s direction was to move that capability to a **third-party SaaS product hosted on AWS**. That does **not** mean “delete everything and hope.” Banks almost never do a big-bang cutover for money-moving systems. Instead, we built an **integration layer** in the middle:

1. **IBM TWS** (Tivoli Workload Scheduler) still orchestrates *when* business processes run — nightly, month-end, dependent job streams.  
2. My team’s **Java / Spring Boot services** implement *what* happens — call vendor REST APIs, validate data, persist step state in SQL, handle failures.  
3. The **vendor SaaS on AWS** becomes the system of record for the migrated workflows.  
4. During transition, old Unix paths and new SaaS paths often run in **parallel** so we can compare results before cutting over.

My contribution was building and owning pieces of that **Spring Boot integration layer** for workflows in a program covering **80+ TWS-orchestrated business processes**, processing **5,000+ daily transactions** across **100K+ accounts**.

> **Interview tip:** Clarify early: **TWS here = IBM Workload Scheduler**, not Interactive Brokers’ Trader Workstation.

> **Ownership language:** Say you **contributed** to the migration program and **owned** integration services / APIs / failure handling for your workflows — not “I migrated the entire bank alone.”

---

## 30-second pitch (memorize)

> We migrated a legacy Unix payment-ops platform to a vendor SaaS on AWS. I built Java Spring Boot integration services that IBM TWS batch jobs call over REST — covering 80+ workflows, about 5,000 daily transactions, and 100K+ accounts — with durable step state and proper failure handling so ops and downstream jobs stay reliable.

---

## 2-minute interview script (speak this)

> “At Barclays I work on a payment integration platform. A major program was moving a legacy Unix batch stack to a third-party SaaS on AWS.  
>  
> The legacy world was mostly scheduled jobs, shell scripts, and file-based handoffs. That made change slow. The target was a vendor SaaS, but we still needed bank-controlled orchestration and correctness.  
>  
> So the architecture became: IBM TWS — and when I say TWS I mean IBM Workload Scheduler, not IB’s Trader Workstation — triggers job streams. Those jobs call our Spring Boot services. Our services talk to the vendor over REST, persist step state in MySQL, and only mark success when the vendor interaction really succeeded.  
>  
> I contributed to that integration layer across a scope of 80+ business processes, roughly 5,000 transactions a day and 100K+ accounts. Day to day that meant designing APIs the scheduler can call, mapping internal IDs to vendor contracts, handling retries and timeouts, and making sure failed steps don’t silently look successful.  
>  
> During cutover we used parallel run and reconciliation rather than a risky big bang, so we could compare old vs new before making the SaaS path authoritative.”

---

## Teach the concepts (so your story has vocabulary)

### Legacy Unix platform
Typical ingredients: shell scripts, NFS file drops, cron/TWS schedules, flat-file feeds, direct DB updates, little automated testing.

> **ELI5:** Paper ledger + messengers. It works until you need faster, safer change.

### SaaS on AWS
Vendor hosts the app in the cloud. You integrate via APIs. The bank still owns security policy, integration correctness, recon, and ops recovery.

### IBM TWS (know cold)

| Term | Meaning | How you use it in answers |
|------|---------|---------------------------|
| Job | One unit of work | Calls your HTTP endpoint or shell wrapper |
| Job stream | DAG of jobs | EOD: ingest → validate → sync → recon |
| Dependency | B waits for A | Failure blocks downstream — why replay matters |
| Calendar | When jobs may run | Nightly / month-end peaks |
| Restart | Re-run from failure | Links to your replay API bullet |

**80+ processes** = many workflows/job definitions in program scope — **not** 80 microservices.

### Why Spring Boot for the integration layer?
Embedded server, DI, profiles, JPA for state, actuator health checks, testable services, consistent packaging — better than growing more shell + ad-hoc Java.

---

## Architecture (draw this on a whiteboard)

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  IBM TWS    │────▶│ Spring Boot          │────▶│ Vendor SaaS     │
│  scheduler  │     │ Integration Service  │     │ REST APIs       │
└─────────────┘     │  (your Java/Linux)   │     └────────┬────────┘
                    └──────────┬───────────┘              │
                               │                          ▼
                    ┌──────────▼───────────┐     ┌─────────────────┐
                    │ MySQL control DB     │     │ AWS-hosted app  │
                    │ step state / audit   │     └─────────────────┘
                    └──────────────────────┘
         (legacy Unix path phased out after parallel run)
```

### One concrete workflow: payment status sync

1. TWS triggers at ~02:00 → `POST /integration/payment-sync`  
2. Service reads pending records or inbound file  
3. For each record: validate → map IDs → call vendor REST  
4. Persist SUCCESS/FAILED + vendor correlation id + timestamp  
5. Return success to TWS only if acceptance criteria met; else fail the job  
6. Downstream TWS jobs (recon/reporting) depend on this step  

---

## Numbers — if the interviewer presses

| Number | Meaning |
|--------|---------|
| 80+ | Business processes / TWS workflows in migration scope |
| 5,000+/day | Transactions through the integration layer (batch windows spike) |
| 100K+ | Accounts in scope |
| Parallel run | Old + new paths compared before cutover |
| Rollback | Point TWS back to previous job definitions / routing |

---

## Failure handling (say this — IB loves it)

| Situation | What you do |
|-----------|-------------|
| Network blip / 5xx | Retry with backoff **if** call is idempotent |
| 4xx business error | Don’t blind-retry; mark FAILED; alert |
| Vendor down | Circuit breaker → fail fast (don’t hang whole stream) |
| Timeout | **FAILED until confirmed** — never invent SUCCESS |
| Same file replayed | Idempotency keys — no double-post |

> **ELI5:** Idempotency = pressing the elevator button twice still brings one elevator.

---

## Deep interview Q&A (full answers)

<details>
<summary>Walk me through the migration end-to-end.</summary>

Start with business goal (move off fragile Unix). Explain strangler/parallel approach. Draw TWS → Spring Boot → vendor SaaS. Describe one workflow. Mention recon/compare before cutover and rollback. End with your ownership: integration services, contracts, failure semantics.

</details>

<details>
<summary>What was hardest about migrating Unix systems?</summary>

Undocumented edge cases in scripts, weak tests, encoding/file quirks, co-existence period, translating shell business rules into typed Java, and keeping ops comfortable with familiar file interfaces during transition.

</details>

<details>
<summary>Is 5,000 txn/day “high scale”?</summary>

Not HFT. Load concentrates in EOD/month-end windows. Design for spikes, vendor rate limits, and correctness — not microsecond latency. Throughput work (bullet 3) mattered more than average TPS.

</details>

<details>
<summary>How did you collaborate across teams?</summary>

Product owner for scope, ops L2/L3 for runbooks/recovery, vendor TAM for API contracts, security/architecture for data rules (tokenization), downstream audit/reporting consumers for event contracts.

</details>

<details>
<summary>How do you secure vendor REST calls?</summary>

OAuth2 client credentials or mTLS; secrets in vault not Git; private network paths where required; RBAC on ops APIs; audit logs; Veracode in CI.

</details>

<details>
<summary>What would you improve if you rebuilt it?</summary>

Stronger contract tests against vendor sandbox, clearer SLO dashboards per workflow, more automated parallel-run diff reports, and outbox-from-day-one for downstream events (ties to Kafka bullet).

</details>

---

## Practice checklist

- [ ] Say the 30s pitch out loud twice  
- [ ] Draw the architecture from memory  
- [ ] Clarify IBM TWS vs Trader Workstation in the first minute  
- [ ] Narrate payment status sync in 6 steps  
- [ ] Explain timeout ⇒ FAILED without looking  

**Next deep story:** [PII & tokenization](#/04-pii-tokenization)
