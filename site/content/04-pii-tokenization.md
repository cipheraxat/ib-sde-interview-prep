# PII and tokenization

**Resume:** Drove **HLD/LLD** so vendor SaaS stores **tokenized PII** (not plaintext). **DPaaS** on-prem → **DTU** encrypted transit → AWS. Batch recon proves **100K+** accounts. Fault-tolerant retries. **Zero-downtime** phased cutover.

Best design story. Master **proof · recovery · cutover**.

---

## 1. Say this first (30s)

> Vendor cloud must not store raw PII. DPaaS tokenizes on-prem; DTU sends encrypted payloads only. SQL recon proves 100K+ accounts have ACTIVE vendor tokens. Checkpointed retries. Phased traffic flip. No downtime window.

**Do say:** drove integration + recon design. **Do not say:** built DPaaS.

---

## 2. Words

| Word | Meaning | Contrast |
|------|---------|----------|
| PII | Identifies a person | High regulatory risk |
| Tokenization | Value → random token; vault holds original | Vendor sees ticket only |
| Encryption | Scramble with key; reversible with key | Ciphertext can still live at vendor |
| Hashing | One-way digest | Passwords/checksums — not our path |
| DPaaS | Bank tokenize API/batch; vault on-prem | You integrate; platform team owns vault |
| DTU | Approved encrypted on-prem→cloud pipe | Checksums, logging, audit |
| Recon | Expected vs vendor actual | Proof ≠ job green |
| HLD / LLD | Zones/risks/rollout vs tables/APIs/retries | You drove both for this path |

> **ELI5:** Encryption = locked diary. Tokenization = coat-check ticket.

---

## 3. How it works

```
ON-PREM                    TRANSIT           AWS / VENDOR
Source → DPaaS (tokenize) → DTU (encrypt) → SaaS: tokens only
   │                                          ▲
   └──── recon: MySQL/Oracle ↔ vendor snap ───┘
```

**States:** `PENDING → IN_TRANSIT → CONFIRMED` · fail → `FAILED` → retry `< N` else `MANUAL_REVIEW`

**Control table (conceptual):** `account_id`, `expected_token`, `tokenization_status`, `token_ref?`, `attempt_count`, `last_error`, `business_date`, `last_updated`  
**Vendor snap:** `account_id`, `token_id`, `token_status`, `as_of`

**HLD must include:** trust zones, sequence, NFRs, risks, rollout.  
**LLD must include:** DDL+indexes, API contracts, retry policy, metrics, runbook.

---

## 4. Proof

**Rule:** Green TWS/job ≠ proof. Proof = expected population ∩ vendor ACTIVE token.

| Layer | Question | Evidence |
|-------|----------|----------|
| Control | Did we record work? | Status counts |
| Data | Does vendor hold ACTIVE token? | Left join snapshot |
| Integrity | Right cohort/date? | `business_date`, expected flag, counts/checksums |

**Recon algorithm:** fix `business_date` → filter `expected_token` → left join vendor → classify MATCH / MISSING / BAD_STATUS / UNEXPECTED → gate cutover on mismatch ≤ threshold.

```sql
-- mismatches
SELECT s.account_id, s.tokenization_status, v.token_id, v.token_status, s.attempt_count
FROM integration_account_status s
LEFT JOIN vendor_token_snapshot v ON v.account_id = s.account_id
WHERE s.expected_token = TRUE AND s.business_date = :runDate
  AND (v.token_id IS NULL OR v.token_status <> 'ACTIVE');

-- dashboard
SELECT tokenization_status, COUNT(*) cnt
FROM integration_account_status
WHERE business_date = :runDate AND expected_token = TRUE
GROUP BY tokenization_status;

-- hard proof
SELECT COUNT(*) FROM integration_account_status s
JOIN vendor_token_snapshot v ON v.account_id = s.account_id
WHERE s.business_date = :runDate AND s.expected_token = TRUE
  AND s.tokenization_status = 'CONFIRMED' AND v.token_status = 'ACTIVE';
```

**Before saying 100K+:** expected count · sent count · confirmed∩ACTIVE · open mismatches with owners. Optional: sorted `account_id` checksum vs vendor export.

**Traps:** “job finished” · “file landed” · sample of 10 as population proof.

**One-liner:** *100K+ = distinct accounts in scope; proof = recon join requiring ACTIVE vendor token.*

---

## 5. Recovery

**Rule:** Never restart full 100K from zero after a crash.

| Class | Examples | Action |
|-------|----------|--------|
| Transient | timeout, 5xx, DTU blip | Backoff retry; idempotent key `account_id+wave_id` |
| Data | bad mapping, validation | FAILED / MANUAL_REVIEW — no infinite retry |
| Systemic | outage, schema break | Pause wave; alert; circuit break |
| Partial | died at 40k/100k | Resume PENDING/FAILED with `attempt_count < N` |

