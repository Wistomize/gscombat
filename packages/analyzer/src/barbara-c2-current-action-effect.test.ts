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

function createCatalystBuild(characterId: "Barbara" | "Mona", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 当前动作效果测试配置`,
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "MagicGuide" }
  }
}

describe("Barbara C2 current-action effect", () => {
  it("applies its explicit snapshot to a teammate's Hydro action, rejects C0, and inherits at C6", () => {
    const effectId = "barbara.let_the_show_begin.c2.current_character.hydro_damage_bonus"
    const hydroAction = requireAction("mona.normal.auto.first_hit")
    const nonHydroAction = requireAction("xiangling.normal.auto.first_hit")
    const mona = createCatalystBuild("Mona", "test.mona.barbara-c2-recipient", 0)
    const barbaraC0 = createCatalystBuild("Barbara", "test.barbara.c0", 0)
    const barbaraC2 = createCatalystBuild("Barbara", "test.barbara.c2", 2)
    const barbaraC6 = createCatalystBuild("Barbara", "test.barbara.c6", 6)
    const baseline = evaluateDeclaredDirectScenarioAction({
      action: hydroAction,
      build: mona,
      buffs: [],
      enemy,
      gameData,
      teammates: [barbaraC2]
    })
    const c2Snapshot = evaluateDeclaredDirectScenarioAction({
      action: hydroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: barbaraC2.buildId },
      build: mona,
      buffs: [],
      enemy,
      gameData,
      teammates: [barbaraC2]
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: hydroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: barbaraC6.buildId },
      build: mona,
      buffs: [],
      enemy,
      gameData,
      teammates: [barbaraC6]
    })
    const nonHydroBaseline = evaluateDeclaredDirectScenarioAction({
      action: nonHydroAction,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [barbaraC2]
    })
    const nonHydroSnapshot = evaluateDeclaredDirectScenarioAction({
      action: nonHydroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: barbaraC2.buildId },
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [barbaraC2]
    })

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: hydroAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: barbaraC0.buildId },
        build: mona,
        buffs: [],
        enemy,
        gameData,
        teammates: [barbaraC0]
      })
    ).toThrow(`Active effect ${effectId} requires Barbara constellation 2`)

    expect(c2Snapshot.stats.damageBonus - baseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(c2Snapshot.result.expectedDamage).toBeCloseTo(
      baseline.result.expectedDamage * (1 + c2Snapshot.stats.damageBonus) / (1 + baseline.stats.damageBonus)
    )
    expect(c2Snapshot.appliedEffects).toEqual([
      expect.objectContaining({
        id: effectId,
        sourceId: barbaraC2.buildId,
        target: "damageBonus",
        value: 0.15
      })
    ])
    expect(c6Snapshot.stats.damageBonus - baseline.stats.damageBonus).toBeCloseTo(0.15)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: barbaraC6.buildId, value: 0.15 })])
    )
    expect(nonHydroSnapshot.stats.damageBonus).toBeCloseTo(nonHydroBaseline.stats.damageBonus)
    expect(nonHydroSnapshot.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId })])
    )
  })
})
