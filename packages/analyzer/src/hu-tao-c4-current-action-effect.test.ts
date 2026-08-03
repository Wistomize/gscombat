import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "./declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const effectId = "hu_tao.constellation.4.garden_of_eternal_rest.blood_blossom_defeated.party_crit_rate"

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createBuild(characterId: "HuTao" | "Xiangling", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 胡桃 C4 当前动作效果测试配置`,
    weapon: {
      ascension: 6,
      level: 90,
      refinement: 1,
      weaponId: characterId === "HuTao" ? "FavoniusLance" : "TheCatch"
    }
  }
}

describe("Hu Tao C4 current-action effect", () => {
  it("requires C4, raises teammates' crit rate, excludes Hu Tao herself, and inherits at C6", () => {
    const huTaoAction = requireAction("hu_tao.burst.spirit_soother.base_hit")
    const teammateAction = requireAction("xiangling.normal.auto.first_hit")
    const huTaoC3 = createBuild("HuTao", "test.hu-tao.c3", 3)
    const huTaoC4 = createBuild("HuTao", "test.hu-tao.c4", 4)
    const huTaoC6 = createBuild("HuTao", "test.hu-tao.c6", 6)
    const xiangling = createBuild("Xiangling", "test.xiangling.hu-tao-c4-recipient", 0)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: teammateAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: huTaoC3.buildId },
        build: xiangling,
        buffs: [],
        enemy,
        gameData,
        teammates: [huTaoC3]
      })
    ).toThrow(`Active effect ${effectId} requires HuTao constellation 4`)

    const teammateBaseline = evaluateDeclaredDirectScenarioAction({
      action: teammateAction,
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [huTaoC4]
    })
    const teammateSnapshot = evaluateDeclaredDirectScenarioAction({
      action: teammateAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: huTaoC4.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [huTaoC4]
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: teammateAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: huTaoC6.buildId },
      build: xiangling,
      buffs: [],
      enemy,
      gameData,
      teammates: [huTaoC6]
    })
    const selfBaseline = evaluateDeclaredDirectScenarioAction({
      action: huTaoAction,
      build: huTaoC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const selfSnapshot = evaluateDeclaredDirectScenarioAction({
      action: huTaoAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: huTaoC4.buildId },
      build: huTaoC4,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    expect(teammateSnapshot.stats.critRate - teammateBaseline.stats.critRate).toBeCloseTo(0.12)
    expect(teammateSnapshot.result.expectedDamage).toBeGreaterThan(teammateBaseline.result.expectedDamage)
    expect(teammateSnapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: huTaoC4.buildId, target: "critRate", value: 0.12 })
      ])
    )
    expect(c6Snapshot.stats.critRate - teammateBaseline.stats.critRate).toBeCloseTo(0.12)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: huTaoC6.buildId, value: 0.12 })])
    )
    expect(selfSnapshot.stats.critRate).toBeCloseTo(selfBaseline.stats.critRate)
    expect(selfSnapshot.result.expectedDamage).toBeCloseTo(selfBaseline.result.expectedDamage)
    expect(selfSnapshot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
  })
})
