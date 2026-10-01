# Barclays Bullet 4 — Spring Refactor

Refactored Core Java into Maven multi-module Spring Boot / Spring MVC service with Spring Data JPA; OOP, SOLID, design patterns; Unix Shell during cutover; JUnit/Mockito, integration testing, code reviews.

**30 seconds** Integration layer was a Core Java monolith. I split it into Maven multi-module Spring Boot with MVC layers and JPA, added unit/integration tests, and kept Unix Shell jobs running through phased cutover.

## Maven module layout

payment-integration-parent (pom)
├── integration-api          # @RestController, request/response DTOs, validation
├── integration-service      # business logic, vendor clients, @Service
├── integration-persistence  # @Entity, JpaRepository
├── integration-common       # exceptions, constants, shared utils
└── integration-app          # @SpringBootApplication, config, main()
  

**Q:** SOLID — one example each from your codebase

- **S:** `VendorPaymentClient` only HTTP; `PaymentSyncService` orchestrates — not 800-line god class.
- **O:** `RetryPolicy` interface; `ExponentialBackoffPolicy` vs `NoRetryPolicy` without changing caller.
- **L:** Mock `VendorClient` in tests substitutes real impl.
- **I:** Separate `TokenizationReconPort` from fat `IntegrationService`.
- **D:** Constructor inject `VendorClient`, `BatchStepRepository` — no `new RestTemplate()` in services.

**Q:** Design patterns — explain three

**Strategy:** Pluggable retry/backoff for vendor calls.
**Template Method:** Abstract `BatchStepTemplate` with `validate()`, `execute()`, `onFailure()` hooks.
**Adapter:** Wrap legacy shell script exit codes into Spring `BatchResult` DTO for TWS.
**Repository:** Spring Data JPA hides SQL for CRUD.
**Factory:** Build vendor-specific request payloads from internal canonical model.

**Q:** Testing pyramid

**Unit (JUnit 5 + Mockito):** service logic, retry rules, mapping — fast, no Spring context.
**Slice tests:** `@WebMvcTest` for controllers; `@DataJpaTest` for repos.
**Integration:** `@SpringBootTest` + Testcontainers MySQL or H2; WireMock stubs vendor HTTP.
**CI:** `mvn test` in Jenkins; fail build on coverage drop (if enforced).
**Code review:** check exception handling, SQL injection, missing tests for bug fixes.

**Q:** Sample Mockito test talking point

@Test
void marksStepFailedOnVendorTimeout() {
  when(vendorClient.submit(any())).thenThrow(new ResourceAccessException("timeout"));
  service.processFile("pay_001.dat");
  BatchStepExecution step = repo.findByFileName("pay_001.dat");
  assertEquals(StepStatus.FAILED, step.getStatus());
  assertTrue(step.getErrorMessage().contains("TIMEOUT"));
}
  

**Q:** Unix Shell during cutover — what did you actually do?

Fixed paths when NFS mount changed; added logging to legacy scripts; wrapped Spring JAR invocation from shell with exit code mapping; debugged `chmod` and env var issues; coordinated with ops on TWS job definition updates. Frame as “maintained and extended,” not primary skill.

Spring Boot internals they might ask

**Q:** How does Spring Boot auto-configuration work?

`@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + component scan. `spring.factories` / `AutoConfiguration.imports` load conditional beans (e.g. DataSource if JDBC on classpath).

**Q:** @Transactional — common mistake?

Self-invocation bypasses proxy — transaction won't start. Default propagation REQUIRED; rollback on RuntimeException. Long transactions holding DB connections during vendor HTTP call — fix: shorten transaction boundary around DB only.

**Q:** Spring MVC vs Spring WebFlux?

You used servlet-stack MVC (Tomcat embedded) — thread-per-request, blocking vendor calls moved to @Async pool. WebFlux is reactive — not your stack unless you say otherwise.
