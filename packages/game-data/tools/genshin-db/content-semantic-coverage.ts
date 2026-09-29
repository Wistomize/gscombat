import { object } from "./input.js"
import type { BaselineGroupAudit } from "./gaps.js"
import type { SemanticInventory } from "./semantic-inventory.js"

interface ContentReference {
  location: string
  status: string
  reference: unknown
}

/** Classifies unresolved Content references against the exact semantic group and Traveler variant boundary. */
export function contentSemanticCoverage(references: ContentReference[], inventory: SemanticInventory,
  groups: BaselineGroupAudit[]) {
  const known = new Set(inventory.fields.map(field => `${field.owner}/${field.group}`))
  const audit = new Map<string, BaselineGroupAudit>(groups.map(group => [`${group.owner}/${group.group}`, group]))
  return references.filter(row => row.status !== "present").map(row => {
    const reference = object(row.reference)
    const owner = String(reference.talentParameterOwnerId ?? row.location.split("/")[0])
    const group = String(reference.groupId ?? "")
    const key = `${owner}/${group}`
    const source = audit.get(key)
    const category = row.location.startsWith("Traveler/") ? "traveler-variant-context"
      : known.has(key) ? source?.status === "cross-section-review" ? "cross-section-review" : "description-review"
        : "outside-semantic-inventory"
    return { location: row.location, owner, group, category, sourcePath: source?.sourcePath ?? null,
      relatedSourcePaths: source?.relatedSourcePaths ?? [], reference }
  })
}
