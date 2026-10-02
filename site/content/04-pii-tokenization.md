# PII & tokenization (Barclays bullet 2)

## Resume bullet

> Drove system design (**HLD/LLD**) so vendor SaaS stores **tokenized PII**, not plaintext: on-prem data tokenized via **DPaaS**, encrypted in transit through **DTU** to AWS; batch recon confirms **100K+** accounts with fault-tolerant retries and **zero downtime**.

This is often your **best system-design story**.

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

Don’t assume “inside the bank network = safe.” Every hop should authenticate, authorize, and minimize sensitive data exposure.

Applied here: vendor SaaS should never need plaintext PII if tokens suffice.

## HLD vs LLD

**HLD (High Level Design)**

- Problem, constraints, trust zones
- Component diagram & sequence flows
- Non-functionals (availability, audit, RPO/RTO ideas)
- Risks & rollout phases

**LLD (Low Level Design)**

- Table schemas + indexes
- API contracts
- State machine + retry policy
- Metrics, alerts, runbooks

> **On your resume:** You **drove** HLD/LLD for the tokenization path — you didn’t invent the bank’s DPaaS product itself.

## Acronyms on your resume

| Term | Say this |
|------|----------|
| **DPaaS** | Bank Data Protection / tokenization platform: sensitive in → token out; vault stays on-prem |
| **DTU** | Data Transfer Utility: approved encrypted pipeline on-prem → cloud with logging/checksums/audit |
| **Recon** | Batch job comparing expected vs actual tokenization state |

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

## Sample recon SQL (whiteboard)

```sql
SELECT s.account_id, s.tokenization_status, s.last_updated
FROM   integration_account_status s
LEFT JOIN vendor_token_snapshot v
       ON v.account_id = s.account_id
WHERE  s.expected_token = TRUE
  AND  s.business_date = :runDate
  AND  (v.token_id IS NULL OR v.token_status <> 'ACTIVE');
```

## Zero downtime meaning

- New writes go through tokenized path
- Historical backfill in batches with resume cursor
- Legacy path may stay available until recon is green for a full business cycle
- Rollback = routing flag / TWS defs back to previous path

## 30-second pitch

> Vendor cloud can’t store raw PII. We tokenize on-prem with DPaaS, move encrypted payloads through DTU, and run SQL recon proving 100K+ accounts are correctly tokenized — with retries and no production outage.

## 2-minute design answer skeleton

1. Constraint: no plaintext in vendor SaaS  
2. Trust zones: on-prem / transit / vendor  
3. DPaaS tokenize → DTU encrypt transfer  
4. Schema + states for each account  
5. Recon + retry queue + paging  
6. Phased cutover + rollback  

## Interview Q&A

<details>
<summary>Why not just encrypt fields in vendor DB?</summary>

Encryption still means ciphertext lives in vendor scope; key management becomes shared risk; tokenization can remove raw values from vendor entirely. Banks often prefer tokens for third-party systems.

</details>

<details>
<summary>What is fault-tolerant retry?</summary>

Transient failures requeue with backoff and max attempts; permanent failures go to manual review; jobs are resumable (don’t restart 100K from zero); every attempt audited.

</details>

<details>
<summary>How do you prove “100K+ confirmed”?</summary>

Dashboard query grouping by status for business_date; mismatch count = 0 (or below threshold) before declaring cutover success.

</details>

Next: [Async & throughput](#/05-async-throughput)
