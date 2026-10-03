# Kafka events

**Resume:** Spring Boot publishes **payment/account-status** events to **Kafka**. Audit + reporting consume async. Does **not** block TWS batch completion.

---

## 1. Say this first (30s)

> After step SUCCESS we publish Kafka. Audit and reporting consume independently. TWS batch does not wait on them.

---

## 2. Words

| Word | Meaning | Use |
|------|---------|-----|
| Topic | Named log of messages | `payment.status` |
| Partition | Parallel slice of topic | Scale consumers |
| Key | e.g. `accountId` | Same account → same partition → order |
| Producer | Your service | After durable SUCCESS |
| Consumer group | Competing consumers; each group gets all msgs | audit vs reporting |
| Offset | Read position | Commit carefully |
| At-least-once | Dupes possible | Idempotent sink |
| Outbox | Business+outbox row one DB txn → publisher → Kafka | No lost event after commit |
| DLQ | Dead letter after N fails | Poison messages |
| Lag | Unconsumed messages | Primary health metric |

> **ELI5:** Durable inbox; many teams read without blocking sender.

---

## 3. How it works

```
Service txn: step SUCCESS + outbox row
  → publisher → topic (key=accountId)
       → CG audit (idempotent store)
       → CG reporting
       → fails → retry → DLQ + alert
```

**Payload:** `eventId`, status, timestamps, internal ids/tokens — **no raw PII**.  
**Order:** per key/partition only (not global).  
**Safe delivery line:** at-least-once + idempotent consumer (store `eventId`). Do not claim exactly-once end-to-end unless you built it.

| Semantic | Risk |
|----------|------|
| At-most-once | Loss — bad for audit |
| At-least-once | Dupes — need idempotency |
| Exactly-once | Hard; usually “effectively once” at sink |

---

## 4. Say this (2 min)

> Batch must finish without waiting on audit/reporting. Persist SUCCESS, write outbox in same txn, publish async. Key by accountId for per-account order. Separate consumer groups. Consumers skip duplicate eventIds. Poison → limited retry → DLQ. Monitor lag, errors, DLQ depth. Tokens only in payload.

---

## 5. Top questions

<details><summary>Why not HTTP to audit?</summary>
Coupling + blocking + multi-consumer fanout pain. Kafka decouples and buffers.
</details>
<details><summary>Dual-write problem?</summary>
DB commit then Kafka fail loses event — outbox fixes.
</details>
<details><summary>Rebalance / poison?</summary>
Short processing; idempotent handlers; DLQ; alert; do not block partition forever.
</details>
<details><summary>Partition count?</summary>
≥ peak parallel consumers; key cardinality; re-partition is costly — start sensible.
</details>

---

## 6. Blind check

- [ ] Draw outbox → topic → 2 CGs
- [ ] Safe delivery one-liner
- [ ] Why no PII in events
- [ ] Speak 2 min cold

Next: [Batch replay API](#/08-replay-api)
