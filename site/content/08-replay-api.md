# Batch replay API (Barclays bullet 6)

## Resume bullet

> Built an internal Spring Boot service for **batch replay** and **step-level recovery** after TWS job failures, exposing APIs for operations to re-trigger failed payment-load steps **without manual database intervention**.

---

## The whole story

In batch payment platforms, failure is normal: vendor blips, bad files, timeouts, dependency outages, month-end load spikes.

What must **not** be normal is this ops anti-pattern:

> Engineer opens the database, flips `status = 'SUCCESS'`, or hand-inserts rows, or re-runs unclear scripts — with no audit trail.

That’s how you get duplicate posts, skipped controls, and “who changed production?” mysteries.

After we made step state first-class (async workers + JPA statuses), I built a **controlled replay API**:

1. Ops authenticates to an internal endpoint.  
2. They request replay for a specific FAILED step / file / business-date filter.  
3. API verifies the step is eligible (usually FAILED, not SUCCESS/IN_PROGRESS without fencing).  
4. It resets to PENDING (or enqueues), increments `attempt_count`, writes an **audit log** (who/when/why).  
5. Workers pick it up again with the same idempotency rules as first-time processing.  
6. Downstream TWS dependencies can proceed once the step is truly SUCCESS.

This is one of the most “IB-shaped” stories on your resume: **production ownership + safety rails**.

---

## 30-second pitch

> When TWS payment-load steps failed, ops shouldn’t edit the database. I built a Spring Boot replay API that safely re-queues failed steps with authorization and audit logging, so we can recover month-end failures without manual DB intervention or silent duplicates.

---

## 2-minute interview script

> “Batch failures used to create pressure to ‘just fix the row in the DB’ so downstream TWS jobs could continue. That’s unsafe — no authorization story, weak audit, easy to break invariants, and easy to double-submit to the vendor.  
>  
> Because we already persisted step state — FAILED as a real status — I exposed an internal replay API. Ops calls something like replay-by-step-id. The service checks eligibility, records who requested the replay, bumps attempt count, and puts the step back to PENDING for workers.  
>  
> The worker path is the same code path as normal processing, including idempotency keys toward the vendor and the rule that timeout/non-2xx marks FAILED again. After N attempts we stop auto-looping and escalate to manual review.  
>  
> Net effect: faster unblocks during incidents, safer operations, and a clear trail for audit — which matters in a bank.”

---

## Teach the concepts

### Why APIs beat DB edits

| Manual DB edit | Replay API |
|----------------|------------|
| No authz model | RBAC / service auth |
| No audit | Who/when/why logged |
| Easy invariant breaks | Eligibility checks |
| Unclear retry semantics | Same worker code path |
| Scary under stress | Runbook-friendly |

> **ELI5:** Screwdriver on the lock vs a keycard door that logs every entry.

### Eligibility rules (say these)

- Replay SUCCESS? → reject  
- Replay IN_PROGRESS? → reject or carefully fence  
- attempt_count ≥ max? → MANUAL_REVIEW, don’t silent loop  
- Vendor operation must be safe to retry (idempotency)

### Flow

```
Ops (runbook / curl / internal UI)
   → POST /ops/replay/{stepId}
   → authz + validate FAILED
   → audit row
   → status=PENDING, attempt_count++
   → worker processes again
   → SUCCESS unlocks downstream TWS deps
```

### Relationship to TWS restart

TWS can restart jobs, but it doesn’t know your business safety rules. App-level step replay is **finer-grained** and encodes “only FAILED,” “audit,” “max attempts,” “idempotent vendor calls.”

---

## Deep interview Q&A

<details>
<summary>What if replay duplicates a vendor side effect?</summary>

Require idempotent vendor operations or pass an idempotency key; store vendor correlation ids; reject replay when prior SUCCESS already recorded a vendor ref; design APIs so retries don’t create two payments.

</details>

<details>
<summary>How do you test it?</summary>

Tests for: SUCCESS rejected; FAILED accepted; audit written; 403 without role; attempt_count increments; worker eventually SUCCESS on stubbed vendor.

</details>

<details>
<summary>What do you log for audit?</summary>

Actor id, step id, business date, previous status, new status, reason/comment, timestamp, correlation id. Enough to answer “who replayed what, when.”

</details>

<details>
<summary>How does this help month-end?</summary>

Month-end concentrates failures. Step-level replay unblocks downstream streams without reprocessing entire successful workloads or waiting on a DBA.

</details>

<details>
<summary>Security considerations?</summary>

Internal-only network; strong authn/authz; no broad “replay anything” admin god-mode without controls; rate-limit; never expose in public internet.

</details>

---

## Practice checklist

- [ ] Tell the anti-pattern (DB edit) vs API story  
- [ ] List eligibility rules  
- [ ] Explain idempotency link to vendor  
- [ ] Mention audit fields  
- [ ] Connect to async worker state machine  

**Next:** [Jenkins, JAR, Veracode](#/09-cicd-jenkins)
