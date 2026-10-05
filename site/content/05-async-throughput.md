# Async and throughput

**Resume:** **+60%** batch throughput. Sync vendor REST inside TWS jobs → **async workers** (one file per task). State in **SQL/JPA**. Timeout or non-2xx → **FAILED**.

---

## STAR — the story

### S — Situation (the problem)

TWS jobs called the vendor **one record at a time and waited**. Each slow call blocked the next. End-of-day windows ran long. Worse: a **timeout** was sometimes treated as success. Downstream jobs then ran on a **false SUCCESS**. The data was wrong and the scheduler thought the step was done.

### T — Task (your job)

Make the same nightly volume finish faster **without lying about success**.

### A — Action (what you did)

1. Replace the sync loop with a **fixed thread pool** (bounded so you do not flood the vendor).
2. **One file = one task.** A bad file does not corrupt another file’s memory.
3. Persist step state in SQL: `PENDING → IN_PROGRESS → SUCCESS` or `FAILED`.
4. Set connect and read **timeouts**.
5. **Timeout or non-2xx → FAILED.** SUCCESS only when success rules are explicit.
6. Do **not** hold a database transaction open for the whole HTTP wait.
7. Failed steps go to the **replay API** later. They are not fixed with hand SQL.

```
TWS starts the job
  → load files
  → bounded workers
       IN_PROGRESS → vendor call
       success rules → SUCCESS
       timeout / non-2xx → FAILED
  → tell TWS the real outcome
```

> **ELI5:** One cashier who waits on every card is sync. Several cashiers plus a board of done/failed tickets is async.

### R — Result

About **60%** higher throughput on a **comparable** input volume (records per hour or wall-clock). False SUCCESS stopped. Recovery is a replay, not a database edit.

Fill exact before/after numbers in [Personal facts](#/02a-personal-facts).

---

## Say the STAR in 60 seconds

> Vendor calls inside overnight jobs were synchronous, so one slow call blocked the batch. Timeouts could be marked success, and the next job would trust that lie. I moved the work to a bounded worker pool, one file per task, with status in SQL. Timeout or a non-2xx response marks FAILED. Throughput rose about 60% on the same volume, and failed steps are replayed through an API.

---

## If they go deeper

| Column | Why |
|--------|-----|
| file / step id | What ran |
| status | PENDING, IN_PROGRESS, SUCCESS, FAILED |
| attempt_count | How many tries |
| last_error | Why it failed |
| vendor_ref | Correlation id |

| Question | Answer |
|----------|--------|
| Vendor overload? | Cap the pool. Back off on 429/5xx. Open a circuit when errors spike |
| Why not only more TWS jobs? | The app owns isolation, state, and the shared vendor quota |
| Thread safety? | One file per task. Little shared mutable state |

<details>
<summary>How does TWS learn about failure?</summary>
If a critical step is FAILED, the job result is failure. Downstream jobs do not start.
</details>

## Blind check

- [ ] Tell S-T-A-R without notes
- [ ] Explain false SUCCESS and the fix in two sentences
- [ ] Say why the DB transaction does not cover the HTTP call

Next: [Spring Boot refactor](#/06-spring-refactor)
