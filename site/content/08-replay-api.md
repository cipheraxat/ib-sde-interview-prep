# Batch replay API (Barclays bullet 6)

## Resume bullet

> Built an internal Spring Boot service for **batch replay** and **step-level recovery** after TWS job failures, exposing APIs for operations to re-trigger failed payment-load steps **without manual database intervention**.

## Teach first: why replay exists

Batch systems fail. Vendor blips, bad files, timeouts, dependency outages.

Bad ops practice: engineer opens DB and flips `status='SUCCESS'` or requeues by hand.

Problems with manual DB edits:

- No audit trail of who did what
- Easy to break invariants
- Not idempotent
- Doesn’t scale at month-end

Good practice: a **controlled recovery API**.

> **ELI5:** Instead of picking a lock with a screwdriver (DB edit), give ops a keycard door (API) that logs entry and only opens the right rooms (FAILED steps).

## What the API should do

1. Authenticate/authorize ops users  
2. Accept step id / file id / business date filters  
3. Verify current status is FAILED (or eligible)  
4. Reset to PENDING / enqueue retry  
5. Increment attempt_count  
6. Write audit log  
7. Return clear result  

```
Ops UI / curl
   → POST /ops/replay/{stepId}
   → validate FAILED
   → mark PENDING + audit row
   → worker picks up again
```

## Idempotency & safety rails

- Don’t replay SUCCESS accidentally  
- Don’t double-run IN_PROGRESS without fencing  
- Cap attempts; escalate to manual review after N  
- Ensure vendor calls are safe to retry (idempotency keys)  

## Why interviewers love this bullet

It shows:

- Production ownership
- Empathy for ops
- Security/audit awareness
- Understanding of batch recovery (very IB/back-office relevant)

## 30-second pitch

> When TWS steps failed, ops shouldn’t edit databases. I built a Spring Boot replay API that safely re-queues failed payment-load steps with authorization and audit logging, unblocking downstream jobs faster and more safely.

## Interview Q&A

<details>
<summary>What if replay causes duplicates at vendor?</summary>

Require idempotent vendor operations or dedupe keys; store vendor correlation ids; reject replay when unsafe.

</details>

<details>
<summary>How do you test it?</summary>

Integration tests for state transitions; deny replay of SUCCESS; audit row created; authz failures return 403.

</details>

<details>
<summary>How does this relate to TWS restart?</summary>

TWS can restart jobs, but app-level step replay is finer-grained and encodes business safety rules TWS doesn’t know.

</details>

Next: [Jenkins, JAR, Veracode](#/09-cicd-jenkins)
