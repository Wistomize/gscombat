import {
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  raidenNationalBuiltinScenario,
  type CombatActionMetadata
} from "@gscombat/content"
import type { EvaluationScenario, ExternalBuff } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredSpecialReactionScenarioAction } from "../../../src/evaluators/declared-scenario.js"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createSpecialAction(
  id: string,
  specialReaction: NonNullable<CombatActionMetadata["specialReaction"]>,
  scenarioParameters?: CombatActionMetadata["scenarioParameters"]
): CombatActionMetadata {
  const source = requireAction("raiden.skill.transcendence_baleful_omen.initial_hit")
  return {
    ...source,
    damageKind: "special_reaction",
    evaluator: "declared_special_reaction",
    id,
    ...(scenarioParameters === undefined ? {} : { scenarioParameters }),
    specialReaction
  }
}

function createSandroneScenario(targetActionId: string, constellation: number): EvaluationScenario {
  return {
    ...raidenNationalBuiltinScenario,
    conditions: {
      actionParameters: { "stored-elemental-applications": 0 },
      activeEffectIds: [],
      enemyCount: 1,
      equipmentEffectMode: "maximum_reachable"
    },
    enemy,
    externalBuffs: [],
    primary: {
      ...raidenNationalBuiltinBuild,
      characterId: "Sandrone",
      constellation,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AThousandBlazingSuns" }
    },
    targetActionId,
    teammates: []
  }
}

