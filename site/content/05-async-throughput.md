# Async & throughput (Barclays bullet 3)

## Resume bullet

> Raised batch throughput **60%** by replacing synchronous vendor REST work inside TWS-orchestrated jobs with isolated **async workers** (one file per execution); step state persists in **SQL/JPA**; timeout or non-2xx **fails the step** instead of recording a dead call as success.

## Teach first: sync vs async

**Synchronous (sync):** caller waits until the work finishes.

```
TWS job → call vendor API → wait... wait... → then next record
```

If each vendor call takes 200ms and you have many records, wall-clock explodes. One slow call blocks everything behind it.

**Asynchronous (async):** kick off work and continue; track completion via state/events.

```
TWS job → enqueue / spawn workers → workers process files in parallel
         → job tracks state in DB → completes when criteria met
```

> **ELI5:** Sync is one cashier serving every customer in a single line, waiting for card approval each time. Async is multiple cashiers (workers) taking customers in parallel, with a board showing which tickets are done/failed.

## Threads and thread pools (Java)

A **thread** is a unit of execution. Creating unlimited threads is dangerous (memory, context switching).

A **thread pool** reuses a fixed number of workers:

```java
ExecutorService pool = Executors.newFixedThreadPool(8);
List<Future<?>> futures = new ArrayList<>();
for (Path file : files) {
  futures.add(pool.submit(() -> processOneFile(file)));
}
for (Future<?> f : futures) f.get(); // surface failures
pool.shutdown();
```

> **On your resume:** “One file per execution” keeps isolation — one bad file doesn’t corrupt another’s in-memory state; retries are per file.

## Why sync REST inside TWS jobs hurt

1. Vendor latency dominates runtime  
2. Hard to parallelize safely inside one giant job  
3. TWS job may look “hung”  
4. Timeout handling gets messy — leading to the **false SUCCESS** bug  

## The false SUCCESS bug (tell this story)

**Bug:** request times out; code assumes “probably fine” or continues; step marked SUCCESS; downstream thinks work is done; data is wrong.

**Fix:** timeout or non-2xx ⇒ **FAILED**. Only explicit success criteria ⇒ SUCCESS.

> **Interview tip:** This shows correctness mindset — gold for IB/finance interviews.

## Durable step state (JPA)

Don’t keep critical truth only in memory.

| Column | Purpose |
|--------|---------|
| step_id / file_name | identity |
| status | PENDING / IN_PROGRESS / SUCCESS / FAILED |
| attempt_count | retries |
| last_error | diagnosis |
| vendor_ref | correlation |
| updated_at | ops visibility |

```
PENDING → IN_PROGRESS → SUCCESS
                 └────→ FAILED → (replay) → PENDING
```

## Measuring +60% throughput

Define throughput as records/hour or wall-clock for same nightly volume.

Before: sync bottleneck.  
After: parallel workers within safe vendor rate limits.  
Result: ~60% improvement.

Be ready to say you controlled for same input size / comparable business day. Fill exact before/after in [Personal facts](#/02a-personal-facts).

## Whiteboard flow

```
TWS kickoff
   → load work items (files)
   → submit to fixed thread pool (bounded)
   → each worker:
        mark IN_PROGRESS
        call vendor with timeouts
        on 2xx + business OK → SUCCESS + optional Kafka event
        on timeout/non-2xx → FAILED (never SUCCESS)
   → aggregate completion for TWS
   → ops can Replay API failed steps later
```

## Spoken scripts

### 30 seconds

> Vendor REST inside TWS jobs was synchronous and slow — and timeouts risked false success. I moved work to async workers, one file per execution, with JPA step state, and strict failure on timeout/non-2xx. Batch throughput rose about 60%.

### 2 minutes

> The bottleneck was synchronous vendor calls inside scheduled batch jobs — latency added up, and a timeout path could incorrectly mark work successful.  
> I introduced a bounded worker pool processing one file per task for isolation. Each task persists step state in SQL via JPA: PENDING → IN_PROGRESS → SUCCESS/FAILED. HTTP clients have explicit connect/read timeouts; timeout or non-2xx marks FAILED so downstream TWS dependencies don’t run on a lie.  
> Parallelism is capped by vendor rate limits and circuit breaking on error spikes. Failed steps are requeued later through a replay API rather than manual DB edits.  
> On comparable input volume, wall-clock / records-per-hour improved about 60%, with clearer operational recovery.

## Blind checklist

- [ ] Draw sync vs async batch flow  
- [ ] Explain false SUCCESS and the fix  
- [ ] Speak 2-minute script without notes  
- [ ] Name three columns in step state table  

## Interview Q&A

<details>
<summary>How do you avoid overwhelming the vendor?</summary>

Bound pool size; respect rate limits; backoff on 429/5xx; circuit breaker when error rate spikes.

</details>

<details>
<summary>Async vs “just more TWS parallelism”?</summary>

TWS can parallelize jobs, but application-level workers + durable state give finer control, better isolation, and clearer recovery semantics — especially with shared vendor quotas.

</details>

<details>
<summary>What about thread safety?</summary>

Prefer isolated tasks (one file/task). If sharing caches, use concurrent structures carefully or avoid shared mutable state.

</details>

<details>
<summary>Do you hold a DB transaction across the HTTP call?</summary>

No — that holds connections and locks too long. Persist state transitions around the call; don’t wrap the vendor RTT in one long `@Transactional`.

</details>

Next: [Spring Boot refactor](#/06-spring-refactor)
