# Jenkins, fat JAR, Veracode

**Resume:** Executable **fat JAR**. **Jenkins** promotes test → staging → production. Release cycle **about 25% shorter**. **Veracode** stayed at **zero critical** findings.

---

## STAR — the story

### S — Situation (the problem)

Shipping the integration service took too long and varied by person. Builds were manual. The “same” binary was not always the same across test and production. Security review happened late. A bad package could reach prod before anyone scanned it.

### T — Task (your job)

Make **one artifact** and **one pipeline** so every change is built, tested, scanned, and promoted the same way. Cut the time from commit to production for **this service**.

### A — Action (what you did)

1. Package Spring Boot as a **fat JAR** (your code + libraries + server in one file: `java -jar ...`).
2. Jenkins stages, in order:

```
Checkout → Maven test and package → Veracode scan
  → deploy Test → smoke check → approve
  → Staging → Production
```

3. **Same JAR** moves forward. You do not rebuild a different binary for prod.
4. Secrets stay in Jenkins or a vault. They are **not** in Git and not baked into the JAR.
5. Config uses Spring profiles. Rollback = the **previous JAR**.

**Veracode** is static security scanning (injection, bad crypto, hardcoded secrets). A **critical** finding blocks the pipeline.

### R — Result

Release cycle time for the service fell by about **25%**. Critical Veracode findings stayed at **zero** because the gate runs before promotion.

---

## Say the STAR in 60 seconds

> Releases were slow and inconsistent, and security checks were late. I package the service as one fat JAR and run it through Jenkins: build, test, Veracode, then the same file goes to test, staging, and production. Secrets are not in the JAR. Rollback is the previous JAR. Cycle time dropped about 25%, and we kept critical scan findings at zero.

---

## If they go deeper

| Env | Use |
|-----|-----|
| Dev | Local / developer |
| Test or SIT | Integrated test |
| Staging | Prod-like |
| Prod | Real traffic |

<details>
<summary>How do you stop a bad prod deploy?</summary>
Tests fail the build. Veracode fails the build. Smoke checks run after deploy. Rollback is the last good JAR.
</details>

## Blind check

- [ ] Tell S-T-A-R without notes
- [ ] List pipeline stages in order
- [ ] Say what a fat JAR is in one sentence

Next: [RAG ops agent](#/10-rag-ops-agent)
