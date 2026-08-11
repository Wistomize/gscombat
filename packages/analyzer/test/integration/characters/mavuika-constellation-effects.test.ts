import { xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateScenario } from "../../../src/scenario/evaluate.js"

const actionId = "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize"
const c2BaseAttackEffectId = "mavuika.constellation.2.the-ashen-price.nightsoul-blessing.base-attack"
const c2SunfellSliceEffectId = "mavuika.constellation.2.the-ashen-price.flamestrider.sunfell-slice.base-damage"
const c4DamageBonusEffectId = "mavuika.constellation.4.the-leaders-resolve.kiongozi.damage-bonus"
const c6DefenseReductionEffectId =
  "mavuika.constellation.6.humanitys-name-unfettered.flamestrider.ring.enemy-defense-reduction"
const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

function createMavuikaBuild(constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({
      ...artifact,
      setId: "TestNoArtifactSet"
    })),
    buildId: `test.mavuika.c${constellation}`,
    characterId: "Mavuika",
    constellation,
    label: `玛薇卡 C${constellation} 命座集成测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
  }
}

function createScenario(constellation: number): EvaluationScenario {
  return {
    conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
    enemy: { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 },
    externalBuffs: [],
    gameDataVersion: "6.7",
    primary: createMavuikaBuild(constellation),
    targetActionId: actionId,
    teammates: []
  }
}

describe("Mavuika constellation effects", () => {
  it("applies C2 as true base Attack plus the Sunfell Slice Attack term, and inherits both at C6", () => {
    const c0 = evaluateScenario(createScenario(0), gameData)
    const c2 = evaluateScenario(createScenario(2), gameData)
    const c6 = evaluateScenario(createScenario(6), gameData)

    expect(c2.stats.baseAttack - c0.stats.baseAttack).toBeCloseTo(200)
    expect(c2.stats.effectiveAttack - c0.stats.effectiveAttack).toBeCloseTo(200 * (1 + c2.stats.attackPercent))
    expect(c2.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: c2BaseAttackEffectId, target: "baseAttackFlat", value: 200 }),
        expect.objectContaining({ id: c2SunfellSliceEffectId, target: "matchedActionAdditiveDamageTerm", value: 1.2 })
      ])
    )
    expect(c2.rotation.events[0]?.trace).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "scaling_terms",
          terms: expect.arrayContaining([
            expect.objectContaining({ coefficient: 1.2, label: expect.stringContaining("C2") })
          ])
        })
      ])
    )
    expect(c2.actionExpectedDamage).toBeGreaterThan(c0.actionExpectedDamage)
    expect(c6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: c2BaseAttackEffectId }),
        expect.objectContaining({ id: c2SunfellSliceEffectId })
      ])
    )
  })

  it("keeps C3 and C5 talent levels scoped, applies C4's extra 10%, and applies C6 Ring Defense reduction", () => {
    const c2 = evaluateScenario(createScenario(2), gameData)
    const c3 = evaluateScenario(createScenario(3), gameData)
    const c4 = evaluateScenario(createScenario(4), gameData)
    const c5 = evaluateScenario(createScenario(5), gameData)
    const c6 = evaluateScenario(createScenario(6), gameData)

    expect(c3.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ target: "talentLevel", value: 3 })])
    )
    expect(c3.actionExpectedDamage).toBeGreaterThan(c2.actionExpectedDamage)
    expect(c4.stats.damageBonus - c3.stats.damageBonus).toBeCloseTo(0.1)
    expect(c4.appliedEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: c4DamageBonusEffectId, target: "damageBonus", value: 0.1 })])
    )
    expect(c5.actionExpectedDamage).toBeCloseTo(c4.actionExpectedDamage)
    expect(c6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: c6DefenseReductionEffectId, target: "enemyDefenseReduction", value: 0.2 })
      ])
    )
    expect(c6.actionExpectedDamage).toBeGreaterThan(c5.actionExpectedDamage)
    expect(c6.rotation.events).toHaveLength(c5.rotation.events.length)
  })
})
