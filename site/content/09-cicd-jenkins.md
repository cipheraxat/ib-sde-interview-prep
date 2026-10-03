# Jenkins, fat JAR, Veracode (Barclays bullet 7)

## Resume bullet

> Packaged the service as an executable **fat JAR** and wired **Jenkins** pipelines to build and promote it through test, staging, and production, cutting release cycle time by **25%** while keeping **Veracode** at **zero critical** findings.

---

## The whole story

Shipping integration code by hand — “build on my laptop, copy an artifact, hope prod matches test” — does not survive a regulated bank for long. As the Spring Boot service became real production infrastructure (batch, replay, Kafka), releases needed to be:

- **Repeatable** (same artifact shape every time)  
- **Tested** before promotion  
- **Security-scanned**  
- **Promotable** through environments with gates  

I packaged the app as a Spring Boot **executable fat JAR** (app + dependencies in one runnable artifact) and wired **Jenkins** pipelines to:

1. Checkout  
2. Maven build  
3. Unit / integration tests  
4. **Veracode** SAST scan  
5. Package fat JAR  
6. Deploy to test → smoke  
7. Promote to staging → production with approvals/gates  

That standardization cut **release cycle time ~25%** for our service (commit → prod path), and we kept **Veracode critical findings at zero** as a release gate — not a suggestion.

This bullet shows you understand **how code becomes production**, not only how features work in isolation.

---

## 30-second pitch

> I packaged our Spring Boot integration service as an executable fat JAR and automated build, test, Veracode scan, and environment promotion in Jenkins. Release cycle time dropped about 25%, and we kept zero critical Veracode findings as a hard gate.

---

## 2-minute interview script

> “Once the integration service owned real batch and recovery paths, releases had to be boring — in a good way. I moved us to a Spring Boot fat JAR so every environment runs the same artifact style: `java -jar …` with externalized config and secrets from the vault, not baked into source.  
>  
> Then I wired Jenkins so every change goes through Maven build, automated tests, and Veracode static scanning before it can promote. Test first, then staging, then production, with the same artifact promoted upward rather than rebuilding differently per environment.  
>  
> That removed a lot of manual packaging and ‘works on my machine’ drift. We measured roughly a 25% reduction in release cycle time for the service. And Veracode wasn’t optional — critical findings block the pipeline. We maintained zero criticals, which matters for bank audit posture.”

---

## Teach the concepts

### Fat JAR

One runnable archive with your code + dependencies.

```bash
java -jar integration-service.jar
```

Why: consistent ops runbook, fewer missing-dependency surprises, simple promotion.

### CI/CD with Jenkins

> **ELI5:** A robot assembly line. Every change gets the same inspections before shipping.

Typical stages:

```
Checkout → Build → Unit tests → Integration tests
  → Veracode/SAST → Package JAR → Deploy Test → Smoke
  → Approval gates → Staging → Production
```

### Environments

| Env | Purpose |
|-----|---------|
| Dev | Experimentation |
| Test/SIT | Integrated testing |
| Staging | Prod-like validation |
| Prod | Real traffic |

Config via Spring profiles / external config. **Secrets never in Git.**

### Veracode = SAST

Static Application Security Testing — scans for SQL injection patterns, bad crypto, hardcoded secrets, dangerous APIs, etc.

**Zero critical** = severe issues are release-blocking.

### What −25% means

Be ready: baseline commit-to-prod time vs after pipeline. Fewer handoffs, fewer failed manual packages, faster confident promote.

---

## Deep interview Q&A

<details>
<summary>Why promote the same artifact?</summary>

Rebuilding per environment can introduce “it changed between test and prod.” Build once, promote the verified JAR; only config/secrets differ.

</details>

<details>
<summary>How do you rollback?</summary>

Redeploy previous known-good JAR; feature flags where applicable; DB migrations must be backward compatible or versioned carefully.

</details>

<details>
<summary>What if Veracode finds something?</summary>

Treat by severity. Critical/high: fix or formally waive with security process — don’t silently ignore. Pipeline stays red until resolved.

</details>

<details>
<summary>How does this relate to earlier bullets?</summary>

Safer packaging for async workers, replay API, Kafka publisher — the same artifact carries those capabilities through envs with tests that assert failure semantics.

</details>

<details>
<summary>Maven’s role?</summary>

Multi-module build, dependency management, `test` + `package` lifecycle, reproducible CI commands.

</details>

---

## Practice checklist

- [ ] Explain fat JAR in one sentence  
- [ ] Recite pipeline stages  
- [ ] Define Veracode/SAST  
- [ ] Explain build-once/promote  
- [ ] Define how you measure 25%  

**Next:** [RAG ops agent](#/10-rag-ops-agent)
