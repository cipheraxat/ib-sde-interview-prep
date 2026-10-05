# Spring Boot refactor

**Resume:** Core Java → **Maven multi-module Spring Boot** + **Spring Data JPA**. Tests with **JUnit/Mockito**. Code reviews.

---

## STAR — the story

### S — Situation (the problem)

The integration code was **Core Java**: objects created by hand, config scattered, SQL mixed into business logic, and weak tests. A timeout bug was easy to miss. Every change was risky because you could not prove failure behavior before production.

### T — Task (your job)

Turn that code into a service you can test, review, and ship the same way in every environment — without changing the business outcome (vendor calls + step state).

### A — Action (what you did)

Split the app into Maven modules and Spring layers:

```
HTTP → Controller → Service → Repository (JPA) → DB
                 ↘ Vendor client (HTTP stays outside a long DB transaction)
```

| Layer | Job |
|-------|-----|
| Controller | Validate the request. Return status codes |
| Service | Business rules and status changes |
| Repository | Persist `BatchStep` rows |
| Vendor client | Call REST. Timeouts live here |

- **Constructor injection** so tests can pass a fake vendor client.
- **JUnit + Mockito:** timeout throws → assert status is **FAILED**, not SUCCESS.
- Status changes go through the service (not random setters).
- Code review looks for missing failure handling before merge.

### R — Result

The same integration behavior, but changes are testable. The false-success class of bugs is caught in unit tests. The artifact later becomes one fat JAR for Jenkins.

---

## Say the STAR in 60 seconds

> The integration code was plain Java with weak tests, so failure behavior was hard to prove. I refactored it into a Maven multi-module Spring Boot service: controller, service, JPA repository, and a vendor client. Tests use Mockito. A timeout must mark the step FAILED. We do not hold a database transaction open while we wait on the vendor.

---

## If they go deeper

| Trap | Correct line |
|------|----------------|
| `@RestController` | Controller + JSON body |
| `@Transactional` rollback | Unchecked exceptions roll back by default |
| Self-call inside the same class | Spring proxy is skipped. The transaction may not start |
| Long transaction | Do not wrap the vendor HTTP wait |
| N+1 queries | Fetch the association in one query (join fetch) |

<details>
<summary>Why modules?</summary>
API, core, and persistence stay separate. Dependencies point inward. Reviews stay smaller.
</details>

## Blind check

- [ ] Tell S-T-A-R without notes
- [ ] Draw controller → service → repository
- [ ] Name one transaction trap

Next: [Kafka events](#/07-kafka)
