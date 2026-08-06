import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const effectId = "yaoyao.constellation.1.adeptus_tutelage.white_jade_radish.active_character.dendro_damage_bonus"

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createBuild(characterId: "Collei" | "Yaoyao", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 瑶瑶 C1 当前动作效果测试配置`,
    weapon: {
      ascension: 6,
      level: 90,
      refinement: 1,
      weaponId: characterId === "Collei" ? "FavoniusWarbow" : "FavoniusLance"
    }
  }
}

describe("Yaoyao C1 current-action effect", () => {
  it("requires C1, raises the current on-field recipient's Dendro damage, and inherits at C6", () => {
    const selfDendroAction = requireAction("yaoyao.burst.moonjade_descent.initial_aoe")
    const teammateDendroAction = requireAction("collei.burst.trump_card_kitty.initial_explosion")
    const yaoyaoC0 = createBuild("Yaoyao", "test.yaoyao.c0", 0)
    const yaoyaoC1 = createBuild("Yaoyao", "test.yaoyao.c1", 1)
    const yaoyaoC6 = createBuild("Yaoyao", "test.yaoyao.c6", 6)
    const collei = createBuild("Collei", "test.collei.yaoyao-c1-recipient", 0)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: teammateDendroAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: yaoyaoC0.buildId },
        build: collei,
        buffs: [],
        enemy,
        gameData,
        teammates: [yaoyaoC0]
      })
    ).toThrow(`Active effect ${effectId} requires Yaoyao constellation 1`)

    const teammateBaseline = evaluateDeclaredDirectScenarioAction({
      action: teammateDendroAction,
      build: collei,
      buffs: [],
      enemy,
      gameData,
      teammates: [yaoyaoC1]
    })
    const teammateSnapshot = evaluateDeclaredDirectScenarioAction({
      action: teammateDendroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: yaoyaoC1.buildId },
      build: collei,
      buffs: [],
      enemy,
      gameData,
      teammates: [yaoyaoC1]
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: teammateDendroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: yaoyaoC6.buildId },
      build: collei,
      buffs: [],
      enemy,
      gameData,
      teammates: [yaoyaoC6]
    })
    const selfBaseline = evaluateDeclaredDirectScenarioAction({
      action: selfDendroAction,
      build: yaoyaoC1,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const selfSnapshot = evaluateDeclaredDirectScenarioAction({
      action: selfDendroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: yaoyaoC1.buildId },
      build: yaoyaoC1,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    expect(teammateSnapshot.stats.damageBonus - teammateBaseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(teammateSnapshot.result.expectedDamage).toBeGreaterThan(teammateBaseline.result.expectedDamage)
    expect(teammateSnapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: yaoyaoC1.buildId, target: "damageBonus", value: 0.15 })
      ])
    )
    expect(c6Snapshot.stats.damageBonus - teammateBaseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: yaoyaoC6.buildId, value: 0.15 })])
    )
    expect(selfSnapshot.stats.damageBonus - selfBaseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(selfSnapshot.result.expectedDamage).toBeGreaterThan(selfBaseline.result.expectedDamage)
  })
})
