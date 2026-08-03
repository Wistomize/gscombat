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

function createBuild(characterId: "Xiangling" | "Xinyan", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 辛焱 C4 当前动作效果测试配置`,
    weapon: {
      ascension: 6,
      level: 90,
      refinement: 1,
      weaponId: characterId === "Xinyan" ? "FavoniusGreatsword" : "TheCatch"
    }
  }
}

describe("Xinyan C4 current-action effect", () => {
  it("requires C4, reduces Physical resistance for self and teammates, inherits at C6, and excludes elemental actions", () => {
    const effectId = "xinyan.constellation.4.wildfire_rhythm.sweeping_fervor.physical_resistance_reduction"
    const selfPhysicalAction = requireAction("xinyan.normal.auto.first_hit")
    const teammatePhysicalAction = requireAction("xiangling.normal.auto.first_hit")
    const elementalAction = requireAction("xinyan.skill.sweeping_fervor.swing")
    const xinyanC3 = createBuild("Xinyan", "test.xinyan.c3", 3)
    const xinyanC4 = createBuild("Xinyan", "test.xinyan.c4", 4)
    const xinyanC6 = createBuild("Xinyan", "test.xinyan.c6", 6)
    const xiangling = createBuild("Xiangling", "test.xiangling.xinyan-c4-recipient", 0)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: teammatePhysicalAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: xinyanC3.buildId },
        build: xiangling,
        buffs: [],
        enemy,
        gameData,
        teammates: [xinyanC3]
      })
    ).toThrow(`Active effect ${effectId} requires Xinyan constellation 4`)

    const selfBaseline = evaluateDeclaredDirectScenarioAction({
      action: selfPhysicalAction,
      build: xinyanC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const selfSnapshot = evaluateDeclaredDirectScenarioAction({
      action: selfPhysicalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: xinyanC4.buildId },
      build: xinyanC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const teammateBaseline = evaluateDeclaredDirectScenarioAction({
      action: teammatePhysicalAction,
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [xinyanC4]
    })
    const teammateSnapshot = evaluateDeclaredDirectScenarioAction({
      action: teammatePhysicalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: xinyanC4.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [xinyanC4]
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: teammatePhysicalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: xinyanC6.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [xinyanC6]
    })
    const elementalBaseline = evaluateDeclaredDirectScenarioAction({
      action: elementalAction,
      build: xinyanC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const elementalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: elementalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: xinyanC4.buildId },
      build: xinyanC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    for (const [baseline, snapshot, sourceId] of [
      [selfBaseline, selfSnapshot, xinyanC4.buildId],
      [teammateBaseline, teammateSnapshot, xinyanC4.buildId]
    ] as const) {
      expect(snapshot.stats.resistanceReduction - baseline.stats.resistanceReduction).toBeCloseTo(0.15)
      expect(snapshot.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
      expect(snapshot.appliedEffects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: effectId, sourceId, target: "enemyResistanceReduction", value: 0.15 })
        ])
      )
    }
    expect(c6Snapshot.stats.resistanceReduction - teammateBaseline.stats.resistanceReduction).toBeCloseTo(0.15)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: xinyanC6.buildId, value: 0.15 })])
    )
    expect(elementalSnapshot.stats.resistanceReduction).toBeCloseTo(elementalBaseline.stats.resistanceReduction)
    expect(elementalSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
  })
})
