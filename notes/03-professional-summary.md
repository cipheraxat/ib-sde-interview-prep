# Professional Summary

Software Development Engineer II with 4 years at Barclays owning back-end Java / Spring Boot web services on Linux. Strong in Oracle/MySQL SQL, Unix Shell, MVC, data structures, system design, and production troubleshooting.

**30 seconds** Backend engineer focused on Java Spring Boot services on Linux. Integration-heavy work: REST APIs, batch orchestration, SQL reconciliation, Kafka, and production recovery tooling — with emphasis on reliability and safe releases.

**2 minutes — “Tell me about yourself”** “I’m Akshat, SDE II at Barclays Pune, four years on a payment integration platform. The big program was migrating a legacy Unix batch environment to a vendor SaaS on AWS. My work sits in the integration layer: Spring Boot services that IBM Workload Scheduler invokes, calling vendor REST APIs, persisting state in MySQL, and reconciling with Oracle reporting where needed.

Three wins I’m proud of: first, designing the tokenization path so PII never lands in plaintext in the vendor cloud — DPaaS on-prem, DTU for encrypted transit, SQL recon over 100K accounts. Second, raising batch throughput about 60% by moving synchronous vendor calls to async workers with strict failure semantics. Third, operational tooling — Kafka to internal audit, a replay API for failed batch steps, and a RAG-based ops assistant that cut MTTR about 40%.

Outside work I contribute to VS Code, Playwright, Kubernetes, and Apple Pkl, and I built CodeReviewer Agent — a LangGraph multi-agent PR reviewer with RAG and CI evals. I’m targeting backend Java roles where production correctness matters; IB’s stack and domain are a strong fit for what I’ve been doing at scale.”

**Q:** What does “owning” backend services mean in practice?

On-call for your service’s failures; writing and reviewing code for your modules; defining API contracts with ops and downstream teams; owning Jenkins pipeline and Veracode for your artifact; writing runbooks; participating in design reviews for features you deliver. You don’t own the entire 80-workflow program — you own *your* services and designs within it.

**Q:** MVC — walk through a request in your service.

1.  **Controller** (`@RestController`): HTTP POST `/batch/process-file` — validates DTO, returns 202/500.
2.  **Service**: business logic — parse file, call vendor client, update step state, emit Kafka event.
3.  **Repository** (`JpaRepository`): persist `BatchStepExecution` entity.
4.  **Cross-cutting**: exception handler → JSON error; logging with correlation ID; metrics.

**Q:** “Data structures” on a backend resume — give a real example.

In tokenization recon: `Map` for in-memory batch windows; DB B-tree indexes on `account_id` for O(log n) lookups; queue of failed records for retry worker; enum state machine for step status. In async workers: thread-safe `ConcurrentHashMap` for in-flight file locks; bounded `BlockingQueue` for work distribution.

Production troubleshooting — full incident walkthrough template

**Situation:** Month-end batch; TWS job stream blocked at step 14; 200 files pending.

**Investigation:**

1.  TWS job log → which step failed, exit code, start/end time.
2.  Spring Boot app log → grep `correlationId` or file name.
3.  SQL: `SELECT * FROM batch_step_execution WHERE status='FAILED' AND business_date=?`
4.  Vendor API status page / support ticket if 5xx spike.

**Resolution:** Root cause (e.g. vendor timeout); replay failed files via replay API; verify recon counts; unblock downstream TWS dependencies.

**Follow-up:** Lower timeout threshold alert; add Kafka event for audit; document in runbook.
