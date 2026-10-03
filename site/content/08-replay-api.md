# Batch replay API

**Resume line:** You built a Spring Boot API for batch replay and step-level recovery after TWS failures. Ops can re-trigger failed payment-load steps without manual database edits.

---

## 1. Say this first (30 seconds)

> When a TWS step fails, ops must not edit the database by hand. I built a replay API. The API requeues failed steps with auth and an audit log.

---

## 2. Words you must know

| Word | Meaning |
|------|---------|
| Replay | Controlled re-run of a failed step |
| Manual DB edit | Direct SQL change by a human. Unsafe |
| Audit log | Who replayed what, and when |
| Idempotent replay | A second replay does not create a duplicate vendor side effect |

> **ELI5:** Give ops a keycard door with a log. Do not give a screwdriver for the lock.

---

## 3. How it works

```
Ops → POST /ops/replay/{stepId}
   → authZ check
   → allow only FAILED (or other eligible states)
   → set PENDING, increase attempt_count
   → write audit row
   → worker picks up the step again
```

Safety rails:

- Do not replay SUCCESS by mistake.
- Cap attempts. Escalate after the max.
- Vendor calls must stay safe to retry.

---

## 4. Say this (2 minutes)

> Month-end failures blocked downstream TWS jobs. Manual SQL updates were unsafe and had no audit trail. I exposed a Spring Boot replay API for failed payment-load steps. The API checks authorization, accepts only eligible FAILED steps, requeues work, increments attempt count, and writes an audit record. This shortens recovery time and keeps a clear trail for ops and compliance.

---

## 5. Top questions

<details>
<summary>What if replay duplicates a vendor post?</summary>

Require idempotent vendor operations or dedupe keys. Reject replay when the state is unsafe.

</details>

<details>
<summary>How do you test it?</summary>

Test state transitions. Deny replay of SUCCESS. Assert the audit row. Assert 403 without auth.

</details>

<details>
<summary>How is this different from a TWS restart?</summary>

TWS can restart jobs. App-level replay applies business safety rules that TWS does not know.

</details>

---

## 6. Blind check

- [ ] List four safety rails.
- [ ] Speak the 30-second answer.
- [ ] Explain why manual DB edits are bad.

Next: [Jenkins, JAR, Veracode](#/09-cicd-jenkins)
