import { raidenNationalBuiltinScenario, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateScenario } from "./scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

function makeBuild(characterId: string, buildId: string): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({
      ...artifact,
      setId: "TestNoArtifactSet"
    })),
    buildId,
    characterId,
    constellation: 0,
    label: `${characterId} 魔导秘仪集成测试`,
    talents: { burst: 10, normal: 10, skill: 10 }
  }
}

function makeScenario(
  primary: CharacterBuild,
  targetActionId: string,
  teammates: CharacterBuild[]
): EvaluationScenario {
  return {
    ...raidenNationalBuiltinScenario,
    conditions: {
      activeEffectIds: [],
      equipmentEffectMode: "maximum_reachable",
      enemyCount: 1
    },
    primary,
    targetActionId,
    teammates
  }
}

describe("Hexerei Secret Rite team effects", () => {
  it("requires two Hexerei characters and applies Klee and Sucrose locked passives at their maximum state", () => {
    const klee = makeBuild("Klee", "test.hexerei.klee")
    const sucrose = makeBuild("Sucrose", "test.hexerei.sucrose")
    const inactive = evaluateScenario(makeScenario(klee, "klee.normal.charged_attack.single_hit", []), gameData)
    const active = evaluateScenario(makeScenario(klee, "klee.normal.charged_attack.single_hit", [sucrose]), gameData)
    const effectIds = active.appliedEffects.map((effect) => effect.id)

    expect(inactive.teamState.hexereiSecretRite).toBe(false)
    expect(active.teamState.hexereiSecretRite).toBe(true)
    expect(effectIds).toEqual(
      expect.arrayContaining([
        "klee.locked_passive.spark_magic.three_boom_badges.original_damage_multiplier",
        "sucrose.locked_passive.seven_cycle_theory.small_spirit.party_damage_bonus",
        "sucrose.locked_passive.seven_cycle_theory.large_spirit.hexerei_damage_bonus"
      ])
    )
    expect(active.stats.damageBonus - inactive.stats.damageBonus).toBeCloseTo(0.128572)
    expect(active.actionExpectedDamage).toBeGreaterThan(inactive.actionExpectedDamage * 1.5)
  })

  it("keeps Hexerei-only recipient bonuses off non-Hexerei characters while retaining party-wide bonuses", () => {
    const xiangling = makeBuild("Xiangling", "test.hexerei.xiangling")
    const sucrose = makeBuild("Sucrose", "test.hexerei.sucrose.for-xiangling")
    const venti = makeBuild("Venti", "test.hexerei.venti.for-xiangling")
    const evaluation = evaluateScenario(
      makeScenario(xiangling, "xiangling.skill.guoba.single_flame_breath", [sucrose, venti]),
      gameData
    )
    const effectIds = evaluation.appliedEffects.map((effect) => effect.id)

    expect(evaluation.teamState.hexereiSecretRite).toBe(true)
    expect(effectIds).toContain("sucrose.locked_passive.seven_cycle_theory.small_spirit.party_damage_bonus")
    expect(effectIds).toContain("venti.locked_passive.ode_to_time_winds.after_swirl.current_character_damage_bonus")
    expect(effectIds).not.toContain(
      "sucrose.locked_passive.seven_cycle_theory.large_spirit.hexerei_damage_bonus"
    )
  })

  it("stacks Albedo's party-wide and Hexerei-recipient defense conversions only for a Hexerei recipient", () => {
    const klee = makeBuild("Klee", "test.hexerei.klee.with-albedo")
    const albedo = makeBuild("Albedo", "test.hexerei.albedo")
    const evaluation = evaluateScenario(
      makeScenario(klee, "klee.normal.charged_attack.single_hit", [albedo]),
      gameData
    )
    const effects = evaluation.appliedEffects.filter((effect) => effect.id.startsWith("albedo.locked_passive"))

    expect(effects).toHaveLength(2)
    expect(effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "albedo.locked_passive.white_radiance_book.solar_isotoma.party_damage_bonus",
          sourceId: albedo.buildId,
          target: "damageBonus"
        }),
        expect.objectContaining({
          id: "albedo.locked_passive.white_radiance_book.quicksilver.hexerei_damage_bonus",
          sourceId: albedo.buildId,
          target: "damageBonus"
        })
      ])
    )
  })

  it("keeps Nicole's coordinated hit separate while combining recipient and source final attack", () => {
    const klee = makeBuild("Klee", "test.hexerei.klee.with-nicole")
    const nicole = makeBuild("Nicole", "test.hexerei.nicole")
    const evaluation = evaluateScenario(
      makeScenario(klee, "klee.normal.charged_attack.single_hit", [nicole]),
      gameData
    )
    const projectionEvents = evaluation.rotation.events.filter((event) => event.id.includes("arcane_projection"))
    const effectIds = evaluation.appliedEffects.map((effect) => effect.id)

    expect(effectIds).toEqual(
      expect.arrayContaining([
        "nicole.burst.pilgrimage_of_the_heavenly_path.arcane_projection.coordinated_damage",
        "nicole.locked_passive.light_from_darkness.hexerei_arcane_projection.source_attack_addition"
      ])
    )
    expect(projectionEvents).toHaveLength(2)
    expect(projectionEvents.every((event) => event.element === "pyro")).toBe(true)
    expect(projectionEvents.every((event) => event.trace.some((entry) => entry.kind === "scaling"))).toBe(true)
  })

  it("models Venti's original-damage multiplier and Razor's optional independent overflow hit", () => {
    const venti = makeBuild("Venti", "test.hexerei.venti.stormeye")
    const sucrose = makeBuild("Sucrose", "test.hexerei.sucrose.stormeye")
    const ventiEvaluation = evaluateScenario(
      makeScenario(venti, "venti.burst.winds_grand_ode.stormeye.single_tick", [sucrose]),
      gameData
    )
    const razor = makeBuild("Razor", "test.hexerei.razor.overflow")
    const razorScenario = makeScenario(razor, "razor.burst.lightning_fang.normal.fourth_hit", [venti])
    const overflowEffectId = "razor.locked_passive.surging_thunder.overflowing_electro_sigil.lightning_strike"
    const razorEvaluation = evaluateScenario(
      {
        ...razorScenario,
        conditions: { ...razorScenario.conditions, activeEffectIds: [overflowEffectId] }
      },
      gameData
    )

    expect(ventiEvaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "venti.locked_passive.ode_to_time_winds.stormeye.original_damage_multiplier",
          target: "actionParameter",
          value: 1
        })
      ])
    )
    expect(ventiEvaluation.rotation.events[0]?.trace.find((entry) => entry.kind === "scaling")).toEqual(
      expect.objectContaining({ coefficient: expect.closeTo(0.6768 * 1.35) })
    )
    expect(razorEvaluation.appliedEffects.map((effect) => effect.id)).toContain(overflowEffectId)
    expect(razorEvaluation.rotation.events.some((event) => event.id.includes(overflowEffectId))).toBe(true)
  })
})
