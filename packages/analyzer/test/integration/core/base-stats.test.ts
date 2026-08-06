import {
  bennettNationalBuiltinBuild,
  HEALING_BONUS_TWO_PIECE_SET_IDS,
  raidenNationalBuiltinBuild
} from "@gscombat/content"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { resolveBaseCombatStats, resolveCoreCombatStats } from "../../../src/core/base-stats.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

describe("base combat stat resolution", () => {
  it("resolves universal character, weapon, and artifact stats without applying Raiden-specific effects", () => {
    const electro = resolveBaseCombatStats(raidenNationalBuiltinBuild, gameData, "electro")
    const hydro = resolveBaseCombatStats(raidenNationalBuiltinBuild, gameData, "hydro")

    expect(electro.attack).toBeGreaterThan(electro.baseAttack)
    expect(electro.critRate).toBeCloseTo(0.625)
    expect(electro.critDamage).toBeCloseTo(1.238)
    expect(electro.energyRecharge).toBeGreaterThan(2)
    expect(electro.damageBonus).toBeCloseTo(0.466)
    expect(hydro.damageBonus).toBe(0)
  })

  it("includes immutable base elemental mastery for characters that declare it in the snapshot", () => {
    const lauma = resolveBaseCombatStats(
      {
        ...raidenNationalBuiltinBuild,
        buildId: "test.lauma.base-mastery",
        characterId: "Lauma",
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
      },
      gameData,
      "dendro"
    )

    expect(lauma.elementalMastery).toBeCloseTo(315.2)
  })

  it("includes a configured two-piece healing set in a source character's outgoing healing bonus", () => {
    const maidenBennett = {
      ...bennettNationalBuiltinBuild,
      artifacts: bennettNationalBuiltinBuild.artifacts.map((artifact, index) =>
        index < 2 ? { ...artifact, setId: "MaidenBeloved" } : artifact
      ),
      buildId: "test.bennett.maiden-beloved"
    }
    const stats = resolveCoreCombatStats(maidenBennett, gameData)

    expect(stats.artifactSetHealingBonus).toBeCloseTo(0.15)
    expect(stats.healingBonus).toBeCloseTo(0.15)
  })

  it("keeps every explicitly modeled healing set bound to an ID in the pinned snapshot", () => {
    expect(HEALING_BONUS_TWO_PIECE_SET_IDS.every((setId) => gameData.getArtifactSet(setId) !== undefined)).toBe(true)
  })
})
