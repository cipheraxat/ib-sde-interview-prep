# Kafka events (Barclays bullet 5)

## Resume bullet

> Published payment and account-status events through **Apache Kafka** from Spring Boot services to internal audit and reporting systems, enabling downstream consumers to process updates **asynchronously** without blocking TWS batch completion.

## Teach first: why message queues exist

If Service A calls Service B with HTTP for every status update:

- A waits on B
- B downtime breaks A
- Multiple consumers mean multiple calls
- Hard to replay history

A **message broker** lets A publish once; many consumers process independently.

> **ELI5:** Instead of calling every department when a form is approved, you put a copy in each department’s inbox (or one shared inbox with labels). Kafka is a durable, ordered, high-throughput inbox system.

## Kafka core concepts

| Concept | Meaning |
|---------|---------|
| Topic | Named stream of messages (e.g. `payment.status`) |
| Partition | Split of a topic for parallelism |
| Producer | Writes messages (your Spring Boot service) |
| Consumer | Reads messages (audit, reporting) |
| Consumer group | Set of consumers sharing work on a topic |
| Offset | Position in a partition (“how far I’ve read”) |
| Key | Optional key (e.g. accountId) that affects partition placement |

```
Producer (Spring Boot)
    │
    ▼
Topic: payment.status  (partitions 0..N)
    │
    ├─ Consumer group: audit
    └─ Consumer group: reporting
```

Same message can be processed by **each** consumer group.

## Ordering

Kafka guarantees order **per partition**, not globally.

If you key by `accountId`, all events for one account go to the same partition → per-account ordering.

## Delivery semantics

| Term | Meaning |
|------|---------|
| At-most-once | May lose messages (rarely acceptable for money/audit) |
| At-least-once | May duplicate; consumer must be idempotent |
| Exactly-once | Hard end-to-end; often “effectively once” via idempotent sink |

> **Interview tip:** Don’t claim “Kafka is exactly-once everywhere.” Say: *at-least-once + idempotent consumers* (store `eventId`, skip duplicates).

## Why this mattered for TWS batches

Batch job should finish when **your step** succeeded — not wait for audit/reporting pipelines.

Flow:

1. Persist business state SUCCESS  
2. Publish event (ideally via **outbox** pattern)  
3. TWS proceeds  
4. Consumers update audit/reporting on their own schedule  

### Outbox pattern (say this if they go deep)

Write business row + outbox row in **one DB transaction**. A publisher reads outbox → Kafka. Avoids “DB committed but event lost” dual-write bugs.

## 30-second pitch

> After payment/account steps completed, we published Kafka events so audit and reporting could consume asynchronously. That decoupled heavy downstream work from TWS batch completion and improved operational resilience.

## Interview Q&A

<details>
<summary>What goes in the payload?</summary>

Tokens/internal IDs + status + timestamps + eventId — **not** raw PII.

</details>

<details>
<summary>How do you handle poison messages?</summary>

Retry with limit → DLQ (dead letter queue) → alert humans. Don’t infinite-loop a bad payload.

</details>

<details>
<summary>How do you monitor Kafka consumers?</summary>

Consumer lag, error rate, DLQ depth, processing latency.

</details>

Next: [Batch replay API](#/08-replay-api)
