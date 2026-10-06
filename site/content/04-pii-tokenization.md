# PII and tokenization

**On your resume:** You designed how customer data moves to a vendor on AWS **without sending raw personal data**. The bank tokenizes data on its own systems (DPaaS), sends it through an encrypted transfer (DTU), and then **proves** with SQL that more than 100,000 accounts are tokenized. Failures can be retried. The switch did not need a downtime window.

**Say this carefully:** You designed the **integration and the proof**. You did **not** build the bank’s tokenization product (DPaaS) itself.

**In the night:** Same platform as the Unix-to-SaaS service. This page is how customer data is allowed to reach that vendor.

---

## STAR — the story

### S — Situation (what the world looked like)

The new vendor application lives on **AWS**, outside the bank’s own building. Bank rules say that system must **not** store raw **PII**. PII means data that can identify a person: name, national id, account number, and similar fields.

A simple idea is “just encrypt it.” Encryption scrambles the value with a key, but the scrambled value **still sits in the vendor’s database**. If keys and access are shared, the risk is still partly at the vendor. The bank wanted the vendor to hold a **token** instead: a random stand-in. The real value stays in a **vault on the bank’s side**.

There was a second problem. People like to say “the night job finished, so we are done.” For 100,000 accounts that is not proof. A job can finish while thousands of accounts never got a token. And you cannot take the whole platform down for a weekend to flip a switch. Customers and operations still need the system up.

### T — Task (what you were asked to do)

Design the path from both ends. The big picture is where the data sits (people call this HLD). The details are the states, the SQL proof, the resume, and the switch (people call this LLD):

- Vendor stores tokens, not plaintext.
- You can **prove** the accounts in scope really have a token.
- If the transfer fails halfway, you can **resume**, not start 100,000 accounts again from zero.
- You can **switch** to the new path without a planned outage.

### A — Action (what you actually designed)

Think of three rooms:

1. **On the bank’s premises.** Source data goes into **DPaaS**. DPaaS replaces the sensitive field with a token. The vault that can turn the token back stays on the bank’s side.
2. **In transit.** **DTU** is the approved pipe that carries the data to the cloud. The payload is encrypted on the way. There is logging and a checksum so you know the file was not cut off.
3. **At the vendor on AWS.** The vendor application stores the **token** and normal business fields. It does not store the raw personal value.

> **Simple picture:** Encryption is locking a diary. Tokenization is a coat-check ticket. The cafe (the vendor) only sees the ticket. The coat room (the vault) stays at the bank.

Each account moves through states you can explain on a whiteboard:

`PENDING` (not sent yet) → `IN_TRANSIT` (sent) → `CONFIRMED` (vendor really has an active token).

If something breaks: `FAILED`. You retry a few times. After the limit, a person looks at it (`MANUAL_REVIEW`). You do not loop forever.

**How you prove it (this is the part interviewers push on)**

“The job went green” is not proof. Proof means: for a given business date, every account that **should** have a token **does** have an **ACTIVE** token on the vendor side.

You keep your own table (expected accounts and your status). You also load a snapshot of what the vendor has. Then you join them:

```sql
SELECT s.account_id, s.tokenization_status, v.token_status
FROM integration_account_status s
LEFT JOIN vendor_token_snapshot v ON v.account_id = s.account_id
WHERE s.expected_token = TRUE
  AND s.business_date = :runDate
  AND (v.token_id IS NULL OR v.token_status <> 'ACTIVE');
```

That query is the list of accounts that are **still wrong**. Cutover is allowed only when that list is empty, or every leftover row has a named owner.

**How you recover when it fails**

| What went wrong | What you do | Why |
|-----------------|-------------|-----|
| Timeout, vendor 5xx, network blip | Retry with a wait that gets longer | These often clear by themselves |
| Bad mapping or bad data | Stop automatic retry. A person reviews it | Retrying will fail the same way |
| Vendor is down for everyone | Pause the wave and alert. A wave is one chunk of accounts you process together | Do not hammer a dead system |
| Job dies after 40,000 of 100,000 | Next run continues from the rows still pending or failed | Do not redo the 40,000 that already worked |

You send a stable key (account + wave) so a retry does not create a second conflicting token. You work in chunks of a few hundred to a few thousand accounts so one failure does not wreck the whole night.

