# Jenkins, fat JAR, Veracode

**Resume:** Executable **fat JAR** + **Jenkins** promote test→staging→prod. Release cycle **−25%**. **Veracode** zero critical.

---

## 1. Say this first (30s)

> Fat JAR + Jenkins build/test/scan/promote across envs. ~25% faster release cycle; Veracode criticals stayed at zero.

---

## 2. Words

| Word | Meaning |
|------|---------|
| Fat/uber JAR | Code + deps (+ embedded server) one runnable |
| Pipeline | Automated stages same every commit |
| Promote | Same artifact → next env |
| Veracode / SAST | Static scan for vulns in CI |
| Smoke test | Tiny prod-like check after deploy |
| Rollback | Prior JAR / prior release |

---

## 3. How it works

```
Checkout → mvn test/package → Veracode gate
  → fat JAR → deploy Test → smoke → approve
  → Staging → Prod
```

**Envs:** Dev → Test/SIT → Staging → Prod.  
**Secrets:** Jenkins credentials/vault — never Git.  
**Config:** Spring profiles / external config; not baked secrets in JAR.  
**25%:** define as commit→prod time for **your** service (fill evidence in Personal facts).

| Veracode finds | Examples |
|----------------|----------|
| Injection patterns, bad crypto, hardcoded secrets | Gate fails on critical |

---

## 4. Say this (2 min)

> Manual packaging caused delay and drift. Standardized Spring Boot fat JAR + Jenkins: every change gets build, tests, Veracode, then promote one artifact. Cut cycle time ~25%; kept critical findings at zero; rollback = previous artifact.

---

## 5. Top questions

<details><summary>Prevent bad prod?</summary>
Tests + Veracode + promotion gates + smoke + rollback plan.
</details>
<details><summary>Build tool?</summary>
Maven multi-module; `test`/`package`; modules mirror api/core/persistence.
</details>
<details><summary>Config by env?</summary>
Profiles + externalized props; secrets injected at runtime.
</details>
<details><summary>Zero critical — how kept?</summary>
CI gate blocks; fix before merge; periodic scans on main.
</details>

---

## 6. Blind check

- [ ] Pipeline stages in order
- [ ] Fat JAR one-liner
- [ ] Speak 30s cold

Next: [RAG ops agent](#/10-rag-ops-agent)
