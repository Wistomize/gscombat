import type { DatabaseSync } from "node:sqlite"
import { text, type Mappings } from "./input.js"

export interface SemanticField {
  owner: string
  group: string
  path: number[]
  target: string
  batch: string
  baselineValue: number
}

export interface SemanticInventory {
  fields: SemanticField[]
  batches: { id: string; owners: string[]; groups: number; fields: number }[]
  counts: { owners: number; groups: number; fields: number; emptyGroups: number; metadataGroups: number }
}

function numericFields(value: unknown, path: number[] = []): { path: number[]; value: number }[] {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Non-finite baseline field at ${path.join("/")}`)
    return [{ path, value }]
  }
  return Array.isArray(value) ? value.flatMap((child, index) => numericFields(child, [...path, index])) : []
}

/** Enumerates the unmapped numeric leaves in the pinned canonical snapshot without importing their old values. */
export function buildSemanticInventory(baseline: DatabaseSync, mappings: Mappings): SemanticInventory {
  const mapped = new Set(mappings.talents.map(row => `${row.owner}/${row.group}`))
  const groups: { owner: string; group: string; leaves: { path: number[]; value: number }[] }[] = []
  let emptyGroups = 0, metadataGroups = 0
  const rows = baseline.prepare("SELECT character_id, group_id, values_json FROM character_skill_parameter_groups ORDER BY character_id, group_id").all()
  for (const row of rows) {
    const owner = text(row.character_id), group = text(row.group_id)
    if (mapped.has(`${owner}/${group}`)) continue
    const values: unknown = JSON.parse(text(row.values_json))
    if (!Array.isArray(values)) throw new Error(`Invalid baseline group: ${owner}/${group}`)
    if (!values.length) { emptyGroups++; continue }
    const leaves = numericFields(values)
    if (!leaves.length) { metadataGroups++; continue }
    groups.push({ owner, group, leaves })
  }
  const owners = [...new Set(groups.map(row => row.owner))].sort()
  const ownerBatch = new Map(owners.map((owner, index) => [owner, `B${String(Math.floor(index / 10) + 1).padStart(2, "0")}`]))
  const fields = groups.flatMap(({ owner, group, leaves }) => leaves.map(({ path, value }) => ({ owner, group, path,
    target: `${owner}/${group}/${path.join("/")}`, batch: ownerBatch.get(owner)!, baselineValue: value })))
  const targets = new Set(fields.map(row => row.target))
  if (targets.size !== fields.length) throw new Error("Duplicate semantic target")
  const batches = Array.from({ length: Math.ceil(owners.length / 10) }, (_, index) => {
    const id = `B${String(index + 1).padStart(2, "0")}`
    const members = owners.slice(index * 10, (index + 1) * 10)
    return { id, owners: members, groups: groups.filter(row => members.includes(row.owner)).length,
      fields: fields.filter(row => row.batch === id).length }
  })
  return { fields, batches, counts: { owners: owners.length, groups: groups.length, fields: fields.length,
    emptyGroups, metadataGroups } }
}

/** Rejects baseline drift before a semantic mapping review uses the fixed batch manifest. */
export function assertPinnedSemanticInventory(inventory: SemanticInventory): void {
  const expected = { owners: 130, groups: 732, fields: 1893, emptyGroups: 620, metadataGroups: 14 }
  for (const [key, value] of Object.entries(expected)) {
    if (inventory.counts[key as keyof typeof expected] !== value) throw new Error(`Semantic inventory drift: ${key}`)
  }
  if (inventory.batches.length !== 13 || inventory.batches.some(row => row.owners.length !== 10)) {
    throw new Error("Semantic batch manifest drift")
  }
}
