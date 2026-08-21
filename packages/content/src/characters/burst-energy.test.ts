import { fileURLToPath } from "node:url"
import { DatabaseSync } from "node:sqlite"

import { describe, expect, it } from "vitest"

import type { CharacterBuild, TravelerElement } from "@gscombat/contracts"

import { characterCatalogPresentation } from "../catalog-presentation.js"
import { getCharacterBurstEnergyCost, listCharacterBurstEnergyCostCoverage } from "./burst-energy.js"

const standardBurstEnergyCosts = new Set([40, 50, 60, 70, 80, 90])
const nonElementalEnergyCharacterIds = new Set(["Mavuika", "Skirk", "Traveler"])
const gameDataPath = fileURLToPath(new URL("../../../game-data/snapshots/7.0/game-data.sqlite", import.meta.url))
const travelerOwnerElementSegments: Readonly<Record<TravelerElement, string>> = {
  anemo: "Anemo",
  cryo: "Cryo",
  dendro: "Dendro",
  electro: "Electro",
  geo: "Geo",
  hydro: "Hydro",
  pyro: "Pyro"
}
const travelerBurstEnergyCosts: Readonly<Record<TravelerElement, number>> = {
  anemo: 60,
  cryo: 60,
  dendro: 80,
  electro: 80,
  geo: 60,
  hydro: 80,
  pyro: 70
}

interface BurstParameterRow {
  readonly values_json: string
}

function getSnapshotBurstEnergyCost(characterId: string): number {
  const database = new DatabaseSync(gameDataPath, { readOnly: true })
  try {
    const row = database
      .prepare("SELECT values_json FROM character_skill_parameter_groups WHERE character_id = ? AND group_id = ?")
      .get(characterId, "burst") as BurstParameterRow | undefined
    if (!row) throw new Error(`Pinned snapshot does not contain a Burst parameter group for ${characterId}`)

    const parameters = JSON.parse(row.values_json) as unknown[]
    const candidates = parameters.filter(
      (parameter): parameter is number[] =>
        Array.isArray(parameter) &&
        parameter.length > 0 &&
        parameter.every((value) => value === parameter[0]) &&
        standardBurstEnergyCosts.has(parameter[0] ?? Number.NaN)
    )
    if (candidates.length !== 1) {
      throw new Error(`Pinned snapshot has ${candidates.length} standard Energy candidates for ${characterId}`)
    }
    return candidates[0]?.[0] ?? Number.NaN
  } finally {
    database.close()
  }
}

describe("character Burst energy costs", () => {
  it("resolves Furina's Burst energy cost outside the Raiden National seed roster", () => {
    expect(getCharacterBurstEnergyCost("Furina")).toBe(60)
  })

  it("matches the unique standard Burst Energy scalar in the pinned snapshot for every regular catalog character", () => {
    const regularCharacterIds = characterCatalogPresentation
      .map((character) => character.characterId)
      .filter((characterId) => !nonElementalEnergyCharacterIds.has(characterId))

    for (const characterId of regularCharacterIds) {
      expect(getCharacterBurstEnergyCost(characterId)).toBe(getSnapshotBurstEnergyCost(characterId))
    }
  })

  it("uses Traveler's selected element variant to resolve the matching snapshot owner", () => {
    for (const [element, ownerSegment] of Object.entries(travelerOwnerElementSegments) as [TravelerElement, string][]) {
      for (const [gender, ownerGender] of [
        ["female", "F"],
        ["male", "M"]
      ] as const) {
        const traveler: Pick<CharacterBuild, "characterId" | "variant"> = {
          characterId: "Traveler",
          variant: { element, gender, kind: "traveler" }
        }

        expect(getCharacterBurstEnergyCost(traveler)).toBe(
          getSnapshotBurstEnergyCost(`Traveler${ownerSegment}${ownerGender}`)
        )
      }
    }
  })

  it("treats non-Energy Burst resources as zero party Energy capacity", () => {
    expect(getCharacterBurstEnergyCost("Mavuika")).toBe(0)
    expect(getCharacterBurstEnergyCost("Skirk")).toBe(0)
    expect(() => getCharacterBurstEnergyCost("Traveler")).toThrow("requires an element variant")
  })

  it("declares an explicit Energy-capacity status for every configurable character", () => {
    const coverage = listCharacterBurstEnergyCostCoverage()
    const coverageByCharacterId = new Map(coverage.map((entry) => [entry.characterId, entry]))

    expect(new Set(coverageByCharacterId.keys())).toEqual(
      new Set(characterCatalogPresentation.map((character) => character.characterId))
    )
    expect(coverageByCharacterId.get("Mavuika")).toMatchObject({
      energyCost: 0,
      status: "no_elemental_energy"
    })
    expect(coverageByCharacterId.get("Skirk")).toMatchObject({
      energyCost: 0,
      status: "no_elemental_energy"
    })
    expect(coverageByCharacterId.get("Traveler")).toMatchObject({
      status: "variant_required",
      variants: travelerBurstEnergyCosts
    })
  })
})
