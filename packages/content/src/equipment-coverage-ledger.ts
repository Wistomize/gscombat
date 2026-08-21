import {
  createUnreviewedArtifactSetCoverageEntry,
  createUnreviewedWeaponCoverageEntry,
  isPublishedEquipmentCoverageClause,
  isPublishedEquipmentCoverageEntry,
  type EquipmentCoverageEntry,
  type PublishedArtifactSet,
  type PublishedEquipmentCoverageClause,
  type PublishedWeapon
} from "./equipment-coverage.js"
import { artifactSetInventory, weaponInventory } from "./equipment-inventory.js"
import { reviewedEquipmentCoverageRegistry } from "./registry/equipment-coverage.generated.js"

export type {
  EquipmentCoverageClause,
  EquipmentCoverageEffectSource,
  EquipmentCoverageEntry,
  EquipmentCoverageStatus,
  ImplementedEquipmentCoverageClause,
  NotApplicableEquipmentCoverageClause,
  PublishedArtifactSet,
  PublishedEquipmentCoverageClause,
  PublishedWeapon,
  UnreviewedEquipmentCoverageClause,
  UnsupportedEquipmentCoverageClause
} from "./equipment-coverage.js"

function indexReviewedCoverage(): ReadonlyMap<string, EquipmentCoverageEntry> {
  const weaponIds = new Set(weaponInventory.map((weapon) => weapon.id))
  const artifactSetIds = new Set(artifactSetInventory.map((artifactSet) => artifactSet.id))
  const coverageByEquipmentId = new Map<string, EquipmentCoverageEntry>()
  for (const entry of reviewedEquipmentCoverageRegistry) {
    if (coverageByEquipmentId.has(entry.equipmentId)) {
      throw new Error(`Duplicate reviewed equipment coverage: ${entry.equipmentId}`)
    }
    const belongsToInventory =
      entry.kind === "weapon" ? weaponIds.has(entry.equipmentId) : artifactSetIds.has(entry.equipmentId)
    if (!belongsToInventory) {
      throw new Error(`Reviewed ${entry.kind} coverage references unknown inventory ID: ${entry.equipmentId}`)
    }
    coverageByEquipmentId.set(entry.equipmentId, entry)
  }
  return coverageByEquipmentId
}

const reviewedCoverageByEquipmentId = indexReviewedCoverage()

function resolveCoverageEntry(entry: EquipmentCoverageEntry): EquipmentCoverageEntry {
  return reviewedCoverageByEquipmentId.get(entry.equipmentId) ?? entry
}

/** Full pinned equipment inventory with explicit implemented, not-applicable, unsupported, or unreviewed coverage. */
export const equipmentCoverageLedger: readonly EquipmentCoverageEntry[] = [
  ...weaponInventory.map(createUnreviewedWeaponCoverageEntry).map(resolveCoverageEntry),
  ...artifactSetInventory.map(createUnreviewedArtifactSetCoverageEntry).map(resolveCoverageEntry)
]

/** Lists only current-catalog passive clauses that have no unresolved modeling gaps. */
export function listPublishedEquipmentCoverageClauses(): readonly PublishedEquipmentCoverageClause[] {
  return equipmentCoverageLedger
    .filter(isPublishedEquipmentCoverageEntry)
    .flatMap((entry) => entry.clauses.filter(isPublishedEquipmentCoverageClause))
}

/** Lists every fully reviewed weapon record that can be equipped in a character configuration. */
export function listPublishedWeapons(): readonly PublishedWeapon[] {
  const inventoryById = new Map(weaponInventory.map((weapon) => [weapon.id, weapon]))
  return equipmentCoverageLedger.flatMap((entry) => {
    if (entry.kind !== "weapon" || !isPublishedEquipmentCoverageEntry(entry)) return []
    const weapon = inventoryById.get(entry.equipmentId)
    if (!weapon || (weapon.rarity !== 3 && weapon.rarity !== 4 && weapon.rarity !== 5)) return []
    return [
      {
        label: weapon.label,
        rarity: weapon.rarity,
        weaponId: weapon.id,
        weaponType: weapon.weaponType
      }
    ]
  })
}

/** Lists fully reviewed artifact sets that may be exposed by the current analysis catalog. */
export function listPublishedArtifactSets(): readonly PublishedArtifactSet[] {
  const inventoryById = new Map(artifactSetInventory.map((artifactSet) => [artifactSet.id, artifactSet]))
  return equipmentCoverageLedger.flatMap((entry) => {
    if (entry.kind !== "artifact_set" || !isPublishedEquipmentCoverageEntry(entry)) return []
    const artifactSet = inventoryById.get(entry.equipmentId)
    return artifactSet ? [{ label: artifactSet.label, setId: artifactSet.id }] : []
  })
}
