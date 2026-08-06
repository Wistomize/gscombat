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

function createBuild(characterId: "Collei" | "KukiShinobu", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 柯莱 C4 当前动作效果测试配置`,
    weapon: {
      ascension: 6,
      level: 90,
      refinement: 1,
      weaponId: characterId === "Collei" ? "FavoniusWarbow" : "FavoniusSword"
    }
  }
}

describe("Collei C4 current-action effect", () => {
  it("requires C4, inherits at C6, increases a teammate's single Hyperbloom, and excludes Collei", () => {
    const effectId = "collei.constellation.4.gift_of_the_woods.party_elemental_mastery"
    const hyperbloom = requireAction("kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom")
    const colleiAction = requireAction("collei.skill.floral_sidewinder.outbound.spread")
    const colleiC3 = createBuild("Collei", "test.collei.c3", 3)
    const colleiC4 = createBuild("Collei", "test.collei.c4", 4)
    const colleiC6 = createBuild("Collei", "test.collei.c6", 6)
    const kuki = createBuild("KukiShinobu", "test.kuki-shinobu.collei-c4-recipient", 0)

    expect(() =>
      evaluateDeclaredTransformativeScenarioAction({
        action: hyperbloom,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: colleiC3.buildId },
        build: kuki,
        buffs: [],
        enemy,
        gameData,
        teammates: [colleiC3]
      })
    ).toThrow(`Active effect ${effectId} requires Collei constellation 4`)

    const teammateBaseline = evaluateDeclaredTransformativeScenarioAction({
      action: hyperbloom,
      build: kuki,
      buffs: [],
      enemy,
      gameData,
      teammates: [colleiC4]
    })
    const teammateC4Snapshot = evaluateDeclaredTransformativeScenarioAction({
      action: hyperbloom,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: colleiC4.buildId },
      build: kuki,
      buffs: [],
      enemy,
      gameData,
      teammates: [colleiC4]
    })
    const teammateC6Snapshot = evaluateDeclaredTransformativeScenarioAction({
      action: hyperbloom,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: colleiC6.buildId },
      build: kuki,
      buffs: [],
      enemy,
      gameData,
      teammates: [colleiC6]
    })
    const selfBaseline = evaluateDeclaredDirectScenarioAction({
      action: colleiAction,
      build: colleiC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const selfSnapshot = evaluateDeclaredDirectScenarioAction({
      action: colleiAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: colleiC4.buildId },
      build: colleiC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    expect(teammateC4Snapshot.stats.elementalMastery - teammateBaseline.stats.elementalMastery).toBeCloseTo(60)
    expect(teammateC4Snapshot.result.expectedDamage).toBeGreaterThan(teammateBaseline.result.expectedDamage)
    expect(teammateC4Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: colleiC4.buildId, target: "elementalMastery", value: 60 })
      ])
    )
    expect(teammateC6Snapshot.stats.elementalMastery - teammateBaseline.stats.elementalMastery).toBeCloseTo(60)
    expect(teammateC6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: colleiC6.buildId, value: 60 })])
    )
    expect(selfSnapshot.stats.elementalMastery).toBeCloseTo(selfBaseline.stats.elementalMastery)
    expect(selfSnapshot.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
