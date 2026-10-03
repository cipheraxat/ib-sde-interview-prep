# PII and tokenization

**Resume line:** You drove the HLD and LLD. The vendor SaaS stores tokenized PII, not plaintext. DPaaS tokenizes data on-prem. DTU sends encrypted data to AWS. Batch recon confirms more than 100K accounts. Retries are fault-tolerant. There is no downtime cutover.

This is your best design story. Learn **proof**, **recovery**, and **cutover**.

---

## 1. Say this first (30 seconds)

> The vendor cloud must not store raw PII. We tokenize data on-prem with DPaaS. DTU sends only encrypted payloads. SQL recon proves that more than 100K accounts have an active vendor token. We use checkpointed retries. We flip traffic in phases. We do not need a downtime window.

---

## 2. Words you must know

| Word | Meaning |
|------|---------|
| PII | Data that can identify a person |
| Tokenization | Replace a sensitive value with a token. The vault keeps the real value |
| Encryption | Scramble data with a key. You can reverse it with the key |
| DPaaS | Bank tokenization platform. Sensitive value in. Token out |
| DTU | Approved encrypted transfer from on-prem to cloud |
| Recon | Compare our expected state with the vendor state |
| HLD | High-level design: zones, flows, risks, rollout |
| LLD | Low-level design: tables, APIs, retries, metrics |

> **ELI5:** Encryption locks a diary. Tokenization gives a coat-check ticket. The cafe sees only the ticket.

**Do not say:** You built DPaaS.  
**Do say:** You drove the integration design and the recon design.

---

## 3. How it works

```
ON-PREM              TRANSIT         AWS / VENDOR
Source data → DPaaS → DTU (encrypt) → SaaS stores tokens only
     │                                    ▲
     └──────── recon compares ────────────┘
```

Account states:

```
PENDING → IN_TRANSIT → CONFIRMED
    │          │
    └──────→ FAILED → retry (if attempts < N) → PENDING
                   → MANUAL_REVIEW (if attempts ≥ N)
```

---

## 4. Proof (how you know it worked)

**Rule:** A green batch job is not proof. Proof is vendor data that matches our expected population.

### Three proof layers

| Layer | Question | Evidence |
|-------|----------|----------|
| Control plane | Did our system record the work? | Status counts in our control table |
| Data plane | Does the vendor hold an active token? | Join to vendor snapshot |
| Integrity | Is the population and date correct? | `business_date`, expected flags, counts |

### Recon steps

1. Select the cohort for `business_date = D`.
2. Keep rows where `expected_token = TRUE`.
3. Left-join the vendor token snapshot on `account_id`.
4. Classify each row: MATCH, MISSING, BAD_STATUS, or UNEXPECTED.
5. Count mismatches.
6. Permit cutover only if mismatches are at or below the agreed limit.

### SQL — mismatches

```sql
SELECT s.account_id, s.tokenization_status, v.token_id, v.token_status
FROM   integration_account_status s
LEFT JOIN vendor_token_snapshot v
       ON v.account_id = s.account_id
WHERE  s.expected_token = TRUE
  AND  s.business_date = :runDate
  AND  (v.token_id IS NULL OR v.token_status <> 'ACTIVE');
```

### SQL — proof counts

```sql
SELECT tokenization_status, COUNT(*) AS cnt
FROM   integration_account_status
WHERE  business_date = :runDate
  AND  expected_token = TRUE
GROUP BY tokenization_status;

SELECT COUNT(*) AS confirmed_with_vendor
FROM   integration_account_status s
JOIN   vendor_token_snapshot v ON v.account_id = s.account_id
WHERE  s.business_date = :runDate
  AND  s.expected_token = TRUE
  AND  s.tokenization_status = 'CONFIRMED'
  AND  v.token_status = 'ACTIVE';
```

### Count checks before you say "100K+"

1. Expected count for the wave.
2. Sent count.
3. Confirmed count with vendor ACTIVE token.
4. Mismatch count with an owner for each open item.

### Proof traps

- Do not say: "The job completed, so all accounts are tokenized."
- Do not say: "The vendor received the file."
- Do not use only a sample of 10 accounts as population proof.

### One sentence for the interviewer

> More than 100K is the account population in scope. Proof is a recon join that requires an ACTIVE vendor token for each expected account.

---

## 5. Recovery (when work fails)

**Rule:** A failure must not force a full restart of 100K accounts.

### Failure types

| Type | Examples | Action |
|------|----------|--------|
| Transient | Timeout, vendor 5xx, network blip | Retry with backoff |
| Data error | Bad mapping, validation fail | Stop blind retries. Mark FAILED or MANUAL_REVIEW |
| Systemic | Vendor outage, bad schema | Pause the wave. Alert owners |
| Partial wave | Job stops at 40K of 100K | Resume from remaining PENDING or FAILED rows |

### Idempotency

- Use a stable key: `account_id` + `wave_id`.
- Do not mark CONFIRMED without vendor proof.
- Do not flip CONFIRMED back to PENDING without a controlled action.

### Retry policy (example you can defend)

| Attempt | Wait | Result if fail again |
|---------|------|----------------------|
| 1 | Short | Retry |
| 2 | About 1 to 5 minutes | Retry |
| 3 | About 15 minutes | Retry |
| Max | — | MANUAL_REVIEW and alert |

Store `attempt_count`, `last_error` (no raw PII), and timestamps on each attempt.

