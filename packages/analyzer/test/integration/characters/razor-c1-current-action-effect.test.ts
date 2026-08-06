import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const effectId = "razor.constellation.1.wolf_instinct.elemental_orb_or_particle.damage_bonus"

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createBuild(characterId: "Razor" | "Xiangling", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 雷泽 C1 当前动作效果测试配置`,
    weapon: {
      ascension: 6,
      level: 90,
      refinement: 1,
      weaponId: characterId === "Razor" ? "FavoniusGreatsword" : "TheCatch"
    }
  }
}

describe("Razor C1 current-action effect", () => {
  it("requires C1, raises Razor's Physical and Electro damage, excludes teammates, and inherits at C6", () => {
    const physicalAction = requireAction("razor.burst.lightning_fang.normal.fourth_hit")
    const electroAction = requireAction("razor.burst.lightning_fang.initial_hit")
    const teammateAction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const razorC0 = createBuild("Razor", "test.razor.c0", 0)
    const razorC1 = createBuild("Razor", "test.razor.c1", 1)
    const razorC6 = createBuild("Razor", "test.razor.c6", 6)
    const xiangling = createBuild("Xiangling", "test.xiangling.razor-c1-teammate", 0)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: physicalAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: razorC0.buildId },
        build: razorC0,
        buffs: [],
        enemy,
        gameData,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires Razor constellation 1`)

    const physicalBaseline = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      build: razorC1,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const physicalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: razorC1.buildId },
      build: razorC1,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const electroBaseline = evaluateDeclaredDirectScenarioAction({
      action: electroAction,
      build: razorC1,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const electroSnapshot = evaluateDeclaredDirectScenarioAction({
      action: electroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: razorC1.buildId },
      build: razorC1,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const teammateBaseline = evaluateDeclaredDirectScenarioAction({
      action: teammateAction,
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [razorC1]
    })
    const teammateSnapshot = evaluateDeclaredDirectScenarioAction({
      action: teammateAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: razorC1.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [razorC1]
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: razorC6.buildId },
      build: razorC6,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    for (const [baseline, snapshot, sourceId] of [
      [physicalBaseline, physicalSnapshot, razorC1.buildId],
      [electroBaseline, electroSnapshot, razorC1.buildId]
    ] as const) {
      expect(snapshot.stats.damageBonus - baseline.stats.damageBonus).toBeCloseTo(0.1)
      expect(snapshot.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
      expect(snapshot.appliedEffects).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId, target: "damageBonus", value: 0.1 })])
      )
    }
    expect(teammateSnapshot.stats.damageBonus).toBeCloseTo(teammateBaseline.stats.damageBonus)
    expect(teammateSnapshot.result.expectedDamage).toBeCloseTo(teammateBaseline.result.expectedDamage)
    expect(teammateSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(c6Snapshot.stats.damageBonus - physicalBaseline.stats.damageBonus).toBeCloseTo(0.1)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: razorC6.buildId, value: 0.1 })])
    )
  })
})
