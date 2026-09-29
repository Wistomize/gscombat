import type { GiStatsDocument } from "../../src/types.js"
import type { SemanticInventory } from "./semantic-inventory.js"
import type { SemanticMappingCheck } from "./semantic-mapping.js"

function setLeaf(root: unknown[], path: number[], value: number): void {
  if (!path.length) throw new Error("Empty semantic target path")
  let cursor = root
  for (const index of path.slice(0, -1)) {
    if (cursor[index] === undefined) cursor[index] = []
    if (!Array.isArray(cursor[index])) throw new Error(`Conflicting semantic target path: ${path.join("/")}`)
    cursor = cursor[index] as unknown[]
  }
  const last = path.at(-1)!
  if (cursor[last] !== undefined) throw new Error(`Duplicate semantic target path: ${path.join("/")}`)
  cursor[last] = value
}

function assertDense(value: unknown, target: string): void {
  if (typeof value === "number" && Number.isFinite(value)) return
  if (!Array.isArray(value) || !value.length) throw new Error(`Invalid semantic group: ${target}`)
  for (let index = 0; index < value.length; index++) {
    if (!Object.hasOwn(value, index)) throw new Error(`Sparse semantic group: ${target}/${index}`)
    assertDense(value[index], `${target}/${index}`)
  }
}

/** Adds only complete, source-reviewed passive and constellation groups to an isolated candidate document. */
export function withReviewedSemanticGroups(document: GiStatsDocument, inventory: SemanticInventory,
  check: SemanticMappingCheck): GiStatsDocument {
  if (check.batch !== null) throw new Error("Cannot import a single batch as a candidate")
  const resolved = new Map(check.resolved.map(row => [row.target, row.value] as const))
  const groups = new Map<string, typeof inventory.fields>()
  for (const field of inventory.fields) {
    const target = `${field.owner}/${field.group}`
    const fields = groups.get(target) ?? []
    fields.push(field)
    groups.set(target, fields)
  }
  const skills: Record<string, Record<string, unknown>> = Object.fromEntries(Object.entries(document.char.skillParam)
    .map(([owner, values]) => [owner, { ...values }]))
  for (const [groupTarget, fields] of groups) {
    if (!fields.every(field => resolved.has(field.target))) continue
    const { owner, group } = fields[0]!
    const ownerGroups = skills[owner] ??= {}
    if (Object.hasOwn(ownerGroups, group)) throw new Error(`Duplicate candidate group: ${groupTarget}`)
    const value: unknown[] = []
    for (const field of fields) setLeaf(value, field.path, resolved.get(field.target)!)
    assertDense(value, groupTarget)
    ownerGroups[group] = value
  }
  return { ...document, char: { ...document.char, skillParam: skills } }
}
