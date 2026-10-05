# Batch replay API

**Resume:** Spring Boot API so ops can **re-run failed payment-load steps** after a TWS failure **without editing the database by hand**.

---

## STAR — the story

### S — Situation (the problem)

A failed step **blocks every TWS job after it**. At month-end that stops the night. The workaround was an engineer running **SQL by hand** to flip status or requeue a row. That has no permission check, no audit, and it is easy to mark a bad step SUCCESS or to send the same payment twice.

### T — Task (your job)

Give operations a **safe button**: re-trigger only failed steps, with a log of who did it.

### A — Action (what you did)

```
Ops calls POST /ops/replay/{stepId}
  → must be an authorized ops user
  → step must be FAILED (not SUCCESS)
  → set PENDING, add 1 to attempt_count
  → write an audit row (who, when, which step)
  → worker runs the file again
```

| Safety rail | Why |
|-------------|-----|
| Auth | Random callers cannot replay |
| Only FAILED | Do not redo a step that already succeeded |
| Attempt cap | After N tries, stop and escalate |
| Idempotent vendor call | A second try must not double-post |
| Audit row | Compliance can see who replayed what |

> **ELI5:** A keycard door with a log. Not a screwdriver on the lock.

### R — Result

Ops unblock a failed payment-load step without a DBA. The trail is in the audit table. Downstream TWS jobs can start again after a real SUCCESS.

---

## Say the STAR in 60 seconds

> A failed batch step blocked the rest of the night, and the fix was hand-edited SQL. That is unsafe and has no audit. I built a replay API. Ops can requeue a FAILED step only. The API checks permission, increments the attempt count, and writes who did it. The worker runs the file again. A successful step cannot be replayed by accident.

---

## If they go deeper

| vs TWS restart | App replay |
|----------------|------------|
| TWS can restart a job | The API knows business rules: only FAILED, attempt cap, vendor idempotency |

<details>
<summary>What if replay would duplicate a vendor post?</summary>
Refuse the replay, or send the same idempotency key so the vendor treats it as the same request.
</details>

<details>
<summary>How do you test it?</summary>
SUCCESS replay returns an error. FAILED replay creates an audit row. No auth returns 403.
</details>

## Blind check

- [ ] Tell S-T-A-R without notes
- [ ] Name four safety rails
- [ ] Say why hand SQL is the problem

Next: [Jenkins, JAR, Veracode](#/09-cicd-jenkins)
