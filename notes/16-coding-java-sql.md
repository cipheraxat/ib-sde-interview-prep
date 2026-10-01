# Coding Round Prep (Java / SQL)

IB backend interviews often mix **easy–medium DSA**, **Java concurrency**, and **SQL**. Speak your approach out loud; they care about correctness and edge cases more than fancy tricks.

## Java DSA patterns (map to your work)

| Pattern | Classic problem | Your resume hook |
|---|---|---|
| HashMap / frequency | Two Sum, anagrams | recon maps `accountId → tokenStatus` |
| Two pointers | sorted pair sum | merging sorted recon dumps |
| Sliding window | longest substring | rate-limit windows |
| Stack | valid parentheses, next greater | nested TWS dependency walks |
| Queue / BFS | level order | TWS job-stream levels (DAG levels) |
| Heap | top-K | top failing vendor error codes |
| Binary search | search insert position | binary search on sorted account batches |
| Linked list | reverse, merge | rarely asked; know basics |
| Tree DFS/BFS | LCA, path sum | org / category trees if asked |
| Graph | cycle detect, topo sort | **TWS job dependencies = DAG; topo order = run order** |

### Must practice (LeetCode-ish)

1. Two Sum / Group Anagrams  
2. Valid Parentheses  
3. Merge Intervals (batch windows)  
4. Topological Sort / Course Schedule (job dependencies)  
5. LRU Cache (Redis-ish eviction story)  
6. Producer–consumer with `BlockingQueue` (async workers)  
7. Implement retry with exponential backoff + jitter  
8. Detect duplicates in a stream (idempotency set)

### Concurrency snippets to explain

**Fixed thread pool for file workers**

```java
ExecutorService pool = Executors.newFixedThreadPool(8);
List> futures = new ArrayList<>();
for (Path file : files) {
  futures.add(pool.submit(() -> processOneFile(file)));
}
for (Future f : futures) f.get(); // surface failures
pool.shutdown();
```

**Idempotent process**

```java
boolean alreadyDone = processedRepo.existsByEventId(eventId);
if (alreadyDone) return; // at-least-once safe
// process + insert eventId in same transaction when possible
```

**Never treat “HTTP 200 after timeout” as success** — your bullet 3 story: timeout/non-2xx ⇒ FAILED step.

---

## SQL drills (Oracle / MySQL flavors)

Know both dialects at a high level. Prefer ANSI SQL in interviews unless they specify.

### 2nd highest value

```sql
SELECT MAX(salary)
FROM employees
WHERE salary  1;
```

### Running total

```sql
SELECT account_id, business_date, amount,
       SUM(amount) OVER (
         PARTITION BY account_id
         ORDER BY business_date
       ) AS running_total
FROM transactions;
```

### Recon mismatch (your tokenization story)

```sql
SELECT s.account_id, s.tokenization_status
FROM   integration_account_status s
LEFT JOIN vendor_token_snapshot v
       ON v.account_id = s.account_id
WHERE  s.expected_token = TRUE
  AND  s.business_date = :runDate
  AND  (v.token_id IS NULL OR v.token_status <> 'ACTIVE');
```

### Failed batch steps for replay

```sql
SELECT step_id, file_name, error_code, attempt_count
FROM   batch_step_execution
WHERE  status = 'FAILED'
  AND  business_date = :runDate
ORDER BY last_updated;
```

### Indexes — whiteboard talking points

- B-tree on `account_id`, `short_code`, `event_id` for equality lookups  
- Composite `(business_date, status)` for batch dashboards  
- Avoid functions on indexed columns in `WHERE` (`WHERE DATE(ts)=...`)

### Oracle vs MySQL gotchas (1-liners)

| Topic | Oracle | MySQL |
|---|---|---|
| Sequence / auto ID | `SEQUENCE` / `IDENTITY` | `AUTO_INCREMENT` |
| Limit rows | `FETCH FIRST N ROWS ONLY` / `ROWNUM` | `LIMIT N` |
| String concat | `\|\|` | `CONCAT` / `\|\|` (mode dependent) |
| `NULL` in unique | Multiple NULLs OK in unique index (Oracle) | MySQL unique allows multiple NULLs |
| PL/SQL | Procedures/packages common | Stored procs less central for app teams |

If asked about **PL/SQL**: “I’ve written and maintained Oracle SQL for recon and batch status — procedural PL/SQL exists in the bank, but my day-to-day ownership is application SQL via Spring Data JPA / JDBC.”

---

## Live coding checklist

- [ ] Restate problem + constraints + examples  
- [ ] Brute force → optimize  
- [ ] Name time/space complexity  
- [ ] Edge cases: empty, duplicates, overflow, nulls  
- [ ] Tests: happy path + one failure path  
- [ ] Relate back to production habit (idempotency, timeouts, logging)