### Chunked resume

1. Select the next chunk of PENDING or FAILED rows with `attempt_count < N`.
2. Process the chunk.
3. Commit state per account or per small batch.
4. If the job stops, the next run continues from the remaining rows.

### Ops playbooks

**A. One account stuck in IN_TRANSIT**

1. Find the correlation id in DTU or vendor logs.
2. Pull a fresh vendor snapshot for that account.
3. If vendor status is ACTIVE, mark CONFIRMED.
4. If the token is missing, requeue PENDING with a new attempt.
5. If the state is unclear, use MANUAL_REVIEW. Do not guess SUCCESS.

**B. Mismatch count rises overnight**

1. Freeze new cutover gates.
2. Split mismatches into MISSING, BAD_STATUS, and our FAILED.
3. If the vendor is down, pause retries and keep the backlog.
4. If mapping is wrong, stop automatic retries. Fix the mapping. Then replay.
5. Publish mismatch count and ETA.

**C. Possible wrong token**

1. Treat it as a data incident.
2. Compare on-prem vault mapping with the vendor token.
3. Use only the approved runbook for a fix. Include security.

### Recovery in one sentence

> Transient errors retry with a hard cap. Progress is checkpointed per account. Systemic failures pause the wave. CONFIRMED needs vendor proof.

---

## 6. Cutover (zero downtime steps)

**Rule:** Do not do a big-bang cut. Flip authority in phases. Keep a routing rollback.

### Phase 0 — Ready

- Architecture and security approve HLD and LLD.
- Non-prod tests pass for DPaaS, DTU, and recon.
- Dashboards and alerts exist.
- Rollback owner and steps are written.

### Phase 1 — Parallel run

- New path runs for a wave.
- Legacy path stays authoritative.
- Recon runs each day.
- Exit when recon stays stable for the agreed number of business days.

### Phase 2 — Backfill

- Process remaining accounts in chunks.
- Burn down MANUAL_REVIEW with named owners.
- Exit when CONFIRMED with vendor ACTIVE meets the agreed coverage.

### Phase 3 — Soft cutover

- Flip a routing flag for a small cohort.
- Watch errors, recon drift, and ops tickets.
- Exit when the cohort stays healthy for a full business cycle.

### Phase 4 — Hard cutover

- Flip remaining traffic to the tokenized path.
- Keep emergency rollback for a soak window.
- Exit when proof stays green and security signs off.

### Phase 5 — Decommission

- Remove dual-run cost after the soak period.
- Archive recon reports for audit.
- Update runbooks for the tokenized world.

### Before the flip

- Mismatch count is at the limit (or waived with owners).
- DPaaS, DTU, and vendor health are green.
- Rollback owner is on call.
- Ops and product received the notice.

### During the flip

- Change ticket is open if the bank requires it.
- Toggle the routing flag.
- Smoke-test canary accounts.
- Watch recon and error dashboards.

### Rollback

| Trigger | Action |
|---------|--------|
| Recon mismatch spike | Pause new waves. Investigate |
| Vendor outage | Follow the fail-closed or degrade runbook |
| Data integrity doubt | Flip routing back to legacy authority |
| Security finding | Stop DTU sends. Start the incident process |

### Zero downtime in one sentence

> New waves move to the tokenized path while legacy stays available. We flip routing only after recon proof. Rollback is a routing and TWS change.

---

## 7. Say this (2 minutes)

> Constraint: the vendor SaaS on AWS must not hold plaintext PII.  
> I split trust zones into on-prem, transit, and vendor. DPaaS creates tokens on-prem. The vault stays with us. DTU sends encrypted payloads only.  
> Each account has a state: PENDING, IN_TRANSIT, CONFIRMED, FAILED, or MANUAL_REVIEW.  
> Proof is not a green job. Proof is a recon join to a vendor snapshot that requires an ACTIVE token.  
> Recovery uses chunked backfill, idempotent retries with backoff, and MANUAL_REVIEW after the max attempts.  
> Cutover uses parallel run, backfill, soft flag flip, hard cutover, then soak. Rollback flips routing back.  
> That is how we confirmed more than 100K accounts without a downtime window.

---

## 8. Top questions

<details>
<summary>Why not only encrypt fields in the vendor DB?</summary>

Encryption still stores ciphertext in the vendor scope. Tokenization can keep the raw value out of the vendor system.

</details>

<details>
<summary>What does fault-tolerant retry mean?</summary>

Retry transient errors with backoff and a max attempt count. Checkpoint per account. Pause on systemic failure. Mark CONFIRMED only after vendor proof.

</details>

<details>
<summary>How do you prove more than 100K confirmed?</summary>

Count the expected population. Join to the vendor snapshot. Require ACTIVE tokens. Burn down mismatches. Do not use job success alone.

</details>

<details>
<summary>What if recon and our table disagree?</summary>

Trust the vendor snapshot for "exists at vendor". Investigate control bugs. Park unclear rows in MANUAL_REVIEW. Do not force SUCCESS.

</details>

---

## 9. Blind check

- [ ] Draw the three zones and the recon loop.
- [ ] Write the mismatch SQL from memory.
- [ ] Explain proof in three short sentences.
- [ ] List cutover phases 0 to 5 and one rollback trigger.
- [ ] Speak the 2-minute answer with no notes.

Next: [Async and throughput](#/05-async-throughput)
