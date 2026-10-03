# Async and throughput

**Resume line:** You raised batch throughput by about 60%. You replaced synchronous vendor REST work inside TWS jobs with async workers. One file runs in one execution. Step state stays in SQL through JPA. A timeout or a non-2xx response fails the step. The system does not record a dead call as success.

---

## 1. Say this first (30 seconds)

> Vendor REST calls inside TWS jobs were synchronous and slow. A timeout could mark work as success by mistake. I moved work to a bounded worker pool. One file runs in one task. JPA stores step state. Timeout or non-2xx marks FAILED. Throughput rose by about 60%.

---

## 2. Words you must know

| Word | Meaning |
|------|---------|
| Synchronous | The caller waits until the call completes |
| Asynchronous | The caller starts work and tracks completion later |
| Thread pool | A fixed set of worker threads that reuse resources |
| Step state | Durable SUCCESS or FAILED status in the database |
| False SUCCESS | The system marks success when the outcome is unknown |

> **ELI5:** One slow cashier is sync. Many cashiers with a status board are async.

---

## 3. How it works

```
TWS kickoff
  → load files
  → submit to fixed thread pool (bounded)
  → each worker:
       mark IN_PROGRESS
       call vendor with timeouts
       on success criteria → SUCCESS
       on timeout or non-2xx → FAILED
  → report completion to TWS
  → ops can replay FAILED steps later
```

State machine:

```
PENDING → IN_PROGRESS → SUCCESS
                  └────→ FAILED → (replay) → PENDING
```

---

## 4. False SUCCESS bug

**Bug:** The HTTP call times out. The code assumes success. Downstream jobs run on a lie.

**Fix:** Timeout or non-2xx → FAILED. Only clear success criteria → SUCCESS.

This story shows a correctness mindset. Finance interviewers value it.

---

## 5. Measuring 60%

Define throughput as records per hour or wall-clock time for the same input volume.

- Before: synchronous vendor calls.
- After: bounded parallel workers.
- Keep the vendor rate limit in mind.

Write your exact before and after numbers in [Personal facts](#/02a-personal-facts).

---

## 6. Say this (2 minutes)

> The bottleneck was synchronous vendor calls inside scheduled batch jobs. Latency added up. A timeout path could mark success incorrectly.  
> I used a bounded worker pool. Each task handles one file. Each task stores state in SQL: PENDING, IN_PROGRESS, SUCCESS, or FAILED. HTTP clients use connect and read timeouts. Timeout or non-2xx marks FAILED. Downstream TWS jobs then do not run on false success.  
> Pool size respects vendor rate limits. Failed steps go through a replay API later. On comparable input volume, throughput rose by about 60%.

---

## 7. Top questions

<details>
<summary>How do you avoid vendor overload?</summary>

Bound the pool. Obey rate limits. Use backoff on 429 and 5xx. Open a circuit when errors spike.

</details>

<details>
<summary>Why not only add more TWS parallel jobs?</summary>

App-level workers give finer isolation and clearer state. Shared vendor quotas still need a bound in the app.

</details>

<details>
<summary>Do you hold a DB transaction across the HTTP call?</summary>

No. A long transaction holds connections too long. Persist state around the call. Do not wrap the full vendor wait in one `@Transactional` block.

</details>

---

## 8. Blind check

- [ ] Draw sync vs async batch flow.
- [ ] Explain false SUCCESS and the fix.
- [ ] Speak the 2-minute answer.
- [ ] Name three step-state columns.

Next: [Spring Boot refactor](#/06-spring-refactor)