**Retry ladder (defendable):** attempt1 short → 2 (~1–5m) → 3 (~15m) → max → MANUAL_REVIEW + page. Persist attempt_count, safe last_error, timestamps.

**Chunking:** SELECT next 500–2000 eligible rows → process → commit per account/small batch → next run continues.

**Playbooks**

| Scenario | Steps |
|----------|-------|
| Stuck IN_TRANSIT | correlation id → fresh vendor snap → ACTIVE⇒CONFIRMED; missing⇒requeue; unclear⇒MANUAL_REVIEW |
| Mismatch spike | freeze cutover gates → classify → vendor down⇒pause; bad map⇒stop auto-retry → fix → replay → publish ETA |
| Wrong token suspicion | data incident → vault vs vendor compare → approved runbook only (+ security) |

**SQL retry/escalation**

```sql
SELECT account_id, attempt_count, last_error FROM integration_account_status
WHERE business_date=:runDate AND expected_token=TRUE
  AND tokenization_status IN ('FAILED','PENDING') AND attempt_count < :max
ORDER BY last_updated FETCH FIRST 1000 ROWS ONLY;  -- LIMIT on MySQL

SELECT account_id, attempt_count, last_error FROM integration_account_status
WHERE business_date=:runDate AND tokenization_status='MANUAL_REVIEW';
```

**One-liner:** *Transient retries with hard cap; checkpoint per account; pause systemic; CONFIRMED only after vendor proof.*

---

## 6. Cutover (zero downtime)

**Rule:** No big-bang. Dual-run → wave backfill → flag flip → soak. Rollback = routing/TWS, not hero DB restore.

| Phase | Do | Exit |
|-------|----|------|
| 0 Ready | HLD/LLD sign-off; non-prod DPaaS/DTU/recon; dashboards; rollback owner | Docs + alerts ready |
| 1 Parallel | New path for wave; legacy authoritative; daily recon | Stable recon N business days |
| 2 Backfill | Chunk remaining; burn MANUAL_REVIEW | CONFIRMED∩ACTIVE ≈ agreed % |
| 3 Soft | Flag flip small cohort; watch errors/recon/tickets | Healthy full business cycle |
| 4 Hard | Remaining traffic; keep rollback window | Proof green + security sign-off |
| 5 Decommission | Drop dual-run cost; archive recon; update runbooks | Soak complete |

**Before flip:** mismatch at limit · platform health green · rollback on-call · ops/product notified.  
**During:** change ticket if required · toggle flag · canary smoke · live dashboards.  
**Rollback triggers:** mismatch spike · vendor outage · integrity doubt · security finding → flip flag / stop DTU / incident.

**One-liner:** *Legacy stays until recon proves waves; flip routing; rollback is config.*

---

## 7. Say this (2 min)

> Constraint: SaaS on AWS must not hold plaintext PII. Trust zones: on-prem / transit / vendor. DPaaS tokens on-prem; vault stays with us; DTU encrypts transit. Per-account states PENDING→IN_TRANSIT→CONFIRMED/FAILED/MANUAL_REVIEW. Proof is recon to vendor snapshot requiring ACTIVE — not job green. Recovery: chunked backfill, idempotent backoff, MANUAL_REVIEW at max, pause on outage. Cutover: parallel→backfill→soft→hard→soak; rollback flips routing. That is how we confirmed 100K+ without a downtime window.

---

## 8. Top questions

<details><summary>Why not only encrypt at vendor?</summary>
Ciphertext still in vendor scope; key risk shared. Tokens can remove raw values from vendor entirely.
</details>
<details><summary>Fault-tolerant retry?</summary>
Backoff + max attempts; per-account checkpoint; pause systemic; CONFIRMED after vendor proof only.
</details>
<details><summary>Prove 100K+?</summary>
Expected population + join ACTIVE + mismatch burn-down with owners. Not TWS green.
</details>
<details><summary>Recon vs control disagree?</summary>
Vendor snap wins for “exists at vendor”; investigate control bugs; MANUAL_REVIEW; never force SUCCESS.
</details>
<details><summary>Chunk size?</summary>
Hundreds–low thousands: throughput vs blast radius vs vendor rate limits vs job window.
</details>
<details><summary>Indexes?</summary>
`account_id`; composite `(business_date, status)` / `(business_date, expected_token, status)` for recon dashboards.
</details>

---

## 9. Blind check

- [ ] Draw zones + recon loop
- [ ] Write mismatch SQL cold
- [ ] Proof vs job-green in 3 sentences
- [ ] Phases 0–5 + one rollback trigger
- [ ] Speak 2 min cold

Next: [Async and throughput](#/05-async-throughput)
