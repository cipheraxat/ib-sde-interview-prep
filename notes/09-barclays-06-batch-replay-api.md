# Barclays Bullet 6 — Batch Replay & Recovery API

Built internal Spring Boot service for batch replay and step-level recovery after TWS failures; APIs for ops to re-trigger failed payment-load steps without manual DB intervention.

**30 seconds** When TWS steps failed, ops needed DBAs to fix state. I built internal REST APIs to list failures and safely replay a file or step using persisted JPA state — with auth, idempotency, and audit logs.

Prepare one **concrete story** — interviewers will drill this. Use the template below and fill in real file names / dates from your experience.

## API design

| Endpoint | Purpose | Notes |
|----|----|----|
| `GET /api/v1/failures?businessDate=&step=` | List failed executions | Paginated; filter by job stream |
| `GET /api/v1/executions/{id}` | Detail + error message | vendor correlation ID, HTTP status |
| `POST /api/v1/replay/{executionId}` | Re-queue single file | Only if status=FAILED |
| `POST /api/v1/replay/bulk` | Replay list of IDs | Ops month-end recovery |
| `GET /api/v1/replay/{id}/status` | Poll replay outcome | REPLAYING → SUCCESS/FAILED |

## Replay state machine

FAILED ──(ops POST replay)──▶ REPLAYING ──(worker)──▶ SUCCESS
                                  │
                                  └──▶ FAILED (increment retry_count)
  

**STAR incident story (template)** **S:** Month-end payment-load step failed at 03:00 — 47 files in FAILED state; vendor had transient 503.
**T:** Restore before 06:00 downstream recon deadline without duplicate payments.
**A:** Used failures API to list 47 rows; confirmed vendor healthy; called bulk replay; monitored REPLAYING→SUCCESS; verified recon counts matched.
**R:** Zero manual SQL; saved ~2 hours vs DBA path; added alert on FAILED \> 10.

**Q:** How prevent double payment on replay?

1.  Only FAILED (never SUCCESS) eligible for replay.
2.  Optimistic lock: `UPDATE ... WHERE status='FAILED' AND version=?`
3.  Vendor idempotency header with same business key.
4.  Audit log: who replayed, when, from which IP.
5.  Max replay count — after 3 → MANUAL_REVIEW ticket.

**Q:** Security?

Internal VPN only; OAuth2 / bank SSO; role `OPS_REPLAY`; no external exposure; all mutations logged to SIEM; rate limit bulk replay.

**Q:** Difference vs TWS native restart?

TWS restarts job definition from scratch — may reprocess entire directory. Your API replays *granular* failed units with business-aware idempotency and visibility — complements TWS, doesn’t replace it.
