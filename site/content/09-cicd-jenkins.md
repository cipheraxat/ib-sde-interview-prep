# Jenkins and releases

**On your resume:** You packaged the service as one **runnable JAR**, released it through **Jenkins**, cut the release cycle by about **25%**, and kept **Veracode** clean of critical findings.

**In the night:** This is how that Spring service was built, scanned, and released.

---

## STAR — the story

### S — Situation (what the world looked like)

Shipping the integration service used to be slower and more fragile than the code changes themselves. A release meant remembering a list of steps: build on someone’s machine, copy files, set the right config for that environment, hope nothing was missed. A change merged on Tuesday might reach production the next week, because the same build, test, and scan waited on people remembering the steps. Each extra manual step is a place to ship the wrong build or skip a security scan.

The bank also scans code with **Veracode** before it is allowed out. A critical finding blocks the release. That is a good thing, but only if the scan is part of the path every time, not a step people remember on good days.

### T — Task (what you were asked to do)

Make every release follow the same steps. Build, test, security scan, package, and deploy should not depend on someone remembering a checklist.

### A — Action (what you actually set up)

1. Maven builds a **fat JAR**: one file that contains the Spring Boot app and its libraries. The server runs `java -jar`. You are not copying a pile of loose class files.
2. **Jenkins** is the only door. A commit triggers the pipeline. The pipeline compiles, runs the unit tests (including the timeout-means-FAILED test), and fails the build if tests fail.
3. The same pipeline runs the **Veracode** scan (or waits on the scan result that policy requires). A **critical** finding stops the release. You fix the finding. You do not argue the scanner down for convenience.
4. Config for each environment (URLs, secrets) stays **outside** the JAR. The same build artifact is what you promote. You do not rebuild “a special prod version” on a laptop.
5. After the pipeline, that wait is the machine running the same steps. The release cycle got about **25% shorter** because those manual waits dropped out. That is not a claim that writing the code got 25% faster.

### R — Result (what changed)

Releases follow one pipeline. The cycle got about **25% shorter** because manual steps dropped out. Veracode stayed at **zero critical** findings on what you shipped. If a scan fails, the artifact does not go out.

---

## Say it in about 60 seconds

> Releases used to depend on manual steps, so it was easy to skip a test or a scan. A change merged on Tuesday might not reach production until the next week, because someone had to remember the next step. I put the Spring Boot service in one runnable JAR and let Jenkins build, test, scan, and package it the same way every time. Critical Veracode findings block the release. Cutting out those manual waits shortened the release cycle by about 25 percent.

---

## If they ask more

| They ask | You say |
|----------|---------|
| What is a fat JAR? | One archive you can run with `java -jar`. The app and libraries travel together. |
| What if Veracode is slow? | The release waits. A critical finding is a stop, not a warning you click past. |
| What is the 25% measuring? | Time from “ready to release” to “out,” after the manual steps were removed. Say your real baseline if they ask for dates. |

## Blind check

- [ ] Explain what was painful before the pipeline
- [ ] Name the order: build, test, scan, then the artifact can move
- [ ] Say what a critical finding does

Next: [RAG operations assistant](#/10-rag-ops-agent)
