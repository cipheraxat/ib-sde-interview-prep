# PII & tokenization (Barclays bullet 2)

## Resume bullet

> Drove system design (**HLD/LLD**) so vendor SaaS stores **tokenized PII**, not plaintext: on-prem data tokenized via **DPaaS**, encrypted in transit through **DTU** to AWS; batch recon confirms **100K+** accounts with fault-tolerant retries and **zero downtime**.

This is often your **best system-design story**. Make it vivid.

---

## The whole story (read until it’s natural)

When we moved workflows to a **vendor SaaS on AWS**, security and compliance drew a hard line: **the vendor cloud must not store plaintext PII**. Names, account identifiers tied to people, and similar fields cannot simply be copied into a third-party database “because the API accepts them.”

So the design question became:

> How do we give the SaaS enough identity to operate, without giving it the real sensitive values — and how do we **prove** we did that correctly for **100K+ accounts**, without taking production down?

I drove the **HLD and LLD** for that tokenization path (I did **not** build the bank’s DPaaS product itself — I designed how *our* migration uses it).

**High level:**

1. **On-prem:** source data hits **DPaaS** (Data Protection / tokenization platform). Sensitive fields become tokens; the vault that maps token ↔ real value stays bank-side.  
2. **Transit:** payloads move through **DTU** (Data Transfer Utility) — approved encrypted transfer with logging/checksums/audit.  
3. **Vendor AWS:** SaaS stores **tokens + non-sensitive attributes only**.  
4. **Proof:** a **recon batch** compares our expected tokenization state (MySQL) against vendor-side snapshots/exports (often involving Oracle reporting paths) and flags mismatches.  
5. **Recovery:** mismatches enter a retry queue with backoff; after N failures → manual review.  
6. **Cutover:** phased — new writes on tokenized path; historical backfill in resumable batches; legacy path available until recon is green for a business cycle. Rollback = routing back.

That’s what “zero downtime” means here: not magic, but **phased cutover + resumable backfill + rollback plan**.

---

## 30-second pitch

> Vendor SaaS couldn’t store raw PII. I drove HLD/LLD so we tokenize on-prem with DPaaS, transfer encrypted via DTU, and only land tokens in AWS. A SQL recon job proves 100K+ accounts are correctly tokenized, with retries and a phased cutover so we didn’t take production down.

---

## 2-minute interview script

> “The hardest design constraint in our SaaS migration was PII. Bank policy said the vendor cloud cannot hold plaintext identifiers.  
>  
> I documented trust zones: on-prem, transit, and vendor. On-prem, we send sensitive fields through DPaaS — the bank tokenization platform — which returns tokens. The real values stay in the vault we control. Then DTU moves encrypted payloads to AWS. The SaaS only ever persists tokens plus non-sensitive business fields.  
>  
> At low level I modeled account tokenization state — PENDING, IN_TRANSIT, CONFIRMED, FAILED, MANUAL_REVIEW — and wrote the recon approach: compare integration tables in MySQL with vendor snapshots, find missing or inactive tokens, retry with backoff, page ops after repeated failure. We processed on the order of 100K+ accounts in batches so jobs were resumable.  
>  
> Zero downtime meant phased rollout: new accounts on the new path while we backfilled history and kept a rollback route until recon stayed clean across a full business cycle. I took that HLD through architecture/security review and owned the LLD details — schemas, retry policy, metrics, runbook.”

---

## Teach the concepts

### PII
Personally Identifiable Information — data that can identify a person. High regulatory and fraud risk in banks.

### Encryption vs hashing vs tokenization

| Technique | Idea | Reversible? | Use |
|-----------|------|-------------|-----|
| Encryption | Scramble with a key | Yes with key | Transit / at-rest protection |
| Hashing | One-way digest | No (practically) | Passwords, checksums |
| Tokenization | Replace value with random token; vault keeps mapping | Only via vault | Third-party systems that shouldn’t hold raw PII |

