# Open Source — Deep Prep

OSS proves you read large codebases, take review feedback, and ship. Expect 5–10 minutes on one PR if they’re interested.

## VS Code PR \#330754 — Tab close-button column

Reserved Modern UI tab close-button column; fixed overlay on filename.

**Q:** Describe the bug and root cause.

Modern UI tabs: close button absolutely positioned on the right overlapped the filename label’s clickable area — users trying to select/focus tab accidentally closed it. Root cause: label used full width without reserving space for close control.

**Q:** Your fix?

Reserve 28px right column for close button in tab layout CSS/TS — label hit-target excludes that column. Close button only visible on hover in reserved zone.

**Q:** How to contribute to VS Code?

Fork microsoft/vscode → yarn install → compile → reproduce in Code OSS → fix → `yarn watch` → test → sign CLA → PR with issue link → iterate on CI and reviewer feedback.

## VS Code PR \#331612 — Panel tab centering

Fixed panel title tab vertical centering in 32px header (Modern UI).

Classic UI had 1px top border eating layout space; Modern UI tabs appeared off-center (5px vs 3px). Fix: adjust border/padding so symmetric 4px vertical padding in 32px header. Shows CSS layout debugging in complex desktop app.

## Playwright PR \#41845 — Token bypass client name

VS Code extension connect path for token-bypass authentication omitted client name parameter. Server couldn’t identify client session correctly. One-line fix in connection setup — good story for careful API contract reading and extension debugging.

## Kubernetes PR \#140447 — EndpointSlice metric `_total`

Renamed `endpoint_slice_controller_changes` to `endpoint_slice_controller_changes_total` per stable metrics conventions.

**Q:** Why does this matter?

Kubernetes stable metrics rules: counters must have `_total` suffix for Prometheus compatibility and graduation from ALPHA to BETA/GA. Misnamed metrics cannot graduate — must add new metric, deprecate old, dual-publish during migration.

**Q:** What is EndpointSlice?

Scalable replacement for Endpoints object — groups network endpoints for a Service. Controller emits metrics on changes for monitoring/control plane health.

**Q:** How navigate K8s codebase?

Find metric registration in `staging/src/k8s.io/endpointslice` controller; follow Prometheus patterns in codebase; run unit tests; respond to sig-instrumentation reviewers; CI must pass.

## Apple Pkl PR \#1383 — `super` in `let`

Pkl config language: method resolution for `super` inside `let` expressions was wrong due to scope/evaluator bug. Fixed runtime evaluator. Story: “I can debug unfamiliar language runtime with tests.”

Generic OSS interview questions

**Q:** Why contribute to OSS?

Learn production code standards; give back to tools I use daily; practice code review at scale; demonstrates initiative beyond day job.

**Q:** Hardest review comment you addressed?

Prepare one: naming, test coverage, edge case, CLA, or CI flake — show humility and iteration.
