interface DiagnosticContext {
  readonly requestId?: string
  readonly computationId?: string
  readonly candidateId?: string
}

/** Emits bounded, allowlisted metadata only; never serializes requests or exception text. */
export function writeDiagnostic(event: "internal_error" | "candidate_failure" | "partial_response" | "upstream_error",
  code: string, status: number, context: DiagnosticContext, error?: unknown): void {
  const locations = error instanceof Error ? (error.stack ?? "").slice(0, 8192).split("\n").slice(1, 12).flatMap(line => {
    if (!/^\s+at\s/.test(line)) return []
    const match = line.match(/\b((?:apps\/api|packages\/analyzer)\/(?:src|dist)\/[\w./-]+\.[cm]?[jt]s):(\d+):(\d+)/)
    return match ? [`${match[1]}:${match[2]}:${match[3]}`.slice(0, 180)] : []
  }).slice(0, 3) : []
  const record = { event, code: code.slice(0, 64), status,
    ...(context.requestId ? { requestId: context.requestId.slice(0, 64) } : {}),
    ...(context.computationId ? { computationId: context.computationId.slice(0, 64) } : {}),
    ...(context.candidateId ? { candidateId: context.candidateId.slice(0, 120) } : {}), locations }
  try { process.stderr.write(`${JSON.stringify(record)}\n`) } catch { /* Diagnostics cannot replace the original result. */ }
}
