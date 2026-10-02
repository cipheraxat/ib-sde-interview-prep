# Spring Boot refactor (Barclays bullet 4)

## Resume bullet

> Refactored **Core Java** into a **Maven** multi-module **Spring Framework / Spring Boot** service with **Spring Data JPA**, applying OOP, SOLID, and design patterns; **JUnit/Mockito** unit testing, integration testing, and code reviews.

## Teach first: Core Java vs Spring Boot service

**Core Java app** (typical legacy shape):

- `main` methods, manual wiring
- Inconsistent config
- Harder to test
- Custom HTTP handling or ad-hoc clients
- SQL scattered as strings

**Spring Boot service:**

- Clear layers (controller/service/repo)
- Dependency injection
- Profiles, actuators, standardized packaging
- Test slices and mocks

> **ELI5:** Refactoring into Spring Boot is reorganizing a messy toolbox into labeled drawers so the next engineer (and future you) can find the hammer without injury.

## Maven multi-module

**Maven** builds Java projects. Multi-module means one repo/parent with modules such as:

- `integration-api` (HTTP layer)
- `integration-core` (business logic)
- `integration-persistence` (JPA entities/repos)

Benefits: clearer boundaries, reuse, faster incremental builds, cleaner dependency direction.

## Dependency Injection (DI)

Instead of `new VendorClient()` everywhere, Spring injects dependencies:

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

Why interviewers care: testability (mock VendorClient), swappable implementations, less hidden coupling.

## Spring Data JPA

**JPA** maps classes to tables. **Spring Data JPA** gives repository interfaces:

```java
public interface StepRepository extends JpaRepository<BatchStepExecution, Long> {
  List<BatchStepExecution> findByStatusAndBusinessDate(String status, LocalDate date);
}
```

You still must understand SQL — frameworks don’t replace indexing/recon thinking.

## OOP / SOLID (practical, not textbook dump)

Talk through **your** service:

| Idea | Example in your system |
|------|------------------------|
| Encapsulation | Step state transitions behind a service method |
| Single Responsibility | VendorClient ≠ ReconService ≠ ReplayController |
| Open/Closed | New vendor error mapper without rewriting core loop |
| Dependency Inversion | Depend on `VendorClient` interface, not a concrete SDK class |
| Patterns | Strategy for retry policy; State for step lifecycle; Adapter for vendor API |

## Testing

- **Unit tests:** service logic with Mockito mocks  
- **Integration tests:** DB + HTTP slices where valuable  
- **Code reviews:** catch missing failure handling, bad transactions, secret leaks  

Example mindset:

```java
@Test
void marksFailedOnTimeout() {
  when(vendorClient.update(any())).thenThrow(new SocketTimeoutException());
  // assert status == FAILED, not SUCCESS
}
```

## 30-second pitch

> I refactored legacy Core Java into a Maven multi-module Spring Boot service with JPA, clear layering, SOLID-minded design, and JUnit/Mockito coverage — making the integration code testable and safer to change.

## Interview Q&A

<details>
<summary>@RestController vs @Controller?</summary>

`@RestController` = `@Controller` + `@ResponseBody` — return values serialize to JSON directly.

</details>

<details>
<summary>What does @Transactional do?</summary>

Wraps a method in a DB transaction. Default rollback on unchecked exceptions. Critical when writing business row + outbox/step updates together.

</details>

<details>
<summary>Why fat JAR later (bullet 7)?</summary>

Spring Boot packs app + dependencies into one runnable artifact for consistent deploys across envs.

</details>

Next: [Kafka events](#/07-kafka)
