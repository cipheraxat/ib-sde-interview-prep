# Barclays Bullet 3 — 60% Batch Throughput

Raised batch throughput 60% by replacing synchronous vendor REST work inside TWS-orchestrated jobs with isolated async workers (one file per execution); step state persists in SQL/JPA, and a timeout or non-2xx fails the step instead of recording a dead call as success.

**30 seconds** TWS jobs blocked on sequential vendor REST calls. I introduced async workers — one unit of work per input file — with state in MySQL via JPA. Success only on HTTP 2xx within timeout; otherwise the step fails visibly.

## Before vs after

| Dimension | Before (sync) | After (async workers) |
|----|----|----|
| Execution model | Single thread in TWS step loops all files | Thread pool; each file = independent task |
| Wall-clock | Σ(vendor_latency × files) | ≈ max(batch) with parallelism |
| Failure handling | Timeout sometimes logged as warn, step green | Non-2xx / timeout → FAILED in DB → TWS sees failure |
| Observability | One log blob | Per-file row in `batch_step_execution` |
| Recovery | Re-run entire step | Replay single file (bullet 6) |

## Throughput math (explain 60%)

Example (illustrative):
  Before: 500 files × 2 sec vendor latency = 1000 sec (~16.7 min)
  After:  500 files / 10 workers × 2 sec = 100 sec (~1.7 min)
  Improvement: (1000 - 100) / 1000 = 90% theoretical; real world ~60% after
  rate limits, DB contention, coordination overhead.

Always say: "measured on month-end representative load, same file volume."
  

**Q:** Why “one file per execution”?

Legacy Unix batch already used files as boundaries — ops drops file, job processes it. Idempotency: reprocessing same file name + checksum = safe replay. Parallelism: files independent if no cross-file dependency. TWS step can wait for “all files in directory processed” via aggregate status query.

**Q:** JPA entity — what fields?

@Entity
@Table(name = "batch_step_execution")
class BatchStepExecution {
  @Id Long id;
  String fileName;
  String jobStreamId;
  String stepName;
  @Enumerated(EnumType.STRING) StepStatus status; // PENDING, RUNNING, SUCCESS, FAILED
  String vendorCorrelationId;
  Integer httpStatus;
  Integer retryCount;
  String errorMessage;
  Instant startedAt;
  Instant completedAt;
  @Version Long version;  // optimistic lock
}
  

**Q:** How does TWS know async work finished?

Pattern A: TWS step polls `GET /batch/status?streamId=` until all files terminal. Pattern B: worker pool runs inside long-running step with internal join. Pattern C: TWS triggers “fan-out” job per file (80+ workflows variant). Pick the pattern you actually used and stick to it.

**Q:** Spring implementation sketch

@Service
class FileProcessorService {
  @Async("vendorExecutor")
  public CompletableFuture\ processFile(String fileName) {
    BatchStepExecution step = repo.save(running(fileName));
    try {
      ResponseEntity\ resp = vendorClient.submit(fileName);
      if (!resp.getStatusCode().is2xxSuccessful()) {
        step.fail("HTTP " + resp.getStatusCode());
      } else {
        step.success();
      }
    } catch (ResourceAccessException ex) { // timeout
      step.fail("TIMEOUT");
    } finally {
      repo.save(step);
    }
    return CompletableFuture.completedFuture(null);
  }
}
  

**Q:** Concurrency pitfalls and fixes

| Problem | Fix |
|----|----|
| Same file processed twice | Unique constraint on (file_name, business_date); status check before RUNNING |
| Vendor rate limit 429 | Semaphore limiting concurrency; exponential backoff |
| Partial DB commit | @Transactional on state update; vendor call after PENDING→RUNNING |
| Thread pool exhaustion | Bounded queue; reject policy → FAILED with reason QUEUE_FULL |
| Lost update on status | @Version optimistic lock; retry on OptimisticLockException |

**Q:** Why was false success a problem before?

Downstream recon and reporting assumed vendor received data. Silent timeout → missing payments in SaaS → regulatory and ops impact. Strict failure semantics let TWS block dependent jobs and ops fix before EOD deadline.
