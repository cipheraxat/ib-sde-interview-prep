# Batch replay

**On your resume:** You built an API so operations can run one failed batch step again. Nobody opens the database and edits the row by hand.

**In the night:** The [async story](#/05-async-throughput) leaves a row as **FAILED** when the vendor times out. This page is what happens next. A person retries that one step through an API.

---

## What the words mean

A **batch** is the night job. It does not serve one user click. It walks through a pile of payment files while the bank is closed.

A **step** is one unit inside that job. In this story, one step is one file. The database has one row per step. The row holds the file id, the status, and the last error.

**Replay** means run that step again. You do not restart the whole night. Files that already say **SUCCESS** stay finished.

The status on the row is the source of truth:

| Status | Meaning |
| --- | --- |
| `IN_PROGRESS` | A worker is calling the vendor right now |
| `SUCCESS` | The vendor finished this file. Do not run it again |
| `FAILED` | The call timed out or returned an error. This is the only status replay accepts |
| `REPLAYING` | Ops asked for another try, and a worker has taken the row |

```
FAILED  --ops calls POST /replay-->  REPLAYING  --worker-->  SUCCESS
                                         |
                                         +--> FAILED again, retry_count goes up
```

---

## STAR — the story

### S — Situation

Night jobs fail for ordinary reasons. The file arrives late. The vendor times out. A field mapping is wrong.

After the async change, those steps sit in MySQL as **FAILED**. That status is correct. The next problem is how a person fixes them before morning.

The old fix was a person with database access running an `UPDATE` to flip the status, or re-running a script nobody else could see. That is unsafe for three technical reasons:

1. There is no record of who changed the row.
2. Nothing checks that the step is allowed to run again. A **SUCCESS** row can be flipped and sent to the vendor a second time.
3. Two people can “fix” the same file. The vendor then receives two payments.

### T — Task

Give operations a supported way to retry a failed step. The database is not the user interface. The API is.

### A — Action

The API is small on purpose. It uses the same worker code the night job uses. There is no second, secret “ops” copy of the payment logic.

1. Ops calls `POST /api/v1/replay/{executionId}` with a reason. A list endpoint, `GET /api/v1/failures`, shows which rows are **FAILED**.
2. The service loads the row. It continues only when the status is **FAILED**. A **SUCCESS** row is rejected. You do not replay a payment that already went through.
3. The status change and the “am I still FAILED?” check are one database update, so two clicks cannot both win:

```sql
UPDATE step
SET status = 'REPLAYING', version = version + 1, retry_count = retry_count + 1
WHERE id = ? AND status = 'FAILED' AND version = ?;
```

If that update changes 0 rows, someone else already took the step. This request stops.

4. The worker calls the vendor with the **same business key** as the first attempt. If the vendor already applied that payment, it treats the repeat as the same payment and does not create a second one. That is idempotency. The API allows the replay only when the vendor gives you that guarantee. If a second call would create a second payment, the API refuses.
5. The service writes an audit row: who asked, when, which step, and why. That replaces the invisible SQL update.
6. The worker then writes **SUCCESS** or **FAILED**. A second failure stores the new error and increments `retry_count`. It is never forced to **SUCCESS**. After a small max, for example 3, the row goes to manual review instead of looping all night.

```
Ops calls POST /replay
  → row must still be FAILED
  → one UPDATE claims it (status becomes REPLAYING)
  → same worker code, same payment key
  → save SUCCESS or FAILED, plus who requested it
```

### R — Result

A failed file can be retried without a DBA. The whole night job is not run again, so successful files are not sent twice. Every replay has a person, a time, and a reason on it.

---

## Say it in about 60 seconds

> A batch is the night job that processes payment files. Each file is a row. After a vendor timeout that row is FAILED, which is what we want. Replay is an API that runs that one file again. It refuses a row that is already SUCCESS. The update only matches status FAILED, so two people cannot both claim it. The worker sends the same payment key, so the vendor does not post the money twice. We store who requested the replay and why.

---

## If they ask more

| They ask | You say |
| --- | --- |
| Why not re-run the whole night job? | IBM TWS would start the job from scratch and can resend files that already succeeded. Replay targets the failed row only. |
| Why not `UPDATE status = 'SUCCESS'`? | That lies about the vendor. The payment may never have been accepted. Replay runs the real call again. |
| What if two people click replay? | `UPDATE ... WHERE status = 'FAILED' AND version = ?` changes one row or zero rows. The second caller gets zero and stops. |
| What stops a double payment? | Only FAILED is eligible, the update claims the row, and the vendor call reuses the same business key. |
| What do you store? | Step id, requester, time, reason, attempt count, and the new status. |
| Who can call it? | Internal network only, bank login, a role such as `OPS_REPLAY`. It is not a public URL. |

## Blind check

- [ ] Say what a batch step is, in one sentence
- [ ] Say why a hand-written `UPDATE` is dangerous
- [ ] Say the API accepts only FAILED
- [ ] Say the `WHERE status = 'FAILED'` update, and why the second click loses
- [ ] Say replay uses the same worker code and the same payment key

Next: [Jenkins and releases](#/09-cicd-jenkins)
