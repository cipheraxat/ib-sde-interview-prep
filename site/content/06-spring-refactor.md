# Spring Boot refactor

**On your resume:** You took an older plain-Java integration program and turned it into a **Maven multi-module Spring Boot** service with **JPA** for the database, plus **unit tests** (JUnit and Mockito) and code review.

**In the night:** This is how that service’s code was structured, so a test can prove the timeout rule from the [async story](#/05-async-throughput).

---

## STAR — the story

### S — Situation (what the world looked like)

This is the same timeout bug from the [async story](#/05-async-throughput), seen from inside the code. The integration logic existed, but it was **plain Java**: a program that started from a `main` method, objects created with `new` all over the place, configuration copied between environments, and SQL strings mixed into the business rules. There were few tests.

That matters because the dangerous bug in this area is subtle. A vendor call times out, and the code still records success. In a messy codebase you cannot easily **prove** that a timeout becomes FAILED before you ship. Every change felt risky. People were afraid to touch the failure path.

### T — Task (what you were asked to do)

Restructure the same business behavior so a new engineer can see where HTTP stops and database work starts, and so you can **test the failure path** without calling the real vendor.

### A — Action (what you actually changed)

You split the program into clear layers and Maven modules:

```
HTTP request
  → Controller   (check the input, return a status code)
  → Service      (the business rule: when is this SUCCESS or FAILED?)
  → Repository   (save the step row with JPA)
The vendor HTTP call sits beside this, not inside a long database transaction.
```

What that means in practice:

- **Controller** is the door. It does not contain the payment rules.
- **Service** decides the status change. Other classes do not randomly set SUCCESS.
- **Repository** is how you read and write the step table. Spring Data JPA saves you from hand-written boilerplate, but you still need to understand the SQL.
- **Constructor injection** means the service receives its vendor client in the constructor. In a test you pass a **fake** client (Mockito). You tell the fake client to throw a timeout, then you assert the status is **FAILED**.
- Code review looks for “did we forget the failure case?” before the change merges.

You did not rewrite the bank’s scheduler. You made **your** service understandable and testable.

### R — Result (what changed)

The integration behavior stayed the same for the business, but changes became safer. The class of bug “timeout stored as success” can be caught by a unit test instead of by a bad night in production. The same structure later packages as one runnable JAR for the release pipeline.

---

## Say it in about 60 seconds

> The integration code was plain Java with weak tests, so we could not easily prove what happens on a vendor timeout. I refactored it into Spring Boot with separate layers: the HTTP door, the business rules, and the database. Tests use a fake vendor client. If that fake client times out, the test expects the step to be FAILED. We also do not keep a database transaction open while we wait on the vendor, because that holds connections for too long.

---

## If they ask more

The spoken story is the timeout test with a fake vendor client. Answer the rows below only if they ask.

| They say | You answer in plain words |
|----------|---------------------------|
| What is dependency injection? | The framework hands the service the objects it needs. Tests can hand it a fake. |
| What is a transaction trap? | If you open a database transaction and then wait 10 seconds on HTTP, you occupy a connection the whole time. Save, call, then save the result. |
| Only if they ask: what is N+1? | You load 100 parent rows, then the code quietly runs one extra query per row. Fix it by loading the related data in one query. This was not the story of the refactor. |

## If they ask for code

This is the test you write first. A fake vendor throws a timeout. The assertion is that the status is FAILED, and SUCCESS was never saved.

```java
@Test
void timeoutIsFailed() {
    VendorClient vendor = mock(VendorClient.class);
    StepRepository steps = mock(StepRepository.class);
    when(vendor.sync(any())).thenThrow(new ResourceAccessException("read timed out"));

    PaymentService service = new PaymentService(vendor, steps);
    service.sync("step-1");

    verify(steps).mark("step-1", Status.FAILED);
    verify(steps, never()).mark(any(), eq(Status.SUCCESS));
}
```

The service takes its collaborators in the constructor. The test passes the fakes in. Spring does the same wiring in production.

```java
@Service
public class PaymentService {
    private final VendorClient vendor;
    private final StepRepository steps;

    public PaymentService(VendorClient vendor, StepRepository steps) {
        this.vendor = vendor;
        this.steps = steps;
    }
}
```

Say this if they ask about transactions: `@Transactional` stays on the save methods. It does not wrap `vendor.sync`, because that call can take seconds.

## Blind check

- [ ] Explain why the old code was risky, not just “it was legacy”
- [ ] Name the three layers and what each one refuses to do
- [ ] Describe the timeout test in one sentence
- [ ] Write that test: fake client throws, verify FAILED, verify SUCCESS never happens

Next: [Kafka events](#/07-kafka)
