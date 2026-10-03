# PII & tokenization (Barclays bullet 2)

## Resume bullet

> Drove system design (**HLD/LLD**) so vendor SaaS stores **tokenized PII**, not plaintext: on-prem data tokenized via **DPaaS**, encrypted in transit through **DTU** to AWS; batch recon confirms **100K+** accounts with fault-tolerant retries and **zero downtime**.

This is often your **best system-design story**. Master **proof**, **recovery**, and **cutover** — interviewers dig here.

---

## Teach first: What is PII?

**PII = Personally Identifiable Information** — data that can identify a person (name, national ID, account numbers tied to a person, etc.).

Banks treat PII as high-risk because of regulation, fraud, and reputational damage.

## Encryption vs hashing vs tokenization

| Technique | What it does | Reversible? | Typical use |
|-----------|--------------|-------------|-------------|
| Encryption | Scrambles with a key | Yes, with key | Protect data in transit/at rest |
| Hashing | One-way digest | No (in practice) | Passwords, checksums |
| Tokenization | Replace sensitive value with random token; real value in vault | Only via vault mapping | Card/account identifiers in downstream systems |

> **ELI5:** Encryption is locking a diary (key opens it). Tokenization is replacing your passport number with a coat-check ticket; the coat room (vault) holds the passport. The cafe only sees the ticket.

If vendor cloud is breached and only has tokens + no vault access, attackers don’t get raw PII.

## Zero-trust (practical meaning)

Don’t assume “inside the bank network = safe.” Every hop should authenticate, authorize, and minimize sensitive data exposure. Vendor SaaS should never need plaintext PII if tokens suffice.

## HLD vs LLD

**HLD:** constraints, trust zones, component/sequence diagrams, non-functionals, risks, rollout phases.  
**LLD:** table schemas + indexes, API contracts, state machine + retry policy, metrics, alerts, runbooks.

> **On your resume:** You **drove** HLD/LLD for the tokenization path — you didn’t invent the bank’s DPaaS product itself.

## Acronyms

| Term | Say this |
|------|----------|
| **DPaaS** | Bank tokenization platform: sensitive in → token out; vault stays on-prem |
| **DTU** | Approved encrypted pipeline on-prem → cloud with logging/checksums/audit |
| **Recon** | Batch comparing expected vs actual tokenization state |

## Data flow (draw this)

```
 ON-PREM                         TRANSIT                 AWS / VENDOR
┌────────────┐   ┌───────┐   ┌─────┐   ┌──────────────────────────┐
│ Source data│──▶│ DPaaS │──▶│ DTU │──▶│ SaaS stores tokens only  │
└────────────┘   └───────┘   └─────┘   └────────────▲─────────────┘
      │                                             │
      │              recon compares states ─────────┘
      ▼
┌────────────────────────────────────────┐
│ Recon batch: MySQL state + Oracle dumps│
│ match / mismatch → retry → alert       │
└────────────────────────────────────────┘
```

## State machine (account tokenization)

```
PENDING → IN_TRANSIT → CONFIRMED
   │           │
   └────────▶ FAILED → (retry < N) → PENDING
                     → (retry ≥ N) → MANUAL_REVIEW
```

---

# Proof — how you prove tokenization worked

Interviewers will ask: *“How do you know 100K+ accounts are actually tokenized — not just ‘job green’?”*

**Proof ≠ “pipeline finished.”** Proof = measurable evidence that vendor-side state matches expected tokenized state for the population in scope.

## What “proof” means here

You need three layers of evidence:

| Layer | Question it answers | Example |
|-------|---------------------|---------|
| **Control-plane proof** | Did *our* system record success correctly? | Status counts in `integration_account_status` |
| **Data-plane proof** | Does *vendor* actually hold an active token? | Join/compare against vendor snapshot / export |
| **Integrity proof** | Are we comparing the right population for the right day? | `business_date`, expected flags, row counts, checksums |

> **ELI5:** Finishing a delivery route isn’t proof packages arrived. You need signatures (vendor tokens) matched to the delivery list (expected accounts).

## Control tables you reason about

Conceptual columns (names can be sanitized in interview):

**`integration_account_status` (ours)**

| Column | Role in proof |
|--------|----------------|
| `account_id` | Join key |
| `expected_token` | In scope for tokenization? |
| `tokenization_status` | PENDING / IN_TRANSIT / CONFIRMED / FAILED / MANUAL_REVIEW |
| `token_ref` (optional) | Opaque reference we believe vendor should have |
| `attempt_count` | Retry depth |
| `last_error` | Why failed |
| `business_date` | Which run/cohort |
| `last_updated` | Freshness |

**`vendor_token_snapshot` (theirs, landed via export/API pull)**

