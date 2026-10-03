# Spring Boot refactor

**Resume:** Core Java → **Maven multi-module Spring Boot** + **Spring Data JPA**. OOP/SOLID/patterns. **JUnit/Mockito**, integration tests, code reviews.

---

## 1. Say this first (30s)

> Legacy Core Java → Maven multi-module Spring Boot with JPA, clear layers, constructor DI, JUnit/Mockito. Safer to change; failure paths tested.

---

## 2. Words

| Word | Meaning | Probe |
|------|---------|-------|
| Core Java | Manual wiring, uneven structure | What you left |
| Spring Boot | DI, embedded server, profiles, actuator | Why banks use it |
| DI | Spring supplies deps (prefer ctor) | Testability |
| Module | Maven boundary (api/core/persistence) | Dependency direction |
| JPA repo | Entity ↔ table; derived/`@Query` | Still know SQL |
| `@Transactional` | DB txn around method | Rollback defaults |
| Fat JAR | App + deps + server one artifact | Bullet 7 |

---

## 3. How it works

```
HTTP → @RestController → @Service → JpaRepository → DB
                      ↘ VendorClient (no long txn around HTTP)
```

**Modules:** `api` (HTTP) · `core` (rules) · `persistence` (entities/repos)

**SOLID map**

| Idea | Example |
|------|---------|
| SRP | VendorClient ≠ ReconService ≠ ReplayController |
| DIP | Depend on `VendorClient` interface |
| Encapsulation | Status transitions only via service methods |
| Patterns | Adapter (vendor), State (step), Strategy (retry) |

```java
@Service
public class PaymentSyncService {
  private final VendorClient vendor;
  private final StepRepository steps;
  public PaymentSyncService(VendorClient vendor, StepRepository steps) {
    this.vendor = vendor; this.steps = steps;
  }
}
@Test void marksFailedOnTimeout() {
  when(vendor.update(any())).thenThrow(new SocketTimeoutException());
  // assert FAILED, not SUCCESS
}
```

---

## 4. Traps / rules

| Topic | Say |
|-------|-----|
| `@RestController` | `@Controller` + `@ResponseBody` |
| Rollback | Unchecked → rollback by default; checked often not |
| Self-invoke | Same-class call bypasses proxy → no txn |
| Long txn | Never wrap vendor HTTP in one `@Transactional` |
| N+1 | Lazy loops; fix join fetch / entity graph |
| Pool | HikariCP size ≈ concurrent DB work |

---

## 5. Say this (2 min)

> Old Core Java was hard to test. Refactor to Spring Boot modules: controllers HTTP, services rules, repos state. Ctor injection + Mockito for timeout→FAILED tests. Vendor calls outside long DB transactions. Reviews catch missing failure handling before Jenkins promote.

---

## 6. Top questions

<details><summary>Bean scopes?</summary>
Singleton default; prototype per inject; request/session for web.
</details>
<details><summary>How Spring Boot auto-config?</summary>
Classpath + `@ConditionalOn*`; starters pull opinionated defaults you can override.
</details>
<details><summary>Testing pyramid here?</summary>
Unit (service+mocks) · slice/integration (repo/HTTP) · pipeline smoke.
</details>

---

## 7. Blind check

- [ ] Draw layers + no-txn-over-HTTP
- [ ] One `@Transactional` trap
- [ ] Speak 30s + test idea

Next: [Kafka events](#/07-kafka)
