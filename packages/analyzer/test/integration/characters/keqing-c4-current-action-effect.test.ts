import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createBuild(characterId: "Keqing" | "Xiangling", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 刻晴 C4 当前动作效果测试配置`,
    weapon: {
      ascension: 6,
      level: 90,
      refinement: 1,
      weaponId: characterId === "Keqing" ? "FavoniusSword" : "TheCatch"
    }
  }
}

describe("Keqing C4 current-action effect", () => {
  it("requires C4, raises Keqing's confirmed-reaction snapshot, excludes teammates, and inherits at C6", () => {
    const effectId = "keqing.constellation.4.attunement.electro_reaction.attack_percent"
    const keqingAction = requireAction("keqing.skill.stellar_restoration.recast_slash")
    const xianglingAction = requireAction("xiangling.burst.pyronado.reverse_vaporize")
    const keqingC3 = createBuild("Keqing", "test.keqing.c3", 3)
    const keqingC4 = createBuild("Keqing", "test.keqing.c4", 4)
    const keqingC6 = createBuild("Keqing", "test.keqing.c6", 6)
    const xiangling = createBuild("Xiangling", "test.xiangling.keqing-c4-teammate", 0)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: keqingAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: keqingC3.buildId },
        build: keqingC3,
        buffs: [],
        enemy,
        gameData,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires Keqing constellation 4`)

    const c4Baseline = evaluateDeclaredDirectScenarioAction({
      action: keqingAction,
      build: keqingC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const c4Snapshot = evaluateDeclaredDirectScenarioAction({
      action: keqingAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: keqingC4.buildId },
      build: keqingC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const teammateBaseline = evaluateDeclaredDirectScenarioAction({
      action: xianglingAction,
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [keqingC4]
    })
    const teammateSnapshot = evaluateDeclaredDirectScenarioAction({
      action: xianglingAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: keqingC4.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [keqingC4]
    })
    const c6Baseline = evaluateDeclaredDirectScenarioAction({
      action: keqingAction,
      build: keqingC6,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: keqingAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: keqingC6.buildId },
      build: keqingC6,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    expect(c4Snapshot.stats.attackPercent - c4Baseline.stats.attackPercent).toBeCloseTo(0.25)
    expect(c4Snapshot.result.expectedDamage).toBeGreaterThan(c4Baseline.result.expectedDamage)
    expect(c4Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: keqingC4.buildId, target: "attackPercent", value: 0.25 })
      ])
    )
    expect(teammateSnapshot.stats.attackPercent).toBeCloseTo(teammateBaseline.stats.attackPercent)
    expect(teammateSnapshot.result.expectedDamage).toBeCloseTo(teammateBaseline.result.expectedDamage)
    expect(teammateSnapshot.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
    expect(c6Snapshot.stats.attackPercent - c6Baseline.stats.attackPercent).toBeCloseTo(0.25)
    expect(c6Snapshot.result.expectedDamage).toBeGreaterThan(c6Baseline.result.expectedDamage)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: keqingC6.buildId, target: "attackPercent", value: 0.25 })
      ])
    )
  })
})
