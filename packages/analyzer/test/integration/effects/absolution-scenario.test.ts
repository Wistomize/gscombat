import {
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  type CombatActionMetadata
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import {
  evaluateDeclaredDirectScenarioAction,
  type DeclaredDirectScenarioEvaluation
} from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const targetActionIds = ["clorinde.normal.auto.first_hit", "clorinde.burst.last_lightfall.single_hit"] as const
const stackCounts = [1, 2, 3] as const
const bondOfLifeEffectPrefix = "weapon.absolution.bond-of-life-increase."

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createAbsolutionBuild(refinement: number): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    artifacts: raidenNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId: `test.clorinde.absolution.r${refinement}`,
    characterId: "Clorinde",
    constellation: 0,
    label: `克洛琳德赦罪 R${refinement} 测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement, weaponId: "Absolution" }
  }
}

function createNonAbsolutionSwordBuild(): CharacterBuild {
  const absolutionBuild = createAbsolutionBuild(1)
  return {
    ...absolutionBuild,
    buildId: "test.clorinde.favonius-sword",
    label: "克洛琳德西风剑测试配置",
    weapon: { ...absolutionBuild.weapon, weaponId: "FavoniusSword" }
  }
}

function createTeammateAbsolutionBuild(): CharacterBuild {
  const absolutionBuild = createAbsolutionBuild(1)
  return {
    ...absolutionBuild,
    buildId: "test.alhaitham.absolution-teammate",
    characterId: "Alhaitham",
    label: "艾尔海森赦罪队友测试配置"
  }
}

function createBondOfLifeEffectId(stackCount: number): string {
  return `${bondOfLifeEffectPrefix}${stackCount}-stack.damage-bonus`
}

function evaluateAbsolutionScenario(
  targetActionId: string,
  build: CharacterBuild,
  activeEffectIds: readonly string[] = [],
  teammates: readonly CharacterBuild[] = []
): DeclaredDirectScenarioEvaluation {
  return evaluateDeclaredDirectScenarioAction({
    action: requireAction(targetActionId),
    activeEffectIds,
    build,
    buffs: [],
    enemy,
    gameData,
    teammates
  })
}

function requireAppliedEffect(evaluation: DeclaredDirectScenarioEvaluation, effectId: string) {
  const effect = evaluation.appliedEffects.find((candidate) => candidate.id === effectId)
  if (!effect) throw new Error(`Expected Absolution effect: ${effectId}`)
  return effect
}

function getBondOfLifeAppliedEffectIds(evaluation: DeclaredDirectScenarioEvaluation): readonly string[] {
  return evaluation.appliedEffects
    .map((effect) => effect.id)
    .filter((effectId) => effectId.startsWith(bondOfLifeEffectPrefix))
}

describe("Absolution declared scenarios", () => {
  it("applies its automatic critical damage at the exact R1 and R5 values to real Normal and Burst actions", () => {
    const r1Build = createAbsolutionBuild(1)
    const r5Build = createAbsolutionBuild(5)

    expect(requireAction(targetActionIds[0])).toMatchObject({ characterId: "Clorinde", talentSlot: "normal" })
    expect(requireAction(targetActionIds[1])).toMatchObject({ characterId: "Clorinde", talentSlot: "burst" })

    for (const targetActionId of targetActionIds) {
      const r1 = evaluateAbsolutionScenario(targetActionId, r1Build)
      const r5 = evaluateAbsolutionScenario(targetActionId, r5Build)

      expect(requireAppliedEffect(r1, "weapon.absolution.crit-damage")).toMatchObject({
        sourceId: r1Build.buildId,
        target: "critDamage",
        value: 0.2
      })
      expect(requireAppliedEffect(r5, "weapon.absolution.crit-damage")).toMatchObject({
        sourceId: r5Build.buildId,
        target: "critDamage",
        value: 0.4
      })
      expect(r5.stats.critDamage - r1.stats.critDamage).toBeCloseTo(0.2)
      expect(r5.result.expectedDamage).toBeGreaterThan(r1.result.expectedDamage)
    }
  })

  it("applies each selected pre-existing Bond-of-Life increase stack as a general R1/R5 damage bonus", () => {
    const r1Build = createAbsolutionBuild(1)
    const r5Build = createAbsolutionBuild(5)

    for (const targetActionId of targetActionIds) {
      const r1Inactive = evaluateAbsolutionScenario(targetActionId, r1Build)
      const r5Inactive = evaluateAbsolutionScenario(targetActionId, r5Build)

      for (const stackCount of stackCounts) {
        const effectId = createBondOfLifeEffectId(stackCount)
        const r1 = evaluateAbsolutionScenario(targetActionId, r1Build, [effectId])
        const r5 = evaluateAbsolutionScenario(targetActionId, r5Build, [effectId])
        const r1Value = 0.16 * stackCount
        const r5Value = 0.32 * stackCount

        expect(requireAppliedEffect(r1, effectId)).toMatchObject({
          sourceId: r1Build.buildId,
          target: "damageBonus",
          value: r1Value
        })
        expect(requireAppliedEffect(r5, effectId)).toMatchObject({
          sourceId: r5Build.buildId,
          target: "damageBonus",
          value: r5Value
        })
        expect(getBondOfLifeAppliedEffectIds(r1)).toEqual([effectId])
        expect(getBondOfLifeAppliedEffectIds(r5)).toEqual([effectId])
        expect(r1.stats.damageBonus - r1Inactive.stats.damageBonus).toBeCloseTo(r1Value)
        expect(r5.stats.damageBonus - r5Inactive.stats.damageBonus).toBeCloseTo(r5Value)
        expect(r5.stats.damageBonus - r5Inactive.stats.damageBonus).toBeCloseTo(r1Value * 2)
        expect(r1.result.expectedDamage).toBeGreaterThan(r1Inactive.result.expectedDamage)
        expect(r5.result.expectedDamage).toBeGreaterThan(r5Inactive.result.expectedDamage)
      }
    }
  })

  it("does not infer a current-hit Bond-of-Life increase when no pre-existing snapshot is selected", () => {
    const build = createAbsolutionBuild(1)

    for (const targetActionId of targetActionIds) {
      const evaluation = evaluateAbsolutionScenario(targetActionId, build)

      expect(getBondOfLifeAppliedEffectIds(evaluation)).toEqual([])
      expect(evaluation.appliedEffects.map((effect) => effect.id)).toContain("weapon.absolution.crit-damage")
    }
  })

  it("rejects incompatible selected Bond-of-Life stack snapshots", () => {
    expect(() =>
      evaluateAbsolutionScenario("clorinde.normal.auto.first_hit", createAbsolutionBuild(1), [
        createBondOfLifeEffectId(1),
        createBondOfLifeEffectId(2)
      ])
    ).toThrow("absolution-bond-of-life-increase")
  })

  it("does not source either Absolution effect from a teammate when the primary build has another sword", () => {
    const primaryBuild = createNonAbsolutionSwordBuild()
    const teammateBuild = createTeammateAbsolutionBuild()
    const baseline = evaluateAbsolutionScenario("clorinde.normal.auto.first_hit", primaryBuild, [], [teammateBuild])

    expect(baseline.appliedEffects.some((effect) => effect.id.startsWith("weapon.absolution."))).toBe(false)
    expect(() =>
      evaluateAbsolutionScenario("clorinde.normal.auto.first_hit", primaryBuild, [createBondOfLifeEffectId(1)], [teammateBuild])
    ).toThrow("requires its source build in the configured team")
  })
})
