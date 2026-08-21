import { describe, expect, it } from "vitest"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"

import { artifactSetInventory, pinnedEquipmentInventorySource, weaponInventory } from "./equipment-inventory.js"

function sortedIds(entries: readonly { readonly id: string }[]): string[] {
  return entries.map((entry) => entry.id).sort()
}

describe("pinned equipment inventory", () => {
  it("matches every 7.0 weapon and artifact set in the bundled game-data snapshot", () => {
    using repository = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
    const snapshotWeapons = repository.listWeapons()
    const snapshotArtifactSets = repository.listArtifactSets()
    const excludedWeaponIds = new Set(pinnedEquipmentInventorySource.excludedNonGenshinWeaponIds)
    const playerFacingSnapshotWeapons = snapshotWeapons.filter((weapon) => !excludedWeaponIds.has(weapon.id))

    expect(snapshotWeapons).toHaveLength(247)
    expect(snapshotArtifactSets).toHaveLength(63)
    expect(pinnedEquipmentInventorySource.excludedNonGenshinWeaponIds).toEqual(["QuantumCatalyst"])
    expect(sortedIds(weaponInventory)).toEqual(sortedIds(playerFacingSnapshotWeapons))
    expect(sortedIds(artifactSetInventory)).toEqual(sortedIds(snapshotArtifactSets))
  })

  it("keeps a non-empty Simplified Chinese display name for every player-facing inventory record", () => {
    for (const equipment of weaponInventory) {
      expect(equipment.label.trim()).not.toHaveLength(0)
      expect(equipment.label).toMatch(/[\u3400-\u9fff]/u)
      expect(equipment.label).not.toBe(equipment.id)
    }
    for (const equipment of artifactSetInventory) {
      expect(equipment.label.trim()).not.toHaveLength(0)
      expect(equipment.label).toMatch(/[\u3400-\u9fff]/u)
      expect(equipment.label).not.toBe(equipment.id)
    }
  })
})
