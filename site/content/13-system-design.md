# System design

IB may not ask you to design an HFT matching engine on day one. They **will** expect solid backend designs: queues, idempotency, SQL state, retries, audit trails.

## The template (use every time)

1. **Clarify** functional + non-functional requirements  
2. **API** sketch  
3. **Data model**  
4. **Design** boxes & arrows  
5. **Failure modes**  
6. **Observability**  
7. **Scale bottlenecks**  

---

## Design 1 — Payment status notifications (your Kafka bullet)

### Requirements

- Publish status after successful persistence  
- Audit + reporting consume independently  
- Don’t block batch  
- At-least-once; ordered per account if possible  
- No plaintext PII in events  

### Design

```
Spring service
  │ commit step SUCCESS + outbox row (1 txn)
  ▼
Outbox publisher → Kafka topic (key=accountId)
                      │
            ┌─────────┼─────────┐
            ▼         ▼         ▼
         Audit CG  Reporting  (future)
            │
            ▼
     idempotency store + DLQ + lag metrics
```

Talk about: outbox, partition keys, idempotent consumers, DLQ, token-only payloads.

Capacity: 5k+/day average is low; design for EOD spikes.

---

## Design 2 — Batch file processor + replay

### Requirements

- Process many files nightly against rate-limited vendor  
- Per-file retry  
- Scheduler needs success/failure signal  
- Ops replay without DB surgery  

### Design

```
TWS → kickoff API → queue/DB work items → worker pool → vendor REST
                         │
                         ▼
              batch_step_execution state machine
                         │
                    FAILED → Replay API → requeue
```

Rules to say aloud:

- timeout/non-2xx ⇒ FAILED  
- bound parallelism to vendor limits  
- audit every replay  

---

## Design 3 — Tokenization + recon

Zones:

1. On-prem tokenize (DPaaS)  
2. Encrypted transit (DTU)  
3. Vendor stores tokens only  
4. Recon compares MySQL/Oracle vs vendor snapshot  

Phased cutover + rollback routing.

---

## Stretch: order status service (brokerage-flavored)

Don’t fake trading experience. Map patterns you know:

```
submit order → validate → persist state machine
     → Kafka order.events
     → consumers (risk/checks/UI projections)
query path: Redis hot cache + SQL source of truth
```

States example: `NEW → ACCEPTED → FILLED/REJECTED`  
Exactly-once is hard → at-least-once + idempotent transitions.

---

## Flashcards

| Concept | One-liner |
|---------|-----------|
| CAP | Under partition, choose C or A; money paths often prefer consistency |
| At-least-once | Duplicates possible → idempotency required |
| Circuit breaker | Stop calling a sick dependency; fail fast |
| Saga | Multi-step business flow with compensations |
| CQRS | Separate write model vs read/reporting |

## Whiteboard checklist

- [ ] QPS / data size clarified  
- [ ] Drawn stores + async boundaries  
- [ ] Retries/timeouts/idempotency called out  
- [ ] Metrics: lag, error rate, recon mismatches  
- [ ] Rollback/replay story  

Next: [Behavioral & Why IB](#/14-behavioral-ib)
