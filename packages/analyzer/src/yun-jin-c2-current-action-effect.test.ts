import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "./declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createPolearmBuild(characterId: "Xiangling" | "YunJin", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 云堇 C2 当前动作效果测试配置`,
    weapon: {
      ascension: 6,
      level: 90,
      refinement: 1,
      weaponId: characterId === "YunJin" ? "FavoniusLance" : "TheCatch"
    }
  }
}

describe("Yun Jin C2 current-action effect", () => {
  it("requires C2, applies the selected snapshot to self and teammates' Normal Attacks, and inherits at C6", () => {
    const effectId = "yun_jin.constellation.2.myriad_mise_en_scene.normal_attack_damage_bonus"
    const selfNormalAction = requireAction("yun_jin.normal.auto.first_hit")
    const teammateNormalAction = requireAction("xiangling.normal.auto.first_hit")
    const nonNormalAction = requireAction("yun_jin.skill.opening_flourish.press")
    const yunJinC1 = createPolearmBuild("YunJin", "test.yun-jin.c1", 1)
    const yunJinC2 = createPolearmBuild("YunJin", "test.yun-jin.c2", 2)
    const yunJinC6 = createPolearmBuild("YunJin", "test.yun-jin.c6", 6)
    const xiangling = createPolearmBuild("Xiangling", "test.xiangling.yun-jin-c2-recipient", 0)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: selfNormalAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: yunJinC1.buildId },
        build: yunJinC1,
        buffs: [],
        enemy,
        gameData,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires YunJin constellation 2`)

    const selfBaseline = evaluateDeclaredDirectScenarioAction({
      action: selfNormalAction,
      build: yunJinC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const selfSnapshot = evaluateDeclaredDirectScenarioAction({
      action: selfNormalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: yunJinC2.buildId },
      build: yunJinC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const teammateBaseline = evaluateDeclaredDirectScenarioAction({
      action: teammateNormalAction,
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [yunJinC2]
    })
    const teammateSnapshot = evaluateDeclaredDirectScenarioAction({
      action: teammateNormalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: yunJinC2.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [yunJinC2]
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: teammateNormalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: yunJinC6.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [yunJinC6]
    })
    const nonNormalBaseline = evaluateDeclaredDirectScenarioAction({
      action: nonNormalAction,
      build: yunJinC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const nonNormalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: nonNormalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: yunJinC2.buildId },
      build: yunJinC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    for (const [baseline, snapshot, sourceId] of [
      [selfBaseline, selfSnapshot, yunJinC2.buildId],
      [teammateBaseline, teammateSnapshot, yunJinC2.buildId]
    ] as const) {
      expect(snapshot.stats.damageBonus - baseline.stats.damageBonus).toBeCloseTo(0.15)
      expect(snapshot.result.expectedDamage).toBeCloseTo(
        baseline.result.expectedDamage * (1 + snapshot.stats.damageBonus) / (1 + baseline.stats.damageBonus)
      )
      expect(snapshot.appliedEffects).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId, target: "damageBonus", value: 0.15 })])
      )
    }
    expect(c6Snapshot.stats.damageBonus - teammateBaseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: yunJinC6.buildId, value: 0.15 })])
    )
    expect(nonNormalSnapshot.stats.damageBonus).toBeCloseTo(nonNormalBaseline.stats.damageBonus)
    expect(nonNormalSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
  })
})
