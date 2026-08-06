import { getCombatActionDefinition, xianglingNationalBuiltinBuild, type CombatActionMetadata } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const effectId = "kirara.constellation.6.countless_sights_to_see.party_elemental_damage_bonus"

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createKiraraBuild(constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({
      ...artifact,
      setId: "TestNoArtifactSet"
    })),
    buildId: `test.kirara.c${constellation}`,
    characterId: "Kirara",
    constellation,
    label: `绮良良 C${constellation} 测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
  }
}

describe("Kirara C6 current-action snapshot", () => {
  it("adds 12% elemental damage to a teammate while excluding physical damage", () => {
    const kirara = createKiraraBuild(6)
    const pyroAction = requireAction("xiangling.skill.guoba.single_flame_breath")
    const physicalAction = requireAction("xiangling.normal.auto.first_hit")
    const elementalBaseline = evaluateDeclaredDirectScenarioAction({
      action: pyroAction,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [kirara]
    })
    const elementalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: pyroAction,
      activeEffectIds: [effectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [kirara]
    })
    const physicalBaseline = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [kirara]
    })
    const physicalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      activeEffectIds: [effectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [kirara]
    })

    expect(elementalSnapshot.stats.damageBonus).toBeCloseTo(elementalBaseline.stats.damageBonus + 0.12)
    expect(elementalSnapshot.result.expectedDamage).toBeGreaterThan(elementalBaseline.result.expectedDamage)
    expect(elementalSnapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: kirara.buildId, target: "damageBonus", value: 0.12 })
      ])
    )
    expect(physicalSnapshot.stats.damageBonus).toBeCloseTo(physicalBaseline.stats.damageBonus)
    expect(physicalSnapshot.appliedEffects.find((effect) => effect.id === effectId)).toBeUndefined()
  })

  it("also benefits Kirara herself and requires C6", () => {
    const kirara = createKiraraBuild(6)
    const kiraraAction = requireAction("kirara.skill.meow_teorite_kick.tail_swipe")
    const baseline = evaluateDeclaredDirectScenarioAction({ action: kiraraAction, build: kirara, buffs: [], enemy, gameData })
    const snapshot = evaluateDeclaredDirectScenarioAction({
      action: kiraraAction,
      activeEffectIds: [effectId],
      build: kirara,
      buffs: [],
      enemy,
      gameData
    })
    const teammateAction = requireAction("xiangling.skill.guoba.single_flame_breath")

    expect(snapshot.stats.damageBonus).toBeCloseTo(baseline.stats.damageBonus + 0.12)
    expect(snapshot.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: kirara.buildId, value: 0.12 })])
    )
    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: teammateAction,
        activeEffectIds: [effectId],
        build: xianglingNationalBuiltinBuild,
        buffs: [],
        enemy,
        gameData,
        teammates: [createKiraraBuild(5)]
      })
    ).toThrow("requires Kirara constellation 6")
  })
})
