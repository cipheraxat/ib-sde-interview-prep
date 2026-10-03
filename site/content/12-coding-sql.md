# Coding & SQL — worked solutions

Don’t only list problems. Rehearse these **out loud** with a timer (15–20 min each).

## How you narrate

1. Restate + example  
2. Brute force  
3. Optimize  
4. Code  
5. Trace  
6. Complexity + edges  

---

## DSA 1 — Two Sum

**Idea:** one pass HashMap `value → index`.

```java
public int[] twoSum(int[] nums, int target) {
  Map<Integer, Integer> seen = new HashMap<>();
  for (int i = 0; i < nums.length; i++) {
    int need = target - nums[i];
    if (seen.containsKey(need)) return new int[]{seen.get(need), i};
    seen.put(nums[i], i);
  }
  throw new IllegalArgumentException("no pair");
}
// Time O(n), Space O(n)
```

**Resume hook:** recon maps `accountId → status`.

---

## DSA 2 — Valid Parentheses

```java
public boolean isValid(String s) {
  Deque<Character> st = new ArrayDeque<>();
  Map<Character, Character> close = Map.of(')', '(', ']', '[', '}', '{');
  for (char c : s.toCharArray()) {
    if (!close.containsKey(c)) st.push(c);
    else if (st.isEmpty() || st.pop() != close.get(c)) return false;
  }
  return st.isEmpty();
}
```

---

## DSA 3 — Merge Intervals

```java
public int[][] merge(int[][] intervals) {
  Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));
  List<int[]> out = new ArrayList<>();
  int[] cur = intervals[0];
  for (int i = 1; i < intervals.length; i++) {
    if (intervals[i][0] <= cur[1]) cur[1] = Math.max(cur[1], intervals[i][1]);
    else { out.add(cur); cur = intervals[i]; }
  }
  out.add(cur);
  return out.toArray(new int[0][]);
}
```

**Resume hook:** batch windows / business-date ranges.

---

## DSA 4 — Course Schedule (TWS DAG)

Detect cycle in directed graph (Kahn topo sort).

```java
public boolean canFinish(int n, int[][] edges) {
  List<List<Integer>> g = new ArrayList<>();
  for (int i = 0; i < n; i++) g.add(new ArrayList<>());
  int[] indeg = new int[n];
  for (int[] e : edges) { g.get(e[1]).add(e[0]); indeg[e[0]]++; }
  ArrayDeque<Integer> q = new ArrayDeque<>();
  for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);
  int seen = 0;
  while (!q.isEmpty()) {
    int u = q.poll(); seen++;
    for (int v : g.get(u)) if (--indeg[v] == 0) q.add(v);
  }
  return seen == n; // false ⇒ cycle ⇒ invalid job stream
}
```

**Resume hook:** TWS job dependencies must be a DAG.

---

## DSA 5 — Producer–consumer sketch

```java
BlockingQueue<Path> q = new ArrayBlockingQueue<>(100);
ExecutorService workers = Executors.newFixedThreadPool(8);
// producer
q.put(file);
// worker
Path f = q.take();
processOneFile(f); // persist FAILED on timeout/non-2xx
```

---

## DSA 6 — Exponential backoff

```java
long delay = 1000;
for (int attempt = 1; attempt <= max; attempt++) {
  try { return callVendor(); }
  catch (TransientException e) {
    if (attempt == max) throw e;
    Thread.sleep(delay + ThreadLocalRandom.current().nextLong(200));
    delay = Math.min(delay * 2, 60_000);
  }
}
```

---

## SQL worked set

### A) Second highest

```sql
SELECT MAX(salary) FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
```

### B) Duplicates (idempotency)

```sql
SELECT event_id, COUNT(*) AS c
FROM kafka_processed
GROUP BY event_id
HAVING COUNT(*) > 1;
```

### C) Running total

```sql
SELECT account_id, business_date, amount,
       SUM(amount) OVER (PARTITION BY account_id ORDER BY business_date) AS running_total
FROM transactions;
```

### D) Tokenization mismatches (your story)

```sql
SELECT s.account_id
FROM integration_account_status s
LEFT JOIN vendor_token_snapshot v ON v.account_id = s.account_id
WHERE s.expected_token = TRUE
  AND s.business_date = :runDate
  AND (v.token_id IS NULL OR v.token_status <> 'ACTIVE');
```

### E) Status dashboard

```sql
SELECT tokenization_status, COUNT(*)
FROM integration_account_status
WHERE business_date = :runDate AND expected_token = TRUE
GROUP BY tokenization_status;
```

### F) Replay candidates

```sql
SELECT step_id, file_name, attempt_count, last_error
FROM batch_step_execution
WHERE status = 'FAILED' AND business_date = :runDate
ORDER BY last_updated;
```

---

## Timed practice plan

| Day | Drill |
|-----|-------|
| 1 | Two Sum + Valid Parentheses |
| 2 | Merge Intervals + Topo sort |
| 3 | Backoff + producer-consumer narration |
| 4 | SQL D+E+F from memory |
| 5 | Mixed mock: 1 DSA + 1 SQL in 40 min |

## Blind checklist

- [ ] Code topo sort without notes  
- [ ] Write mismatch SQL from memory  
- [ ] Explain timeout ⇒ FAILED while coding concurrency  

Next: [System design](#/13-system-design)
