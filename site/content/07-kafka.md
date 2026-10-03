# Kafka events

**Resume line:** Your Spring Boot services publish payment and account-status events to Apache Kafka. Audit and reporting consume the events. Downstream work does not block TWS batch completion.

---

## 1. Say this first (30 seconds)

> After a payment or account step succeeds, we publish a Kafka event. Audit and reporting consume the event on their own. The TWS batch does not wait for those consumers.

---

## 2. Words you must know

| Word | Meaning |
|------|---------|
| Topic | Named stream of messages |
| Partition | Split of a topic for parallel consumers |
| Producer | Writer. Your Spring Boot service |
| Consumer group | Set of consumers that share work |
| Offset | Position in a partition |
| Key | Example: `accountId`. Keeps one account on one partition |
| At-least-once | Duplicates can occur. Consumers must be idempotent |
| Outbox | Write business row and outbox row in one DB transaction. A publisher sends to Kafka later |

> **ELI5:** Kafka is a durable inbox. Many teams read the same event without blocking the sender.

---

## 3. How it works

```
Spring service
  → commit step SUCCESS (+ outbox row)
  → publisher sends to topic payment.status (key=accountId)
       → consumer group: audit
       → consumer group: reporting
```

Payload rules:

- Include event id, status, timestamps, internal ids or tokens.
- Do not put raw PII in the event.

---

## 4. Delivery truth

| Term | Meaning |
|------|---------|
| At-most-once | Can lose messages. Bad for audit |
| At-least-once | Can duplicate. Use idempotency keys |
| Exactly-once | Hard end to end. Do not claim it unless you built it |

**Safe line:** At-least-once delivery plus an idempotent consumer.

---

## 5. Say this (2 minutes)

> Batch completion must not wait on audit and reporting. After we persist a successful step, we publish a Kafka event. We prefer an outbox write in the same database transaction so we do not lose the event after commit. Consumers in separate groups process audit and reporting. Events use account id as the key for per-account order. Consumers store event ids to skip duplicates. Poison messages go to a DLQ after limited retries.

---

## 6. Top questions

<details>
<summary>What is in the payload?</summary>

Tokens or internal ids, status, timestamps, and event id. No raw PII.

</details>

<details>
<summary>How do you handle a bad message?</summary>

Retry with a limit. Then send the message to a DLQ. Alert humans.

</details>

<details>
<summary>What do you monitor?</summary>

Consumer lag, error rate, DLQ depth, and process latency.

</details>

---

## 7. Blind check

- [ ] Draw producer → topic → two consumer groups.
- [ ] Explain outbox in three sentences.
- [ ] Say the safe delivery line.

Next: [Batch replay API](#/08-replay-api)
