# Kafka payment events

**On your resume:** You used **Kafka** to publish payment and account events so audit and reporting systems can react. You also made the **consumer safe to run the same message twice**.

---

## STAR — the story

### S — Situation (what the world looked like)

When a payment step finished, more than one team needed to know. Audit needed a record. Reporting needed numbers. Sometimes another system needed to update an account view. The old habit is to call each of those systems **directly** from the integration service, one HTTP call after another.

That couples you to them. If reporting is slow, your night job waits. If you add a new consumer next year, you have to change the payment code again. And if the network drops a message, nobody is sure who missed it.

Kafka is a **log of events**. Your service writes “this payment step finished.” Other teams read that log at their own speed. Your job does not wait for their reports to finish.

### T — Task (what you were asked to do)

Publish payment and account events for audit and reporting, and make sure a consumer that sees the **same event twice** does not write the audit row twice or double-count the report.

### A — Action (what you actually built)

1. After your service **knows** the step outcome (and has saved it), it publishes an event. The message says what happened: payment id, account, status, business date, and a stable event id.
2. The **key** is something stable, such as the payment id, so events for the same payment stay in order on one partition.
3. Audit and reporting are **separate consumers**. They do not sit inside your night job.
4. Kafka in this design is **at least once**. That means a consumer might see a message twice after a crash or a retry. That is normal. You do not tell the interviewer “we have exactly-once everywhere.”
5. The consumer is **idempotent**. Before it inserts, it checks the event id. If that id is already stored, it skips. The second copy does no harm.
6. If the database insert works but the “I finished this message” step fails, the message comes back. The unique event id saves you.
7. If the message itself is bad (wrong shape, unknown account), you do not retry forever. You send it to a **dead-letter** path and alert a person. Retry is for temporary failures (database blip), not for garbage data.

```
Your service saves SUCCESS or FAILED
        ↓
Kafka topic (payment / account events)
        ↓
Audit consumer          Reporting consumer
(skip if event id seen) (skip if event id seen)
```

### R — Result (what changed)

Audit and reporting can follow payment and account changes without your batch waiting on them. A duplicate delivery does not create a duplicate business effect, because the consumer remembers the event id.

---

## Say it in about 60 seconds

> After a payment step is saved, other teams need the news, but I did not want the night job to call audit and reporting one by one and wait. We publish an event to Kafka. Those systems consume at their own pace. Kafka can deliver the same message twice, so the consumer stores the event id and ignores a copy it has already applied. Bad messages go to a dead-letter path instead of looping forever.

---

## If they ask more

| They ask | You say |
|----------|---------|
| Exactly-once? | Delivery is at least once. The consumer makes the effect happen once, using a unique event id. |
| What is the key? | A stable id such as payment id, so one payment’s events stay ordered. |
| What is in the message? | Event id, payment or account id, status, business date, time. Not raw personal data. |
| Producer fails after the database commit? | The row says what happened. A replay or an outbox-style republish can send the event again. The consumer still ignores duplicates. |

## Blind check

- [ ] Explain why you did not call audit directly from the night job
- [ ] Say “at least once” and what the consumer does on a duplicate
- [ ] Say what you do with a message that will never succeed

Next: [Replay API](#/08-replay-api)