> **ELI5:** Encryption locks the diary. Tokenization gives the cafe a coat-check ticket while the coat room keeps your passport.

### HLD vs LLD

- **HLD:** constraints, trust zones, components, sequence, risks, rollout  
- **LLD:** tables/indexes, API contracts, state machine, retry numbers, alerts, runbook  

### DPaaS / DTU (say in two sentences each)

- **DPaaS:** bank tokenization service — sensitive in, token out; vault on-prem.  
- **DTU:** approved pipeline to move encrypted data on-prem → cloud with audit trail.

### Zero-trust (practical)
Don’t assume “inside bank network = safe.” Minimize sensitive data at every hop; authenticate/authorize every call.

---

## Architecture (draw this)

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

### State machine

```
PENDING → IN_TRANSIT → CONFIRMED
   │           │
   └────────▶ FAILED → (retry < N) → PENDING
                     → (retry ≥ N) → MANUAL_REVIEW
```

### Whiteboard SQL

```sql
SELECT s.account_id, s.tokenization_status, s.last_updated
FROM   integration_account_status s
LEFT JOIN vendor_token_snapshot v
       ON v.account_id = s.account_id
WHERE  s.expected_token = TRUE
  AND  s.business_date = :runDate
  AND  (v.token_id IS NULL OR v.token_status <> 'ACTIVE');
```

Count dashboard:

```sql
SELECT tokenization_status, COUNT(*)
FROM integration_account_status
WHERE business_date = :runDate
GROUP BY tokenization_status;
```

---

## What “drove HLD/LLD” means in practice

You can claim:

- Wrote/presented design docs  
- Defined trust boundaries and data flow  
- Specified schemas, states, recon algorithm, retry policy  
- Reviewed with security/architecture  
- Defined success metrics (recon mismatch ≈ 0)

You should **not** claim:

- “I built DPaaS”  
- “I alone approved bank-wide crypto policy”

---

## Deep interview Q&A

<details>
<summary>Why not just encrypt fields in the vendor DB?</summary>

Encryption still places ciphertext in vendor scope and creates shared key-management risk. Tokenization can remove raw values from the vendor entirely. For third-party SaaS, tokens are often the cleaner compliance story.

</details>

<details>
<summary>How do fault-tolerant retries work?</summary>

Transient failures requeue with exponential backoff and a max attempt count. Jobs are resumable (cursor/status column) so a crash doesn’t restart 100K from zero. Permanent failures go to MANUAL_REVIEW. Every attempt is audited.

</details>

<details>
<summary>How did you achieve zero downtime?</summary>

Phased cutover + dual-run validation + resumable backfill batches + rollback routing. New writes tokenized immediately; history backfilled; no single night “flip everything or die.”

</details>

<details>
<summary>What indexes / data structures mattered?</summary>

Indexed `account_id` and `(business_date, status)` for recon/dashboard queries. In-memory maps for batch windows. Queue of failed account IDs for retry workers. Explicit state enum rather than boolean flags.

</details>

<details>
<summary>What risks did you call out in HLD?</summary>

Partial migration, vault/DPaaS outage, DTU transfer failure, recon false positives, vendor schema drift, dual-write inconsistency during parallel run. Mitigations: retries, circuit breaking, checksums, phased rollout, clear rollback.

</details>

<details>
<summary>How do you know you’re done?</summary>

For a business date: expected accounts CONFIRMED, mismatch count at/under threshold, no critical FAILED backlog, stakeholders sign off, then make SaaS path authoritative.

</details>

---

## Practice checklist

- [ ] Tell the story with trust zones in under 2 minutes  
- [ ] Draw DPaaS → DTU → vendor + recon loop  
- [ ] Write recon SQL from memory  
- [ ] Explain HLD vs LLD with what *you* wrote  
- [ ] Define zero downtime without hand-waving  

**Next:** [Async & throughput](#/05-async-throughput)
