# Async & throughput (Barclays bullet 3)

## Resume bullet

> Raised batch throughput **60%** by replacing synchronous vendor REST work inside TWS-orchestrated jobs with isolated **async workers** (one file per execution); step state persists in **SQL/JPA**; timeout or non-2xx **fails the step** instead of recording a dead call as success.

---

## The whole story (this is a correctness story, not just a speed story)

After the SaaS integration was running, EOD batches were still too slow. The original shape was roughly:

> TWS job starts → for each file/record, **synchronously** call vendor REST → wait for response → next item.

That has two problems:

1. **Throughput:** vendor latency dominates. One slow call blocks the whole line. Month-end windows get scary.  
2. **Correctness bug class:** when a call **times out**, naive code sometimes continues or marks SUCCESS “because we probably sent it.” Downstream jobs then believe work is done when it isn’t. In payments, that’s unacceptable.

I changed the model to **async workers**:

- Work is split so workers process **one file per execution** (isolation).  
- A **thread pool / worker pool** processes multiple files in parallel, bounded by vendor rate limits.  
- Every step’s status is persisted in **SQL via JPA**: PENDING → IN_PROGRESS → SUCCESS / FAILED.  
- **Timeout or non-2xx ⇒ FAILED.** Only explicit success criteria ⇒ SUCCESS.  
- Failed steps can later be safely replayed (ties to bullet 6).

Result: about **60% higher batch throughput** for the same class of input volume — and fewer silent false successes.

> **Interview tip:** Lead with the false-SUCCESS lesson. IB interviewers care more about that than the 60% number alone.

---

## 30-second pitch

> Vendor REST calls inside TWS jobs were synchronous and slow, and timeouts risked false success. I moved processing to async workers — one file per execution — with JPA step state and strict failure on timeout or non-2xx. Throughput rose about 60%, and we stopped recording dead calls as success.

---

## 2-minute interview script

> “Our TWS-orchestrated payment load jobs were calling the vendor synchronously inside the job. That meant vendor latency stacked sequentially, so EOD throughput suffered. Worse, timeout handling was dangerous — if the HTTP client timed out, we could incorrectly treat the step as done.  
>  
> I redesigned the execution model. Instead of one giant synchronous loop, we enqueue or fan out work to async workers. Each worker handles one file end-to-end so failures stay isolated. Progress is stored in the database with JPA — statuses like PENDING, IN_PROGRESS, SUCCESS, FAILED — so TWS and ops can see truth outside process memory.  
>  
> The key rule I enforced: if we get a timeout or any non-2xx, the step is FAILED, never SUCCESS. Retries happen deliberately through the state machine / replay path, not by pretending.  
>  
> We also bounded parallelism so we wouldn’t stampede the vendor. On comparable volumes, wall-clock / records-per-hour improved about 60%.”

---

## Teach the concepts

### Sync vs async

**Sync:** caller waits until work finishes. Simple, but slow when waiting on network.  
**Async:** start work, track completion via state/events, overlap waiting time across workers.

> **ELI5:** One cashier vs multiple cashiers with a ticket board showing done/failed.

### Threads / pools (Java)

Unlimited threads are dangerous. Use a fixed pool:

```java
ExecutorService pool = Executors.newFixedThreadPool(8);
for (Path file : files) {
  pool.submit(() -> processOneFile(file));
}
pool.shutdown();
```

**One file per execution** = clear retry unit, less shared mutable state, easier ops reasoning.

### Durable state (why JPA/SQL)

If state lives only in memory, a crash loses truth. Persist:

| Field | Why |
|-------|-----|
| file/step id | identity |
| status | machine state |
| attempt_count | retry budget |
| last_error | diagnosis |
| vendor_ref | correlation |
| updated_at | ops visibility |

```
PENDING → IN_PROGRESS → SUCCESS
                 └────→ FAILED → (replay) → PENDING
```

### Measuring +60%

Define throughput as records/hour or wall-clock for the **same input volume / comparable business day**. Don’t claim magic if volumes differed.

---

## Architecture before vs after

**Before**

```
TWS job
  └─ for file in files:
        call vendor (wait)
        next file   ← blocked by each wait
```

**After**

```
TWS kickoff
  └─ create step rows (PENDING)
  └─ worker pool (bounded)
        ├─ file A → vendor → SUCCESS/FAILED (persisted)
        ├─ file B → vendor → SUCCESS/FAILED
        └─ file C → ...
  └─ aggregate completion for TWS dependency
```

---

## Deep interview Q&A

<details>
<summary>Why not just add more TWS parallelism?</summary>

TWS can parallelize jobs, but app-level workers + durable per-file state give finer isolation, clearer recovery, shared rate-limit control, and consistent success/failure semantics the scheduler alone doesn’t encode.

</details>

<details>
<summary>How do you avoid overwhelming the vendor?</summary>

Bound pool size; honor 429/rate limits; exponential backoff; circuit breaker when error rate spikes; prefer smooth concurrency over “max threads.”

</details>

<details>
<summary>What exactly is the false SUCCESS bug?</summary>

Request times out; code assumes success or lacks a failure path; DB says SUCCESS; downstream recon/reporting proceeds; data is wrong. Fix: timeout/non-2xx ⇒ FAILED; confirm success only from explicit 2xx + business checks.

</details>

<details>
<summary>Thread safety?</summary>

Prefer task isolation (one file/task). Avoid shared mutable counters without concurrency control. If sharing caches, use concurrent structures carefully or don’t share.

</details>

<details>
<summary>How does this connect to the replay API?</summary>

FAILED steps become first-class. Ops/API can requeue them safely instead of re-running an entire ambiguous batch blindly.

</details>

<details>
<summary>Would you use Kafka here instead of a thread pool?</summary>

For intra-job fan-out within a batch window, a worker pool + DB state is often enough. Kafka shines when multiple systems must consume events asynchronously (bullet 5). You can say both patterns coexist for different problems.

</details>

---

## Practice checklist

- [ ] Tell before/after in 90 seconds  
- [ ] Emphasize timeout ⇒ FAILED  
- [ ] Explain one-file isolation  
- [ ] State how you measured 60%  
- [ ] Draw the state machine  

**Next:** [Spring Boot refactor](#/06-spring-refactor)
