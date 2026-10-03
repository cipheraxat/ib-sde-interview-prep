# Unix → SaaS migration (Barclays bullet 1)

## Resume bullet

> Contributed to migrating a legacy Unix platform to a third-party SaaS on AWS, developing Java / Spring Boot integration services for **80+** TWS-orchestrated business processes via vendor REST APIs, automating **5,000+** daily transactions across **100K+** accounts.

## Teach first: what was “legacy Unix”?

Many bank ops platforms grew as:

- Shell scripts on Unix/Linux servers
- File drops on shared disks (NFS)
- Cron or scheduler triggering overnight jobs
- Direct DB updates / flat files between systems
- Little automated testing; knowledge in people’s heads

It works for years — until change becomes slow, risky, and hard to audit.

> **ELI5:** Imagine accounting done with paper ledgers and messengers. Migration moves you to a modern vendor system, but you still need a reliable “messenger service” (your Spring Boot integration layer) so old processes and new systems stay in sync during cutover.

## What is SaaS?

**SaaS = Software as a Service** — vendor hosts the application (often on cloud). You integrate via APIs instead of owning all the software.

Here: vendor product runs on **AWS**. Your bank still owns:

- Security rules (especially PII)
- Integration correctness
- Ops recovery
- Reconciliation

## What is AWS (enough for interview)?

Amazon Web Services = cloud infrastructure. Vendor hosts there. You may not manage their VPC, but you understand:

- Data leaves on-prem through approved channels
- Network/security boundaries matter
- Cloud ≠ “no compliance work”

## IBM TWS (Workload Scheduler) — learn cold

**IBM TWS** schedules and orchestrates batch jobs.

| Term | Meaning |
|------|---------|
| Job | One unit of work (script, command, HTTP call) |
| Job stream | DAG of jobs with dependencies |
| Dependency | Job B waits for Job A success |
| Calendar | When it may run (nightly, month-end) |
| Restart | Re-run from failed point |

```
TWS job stream (example EOD):
  ingest file → validate → vendor sync → recon → report
       ↑ failures block everything downstream
```

> **On your resume:** “80+ processes” ≈ many job definitions / workflows in scope — not 80 separate Spring Boot microservices.

## Architecture (draw this)

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  IBM TWS    │────▶│ Spring Boot          │────▶│ Vendor SaaS     │
│  scheduler  │     │ Integration Service  │     │ REST APIs       │
└─────────────┘     │  (your Java on Linux)│     └────────┬────────┘
                    └──────────┬───────────┘              │
                               │                          ▼
                    ┌──────────▼───────────┐     ┌─────────────────┐
                    │ MySQL control DB     │     │ AWS-hosted app  │
                    │ step state / audit   │     └─────────────────┘
                    └──────────────────────┘
```

## 30-second pitch

> We replaced a legacy Unix payment-ops stack with vendor SaaS on AWS. I built Spring Boot integration services that IBM TWS batch jobs call over REST, covering 80+ workflows processing 5,000+ daily transactions across 100K+ accounts.

## End-to-end workflow example (memorize)

**Payment status sync**

1. TWS triggers at 02:00 → calls `POST /integration/payment-sync`  
2. Service reads pending records / inbound file  
3. For each record: validate → map IDs → call vendor REST  
4. Persist SUCCESS/FAILED + vendor correlation id  
5. Return success to TWS only if acceptance criteria met; else fail the job  
6. Downstream TWS jobs (recon/reporting) depend on this step  

## Parallel run / cutover

During migration, old and new paths often run together:

- Compare outputs (recon reports)
- Feature flags / routing decide authoritative path
- Rollback = point TWS back to old job definitions

> **Interview tip:** “Zero customer impact” means no big-bang cutover without a validation window.

## REST failure handling (must-know)

| Situation | Action |
|-----------|--------|
| Network blip / 5xx | Retry with exponential backoff **if idempotent** |
| 4xx business error | Don’t blindly retry; mark FAILED; alert |
| Vendor down | Circuit breaker → fail fast (don’t hang TWS stream) |
| Timeout | Treat as failure until confirmed — never invent SUCCESS |
| Replay same file | Must not double-post (idempotency keys) |

> **ELI5:** Idempotency is “pressing the elevator button twice still only comes once.”

## Why Spring Boot here?

- Embedded server + health checks
- Config profiles per environment
- JPA for durable step state
- Testability (JUnit/Mockito)
- Faster than maintaining sprawling shell + ad-hoc Java

## Interview Q&A

<details>
<summary>What challenges migrating Unix systems?</summary>

Encoding issues, undocumented edge cases, missing tests on legacy scripts, co-existence period, translating shell business rules into typed Java, ops needing familiar file interfaces during transition.

</details>

<details>
<summary>Is 5,000 transactions/day “high scale”?</summary>

Not HFT. Load concentrates in batch windows (EOD/month-end). Design for spikes + vendor rate limits + correctness, not microscond latency.

</details>

<details>
<summary>Security on REST integrations?</summary>

OAuth2 client credentials or mTLS to vendor; secrets in vault; private networks; RBAC on ops APIs; audit logs; Veracode in CI.

</details>

<details>
<summary>Who were stakeholders?</summary>

Product owner, ops L2/L3, vendor TAM, security/architecture (tokenization), downstream audit/reporting consumers.

</details>

Next: [PII & tokenization](#/04-pii-tokenization)
