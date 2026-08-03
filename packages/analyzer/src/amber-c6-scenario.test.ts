import { getCombatActionDefinition, xianglingNationalBuiltinBuild, type CombatActionMetadata } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "./declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const effectId = "amber.constellation.6.wildfire.party_attack_percent"

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createAmberBuild(constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({
      ...artifact,
      setId: "TestNoArtifactSet"
    })),
    buildId: `test.amber.c${constellation}`,
    characterId: "Amber",
    constellation,
    label: `安柏 C${constellation} 测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
  }
}

describe("Amber C6 current-action snapshot", () => {
  it("binds to a configured C6 Amber and raises a teammate's Attack-scaling damage", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")
    const amber = createAmberBuild(6)
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [amber]
    })
    const wildfire = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [effectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [amber]
    })

    expect(wildfire.stats.attackPercent).toBeCloseTo(baseline.stats.attackPercent + 0.15)
    expect(wildfire.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(wildfire.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: amber.buildId, target: "attackPercent", value: 0.15 })
      ])
    )
  })

  it("also benefits Amber herself without inferring the cast state", () => {
    const action = requireAction("amber.normal.sharpshooter.fully_charged.hydro_aura_vaporize")
    const amber = createAmberBuild(6)
    const baseline = evaluateDeclaredDirectScenarioAction({ action, build: amber, buffs: [], enemy, gameData })
    const wildfire = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [effectId],
      build: amber,
      buffs: [],
      enemy,
      gameData
    })

    expect(wildfire.stats.attackPercent).toBeCloseTo(baseline.stats.attackPercent + 0.15)
    expect(wildfire.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(wildfire.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: amber.buildId, value: 0.15 })])
    )
  })

  it("rejects an absent source and an Amber C5 source", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action,
        activeEffectIds: [effectId],
        build: xianglingNationalBuiltinBuild,
        buffs: [],
        enemy,
        gameData
      })
    ).toThrow(`Active effect ${effectId} requires its source build in the configured team`)
    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action,
        activeEffectIds: [effectId],
        build: xianglingNationalBuiltinBuild,
        buffs: [],
        enemy,
        gameData,
        teammates: [createAmberBuild(5)]
      })
    ).toThrow("requires Amber constellation 6")
  })
})
