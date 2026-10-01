<div class="header">

# Detailed Resume Interview Prep

Every line on your IB v2 resume — with 30-second pitches, 2-minute scripts, architecture diagrams, sample SQL/code, and deep follow-up Q&A. Read top-to-bottom once, then drill sections before each interview round.

Akshat Anand · SDE II · Barclays · Resume v2 · Pune

</div>

[How to use](#how-to) [Framing](#framing) [Summary](#summary) [B1 Migration](#b1) [B2 Tokenization](#b2) [B3 Throughput](#b3) [B4 Spring](#b4) [B5 Kafka](#b5) [B6 Replay](#b6) [B7 CI/CD](#b7) [B8 RAG](#b8) [Samsung](#samsung) [OSS](#oss) [CodeReviewer](#project) [Skills deep-dive](#skills-deep) [Coding prep](#coding) [System design](#system-design) [Behavioral](#behavioral) [Checklist](#checklist)

<div class="wrap">

<div id="how-to" class="section">

## How to use this document

1.  **Round 1 (HR / recruiter):** Framing + Summary 2-min script + Why IB.
2.  **Round 2 (technical screen):** Pick 2 Barclays bullets you know best + 1 OSS story + Skills deep-dive (Java/SQL).
3.  **Round 3 (deep technical):** Tokenization HLD, async workers, Kafka, replay API, one system design.
4.  **Round 4 (hiring manager):** Behavioral STAR + ownership boundaries + CodeReviewer / RAG as differentiator.

Click **▸ expandable blocks** for extra depth. Memorize flows and numbers; adapt wording to what you actually built.

</div>

<div id="framing" class="section">

## Framing — say this before they misread your resume

<div class="warn">

**Critical:** `TWS` on your resume = **IBM TWS (Tivoli Workload Scheduler)** — enterprise batch job orchestration. It is *not* Interactive Brokers’ Trader Workstation. Say that in the first 60 seconds if the interviewer is from IB.\
\
Your domain = **investment-bank payment / treasury integration platform** (vendor SaaS migration, batch, REST, SQL recon). Not brokerage order flow or market making. Frame as *transactional backend at scale in a regulated environment* — that maps well to IB’s reliability expectations.

</div>

<div class="script">

**60-second opener (memorize)** “I’m a backend engineer with four years at Barclays on a payment integration platform. We migrated a legacy Unix batch stack to a vendor SaaS on AWS — I built Java Spring Boot services behind IBM Workload Scheduler, handling REST integrations, SQL reconciliation, Kafka events to internal audit systems, and operational tooling like batch replay APIs. I’m strongest in Java, Spring, SQL on Linux production systems, and I also ship OSS fixes to VS Code and Kubernetes and run a multi-agent PR review project on the side. I’m looking for a backend role where correctness, observability, and production discipline matter — which is why IB interests me.”

</div>

### Ownership language — be precise

| Say | When | Don’t say |
|----|----|----|
| “Contributed to the platform migration” | Cross-team program, 80+ workflows | “I migrated the entire bank” |
| “Owned the integration service / recon design / replay APIs” | Your direct deliverables | “I designed everything alone” |
| “Drove HLD/LLD for tokenization path” | You wrote design docs, led reviews | “I built DPaaS” (bank platform) |
| “Partnered with ops, vendor, security” | Real bank delivery | “No dependencies on anyone” |

### All numbers — what they measure

| Number | Meaning | If pressed |
|----|----|----|
| 4 years | Aug 2022 – present at Barclays | SDE II (BA-4) since promotion path |
| 80+ | Distinct TWS-orchestrated business processes in scope | Job streams / workflows, not 80 microservices |
| 5,000+ daily | Business transactions processed per day | Payment/account events through integration layer |
| 100K+ accounts | Account entities in migration + tokenization scope | Distinct account IDs in recon tables |
| 60% | Batch throughput improvement after async workers | Records/hour or wall-clock for same input volume |
| 25% | Release cycle time reduction | Commit-to-prod for your service |
| 40% MTTR | Mean time to resolve for pilot incident class | Before/after RAG tool; cite sample size |
| 20% (Samsung) | Model accuracy vs baseline on holdout set | State metric (accuracy/F1) you used |

</div>

<div id="summary" class="section">

## Professional Summary

<div class="bullet-quote">

Software Development Engineer II with 4 years at Barclays owning back-end Java / Spring Boot web services on Linux. Strong in Oracle/MySQL SQL, Unix Shell, MVC, data structures, system design, and production troubleshooting.

</div>

<div class="pitch">

**30 seconds** Backend engineer focused on Java Spring Boot services on Linux. Integration-heavy work: REST APIs, batch orchestration, SQL reconciliation, Kafka, and production recovery tooling — with emphasis on reliability and safe releases.

</div>

<div class="script">

**2 minutes — “Tell me about yourself”** “I’m Akshat, SDE II at Barclays Pune, four years on a payment integration platform. The big program was migrating a legacy Unix batch environment to a vendor SaaS on AWS. My work sits in the integration layer: Spring Boot services that IBM Workload Scheduler invokes, calling vendor REST APIs, persisting state in MySQL, and reconciling with Oracle reporting where needed.\
\
Three wins I’m proud of: first, designing the tokenization path so PII never lands in plaintext in the vendor cloud — DPaaS on-prem, DTU for encrypted transit, SQL recon over 100K accounts. Second, raising batch throughput about 60% by moving synchronous vendor calls to async workers with strict failure semantics. Third, operational tooling — Kafka to internal audit, a replay API for failed batch steps, and a RAG-based ops assistant that cut MTTR about 40%.\
\
Outside work I contribute to VS Code, Playwright, Kubernetes, and Apple Pkl, and I built CodeReviewer Agent — a LangGraph multi-agent PR reviewer with RAG and CI evals. I’m targeting backend Java roles where production correctness matters; IB’s stack and domain are a strong fit for what I’ve been doing at scale.”

</div>

Q: What does “owning” backend services mean in practice?

<div class="a">

On-call for your service’s failures; writing and reviewing code for your modules; defining API contracts with ops and downstream teams; owning Jenkins pipeline and Veracode for your artifact; writing runbooks; participating in design reviews for features you deliver. You don’t own the entire 80-workflow program — you own *your* services and designs within it.

</div>

Q: MVC — walk through a request in your service.

<div class="a">

1.  **Controller** (`@RestController`): HTTP POST `/batch/process-file` — validates DTO, returns 202/500.
2.  **Service**: business logic — parse file, call vendor client, update step state, emit Kafka event.
3.  **Repository** (`JpaRepository`): persist `BatchStepExecution` entity.
4.  **Cross-cutting**: exception handler → JSON error; logging with correlation ID; metrics.

</div>

Q: “Data structures” on a backend resume — give a real example.

<div class="a">

In tokenization recon: `Map<AccountId, TokenStatus>` for in-memory batch windows; DB B-tree indexes on `account_id` for O(log n) lookups; queue of failed records for retry worker; enum state machine for step status. In async workers: thread-safe `ConcurrentHashMap` for in-flight file locks; bounded `BlockingQueue` for work distribution.

</div>

Production troubleshooting — full incident walkthrough template

<div class="inner">

**Situation:** Month-end batch; TWS job stream blocked at step 14; 200 files pending.

**Investigation:**

1.  TWS job log → which step failed, exit code, start/end time.
2.  Spring Boot app log → grep `correlationId` or file name.
3.  SQL: `SELECT * FROM batch_step_execution WHERE status='FAILED' AND business_date=?`
4.  Vendor API status page / support ticket if 5xx spike.

**Resolution:** Root cause (e.g. vendor timeout); replay failed files via replay API; verify recon counts; unblock downstream TWS dependencies.

**Follow-up:** Lower timeout threshold alert; add Kafka event for audit; document in runbook.

</div>

</div>

<div id="b1" class="section">

## Barclays Bullet 1 — Legacy Unix → SaaS on AWS

<div class="bullet-quote">

Contributed to migrating a legacy Unix platform to a third-party SaaS on AWS, developing Java / Spring Boot integration services for 80+ TWS-orchestrated business processes via vendor REST APIs, automating 5,000+ daily transactions across 100K+ accounts.

</div>

<div class="pitch">

**30 seconds** We replaced a legacy Unix payment-ops stack with vendor SaaS on AWS. I built Spring Boot integration services that IBM TWS batch jobs call over REST, covering 80+ workflows processing 5,000+ daily transactions across 100K+ accounts.

</div>

### Architecture — end-to-end

\
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────┐     ┌──────────────┐\
│  IBM TWS    │────▶│ Spring Boot          │────▶│ Vendor SaaS     │────▶│ AWS-hosted   │\
│  (scheduler)│     │ Integration Service  │     │ REST APIs       │     │ vendor app   │\
└─────────────┘     │  (your code, Linux)  │     └─────────────────┘     └──────────────┘\
       │            └──────────┬───────────┘\
       │                       │\
       │            ┌──────────▼───────────┐     ┌──────────────┐\
       └───────────▶│ MySQL / control DB   │     │ Legacy Unix  │\
                    │ (step state, audit)  │     │ (phased out) │\
                    └──────────────────────┘     └──────────────┘\
  

### IBM TWS concepts — know cold

| Term | Definition | Interview use |
|----|----|----|
| Job stream | Directed acyclic graph of jobs with dependencies | “Payment EOD stream: ingest → validate → vendor sync → recon” |
| Job / Job definition | Single unit: script, command, or HTTP call | “TWS calls our Spring endpoint or shell wrapper” |
| Workload | Collection of job streams for a business area | “80+ processes ≈ many job definitions across streams” |
| Calendar / run cycle | When jobs may run (daily, month-end) | “Month-end extends critical path” |
| Dependency | Job B starts only after Job A success | “Failure blocks downstream — why replay matters” |
| Restart / recovery | Re-run from failed job | Links to your replay API bullet |

Q: Walk through one concrete workflow end-to-end.

<div class="a">

**Example: Payment status sync.**\
1. TWS triggers at 02:00 — runs shell or HTTP job calling `POST /integration/payment-sync`.\
2. Service reads pending records from control table or inbound file drop.\
3. For each record: validate schema → map internal account ID → call vendor `PUT /payments/{id}/status`.\
4. Persist result: SUCCESS/FAILED, vendor correlation ID, timestamp.\
5. Return HTTP 200 to TWS only if batch acceptance criteria met; else non-zero exit → TWS marks job failed.\
6. Downstream TWS jobs (recon, reporting) depend on this step.

</div>

Q: What was on the legacy Unix side?

<div class="a">

Typically: cron or TWS-invoked shell scripts, file drops on NFS, `awk/sed` transforms, direct DB calls or flat-file feeds to old systems. Migration = replace script logic with typed Java services + REST vendor APIs, while keeping file-based boundaries where ops still needed them during parallel run.

</div>

Q: How did parallel run work during migration?

<div class="a">

Both old Unix path and new SaaS path process same or overlapping inputs with compare reports. Discrepancies triaged before cutover. Feature flags or routing tables decide which path is authoritative. Rollback plan: revert TWS to old job definitions. Zero customer impact = no hard cutover without validation window.

</div>

Q: REST integration — how do you handle vendor API failures?

<div class="a">

- **Retry:** idempotent GET/PUT with exponential backoff for 5xx and network blips.
- **No retry:** 4xx business errors — log, mark FAILED, alert.
- **Circuit breaker:** if vendor down, fail fast so TWS doesn’t hang entire stream.
- **Timeout:** explicit connect/read timeouts — never infinite wait.
- **Idempotency:** same file replay must not double-post payments.

</div>

Q: Why Spring Boot for integration vs plain Java?

<div class="a">

Embedded server, dependency injection, standardized config profiles (dev/test/prod), Spring Data JPA for state, actuator for health checks TWS/monitoring can poll, mature ecosystem for REST clients and testing. Refactor bullet covers migration from Core Java monolith.

</div>

More questions: scaling, security, team structure

<div class="inner">

Q: How do 5,000 transactions/day scale?

Not HFT — batch windows concentrate load (EOD). Throughput optimization (bullet 3) matters more than single-request latency. Horizontal scale = more worker instances if stateless; DB connection pooling; vendor rate limits cap parallelism.

Q: What security controls on REST layer?

mTLS or OAuth2 client credentials to vendor; secrets in vault not code; internal APIs on private network; RBAC for ops replay APIs; audit log every state change; Veracode in CI.

Q: Who were your stakeholders?

Product owner for payment platform, ops (L2/L3), vendor technical account, security/architecture for tokenization sign-off, downstream audit/reporting consumers.

</div>

</div>

<div id="b2" class="section">

## Barclays Bullet 2 — PII Tokenization (HLD / LLD)

<div class="bullet-quote">

Drove system design (HLD/LLD) and data structures / schema modeling so vendor SaaS stores tokenized PII, not plaintext: on-prem data tokenized via DPaaS, encrypted in transit through DTU to AWS; batch recon over MySQL/Oracle SQL confirms 100K+ accounts with fault-tolerant retries and zero downtime.

</div>

<div class="pitch">

**30 seconds** Regulatory constraint: vendor cloud cannot store raw PII. We tokenize on-prem with DPaaS, move only encrypted payloads through DTU to AWS, and run SQL recon proving 100K+ accounts tokenized correctly — with retries and no production outage.

</div>

<div class="script">

**2 minutes — “Describe a system you designed”** “The hardest design problem in our migration was PII. The vendor SaaS runs on AWS, but bank policy forbids sending plaintext names, IDs, or account identifiers to a third party.\
\
High level: I drew trust boundaries — on-prem zone, transit zone, vendor cloud. On-prem, source data passes through DPaaS, the bank’s tokenization service, which replaces sensitive fields with irreversible tokens. The payload is encrypted and sent via DTU — our data transfer utility — using approved channels. The vendor only ever sees tokens plus non-sensitive attributes.\
\
Low level: I modeled schemas for tokenization status per account — states like PENDING, SENT, CONFIRMED, FAILED. The recon batch runs SQL against MySQL integration tables and Oracle reporting exports, comparing expected vs actual token presence in vendor DB. Mismatches enter a retry queue with backoff; after N failures we page ops. We chunked 100K+ accounts into batches of about 1,000 with indexed lookups on account_id.\
\
Zero downtime meant phased cutover: new accounts tokenized on the new path while legacy path still served read-only traffic until recon hit 100% for a full business cycle. I presented HLD to architecture and security; LLD covered table DDL, recon queries, and failure handling.”

</div>

### Data flow diagram

\
 ON-PREM                          TRANSIT                    AWS / VENDOR\
┌──────────────┐    ┌─────────┐    ┌─────┐    ┌────────────────────────┐\
│ Source DB /  │───▶│  DPaaS  │───▶│ DTU │───▶│ Vendor SaaS (tokens    │\
│ inbound file │    │ tokenize│    │enc. │    │ only + business data)  │\
└──────────────┘    └─────────┘    └─────┘    └────────────────────────┘\
       │                                              ▲\
       │         ┌────────────────────────────────────┘\
       │         │  recon verifies token exists per account\
       ▼         ▼\
┌──────────────────────────────────────────────────────────┐\
│ Recon batch (Spring / SQL): MySQL state + Oracle exports │\
│  → match / mismatch → retry worker → alert              │\
└──────────────────────────────────────────────────────────┘\
  

### Acronyms — 2-sentence definitions

| Term | Say this |
|----|----|
| **DPaaS** | Bank-managed Data Protection / tokenization platform. API or batch in: sensitive field out: token. Vault holds mapping; vendor never sees vault. |
| **DTU** | Data Transfer Utility — approved pipeline for moving encrypted files or API payloads from on-prem to cloud. Logging, scanning, checksums, audit trail. |
| **PII** | Personally identifiable information — names, national IDs, account numbers that can identify a person or entity. |
| **Tokenization** | Replace sensitive value with random token; original stored in secure vault on-prem. Not same as encryption alone — token is not reversible without vault. |

### State machine — account tokenization

\
  PENDING ──(send to DTU)──▶ IN_TRANSIT ──(vendor ack)──▶ CONFIRMED\
     │                           │                          │\
     └──(validation fail)──▶ FAILED ◀──(recon mismatch)───┘\
                                   │\
                            (retry \< N) ──▶ back to PENDING\
                            (retry ≥ N) ──▶ MANUAL_REVIEW\
  

Q: Sample recon SQL (whiteboard)

\
-- Accounts that should be tokenized but missing vendor-side token\
SELECT s.account_id, s.tokenization_status, s.last_updated\
FROM   integration_account_status s\
LEFT JOIN vendor_token_snapshot v ON v.account_id = s.account_id\
WHERE  s.expected_token = TRUE\
  AND  s.business_date = :runDate\
  AND  (v.token_id IS NULL OR v.token_status \<\> 'ACTIVE');\
\
-- Count for dashboard: target 100K+ CONFIRMED\
SELECT tokenization_status, COUNT(\*) FROM integration_account_status\
WHERE business_date = :runDate GROUP BY tokenization_status;\
  

Q: HLD vs LLD — what did you actually document?

<div class="a">

**HLD doc:** context, requirements (no plaintext in SaaS), component diagram, sequence diagram, trust zones, non-functionals (availability, audit), risks, rollout phases.\
**LLD doc:** table schemas with indexes, API contracts with DPaaS/DTU, recon algorithm pseudocode, retry policy (max 3, backoff 1m/5m/15m), idempotency keys, monitoring metrics, runbook for FAILED \> threshold.

</div>

Q: What is “fault-tolerant retries” here?

<div class="a">

Transient failures (DTU timeout, vendor 503) → automatic retry with idempotency key so duplicate sends don’t create duplicate tokens. Permanent failures (invalid account) → FAILED state, no infinite loop. Dead-letter table for manual ops. Recon job itself is restartable — processes chunks with checkpoint.

</div>

Q: How is “zero downtime” achieved?

<div class="a">

No big-bang switch: dual-path period, read traffic on legacy until recon green; blue/green for integration service deployments; database migrations backward-compatible (add column, backfill, then switch); feature toggle for new tokenization path per account cohort.

</div>

Q: Why both MySQL and Oracle?

<div class="a">

MySQL often holds integration service operational state (fast writes, app-owned schema). Oracle may hold legacy core reporting or enterprise warehouse extracts used for recon sign-off. Recon batch joins via staged exports or federated queries — honest answer: “different systems of record in a large bank estate.”

</div>

Deep follow-ups: tokenization vs encryption, GDPR, design review

<div class="inner">

Q: Tokenization vs encryption?

Encryption: reversible with key; ciphertext still sensitive if key leaks. Tokenization: vendor stores meaningless token; vault on-prem maps token↔PII. Vendor breach exposes tokens only.

Q: What if recon finds 500 mismatches at month-end?

Halt dependent downstream jobs; ops dashboard shows account list; retry worker processes queue; if vendor bug, escalate; if data issue, fix source and replay affected accounts only.

Q: Schema modeling choices?

`account_id` PK or unique; `tokenization_status` enum; `retry_count`; `last_error_code`; `vendor_correlation_id`; composite index on `(business_date, status)` for recon queries; `@Version` for optimistic locking on concurrent updates.

</div>

</div>

<div id="b3" class="section">

## Barclays Bullet 3 — 60% Batch Throughput

<div class="bullet-quote">

Raised batch throughput 60% by replacing synchronous vendor REST work inside TWS-orchestrated jobs with isolated async workers (one file per execution); step state persists in SQL/JPA, and a timeout or non-2xx fails the step instead of recording a dead call as success.

</div>

<div class="pitch">

**30 seconds** TWS jobs blocked on sequential vendor REST calls. I introduced async workers — one unit of work per input file — with state in MySQL via JPA. Success only on HTTP 2xx within timeout; otherwise the step fails visibly.

</div>

### Before vs after

| Dimension | Before (sync) | After (async workers) |
|----|----|----|
| Execution model | Single thread in TWS step loops all files | Thread pool; each file = independent task |
| Wall-clock | Σ(vendor_latency × files) | ≈ max(batch) with parallelism |
| Failure handling | Timeout sometimes logged as warn, step green | Non-2xx / timeout → FAILED in DB → TWS sees failure |
| Observability | One log blob | Per-file row in `batch_step_execution` |
| Recovery | Re-run entire step | Replay single file (bullet 6) |

### Throughput math (explain 60%)

\
Example (illustrative):\
  Before: 500 files × 2 sec vendor latency = 1000 sec (~16.7 min)\
  After:  500 files / 10 workers × 2 sec = 100 sec (~1.7 min)\
  Improvement: (1000 - 100) / 1000 = 90% theoretical; real world ~60% after\
  rate limits, DB contention, coordination overhead.\
\
Always say: "measured on month-end representative load, same file volume."\
  

Q: Why “one file per execution”?

<div class="a">

Legacy Unix batch already used files as boundaries — ops drops file, job processes it. Idempotency: reprocessing same file name + checksum = safe replay. Parallelism: files independent if no cross-file dependency. TWS step can wait for “all files in directory processed” via aggregate status query.

</div>

Q: JPA entity — what fields?

\
@Entity\
@Table(name = "batch_step_execution")\
class BatchStepExecution {\
  @Id Long id;\
  String fileName;\
  String jobStreamId;\
  String stepName;\
  @Enumerated(EnumType.STRING) StepStatus status; // PENDING, RUNNING, SUCCESS, FAILED\
  String vendorCorrelationId;\
  Integer httpStatus;\
  Integer retryCount;\
  String errorMessage;\
  Instant startedAt;\
  Instant completedAt;\
  @Version Long version;  // optimistic lock\
}\
  

Q: How does TWS know async work finished?

<div class="a">

Pattern A: TWS step polls `GET /batch/status?streamId=` until all files terminal. Pattern B: worker pool runs inside long-running step with internal join. Pattern C: TWS triggers “fan-out” job per file (80+ workflows variant). Pick the pattern you actually used and stick to it.

</div>

Q: Spring implementation sketch

\
@Service\
class FileProcessorService {\
  @Async("vendorExecutor")\
  public CompletableFuture\<Void\> processFile(String fileName) {\
    BatchStepExecution step = repo.save(running(fileName));\
    try {\
      ResponseEntity\<Void\> resp = vendorClient.submit(fileName);\
      if (!resp.getStatusCode().is2xxSuccessful()) {\
        step.fail("HTTP " + resp.getStatusCode());\
      } else {\
        step.success();\
      }\
    } catch (ResourceAccessException ex) { // timeout\
      step.fail("TIMEOUT");\
    } finally {\
      repo.save(step);\
    }\
    return CompletableFuture.completedFuture(null);\
  }\
}\
  

Q: Concurrency pitfalls and fixes

<div class="a">

| Problem | Fix |
|----|----|
| Same file processed twice | Unique constraint on (file_name, business_date); status check before RUNNING |
| Vendor rate limit 429 | Semaphore limiting concurrency; exponential backoff |
| Partial DB commit | @Transactional on state update; vendor call after PENDING→RUNNING |
| Thread pool exhaustion | Bounded queue; reject policy → FAILED with reason QUEUE_FULL |
| Lost update on status | @Version optimistic lock; retry on OptimisticLockException |

</div>

Q: Why was false success a problem before?

<div class="a">

Downstream recon and reporting assumed vendor received data. Silent timeout → missing payments in SaaS → regulatory and ops impact. Strict failure semantics let TWS block dependent jobs and ops fix before EOD deadline.

</div>

</div>

<div id="b4" class="section">

## Barclays Bullet 4 — Spring Refactor

<div class="bullet-quote">

Refactored Core Java into Maven multi-module Spring Boot / Spring MVC service with Spring Data JPA; OOP, SOLID, design patterns; Unix Shell during cutover; JUnit/Mockito, integration testing, code reviews.

</div>

<div class="pitch">

**30 seconds** Integration layer was a Core Java monolith. I split it into Maven multi-module Spring Boot with MVC layers and JPA, added unit/integration tests, and kept Unix Shell jobs running through phased cutover.

</div>

### Maven module layout

\
payment-integration-parent (pom)\
├── integration-api          # @RestController, request/response DTOs, validation\
├── integration-service      # business logic, vendor clients, @Service\
├── integration-persistence  # @Entity, JpaRepository\
├── integration-common       # exceptions, constants, shared utils\
└── integration-app          # @SpringBootApplication, config, main()\
  

Q: SOLID — one example each from your codebase

<div class="a">

- **S:** `VendorPaymentClient` only HTTP; `PaymentSyncService` orchestrates — not 800-line god class.
- **O:** `RetryPolicy` interface; `ExponentialBackoffPolicy` vs `NoRetryPolicy` without changing caller.
- **L:** Mock `VendorClient` in tests substitutes real impl.
- **I:** Separate `TokenizationReconPort` from fat `IntegrationService`.
- **D:** Constructor inject `VendorClient`, `BatchStepRepository` — no `new RestTemplate()` in services.

</div>

Q: Design patterns — explain three

<div class="a">

**Strategy:** Pluggable retry/backoff for vendor calls.\
**Template Method:** Abstract `BatchStepTemplate` with `validate()`, `execute()`, `onFailure()` hooks.\
**Adapter:** Wrap legacy shell script exit codes into Spring `BatchResult` DTO for TWS.\
**Repository:** Spring Data JPA hides SQL for CRUD.\
**Factory:** Build vendor-specific request payloads from internal canonical model.

</div>

Q: Testing pyramid

<div class="a">

**Unit (JUnit 5 + Mockito):** service logic, retry rules, mapping — fast, no Spring context.\
**Slice tests:** `@WebMvcTest` for controllers; `@DataJpaTest` for repos.\
**Integration:** `@SpringBootTest` + Testcontainers MySQL or H2; WireMock stubs vendor HTTP.\
**CI:** `mvn test` in Jenkins; fail build on coverage drop (if enforced).\
**Code review:** check exception handling, SQL injection, missing tests for bug fixes.

</div>

Q: Sample Mockito test talking point

\
@Test\
void marksStepFailedOnVendorTimeout() {\
  when(vendorClient.submit(any())).thenThrow(new ResourceAccessException("timeout"));\
  service.processFile("pay_001.dat");\
  BatchStepExecution step = repo.findByFileName("pay_001.dat");\
  assertEquals(StepStatus.FAILED, step.getStatus());\
  assertTrue(step.getErrorMessage().contains("TIMEOUT"));\
}\
  

Q: Unix Shell during cutover — what did you actually do?

<div class="a">

Fixed paths when NFS mount changed; added logging to legacy scripts; wrapped Spring JAR invocation from shell with exit code mapping; debugged `chmod` and env var issues; coordinated with ops on TWS job definition updates. Frame as “maintained and extended,” not primary skill.

</div>

Spring Boot internals they might ask

<div class="inner">

Q: How does Spring Boot auto-configuration work?

`@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + component scan. `spring.factories` / `AutoConfiguration.imports` load conditional beans (e.g. DataSource if JDBC on classpath).

Q: @Transactional — common mistake?

Self-invocation bypasses proxy — transaction won't start. Default propagation REQUIRED; rollback on RuntimeException. Long transactions holding DB connections during vendor HTTP call — fix: shorten transaction boundary around DB only.

Q: Spring MVC vs Spring WebFlux?

You used servlet-stack MVC (Tomcat embedded) — thread-per-request, blocking vendor calls moved to @Async pool. WebFlux is reactive — not your stack unless you say otherwise.

</div>

</div>

<div id="b5" class="section">

## Barclays Bullet 5 — Kafka to Audit & Reporting

<div class="bullet-quote">

Published payment and account-status events through Apache Kafka from Spring Boot to internal audit and reporting systems; downstream consumers process asynchronously without blocking TWS batch completion.

</div>

<div class="pitch">

**30 seconds** After successful payment or account update, we publish a Kafka event. Audit and reporting teams consume async. The TWS batch step completes without waiting for their processing.

</div>

### Event contract

\
Topic:     payment.account-status.v1\
Key:       accountId          (partition ordering per account)\
Value:     JSON Avro/JSON schema\
{\
  "eventId": "uuid",\
  "eventType": "ACCOUNT_STATUS_UPDATED",\
  "accountId": "ACC-123",\
  "previousStatus": "PENDING",\
  "newStatus": "ACTIVE",\
  "correlationId": "tws-job-456",\
  "sourceSystem": "payment-integration",\
  "timestamp": "2025-08-15T02:14:33Z",\
  "schemaVersion": 1\
}\
  

### Producer flow

\
1. DB transaction: update account status + insert business row\
2. (Optional) same transaction: insert into outbox table\
3. Commit\
4. KafkaTemplate.send(topic, accountId, event)  OR outbox poller sends\
5. TWS step returns success — does NOT wait for consumer\
  

Q: Why Kafka instead of REST callback to audit?

<div class="a">

- **Decoupling:** audit team deploys independently.
- **Fan-out:** reporting + audit + future consumers same topic.
- **Buffering:** spike at month-end doesn’t overwhelm audit service.
- **Replay:** re-read offset for audit investigation.
- **Non-blocking:** batch SLA met without downstream latency in critical path.

</div>

Q: At-least-once vs exactly-once?

<div class="a">

**Likely your setup: at-least-once.** Producer acks=all; consumer commits offset after process. Duplicate events possible if crash between process and commit. Mitigation: consumers dedupe on `eventId` in idempotency table. Exactly-once needs transactions API or Kafka Streams — only claim if you used it.

</div>

Q: Transactional outbox pattern — explain

<div class="a">

Problem: DB committed but Kafka publish fails → inconsistency. Solution: write event to `outbox` table in same DB transaction as business update. Separate poller reads outbox, publishes to Kafka, marks SENT. Guarantees at-least-once from DB to bus. Good senior answer even if implementation was simplified.

</div>

Q: Partitioning and consumer groups

<div class="a">

Key=accountId → all events for one account ordered in one partition. Consumer group `audit-service` — N instances share partitions; scale consumers ≤ partition count. Reporting team = different group, same topic, independent offset.

</div>

Q: What if publish fails?

<div class="a">

Producer retries; if still failing → outbox row stays PENDING; alert fires; batch business step may still succeed (vendor sync done) but event flagged for reconciliation job. Ops replay from outbox or DLQ topic `payment.account-status.v1.dlq`.

</div>

Kafka troubleshooting questions

<div class="inner">

Q: Consumer lag growing?

Scale consumers, add partitions (plan carefully — key distribution), optimize consumer processing, check slow SQL in consumer.

Q: Message ordering broken?

Wrong key — must use accountId not random UUID. Multiple partitions without key discipline.

Q: Serialization?

JSON for simplicity internally; Schema Registry in mature setups — mention if bank used Avro.

</div>

</div>

<div id="b6" class="section">

## Barclays Bullet 6 — Batch Replay & Recovery API

<div class="bullet-quote">

Built internal Spring Boot service for batch replay and step-level recovery after TWS failures; APIs for ops to re-trigger failed payment-load steps without manual DB intervention.

</div>

<div class="pitch">

**30 seconds** When TWS steps failed, ops needed DBAs to fix state. I built internal REST APIs to list failures and safely replay a file or step using persisted JPA state — with auth, idempotency, and audit logs.

</div>

<div class="warn">

Prepare one **concrete story** — interviewers will drill this. Use the template below and fill in real file names / dates from your experience.

</div>

### API design

| Endpoint | Purpose | Notes |
|----|----|----|
| `GET /api/v1/failures?businessDate=&step=` | List failed executions | Paginated; filter by job stream |
| `GET /api/v1/executions/{id}` | Detail + error message | vendor correlation ID, HTTP status |
| `POST /api/v1/replay/{executionId}` | Re-queue single file | Only if status=FAILED |
| `POST /api/v1/replay/bulk` | Replay list of IDs | Ops month-end recovery |
| `GET /api/v1/replay/{id}/status` | Poll replay outcome | REPLAYING → SUCCESS/FAILED |

### Replay state machine

\
FAILED ──(ops POST replay)──▶ REPLAYING ──(worker)──▶ SUCCESS\
                                  │\
                                  └──▶ FAILED (increment retry_count)\
  

<div class="script">

**STAR incident story (template)** **S:** Month-end payment-load step failed at 03:00 — 47 files in FAILED state; vendor had transient 503.\
**T:** Restore before 06:00 downstream recon deadline without duplicate payments.\
**A:** Used failures API to list 47 rows; confirmed vendor healthy; called bulk replay; monitored REPLAYING→SUCCESS; verified recon counts matched.\
**R:** Zero manual SQL; saved ~2 hours vs DBA path; added alert on FAILED \> 10.

</div>

Q: How prevent double payment on replay?

<div class="a">

1.  Only FAILED (never SUCCESS) eligible for replay.
2.  Optimistic lock: `UPDATE ... WHERE status='FAILED' AND version=?`
3.  Vendor idempotency header with same business key.
4.  Audit log: who replayed, when, from which IP.
5.  Max replay count — after 3 → MANUAL_REVIEW ticket.

</div>

Q: Security?

<div class="a">

Internal VPN only; OAuth2 / bank SSO; role `OPS_REPLAY`; no external exposure; all mutations logged to SIEM; rate limit bulk replay.

</div>

Q: Difference vs TWS native restart?

<div class="a">

TWS restarts job definition from scratch — may reprocess entire directory. Your API replays *granular* failed units with business-aware idempotency and visibility — complements TWS, doesn’t replace it.

</div>

</div>

<div id="b7" class="section">

## Barclays Bullet 7 — Jenkins, Fat JAR, Veracode

<div class="bullet-quote">

Packaged as executable fat JAR; Jenkins pipelines through test, staging, production; 25% faster release cycle; Veracode zero critical findings.

</div>

<div class="pitch">

**30 seconds** We ship Spring Boot fat JARs via Jenkins with automated tests and Veracode scans. I automated promotions across environments and cut release cycle time about 25% while keeping zero critical security findings.

</div>

### Jenkins pipeline (typical)

\
pipeline {\
  stages {\
    stage('Checkout')      { git checkout scm }\
    stage('Build')         { sh 'mvn -B clean package -DskipTests=false' }\
    stage('Unit Tests')    { junit '\*\*/target/surefire-reports/\*.xml' }\
    stage('Integration')   { sh 'mvn verify -Pintegration' }\
    stage('Veracode')      { veracodeScan(...); failOnCritical() }\
    stage('Publish')       { archiveArtifacts '\*\*/integration-app.jar' }\
    stage('Deploy Test')   { deploy(env: 'test') }\
    stage('Deploy Staging'){ input message: 'Promote?'; deploy('staging') }\
    stage('Deploy Prod')   { input message: 'Prod?'; deploy('prod') }\
  }\
}\
  

Q: What is a fat JAR?

<div class="a">

Spring Boot repackages dependencies + embedded Tomcat into one executable JAR. Deploy: `java -jar integration-app.jar --spring.profiles.active=prod`. Alternative: thin JAR + lib folder — fat JAR simpler for ops on Linux VMs.

</div>

Q: How did you achieve 25% faster releases?

<div class="a">

Pick 2–3 real changes: parallelized test and Veracode stages; cached Maven dependencies; removed manual artifact copy; standardized Helm/script deploy; fixed flaky tests that blocked pipeline; template pipeline shared across modules. Baseline: median commit-to-prod over 8 weeks before vs after.

</div>

Q: Veracode — categories you fixed

<div class="a">

| Finding | Fix |
|----|----|
| SQL Injection (CWE-89) | Parameterized queries / JPA — never string concat SQL |
| Hardcoded credentials (CWE-798) | Vault / Spring Cloud Config |
| Insecure random | `SecureRandom` for tokens |
| XPath / XXE | Disable external entities in XML parser |
| Vulnerable dependency | Bump library in pom.xml; OWASP dependency check |

</div>

Q: Deploy rollback?

<div class="a">

Keep previous JAR version; blue/green or quick redeploy; DB migrations backward-compatible; feature flags disable new code path; TWS jobs unaffected if service health check fails — previous instance stays up.

</div>

</div>

<div id="b8" class="section">

## Barclays Bullet 8 — RAG / LLM Ops Agent

<div class="bullet-quote">

Production RAG / LLM ops agent in Python/LangChain/PgVector over runbooks and ServiceNow/Jira APIs; human-in-the-loop; MTTR cut 40%.

</div>

<div class="pitch">

**30 seconds** On-call engineers searched scattered runbooks and tickets. I built a RAG tool that retrieves relevant docs and similar incidents, suggests recovery steps with citations, and never auto-changes prod — MTTR dropped about 40% on our pilot queue.

</div>

### Architecture

\
┌─────────────┐    ┌─────────────────────────────────────────────┐\
│ Indexing    │    │  Runbooks (Markdown/PDF)                    │\
│ (batch)     │───▶│  ServiceNow API (resolved incidents)        │\
│             │    │  Jira API (RCA tickets)                       │\
└──────┬──────┘    └──────────────────┬──────────────────────────┘\
       │ chunk + embed                 │\
       ▼                               │\
┌──────────────┐                       │\
│ PostgreSQL   │◀──────────────────────┘\
│ + PgVector   │\
└──────┬───────┘\
       │ top-k similarity\
       ▼\
┌──────────────┐    ┌─────────────┐    ┌──────────────────┐\
│ Ops UI / CLI │───▶│ LangChain   │───▶│ LLM (internal/   │\
│ query        │    │ RAG chain   │    │  approved model) │\
└──────────────┘    └─────────────┘    └──────────────────┘\
       ▲                                      │\
       └──────── cited answer + steps ────────┘\
                    (human executes manually)\
  

Q: RAG pipeline step-by-step

<div class="a">

1.  **Ingest:** fetch docs from Confluence/runbook repo + SN/Jira APIs.
2.  **Chunk:** 500–1000 tokens, overlap 100; metadata: source, date, system.
3.  **Embed:** sentence-transformer or OpenAI ada — store vector in PgVector.
4.  **Query:** embed user question; cosine similarity top-k=5.
5.  **Generate:** prompt LLM with chunks + “answer only from context; cite sources.”
6.  **Guardrails:** no prod write tools; confidence threshold → “escalate to L3.”

</div>

Q: Why RAG not fine-tuning?

<div class="a">

Runbooks change weekly; fine-tuning expensive and stale fast. RAG gives citations ops can verify. Lower compliance risk — no model stores PII if indexing scrubs it. Faster iteration — re-embed changed docs only.

</div>

Q: LangChain components you used

<div class="a">

`DocumentLoader`, `RecursiveCharacterTextSplitter`, `OpenAIEmbeddings` or local embeddings, `PGVector` vectorstore, `RetrievalQA` or LCEL chain, `ChatPromptTemplate` with system message for safety.

</div>

Q: ServiceNow / Jira integration

<div class="a">

Read-only API keys; pull resolved incidents with resolution notes; index as “past incident” chunks; at query time retrieve similar tickets — “last time vendor 503, we replayed from checkpoint X.” Rate limit API calls; PII redaction before embed.

</div>

Q: How measured 40% MTTR?

<div class="a">

MTTR = resolve_time - open_time for Sev-2 integration incidents. Baseline: 90 days pre-tool median. Pilot: 60 days post-tool same category, same team. Result: e.g. 120 min → 72 min = 40% reduction. Caveat: sample size ~N; correlation not perfect; controlled for vendor outages.

</div>

Q: Human-in-the-loop — what exactly?

<div class="a">

Tool suggests steps; engineer reads citations; engineer runs kubectl/sql/replay API manually; tool has no credentials to mutate prod. Disclaimer in UI. Feedback thumbs up/down for improvement loop.

</div>

Q: Failure modes of RAG

<div class="a">

Hallucination when retrieval misses → say “insufficient context”; stale runbook → show doc date; wrong chunk → low similarity score filter; prompt injection in ticket text → sanitize inputs.

</div>

</div>

<div id="samsung" class="section">

## Samsung Research — ML Intern

<div class="bullet-quote">

Multi-modal ML pipeline in Python/Pandas over 10,000+ sensor points across 3 datasets; 20% accuracy improvement; 4-person team.

</div>

<div class="pitch">

**30 seconds** Internship: built a multi-modal ML pipeline — merged sensor datasets in Pandas, feature engineering, model training with a team of four; improved holdout accuracy about 20% over baseline.

</div>

Q: What does multi-modal mean here?

<div class="a">

Multiple sensor modalities — e.g. accelerometer + gyro + environmental — fused into one feature matrix. Each modality = one dataset or channel; model combines them (early fusion: concat features; late fusion: ensemble predictions).

</div>

Q: Pipeline stages

<div class="a">

Collect → clean (missing values, outliers) → normalize → feature extract → train/val/test split (70/15/15) → train classifier/regressor → evaluate → error analysis. Python: Pandas, scikit-learn or similar.

</div>

Q: 20% improvement — math

<div class="a">

If baseline accuracy 0.75 and new 0.90 → (0.90-0.75)/0.75 = 20% relative improvement. State whether metric was accuracy, F1, or RMSE. Mention you avoided train/test leakage (same device not in both splits).

</div>

Q: Your role in 4-person team?

<div class="a">

Be specific: “I owned data cleaning and feature pipeline” or “I ran experiments on fusion architecture.” Don’t claim sole credit for 20%.

</div>

</div>

<div id="oss" class="section">

## Open Source — Deep Prep

OSS proves you read large codebases, take review feedback, and ship. Expect 5–10 minutes on one PR if they’re interested.

### VS Code PR \#330754 — Tab close-button column

<div class="bullet-quote">

Reserved Modern UI tab close-button column; fixed overlay on filename.

</div>

Q: Describe the bug and root cause.

<div class="a">

Modern UI tabs: close button absolutely positioned on the right overlapped the filename label’s clickable area — users trying to select/focus tab accidentally closed it. Root cause: label used full width without reserving space for close control.

</div>

Q: Your fix?

<div class="a">

Reserve 28px right column for close button in tab layout CSS/TS — label hit-target excludes that column. Close button only visible on hover in reserved zone.

</div>

Q: How to contribute to VS Code?

<div class="a">

Fork microsoft/vscode → yarn install → compile → reproduce in Code OSS → fix → `yarn watch` → test → sign CLA → PR with issue link → iterate on CI and reviewer feedback.

</div>

### VS Code PR \#331612 — Panel tab centering

<div class="bullet-quote">

Fixed panel title tab vertical centering in 32px header (Modern UI).

</div>

Classic UI had 1px top border eating layout space; Modern UI tabs appeared off-center (5px vs 3px). Fix: adjust border/padding so symmetric 4px vertical padding in 32px header. Shows CSS layout debugging in complex desktop app.

### Playwright PR \#41845 — Token bypass client name

VS Code extension connect path for token-bypass authentication omitted client name parameter. Server couldn’t identify client session correctly. One-line fix in connection setup — good story for careful API contract reading and extension debugging.

### Kubernetes PR \#140447 — EndpointSlice metric `_total`

<div class="bullet-quote">

Renamed `endpoint_slice_controller_changes` to `endpoint_slice_controller_changes_total` per stable metrics conventions.

</div>

Q: Why does this matter?

<div class="a">

Kubernetes stable metrics rules: counters must have `_total` suffix for Prometheus compatibility and graduation from ALPHA to BETA/GA. Misnamed metrics cannot graduate — must add new metric, deprecate old, dual-publish during migration.

</div>

Q: What is EndpointSlice?

<div class="a">

Scalable replacement for Endpoints object — groups network endpoints for a Service. Controller emits metrics on changes for monitoring/control plane health.

</div>

Q: How navigate K8s codebase?

<div class="a">

Find metric registration in `staging/src/k8s.io/endpointslice` controller; follow Prometheus patterns in codebase; run unit tests; respond to sig-instrumentation reviewers; CI must pass.

</div>

### Apple Pkl PR \#1383 — `super` in `let`

Pkl config language: method resolution for `super` inside `let` expressions was wrong due to scope/evaluator bug. Fixed runtime evaluator. Story: “I can debug unfamiliar language runtime with tests.”

Generic OSS interview questions

<div class="inner">

Q: Why contribute to OSS?

Learn production code standards; give back to tools I use daily; practice code review at scale; demonstrates initiative beyond day job.

Q: Hardest review comment you addressed?

Prepare one: naming, test coverage, edge case, CLA, or CI flake — show humility and iteration.

</div>

</div>

<div id="project" class="section">

## CodeReviewer Agent — Technical Project

<div class="bullet-quote">

Multi-agent GitHub PR reviewer: LangGraph, security + pattern agents, GitHub Actions; RAG with Supabase pgvector, BM25 fallback, eval harness with precision/recall in CI.

</div>

<div class="pitch">

**60 seconds** Personal project: on each PR, GitHub Actions runs my pipeline — indexes diff context, retrieves related code and JIRA/Confluence via Supabase pgvector, runs parallel security and pattern agents orchestrated by LangGraph, dedupes findings, posts inline review comments. CI runs a golden-set eval for precision and recall so quality doesn’t regress.

</div>

### LangGraph orchestration

\
START\
  → ingest_pr (fetch diff, changed files)\
  → build_context (RAG: embed query, pgvector top-k, BM25 fallback)\
  → fork parallel:\
        security_agent (OWASP, secrets, injection)\
        pattern_agent (style, conventions, anti-patterns)\
  → ensemble (dedupe by file+line+rule, score, filter low confidence)\
  → publish (GitHub Review API + JSON artifact)\
END\
  

Q: Why multi-agent?

<div class="a">

Separation of concerns — security prompts/rules differ from style rules; parallel execution faster; tune and eval agents independently; ensemble reduces false positives from single monolithic prompt.

</div>

Q: RAG indexing

<div class="a">

Batch job: walk repo AST-aware chunks; pull JIRA/Confluence via API; chunk 400–800 tokens; embed (OpenRouter/OpenAI); upsert to Supabase `documents` table with pgvector column + metadata (path, source_type, updated_at). HNSW or IVFFlat index for search.

</div>

Q: BM25 fallback

<div class="a">

When semantic search returns low scores (new symbol names, rare tokens), combine with BM25 keyword search — hybrid retrieval improves recall on exact identifiers like class names.

</div>

Q: Eval harness

<div class="a">

Golden set: PR fixtures with expected findings (file, line, category). Run pipeline in CI; compare predicted vs expected; precision = TP/(TP+FP), recall = TP/(TP+FN). Gate merge if below thresholds (e.g. recall ≥ 0.9, precision ≥ 0.65 — verify in your repo README).

</div>

Q: GitHub Actions integration

<div class="a">

`pull_request` trigger → checkout → setup Python → run indexer if needed → run reviewer → post comments via `gh api` or PyGithub → upload SARIF or JSON report artifact.

</div>

Q: vs Barclays RAG

<div class="a">

Barclays: ops incidents, internal runbooks, human executes fixes. CodeReviewer: developer workflow, public GitHub, multi-agent + eval-driven quality, posts automated review comments (still not auto-merge).

</div>

Advanced: reducing false positives, cost, latency

<div class="inner">

Q: Too many false positives?

Raise confidence threshold; ensemble voting; require two agents agree; few-shot examples in prompt; expand golden set with false positive cases.

Q: LLM cost?

Cache embeddings; retrieve only changed files + neighbors; smaller model for pattern agent; batch API calls.

</div>

</div>

<div id="skills-deep" class="section">

## Technical Skills — Deep Interview Prep

### Java

Q: HashMap vs ConcurrentHashMap?

<div class="a">

HashMap not thread-safe; ConcurrentHashMap lock-striped buckets, safe for concurrent reads/writes; use CHM for shared cache of in-flight file locks across async workers.

</div>

Q: synchronized vs ReentrantLock?

<div class="a">

synchronized simpler, JVM intrinsic lock; ReentrantLock explicit, tryLock with timeout, fair ordering — use when you need timed lock attempt for deadlock avoidance.

</div>

Q: ExecutorService types?

<div class="a">

Fixed thread pool for vendor workers; bounded queue; CallerRunsPolicy backpressure; always shutdown hook on app stop.

</div>

### Spring Boot / MVC / JPA

Q: N+1 problem?

<div class="a">

Loading parent entities then lazy-loading each child → N+1 queries. Fix: `@EntityGraph`, JOIN FETCH in JPQL, or DTO projection.

</div>

Q: Lazy vs eager?

<div class="a">

Default lazy for @ManyToOne — good for performance; eager risks loading entire graph; use lazy + fetch join where needed.

</div>

### SQL (Oracle / MySQL)

Q: Index when?

<div class="a">

Columns in WHERE/JOIN — `account_id`, `(business_date, status)`. Trade-off: write slowdown, storage.

</div>

Q: Oracle vs MySQL differences (mention if asked)

<div class="a">

Oracle: ROWNUM, sequences, PL/SQL (don’t claim PL/SQL on resume). MySQL: LIMIT, auto_increment. Use ANSI SQL in interview unless they specify dialect.

</div>

### Kafka, Linux, TWS

See bullets 5 and 1. Linux debugging: `journalctl -u integration`, `tail -f application.log | grep correlationId`, `ps aux | grep java`, `netstat/ss` for port, exit codes 0=success for TWS.

### Concepts

| Concept | One-liner |
|----|----|
| Microservices | Your app = modular monolith with clear boundaries; bank may have many services — yours integrates |
| HLD | Boxes, arrows, trust zones, NFRs |
| LLD | Tables, APIs, algorithms, error codes |
| SOLID | Maintainable OOP — see bullet 4 |
| Agile/Scrum | 2-week sprints, standups, retros, Jira stories, demo to PO |

</div>

<div id="coding" class="section">

## Coding Round Prep (Java / SQL)

IB backend may ask easy–medium LeetCode + SQL. Practice explaining aloud.

### Java patterns relevant to your work

- **HashMap** — two sum, frequency count
- **Queue / BFS** — level-order (batch dependency levels like TWS)
- **Retry with backoff** — implement exponential backoff function
- **Thread pool** — process list of files with fixed parallelism
- **Idempotency** — detect duplicate eventIds in stream

### SQL drills

\
-- 2nd highest salary (classic)\
SELECT MAX(salary) FROM employees WHERE salary \< (SELECT MAX(salary) FROM employees);\
\
-- Duplicate detection (idempotency)\
SELECT event_id, COUNT(\*) FROM kafka_processed GROUP BY event_id HAVING COUNT(\*) \> 1;\
\
-- Running total per account per day\
SELECT account_id, business_date, amount,\
       SUM(amount) OVER (PARTITION BY account_id ORDER BY business_date) AS running_total\
FROM transactions;\
  

</div>

<div id="system-design" class="section">

## System Design Practice (tailored to your experience)

### Prompt: Design payment status notification system

<div class="a">

**Requirements:** integrate vendor updates; notify audit/reporting; don’t block batch; at-least-once delivery.\
**Design:** Spring Boot service → DB state machine → Kafka topic keyed by accountId → audit consumer group + reporting consumer group → idempotency store → DLQ → metrics on lag and failure rate.\
**Deep dive:** outbox pattern, partition count, replay for audit, PII not in events (tokens only).

</div>

### Prompt: Design batch file processor

<div class="a">

**Requirements:** 10K files/night, vendor rate limit, per-file retry.\
**Design:** ingest API or directory watcher → queue → worker pool → JPA state per file → aggregate completion API for scheduler → replay API for failures.\
**Scale:** horizontal workers, DB connection pool sizing, backpressure.

</div>

</div>

<div id="behavioral" class="section">

## Behavioral & IB-Specific

### Why Interactive Brokers?

<div class="script">

**Sample answer** “IB builds transactional backend systems where correctness and uptime matter — that matches what I’ve done in banking integration. I work in Java on Linux with SQL and production tooling daily. I’m excited to apply that discipline to brokerage technology and learn the trading domain — order flow, market data, or back-office — while contributing immediately on backend services.”

</div>

### STAR stories — prepare 3

| Story | Use for |
|----|----|
| Tokenization HLD sign-off under regulatory deadline | System design, leadership, pressure |
| 60% throughput + false-success bug fix | Technical depth, impact, correctness |
| Month-end replay API recovery | Ops partnership, ownership, calm under fire |
| RAG tool adoption — skeptics on LLM | Innovation, measurement, safety |
| OSS PR merged after review iterations | Collaboration, learning, persistence |

### Questions to ask IB

- What does this team own in the trading/back-office stack?
- Java/Spring on Linux — deployment model (bare metal, K8s, both)?
- Oracle vs MySQL in your services?
- On-call rotation and incident culture?
- What does success look like in first 6 months?

### Red flags — never say

- “I worked on trading systems at Barclays”
- “TWS is Trader Workstation”
- “I built the whole migration alone”
- “Kafka gives exactly-once everywhere” (unless true)
- “LLM auto-fixes prod” (you said human-in-the-loop — keep consistent)

</div>

<div id="checklist" class="section">

## Final checklist

### Must draw from memory

- Tokenization: DPaaS → DTU → AWS + recon loop
- Async worker: file → thread pool → JPA state → fail on non-2xx
- Kafka: topic, key, consumer groups, outbox
- Replay API: FAILED only, idempotency, audit log
- Jenkins stages + Veracode purpose
- RAG: chunk, embed, retrieve, cite, human executes
- CodeReviewer LangGraph parallel agents
- Clarify IBM TWS vs Trader Workstation

### All resume numbers

4 years · 80+ workflows · 5,000+ daily txn · 100K+ accounts · 60% throughput · 25% release · 40% MTTR · 20% Samsung accuracy · 10K+ sensor points · 3 datasets

Source: Akshat_Anand_Resume_v2.tex. Customize stories with your real dates, ticket IDs, and team names before interviewing.

</div>

</div>