describe("declared special-reaction scenario actions", () => {
  it.each([
    ["sandrone.skill.phenomenon_calculus.prism_bullet.stellar_superconduct", 0],
    ["sandrone.normal.charged_attack.condensation_ray.stellar_superconduct", 0],
    ["sandrone.burst.phenomenon_calculus.negative_temperature_beam.stellar_superconduct", 0],
    ["sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.stellar_superconduct", 6]
  ] as const)("settles registered %s through Stellar-Superconduct stages and its stored-application snapshot", (targetActionId, constellation) => {
    const scenario = createSandroneScenario(targetActionId, constellation)
    const baseline = evaluateScenario(scenario, gameData)
    const withStoredApplications = evaluateScenario({
      ...scenario,
      conditions: { ...scenario.conditions, actionParameters: { "stored-elemental-applications": 12 } }
    }, gameData)
    const withMastery = evaluateScenario(scenario, gameData, { artifactStatDeltas: { elemental_mastery: 100 } })
    const withOrdinaryModifiers = evaluateScenario({
      ...scenario,
      enemy: { ...enemy, level: 1, defenseReduction: 0.8 },
      externalBuffs: [{ label: "普通增伤隔离检查", sourceId: "test.ordinary-bonus", stat: "damage_bonus", value: 1 }]
    }, gameData)

    expect(baseline.rotation.events.length).toBeGreaterThan(0)
    for (const event of baseline.rotation.events) {
      expect(event.trace.every((entry) => entry.kind === "special_reaction" || entry.kind === "hit_count")).toBe(true)
      const stages = event.trace.flatMap((entry) => entry.kind === "special_reaction" ? [entry.stage] : [])
      expect(stages[0]).toBe("base_damage")
      expect(stages).toContain("reaction_damage_bonus")
      expect(stages).not.toContain("defense")
    }
    expect(withStoredApplications.actionExpectedDamage).toBeGreaterThan(baseline.actionExpectedDamage)
    expect(withMastery.actionExpectedDamage).toBeGreaterThan(baseline.actionExpectedDamage)
    expect(withOrdinaryModifiers.actionExpectedDamage).toBeCloseTo(baseline.actionExpectedDamage)
  })

  it("applies Sandrone's mastery passive and cumulative C1/C2 to the single ray without merging C4", () => {
    const rayId = "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct"
    const [c0, c1, c2, c6] = [0, 1, 2, 6].map((constellation) =>
      evaluateScenario(createSandroneScenario(rayId, constellation), gameData)
    )
    for (const result of [c0!, c1!, c2!, c6!]) {
      expect(result.stats.elementalMastery).toBeCloseTo(Math.min(result.stats.effectiveAttack * 0.08, 160))
      expect(result.rotation.events).toHaveLength(1)
      expect(result.rotation.events[0]?.hitCount).toBe(1)
    }
    const reactionBonus = (result: NonNullable<typeof c0>) => {
      const entry = result.rotation.events[0]?.trace.find((entry) =>
        entry.kind === "special_reaction" && entry.formula.kind === "special_reaction_damage_bonus"
      )
      if (entry?.kind !== "special_reaction" || entry.formula.kind !== "special_reaction_damage_bonus") {
        throw new Error("Expected the dedicated reaction damage-bonus formula")
      }
      return entry.formula.bonus
    }
    expect(reactionBonus(c1!) - reactionBonus(c0!)).toBeCloseTo(0.3)
    expect(reactionBonus(c6!)).toBeCloseTo(reactionBonus(c1!))
    expect(c2!.stats.critDamage - c1!.stats.critDamage).toBeCloseTo(1)
    expect(c6!.stats.critDamage).toBeCloseTo(c2!.stats.critDamage)
    expect(c1!.actionExpectedDamage).toBeGreaterThan(c0!.actionExpectedDamage)
    expect(c2!.actionExpectedDamage).toBeGreaterThan(c1!.actionExpectedDamage)

    const burst = evaluateScenario(createSandroneScenario(
      "sandrone.burst.phenomenon_calculus.negative_temperature_beam.stellar_superconduct", 2
    ), gameData)
    expect(burst.stats.critDamage).toBeCloseTo(c0!.stats.critDamage)
    const lowAttack = createSandroneScenario(rayId, 0)
    const withoutArtifacts = evaluateScenario({ ...lowAttack, primary: { ...lowAttack.primary, artifacts: [] } }, gameData)
    expect(withoutArtifacts.stats.effectiveAttack * 0.08).toBeLessThan(160)
    expect(withoutArtifacts.stats.elementalMastery).toBeCloseTo(withoutArtifacts.stats.effectiveAttack * 0.08)
    for (const kind of ["stellar_superconduct", "stellar_swirl"]) {
      const extraHits = evaluateScenario({
        ...createSandroneScenario(`sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.${kind}`, 6),
        conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" }
      }, gameData)
      expect(extraHits.rotation.events[0]?.hitCount).toBe(4)
      expect(extraHits.stats.critDamage).toBeCloseTo(c0!.stats.critDamage)
      expect(extraHits.rotation.events[0]?.trace).toEqual(expect.arrayContaining([
        expect.objectContaining({
          kind: "special_reaction",
          stage: "base_damage_bonus",
          formula: expect.objectContaining({ bonus: 0.14 })
        })
      ]))
      expect(reactionBonus(extraHits)).toBeCloseTo(reactionBonus(c1!))
    }
  })

  it("routes a direct Lunar-Charged action through the independent formula without ordinary damage bonus or defense", () => {
    const action = createSpecialAction("test.lunar-charged.direct", {
      ascensionBonus: 0.15,
      baseDamageBonus: 0.1,
      flatDamageAddition: 50,
      kind: "lunar_charged",
      reactionDamageBonus: 0.2
    })
    const ordinaryDamageBonus: ExternalBuff = {
      label: "测试普通伤害加成",
      sourceId: "test.ordinary-damage-bonus",
      stat: "damage_bonus",
      value: 1
    }
    const elementalMastery: ExternalBuff = {
      label: "测试元素精通",
      sourceId: "test.elemental-mastery",
      stat: "elemental_mastery",
      value: 200
    }
    const baseline = evaluateDeclaredSpecialReactionScenarioAction({
      action,
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const withOrdinaryDamageBonus = evaluateDeclaredSpecialReactionScenarioAction({
      action,
      build: raidenNationalBuiltinBuild,
      buffs: [ordinaryDamageBonus],
      enemy,
      gameData
    })
    const withElementalMastery = evaluateDeclaredSpecialReactionScenarioAction({
      action,
      build: raidenNationalBuiltinBuild,
      buffs: [elementalMastery],
      enemy,
      gameData
    })

    expect(baseline.result.kind).toBe("lunar_charged")
    expect(baseline.result.reactionCoefficient).toBe(3)
    expect(baseline.rotation).toMatchObject({
      dpr: baseline.result.expectedDamage,
      dps: baseline.result.expectedDamage,
      duration: 1
    })
    expect(baseline.rotation.events).toHaveLength(1)
    expect(baseline.rotation.events[0]?.trace.map((entry) => entry.kind)).toEqual(
      Array(9).fill("special_reaction")
    )
    expect(baseline.result.trace.map((entry) => entry.stage)).toEqual([
      "base_damage",
      "reaction_coefficient",
      "base_damage_multiplier",
      "base_damage_bonus",
      "reaction_damage_bonus",
      "flat_damage_addition",
      "crit",
      "resistance",
      "ascension"
    ])
    expect(baseline.result.trace[1]?.formula).toEqual({
      kind: "special_reaction_coefficient",
      multiplier: 3,
      reactionKind: "lunar_charged"
    })
    expect(withOrdinaryDamageBonus.stats.damageBonus).toBeCloseTo(baseline.stats.damageBonus + 1)
    expect(withOrdinaryDamageBonus.result.expectedDamage).toBeCloseTo(baseline.result.expectedDamage)
    expect(withElementalMastery.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
  })

  it("uses the declared manual Stellar-Superconduct snapshot rather than inferring a rotation", () => {
    const action = createSpecialAction(
      "test.stellar-superconduct.direct",
      {
        kind: "stellar_superconduct",
        stellarStoredElementalApplicationsParameterId: "stored-elemental-applications"
      },
      [
        {
          defaultValue: 0,
          id: "stored-elemental-applications",
          label: "极星辉域已储存元素附着次数",
          maximumValue: 12,
          minimumValue: 0
        }
      ]
    )
    const withoutStoredApplications = evaluateDeclaredSpecialReactionScenarioAction({
      action,
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const withTwelveStoredApplications = evaluateDeclaredSpecialReactionScenarioAction({
      action,
      actionParameters: { "stored-elemental-applications": 12 },
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })

    expect(withoutStoredApplications.stats.actionParameters).toEqual({ "stored-elemental-applications": 0 })
    expect(withoutStoredApplications.result.reactionCoefficient).toBe(1)
    expect(withTwelveStoredApplications.result.reactionCoefficient).toBe(2)
    expect(withTwelveStoredApplications.result.expectedDamage).toBeCloseTo(
      withoutStoredApplications.result.expectedDamage * 2
    )
    expect(withTwelveStoredApplications.result.trace[1]?.formula).toEqual({
      kind: "special_reaction_coefficient",
      multiplier: 2,
      reactionKind: "stellar_superconduct",
      storedElementalApplications: 12
    })
  })

  it("routes a direct Stellar-Swirl action through the shared base-damage multiplier stage", () => {
    const baselineAction = createSpecialAction("test.stellar-swirl.direct.baseline", { kind: "stellar_swirl" })
    const enhancedAction = createSpecialAction("test.stellar-swirl.direct.enhanced", {
      baseDamageMultiplier: 0.3,
      kind: "stellar_swirl"
    })
    const baseline = evaluateDeclaredSpecialReactionScenarioAction({
      action: baselineAction,
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })
    const enhanced = evaluateDeclaredSpecialReactionScenarioAction({
      action: enhancedAction,
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData
    })

    expect(enhanced.result.kind).toBe("stellar_swirl")
    expect(enhanced.result.reactionCoefficient).toBe(1)
    expect(enhanced.result.expectedDamage).toBeCloseTo(baseline.result.expectedDamage * 1.3)
    expect(enhanced.result.trace[2]).toMatchObject({
      formula: {
        bonus: 0.3,
        kind: "special_reaction_base_damage_multiplier",
        multiplier: 1.3
      },
      stage: "base_damage_multiplier"
    })
  })
})
