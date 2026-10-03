# Jenkins, fat JAR, Veracode

**Resume line:** You packaged the service as an executable fat JAR. You wired Jenkins pipelines through test, staging, and production. Release cycle time fell by about 25%. Veracode stayed at zero critical findings.

---

## 1. Say this first (30 seconds)

> I package the Spring Boot service as a fat JAR. Jenkins builds, tests, scans, and promotes the artifact through test, staging, and production. Release cycle time fell by about 25%. Veracode stayed at zero criticals.

---

## 2. Words you must know

| Word | Meaning |
|------|---------|
| Fat JAR | One file with your code and dependencies |
| Jenkins pipeline | Automated build, test, scan, and deploy steps |
| Veracode | SAST tool. Finds security issues in the build |
| Promote | Move the same artifact to the next environment |

---

## 3. How it works

```
Checkout → Maven build → unit tests → integration tests
  → Veracode scan → package fat JAR
  → deploy test → smoke → gate → staging → production
```

Environment order: Dev → Test or SIT → Staging → Prod.

Secrets stay in Jenkins credentials or a vault. Secrets do not stay in Git.

---

## 4. Say this (2 minutes)

> Before the pipeline, packaging and promotion had manual steps and delays. I standardized on a Spring Boot fat JAR and a Jenkins pipeline. Every change gets the same build, tests, and Veracode gate. We promote one artifact across environments. That cut release cycle time by about 25% for the service and kept critical Veracode findings at zero.

---

## 5. Top questions

<details>
<summary>What is Veracode?</summary>

A static application security test in CI. It blocks severe issues before production.

</details>

<details>
<summary>How do you prevent a bad prod deploy?</summary>

Tests, Veracode gates, environment promotion, smoke checks, and rollback to the previous JAR.

</details>

<details>
<summary>How does config differ by environment?</summary>

Spring profiles and external config. Secrets are not baked into the JAR.

</details>

---

## 6. Blind check

- [ ] List the pipeline stages in order.
- [ ] Explain fat JAR in one sentence.
- [ ] Speak the 30-second answer.

Next: [RAG ops agent](#/10-rag-ops-agent)
