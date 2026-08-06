import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateScenario } from "../../../src/scenario/evaluate.js"
import { normalizeScenarioEffectSelections } from "../../../src/effects/effect-selection.js"
import { resolveTeamState } from "../../../src/scenario/team-state.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

function evaluateMaximumReachableScenario(
  primary: CharacterBuild,
  targetActionId: string
): ReturnType<typeof evaluateScenario> {
  const scenario: EvaluationScenario = {
    ...raidenNationalBuiltinScenario,
    conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
    externalBuffs: [],
    primary,
    targetActionId,
    teammates: []
  }
  return evaluateScenario(scenario, gameData)
}

function normalizeMaximumReachableScenario(scenario: EvaluationScenario): EvaluationScenario {
  return normalizeScenarioEffectSelections(
    scenario,
    gameData,
    resolveTeamState(scenario.primary, scenario.teammates, gameData)
  )
}

describe("maximum-reachable effect selection", () => {
  it("selects both seven-stack Eagle Spear effects for Primordial Jade Winged-Spear", () => {
    const primary: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.raiden.primordial-jade-winged-spear",
      label: "雷电将军 · 和璞鸢最大层数测试",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "PrimordialJadeWingedSpear" }
    }

    const evaluation = evaluateMaximumReachableScenario(primary, "raiden.burst.initial_slash")

    expect(evaluation.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "weapon.primordial-jade-winged-spear.eagle-spear.7-stack.attack-percent",
        target: "attackPercent",
        value: 0.224
      }),
      expect.objectContaining({
        id: "weapon.primordial-jade-winged-spear.eagle-spear.7-stack.damage-bonus",
        target: "damageBonus",
        value: 0.12
      })
    ]))
    expect(evaluation.appliedEffects).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "weapon.primordial-jade-winged-spear.eagle-spear.6-stack.attack-percent" })
    ]))
  })

  it("selects every stat contribution owned by Whiteblind's chosen four-stack variant", () => {
    const primary: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.noelle.whiteblind",
      characterId: "Noelle",
      constellation: 0,
      label: "诺艾尔 · 白影剑最大层数测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "Whiteblind" }
    }

    const evaluation = evaluateMaximumReachableScenario(primary, "noelle.normal.auto.first_hit")

    expect(evaluation.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "weapon.whiteblind.infusion-blade.4-stack.attack-percent",
        target: "attackPercent",
        value: 0.24
      }),
      expect.objectContaining({
        id: "weapon.whiteblind.infusion-blade.4-stack.defense-percent",
        target: "defensePercent",
        value: 0.24
      })
    ]))
    expect(evaluation.appliedEffects).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "weapon.whiteblind.infusion-blade.3-stack.attack-percent" }),
      expect.objectContaining({ id: "weapon.whiteblind.infusion-blade.3-stack.defense-percent" })
    ]))
  })

  it("does not add maximum-reachable character effects before their ascension or constellation requirement", () => {
    const xiangling: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.xiangling.kazuha-a0",
      characterId: "Xiangling",
      constellation: 0,
      label: "香菱 · 万叶 A0 过滤测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusLance" }
    }
    const kazuha: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      ascension: 0,
      buildId: "test.kazuha.a0",
      characterId: "KaedeharaKazuha",
      constellation: 0,
      label: "枫原万叶 · A0 过滤测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const fischl: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.fischl.c0",
      characterId: "Fischl",
      constellation: 0,
      label: "菲谢尔 · C0 过滤测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const venti: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.venti.hexerei",
      characterId: "Venti",
      constellation: 0,
      label: "温迪 · 魔女的前夜礼过滤测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const kazuhaScenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
      externalBuffs: [],
      primary: xiangling,
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
      teammates: [kazuha]
    }
    const fischlScenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
      externalBuffs: [],
      primary: fischl,
      targetActionId: "fischl.skill.nightrider.oz.level_one_bolt",
      teammates: [venti]
    }

    const normalizedKazuhaScenario = normalizeMaximumReachableScenario(kazuhaScenario)
    const normalizedFischlScenario = normalizeMaximumReachableScenario(fischlScenario)

    expect(normalizedKazuhaScenario.conditions.activeEffectIds).not.toContain(
      "kaedehara_kazuha.passive.poetics_of_fuubutsu.elemental_damage_bonus"
    )
    expect(normalizedFischlScenario.conditions.activeEffectIds).not.toContain(
      "fischl.locked_passive.nocturnal_world_fantasia.c6.after_overload.extra_attack_percent"
    )
    expect(normalizedFischlScenario.conditions.activeEffectIds).not.toContain(
      "fischl.locked_passive.nocturnal_world_fantasia.c6.after_electro_charged.extra_elemental_mastery"
    )
  })
})
