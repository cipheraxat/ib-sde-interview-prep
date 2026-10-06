# Async and throughput

**On your resume:** Batch work got about **60% faster**. You stopped calling the vendor one-by-one inside the night job. Workers handle **one file each**. The database stores whether the step succeeded. A timeout is a **failure**, not a success.

**In the night:** This is the bug inside the middle service. The batch was slow, and a timeout could be stored as success. Say this rule here. The other pages point back to it.

---

## STAR — the story

### S — Situation (what the world looked like)

Every night the bank runs a batch of payment files. That batch has a finish time. Morning operations, and the next job in the chain, need the result before people start the business day. If the batch is still running at that time, the night is already a failure even when every single call would have worked eventually.

The old code did the work **one file at a time**, and it **stood still** while it waited:

1. Pick up file 1.
2. Call the vendor.
3. Wait until that call comes back. Do nothing else.
4. Only then pick up file 2.

The waiting adds up. Picture a small example, not a resume number: 2,000 files, and each vendor call takes about 2 seconds. One worker needs about 4,000 seconds, which is a bit more than an hour, and during that whole hour it is mostly waiting on the network. A real end-of-day or month-end file is much bigger than a normal night, so the same one-by-one wait pushes the job past the time morning needs it.

There was a second problem, and it was worse than being slow. Sometimes the vendor call **timed out**: your service stopped waiting, but it did not know whether the vendor had finished the work. The old code could still save that step as **SUCCESS**. The next job in IBM TWS believed the step was done and moved on. The scheduler looked happy. The payment data was not. That is a **false success**.

### T — Task (what you were asked to do)

Finish the **same amount of work** faster, and **never mark a step successful unless you know it succeeded**.

### A — Action (what you actually changed)

You stopped doing the vendor calls inside one long waiting loop.

1. The scheduler still starts the job. That part did not go away.
2. The job loads the files (or work items) and hands them to a **fixed pool of workers**. “Fixed” matters: if you start unlimited threads, you can knock over the vendor or your own database.
3. **One file is one task.** One bad file becomes FAILED. The other files in the pool continue.
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

On a **comparable** volume (same kind of night, same input size), throughput rose by about **60%**. The same files finished sooner, so the batch was done before morning needed it. The important quality result is separate from speed: a timeout is **FAILED**, so the next job does not run on a lie.

Write your real before-and-after numbers in [Personal facts](#/02a-personal-facts) before the interview.

---

## Say it in about 60 seconds

> Every night we had to finish a batch of payment files before morning. The old job called the vendor one file at a time and waited for each call to come back before it started the next file. On a big end-of-day file, that waiting made the job still be running when morning needed the result. Worse, if a call timed out, the step could be saved as success, and the next scheduled job would trust that. I changed it to a small pool of workers, one file each, with the status saved in the database. If the call times out or the vendor does not return success, the step is FAILED. On the same volume, throughput went up about 60 percent, and failed files are replayed through an API instead of a manual database edit.

---

## If they ask more

| They ask | You say |
|----------|---------|
| Won’t many workers overload the vendor? | The pool size is capped. If the vendor says “slow down” (429) or returns 5xx, you back off. If errors spike, you stop calling for a bit. |
| Why not just start more scheduler jobs? | The scheduler can start jobs, but it does not know your rule “timeout means failed,” and it does not share one vendor speed limit cleanly. The application does. |
| What is stored? | File or step id, status, how many attempts, the error text, the vendor reference, the business date. |

## If they ask for code

The pool size is a number you chose. Eight is an example, not a resume figure. One file is one task. The database row is saved before the call and again after it. The vendor call sits between those two saves, so a database connection is not held for the whole wait.

```java
ExecutorService pool = Executors.newFixedThreadPool(8);

List<Future<?>> futures = new ArrayList<>();
for (Path file : files) {
    futures.add(pool.submit(() -> processOneFile(file)));
}
for (Future<?> future : futures) {
    future.get(); // the night job ends only after every file has a status
}

void processOneFile(Path file) {
    stepRepo.mark(file, Status.IN_PROGRESS); // short transaction, then it commits
    try {
        vendorClient.post(file);             // connect timeout and read timeout on this client
        stepRepo.mark(file, Status.SUCCESS);
    } catch (ResourceAccessException | VendorNon2xx e) {
        stepRepo.mark(file, Status.FAILED);  // timeout and non-2xx are both FAILED
    }
}
```

If they ask “why not `newCachedThreadPool`?”: that pool grows without a cap and can overwhelm the vendor. `newFixedThreadPool` keeps the cap.

## Blind check

- [ ] Explain the problem as both “too slow” and “false success”
- [ ] Explain one file per worker and why the pool is limited
- [ ] Say the 60% line with “same volume”
- [ ] Write the fixed pool and `processOneFile`, including where the status is saved

Next: [Spring Boot refactor](#/06-spring-refactor)
