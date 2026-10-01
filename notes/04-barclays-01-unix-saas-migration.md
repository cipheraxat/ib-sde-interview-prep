# Barclays Bullet 1 — Legacy Unix → SaaS on AWS

Contributed to migrating a legacy Unix platform to a third-party SaaS on AWS, developing Java / Spring Boot integration services for 80+ TWS-orchestrated business processes via vendor REST APIs, automating 5,000+ daily transactions across 100K+ accounts.

**30 seconds** We replaced a legacy Unix payment-ops stack with vendor SaaS on AWS. I built Spring Boot integration services that IBM TWS batch jobs call over REST, covering 80+ workflows processing 5,000+ daily transactions across 100K+ accounts.

## Architecture — end-to-end

┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  IBM TWS    │────▶│ Spring Boot          │────▶│ Vendor SaaS     │────▶│ AWS-hosted   │
│  (scheduler)│     │ Integration Service  │     │ REST APIs       │     │ vendor app   │
└─────────────┘     │  (your code, Linux)  │     └─────────────────┘     └──────────────┘
       │            └──────────┬───────────┘
       │                       │
       │            ┌──────────▼───────────┐     ┌──────────────┐
       └───────────▶│ MySQL / control DB   │     │ Legacy Unix  │
                    │ (step state, audit)  │     │ (phased out) │
                    └──────────────────────┘     └──────────────┘
  

## IBM TWS concepts — know cold

| Term | Definition | Interview use |
|----|----|----|
| Job stream | Directed acyclic graph of jobs with dependencies | “Payment EOD stream: ingest → validate → vendor sync → recon” |
| Job / Job definition | Single unit: script, command, or HTTP call | “TWS calls our Spring endpoint or shell wrapper” |
| Workload | Collection of job streams for a business area | “80+ processes ≈ many job definitions across streams” |
| Calendar / run cycle | When jobs may run (daily, month-end) | “Month-end extends critical path” |
| Dependency | Job B starts only after Job A success | “Failure blocks downstream — why replay matters” |
| Restart / recovery | Re-run from failed job | Links to your replay API bullet |

**Q:** Walk through one concrete workflow end-to-end.

**Example: Payment status sync.**
1. TWS triggers at 02:00 — runs shell or HTTP job calling `POST /integration/payment-sync`.
2. Service reads pending records from control table or inbound file drop.
3. For each record: validate schema → map internal account ID → call vendor `PUT /payments/{id}/status`.
4. Persist result: SUCCESS/FAILED, vendor correlation ID, timestamp.
5. Return HTTP 200 to TWS only if batch acceptance criteria met; else non-zero exit → TWS marks job failed.
6. Downstream TWS jobs (recon, reporting) depend on this step.

**Q:** What was on the legacy Unix side?

Typically: cron or TWS-invoked shell scripts, file drops on NFS, `awk/sed` transforms, direct DB calls or flat-file feeds to old systems. Migration = replace script logic with typed Java services + REST vendor APIs, while keeping file-based boundaries where ops still needed them during parallel run.

**Q:** How did parallel run work during migration?

Both old Unix path and new SaaS path process same or overlapping inputs with compare reports. Discrepancies triaged before cutover. Feature flags or routing tables decide which path is authoritative. Rollback plan: revert TWS to old job definitions. Zero customer impact = no hard cutover without validation window.

**Q:** REST integration — how do you handle vendor API failures?

- **Retry:** idempotent GET/PUT with exponential backoff for 5xx and network blips.
- **No retry:** 4xx business errors — log, mark FAILED, alert.
- **Circuit breaker:** if vendor down, fail fast so TWS doesn’t hang entire stream.
- **Timeout:** explicit connect/read timeouts — never infinite wait.
- **Idempotency:** same file replay must not double-post payments.

**Q:** Why Spring Boot for integration vs plain Java?

Embedded server, dependency injection, standardized config profiles (dev/test/prod), Spring Data JPA for state, actuator for health checks TWS/monitoring can poll, mature ecosystem for REST clients and testing. Refactor bullet covers migration from Core Java monolith.

More questions: scaling, security, team structure

**Q:** How do 5,000 transactions/day scale?

Not HFT — batch windows concentrate load (EOD). Throughput optimization (bullet 3) matters more than single-request latency. Horizontal scale = more worker instances if stateless; DB connection pooling; vendor rate limits cap parallelism.

**Q:** What security controls on REST layer?

mTLS or OAuth2 client credentials to vendor; secrets in vault not code; internal APIs on private network; RBAC for ops replay APIs; audit log every state change; Veracode in CI.

**Q:** Who were your stakeholders?

Product owner for payment platform, ops (L2/L3), vendor technical account, security/architecture for tokenization sign-off, downstream audit/reporting consumers.
