# Barclays Bullet 2 — PII Tokenization (HLD / LLD)

Drove system design (HLD/LLD) and data structures / schema modeling so vendor SaaS stores tokenized PII, not plaintext: on-prem data tokenized via DPaaS, encrypted in transit through DTU to AWS; batch recon over MySQL/Oracle SQL confirms 100K+ accounts with fault-tolerant retries and zero downtime.

**30 seconds** Regulatory constraint: vendor cloud cannot store raw PII. We tokenize on-prem with DPaaS, move only encrypted payloads through DTU to AWS, and run SQL recon proving 100K+ accounts tokenized correctly — with retries and no production outage.

**2 minutes — “Describe a system you designed”** “The hardest design problem in our migration was PII. The vendor SaaS runs on AWS, but bank policy forbids sending plaintext names, IDs, or account identifiers to a third party.

High level: I drew trust boundaries — on-prem zone, transit zone, vendor cloud. On-prem, source data passes through DPaaS, the bank’s tokenization service, which replaces sensitive fields with irreversible tokens. The payload is encrypted and sent via DTU — our data transfer utility — using approved channels. The vendor only ever sees tokens plus non-sensitive attributes.

Low level: I modeled schemas for tokenization status per account — states like PENDING, SENT, CONFIRMED, FAILED. The recon batch runs SQL against MySQL integration tables and Oracle reporting exports, comparing expected vs actual token presence in vendor DB. Mismatches enter a retry queue with backoff; after N failures we page ops. We chunked 100K+ accounts into batches of about 1,000 with indexed lookups on account_id.

Zero downtime meant phased cutover: new accounts tokenized on the new path while legacy path still served read-only traffic until recon hit 100% for a full business cycle. I presented HLD to architecture and security; LLD covered table DDL, recon queries, and failure handling.”

## Data flow diagram

 ON-PREM                          TRANSIT                    AWS / VENDOR
┌──────────────┐    ┌─────────┐    ┌─────┐    ┌────────────────────────┐
│ Source DB /  │───▶│  DPaaS  │───▶│ DTU │───▶│ Vendor SaaS (tokens    │
│ inbound file │    │ tokenize│    │enc. │    │ only + business data)  │
└──────────────┘    └─────────┘    └─────┘    └────────────────────────┘
       │                                              ▲
       │         ┌────────────────────────────────────┘
       │         │  recon verifies token exists per account
       ▼         ▼
┌──────────────────────────────────────────────────────────┐
│ Recon batch (Spring / SQL): MySQL state + Oracle exports │
│  → match / mismatch → retry worker → alert              │
└──────────────────────────────────────────────────────────┘
  

## Acronyms — 2-sentence definitions

| Term | Say this |
|----|----|
| **DPaaS** | Bank-managed Data Protection / tokenization platform. API or batch in: sensitive field out: token. Vault holds mapping; vendor never sees vault. |
| **DTU** | Data Transfer Utility — approved pipeline for moving encrypted files or API payloads from on-prem to cloud. Logging, scanning, checksums, audit trail. |
| **PII** | Personally identifiable information — names, national IDs, account numbers that can identify a person or entity. |
| **Tokenization** | Replace sensitive value with random token; original stored in secure vault on-prem. Not same as encryption alone — token is not reversible without vault. |

## State machine — account tokenization

  PENDING ──(send to DTU)──▶ IN_TRANSIT ──(vendor ack)──▶ CONFIRMED
     │                           │                          │
     └──(validation fail)──▶ FAILED ◀──(recon mismatch)───┘
                                   │
                            (retry \ 'ACTIVE');

-- Count for dashboard: target 100K+ CONFIRMED
SELECT tokenization_status, COUNT(\*) FROM integration_account_status
WHERE business_date = :runDate GROUP BY tokenization_status;
  

**Q:** HLD vs LLD — what did you actually document?

**HLD doc:** context, requirements (no plaintext in SaaS), component diagram, sequence diagram, trust zones, non-functionals (availability, audit), risks, rollout phases.
**LLD doc:** table schemas with indexes, API contracts with DPaaS/DTU, recon algorithm pseudocode, retry policy (max 3, backoff 1m/5m/15m), idempotency keys, monitoring metrics, runbook for FAILED \> threshold.

**Q:** What is “fault-tolerant retries” here?

Transient failures (DTU timeout, vendor 503) → automatic retry with idempotency key so duplicate sends don’t create duplicate tokens. Permanent failures (invalid account) → FAILED state, no infinite loop. Dead-letter table for manual ops. Recon job itself is restartable — processes chunks with checkpoint.

**Q:** How is “zero downtime” achieved?

No big-bang switch: dual-path period, read traffic on legacy until recon green; blue/green for integration service deployments; database migrations backward-compatible (add column, backfill, then switch); feature toggle for new tokenization path per account cohort.

**Q:** Why both MySQL and Oracle?

MySQL often holds integration service operational state (fast writes, app-owned schema). Oracle may hold legacy core reporting or enterprise warehouse extracts used for recon sign-off. Recon batch joins via staged exports or federated queries — honest answer: “different systems of record in a large bank estate.”

Deep follow-ups: tokenization vs encryption, GDPR, design review

**Q:** Tokenization vs encryption?

Encryption: reversible with key; ciphertext still sensitive if key leaks. Tokenization: vendor stores meaningless token; vault on-prem maps token↔PII. Vendor breach exposes tokens only.

**Q:** What if recon finds 500 mismatches at month-end?

Halt dependent downstream jobs; ops dashboard shows account list; retry worker processes queue; if vendor bug, escalate; if data issue, fix source and replay affected accounts only.

**Q:** Schema modeling choices?

`account_id` PK or unique; `tokenization_status` enum; `retry_count`; `last_error_code`; `vendor_correlation_id`; composite index on `(business_date, status)` for recon queries; `@Version` for optimistic locking on concurrent updates.
