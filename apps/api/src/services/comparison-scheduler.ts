interface Job {
  readonly key: string
  readonly iterator: Generator<unknown, unknown>
  readonly started: number
  readonly waiters: Set<{ resolve: (value: unknown) => void; reject: (error: Error) => void }>
}

export const comparisonLimits = { queuedTasks: 16, taskMs: 60_000, batchCandidates: 4, batchMs: 20,
  cacheMs: 120_000, cacheScenarios: 32, cacheBytes: 32 * 1024 * 1024 } as const

/** Process-local cooperative executor; one expensive candidate is never falsely advertised as preemptible. */
export class ComparisonScheduler {
  private readonly jobs = new Map<string, Job>()
  private readonly queue: Job[] = []
  private scheduled = false
  private closed = false

  run<T>(key: string, create: () => Generator<unknown, T>, signal?: AbortSignal): Promise<T> {
    if (this.closed || signal?.aborted) return Promise.reject(Object.assign(new Error("计算已取消"), { statusCode: 499 }))
    let job = this.jobs.get(key)
    if (!job) {
      if (this.jobs.size >= comparisonLimits.queuedTasks) {
        return Promise.reject(Object.assign(new Error("比较任务繁忙，请稍后重试"), { statusCode: 429 }))
      }
      job = { key, iterator: create(), started: performance.now(), waiters: new Set() }
      this.jobs.set(key, job)
      this.queue.push(job)
    }
    const selected = job
    return new Promise<T>((resolve, reject) => {
      const finish = (callback: () => void) => { signal?.removeEventListener("abort", abort); callback() }
      const waiter = { resolve: (value: unknown) => finish(() => resolve(value as T)),
        reject: (error: Error) => finish(() => reject(error)) }
      const abort = () => {
        selected.waiters.delete(waiter)
        waiter.reject(Object.assign(new Error("计算已取消"), { statusCode: 499 }))
      }
      selected.waiters.add(waiter)
      signal?.addEventListener("abort", abort, { once: true })
      this.schedule()
    })
  }

  close(): void {
    this.closed = true
    for (const job of this.jobs.values()) for (const waiter of job.waiters) waiter.reject(new Error("服务正在关闭"))
    this.jobs.clear()
    this.queue.length = 0
  }

  private schedule(): void {
    if (this.scheduled || this.closed) return
    this.scheduled = true
    setImmediate(() => this.tick())
  }

  private tick(): void {
    this.scheduled = false
    const job = this.queue.shift()
    if (!job) return
    let finished = false
    try {
      if (job.waiters.size === 0) { job.iterator.return(undefined); finished = true }
      else {
        const started = performance.now()
        for (let count = 0; count < comparisonLimits.batchCandidates; count++) {
          if (performance.now() - job.started >= comparisonLimits.taskMs) {
            throw Object.assign(new Error("比较计算超时，请重试"), { statusCode: 503 })
          }
          const next = job.iterator.next()
          if (next.done) {
            for (const waiter of job.waiters) waiter.resolve(next.value)
            finished = true
            break
          }
          if (performance.now() - started >= comparisonLimits.batchMs) break
        }
      }
    } catch (error) {
      for (const waiter of job.waiters) waiter.reject(error instanceof Error ? error : new Error(String(error)))
      job.iterator.return(undefined)
      finished = true
    }
    if (finished) this.jobs.delete(job.key)
    else this.queue.push(job)
    if (this.queue.length) this.schedule()
  }
}
