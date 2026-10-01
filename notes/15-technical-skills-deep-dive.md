# Technical Skills — Deep Interview Prep

## Java

**Q:** HashMap vs ConcurrentHashMap?

HashMap not thread-safe; ConcurrentHashMap lock-striped buckets, safe for concurrent reads/writes; use CHM for shared cache of in-flight file locks across async workers.

**Q:** synchronized vs ReentrantLock?

synchronized simpler, JVM intrinsic lock; ReentrantLock explicit, tryLock with timeout, fair ordering — use when you need timed lock attempt for deadlock avoidance.

**Q:** ExecutorService types?

Fixed thread pool for vendor workers; bounded queue; CallerRunsPolicy backpressure; always shutdown hook on app stop.

## Spring Boot / MVC / JPA

**Q:** N+1 problem?

Loading parent entities then lazy-loading each child → N+1 queries. Fix: `@EntityGraph`, JOIN FETCH in JPQL, or DTO projection.

**Q:** Lazy vs eager?

Default lazy for @ManyToOne — good for performance; eager risks loading entire graph; use lazy + fetch join where needed.

## SQL (Oracle / MySQL)

**Q:** Index when?

Columns in WHERE/JOIN — `account_id`, `(business_date, status)`. Trade-off: write slowdown, storage.

**Q:** Oracle vs MySQL differences (mention if asked)

Oracle: ROWNUM, sequences, PL/SQL (don’t claim PL/SQL on resume). MySQL: LIMIT, auto_increment. Use ANSI SQL in interview unless they specify dialect.

## Kafka, Linux, TWS

See bullets 5 and 1. Linux debugging: `journalctl -u integration`, `tail -f application.log | grep correlationId`, `ps aux | grep java`, `netstat/ss` for port, exit codes 0=success for TWS.

## Concepts

| Concept | One-liner |
|----|----|
| Microservices | Your app = modular monolith with clear boundaries; bank may have many services — yours integrates |
| HLD | Boxes, arrows, trust zones, NFRs |
| LLD | Tables, APIs, algorithms, error codes |
| SOLID | Maintainable OOP — see bullet 4 |
| Agile/Scrum | 2-week sprints, standups, retros, Jira stories, demo to PO |
