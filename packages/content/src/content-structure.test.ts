import { readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { artifactSetInventory, weaponInventory } from "./equipment-inventory.js"
import { characterCatalogPresentation } from "./registry/character-catalog.generated.js"
import { characterCombatCoverageRegistry } from "./registry/character-combat.generated.js"
import { reviewedEquipmentCoverageRegistry } from "./registry/equipment-coverage.generated.js"
import { reviewedMultiScalingEvidenceRecords } from "./registry/reviewed-multi-scaling-evidence.generated.js"

const sourceRoot = dirname(fileURLToPath(import.meta.url))

function listDirectories(path: string): readonly string[] {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
}

describe("Content entity-directory architecture", () => {
  it("keeps every character definition, combat declaration, and public entity entry together", () => {
    const characterRoot = join(sourceRoot, "characters")
    const slugs = listDirectories(characterRoot)
    expect(slugs).toHaveLength(characterCombatCoverageRegistry.length)
    expect(characterCatalogPresentation).toHaveLength(characterCombatCoverageRegistry.length)
    for (const slug of slugs) {
      const files = readdirSync(join(characterRoot, slug))
      expect(files, slug).toEqual(expect.arrayContaining(["combat.ts", "definition.ts", "index.ts"]))
    }
  })

  it("maps the complete equipment inventory one-to-one onto uniform entity directories", () => {
    const expectations = [
      {
        directory: "weapons",
        ids: weaponInventory.map((weapon) => weapon.id)
      },
      {
        directory: "artifacts",
        ids: artifactSetInventory.map((artifactSet) => artifactSet.id)
      }
    ] as const
    for (const expectation of expectations) {
      const root = join(sourceRoot, expectation.directory)
      const expectedSlugs = expectation.ids.map(toKebabCase).sort((left, right) => left.localeCompare(right))
      expect(listDirectories(root)).toEqual(expectedSlugs)
      for (const slug of expectedSlugs) {
        expect(readdirSync(join(root, slug)), `${expectation.directory}/${slug}`).toEqual(
          expect.arrayContaining(["coverage.ts", "effects.ts", "index.ts"])
        )
      }
    }

    const inventoryIds = [...weaponInventory.map((weapon) => weapon.id), ...artifactSetInventory.map((set) => set.id)]
    expect(reviewedEquipmentCoverageRegistry.map((entry) => entry.equipmentId).sort()).toEqual(inventoryIds.sort())
  })

  it("publishes generated aggregates without returning to entity wildcard exports", () => {
    expect(reviewedMultiScalingEvidenceRecords).toHaveLength(37)
    const rootIndex = readFileSync(join(sourceRoot, "index.ts"), "utf8")
    expect(rootIndex).not.toMatch(/export \* from "\.\/(?:artifacts|weapons)\//)
    expect(rootIndex).not.toMatch(/export \* from "\.\/characters\/[^\"]+\//)
    expect(rootIndex).not.toContain("./artifacts/")
    expect(rootIndex).not.toContain("./weapons/")
  })
})
