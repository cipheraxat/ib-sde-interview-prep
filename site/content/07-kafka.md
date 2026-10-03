# Kafka events (Barclays bullet 5)

## Resume bullet

> Published payment and account-status events through **Apache Kafka** from Spring Boot services to internal audit and reporting systems, enabling downstream consumers to process updates **asynchronously** without blocking TWS batch completion.

---

## The whole story

Once payment/account steps completed in the integration services, **other bank systems** still needed to know: audit trails, reporting pipelines, maybe more consumers later.

The wrong design is: after each success, **synchronously HTTP-call** audit and reporting before telling TWS the job finished. That couples batch completion to every downstream system’s health and speed. If reporting is slow, EOD is slow. If audit is down, batches fail for the wrong reason.

So we published **Kafka events** from the Spring Boot services:

1. Business step commits to SUCCESS in SQL.  
2. An event is published to a Kafka topic (ideally via **outbox** so DB + event don’t diverge).  
3. **Audit** and **reporting** each run as separate **consumer groups**.  
4. TWS only cares that *our* step succeeded — not that every consumer finished.  
5. Consumers are **idempotent** (dedupe on `eventId`) because Kafka is typically **at-least-once**.  
6. Payloads carry **tokens/internal IDs**, not raw PII.

This is the “event-driven” chapter of the same platform story as migration + async workers.

---

## 30-second pitch

> After payment and account steps succeeded, we published Kafka events so audit and reporting could consume asynchronously. That stopped downstream systems from blocking TWS batch completion, and let each consumer scale and fail independently — with idempotent processing and no plaintext PII in the payloads.

---

## 2-minute interview script

> “When a payment or account-status step finished in our Spring Boot service, audit and reporting still needed that fact. If we called them inline over HTTP, batch jobs would wait on systems that aren’t on the critical payment path.  
>  
> So we introduced Kafka. After we persisted success, we published a status event to a topic — keyed by account id so updates for one account stay ordered within a partition. Audit and reporting each have their own consumer group, so both get every event without competing for the same offsets.  
>  
> We treat delivery as at-least-once: consumers store processed event ids and skip duplicates. Failures go through retries and eventually a DLQ with alerts — we don’t infinite-loop poison messages.  
>  
> Importantly, event payloads follow the same PII rules as the SaaS path: tokens and internal identifiers, not raw customer data. The result is TWS can finish when our step is done, while downstream systems catch up on their own clocks.”

---

## Teach the concepts

### Why brokers exist

| HTTP fan-out pain | Kafka help |
|-------------------|------------|
| Producer waits on each consumer | Publish once |
| One slow consumer blocks job | Consumers independent |
| Hard to replay history | Retention + replay offsets |
| N consumers ⇒ N sync calls | N consumer groups |

> **ELI5:** Instead of calling every department for every approval, drop a durable note in a shared mailroom. Each department reads at its own speed.

### Core Kafka vocabulary

| Term | Meaning |
|------|---------|
| Topic | Named stream (`payment.status`) |
| Partition | Parallel slice of a topic |
| Producer | Your Spring Boot service |
| Consumer | Audit / reporting apps |
| Consumer group | Team of consumers sharing work; each group gets all messages |
| Offset | “How far I’ve read” in a partition |
| Key | e.g. `accountId` → same account, same partition → ordered per account |

```
Spring Boot producer
        │
        ▼
Topic: payment.status  (partitions…)
        │
        ├─ consumer group: audit
        └─ consumer group: reporting
```

### Delivery semantics (don’t overclaim)

| Term | Meaning |
|------|---------|
| At-most-once | May lose messages — usually bad for audit |
| At-least-once | May duplicate — need idempotent consumers |
| Exactly-once | Hard end-to-end; often “effectively once” via idempotent sink |

> **Interview tip:** Say *at-least-once + idempotency*, not “Kafka is exactly-once everywhere.”

### Outbox pattern (sound senior)

Write business row + outbox row in **one DB transaction**. A publisher reads outbox → Kafka. Prevents “DB committed but event never sent.”

---

## Architecture

```
TWS → Spring Boot step SUCCESS
           │
           ├─ commit step row (+ outbox row)
           ▼
     outbox publisher → Kafka topic (key=accountId)
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                 Audit CG  Reporting  (future)
                    │
                    ▼
           idempotency store + DLQ + lag metrics
```

---

## Deep interview Q&A

<details>
<summary>What’s in the event payload?</summary>

eventId, accountId (or tokenized id), status, timestamps, maybe vendor correlation id, schema version. **No raw PII.**

</details>

<details>
<summary>How do you handle poison messages?</summary>

Retry with limit → DLQ → alert humans. Don’t block the whole partition forever on one bad payload without a strategy.

</details>

<details>
<summary>How do you monitor?</summary>

Consumer lag, error rate, DLQ depth, produce failures, end-to-end latency from step success → consumer process time.

</details>

<details>
<summary>Why key by accountId?</summary>

Per-account ordering. Status transitions for one account shouldn’t rearrange across partitions.

</details>

<details>
<summary>Kafka vs DB table as queue?</summary>

DB queue can work small-scale. Kafka better when multiple independent consumers, retention/replay, and operational isolation matter. We already needed fan-out to audit + reporting.

</details>

<details>
<summary>What breaks if producer isn’t transactional with DB?</summary>

Dual-write bug: step SUCCESS saved but event lost (or event sent but DB rolled back). Outbox/CDC fixes that class of incident.

</details>

---

## Practice checklist

- [ ] Explain why not sync HTTP to audit/reporting  
- [ ] Define topic, partition, consumer group in one breath each  
- [ ] Say at-least-once + idempotency  
- [ ] Mention outbox  
- [ ] Mention no PII in payloads  

**Next:** [Batch replay API](#/08-replay-api)
