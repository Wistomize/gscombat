import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import {
  evaluateDeclaredDirectScenarioAction,
  evaluateDeclaredTransformativeScenarioAction
} from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createBuild(characterId: "KukiShinobu" | "Mona" | "Xiangling", buildId: string, constellation: number): CharacterBuild {
  const weaponId =
    characterId === "Mona" ? "MagicGuide" : characterId === "KukiShinobu" ? "FavoniusSword" : "TheCatch"
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 莫娜 C4 当前动作效果测试配置`,
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

describe("Mona C4 current-action effect", () => {
  it("requires C4, applies the selected Omen snapshot to Mona and teammates, inherits at C6, and leaves transformative damage unchanged", () => {
    const effectId = "mona.constellation.4.prophecy_of_oblivion.omen_target.crit_rate"
    const monaAction = requireAction("mona.normal.auto.first_hit")
    const teammateAction = requireAction("xiangling.normal.auto.first_hit")
    const nonCritAction = requireAction("kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom")
    const monaC3 = createBuild("Mona", "test.mona.c3", 3)
    const monaC4 = createBuild("Mona", "test.mona.c4", 4)
    const monaC6 = createBuild("Mona", "test.mona.c6", 6)
    const xiangling = createBuild("Xiangling", "test.xiangling.mona-c4-recipient", 0)
    const kuki = createBuild("KukiShinobu", "test.kuki-shinobu.mona-c4-recipient", 0)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: teammateAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: monaC3.buildId },
        build: xiangling,
        buffs: [],
        enemy,
        gameData,
        teammates: [monaC3]
      })
    ).toThrow(`Active effect ${effectId} requires Mona constellation 4`)

    const selfBaseline = evaluateDeclaredDirectScenarioAction({
      action: monaAction,
      build: monaC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const selfSnapshot = evaluateDeclaredDirectScenarioAction({
      action: monaAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: monaC4.buildId },
      build: monaC4,
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
      teammates: [monaC4]
    })
    const teammateSnapshot = evaluateDeclaredDirectScenarioAction({
      action: teammateAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: monaC4.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [monaC4]
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: teammateAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: monaC6.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [monaC6]
    })
    const nonCritBaseline = evaluateDeclaredTransformativeScenarioAction({
      action: nonCritAction,
      build: kuki,
      buffs: [],
      enemy,
      gameData,
      teammates: [monaC4]
    })
    const nonCritSnapshot = evaluateDeclaredTransformativeScenarioAction({
      action: nonCritAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: monaC4.buildId },
      build: kuki,
      buffs: [],
      enemy,
      gameData,
      teammates: [monaC4]
    })

    for (const [baseline, snapshot, sourceId] of [
      [selfBaseline, selfSnapshot, monaC4.buildId],
      [teammateBaseline, teammateSnapshot, monaC4.buildId]
    ] as const) {
      expect(snapshot.stats.critRate - baseline.stats.critRate).toBeCloseTo(0.15)
      expect(snapshot.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
      expect(snapshot.appliedEffects).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId, target: "critRate", value: 0.15 })])
      )
    }
    expect(c6Snapshot.stats.critRate - teammateBaseline.stats.critRate).toBeCloseTo(0.15)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: monaC6.buildId, value: 0.15 })])
    )
    expect(nonCritSnapshot.stats.critRate - nonCritBaseline.stats.critRate).toBeCloseTo(0.15)
    expect(nonCritSnapshot.result.expectedDamage).toBeCloseTo(nonCritBaseline.result.expectedDamage)
    expect(nonCritSnapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: monaC4.buildId, target: "critRate", value: 0.15 })])
    )
    expect(nonCritSnapshot.result.trace).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ formula: expect.objectContaining({ kind: "expected_crit" }) })])
    )
  })
})
