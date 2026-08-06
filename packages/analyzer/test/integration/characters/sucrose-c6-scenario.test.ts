import { getCombatActionDefinition, xianglingNationalBuiltinBuild, type CombatActionMetadata } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { resolveCombatActionEffects } from "../../../src/effects/action-effects.js"
import { evaluateDeclaredDirectScenarioAction } from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const
const pyroSnapshotId = "sucrose.constellation.6.chaotic_entropy.pyro_damage_bonus"
const hydroSnapshotId = "sucrose.constellation.6.chaotic_entropy.hydro_damage_bonus"

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createSucroseBuild(constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({
      ...artifact,
      setId: "TestNoArtifactSet"
    })),
    buildId: `test.sucrose.c${constellation}`,
    characterId: "Sucrose",
    constellation,
    label: `砂糖 C${constellation} 测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SacrificialFragments" }
  }
}

describe("Sucrose C6 current-action snapshots", () => {
  it("adds the selected absorbed element's 20% damage bonus to a teammate's real damage calculation", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")
    const sucrose = createSucroseBuild(6)
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [sucrose]
    })
    const pyroSnapshot = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [pyroSnapshotId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [sucrose]
    })
    const hydroSnapshot = evaluateDeclaredDirectScenarioAction({
      action,
      activeEffectIds: [hydroSnapshotId],
      build: xianglingNationalBuiltinBuild,
      buffs: [],
      enemy,
      gameData,
      teammates: [sucrose]
    })

    expect(pyroSnapshot.stats.damageBonus).toBeCloseTo(baseline.stats.damageBonus + 0.2)
    expect(pyroSnapshot.result.expectedDamage).toBeGreaterThan(baseline.result.expectedDamage)
    expect(pyroSnapshot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: pyroSnapshotId,
          sourceId: sucrose.buildId,
          target: "damageBonus",
          value: 0.2
        })
      ])
    )
    expect(hydroSnapshot.stats.damageBonus).toBeCloseTo(baseline.stats.damageBonus)
    expect(hydroSnapshot.appliedEffects.find((effect) => effect.id === hydroSnapshotId)).toBeUndefined()
  })

  it("requires a C6 source and prohibits selecting two absorbed-element states", () => {
    const action = requireAction("xiangling.skill.guoba.single_flame_breath")
    const evaluateWithSource = (constellation: number, activeEffectIds: readonly string[]) =>
      evaluateDeclaredDirectScenarioAction({
        action,
        activeEffectIds,
        build: xianglingNationalBuiltinBuild,
        buffs: [],
        enemy,
        gameData,
        teammates: [createSucroseBuild(constellation)]
      })

    expect(() => evaluateWithSource(5, [pyroSnapshotId])).toThrow("requires Sucrose constellation 6")
    expect(() => evaluateWithSource(6, [pyroSnapshotId, hydroSnapshotId])).toThrow(
      "Selected sucrose-chaotic-entropy-c6-absorbed-element effects cannot stack"
    )
  })

  it("allows the C6 source itself to receive the selected elemental snapshot", () => {
    const sucrose = createSucroseBuild(6)
    const selfRecipientAction: CombatActionMetadata = {
      ...requireAction("sucrose.skill.astable_anemohypostasis_creation_6308"),
      element: "pyro",
      id: "test.sucrose.c6.self-pyro-recipient"
    }
    const effects = resolveCombatActionEffects({
      action: selfRecipientAction,
      activeEffectIds: [pyroSnapshotId],
      baseEnergyRecharge: 1,
      enemyCount: 1,
      primary: sucrose,
      teammates: []
    })

    expect(effects.damageBonus).toBeCloseTo(0.2)
    expect(effects.appliedEffects).toEqual([
      expect.objectContaining({ id: pyroSnapshotId, sourceId: sucrose.buildId, value: 0.2 })
    ])
  })
})
