# Replay API

**On your resume:** You built an API so operations can **run a failed batch step again** without someone opening the database and editing rows by hand.

**In the night:** When the row says FAILED, this is how a person runs that step again. Those FAILED rows are the timeout rule from the [async story](#/05-async-throughput).

---

## STAR — the story

### S — Situation (what the world looked like)

Night jobs fail. A file is late, the vendor times out, or a mapping is wrong. After the async change, those steps sit in the database as **FAILED**. That is the same rule as the [async story](#/05-async-throughput), and it is the correct outcome. The next problem is **how you fix them**.

The old shortcut was a person with database access running an `UPDATE` to flip the status back, or re-running a mystery script. That is dangerous. There is no record of who did it. There is no check that the step is actually allowed to run again. Two people can “fix” the same payment and post it twice. And the next night, nobody can explain what changed.

### T — Task (what you were asked to do)

Give operations a **supported way** to retry a failed step: an API, with rules, so the database is not the user interface.

### A — Action (what you actually built)

The API is small on purpose.

1. Someone calls something like `POST /replay` with the step id or the file id, and a reason.
2. The service loads the row. It only continues if the status is **FAILED** (or another status you explicitly allow). A step that is already **SUCCESS** is refused. You do not replay a payment that already went through.
3. It checks whether a second run is safe. If a second run would create a second payment, the API refuses. If the vendor treats a repeat of the same payment as the same payment, the API allows the replay.
4. It sets the row back to a runnable state and runs the **same code path** the night job uses. There is not a second, secret “ops version” of the logic.
5. It writes an **audit row**: who asked, when, which step, and why. That replaces the invisible SQL update.
6. If the replay fails again, the status goes back to FAILED with the new error. It does not get forced to SUCCESS.

```
Ops calls the API
  → is this step FAILED?
  → is a second run safe?
  → run the normal worker code
  → save the new status and who requested it
```

### R — Result (what changed)

A failed file can be retried in a controlled way. People stop editing production tables to “unstick” a batch. Every replay has a name and a time attached to it.

---

## Say it in about 60 seconds

> After we started storing real FAILED statuses, ops still needed a way to try again. Before, someone would update the database by hand, with no record and a risk of posting the same payment twice. I added a replay API. It only accepts a failed step, it runs the same code the night job uses, and it stores who requested it and why. If the step already succeeded, the API says no.

---

## If they ask more

| They ask | You say |
|----------|---------|
| Why not just re-run the whole night job? | That would redo work that already succeeded. Replay targets the failed step. |
| What if two people click replay? | The status check and the database update happen together so only one run proceeds. |
| What do you store? | Step id, requester, time, reason, attempt count, result. |

## Blind check

- [ ] Explain the danger of a manual database edit
- [ ] Say which statuses the API will accept
- [ ] Say that replay uses the same code as the night job

Next: [Jenkins and releases](#/09-cicd-jenkins)
