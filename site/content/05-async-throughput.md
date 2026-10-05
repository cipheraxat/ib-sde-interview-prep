# Async and throughput

**On your resume:** Batch work got about **60% faster**. You stopped calling the vendor one-by-one inside the night job. Workers handle **one file each**. The database stores whether the step succeeded. A timeout is a **failure**, not a success.

---

## STAR — the story

### S — Situation (what the world looked like)

The night jobs already called the vendor. The problem was **how** they called. The job picked up a record, called the vendor, and **waited** until that call finished before it touched the next record. If each call takes a fraction of a second and you have a large file, the clock runs out. End-of-day and month-end were the painful windows, because that is when the files are biggest.

There was a worse bug than slowness. Sometimes the call **timed out**. The code did not know if the vendor had done the work. In a bad version of this, the step was still marked **SUCCESS**. The next job in the IBM TWS chain believed the work was done and moved on. That is called a **false success**: the scheduler is happy, the data is not.

### T — Task (what you were asked to do)

Finish the **same amount of work** faster, and **never mark a step successful unless you know it succeeded**.

### A — Action (what you actually changed)

You stopped doing the vendor calls inside one long waiting loop.

1. The scheduler still starts the job. That part did not go away.
2. The job loads the files (or work items) and hands them to a **fixed pool of workers**. “Fixed” matters: if you start unlimited threads, you can knock over the vendor or your own database.
3. **One file is one task.** If one file is bad, it does not scramble the memory of another file.
4. Before the call, the database row says `IN_PROGRESS`. After a real success it says `SUCCESS`. After a timeout or a non-success HTTP code it says `FAILED`.
5. The HTTP client has a **connect timeout** and a **read timeout**. You do not wait forever.
6. You do **not** hold a database transaction open while you wait on the vendor. That would pin a database connection for the whole slow call. You save state, call the vendor, then save the outcome.
7. Failed files are fixed later through the **replay API**, not by someone editing the table by hand.

```
Night job starts
  → list of files
  → a small pool of workers
       each worker: one file, one vendor call, one database status
  → scheduler sees the real result
```

> **Simple picture:** One cashier who waits for every card machine is the old way. Several cashiers, with a board that says done or failed, is the new way. You still do not let a hundred cashiers hit the vendor at once.

### R — Result (what changed)

On a **comparable** volume (same kind of night, same input size), throughput rose by about **60%**. That means more records per hour, or less wall-clock time, not a made-up percentage. The important quality result is separate from speed: a timeout is **FAILED**, so the next job does not run on a lie.

Write your real before-and-after numbers in [Personal facts](#/02a-personal-facts) before the interview.

---

## Say it in about 60 seconds

> The night job called the vendor and waited for every call before the next one, so big files missed the window. Worse, a timeout could be stored as success, and the next scheduled job would trust that. I changed it to a small pool of workers, one file each, with the status saved in the database. If the call times out or the vendor does not return success, the step is FAILED. On the same volume, throughput went up about 60 percent, and failed files are replayed through an API instead of a manual database edit.

---

## If they ask more

| They ask | You say |
|----------|---------|
| Won’t many workers overload the vendor? | The pool size is capped. If the vendor says “slow down” (429) or returns 5xx, you back off. If errors spike, you stop calling for a bit. |
| Why not just start more scheduler jobs? | The scheduler can start jobs, but it does not know your rule “timeout means failed,” and it does not share one vendor speed limit cleanly. The application does. |
| What is stored? | File or step id, status, how many attempts, the error text, the vendor reference, the business date. |

## Blind check

- [ ] Explain the problem as both “too slow” and “false success”
- [ ] Explain one file per worker and why the pool is limited
- [ ] Say the 60% line with “same volume”

Next: [Spring Boot refactor](#/06-spring-refactor)
