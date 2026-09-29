import { object, text, type SourceLock } from "./input.js"
import type { SemanticField, SemanticInventory } from "./semantic-inventory.js"

export interface SemanticTerm {
  kind: "description-literal" | "source-number"
  sourcePath: string
  sourceSha256: string
  quote?: string
  literal?: string
}

export interface ReviewedSemanticMapping {
  target: string
  semanticName: string
  canonicalUnit: string
  sourceUnit: string
  rationale: string
  formula: "identity" | "multiply"
  terms: SemanticTerm[]
  reviewedValue: number
}

const unitRules = {
  percent: { canonicalUnit: "ratio", formula: "identity", termKinds: ["description-literal"] },
  seconds: { canonicalUnit: "seconds", formula: "identity", termKinds: ["description-literal"] },
  "burst energy times restored ratio": { canonicalUnit: "energy", formula: "multiply",
    termKinds: ["description-literal", "source-number"] }
} as const

function checkUnitRule(mapping: ReviewedSemanticMapping): void {
  const rule = unitRules[mapping.sourceUnit as keyof typeof unitRules]
  if (!rule || rule.canonicalUnit !== mapping.canonicalUnit || rule.formula !== mapping.formula ||
    mapping.terms.length !== rule.termKinds.length ||
    mapping.terms.some((term, index) => term.kind !== rule.termKinds[index])) {
    throw new Error(`Unsupported semantic unit conversion: ${mapping.target}`)
  }
  const literal = mapping.terms[0]?.literal ?? ""
  const quote = mapping.terms[0]?.quote ?? ""
  if (mapping.sourceUnit === "seconds" && (literal.endsWith("%") || !quote.includes("秒"))) {
    throw new Error(`Invalid seconds evidence: ${mapping.target}`)
  }
  if (mapping.sourceUnit !== "seconds" && !literal.endsWith("%")) {
    throw new Error(`Invalid percentage evidence: ${mapping.target}`)
  }
}

export interface SemanticMappingCheck {
  batch: string | null
  expected: number
  reviewed: number
  missing: string[]
  resolved: { target: string; value: number; baselineValue: number }[]
}

function sourceValue(term: SemanticTerm, inputs: Map<string, unknown>, lock: SourceLock): number {
  const split = term.sourcePath.indexOf("#/")
  if (split < 0) throw new Error(`Invalid source pointer: ${term.sourcePath}`)
  const file = term.sourcePath.slice(0, split)
  if (lock.files[file] !== term.sourceSha256) throw new Error(`Unlocked or changed source: ${file}`)
  let current: unknown = inputs.get(file)
  for (const part of term.sourcePath.slice(split + 2).split("/")) {
    const key = part.replace(/~1/g, "/").replace(/~0/g, "~")
    if (!current || typeof current !== "object" || !Object.hasOwn(current, key)) {
      throw new Error(`Missing source path: ${term.sourcePath}`)
    }
    current = (current as Record<string, unknown>)[key]
  }
  if (term.kind === "source-number") {
    if (typeof current !== "number" || !Number.isFinite(current)) throw new Error(`Non-numeric source: ${term.sourcePath}`)
    return current
  }
  const description = text(current)
  if (!term.quote || !term.literal || !term.quote.includes(term.literal) ||
    description.split(term.quote).length !== 2) throw new Error(`Ambiguous description evidence: ${term.sourcePath}`)
  if (!/^\d+(?:\.\d+)?%?$/.test(term.literal)) throw new Error(`Unsupported literal: ${term.literal}`)
  return Number(term.literal.replace(/%$/, "")) / (term.literal.endsWith("%") ? 100 : 1)
}

/** Recomputes every reviewed field exclusively from fixed source data, leaving old values for comparison only. */
export function checkSemanticMappings(inventory: SemanticInventory, mappings: ReviewedSemanticMapping[],
  inputs: Map<string, unknown>, lock: SourceLock, batch: string | null = null): SemanticMappingCheck {
  if (batch && !inventory.batches.some(row => row.id === batch)) throw new Error(`Unknown batch: ${batch}`)
  const expected = inventory.fields.filter(field => !batch || field.batch === batch)
  const targets = new Map(expected.map(field => [field.target, field] as const))
  const seen = new Set<string>()
  const resolved: SemanticMappingCheck["resolved"] = []
  for (const mapping of mappings) {
    const field: SemanticField | undefined = targets.get(mapping.target)
    if (!field) {
      if (batch && inventory.fields.some(row => row.target === mapping.target)) continue
      throw new Error(`Unknown semantic target: ${mapping.target}`)
    }
    if (seen.has(mapping.target)) throw new Error(`Duplicate semantic target: ${mapping.target}`)
    seen.add(mapping.target)
    if (!mapping.semanticName || !mapping.canonicalUnit || !mapping.sourceUnit || !mapping.rationale) {
      throw new Error(`Incomplete semantic evidence: ${mapping.target}`)
    }
    checkUnitRule(mapping)
    if (mapping.terms.length !== (mapping.formula === "identity" ? 1 : 2)) {
      throw new Error(`Invalid formula terms: ${mapping.target}`)
    }
    const values = mapping.terms.map(term => sourceValue(term, inputs, lock))
    const value = mapping.formula === "identity" ? values[0]! : values[0]! * values[1]!
    if (!Number.isFinite(value) || Math.abs(value - mapping.reviewedValue) > 1e-9) {
      throw new Error(`Semantic value drift: ${mapping.target}`)
    }
    resolved.push({ target: mapping.target, value, baselineValue: field.baselineValue })
  }
  const missing = expected.filter(field => !seen.has(field.target)).map(field => field.target)
  return { batch, expected: expected.length, reviewed: resolved.length, missing, resolved }
}

/** Parses only the reviewed semantic mapping asset, rejecting malformed rows before source resolution. */
export function parseSemanticMappings(value: unknown): ReviewedSemanticMapping[] {
  if (!Array.isArray(value)) throw new Error("Expected semantic mapping array")
  return value.map((row, index) => {
    const entry = object(row)
    if (!Array.isArray(entry.terms)) throw new Error(`Missing semantic terms at ${index}`)
    if (typeof entry.target !== "string" || typeof entry.semanticName !== "string" ||
      typeof entry.canonicalUnit !== "string" || typeof entry.sourceUnit !== "string" ||
      typeof entry.rationale !== "string" || typeof entry.reviewedValue !== "number" ||
      !Number.isFinite(entry.reviewedValue) || !["identity", "multiply"].includes(String(entry.formula))) {
      throw new Error(`Invalid semantic mapping at ${index}`)
    }
    for (const term of entry.terms) {
      const source = object(term)
      if (!["description-literal", "source-number"].includes(String(source.kind)) ||
        typeof source.sourcePath !== "string" || typeof source.sourceSha256 !== "string") {
        throw new Error(`Invalid semantic source at ${index}`)
      }
    }
    return entry as unknown as ReviewedSemanticMapping
  })
}
