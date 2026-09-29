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

/** 7.1 additions retain their own source rather than relabelling the inherited 7.0 inventory. */
export const weaponInventory: readonly WeaponInventoryEntry[] = [
  ...weaponInventoryGenerated,
  { id: "NewBough", label: "新枝", rarity: 4, weaponType: "sword" },
  { id: "Silverlight", label: "银釭", rarity: 4, weaponType: "sword" },
  { id: "BeyondTheChrysalis", label: "蝶变", rarity: 5, weaponType: "sword" },
  { id: "WintersHeavyHeart", label: "凝雪沉心", rarity: 4, weaponType: "catalyst" },
  { id: "HymnOfTheMaelstrom", label: "漩流颂歌", rarity: 5, weaponType: "catalyst" },
  { id: "BreezeborneRefrain", label: "柔风游弦", rarity: 4, weaponType: "bow" }
]
export const artifactSetInventory: readonly ArtifactSetInventoryEntry[] = artifactSetInventoryGenerated
export const pinnedEquipmentInventorySource: EquipmentInventorySource = equipmentInventorySource
