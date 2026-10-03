# Spring Boot refactor

**Resume line:** You refactored Core Java into a Maven multi-module Spring Boot service with Spring Data JPA. You applied OOP, SOLID, and design patterns. You added JUnit and Mockito tests, integration tests, and code reviews.

---

## 1. Say this first (30 seconds)

> I moved legacy Core Java into a Maven multi-module Spring Boot service. The service uses Spring Data JPA, clear layers, and JUnit with Mockito. The code is easier to test and safer to change.

---

## 2. Words you must know

| Word | Meaning |
|------|---------|
| Core Java | Plain Java with manual wiring and uneven structure |
| Spring Boot | Framework with DI, web server, config profiles, and easy packaging |
| DI | Dependency injection. Spring supplies collaborators |
| Maven module | A build unit with a clear boundary |
| JPA repository | Interface that maps entities to SQL tables |
| `@Transactional` | Method runs inside a database transaction |

---

## 3. How it works

Request path:

```
HTTP → Controller → Service → Repository / JPA → DB
                 → Vendor client (outside long DB transactions)
```

Typical modules:

- `api` — HTTP layer
- `core` — business rules
- `persistence` — entities and repositories

---

## 4. SOLID in your words

| Idea | Your example |
|------|----------------|
| Single responsibility | Vendor client is not the recon service |
| Dependency inversion | Depend on a `VendorClient` interface |
| State transitions | Step status changes stay behind a service method |

---

## 5. Test example

```java
@Test
void marksFailedOnTimeout() {
  when(vendorClient.update(any())).thenThrow(new SocketTimeoutException());
  // assert status == FAILED, not SUCCESS
}
```

---

## 6. Say this (2 minutes)

> The old code was Core Java with weak structure and weak tests. I refactored it into Spring Boot with Maven modules. Controllers handle HTTP. Services hold business rules. Repositories persist step state. Constructor injection makes unit tests simple with Mockito. We keep vendor HTTP calls out of long database transactions. Code review and tests catch bad failure handling before release.

---

## 7. Top questions

<details>
<summary>@RestController vs @Controller?</summary>

`@RestController` equals `@Controller` plus `@ResponseBody`. Return values become JSON.

</details>

<details>
<summary>What does @Transactional do?</summary>

Spring opens a DB transaction around the method. Unchecked exceptions trigger rollback by default.

</details>

<details>
<summary>Why a fat JAR later?</summary>

One runnable artifact. The same shape runs in each environment.

</details>

---

## 8. Blind check

- [ ] Draw controller → service → repository.
- [ ] Explain one `@Transactional` trap.
- [ ] Speak the 30-second answer.

Next: [Kafka events](#/07-kafka)
