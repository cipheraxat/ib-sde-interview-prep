# Kafka events

**Resume:** Payment and account-status events on **Apache Kafka** to audit and reporting. Downstream work does **not** block the TWS batch.

---

## STAR — the story

### S — Situation (the problem)

When a payment step finished, audit and reporting still needed the update. If the batch **called those systems over HTTP and waited**, two bad things happened:

1. A slow or down consumer **blocked the overnight job**.
2. If you saved the database row and *then* failed to notify, the event was **lost** (dual-write).

Audit also cannot accept “we might have dropped the message.”

### T — Task (your job)

Publish the status **after** the step is durable, let audit and reporting read it **on their own clock**, and do not block TWS.

### A — Action (what you did)

1. In **one database transaction**: mark the step SUCCESS **and** insert an **outbox** row.
2. A publisher reads the outbox and sends to Kafka topic `payment.status`.
3. **Key = account id** so one account stays in order on one partition.
4. Two **consumer groups**: audit and reporting. Each group gets the events.
5. Consumers store `eventId` and **skip duplicates** (at-least-once delivery).
6. Bad messages: limited retries, then a **dead-letter queue**, then an alert.
7. Payload: status, time, internal ids or **tokens**. **No raw PII.**

```
DB transaction: SUCCESS + outbox row
    → publisher → Kafka
         → audit group
         → reporting group
TWS continues. It does not wait for those groups.
```

> **ELI5:** You drop one notice in a shared inbox. Audit and reporting read it when they can. The night batch does not stand at their desks.

### R — Result

Batch completion is decoupled from audit and reporting. Events survive a crash after the DB commit (outbox). Duplicates are ignored. Poison messages do not block the partition forever.

**Safe line:** at-least-once plus an idempotent consumer. Do **not** say “Kafka is exactly-once everywhere.”

---

## Say the STAR in 60 seconds

> Audit and reporting needed payment status, but waiting on them blocked the batch, and a notify-after-commit could lose the event. I write the SUCCESS row and an outbox row in one transaction, then publish to Kafka. Audit and reporting are separate consumer groups. The key is the account id. Consumers skip duplicate event ids. The payload has tokens, not raw PII. The TWS job does not wait for those consumers.

---

## If they go deeper

| Word | One line |
|------|----------|
| Topic | Named stream |
| Partition | Slice of the topic. Order is per partition |
| Consumer group | One group shares the work. A second group gets a full copy |
| Offset | How far a consumer has read |
| Outbox | Fixes “DB saved, Kafka send failed” |
| DLQ | Parking lot for poison messages |
| Lag | Messages not yet consumed. Main health signal |

<details>
<summary>Why not HTTP to audit?</summary>
HTTP couples you to their uptime and blocks the batch. Kafka buffers and fans out.
</details>

## Blind check

- [ ] Tell S-T-A-R without notes
- [ ] Draw outbox → topic → two groups
- [ ] Say the delivery line (at-least-once + idempotent)

Next: [Batch replay API](#/08-replay-api)
