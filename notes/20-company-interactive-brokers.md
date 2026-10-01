# Interactive Brokers — Company & Domain Notes

## What IB is (interview-safe overview)

Interactive Brokers (IBKR) is a global electronic brokerage: accounts, order entry, market data, execution, clearing/settlement-related back office, and customer/account systems. Engineering culture is known for **performance, correctness, and lean tooling** — expect interviewers who care about details.

**Your fit:** Java + SQL + Linux production systems in a **regulated financial** environment (Barclays payments/treasury **integration**), not pretending brokerage order-matching experience.

---

## Role snapshot (IBSSI Software Engineer)

From the JD you saved (`00-job-description.md`):

**Core:** Java, Unix/Linux, Oracle/MySQL, SQL, large systems / client apps  
**Preferred:** Financial services exposure, Java+Python performance, Unix Shell, Kafka, REST, Git/Jenkins, PL/SQL, prod troubleshooting, front-end or corresponding back-end

**Portal honesty notes**
- **Capital / financial markets:** Frame as investment-bank **payment/treasury workflows**, not retail brokerage trading.
- **Perl:** Don’t claim deep Perl; Unix Shell during legacy migration is enough if asked lightly.
- **PL/SQL:** Recon/batch SQL ownership — not “I write packages all day.”

Apply / portal: see `00-job-description.md`.

---

## Domain vocabulary (learn enough to converse)

| Term | Meaning | How you relate |
|---|---|---|
| Order | Client instruction to buy/sell | State machine like your batch steps |
| Fill / execution | Trade actually done | Terminal SUCCESS state |
| Position | Net holdings | Aggregates from events (Kafka-like) |
| Market data | Prices/quotes/feeds | Fan-out consumers; backpressure |
| Clearing / settlement | Post-trade processing | Batch windows, recon — **your strength** |
| Margin | Collateral / buying power checks | Rule engines, risk APIs |
| Back office | Account, cash, corporate actions | SQL-heavy, correctness-critical |
| OMS / EMS | Order / execution management systems | Don’t claim you built one |
| FIX | Financial Information eXchange protocol | Protocol for trading messages — know it exists |
| Trader Workstation (TWS) | IB’s desktop trading platform | **NOT** IBM TWS on your resume — clarify early |

---

## Map your resume → IB concerns

| IB cares about | Your proof |
|---|---|
| Java on Linux | Barclays Spring Boot services |
| SQL correctness | Recon over 100K+ accounts |
| Reliability | Timeout ⇒ FAILED; replay APIs |
| Async / scale | Async workers +60% throughput; Kafka |
| Security / compliance | Tokenization, Veracode zero critical |
| Ops mindset | Jenkins, runbooks, RAG with HITL |
| Collaboration | OSS PRs, multi-team migration |

---

## Likely interview loop (prepare for)

1. **Recruiter / HR** — why IB, notice period, location (Mumbai/Pune), compensation band  
2. **Technical screen** — Java + SQL + 1–2 resume deep-dives  
3. **Deep technical / system design** — tokenization, async, Kafka, replay  
4. **Hiring manager** — ownership, conflict, production stories, culture fit  

Adjust if they send a written/online coding test first.

---

## Research checklist (do before interview day)

- [ ] Skim IBKR About / careers / recent engineering blog posts if any  
- [ ] Re-read JD keywords and your resume side-by-side  
- [ ] Clarify **IBM TWS vs Trader Workstation** aloud once  
- [ ] Prepare 2 questions specific to **their team** (ask recruiter what the team owns)
