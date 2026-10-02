# Coding & SQL drills

IB backend interviews often mix **easy–medium DSA**, **Java concurrency**, and **SQL**. Talk while coding.

## How to run a coding interview

1. Restate problem + examples  
2. Clarify constraints  
3. Brute force → optimize  
4. Code cleanly  
5. Trace an example  
6. Complexity  
7. Edge cases  

## DSA patterns mapped to your work

| Pattern | Practice problem | Resume hook |
|---------|------------------|-------------|
| HashMap | Two Sum | `accountId → tokenStatus` maps |
| Two pointers | sorted pair sum | merging sorted dumps |
| Sliding window | longest substring | rate-limit windows |
| Stack | valid parentheses | nested dependency checks |
| Queue / BFS | level order | TWS job-stream levels |
| Heap | top-K | top vendor error codes |
| Topological sort | course schedule | **TWS DAG dependencies** |
| Graph cycle detect | detect cycle | bad job-stream config |

### Must practice

1. Two Sum / Group Anagrams  
2. Valid Parentheses  
3. Merge Intervals  
4. Course Schedule (topo sort)  
5. LRU Cache  
6. Producer–consumer with `BlockingQueue`  
7. Exponential backoff with jitter  
8. Deduplicate event stream  

## Concurrency snippets

**Thread pool for files**

```java
ExecutorService pool = Executors.newFixedThreadPool(8);
List<Future<?>> futures = new ArrayList<>();
for (Path file : files) {
  futures.add(pool.submit(() -> processOneFile(file)));
}
for (Future<?> f : futures) f.get();
pool.shutdown();
```

**Idempotent processing**

```java
if (processedRepo.existsByEventId(eventId)) return;
// process + persist eventId (same txn if possible)
```

**Rule from your resume:** timeout / non-2xx ⇒ FAILED, never SUCCESS.

## SQL drills

### 2nd highest

```sql
SELECT MAX(salary)
FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
```

### Duplicates

```sql
SELECT event_id, COUNT(*)
FROM kafka_processed
GROUP BY event_id
HAVING COUNT(*) > 1;
```

### Running total

```sql
SELECT account_id, business_date, amount,
       SUM(amount) OVER (
         PARTITION BY account_id ORDER BY business_date
       ) AS running_total
FROM transactions;
```

### Recon mismatches

```sql
SELECT s.account_id
FROM integration_account_status s
LEFT JOIN vendor_token_snapshot v ON v.account_id = s.account_id
WHERE s.expected_token = TRUE
  AND (v.token_id IS NULL OR v.token_status <> 'ACTIVE');
```

### Failed steps for replay

```sql
SELECT step_id, file_name, error_code, attempt_count
FROM batch_step_execution
WHERE status = 'FAILED'
  AND business_date = :runDate
ORDER BY last_updated;
```

## Indexes (say this)

- B-tree on lookup keys (`account_id`, `event_id`)  
- Composite `(business_date, status)` for ops dashboards  
- Avoid wrapping indexed columns in functions in `WHERE`

## Oracle vs MySQL (1-liners)

| Topic | Oracle | MySQL |
|-------|--------|-------|
| Limit | `FETCH FIRST N ROWS ONLY` | `LIMIT N` |
| Autoincrement | sequence / identity | `AUTO_INCREMENT` |
| Procedural | PL/SQL common | procs less central for app teams |

On PL/SQL: “I own application SQL for recon/batch via Spring/JDBC; I’m familiar reading procedures but I’m not a full-time PL/SQL developer.”

## Self-check day before

- [ ] 2 HashMap problems timed  
- [ ] 1 concurrency explanation aloud  
- [ ] Write recon SQL from memory  
- [ ] Explain idempotency with an example  

Next: [System design](#/13-system-design)
