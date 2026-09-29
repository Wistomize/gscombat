import { object, text, type SourceLock } from "./input.js"
import type { SemanticInventory } from "./semantic-inventory.js"
import type { SemanticMappingCheck } from "./semantic-mapping.js"

export interface PendingSemanticDecision {
  target: string
  semanticName: string
  question: string
  sourceEvidence: { sourcePath: string; sourceSha256: string; shortExcerpt: string }[]
  candidateConversions: { description: string; candidateValue: number | null }[]
}

export interface SemanticDecisionReport extends PendingSemanticDecision {
  status: "needs-user-decision"
  baselineValue: number
  affectedContentReferences: string[]
}

function evidenceText(path: string, inputs: Map<string, unknown>, lock: SourceLock, sha: string): string {
  const split = path.indexOf("#/")
  if (split < 0) throw new Error(`Invalid decision source path: ${path}`)
  const file = path.slice(0, split)
  if (lock.files[file] !== sha) throw new Error(`Unlocked decision source: ${path}`)
  let value: unknown = inputs.get(file)
  for (const segment of path.slice(split + 2).split("/")) {
    value = object(value)[segment.replace(/~1/g, "/").replace(/~0/g, "~")]
  }
  return text(value)
}

/** Builds user-facing unresolved cases; a pending case can never count as a reviewed import. */
export function buildSemanticDecisionReport(inventory: SemanticInventory, check: SemanticMappingCheck,
  pending: PendingSemanticDecision[], references: { location: string; reference: unknown }[],
  inputs: Map<string, unknown>, lock: SourceLock): SemanticDecisionReport[] {
  const fields = new Map(inventory.fields.map(field => [field.target, field] as const))
  const reviewed = new Set(check.resolved.map(row => row.target))
  const seen = new Set<string>()
  return pending.map(row => {
    const field = fields.get(row.target)
    if (!field || reviewed.has(row.target) || seen.has(row.target)) throw new Error(`Invalid pending decision: ${row.target}`)
    seen.add(row.target)
    if (!row.semanticName || !row.question || !row.sourceEvidence.length || !row.candidateConversions.length) {
      throw new Error(`Incomplete pending decision: ${row.target}`)
    }
    for (const evidence of row.sourceEvidence) {
      if (!evidence.shortExcerpt || evidence.shortExcerpt.length > 100 ||
        !evidenceText(evidence.sourcePath, inputs, lock, evidence.sourceSha256).includes(evidence.shortExcerpt)) {
        throw new Error(`Invalid pending evidence: ${row.target}`)
      }
    }
    const affectedContentReferences = references.filter(reference => {
      const item = object(reference.reference)
      const owner = String(item.talentParameterOwnerId ?? reference.location.split("/")[0])
      if (owner !== field.owner || item.groupId !== field.group) return false
      if (Array.isArray(item.path)) return JSON.stringify(item.path) === JSON.stringify(field.path)
      return typeof item.parameterIndex === "number" && item.parameterIndex === field.path[0]
    }).map(reference => reference.location)
    return { ...row, status: "needs-user-decision" as const, baselineValue: field.baselineValue,
      affectedContentReferences }
  })
}
