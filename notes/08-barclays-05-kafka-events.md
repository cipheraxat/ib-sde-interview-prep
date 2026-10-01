# Barclays Bullet 5 — Kafka to Audit & Reporting

Published payment and account-status events through Apache Kafka from Spring Boot to internal audit and reporting systems; downstream consumers process asynchronously without blocking TWS batch completion.

**30 seconds** After successful payment or account update, we publish a Kafka event. Audit and reporting teams consume async. The TWS batch step completes without waiting for their processing.

## Event contract

Topic:     payment.account-status.v1
Key:       accountId          (partition ordering per account)
Value:     JSON Avro/JSON schema
{
  "eventId": "uuid",
  "eventType": "ACCOUNT_STATUS_UPDATED",
  "accountId": "ACC-123",
  "previousStatus": "PENDING",
  "newStatus": "ACTIVE",
  "correlationId": "tws-job-456",
  "sourceSystem": "payment-integration",
  "timestamp": "2025-08-15T02:14:33Z",
  "schemaVersion": 1
}
  

## Producer flow

1. DB transaction: update account status + insert business row
2. (Optional) same transaction: insert into outbox table
3. Commit
4. KafkaTemplate.send(topic, accountId, event)  OR outbox poller sends
5. TWS step returns success — does NOT wait for consumer
  

**Q:** Why Kafka instead of REST callback to audit?

- **Decoupling:** audit team deploys independently.
- **Fan-out:** reporting + audit + future consumers same topic.
- **Buffering:** spike at month-end doesn’t overwhelm audit service.
- **Replay:** re-read offset for audit investigation.
- **Non-blocking:** batch SLA met without downstream latency in critical path.

**Q:** At-least-once vs exactly-once?

**Likely your setup: at-least-once.** Producer acks=all; consumer commits offset after process. Duplicate events possible if crash between process and commit. Mitigation: consumers dedupe on `eventId` in idempotency table. Exactly-once needs transactions API or Kafka Streams — only claim if you used it.

**Q:** Transactional outbox pattern — explain

Problem: DB committed but Kafka publish fails → inconsistency. Solution: write event to `outbox` table in same DB transaction as business update. Separate poller reads outbox, publishes to Kafka, marks SENT. Guarantees at-least-once from DB to bus. Good senior answer even if implementation was simplified.

**Q:** Partitioning and consumer groups

Key=accountId → all events for one account ordered in one partition. Consumer group `audit-service` — N instances share partitions; scale consumers ≤ partition count. Reporting team = different group, same topic, independent offset.

**Q:** What if publish fails?

Producer retries; if still failing → outbox row stays PENDING; alert fires; batch business step may still succeed (vendor sync done) but event flagged for reconciliation job. Ops replay from outbox or DLQ topic `payment.account-status.v1.dlq`.

Kafka troubleshooting questions

**Q:** Consumer lag growing?

Scale consumers, add partitions (plan carefully — key distribution), optimize consumer processing, check slow SQL in consumer.

**Q:** Message ordering broken?

Wrong key — must use accountId not random UUID. Multiple partitions without key discipline.

**Q:** Serialization?

JSON for simplicity internally; Schema Registry in mature setups — mention if bank used Avro.
