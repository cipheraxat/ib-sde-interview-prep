# System Design Practice (tailored to your experience)

IB will not expect HFT matching-engine design on day one for a general SDE role — but they **will** expect solid **backend reliability** designs: queues, idempotency, SQL state, retries, audit trails.

Use this structure every time: **clarify → requirements → API → data model → design → bottlenecks → failure modes**.

---

## Design 1 — Payment / account status notification (your Kafka bullet)

### Prompt
Vendor or batch updates payment/account status. Downstream audit and reporting must see events. Batch must not block on consumers.

### Functional
- Publish status changes after successful persistence
- Multiple independent consumers (audit, reporting)
- Replayable history for a business date

### Non-functional
- At-least-once delivery
- Ordered per account (or explain trade-offs)
- No plaintext PII in events (tokens only)
- Observable lag and failure rate

### Design

```
Spring Boot service
   │  (transaction commits step SUCCESS)
   ▼
Outbox table ──▶ publisher ──▶ Kafka topic (key=accountId)
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
                 Audit CG     Reporting CG    (future)
                    │             │
                    ▼             ▼
              Idempotency store + DLQ + metrics
```

### Talking points
- **Outbox pattern**: write business row + outbox row in one DB txn; async publisher → Kafka (no dual-write race).
- **Key by accountId**: same account lands on same partition → ordered updates per account.
- **Idempotency**: consumer stores `eventId`; duplicates skipped.
- **DLQ**: poison messages after N retries; alert ops.
- **PII**: only tokens / internal IDs in payloads.

### Capacity sketch
5,000+ events/day ≈ low average TPS; design for **EOD spikes** (10–50×), not average.

---

## Design 2 — Batch file processor with step recovery (your TWS + replay bullets)

### Prompt
Nightly process ~N files against a rate-limited vendor API. Per-file retry. Scheduler must know success/failure. Ops must re-run failed steps without DB surgery.

### Design

```
TWS / scheduler
    │ HTTP or script
    ▼
Ingest / kickoff API ──▶ work queue (DB rows or broker)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
               Worker pool         Worker pool
               (Spring Boot)       (horizontal)
                    │
                    ▼
            Vendor REST (timeouts, circuit breaker)
                    │
                    ▼
         batch_step_execution (JPA state machine)
                    │
         ┌──────────┼──────────┐
         ▼          ▼          ▼
      SUCCESS    FAILED     IN_PROGRESS
                     │
                     ▼
              Replay API (ops) ──▶ re-queue step
```

### State machine
`PENDING → IN_PROGRESS → SUCCESS | FAILED`  
`FAILED → (replay) → PENDING` with `attempt_count++`

### Failure rules (must say)
- Timeout / non-2xx ⇒ **FAILED**, never SUCCESS
- Idempotent vendor calls or dedupe keys
- Bound parallelism to vendor rate limits
- Aggregate completion endpoint for TWS dependency

---

## Design 3 — Tokenization + recon (your HLD bullet)

### Prompt
Third-party SaaS on AWS must not store plaintext PII. Prove 100K+ accounts tokenized. Zero downtime.

### Zones
1. **On-prem**: source data → DPaaS tokenize  
2. **Transit**: DTU encrypted transfer  
3. **Vendor cloud**: tokens + non-sensitive attrs only  
4. **Recon**: MySQL state + Oracle exports → match/mismatch → retry

### Phased cutover
New writes on tokenized path; legacy read-only until recon window green; rollback = routing flag back to legacy.

---

## Design 4 — Brokerage-flavored stretch (show you can learn IB domain)

Keep high-level; don’t fake trading experience.

**“Design an order status service”**
- Client submits order → validate → persist → emit Kafka `order.events`
- Risk/check services consume asynchronously
- Status query API: cache hot orders in Redis, source of truth in SQL
- Exactly-once is hard → at-least-once + idempotent state machine (`NEW → ACCEPTED → FILLED / REJECTED`)

**“Design market data fan-out”** (conceptual)
- Ingest feed → normalize → Kafka topics by symbol  
- Downstream: UI websockets, risk, analytics  
- Backpressure, late joins, snapshot + delta

Map back: “Same patterns I used for payment status Kafka + durable step state.”

---

## Concepts flashcards

| Concept | One-liner |
|---|---|
| CAP | Under partition, pick C or A; banks often prefer C for money paths |
| At-least-once | Duplicates possible → need idempotency |
| Exactly-once | End-to-end rare; usually “effectively once” via idempotent sinks |
| Circuit breaker | Stop calling sick dependency; fail fast |
| Saga | Multi-step business txn with compensations |
| CQRS | Separate write model vs read/reporting model |
| Sharding vs replica | Shard = split write load; replica = scale reads |

---

## Whiteboard checklist

- [ ] Clarify QPS, data size, consistency needs  
- [ ] Draw boxes + arrows + data stores  
- [ ] Call out idempotency + retries + timeouts  
- [ ] Monitoring: lag, error rate, recon mismatch count  
- [ ] Rollback / replay story
