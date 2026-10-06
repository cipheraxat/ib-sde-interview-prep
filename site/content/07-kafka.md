# Kafka payment events

**On your resume:** You used **Kafka** to publish payment and account events so audit and reporting systems can react. You also made the **consumer safe to run the same message twice**.

**In the night:** After the service saves SUCCESS or FAILED, this is how audit and reporting hear about it. The batch does not wait for them.

---

## STAR — the story

### S — Situation (what the world looked like)

When a payment step finished, more than one team needed to know. Audit needed a record. Reporting needed numbers. Sometimes another system needed to update an account view. The old habit is to call each of those systems **directly** from the integration service, one HTTP call after another.

That ties your night job to their uptime. If reporting is slow, your night job waits. If you add a new reader next year, you have to change the payment code again. And if the network drops a message, nobody is sure who missed it.

Kafka is a **log of events**. Your service writes “this payment step finished.” Other teams read that log at their own speed. Your job does not wait for their reports to finish.

### T — Task (what you were asked to do)

After a payment step is saved, audit and reporting need the news without making the night job wait on them. A repeat of the same news must not create a second audit row or double-count a report.

### A — Action (what you actually built)

1. After your service **knows** the step outcome (and has saved it), it publishes an event. The message says what happened: payment id, account, status, business date, and a stable event id.
2. The **key** is a stable id, such as the payment id. Events for the same payment stay together and stay in order. That ordered group is called a partition. In the interview, “the same payment stays in order” is enough unless they ask for the word.
3. Audit and reporting are **separate consumers**. They do not sit inside your night job.
4. Kafka in this design is **at least once**. That means a consumer might see a message twice after a crash or a retry. That is normal. You do not tell the interviewer “we have exactly-once everywhere.”
5. The consumer checks the event id before it inserts. If that id is already stored, it skips. The second copy does no harm. That property is called idempotent: doing it twice has the same effect as doing it once.
6. The consumer can save the audit row and then crash before it tells Kafka it is done. Kafka sends the message again. The saved event id makes the second copy a no-op.
7. If the message itself is bad (wrong shape, unknown account), you do not retry forever. You put it on a side path and alert a person. That side path is a dead-letter queue. Retry is for temporary failures (database blip), not for garbage data.

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
| Only if they ask: producer fails after the database commit? | The MySQL row already says what happened. You can publish the event again from that row. The consumer still ignores a duplicate event id. Some teams keep a separate outbox table for “not yet published”: one row per event, a published flag, and a job that sends rows still marked unpublished. Draw that table before you say the word outbox. |

## If they ask for code

The key is the payment id, so one payment’s events stay in order. The consumer’s safety is a unique `event_id`. A second delivery hits that key and changes nothing.

```java
kafkaTemplate.send("payment-events", paymentId, event); // key, then value
```

```java
@KafkaListener(topics = "payment-events")
public void onEvent(PaymentEvent event) {
    int inserted = jdbc.update("""
        INSERT INTO audit_event (event_id, payment_id, status)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE event_id = event_id
        """, event.eventId(), event.paymentId(), event.status());
    // inserted == 0 → this event id was already applied
}
```

IB also uses Oracle. The same idea is `MERGE`, matched on `event_id`, insert only when not matched.

A bad message does not retry forever:

```java
try {
    apply(event);
} catch (BadMessageException bad) {
    kafkaTemplate.send("payment-events.dlt", event); // dead-letter: a person looks at it
}
```

A database blip is different. Let that exception escape so the listener can retry. The unique `event_id` still protects you if the first attempt actually saved.

## Blind check

- [ ] Explain why you did not call audit directly from the night job
- [ ] Say “at least once” and what the consumer does on a duplicate
- [ ] Say what you do with a message that will never succeed
- [ ] Write the send with a key, and the insert that ignores a duplicate `event_id`

Next: [Replay API](#/08-replay-api)
