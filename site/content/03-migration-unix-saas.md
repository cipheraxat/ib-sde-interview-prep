# Unix to SaaS migration

**On your resume:** You helped move payment operations off an old Unix system onto a vendor product hosted on AWS. You wrote Java / Spring Boot services for more than 80 scheduled business processes. Those services talk to the vendor over REST. The platform handles more than 5,000 transactions a day across more than 100,000 accounts.

**Say this early:** On your resume, TWS means **IBM Workload Scheduler** (the tool that starts overnight jobs). It does **not** mean Interactive Brokers’ Trader Workstation.

**In the night:** This is the service in the middle. The scheduler starts it. It calls the vendor and writes the result. The timeout rule is the one on [Async and throughput](#/05-async-throughput). Say that rule once.

---

## STAR — the story

### S — Situation (what the world looked like)

For years, payment operations at the bank ran on **old Unix servers**. Much of the work was shell scripts, files dropped on a shared disk, and jobs that a scheduler started at night. That setup had worked for a long time, but it was hard to change. There were few automated tests. A lot of the real rules lived only in people’s memory. When something failed at 2 a.m., you often had to read logs and guess.

The bank decided to stop running that old product itself and use a **vendor’s software instead**. The vendor hosts that software on **AWS** (this is called SaaS: they run the app, you connect to it). The bank could not simply “switch off Unix on Friday.” Overnight batches still had to move money-related status, call the vendor, and know whether each step really finished. If a step is marked done when it is not, the next job in the chain runs on bad data.

### T — Task (what you were asked to do)

Own the **middle layer**. The scheduler still had to start each overnight step. Something had to call the vendor, and something had to record whether that step really finished. The program covered **80+ business processes**, **5,000+ transactions a day**, and **100,000+ accounts**. You were one engineer on that program. The bank migration was a larger effort around you.

### A — Action (what you actually built)

Picture one nightly job, “sync payment status”:

1. At the scheduled time, **IBM TWS** starts the job. TWS is a chain of jobs. Job B does not start until job A succeeds.
2. The job calls your service, for example `POST /integration/payment-sync`.
3. Your service reads the work: rows waiting in a table, or a file that landed on disk.
4. For each item it checks the data, maps the bank’s ids to the vendor’s ids, and calls the vendor’s REST API.
5. It **writes the outcome in MySQL**: SUCCESS or FAILED, plus the vendor’s reference id and the time.
6. It tells TWS the step is good only when the checks pass: the vendor returned success, and the MySQL row says SUCCESS. Those checks are the acceptance rules. If they fail, the job fails and **later jobs stay blocked**. A timeout is FAILED. That is the same rule as the [async story](#/05-async-throughput).
7. For several nights the **old Unix job and the new service both ran**. You compared status and counts between them. The new path became the one that counts only after those matched.
8. If the new path misbehaved, rollback was simple in concept: point TWS back at the **old job definitions**.

```
IBM TWS  →  your Spring Boot service on Linux  →  vendor REST API  →  vendor app on AWS
                      ↓
              MySQL (did this step succeed?)
Old Unix path stays until the compare is clean
```

**When the vendor call goes wrong, you do not guess:**

| What happened | What your service does |
|---------------|------------------------|
| Network blip or vendor 5xx | Retry only if doing it twice cannot create a second payment |
| Vendor says your request is invalid (4xx) | Do not keep retrying. Mark FAILED and alert |
| The call times out | Mark FAILED until you know the truth. Never mark SUCCESS just because you stopped waiting |
| Vendor is fully down | Fail fast so the whole night batch does not hang |
| Someone runs the same file again | Must not post the same payment twice |

### R — Result (what changed)

The integration services run in production for that scope. Each step has a row in the database, so ops can see what failed. Downstream jobs run only after a real success. The bank could move off the old Unix path gradually, with a way back.

---

## Say it in about 60 seconds

> Payment operations used to be Unix scripts and night jobs. The bank moved the product to a vendor system on AWS, but we still had to call that vendor and know if each step really finished. I built Spring Boot services that IBM’s job scheduler starts. They call the vendor’s REST API and save SUCCESS or FAILED in MySQL. That covers 80-plus workflows, 5,000-plus transactions a day, and 100,000-plus accounts. For several nights the old job and the new service both ran, and we compared status and counts before we trusted the new one. If we needed to go back, we pointed the scheduler at the old jobs again. A timeout is FAILED. That rule is the same one I use on the async story.

---

## If they ask more

| Word | Plain meaning |
|------|----------------|
| SaaS | The vendor runs the application. You integrate with it. |
| Job stream | A chain of night jobs. The next job waits for the previous one. |
| Parallel run | Old system and new system both run so you can compare. |
| Idempotent | Doing the same request twice does not create two payments. |

**How you debug a stuck night:** scheduler log → your application log → the SQL row for that step → vendor status → fix or replay → the next job can run.

<details>
<summary>Why Java services instead of more shell scripts?</summary>
Scripts were hard to test and easy to get subtly wrong. A Spring Boot service has clear inputs, a database row for every step, health checks, and tests you can run before production.
</details>

## Blind check

- [ ] Tell the story: old Unix, vendor on AWS, your middle layer, compare before cutover
- [ ] Explain why a timeout must not be called success
- [ ] Say what TWS means on your resume

Next: [PII and tokenization](#/04-pii-tokenization)
