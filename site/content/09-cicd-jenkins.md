# Jenkins, fat JAR, Veracode (Barclays bullet 7)

## Resume bullet

> Packaged the service as an executable **fat JAR** and wired **Jenkins** pipelines to build and promote it through test, staging, and production, cutting release cycle time by **25%** while keeping **Veracode** at **zero critical** findings.

## Teach first: what is a fat JAR?

A **JAR** is a Java archive. A **fat/uber JAR** packages your code **plus dependencies** into one runnable file.

```bash
java -jar integration-service.jar
```

Why it helps:

- Same artifact shape in every environment
- Fewer “works on my machine” dependency mismatches
- Simple ops runbook

Spring Boot’s packaging model makes this standard.

## What is CI/CD with Jenkins?

**Jenkins** is an automation server. A pipeline might look like:

```
Checkout
  → Maven build
  → Unit tests
  → Integration tests
  → Veracode / SAST scan
  → Package fat JAR
  → Deploy to Test
  → Smoke tests
  → Gate / approvals
  → Staging → Production
```

> **ELI5:** Jenkins is a robot assembly line. Every code change goes through the same inspections before it can ship.

## Environments

| Env | Purpose |
|-----|---------|
| Dev | Developer experimentation |
| Test/SIT | Integrated testing |
| Staging | Production-like validation |
| Prod | Real traffic |

Promotion rules + credentials differ per env. Secrets live in Jenkins credentials / vault — never in Git.

## What is Veracode?

**Veracode** is a **SAST** tool (Static Application Security Testing). It scans for vulnerabilities like:

- SQL injection patterns
- Insecure cryptography
- Hardcoded secrets
- Known dangerous APIs

**Zero critical findings** means your release gate rejected severe issues — a strong compliance signal for banks and for IB.

## Why −25% release cycle time?

Before: manual steps, inconsistent builds, waiting on ad-hoc packaging.  
After: standardized pipeline, repeatable artifact, fewer handoffs/errors.

Be ready to define cycle time as commit → production for your service.

## 30-second pitch

> I packaged the Spring Boot service as a fat JAR and automated build/test/security-scan/promote in Jenkins across test, staging, and prod. Release cycle time dropped about 25%, with Veracode staying at zero criticals.

## Interview Q&A

<details>
<summary>Build tool?</summary>

Maven (multi-module). Can discuss `mvn test package` and modules.

</details>

<details>
<summary>How do you prevent bad prod deploys?</summary>

Tests + Veracode gates + environment promotions + smoke checks + rollback plan (previous JAR).

</details>

<details>
<summary>Config across envs?</summary>

Spring profiles / externalized config; secrets not baked into JAR.

</details>

Next: [RAG ops agent](#/10-rag-ops-agent)
