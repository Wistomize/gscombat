import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const effectId = "lyney.constellation.4.well_versed_well_rehearsed.pyro_charged_attack.pyro_resistance_reduction"

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createBuild(characterId: "Lyney" | "Xiangling", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 林尼 C4 当前动作效果测试配置`,
    weapon: {
      ascension: 6,
      level: 90,
      refinement: 1,
      weaponId: characterId === "Lyney" ? "FavoniusWarbow" : "TheCatch"
    }
  }
}

describe("Lyney C4 current-action effect", () => {
  it("requires C4, reduces Pyro resistance for self and teammates, inherits at C6, and excludes Physical actions", () => {
    const lyneyPyroAction = requireAction("lyney.skill.bewildering_lights.base_hit")
    const teammatePyroAction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const physicalAction = requireAction("xiangling.normal.auto.first_hit")
    const lyneyC3 = createBuild("Lyney", "test.lyney.c3", 3)
    const lyneyC4 = createBuild("Lyney", "test.lyney.c4", 4)
    const lyneyC6 = createBuild("Lyney", "test.lyney.c6", 6)
    const xiangling = createBuild("Xiangling", "test.xiangling.lyney-c4-recipient", 0)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: teammatePyroAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: lyneyC3.buildId },
        build: xiangling,
        buffs: [],
        enemy,
        gameData,
        teammates: [lyneyC3]
      })
    ).toThrow(`Active effect ${effectId} requires Lyney constellation 4`)

    const selfBaseline = evaluateDeclaredDirectScenarioAction({
      action: lyneyPyroAction,
      build: lyneyC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const selfSnapshot = evaluateDeclaredDirectScenarioAction({
      action: lyneyPyroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: lyneyC4.buildId },
      build: lyneyC4,
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
      teammates: [lyneyC4]
    })
    const teammateSnapshot = evaluateDeclaredDirectScenarioAction({
      action: teammatePyroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: lyneyC4.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [lyneyC4]
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: teammatePyroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: lyneyC6.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [lyneyC6]
    })
    const physicalBaseline = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [lyneyC4]
    })
    const physicalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: lyneyC4.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [lyneyC4]
    })

    for (const [baseline, snapshot, sourceId] of [
      [selfBaseline, selfSnapshot, lyneyC4.buildId],
      [teammateBaseline, teammateSnapshot, lyneyC4.buildId]
    ] as const) {
      expect(snapshot.stats.resistanceReduction - baseline.stats.resistanceReduction).toBeCloseTo(0.2)
      expect(snapshot.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
      expect(snapshot.appliedEffects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: effectId, sourceId, target: "enemyResistanceReduction", value: 0.2 })
        ])
      )
    }
    expect(c6Snapshot.stats.resistanceReduction - teammateBaseline.stats.resistanceReduction).toBeCloseTo(0.2)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: lyneyC6.buildId, value: 0.2 })])
    )
    expect(physicalSnapshot.stats.resistanceReduction).toBeCloseTo(physicalBaseline.stats.resistanceReduction)
    expect(physicalSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
  })
})