**How you switch without downtime**

You never flip all 100,000 accounts in one irreversible moment.

A **setting** decides which path a group of accounts uses. That setting is the routing control. A **wave** is one chunk of accounts. A **soak** is several quiet days on the new path while you keep watching the mismatch query.

| Phase | In plain words | You move on when |
|-------|----------------|------------------|
| Ready | Design is signed. The mismatch query and alerts exist. Someone owns rollback | You can run a small wave safely |
| Parallel | New path runs, but the **old path is still the one that counts** | The mismatch query returns no rows for several business days |
| Backfill | You tokenize the remaining accounts one wave at a time | Confirmed accounts with an active vendor token reach the target |
| Soft flip | A **small group** of accounts starts using the new path for real. The setting chooses that group | That group gets through a full business cycle, including a heavy day |
| Hard flip | The rest of the accounts move to the new path. You still keep the old path for a while | The mismatch query stays empty and security signs off |
| Remove the old path | Only after a soak | Runbooks describe the new world |

If the mismatch query starts returning rows, you point the setting back at the old path. That is the rollback. The database stays as it is. Restoring yesterday’s entire database is not the first answer.

### R — Result (what changed)

More than **100,000 accounts** were confirmed by the recon join (vendor shows an active token), not by a green scheduler light. Failures resume from the leftover rows. The business did not need a downtime window to switch.

---

## Say it in about 60 seconds

> The vendor system sits on AWS, and it is not allowed to store raw personal data. I designed the path: we replace sensitive fields with tokens on our side, send only encrypted data across, and the vendor stores the token. Proof is not “the job finished.” Proof is a SQL check that every expected account has an active token at the vendor. If a transfer dies halfway, we continue from the accounts that are still pending. We switched in phases. A setting decides which path a group of accounts uses. The old path stayed available. Rollback means that setting points at the old path again. The database stays as it is.

---

## If they ask more

| Word | Plain meaning |
|------|----------------|
| PII | Data that can identify a person |
| Token | A random stand-in. The real value stays in the bank’s vault |
| DPaaS | The bank’s tokenization service. You call it. You did not build the vault |
| DTU | The approved encrypted way to send data to the cloud |
| Recon | Compare what you expected with what the vendor actually has |
| Wave | One chunk of accounts you process together |
| Soak | Several quiet days on the new path while the mismatch query stays empty |
| Routing setting | The control that decides which path a group of accounts uses |

<details>
<summary>Why not only encrypt the fields in the vendor database?</summary>
The scrambled value would still live at the vendor. A token lets the vendor work without ever holding the real value.
</details>

<details>
<summary>What if your table and the vendor snapshot disagree?</summary>
For “does the vendor have it?”, trust the vendor snapshot. Do not force your row to SUCCESS. Put unclear accounts in a manual queue.
</details>

## If they ask for code

The proof join is already in the story above. Write that query if they ask “how did you know it worked?” These two are the other coding questions: how a row moves, and how a dead job resumes.

Claim the row before you send it. The `WHERE` means two workers cannot both take the same account, and a confirmed account is left alone.

```java
int claimed = jdbc.update("""
    UPDATE integration_account_status
    SET tokenization_status = 'IN_TRANSIT', wave_id = ?
    WHERE account_id = ?
      AND business_date = ?
      AND tokenization_status IN ('PENDING', 'FAILED')
    """, waveId, accountId, runDate);
// claimed == 0 → already in flight or already CONFIRMED
```

Resume is a select, not “start 100,000 accounts again”:

```sql
SELECT account_id
FROM integration_account_status
WHERE business_date = :runDate
  AND expected_token = TRUE
  AND tokenization_status IN ('PENDING', 'FAILED');
```

Say this: the next run reads that list. Accounts already `CONFIRMED` are not in it.

## Blind check

- [ ] Explain the problem in plain words (vendor must not see raw PII)
- [ ] Explain proof in one sentence (join, active token, not a green job)
- [ ] Walk the switch: parallel, then small flip, then the rest, with a way back
- [ ] Write the claim `UPDATE` and the resume `SELECT`

Next: [Async and throughput](#/05-async-throughput)
