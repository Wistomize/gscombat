import { listCombatActionEffects } from "./combat-action-effects.js"
import { equipmentCoverageLedger } from "./equipment-coverage-ledger.js"
import { artifactSetInventory } from "./equipment-inventory.js"
import { listHealingEquipmentEffects } from "./rules/equipment/healing/effects.js"
import { listRecipientEquipmentEffects } from "./rules/equipment/recipient/effects.js"
import { equipmentCombatCapabilities } from "./registry/equipment-capabilities.generated.js"

export interface ArtifactComparisonSet {
  readonly setId: string
  readonly label: string
  readonly twoPieceKey: string
  readonly twoPieceSupported: boolean
  readonly fourPieceSupported: boolean
  readonly excludedReasons: readonly string[]
}

/** Only unconditional self-owned fixed bonuses are proven interchangeable; other sets keep their identity. */
function twoPieceKey(setId: string): string {
  if (equipmentCombatCapabilities.some(entry => "artifactSetId" in entry && entry.artifactSetId === setId && entry.minimumPieces <= 2)) return `set:${setId}`
  const effects = listCombatActionEffects().filter(effect =>
    effect.source.kind === "artifact_set" && effect.source.setId === setId && effect.source.minimumPieces === 2)
  const healing = listHealingEquipmentEffects().filter(effect => effect.source.kind === "artifact_set" && effect.source.setId === setId)
  const recipient = listRecipientEquipmentEffects().filter(effect => effect.source.kind === "artifact_set" && effect.source.setId === setId && effect.source.minimumPieces <= 2)
  if (recipient.length) return `set:${setId}`
  if (healing.length) return effects.length === 0 && healing.length === 1 && healing[0]!.value.kind === "fixed"
    ? JSON.stringify(["outgoingHealingBonus", healing[0]!.value]) : `set:${setId}`
  if (effects.length !== 1) return `set:${setId}`
  const effect = effects[0]!
  const allowed = new Set(["id", "label", "activation", "source", "target", "value", "lifecycle", "targetFilter"])
  if (Object.keys(effect).some(key => !allowed.has(key)) || effect.activation !== "automatic" ||
    !("value" in effect) || effect.value.kind !== "fixed" ||
    (effect.lifecycle && effect.lifecycle.kind !== "constant") ||
    Object.keys(effect.source).some(key => !["kind", "minimumPieces", "setId"].includes(key))) return `set:${setId}`
  // Filters retain their exact declaration; a missed merge is safe, a false equivalence is not.
  return JSON.stringify([effect.target, effect.value, effect.targetFilter ?? null])
}

let comparisonSets: readonly ArtifactComparisonSet[] | undefined

/** Content coverage controls eligibility; the caller supplies pinned rarity availability, not combat rules. */
export function listArtifactComparisonSets(): readonly ArtifactComparisonSet[] {
  if (comparisonSets) return comparisonSets
  comparisonSets = Object.freeze(artifactSetInventory.filter(set => set.setBonuses.includes(2)).map(set => {
    const coverage = equipmentCoverageLedger.find(entry => entry.kind === "artifact_set" && entry.equipmentId === set.id)
    const unresolved = coverage?.clauses.filter(clause => clause.status === "unsupported" || clause.status === "unreviewed") ?? []
    return Object.freeze({
      setId: set.id, label: set.label, twoPieceKey: twoPieceKey(set.id),
      twoPieceSupported: coverage !== undefined && unresolved.every(clause =>
        clause.source.kind === "artifact_set" && clause.source.minimumPieces > 2),
      fourPieceSupported: set.setBonuses.includes(4) && coverage !== undefined && unresolved.length === 0,
      excludedReasons: Object.freeze(coverage ? unresolved.map(clause => clause.reason) : ["缺少审计声明"])
    })
  }))
  return comparisonSets
}
