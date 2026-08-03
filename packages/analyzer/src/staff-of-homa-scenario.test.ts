import {
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  type CombatActionMetadata
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { resolveCoreCombatStats } from "./base-stats.js"
import { evaluateDeclaredDirectScenarioAction } from "./declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

const HOMA_HP_PERCENT_ID = "weapon.staff-of-homa.hp-percent"
const HOMA_BASE_CONVERSION_ID = "weapon.staff-of-homa.hp-sourced-flat-attack"
const HOMA_LOW_HP_CONVERSION_ID = "weapon.staff-of-homa.hp-below-50.extra-hp-sourced-flat-attack"

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createHomaBuild(refinement: number): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.hu-tao.staff-of-homa.r${refinement}`,
    characterId: "HuTao",
    constellation: 0,
    label: `胡桃护摩之杖 R${refinement} 测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement, weaponId: "StaffOfHoma" }
  }
}

function evaluateHoma(build: CharacterBuild, activeEffectIds: readonly string[] = []) {
  return evaluateDeclaredDirectScenarioAction({
    action: requireAction("hu_tao.normal.auto.first_hit"),
    activeEffectIds,
    build,
    buffs: [],
    enemy,
    gameData
  })
}

describe("Staff of Homa declared scenarios", () => {
  it("applies its refinement-indexed maximum HP and base final-HP-to-Attack conversion", () => {
    const r1Build = createHomaBuild(1)
    const r5Build = createHomaBuild(5)
    const r1Core = resolveCoreCombatStats(r1Build, gameData)
    const r5Core = resolveCoreCombatStats(r5Build, gameData)
    const r1 = evaluateHoma(r1Build)
    const r5 = evaluateHoma(r5Build)
    const r1FinalHp = r1Core.hp + r1Core.baseHp * 0.2
    const r5FinalHp = r5Core.hp + r5Core.baseHp * 0.4
    const r1BaseConversion = r1FinalHp * 0.008
    const r5BaseConversion = r5FinalHp * 0.016

    expect(r1.stats.flatAttack).toBeCloseTo(r1Core.flatAttack + r1BaseConversion)
    expect(r5.stats.flatAttack).toBeCloseTo(r5Core.flatAttack + r5BaseConversion)
    expect(r1.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: HOMA_HP_PERCENT_ID, target: "hpPercent", value: 0.2 }),
        expect.objectContaining({ id: HOMA_BASE_CONVERSION_ID, target: "flatAttack", value: r1BaseConversion })
      ])
    )
    expect(r5.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: HOMA_HP_PERCENT_ID, target: "hpPercent", value: 0.4 }),
        expect.objectContaining({ id: HOMA_BASE_CONVERSION_ID, target: "flatAttack", value: r5BaseConversion })
      ])
    )
    expect(r5.result.expectedDamage).toBeGreaterThan(r1.result.expectedDamage)
  })

  it("adds the explicit below-50%-HP conversion without replacing Staff of Homa's base conversion", () => {
    const r1Build = createHomaBuild(1)
    const r5Build = createHomaBuild(5)
    const r1Core = resolveCoreCombatStats(r1Build, gameData)
    const r5Core = resolveCoreCombatStats(r5Build, gameData)
    const r1AboveHalf = evaluateHoma(r1Build)
    const r5AboveHalf = evaluateHoma(r5Build)
    const r1BelowHalf = evaluateHoma(r1Build, [HOMA_LOW_HP_CONVERSION_ID])
    const r5BelowHalf = evaluateHoma(r5Build, [HOMA_LOW_HP_CONVERSION_ID])
    const r1FinalHp = r1Core.hp + r1Core.baseHp * 0.2
    const r5FinalHp = r5Core.hp + r5Core.baseHp * 0.4
    const r1ExtraConversion = r1FinalHp * 0.01
    const r5ExtraConversion = r5FinalHp * 0.018

    expect(r1BelowHalf.stats.flatAttack - r1AboveHalf.stats.flatAttack).toBeCloseTo(r1ExtraConversion)
    expect(r5BelowHalf.stats.flatAttack - r5AboveHalf.stats.flatAttack).toBeCloseTo(r5ExtraConversion)
    expect(r1BelowHalf.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: HOMA_BASE_CONVERSION_ID, target: "flatAttack", value: r1FinalHp * 0.008 }),
        expect.objectContaining({ id: HOMA_LOW_HP_CONVERSION_ID, target: "flatAttack", value: r1ExtraConversion })
      ])
    )
    expect(r5BelowHalf.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: HOMA_BASE_CONVERSION_ID, target: "flatAttack", value: r5FinalHp * 0.016 }),
        expect.objectContaining({ id: HOMA_LOW_HP_CONVERSION_ID, target: "flatAttack", value: r5ExtraConversion })
      ])
    )
    expect(r1BelowHalf.result.expectedDamage).toBeGreaterThan(r1AboveHalf.result.expectedDamage)
    expect(r5BelowHalf.result.expectedDamage).toBeGreaterThan(r5AboveHalf.result.expectedDamage)
  })

  it("does not resolve Staff of Homa effects from a teammate's weapon", () => {
    const primary = {
      ...createHomaBuild(1),
      buildId: "test.hu-tao.favonius-lance",
      label: "胡桃西风长枪测试配置",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusLance" }
    }
    const teammate = {
      ...createHomaBuild(1),
      buildId: "test.xiangling.staff-of-homa",
      characterId: "Xiangling",
      label: "香菱护摩之杖测试配置"
    }
    const baseline = evaluateHoma(primary)
    const teammateHoma = evaluateDeclaredDirectScenarioAction({
      action: requireAction("hu_tao.normal.auto.first_hit"),
      build: primary,
      buffs: [],
      enemy,
      gameData,
      teammates: [teammate]
    })
    const homaEffects = teammateHoma.appliedEffects.filter((effect) => effect.id.startsWith("weapon.staff-of-homa."))

    expect(homaEffects).toEqual([])
    expect(teammateHoma.stats.flatAttack).toBeCloseTo(baseline.stats.flatAttack)
    expect(teammateHoma.stats.effectiveAttack).toBeCloseTo(baseline.stats.effectiveAttack)
    expect(teammateHoma.result.expectedDamage).toBeCloseTo(baseline.result.expectedDamage)
  })
})
