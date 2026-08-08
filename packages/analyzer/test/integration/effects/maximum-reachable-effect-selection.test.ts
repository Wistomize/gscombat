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
  targetActionId: string,
  teammates: readonly CharacterBuild[] = []
): ReturnType<typeof evaluateScenario> {
  const scenario: EvaluationScenario = {
    ...raidenNationalBuiltinScenario,
    conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
    externalBuffs: [],
    primary,
    targetActionId,
    teammates: [...teammates]
  }
  return evaluateScenario(scenario, gameData)
}

function createBuild(characterId: string, weaponId: string, buildId: string): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId,
    characterId,
    constellation: 0,
    label: buildId,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

function normalizeMaximumReachableScenario(scenario: EvaluationScenario): EvaluationScenario {
  return normalizeScenarioEffectSelections(
    scenario,
    gameData,
    resolveTeamState(scenario.primary, scenario.teammates, gameData)
  )
}

describe("maximum-reachable effect selection", () => {
  it("does not auto-select a required Slingshot flight-time state", () => {
    const primary: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.tighnari.slingshot-required-choice",
      characterId: "Tighnari",
      constellation: 0,
      label: "提纳里 · 弹弓命中时机必选测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "Slingshot" }
    }
    const scenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
      externalBuffs: [],
      primary,
      targetActionId: "tighnari.normal.wreath_arrow.single_hit.spread",
      teammates: []
    }

    const normalized = normalizeMaximumReachableScenario(scenario)

    expect(normalized.conditions.activeEffectIds.some((effectId) =>
      effectId.startsWith("weapon.slingshot.flight-time.")
    )).toBe(false)
  })

  it("does not assume maximum Melusine progress for Ultimate Overlord's Mega Magic Sword", () => {
    const primary: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.noelle.ultimate-overlord-optional-choice",
      characterId: "Noelle",
      constellation: 0,
      label: "诺艾尔 · 究极霸王超级魔剑美露莘进度测试",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "UltimateOverlordsMegaMagicSword" }
    }
    const scenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
      externalBuffs: [],
      primary,
      targetActionId: "noelle.burst.sweeping_time.normal_attack_combo",
      teammates: []
    }

    const normalized = normalizeMaximumReachableScenario(scenario)

    expect(normalized.conditions.activeEffectIds.some((effectId) =>
      effectId.startsWith("weapon.ultimate-overlords-mega-magic-sword.melusine.")
    )).toBe(false)
  })

  it("does not assume user-selected shield, HP, aura, defeat, timing, or reaction states", () => {
    const cases = [
      {
        actionId: "keqing.skill.stellar_restoration.stiletto_damage",
        build: createBuild("Keqing", "SummitShaper", "test.optional-state.shield"),
        effectPrefix: "weapon.summit-shaper.golden-majesty."
      },
      {
        actionId: "xiangling.skill.guoba.single_flame_breath",
        build: createBuild("Xiangling", "StaffOfHoma", "test.optional-state.hp"),
        effectPrefix: "weapon.staff-of-homa.hp-below-50."
      },
      {
        actionId: "keqing.skill.stellar_restoration.stiletto_damage",
        build: createBuild("Keqing", "LionsRoar", "test.optional-state.aura"),
        effectPrefix: "weapon.lions-roar."
      },
      {
        actionId: "keqing.skill.stellar_restoration.stiletto_damage",
        build: createBuild("Keqing", "BlackcliffLongsword", "test.optional-state.defeat"),
        effectPrefix: "weapon.blackcliff-longsword.defeated-enemy."
      },
      {
        actionId: "wriothesley.normal.auto.first_hit",
        build: createBuild("Wriothesley", "CashflowSupervision", "test.optional-state.hp-change"),
        effectPrefix: "weapon.cashflow-supervision.hp-change."
      },
      {
        actionId: "lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize",
        build: createBuild("Lyney", "AmosBow", "test.optional-state.flight-time"),
        effectPrefix: "weapon.amos-bow.projectile-flight-time."
      },
      {
        actionId: "mona.normal.auto.first_hit",
        build: createBuild("Mona", "MappaMare", "test.optional-state.reaction-history"),
        effectPrefix: "weapon.mappa-mare.infusion-scroll."
      }
    ] as const

    for (const testCase of cases) {
      const normalized = normalizeMaximumReachableScenario({
        ...raidenNationalBuiltinScenario,
        conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
        externalBuffs: [],
        primary: testCase.build,
        targetActionId: testCase.actionId,
        teammates: []
      })
      expect(normalized.conditions.activeEffectIds.some((effectId) =>
        effectId.startsWith(testCase.effectPrefix)
      )).toBe(false)
    }
  })

  it("derives weapon passives from Burst cost, party elements, and character regions", () => {
    const bennett = createBuild("Bennett", "MoonweaversDawn", "test.bennett.moonweaver")
    const keqing = createBuild("Keqing", "MoonweaversDawn", "test.keqing.moonweaver")
    const lyney = createBuild("Lyney", "TheFirstGreatMagic", "test.lyney.first-great-magic")
    const mona = createBuild("Mona", "WaveridingWhirl", "test.mona.waveriding-whirl")
    const xiangling = createBuild("Xiangling", "LithicSpear", "test.xiangling.lithic-spear")
    const noelle = createBuild("Noelle", "LithicBlade", "test.noelle.lithic-blade")
    const chasca = createBuild("Chasca", "ChainBreaker", "test.chasca.chain-breaker")
    const bennettResult = evaluateMaximumReachableScenario(bennett, "bennett.burst.initial_hit")
    const keqingResult = evaluateMaximumReachableScenario(keqing, "keqing.burst.starward_sword.initial_hit")
    const lyneyResult = evaluateMaximumReachableScenario(lyney, "lyney.normal.auto.first_hit", [
      createBuild("Xiangling", "FavoniusLance", "test.first-great-magic.xiangling"),
      createBuild("Bennett", "FavoniusSword", "test.first-great-magic.bennett"),
      createBuild("Klee", "FavoniusCodex", "test.first-great-magic.klee")
    ])
    const monaResult = evaluateMaximumReachableScenario(mona, "mona.normal.auto.first_hit", [
      createBuild("Yelan", "FavoniusWarbow", "test.waveriding.yelan"),
      createBuild("Furina", "FavoniusSword", "test.waveriding.furina")
    ])
    const xianglingResult = evaluateMaximumReachableScenario(xiangling, "xiangling.normal.auto.first_hit", [
      createBuild("Zhongli", "FavoniusLance", "test.lithic.zhongli"),
      createBuild("Yelan", "FavoniusWarbow", "test.lithic.yelan"),
      createBuild("Bennett", "FavoniusSword", "test.lithic.bennett")
    ])
    const noelleResult = evaluateMaximumReachableScenario(noelle, "noelle.normal.auto.first_hit", [
      createBuild("Zhongli", "FavoniusLance", "test.lithic-blade.zhongli"),
      createBuild("Yelan", "FavoniusWarbow", "test.lithic-blade.yelan"),
      createBuild("Xiangling", "FavoniusLance", "test.lithic-blade.xiangling")
    ])
    const chascaResult = evaluateMaximumReachableScenario(
      chasca,
      "chasca.skill.spirit_reins_shadow_hunt.resonance.initial_hit",
      [
        createBuild("Tighnari", "FavoniusWarbow", "test.chain-breaker.tighnari"),
        createBuild("Lyney", "FavoniusWarbow", "test.chain-breaker.lyney"),
        createBuild("Wanderer", "FavoniusCodex", "test.chain-breaker.wanderer")
      ]
    )

    expect(bennettResult.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "weapon.moonweavers-dawn.at-most-sixty-energy.extra-burst-damage-bonus",
        value: 0.16
      })
    ]))
    expect(keqingResult.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "weapon.moonweavers-dawn.at-most-forty-energy.extra-burst-damage-bonus",
        value: 0.28
      })
    ]))
    expect(lyneyResult.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "weapon.the-first-great-magic.same-element-party.3-character.attack-percent",
        value: 0.48
      })
    ]))
    expect(monaResult.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "weapon.waveriding-whirl.hydro-character-count.2.hp-percent", value: 0.44 })
    ]))
    expect(xianglingResult.appliedEffects.find((effect) =>
      effect.id === "weapon.lithic-spear.liyue-party.3-character.attack-percent"
    )?.value).toBeCloseTo(0.21)
    expect(xianglingResult.appliedEffects.find((effect) =>
      effect.id === "weapon.lithic-spear.liyue-party.3-character.crit-rate"
    )?.value).toBeCloseTo(0.09)
    expect(noelleResult.appliedEffects.find((effect) =>
      effect.id === "weapon.lithic-blade.liyue-party.3-character.attack-percent"
    )?.value).toBeCloseTo(0.21)
    expect(noelleResult.appliedEffects.find((effect) =>
      effect.id === "weapon.lithic-blade.liyue-party.3-character.crit-rate"
    )?.value).toBeCloseTo(0.09)
    expect(chascaResult.appliedEffects.find((effect) =>
      effect.id === "weapon.chain-breaker.qualifying-party.3-character.attack-percent"
    )?.value).toBeCloseTo(0.144)
    expect(chascaResult.appliedEffects.find((effect) =>
      effect.id === "weapon.chain-breaker.qualifying-party.3-character.elemental-mastery"
    )?.value).toBe(24)
  })

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