| Column | Role in proof |
|--------|----------------|
| `account_id` | Join key |
| `token_id` | Present or null |
| `token_status` | ACTIVE / inactive |
| `as_of` | Snapshot time |

## Recon algorithm (say this out loud)

1. Fix a **cohort**: `business_date = D` (or migration wave id).  
2. Select expected population: `expected_token = TRUE`.  
3. Left-join vendor snapshot on `account_id`.  
4. Classify each row:
   - **MATCH:** vendor has ACTIVE token (and optional token_ref matches if you store one)  
   - **MISSING:** vendor token null  
   - **BAD_STATUS:** token exists but not ACTIVE  
   - **UNEXPECTED:** vendor has token but we didn’t expect (investigate)  
5. Aggregate counts + sample mismatch IDs for ops.  
6. Gate: cutover/wave success only if mismatch rate ≤ threshold (ideally 0 for critical waves).

## Whiteboard SQL — mismatches

```sql
-- Accounts that SHOULD be tokenized but are not confirmed on vendor side
SELECT s.account_id,
       s.tokenization_status AS our_status,
       v.token_id,
       v.token_status,
       s.attempt_count,
       s.last_error
FROM   integration_account_status s
LEFT JOIN vendor_token_snapshot v
       ON v.account_id = s.account_id
WHERE  s.expected_token = TRUE
  AND  s.business_date = :runDate
  AND  (
         v.token_id IS NULL
         OR v.token_status <> 'ACTIVE'
       );
```

## Whiteboard SQL — proof dashboard

```sql
-- Population health for a business date
SELECT tokenization_status, COUNT(*) AS cnt
FROM   integration_account_status
WHERE  business_date = :runDate
  AND  expected_token = TRUE
GROUP BY tokenization_status
ORDER BY cnt DESC;

-- Hard proof number interviewers want
SELECT COUNT(*) AS confirmed_count
FROM   integration_account_status s
JOIN   vendor_token_snapshot v ON v.account_id = s.account_id
WHERE  s.business_date = :runDate
  AND  s.expected_token = TRUE
  AND  s.tokenization_status = 'CONFIRMED'
  AND  v.token_status = 'ACTIVE';
```

## Checksums / counts (don’t skip this)

Before declaring “100K+ done”:

1. **Expected count** from source cohort (`COUNT(*)` where expected).  
2. **Sent count** (IN_TRANSIT + CONFIRMED + FAILED attempts that left on-prem).  
3. **Confirmed ∩ vendor ACTIVE** count.  
4. **Mismatch count** must be explained (retrying vs MANUAL_REVIEW).  
5. Optional: hash of sorted `account_id` list for wave vs vendor export to catch silent truncation.

## What you say when asked “how measured 100K+?”

> “100K+ is the distinct account population in migration/tokenization scope. Proof is not TWS green — it’s recon: for business_date D, expected accounts left-joined to vendor token snapshot, requiring ACTIVE token. We tracked CONFIRMED vs MISSING/BAD_STATUS until mismatches were cleared or parked in MANUAL_REVIEW with owners.”

## Proof traps (never say)

- “The batch job succeeded, so all accounts are tokenized.”  
- “Vendor said the file landed.”  
- “We checked a sample of 10 accounts.” (sample ≠ population proof; samples are for smoke only)

---

# Recovery — fault-tolerant retries & failure handling

Recovery answers: *What happens when tokenization/transfer/recon fails mid-flight for thousands of accounts?*

## Failure classes

| Class | Examples | Strategy |
|-------|----------|----------|
| **Transient** | DPaaS timeout, DTU blip, vendor 5xx, network | Retry with backoff; keep idempotent |
| **Deterministic / data** | Validation fail, unknown account mapping | Don’t blind-retry forever → FAILED / MANUAL_REVIEW |
| **Poison / systemic** | Vendor outage, bad schema change | Circuit break; pause wave; alert |
| **Partial wave** | Job dies after 40k of 100k | Resume from cursor; never restart whole population blindly |

## Idempotency (must say)

Re-sending the same account must not create duplicate conflicting tokens or corrupt vault mappings.

- Use stable **idempotency key** = `account_id` + `wave_id` (or business key DPaaS understands).  
- State transitions are monotonic where possible: don’t flip CONFIRMED → PENDING without explicit compensating action.  
- Recon is read-mostly; repair actions go through controlled retry/replay path.

## Retry policy (LLD-level answer)

Example policy you can defend:

| Attempt | Delay | Action |
|---------|-------|--------|
| 1 | immediate / short | Retry transient |
| 2 | ~1–5 min | Retry |
| 3 | ~15 min | Retry |
| ≥ N (e.g. 3–5) | — | `MANUAL_REVIEW` + page owner |

