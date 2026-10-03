# Async and throughput

**Resume:** **+60%** batch throughput. Sync vendor REST inside TWS → **async workers** (one file/execution). Step state in **SQL/JPA**. Timeout or non-2xx → **FAILED** (never false SUCCESS).

---

## 1. Say this first (30s)

> Sync vendor calls inside TWS jobs were slow and timeouts risked false SUCCESS. Bounded worker pool; one file per task; JPA step state; timeout/non-2xx → FAILED. Throughput +~60%.

---

## 2. Words

| Word | Meaning | Why it matters |
|------|---------|----------------|
| Sync | Caller waits | Latency stacks in batch |
| Async | Start work; track later | Parallel within bounds |
| Thread pool | Fixed reusable workers | Cap concurrency |
| Step state | Durable status in DB | Survive crash; drive TWS |
| False SUCCESS | Marked OK when unknown | Downstream runs on a lie |
| Backpressure | Slow intake when saturated | Protect vendor + DB |
| Circuit breaker | Stop calling sick dep | Fail fast in window |

> **ELI5:** One cashier = sync. Many cashiers + status board = async.

---

## 3. How it works

```
TWS kickoff → load files → fixed pool (size ≤ rate limit)
  worker: PENDING→IN_PROGRESS → HTTP(timeouts) → SUCCESS | FAILED
  → aggregate for TWS → replay API for FAILED later
```

**State:** `PENDING → IN_PROGRESS → SUCCESS` · else `FAILED → (replay) → PENDING`

**Columns:** `step_id/file_name`, `status`, `attempt_count`, `last_error`, `vendor_ref`, `updated_at`, `business_date`

```java
ExecutorService pool = Executors.newFixedThreadPool(8);
List<Future<?>> fs = new ArrayList<>();
for (Path f : files) fs.add(pool.submit(() -> processOneFile(f)));
for (Future<?> x : fs) x.get();
pool.shutdown();
// processOneFile: timeouts set; non-2xx/timeout → FAILED; never SUCCESS on guess
```

**Rule:** Do not hold `@Transactional` across vendor RTT — persist around the call.

---

## 4. False SUCCESS + measuring 60%

| | |
|-|-|
| Bug | Timeout → code assumes OK → SUCCESS → downstream lies |
| Fix | Timeout/non-2xx → FAILED; SUCCESS only on explicit criteria |
| Metric | records/hour or wall-clock for **same** input volume / comparable day |
| Cap | pool size, 429 backoff, circuit on error spike |
| Fill | exact before/after in [Personal facts](#/02a-personal-facts) |

---

## 5. Say this (2 min)

> Bottleneck: sync vendor REST inside scheduled jobs — latency stacked; timeout path could mark SUCCESS. Fix: bounded pool, one file/task, JPA states PENDING/IN_PROGRESS/SUCCESS/FAILED, connect+read timeouts, FAILED on timeout/non-2xx so TWS deps do not run on lies. Cap parallelism to vendor limits; replay failed steps via API. Comparable volume → ~60% throughput.

---

## 6. Top questions

<details><summary>Vendor overload?</summary>
Bound pool; rate limits; backoff 429/5xx; circuit breaker; queue/DB backlog visible.
</details>
<details><summary>Why not only more TWS parallelism?</summary>
App workers = isolation + durable state + shared quota control; TWS alone lacks business failure semantics.
</details>
<details><summary>Thread safety?</summary>
Prefer isolated tasks (one file). Avoid shared mutable state; use concurrent structures only if needed.
</details>
<details><summary>How surface worker failure to TWS?</summary>
Aggregate: any critical FAILED → non-zero / fail job; or partial success policy documented for ops.
</details>
<details><summary>Idempotent processOneFile?</summary>
Same file replay uses vendor idempotency key / dedupe on business key; status machine prevents double SUCCESS side effects.
</details>

---

## 7. Blind check

- [ ] Draw sync vs async flow
- [ ] False SUCCESS + fix
- [ ] Why no long txn over HTTP
- [ ] Speak 2 min cold

Next: [Spring Boot refactor](#/06-spring-refactor)
