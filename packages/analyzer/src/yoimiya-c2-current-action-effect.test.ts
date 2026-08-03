import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "./declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const effectId = "yoimiya.constellation.2.a_procession_of_jewels.pyro_critical_hit.pyro_damage_bonus"

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createBuild(characterId: "Xiangling" | "Yoimiya", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 宵宫 C2 当前动作效果测试配置`,
    weapon: {
      ascension: 6,
      level: 90,
      refinement: 1,
      weaponId: characterId === "Yoimiya" ? "FavoniusWarbow" : "TheCatch"
    }
  }
}

describe("Yoimiya C2 current-action effect", () => {
  it("requires C2, raises only Yoimiya's Pyro damage, and inherits at C6", () => {
    const pyroAction = requireAction("yoimiya.burst.ryukin_saxifrage.initial_arrow")
    const physicalAction = requireAction("yoimiya.normal.auto.first_hit")
    const teammatePyroAction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const yoimiyaC1 = createBuild("Yoimiya", "test.yoimiya.c1", 1)
    const yoimiyaC2 = createBuild("Yoimiya", "test.yoimiya.c2", 2)
    const yoimiyaC6 = createBuild("Yoimiya", "test.yoimiya.c6", 6)
    const xiangling = createBuild("Xiangling", "test.xiangling.yoimiya-c2-teammate", 0)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: pyroAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: yoimiyaC1.buildId },
        build: yoimiyaC1,
        buffs: [],
        enemy,
        gameData,
        teammates: []
      })
    ).toThrow(`Active effect ${effectId} requires Yoimiya constellation 2`)

    const pyroBaseline = evaluateDeclaredDirectScenarioAction({
      action: pyroAction,
      build: yoimiyaC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const pyroSnapshot = evaluateDeclaredDirectScenarioAction({
      action: pyroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: yoimiyaC2.buildId },
      build: yoimiyaC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const physicalBaseline = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      build: yoimiyaC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const physicalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: yoimiyaC2.buildId },
      build: yoimiyaC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const teammateBaseline = evaluateDeclaredDirectScenarioAction({
      action: teammatePyroAction,
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [yoimiyaC2]
    })
    const teammateSnapshot = evaluateDeclaredDirectScenarioAction({
      action: teammatePyroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: yoimiyaC2.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [yoimiyaC2]
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: pyroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: yoimiyaC6.buildId },
      build: yoimiyaC6,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    expect(pyroSnapshot.stats.damageBonus - pyroBaseline.stats.damageBonus).toBeCloseTo(0.25)
    expect(pyroSnapshot.result.expectedDamage).toBeGreaterThan(pyroBaseline.result.expectedDamage)
    expect(pyroSnapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: yoimiyaC2.buildId, target: "damageBonus", value: 0.25 })
      ])
    )
    expect(physicalSnapshot.stats.damageBonus).toBeCloseTo(physicalBaseline.stats.damageBonus)
    expect(physicalSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(teammateSnapshot.stats.damageBonus).toBeCloseTo(teammateBaseline.stats.damageBonus)
    expect(teammateSnapshot.result.expectedDamage).toBeCloseTo(teammateBaseline.result.expectedDamage)
    expect(teammateSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(c6Snapshot.stats.damageBonus - pyroBaseline.stats.damageBonus).toBeCloseTo(0.25)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: yoimiyaC6.buildId, value: 0.25 })])
    )
  })
})
