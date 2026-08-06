import type { CatalogWeaponType } from "./catalog-presentation.js"
import type { ArtifactSetInventoryEntry, WeaponInventoryEntry } from "./equipment-inventory.js"

export type EquipmentCoverageStatus = "implemented" | "not_applicable" | "unsupported" | "unreviewed"

export type EquipmentCoverageEffectSource =
  | { readonly kind: "weapon"; readonly weaponId: string }
  | {
      readonly holder?: "party_member" | "primary"
      readonly kind: "artifact_set"
      readonly minimumPieces: number
      readonly setId: string
    }

interface EquipmentCoverageClauseBase {
  readonly id: string
  readonly label: string
  readonly source: EquipmentCoverageEffectSource
}

/** One manually reviewed passive clause that is represented by maintained typed action effects. */
export interface ImplementedEquipmentCoverageClause extends EquipmentCoverageClauseBase {
  readonly effectIds: readonly string[]
  readonly status: "implemented"
}

/** One reviewed clause that cannot alter the selected single-core-action metric. */
export interface NotApplicableEquipmentCoverageClause extends EquipmentCoverageClauseBase {
  readonly reason: string
  readonly status: "not_applicable"
}

/** One reviewed clause whose exact behavior needs a capability the current model does not own. */
export interface UnsupportedEquipmentCoverageClause extends EquipmentCoverageClauseBase {
  readonly reason: string
  readonly requiredCapability: string
  readonly status: "unsupported"
}

/** One inventory record whose passive wording and mechanics have not yet undergone maintainer review. */
export interface UnreviewedEquipmentCoverageClause extends EquipmentCoverageClauseBase {
  readonly reason: string
  readonly status: "unreviewed"
}

export type EquipmentCoverageClause =
  | ImplementedEquipmentCoverageClause
  | NotApplicableEquipmentCoverageClause
  | UnsupportedEquipmentCoverageClause
  | UnreviewedEquipmentCoverageClause

/** One passive clause that is complete enough to expose through the current single-core-action catalog. */
export type PublishedEquipmentCoverageClause =
  | ImplementedEquipmentCoverageClause
  | NotApplicableEquipmentCoverageClause

/** One full-inventory equipment record and its independently auditable passive clauses. */
export interface EquipmentCoverageEntry {
  readonly clauses: readonly [EquipmentCoverageClause, ...EquipmentCoverageClause[]]
  readonly equipmentId: string
  readonly kind: "artifact_set" | "weapon"
}

/** One released weapon that is fully reviewed and available for character configuration. */
export interface PublishedWeapon {
  readonly label: string
  readonly rarity: 3 | 4 | 5
  readonly weaponId: string
  readonly weaponType: CatalogWeaponType
}

/** One released artifact set that is fully reviewed for the current single-core-action analyzer. */
export interface PublishedArtifactSet {
  readonly label: string
  readonly setId: string
}

const unreviewedReason = "尚未逐条审计该装备被动；不会作为当前发布目录中的可计算装备。"

function toKebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase()
}

/** Creates the canonical source descriptor for one weapon-owned coverage clause. */
export function weaponSource(
  weaponId: string,
  holder?: "party_member" | "primary"
): EquipmentCoverageEffectSource {
  return { ...(holder === undefined ? {} : { holder }), kind: "weapon", weaponId }
}

/** Creates the canonical source descriptor for one artifact-set coverage clause. */
export function artifactSource(
  setId: string,
  minimumPieces: number,
  holder?: "party_member" | "primary"
): EquipmentCoverageEffectSource {
  return { ...(holder === undefined ? {} : { holder }), kind: "artifact_set", minimumPieces, setId }
}

/** Creates a safe hidden coverage entry for an inventory weapon that has not been audited yet. */
export function createUnreviewedWeaponCoverageEntry(weapon: WeaponInventoryEntry): EquipmentCoverageEntry {
  const slug = toKebabCase(weapon.id)
  return {
    clauses: [
      {
        id: `weapon.${slug}.passive.unreviewed`,
        label: `${weapon.label} · 被动效果（待审计）`,
        reason: unreviewedReason,
        source: weaponSource(weapon.id),
        status: "unreviewed"
      }
    ],
    equipmentId: weapon.id,
    kind: "weapon"
  }
}

/** Creates safe hidden clauses for every unaudited set bonus of one artifact set. */
export function createUnreviewedArtifactSetCoverageEntry(
  artifactSet: ArtifactSetInventoryEntry
): EquipmentCoverageEntry {
  const slug = toKebabCase(artifactSet.id)
  const clauses = artifactSet.setBonuses.map((minimumPieces) => ({
    id: `artifact.${slug}.${minimumPieces}pc.unreviewed`,
    label: `${artifactSet.label} · ${minimumPieces}件套（待审计）`,
    reason: unreviewedReason,
    source: artifactSource(artifactSet.id, minimumPieces),
    status: "unreviewed" as const
  }))
  if (clauses.length === 0) throw new Error(`Artifact set ${artifactSet.id} has no set-bonus clauses to audit`)
  return {
    clauses: clauses as [EquipmentCoverageClause, ...EquipmentCoverageClause[]],
    equipmentId: artifactSet.id,
    kind: "artifact_set"
  }
}

/** Returns whether one clause is complete enough to expose in the current catalog. */
export function isPublishedEquipmentCoverageClause(
  clause: EquipmentCoverageClause
): clause is PublishedEquipmentCoverageClause {
  return clause.status === "implemented" || clause.status === "not_applicable"
}

/** Returns whether every independently audited clause for one equipment item is publishable. */
export function isPublishedEquipmentCoverageEntry(entry: EquipmentCoverageEntry): boolean {
  return entry.clauses.every(isPublishedEquipmentCoverageClause)
}
