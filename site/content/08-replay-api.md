# Batch replay API

**Resume:** Spring Boot **batch replay / step recovery** after TWS failures. Ops re-triggers failed payment-load steps **without manual DB edits**.

---

## 1. Say this first (30s)

> Failed TWS steps must not be fixed with hand SQL. Replay API requeues FAILED steps with authZ and audit.

---

## 2. Words

| Word | Meaning |
|------|---------|
| Replay | Controlled requeue of a failed step |
| Manual DB edit | Direct SQL by human — no authZ/audit/invariants |
| Audit log | who / what / when / why |
| Idempotent replay | Second call does not double vendor side effect |
| Fencing | Do not replay IN_PROGRESS without rules |

> **ELI5:** Keycard door with log — not a screwdriver on the lock.

---

## 3. How it works

```
Ops → POST /ops/replay/{stepId} (+ auth)
  → allow only FAILED (eligible)
  → PENDING; attempt_count++; audit row
  → worker runs again (timeouts; FAILED on non-2xx)
```

| Rail | Rule |
|------|------|
| AuthZ | Ops role / service account only |
| State guard | Reject SUCCESS; careful on IN_PROGRESS |
| Attempts | Cap → MANUAL_REVIEW / escalate |
| Vendor | Idempotency key / dedupe |
| Audit | Immutable who/when/step/result |
| Observability | metrics on replay rate + fail-after-replay |

**Why interviewers like it:** production ownership, ops empathy, audit, batch recovery (IB back-office relevant).

---

## 4. Say this (2 min)

> Month-end FAILED steps blocked downstream TWS. Hand SQL was unsafe. Replay API: authorize, accept eligible FAILED only, requeue, bump attempts, audit. Shortens unblock time; keeps compliance trail; pairs with async worker failure semantics.

---

## 5. Top questions

<details><summary>Duplicate vendor post?</summary>
Idempotent vendor ops or dedupe keys; refuse unsafe replay.
</details>
<details><summary>Tests?</summary>
Transition tests; deny SUCCESS replay; audit created; 403 without auth.
</details>
<details><summary>vs TWS restart?</summary>
TWS restarts jobs; app replay encodes business eligibility TWS lacks.
</details>
<details><summary>Partial batch success?</summary>
Replay only failed step_ids; do not reprocess SUCCESS files.
</details>

---

## 6. Blind check

- [ ] Four safety rails
- [ ] Why DB edits are bad
- [ ] Speak 30s cold

Next: [Jenkins, JAR, Veracode](#/09-cicd-jenkins)
