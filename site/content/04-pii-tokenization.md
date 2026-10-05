# PII and tokenization

**Resume:** HLD/LLD so vendor SaaS stores **tokenized PII**, not plaintext. **DPaaS** on-prem → **DTU** to AWS. Recon proves **100K+** accounts. Retries. **Zero downtime**.

**Do say:** you drove the integration and recon design. **Do not say:** you built DPaaS.

---

## STAR — the story

### S — Situation (the problem)

The vendor app runs on **AWS**. Bank policy: that cloud must **not** store raw **PII** (names, ids, account numbers that identify a person). Encryption alone still leaves ciphertext in the vendor’s system. A green batch job is **not** proof that 100K accounts were tokenized. A crash must not force a restart of the whole population. A big-bang cutover would cause downtime.

### T — Task (your job)

Design the path (HLD + LLD) so the vendor stores **tokens only**. Prove the population. Recover failures. Cut over with **no downtime window**.

### A — Action (what you did)

**Flow**

```
Source data → DPaaS (token, vault stays on-prem)
           → DTU (encrypted transfer)
           → Vendor SaaS (tokens only)
           → Recon joins our table to the vendor snapshot
```

> **ELI5:** Encryption locks a diary. Tokenization is a coat-check ticket. The vendor sees only the ticket.

**Account states:** `PENDING → IN_TRANSIT → CONFIRMED`. On fail: `FAILED`. Retry if attempts &lt; N. Else `MANUAL_REVIEW`.

**Proof (this is the heart of the story)**

A finished job is not proof. Proof is: expected accounts for a business date **and** an **ACTIVE** token on the vendor side.

1. Pick `business_date`.
2. Keep rows with `expected_token = TRUE`.
3. Left-join the vendor token snapshot on `account_id`.
4. Classify: MATCH, MISSING, BAD_STATUS, UNEXPECTED.
5. Allow cutover only when mismatches are at or under the limit.

```sql
SELECT s.account_id, s.tokenization_status, v.token_status
FROM integration_account_status s
LEFT JOIN vendor_token_snapshot v ON v.account_id = s.account_id
WHERE s.expected_token = TRUE
  AND s.business_date = :runDate
  AND (v.token_id IS NULL OR v.token_status <> 'ACTIVE');
```

**Recovery**

| Failure | What you do |
|---------|-------------|
| Timeout, 5xx, network | Retry with backoff. Key = account + wave |
| Bad data / mapping | Stop blind retry. MANUAL_REVIEW |
| Vendor outage | Pause the wave. Alert |
| Job dies at 40k of 100k | Resume leftover PENDING/FAILED. Do not restart all 100k |

Chunks of a few hundred to a few thousand accounts. Commit per account or small batch.

**Cutover (no downtime)**

| Phase | What happens | You leave the phase when |
|-------|----------------|--------------------------|
| 0 Ready | Design signed. Recon and alerts exist. Rollback owner named | Ready to run a wave |
| 1 Parallel | New path runs. Legacy is still the source of truth | Recon is stable for N days |
| 2 Backfill | Remaining accounts in chunks | Confirmed ∩ ACTIVE meets the target |
| 3 Soft flip | Routing flag for a small cohort | One full business cycle is healthy |
| 4 Hard flip | Rest of traffic. Rollback window stays open | Proof stays green |
| 5 Decommission | Drop the dual path after soak | Runbooks updated |

**Rollback:** flip the routing flag / old TWS jobs. Do not plan “restore yesterday’s database” as plan A.

### R — Result

More than **100K** accounts confirmed by recon (vendor ACTIVE token), not by a green job. Retries are checkpointed. Cutover is phased. No downtime window.

---

## Say the STAR in 60 seconds

> The vendor on AWS must not store raw PII. I designed the path: tokenize on-prem with DPaaS, send encrypted data through DTU, store only tokens at the vendor. Proof is a SQL join: expected accounts must have an ACTIVE vendor token. Failures retry in chunks and stop at a manual queue. We flipped traffic in phases while the old path stayed up. Rollback is a routing change. That is how we covered 100K+ accounts with no downtime window.

---

## If they go deeper

| Word | One line |
|------|----------|
| DPaaS | Bank tokenizer. Sensitive in, token out. Vault stays on-prem |
| DTU | Approved encrypted pipe to the cloud |
| Recon | Our expected rows vs vendor snapshot |
| HLD | Zones, risks, rollout |
| LLD | Tables, APIs, retries, alerts |

**Three proof layers:** our status counts · vendor ACTIVE join · right date and population.

**Ops playbooks**

- Stuck IN_TRANSIT → check vendor snap. ACTIVE means CONFIRMED. Missing means requeue. Unclear means MANUAL_REVIEW.
- Mismatch spike → freeze the next flip. Classify. Pause if the vendor is down.
- Suspected wrong token → incident. Compare vault vs vendor. Approved runbook only.

**Count before you say 100K+:** expected · sent · confirmed with ACTIVE · open mismatches with owners.

<details>
<summary>Why not only encrypt fields at the vendor?</summary>
Ciphertext still lives in the vendor system. A token can keep the real value out of that system.
</details>

<details>
<summary>What if recon and our table disagree?</summary>
The vendor snapshot wins for “exists at vendor.” Do not force SUCCESS. Park unclear rows in MANUAL_REVIEW.
</details>

## Blind check

- [ ] Tell S-T-A-R without notes
- [ ] Draw the three zones
- [ ] Write the mismatch SQL
- [ ] List cutover phases 0 to 5 and one rollback

Next: [Async and throughput](#/05-async-throughput)
