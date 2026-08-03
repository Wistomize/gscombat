import {
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  type CombatActionMetadata
} from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateScenario } from "./scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const chargedActionId = "ningguang.normal.charged_attack.with_star_jades"
const stackCounts = [1, 2, 3] as const

/**
 * Catalog boundary: the current action registry has no Catalyst Normal Attack entry. This system test therefore
 * uses Ningguang's real registered Catalyst Charged Attack; the content declaration test owns the Normal positive
 * target-filter coverage. It deliberately does not clone an action or equip this Catalyst to a non-Catalyst user.
 */

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createBalladBuild(refinement: number): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.ningguang.ballad-of-the-boundless-blue.r${refinement}`,
    characterId: "Ningguang",
    constellation: 0,
    label: `凝光无垠蔚蓝之歌 R${refinement} 测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement, weaponId: "BalladOfTheBoundlessBlue" }
  }
}

function createAzureSkiesEffectId(stackCount: number, attackKind: "normal" | "charged"): string {
  return `weapon.ballad-of-the-boundless-blue.azure-skies.${stackCount}-stack.${attackKind}-damage-bonus`
}

function evaluateBalladScenario(
  targetActionId: string,
  build: CharacterBuild,
  activeEffectIds: readonly string[] = []
): ReturnType<typeof evaluateScenario> {
  const scenario: EvaluationScenario = {
    conditions: { activeEffectIds: [...activeEffectIds], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
    enemy,
    externalBuffs: [],
    gameDataVersion: gameData.getManifest().gameVersion,
    primary: build,
    targetActionId,
    teammates: []
  }
  return evaluateScenario(scenario, gameData)
}

function requireAppliedEffect(evaluation: ReturnType<typeof evaluateScenario>, effectId: string) {
  const effect = evaluation.appliedEffects.find((candidate) => candidate.id === effectId)
  if (!effect) throw new Error(`Expected Azure Skies effect: ${effectId}`)
  return effect
}

describe("Ballad of the Boundless Blue declared scenarios", () => {
  it("allows an explicit lower stack while defaulting the empty snapshot to the maximum reachable stack", () => {
    const r1Build = createBalladBuild(1)
    const r5Build = createBalladBuild(5)
    const r1ChargedInactive = evaluateBalladScenario(chargedActionId, r1Build)
    const r5ChargedInactive = evaluateBalladScenario(chargedActionId, r5Build)

    expect(requireAction(chargedActionId)).toMatchObject({ attackKind: "charged", characterId: "Ningguang" })

    for (const stackCount of stackCounts) {
      const chargedEffectId = createAzureSkiesEffectId(stackCount, "charged")
      const r1Charged = evaluateBalladScenario(chargedActionId, r1Build, [chargedEffectId])
      const r5Charged = evaluateBalladScenario(chargedActionId, r5Build, [chargedEffectId])
      const r1ChargedValue = 0.06 * stackCount
      const r5ChargedValue = 0.12 * stackCount

      expect(requireAppliedEffect(r1Charged, chargedEffectId)).toMatchObject({ target: "damageBonus", value: r1ChargedValue })
      expect(requireAppliedEffect(r5Charged, chargedEffectId)).toMatchObject({ target: "damageBonus", value: r5ChargedValue })
      expect(r1Charged.stats.damageBonus).toBeLessThanOrEqual(r1ChargedInactive.stats.damageBonus)
      expect(r5Charged.stats.damageBonus).toBeLessThanOrEqual(r5ChargedInactive.stats.damageBonus)
      expect(r1Charged.actionExpectedDamage).toBeLessThanOrEqual(r1ChargedInactive.actionExpectedDamage)
      expect(r5Charged.actionExpectedDamage).toBeGreaterThan(r1Charged.actionExpectedDamage)
    }
  })

  it("defaults Azure Skies to the maximum reachable charged-attack stack", () => {
    const build = createBalladBuild(1)
    const charged = evaluateBalladScenario(chargedActionId, build)

    expect(charged.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: createAzureSkiesEffectId(3, "charged") })
    ]))
  })

  it("does not apply a selected Normal-only Azure Skies snapshot to Ningguang's real Charged Attack", () => {
    const build = createBalladBuild(1)
    const baseline = evaluateBalladScenario(chargedActionId, build)
    const normalSnapshot = evaluateBalladScenario(chargedActionId, build, [createAzureSkiesEffectId(3, "normal")])

    expect(normalSnapshot.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: createAzureSkiesEffectId(3, "charged") })
    ]))
    expect(normalSnapshot.stats.damageBonus).toBeCloseTo(baseline.stats.damageBonus)
    expect(normalSnapshot.actionExpectedDamage).toBeCloseTo(baseline.actionExpectedDamage)
  })

  it("rejects incompatible normal and charged Azure Skies stack counts before action filtering", () => {
    expect(() =>
      evaluateBalladScenario(chargedActionId, createBalladBuild(1), [
        createAzureSkiesEffectId(1, "normal"),
        createAzureSkiesEffectId(2, "charged")
      ])
    ).toThrow("Selected ballad-of-the-boundless-blue-azure-skies effects cannot stack")
  })
})
