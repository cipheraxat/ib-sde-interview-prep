# Backend basics (from zero)

If an interviewer asks “what do you do?”, you should be able to explain backend work like you’re teaching a smart friend.

## What is a backend?

A **frontend** is what users see (web UI, mobile app).  
A **backend** is the server-side software that:

- Accepts requests (often over HTTP)
- Applies business rules
- Talks to databases and other services
- Returns results (JSON, files, status codes)

> **ELI5:** Frontend is the restaurant dining room. Backend is the kitchen + inventory + recipes. Guests never see the kitchen, but if the kitchen is wrong, the meal is wrong.

> **On your resume:** You build **Java / Spring Boot** backends that other systems call (IBM TWS batch jobs, ops tools, vendor APIs) — not customer-facing trading screens.

## Client vs server

- **Client:** the caller (browser, mobile app, another service, a scheduler)
- **Server:** your Spring Boot app listening on a port (e.g. 8080)

In your world, a common client is **IBM TWS** saying “run this job now” by calling your HTTP API or a shell wrapper that calls it.

## What is an API?

**API = Application Programming Interface** — a contract for how one program talks to another.

For backends, that often means **REST over HTTP**:

| Method | Typical meaning | Example |
|--------|-----------------|---------|
| GET | Read | Get payment status |
| POST | Create / trigger action | Start payment sync |
| PUT | Replace / update | Update status to SETTLED |
| DELETE | Remove | Rare in banking cores; be careful |

### HTTP status codes (know these)

| Code | Meaning | Interview use |
|------|---------|---------------|
| 200 | OK | Success |
| 201 | Created | New resource |
| 202 | Accepted | Async work started |
| 400 | Bad request | Client sent invalid data |
| 401/403 | Auth / forbidden | Security |
| 404 | Not found | Missing resource |
| 409 | Conflict | Duplicate / state conflict |
| 500 | Server error | Your bug or unhandled failure |
| 502/503/504 | Bad gateway / unavailable / timeout | Dependency problems |

> **Interview tip:** Never say “we return 200 even if vendor timed out.” Your resume story is the opposite: timeout/non-2xx ⇒ mark step **FAILED**.

## What is REST?

**REST** is a style of API design using HTTP resources and verbs.

Good REST habits for interviews:

- Clear URLs (`/payments/{id}/status`)
- Stateless requests (each call carries what it needs + auth)
- Idempotent updates where possible (replaying PUT doesn’t double-charge)
- Versioning sometimes (`/v1/...`)

## What is Java? Why do banks use it?

**Java** is a strongly typed language that runs on the **JVM**. Banks like it because:

- Mature ecosystem
- Strong typing catches many bugs before production
- Huge hiring pool
- Great libraries for SQL, HTTP, messaging, security
- Long-term maintainability for large codebases

> **On your resume:** Day job language = **Java**. Python appears for the RAG ops agent and Samsung internship.

## What is Spring Boot?

**Spring** is a Java framework. **Spring Boot** makes it easy to run a production-ready app with:

- Embedded web server (Tomcat)
- Dependency injection (wiring components)
- Config profiles (dev / test / prod)
- Spring Data JPA (DB access)
- Actuator (health endpoints)
- Easy testing with JUnit / Mockito

> **ELI5:** Writing plain Java servlets is like building a car from raw metal. Spring Boot is like getting a reliable chassis with seats and brakes already installed so you can focus on the route (business logic).

### MVC in one minute

- **Model:** data + business entities (e.g. `BatchStepExecution`)
- **View:** UI (less relevant for your API services)
- **Controller:** HTTP entrypoint (`@RestController`)
- **Service:** business logic
- **Repository:** database access

Request flow:

```
HTTP request
   → Controller (validate input)
   → Service (business rules, call vendor, emit events)
   → Repository / JPA (persist state)
   → HTTP response
```

## Databases: SQL vs NoSQL (high level)

**SQL / relational** (MySQL, Oracle, PostgreSQL):

- Tables, rows, columns
- Strong consistency and transactions (ACID)
- Great for money, accounts, recon, step state

**NoSQL** (Redis, Mongo, etc.):

- Different models (key-value, document, etc.)
- Often used for cache, sessions, speed

> **On your resume:** Source of truth is **SQL** (MySQL control DB, Oracle reporting). **Redis** may appear in skills/projects as cache — don’t claim Redis as your Barclays core unless you used it there.

### What is SQL reconciliation?

**Recon** = compare two systems and find mismatches.

Example: “We sent 100K accounts to vendor. Did vendor store a token for each?”

```sql
-- Conceptual: accounts expected but missing on vendor side
SELECT s.account_id
FROM integration_account_status s
LEFT JOIN vendor_token_snapshot v ON v.account_id = s.account_id
WHERE s.expected_token = TRUE
  AND v.token_id IS NULL;
```

## What is CI/CD?

- **CI (Continuous Integration):** every commit builds + tests automatically  
- **CD (Continuous Delivery/Deployment):** promote artifacts to environments with gates

Your tools: **Git**, **Jenkins**, **Maven**, **Veracode** (security scan), fat JAR packaging.

Environments typically: Dev → Test/SIT → Staging → Production.

## What is Linux / Unix Shell?

Your services run on **Linux** servers. **Unix Shell** scripts often wrap batch jobs historically (cron, file moves, calling Java).

During migration you may still maintain shell wrappers while logic moves into Spring Boot.

## Put it together: one sentence for IB

> “I’m a backend Java engineer. I build Spring Boot services that run on Linux, talk to databases with SQL, integrate with other systems over REST, publish events on Kafka, and get released through Jenkins with security scanning — with strong focus on correctness under failure.”

## Mini self-check

<details>
<summary>Quiz yourself (open after trying)</summary>

1. What does a 504 usually imply? → Upstream timeout / gateway timeout.  
2. Why prefer SQL for payment step state? → Transactions, constraints, queryability, audit.  
3. What does idempotent mean? → Doing the same request twice doesn’t create duplicate side effects.  
4. Controller vs Service? → HTTP boundary vs business logic.

</details>

Next: [Your story & framing](#/02-framing-and-story)
