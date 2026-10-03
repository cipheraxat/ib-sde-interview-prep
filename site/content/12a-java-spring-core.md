# Java & Spring interview core

IB will grind **Java + SQL** even if they love your migration story. This page is the language/runtime core.

## Collections (must be crisp)

| Structure | When to use | Interview bite |
|-----------|-------------|----------------|
| `ArrayList` | Random access, append-heavy | Amortized O(1) add; O(n) middle insert |
| `LinkedList` | Rarely preferred in modern Java | Know trade-offs; usually ArrayList wins |
| `HashMap` | Key→value | Average O(1); talk equals/hashCode contract |
| `ConcurrentHashMap` | Shared map across threads | Segmented/CAS; no `ConcurrentModification` for iterators the same way |
| `HashSet` | Uniqueness | Backed by HashMap |
| `TreeMap` / `TreeSet` | Sorted keys | O(log n) |
| `PriorityQueue` | Top-K, scheduling | Heap |
| `ArrayDeque` | Stack/queue | Faster than Stack/LinkedList for most cases |

### equals / hashCode contract

If `a.equals(b)` then `a.hashCode() == b.hashCode()`.  
Break this → HashMap keys “disappear.” Mutating fields used in hashCode while key is in a map is a classic bug.

## Concurrency

| Tool | Use |
|------|-----|
| `synchronized` | Simple mutual exclusion |
| `ReentrantLock` | Explicit locking, tryLock, fairness options |
| `volatile` | Visibility of a single field; not atomic compound actions |
| `AtomicInteger` etc. | Lock-free counters |
| `ExecutorService` | Thread pools (your async workers story) |
| `BlockingQueue` | Producer–consumer |
| `CompletableFuture` | Async composition |

**Happens-before:** writes before unlock are visible after lock on another thread; volatile write → read; thread start/join.

> **On your resume:** Prefer “fixed pool + isolated file tasks + durable DB state” over clever lock-free designs you didn’t ship.

## Spring Boot essentials

| Topic | Say this |
|-------|----------|
| DI | Constructor injection; Spring wires beans; easy to mock |
| `@RestController` | `@Controller` + `@ResponseBody` |
| `@Transactional` | Proxy wraps method in DB transaction; default rollback on unchecked exceptions |
| Propagation | `REQUIRED` joins or creates; `REQUIRES_NEW` suspends and starts new |
| Spring Data JPA | Repository interfaces → queries; still must understand SQL |
| Profiles | `dev` / `test` / `prod` config |
| Actuator | Health endpoints for ops/TWS checks |

### @Transactional traps

1. Self-invocation inside same class bypasses proxy → no transaction.  
2. Checked exceptions don’t rollback by default.  
3. Long transactions hold DB connections — bad inside slow vendor calls.  
4. Catching exceptions inside transactional method can swallow rollback.

> **Interview tip:** “I don’t hold a DB transaction open across an external HTTP call” — gold answer.

## JPA / SQL performance

- **N+1:** lazy associations fetched per row → fix with join fetch / entity graph  
- **Indexes:** equality/range on filter columns (`account_id`, `business_date,status`)  
- **Pagination:** don’t load 100K rows into memory  
- **Connection pool (HikariCP):** size ≈ concurrent in-flight DB work, not “big number”

## Exceptions & APIs

- Prefer precise exceptions; map to HTTP 4xx/5xx in `@ControllerAdvice`  
- Timeouts on HTTP clients (`connectTimeout`, `readTimeout`)  
- Idempotent PUT/retry only when safe  

## Mini Q bank

<details>
<summary>HashMap vs ConcurrentHashMap?</summary>

HashMap not thread-safe; ConcurrentHashMap allows concurrent reads/updates with better throughput than synchronizing a whole HashMap.

</details>

<details>
<summary>Checked vs unchecked exceptions?</summary>

Checked must declare/handle; Spring `@Transactional` rolls back unchecked by default.

</details>

<details>
<summary>What does a fat JAR contain?</summary>

Your classes + dependencies + embedded server — one runnable artifact for consistent deploys.

</details>

<details>
<summary>How do you test a service that calls a vendor?</summary>

Unit test with Mockito mock of client; assert FAILED on timeout; integration test for repository/state transitions.

</details>

## Blind checklist

- [ ] Explain equals/hashCode with a bug story  
- [ ] Explain why not to transaction-wrap vendor HTTP  
- [ ] Describe your worker pool + JPA state in 60s  

Next: [Coding & SQL drills](#/12-coding-sql)
