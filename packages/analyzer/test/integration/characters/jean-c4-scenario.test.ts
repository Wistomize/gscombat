import { getCombatActionDefinition, xianglingNationalBuiltinBuild, type CombatActionMetadata } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const effectId = "jean.constellation.4.lands_of_dandelion.anemo_resistance_shred"

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createJeanBuild(constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({
      ...artifact,
      setId: "TestNoArtifactSet"
    })),
    buildId: `test.jean.c${constellation}`,
    characterId: "Jean",
    constellation,
    label: `琴 C${constellation} 测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
  }
}

function createVentiBuild(): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({
      ...artifact,
      setId: "TestNoArtifactSet"
    })),
    buildId: "test.venti.jean-c4-recipient",
    characterId: "Venti",
    constellation: 0,
    label: "温迪 琴 C4 测试受益配置",
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "TheStringless" }
  }
}

describe("Jean C4 current-action snapshot", () => {
  it("lets a C6 Jean field snapshot reduce Anemo resistance for a teammate's real damage calculation only", () => {
    const jean = createJeanBuild(6)
    const venti = createVentiBuild()
    const anemoAction = requireAction("venti.skill.skyward_sonnet.press")
    const physicalAction = requireAction("xiangling.normal.auto.first_hit")
    const anemoBaseline = evaluateDeclaredDirectScenarioAction({
      action: anemoAction,
      build: venti,
      buffs: [],
      enemy,
      gameData,
      teammates: [jean]
    })
    const anemoSnapshot = evaluateDeclaredDirectScenarioAction({
      action: anemoAction,
      activeEffectIds: [effectId],
      build: venti,
      buffs: [],
      enemy,
      gameData,
      teammates: [jean]
    })
    const physicalBaseline = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [jean]
    })
    const physicalSnapshot = evaluateDeclaredDirectScenarioAction({
      action: physicalAction,
      activeEffectIds: [effectId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [jean]
    })

    expect(anemoSnapshot.stats.resistanceReduction).toBeCloseTo(anemoBaseline.stats.resistanceReduction + 0.4)
    expect(anemoSnapshot.result.expectedDamage).toBeGreaterThan(anemoBaseline.result.expectedDamage)
    expect(anemoSnapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: effectId,
          sourceId: jean.buildId,
          target: "enemyResistanceReduction",
          value: 0.4
        })
      ])
    )
    expect(physicalSnapshot.stats.resistanceReduction).toBeCloseTo(physicalBaseline.stats.resistanceReduction)
    expect(physicalSnapshot.appliedEffects.find((effect) => effect.id === effectId)).toBeUndefined()
  })

  it("requires a Jean C4 or higher source", () => {
    const anemoAction = requireAction("venti.skill.skyward_sonnet.press")

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: anemoAction,
        activeEffectIds: [effectId],
        build: createVentiBuild(),
        buffs: [],
        enemy,
        gameData,
        teammates: [createJeanBuild(3)]
      })
    ).toThrow("requires Jean constellation 4")
  })
})