Persist on every attempt:

- `attempt_count++`  
- `last_error` (truncated, safe — no raw PII in logs)  
- timestamps  

## Resume / checkpointing

Backfill 100K+ in **chunks** (e.g. 500–2000 accounts):

1. Select next chunk: `status IN ('PENDING','FAILED') AND attempt_count < N ORDER BY account_id LIMIT :batch`.  
2. Process chunk.  
3. Commit per-account state (or small batches in a transaction).  
4. If job crashes, next run continues from remaining PENDING/FAILED — **not** from account #1 of the whole population.

> **Interview tip:** “Resumable” is the difference between a professional migration and a weekend fire drill.

## Recovery playbooks (ops-facing)

### A) Single account stuck IN_TRANSIT

1. Check DTU/vendor ack logs for correlation id.  
2. Pull fresh vendor snapshot for that account.  
3. If vendor ACTIVE → mark CONFIRMED (recon heal).  
4. If missing → requeue PENDING with new attempt (idempotent send).  
5. If ambiguous → MANUAL_REVIEW (do not guess SUCCESS).

### B) Wave mismatch spike overnight

1. Freeze new cutover gates.  
2. Classify mismatches (MISSING vs BAD_STATUS vs our FAILED).  
3. If vendor outage → pause retries; keep backlog.  
4. If bad mapping → stop automatic retries; fix mapping; controlled replay.  
5. Publish mismatch count + ETA to stakeholders.

### C) Suspected duplicate / wrong token

1. Treat as data incident — not silent overwrite.  
2. Compare vault mapping (on-prem) vs vendor token.  
3. Compensating action only via approved runbook (security involved).

## Recovery SQL helpers

```sql
-- Retry candidates
SELECT account_id, attempt_count, last_error, last_updated
FROM   integration_account_status
WHERE  business_date = :runDate
  AND  expected_token = TRUE
  AND  tokenization_status IN ('FAILED', 'PENDING')
  AND  attempt_count < :maxAttempts
ORDER BY last_updated
FETCH FIRST 1000 ROWS ONLY;  -- or LIMIT on MySQL

-- Escalations
SELECT account_id, attempt_count, last_error
FROM   integration_account_status
WHERE  business_date = :runDate
  AND  tokenization_status = 'MANUAL_REVIEW';
```

## What “fault-tolerant retries” means in one sentence

> Transient errors requeue with backoff and a hard attempt cap; progress is checkpointed per account; poison/systemic failures pause the wave; nothing is marked CONFIRMED without vendor-side proof.

---

# Cutover — zero-downtime steps in detail

Cutover answers: *How do you switch reality to the tokenized path without an outage?*

**Zero downtime** here means customers/ops keep processing; you do **not** take a big-bang weekend cut where plaintext and tokens thrash inconsistently.

## Principles

1. **Dual-running / parallel validation** before authority flips.  
2. **Wave-based** population (not all 100K in one irreversible switch).  
3. **Routing flag** decides which path is authoritative.  
4. **Rollback is a config/TWS change**, not a hero restore from backup as plan A.  
5. **Proof gates** block the flip if recon is red.

## Phases (memorize this sequence)

### Phase 0 — Design & readiness

- HLD/LLD signed by architecture + security  
- Trust zones agreed: plaintext never lands in vendor SaaS  
- DPaaS + DTU contracts tested in non-prod  
- Recon job + dashboards + alerts built  
- Rollback plan written (who flips what, RTO target)  
- Success metrics: mismatch%=0 (or agreed threshold), latency SLOs, error budgets  

### Phase 1 — Shadow / parallel run

- **New path live for writes in shadow or dual-write-safe mode** where possible  
- Legacy path still authoritative for business outcomes  
- Tokenization + DTU run for wave 1 accounts  
- Recon runs daily; mismatches triaged  
- No customer-facing cut yet  

**Exit criteria:** recon stable on wave 1 for N consecutive business days (agree N, e.g. 2–5).

### Phase 2 — Backfill historical population

- Chunked backfill of remaining accounts to CONFIRMED  
- Resume-safe jobs under TWS  
- Progress dashboard: PENDING / IN_TRANSIT / CONFIRMED / FAILED / MANUAL_REVIEW  
- MANUAL_REVIEW burn-down owned by ops + eng  

**Exit criteria:** CONFIRMED ∩ vendor ACTIVE covers agreed % of scope (target ~100% for accounts that must be on vendor).

### Phase 3 — Soft cutover (read/write authority begins flipping)

- Feature flag / routing table: subset of traffic or account ranges use vendor tokenized path as source of truth  
- Start with low-risk cohort  
- Watch: error rates, recon drift, ops tickets, vendor latency  

