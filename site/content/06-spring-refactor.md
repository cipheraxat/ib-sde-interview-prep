# Spring Boot refactor (Barclays bullet 4)

## Resume bullet

> Refactored **Core Java** into a **Maven** multi-module **Spring Framework / Spring Boot** service with **Spring Data JPA**, applying OOP, SOLID, and design patterns; **JUnit/Mockito** unit testing, integration testing, and code reviews.

---

## The whole story

Parts of the integration stack started as **Core Java**: workable, but wiring was manual, structure was inconsistent, and testing was painful. As the SaaS migration grew — more vendor endpoints, more step states, more environments — that shape became a liability.

I refactored the service into a **Maven multi-module Spring Boot** application:

- Clear layers: controller (HTTP) → service (business rules) → repository (JPA/SQL)  
- **Dependency injection** so components are swappable and testable  
- **Spring Data JPA** for durable step/account state  
- **JUnit + Mockito** for unit tests (especially failure paths)  
- Shared standards via **code reviews**  
- Design guided by **OOP / SOLID** and a few practical patterns (not buzzword bingo)

This wasn’t a rewrite for fashion. It made the async workers, replay APIs, Kafka publishers, and Jenkins packaging safer to change without breaking payment flows.

---

## 30-second pitch

> I refactored legacy Core Java into a Maven multi-module Spring Boot service with Spring Data JPA, clear layering, and JUnit/Mockito coverage. That made failure handling and new features testable — critical while we were changing batch behavior under production load.

---

## 2-minute interview script

> “As the integration platform grew, our older Core Java shape was hard to test and hard to evolve. I led a refactor into Spring Boot with Maven modules — separating API, core business logic, and persistence.  
>  
> Controllers stay thin. Services own business rules like ‘timeout means FAILED’ and vendor mapping. Repositories persist step execution state through Spring Data JPA. Dependencies are injected, so in tests I can mock the vendor client and assert state transitions without hitting the real SaaS.  
>  
> We applied SOLID in practical ways — for example, vendor communication behind an interface, step lifecycle in one place, and retry policy as a strategy we can tune. Code review was part of the definition of done, especially around transactions and error handling.  
>  
> The payoff showed up in later work: async workers, replay APIs, and CI packaging were much easier because the seams were clean.”

---

## Teach the concepts (with your examples)

### Core Java vs Spring Boot

| Core Java pain | Spring Boot help |
|----------------|------------------|
| Manual `new` wiring | DI / constructors |
| Ad-hoc config | Profiles (dev/test/prod) |
| Hard HTTP/health | Embedded server + actuator |
| SQL scattered | JPA repositories + clearer transactions |
| Weak tests | Mockito + Spring test slices |

> **ELI5:** From a junk drawer of tools to labeled drawers — same tools, findable and safer.

### Maven multi-module

Example split:

- `integration-api` — REST controllers  
- `integration-core` — services, vendor client interfaces  
- `integration-persistence` — entities/repos  

Benefits: dependency direction, reuse, faster incremental builds, clearer ownership.

### DI example

```java
@Service
public class PaymentSyncService {
  private final VendorClient vendorClient;
  private final StepRepository steps;

  public PaymentSyncService(VendorClient vendorClient, StepRepository steps) {
    this.vendorClient = vendorClient;
    this.steps = steps;
  }
}
```

### Spring Data JPA

```java
public interface StepRepository extends JpaRepository<BatchStepExecution, Long> {
  List<BatchStepExecution> findByStatusAndBusinessDate(String status, LocalDate date);
}
```

Still know SQL — frameworks don’t replace recon thinking.

### SOLID mapped to your service

| Principle | Your example |
|-----------|--------------|
| SRP | `VendorClient` ≠ `ReconService` ≠ `ReplayController` |
| DIP | Depend on `VendorClient` interface |
| OCP | New error mapper without rewriting core loop |
| Encapsulation | State transitions only via service methods |
| Patterns | Strategy (retry), State (step lifecycle), Adapter (vendor API) |

### Testing story they want

```java
@Test
void marksFailedOnTimeout() {
  when(vendorClient.update(any())).thenThrow(new SocketTimeoutException());
  // act
  // assert status == FAILED (not SUCCESS)
}
```

Also mention integration tests for DB state and code review focus areas: transactions, secrets, idempotency.

---

## MVC request path (say aloud)

1. `@RestController` receives `POST /batch/...`  
2. Validates DTO  
3. Service applies rules, calls vendor, updates state  
4. Repository persists  
5. Exception handler returns JSON errors; logs carry correlation id  

---

## Deep interview Q&A

<details>
<summary>@RestController vs @Controller?</summary>

`@RestController` = `@Controller` + `@ResponseBody` — return values become JSON directly.

</details>

<details>
<summary>What does @Transactional do?</summary>

Wraps work in a DB transaction. Default rollback on unchecked exceptions. Critical when writing step state (+ outbox) together so you don’t commit half a story.

</details>

<details>
<summary>Why not stay on Core Java?</summary>

Velocity and safety. Migration features needed testable failure paths and consistent config across envs. Spring Boot paid for itself in fewer production surprises.

</details>

<details>
<summary>How do you avoid an anemic domain / god service?</summary>

Keep controllers thin; split services by capability (sync vs recon vs replay); don’t put HTTP concerns in repositories; review PRs for “this class does everything.”

</details>

<details>
<summary>Connection pooling?</summary>

HikariCP (Spring Boot default) reuses DB connections. Size pools to workers × usage; don’t open a connection per thread carelessly.

</details>

---

## Practice checklist

- [ ] Explain why refactor happened (pain → payoff)  
- [ ] Walk MVC for one endpoint  
- [ ] Give one Mockito failure-path test story  
- [ ] Map two SOLID points to real classes  
- [ ] Mention reviews as quality gate  

**Next:** [Kafka events](#/07-kafka)
