import {
  artifactSetInventoryGenerated,
  equipmentInventorySource,
  weaponInventoryGenerated
} from "./equipment-inventory.generated.js"

import type { CatalogWeaponType } from "./catalog-presentation.js"

/** One browser-safe weapon descriptor generated from the pinned local game-data and Simplified Chinese source assets. */
export interface WeaponInventoryEntry {
  readonly id: string
  readonly label: string
  readonly rarity: number
  readonly weaponType: CatalogWeaponType
}

/** One browser-safe artifact-set descriptor generated from the pinned local game-data and Simplified Chinese source assets. */
export interface ArtifactSetInventoryEntry {
  readonly id: string
  readonly label: string
  readonly setBonuses: readonly number[]
}

/** Provenance for the static full-equipment inventory; generation never runs in the browser or deployed service. */
export interface EquipmentInventorySource {
  readonly artifactNameAggregatePath: string
  readonly artifactNameAggregateSha256: string
  readonly excludedNonGenshinWeaponIds: readonly string[]
  readonly gameVersion: string
  readonly upstreamCommit: string
  readonly upstreamRepository: string
  readonly weaponNameAggregatePath: string
  readonly weaponNameAggregateSha256: string
}

export const weaponInventory: readonly WeaponInventoryEntry[] = weaponInventoryGenerated
export const artifactSetInventory: readonly ArtifactSetInventoryEntry[] = artifactSetInventoryGenerated
export const pinnedEquipmentInventorySource: EquipmentInventorySource = equipmentInventorySource
