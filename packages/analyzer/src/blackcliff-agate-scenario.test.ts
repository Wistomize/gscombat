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
} from "./declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const blackcliffStackEffectIds = [
  "weapon.blackcliff-agate.defeated-enemy.1-stack.attack-percent",
  "weapon.blackcliff-agate.defeated-enemy.2-stack.attack-percent",
  "weapon.blackcliff-agate.defeated-enemy.3-stack.attack-percent"
] as const

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createBlackcliffAgateBuild(refinement: number): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.mona.blackcliff-agate.r${refinement}`,
    characterId: "Mona",
    constellation: 0,
    label: `莫娜黑岩绯玉 R${refinement} 测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement, weaponId: "BlackcliffAgate" }
  }
}

function evaluateBlackcliffAgate(
  build: CharacterBuild,
  activeEffectIds: readonly string[] = [],
  teammates: readonly CharacterBuild[] = []
): DeclaredDirectScenarioEvaluation {
  return evaluateDeclaredDirectScenarioAction({
    action: requireAction("mona.normal.auto.first_hit"),
    activeEffectIds,
    build,
    buffs: [],
    enemy,
    gameData,
    teammates
  })
}

function requireBlackcliffEffect(evaluation: DeclaredDirectScenarioEvaluation, effectId: string) {
  const effect = evaluation.appliedEffects.find((candidate) => candidate.id === effectId)
  if (!effect) throw new Error(`Expected Blackcliff Agate effect: ${effectId}`)
  return effect
}

describe("Blackcliff Agate declared scenarios", () => {
  it("maps each selected defeated-enemy stack to the exact R1 and R5 final-Attack increase", () => {
    const r1Build = createBlackcliffAgateBuild(1)
    const r5Build = createBlackcliffAgateBuild(5)
    const r1Inactive = evaluateBlackcliffAgate(r1Build)
    const r5Inactive = evaluateBlackcliffAgate(r5Build)
    const r1StackValues = [0.12, 0.24, 0.36]
    const r5StackValues = [0.24, 0.48, 0.72]

    expect(r1Inactive.appliedEffects.some((effect) => effect.id.startsWith("weapon.blackcliff-agate."))).toBe(false)
    expect(r1Inactive.stats.attackPercent).toBeCloseTo(r5Inactive.stats.attackPercent)
    expect(r1Inactive.stats.effectiveAttack).toBeCloseTo(r5Inactive.stats.effectiveAttack)

    for (const [index, effectId] of blackcliffStackEffectIds.entries()) {
      const r1 = evaluateBlackcliffAgate(r1Build, [effectId])
      const r5 = evaluateBlackcliffAgate(r5Build, [effectId])
      const r1Value = r1StackValues[index]
      const r5Value = r5StackValues[index]
      if (r1Value === undefined || r5Value === undefined) throw new Error(`Missing Blackcliff Agate stack value at ${index}`)

      expect(requireBlackcliffEffect(r1, effectId)).toMatchObject({ target: "attackPercent", value: r1Value })
      expect(requireBlackcliffEffect(r5, effectId)).toMatchObject({ target: "attackPercent", value: r5Value })
      expect(r1.stats.attackPercent - r1Inactive.stats.attackPercent).toBeCloseTo(r1Value)
      expect(r5.stats.attackPercent - r5Inactive.stats.attackPercent).toBeCloseTo(r5Value)
      expect(r1.stats.effectiveAttack - r1Inactive.stats.effectiveAttack).toBeCloseTo(r1.stats.baseAttack * r1Value)
      expect(r5.stats.effectiveAttack - r5Inactive.stats.effectiveAttack).toBeCloseTo(r5.stats.baseAttack * r5Value)
      expect(r5.stats.effectiveAttack - r5Inactive.stats.effectiveAttack).toBeCloseTo(
        (r1.stats.effectiveAttack - r1Inactive.stats.effectiveAttack) * 2
      )
      expect(r1.result.expectedDamage).toBeGreaterThan(r1Inactive.result.expectedDamage)
      expect(r5.result.expectedDamage).toBeGreaterThan(r1.result.expectedDamage)
    }
  })

  it("rejects multiple mutually exclusive defeated-enemy stack snapshots", () => {
    expect(() =>
      evaluateBlackcliffAgate(createBlackcliffAgateBuild(1), [blackcliffStackEffectIds[0], blackcliffStackEffectIds[1]])
    ).toThrow("Selected blackcliff-agate-defeated-enemy effects cannot stack")
  })

  it("does not resolve a selected Blackcliff Agate snapshot from a teammate", () => {
    const primary: CharacterBuild = {
      ...createBlackcliffAgateBuild(1),
      buildId: "test.mona.favonius-codex",
      label: "莫娜西风秘典测试配置",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusCodex" }
    }
    const teammate: CharacterBuild = {
      ...createBlackcliffAgateBuild(1),
      buildId: "test.lisa.blackcliff-agate",
      characterId: "Lisa",
      label: "丽莎黑岩绯玉测试配置"
    }
    const baseline = evaluateBlackcliffAgate(primary)
    const teammatePresent = evaluateBlackcliffAgate(primary, [], [teammate])
    const effectId = blackcliffStackEffectIds[0]

    expect(teammatePresent.appliedEffects.some((effect) => effect.id.startsWith("weapon.blackcliff-agate."))).toBe(false)
    expect(teammatePresent.stats.attackPercent).toBeCloseTo(baseline.stats.attackPercent)
    expect(teammatePresent.stats.effectiveAttack).toBeCloseTo(baseline.stats.effectiveAttack)
    expect(teammatePresent.result.expectedDamage).toBeCloseTo(baseline.result.expectedDamage)
    expect(() => evaluateBlackcliffAgate(primary, [effectId], [teammate])).toThrow(
      `Active effect ${effectId} requires its source build in the configured team`
    )
  })
})