**Exit criteria:** cohort healthy for full business cycle (include month-end if that’s your stress day).

### Phase 4 — Hard cutover (legacy de-authoritative)

- Flip remaining routing to tokenized SaaS path  
- Legacy path read-only or disabled for those workflows  
- Keep emergency rollback window (flag + TWS old job defs retained)  

**Exit criteria:** proof dashboard green; rollback unused; security sign-off recorded.

### Phase 5 — Decommission

- Remove dual-run cost only after soak period  
- Archive recon reports for audit  
- Update runbooks: replay/retry now assume tokenized world  

## Cutover checklist (print-level)

**Before flip**

- [ ] Mismatch count = 0 (or waived with named owners)  
- [ ] MANUAL_REVIEW count acceptable  
- [ ] Vendor + DTU + DPaaS health green  
- [ ] Rollback owner on-call named  
- [ ] Comms to ops/product sent  

**During flip**

- [ ] Change ticket / CAB as required  
- [ ] Toggle routing flag  
- [ ] Smoke: create/read path on canary accounts  
- [ ] Watch recon + error dashboards live  

**After flip (first business cycle)**

- [ ] EOD recon green  
- [ ] No spike in FAILED steps / ops pages  
- [ ] Confirm no plaintext fields in vendor payloads (spot audit)  

## Rollback (must be crisp)

| Trigger | Action |
|---------|--------|
| Recon mismatch spike | Pause new waves; investigate before more flips |
| Vendor outage | Fail closed on new tokenized-dependent writes or degrade per runbook |
| Data integrity doubt | Flip routing flag back to legacy authoritative path |
| Security finding | Stop DTU sends; incident process |

Rollback is **routing + scheduler**, not “restore yesterday’s DB and hope.”

## How to say “zero downtime” safely

> “Zero downtime meant phased cutover: new accounts and waves moved to the tokenized path while legacy remained available until recon proved population health for a full business cycle. Rollback was a routing/TWS revert, not an outage window.”

---

## Spoken scripts (rehearse out loud)

### 30 seconds

> Vendor cloud can’t store raw PII. We tokenize on-prem with DPaaS, move encrypted payloads through DTU, and prove success with SQL recon against vendor snapshots for 100K+ accounts — with checkpointed retries and a phased cutover so we didn’t need a downtime window.

### 2 minutes (design interview)

> Constraint: third-party SaaS on AWS must not hold plaintext PII.  
> I split trust zones — on-prem, transit, vendor. On-prem, DPaaS replaces sensitive fields with tokens; vault stays with us. DTU ships encrypted payloads only.  
> LLD: per-account state machine PENDING → IN_TRANSIT → CONFIRMED / FAILED, attempt counters, and a recon job that left-joins our control table to a vendor token snapshot. CONFIRMED is only set when vendor shows ACTIVE token — job success alone is not proof.  
> Recovery: chunked backfill, idempotent retries with backoff, MANUAL_REVIEW after max attempts, pause on systemic outage.  
> Cutover: shadow/parallel → backfill → soft flag flip by cohort → hard cutover → soak → decommission, with routing rollback as plan A.  
> That’s how we reached 100K+ confirmed without a big-bang outage.

---

## Blind checklist (mark done only if all pass)

- [ ] Draw trust zones + recon loop from memory  
- [ ] Write mismatch SQL without looking  
- [ ] Explain proof vs “job green” in 3 sentences  
- [ ] Walk Phase 0→5 cutover + one rollback trigger  
- [ ] Speak 2-minute script once without notes  

## Interview Q&A

<details>
<summary>Why not just encrypt fields in vendor DB?</summary>

Encryption still means ciphertext lives in vendor scope; key management becomes shared risk; tokenization can remove raw values from vendor entirely. Banks often prefer tokens for third-party systems.

</details>

<details>
<summary>What is fault-tolerant retry?</summary>

Transient errors requeue with backoff and a hard cap; progress checkpointed per account; systemic failures pause the wave; CONFIRMED only after vendor-side proof.

</details>

<details>
<summary>How do you prove “100K+ confirmed”?</summary>

Population count for the wave + recon join requiring vendor ACTIVE tokens + mismatch burn-down to threshold. Not TWS success alone.

</details>

<details>
<summary>What if recon and control table disagree?</summary>

Trust vendor snapshot for “exists at vendor,” investigate control-plane bugs, never silently force SUCCESS. Park ambiguous rows in MANUAL_REVIEW.

</details>

<details>
<summary>How big were chunks and why?</summary>

Hundreds to low thousands per batch — balances throughput vs blast radius and transaction size; tune on vendor rate limits and job window.

</details>

Next: [Async & throughput](#/05-async-throughput)
