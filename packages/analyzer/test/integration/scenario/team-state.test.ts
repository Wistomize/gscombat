import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateScenario } from "../../../src/scenario/evaluate.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

function createBuild(characterId: string, index: number): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `team-state.${characterId.toLowerCase()}.${index}`,
    characterId,
    label: `${characterId} team-state test build`
  }
}

function createRaidenScenario(teammateCharacterIds: readonly [string, string, string]): EvaluationScenario {
  return {
    ...raidenNationalBuiltinScenario,
    conditions: {
      ...raidenNationalBuiltinScenario.conditions,
      activeEffectIds: [],
      equipmentEffectMode: "maximum_reachable"
    },
    externalBuffs: [],
    primary: createBuild("RaidenShogun", 0),
    teammates: teammateCharacterIds.map(createBuild)
  }
}

function getTeamState(scenario: EvaluationScenario) {
  return evaluateScenario(scenario, gameData).teamState
}

describe("derived team state", () => {
  it("recognizes every elemental resonance from a complete four-character party", () => {
    const cases = [
      ["resonance.pyro", ["Bennett", "Xiangling", "Furina"]],
      ["resonance.hydro", ["Furina", "Xingqiu", "Bennett"]],
      ["resonance.anemo", ["Venti", "Sucrose", "Bennett"]],
      ["resonance.electro", ["Fischl", "Bennett", "Furina"]],
      ["resonance.dendro", ["Nahida", "Collei", "Bennett"]],
      ["resonance.cryo", ["Kaeya", "Ganyu", "Bennett"]],
      ["resonance.geo", ["Zhongli", "Xilonen", "Bennett"]],
      ["resonance.protective", ["Furina", "Nahida", "Xilonen"]]
    ] as const

    for (const [expectedResonanceId, teammateCharacterIds] of cases) {
      expect(getTeamState(createRaidenScenario(teammateCharacterIds)).activeResonanceIds).toContain(
        expectedResonanceId
      )
    }
  })

  it("applies the damage-relevant Pyro, Hydro, and Dendro resonance stat rules", () => {
    const pyro = evaluateScenario(createRaidenScenario(["Bennett", "Xiangling", "Furina"]), gameData)
    const hydro = evaluateScenario(createRaidenScenario(["Furina", "Xingqiu", "Bennett"]), gameData)
    const dendro = evaluateScenario(createRaidenScenario(["Nahida", "Collei", "Bennett"]), gameData)

    expect(pyro.appliedBuffs).toContainEqual(
      expect.objectContaining({ sourceId: "resonance.pyro", stat: "attack_percent", value: 0.25 })
    )
    expect(hydro.appliedBuffs).toContainEqual(
      expect.objectContaining({ sourceId: "resonance.hydro", stat: "hp_percent", value: 0.25 })
    )
    expect(dendro.appliedBuffs).toContainEqual(
      expect.objectContaining({ sourceId: "resonance.dendro", stat: "elemental_mastery", value: 50 })
    )
  })

  it("stacks both maintained Dendro resonance reaction tiers for an Aggravate or Spread action", () => {
    const scenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], equipmentEffectMode: "maximum_reachable", enemyCount: 1 },
      externalBuffs: [],
      primary: createBuild("Collei", 0),
      targetActionId: "collei.skill.floral_sidewinder.outbound.spread",
      teammates: [createBuild("Nahida", 1), createBuild("Bennett", 2), createBuild("Furina", 3)]
    }
    const evaluation = evaluateScenario(scenario, gameData)

    expect(
      evaluation.appliedBuffs
        .filter((buff) => buff.sourceId === "resonance.dendro")
        .reduce((total, buff) => total + buff.value, 0)
    ).toBe(100)
  })

  it("derives initial and full Moonsign and applies the full-state bonus only to Moon reactions", () => {
    const primary: CharacterBuild = {
      ...createBuild("Zibai", 0),
      constellation: 0,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "LightbearingMoonshard" }
    }
    const createLunarScenario = (teammateCharacterIds: readonly [string, string, string]): EvaluationScenario => ({
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], equipmentEffectMode: "maximum_reachable", enemyCount: 1 },
      externalBuffs: [],
      primary,
      targetActionId: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
      teammates: teammateCharacterIds.map(createBuild)
    })
    const initial = evaluateScenario(createLunarScenario(["Furina", "Bennett", "Nahida"]), gameData)
    const full = evaluateScenario(createLunarScenario(["Aino", "Furina", "Bennett"]), gameData)
    const initialBonus = initial.result.trace.find((entry) => entry.stage === "reaction_damage_bonus")
    const fullBonus = full.result.trace.find((entry) => entry.stage === "reaction_damage_bonus")

    expect(initial.teamState.moonsign.level).toBe("nascent_gleam")
    expect(full.teamState.moonsign.level).toBe("ascendant_gleam")
    const initialBonusValue = (initialBonus?.formula as { readonly bonus?: number } | undefined)?.bonus ?? 0
    const fullBonusValue = (fullBonus?.formula as { readonly bonus?: number } | undefined)?.bonus ?? 0
    expect(initialBonusValue).toBeCloseTo(0.64)
    expect(fullBonusValue).toBeGreaterThan(initialBonusValue)
    expect(full.actionExpectedDamage).toBeGreaterThan(initial.actionExpectedDamage)
  })

  it("selects initial and full Moonsign equipment variants from the derived party state", () => {
    const primary: CharacterBuild = {
      ...createBuild("Zibai", 0),
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SerenitysCall" }
    }
    const createLunarScenario = (teammateCharacterIds: readonly [string, string, string]): EvaluationScenario => ({
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], equipmentEffectMode: "maximum_reachable", enemyCount: 1 },
      externalBuffs: [],
      primary,
      targetActionId: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
      teammates: teammateCharacterIds.map(createBuild)
    })
    const initial = evaluateScenario(createLunarScenario(["Furina", "Bennett", "Nahida"]), gameData)
    const full = evaluateScenario(createLunarScenario(["Aino", "Furina", "Bennett"]), gameData)

    expect(initial.appliedEffects).toContainEqual(
      expect.objectContaining({ id: "weapon.serenitys-call.after-reaction.hp-percent", value: 0.16 })
    )
    expect(initial.appliedEffects.map((effect) => effect.id)).not.toContain(
      "weapon.serenitys-call.after-reaction.full-moon.hp-percent"
    )
    expect(full.appliedEffects).toContainEqual(
      expect.objectContaining({ id: "weapon.serenitys-call.after-reaction.full-moon.hp-percent", value: 0.32 })
    )
  })

  it("applies Cryo resonance only against a Cryo-affected or frozen target", () => {
    const scenario = createRaidenScenario(["Kaeya", "Ganyu", "Bennett"])
    const baseline = evaluateScenario(scenario, gameData)
    const cryoAffected = evaluateScenario(
      {
        ...scenario,
        conditions: {
          ...scenario.conditions,
          targetAuraWindows: [{ element: "cryo", end: 1, id: "target.cryo", start: 0 }]
        }
      },
      gameData
    )

    expect(baseline.appliedBuffs.map((buff) => buff.sourceId)).not.toContain("resonance.cryo")
    expect(cryoAffected.appliedBuffs).toContainEqual(
      expect.objectContaining({ sourceId: "resonance.cryo", stat: "crit_rate", value: 0.15 })
    )
    expect(cryoAffected.stats.critRate - baseline.stats.critRate).toBeCloseTo(0.15)
  })

  it("applies Geo resonance damage and resistance rules while a Lunar-Crystallize Mooncage is nearby", () => {
    const primary: CharacterBuild = {
      ...createBuild("Zibai", 0),
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "LightbearingMoonshard" }
    }
    const scenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], equipmentEffectMode: "maximum_reachable", enemyCount: 1 },
      externalBuffs: [],
      primary,
      targetActionId: "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize",
      teammates: [createBuild("Xilonen", 1), createBuild("Aino", 2), createBuild("Bennett", 3)]
    }
    const evaluation = evaluateScenario(scenario, gameData)
    const resistance = evaluation.result.trace.find((entry) => entry.stage === "resistance")

    expect(evaluation.appliedBuffs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sourceId: "resonance.geo", stat: "damage_bonus", value: 0.15 }),
        expect.objectContaining({ sourceId: "resonance.geo", stat: "enemy_resistance_reduction", value: 0.2 })
      ])
    )
    expect(
      (resistance?.formula as { readonly resistanceReduction?: number } | undefined)?.resistanceReduction
    ).toBeCloseTo(0.53)
  })
})
