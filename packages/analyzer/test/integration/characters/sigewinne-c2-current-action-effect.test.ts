import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const effectId = "sigewinne.constellation.2.can_the_merciful_spirit_defeat_its_foes.hydro_resistance_reduction"

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createBuild(characterId: "Mona" | "Sigewinne", buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId,
    constellation,
    label: `${characterId} C${constellation} 希格雯 C2 当前动作效果测试配置`,
    weapon: {
      ascension: 6,
      level: 90,
      refinement: 1,
      weaponId: characterId === "Mona" ? "MagicGuide" : "FavoniusWarbow"
    }
  }
}

describe("Sigewinne C2 current-action effect", () => {
  it("requires C2, reduces Hydro resistance for self and teammates, and inherits at C6", () => {
    const selfHydroAction = requireAction("sigewinne.burst.super_saturated_syringing.single_spout")
    const teammateHydroAction = requireAction("mona.normal.auto.first_hit")
    const sigewinneC1 = createBuild("Sigewinne", "test.sigewinne.c1", 1)
    const sigewinneC2 = createBuild("Sigewinne", "test.sigewinne.c2", 2)
    const sigewinneC6 = createBuild("Sigewinne", "test.sigewinne.c6", 6)
    const mona = createBuild("Mona", "test.mona.sigewinne-c2-recipient", 0)

    expect(() =>
      evaluateDeclaredDirectScenarioAction({
        action: teammateHydroAction,
        activeEffectIds: [effectId],
        activeEffectSourceBuildIds: { [effectId]: sigewinneC1.buildId },
        build: mona,
        buffs: [],
        enemy,
        gameData,
        teammates: [sigewinneC1]
      })
    ).toThrow(`Active effect ${effectId} requires Sigewinne constellation 2`)

    const teammateBaseline = evaluateDeclaredDirectScenarioAction({
      action: teammateHydroAction,
      build: mona,
      buffs: [],
      enemy,
      gameData,
      teammates: [sigewinneC2]
    })
    const teammateSnapshot = evaluateDeclaredDirectScenarioAction({
      action: teammateHydroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: sigewinneC2.buildId },
      build: mona,
      buffs: [],
      enemy,
      gameData,
      teammates: [sigewinneC2]
    })
    const c6Snapshot = evaluateDeclaredDirectScenarioAction({
      action: teammateHydroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: sigewinneC6.buildId },
      build: mona,
      buffs: [],
      enemy,
      gameData,
      teammates: [sigewinneC6]
    })
    const selfBaseline = evaluateDeclaredDirectScenarioAction({
      action: selfHydroAction,
      build: sigewinneC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const selfSnapshot = evaluateDeclaredDirectScenarioAction({
      action: selfHydroAction,
      activeEffectIds: [effectId],
      activeEffectSourceBuildIds: { [effectId]: sigewinneC2.buildId },
      build: sigewinneC2,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    for (const [baseline, snapshot, sourceId] of [
      [teammateBaseline, teammateSnapshot, sigewinneC2.buildId],
      [selfBaseline, selfSnapshot, sigewinneC2.buildId]
    ] as const) {
      expect(snapshot.stats.resistanceReduction - baseline.stats.resistanceReduction).toBeCloseTo(0.35)
      expect(snapshot.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
      expect(snapshot.appliedEffects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: effectId, sourceId, target: "enemyResistanceReduction", value: 0.35 })
        ])
      )
    }
    expect(c6Snapshot.stats.resistanceReduction - teammateBaseline.stats.resistanceReduction).toBeCloseTo(0.35)
    expect(c6Snapshot.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: effectId, sourceId: sigewinneC6.buildId, value: 0.35 })])
    )
  })
})
