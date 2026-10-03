# 7-day drill schedule & mock scripts

Reading pages ≠ readiness. This is the **practice loop**.

## Rules

1. Speak answers out loud (phone voice memo helps).  
2. A lesson is done only if blind checklist passes.  
3. After each mock, write 3 misses into [Personal facts](#/02a-personal-facts).

---

## 7-day plan

| Day | Focus | Time | Pass criteria |
|-----|-------|------|----------------|
| 1 | Start here + Personal facts + Framing opener | 60–90m | Opener without notes; TWS clarified |
| 2 | Tokenization deep (proof/recovery/cutover) | 90–120m | Draw diagram; mismatch SQL; 2min script |
| 3 | Async + Replay + Kafka skim | 90m | False-SUCCESS story + worker model |
| 4 | Java/Spring core + SQL worked set | 90m | 3 Java Qs + 3 SQL from memory |
| 5 | Coding timed (2 DSA) + System design 1 | 90m | Problems finished with narration |
| 6 | Full mock: screen + design | 90m | See scripts below |
| 7 | Behavioral + Cheat sheet only | 60m | Why IB + 3 STAR + rest |

Night before interview: **Cheat sheet only** — no new topics.

---

## Mock A — Technical screen (45 min)

**Interviewer plays:** warm backend eng.

1. Tell me about yourself (2 min)  
2. Deep dive: tokenization OR async (15 min)  
3. Java question: HashMap / `@Transactional` / thread pool (10 min)  
4. SQL: write recon mismatch query (10 min)  
5. Your questions (5 min)  

**Self-score (0–2 each):** clarity, correctness, ownership precision, failure thinking. Target ≥ 6/8.

---

## Mock B — System design (45 min)

Prompt: *Design tokenization + recon for 100K accounts with zero downtime.*

You must cover:

1. Requirements / constraints  
2. Trust zones diagram  
3. State machine  
4. **Proof** (recon join, not job green)  
5. **Recovery** (chunks, retries, MANUAL_REVIEW)  
6. **Cutover phases** + rollback  
7. Metrics / alerts  

---

## Mock C — Hiring manager (30 min)

1. Why IB / why leave  
2. Conflict or ambiguity STAR  
3. Production incident walkthrough  
4. LLM safety (HITL)  
5. Questions for them  

---

## Trap questions (instant fail if missed)

| Trap | Correct stance |
|------|----------------|
| “So you worked on TWS the trading app?” | IBM Workload Scheduler for batch |
| “You built trading systems at Barclays?” | Payment/treasury **integration**, not brokerage matching |
| “Does the LLM fix prod automatically?” | No — suggestions + human-in-the-loop |
| “You migrated all 80 processes yourself?” | Contributed; owned integration pieces |
| “Kafka is exactly-once, right?” | At-least-once + idempotent consumers (unless you truly built EOS) |

---

## Daily 15-minute warmup (any day)

1. 60s opener  
2. One number + meaning  
3. One failure-mode sentence (timeout ⇒ FAILED **or** CONFIRMED only after vendor proof)

Next: [Cheat sheet](#/15-cheat-sheet)
