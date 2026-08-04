import { getCombatActionDefinition, raidenNationalBuiltinBuild, type CombatActionMetadata } from "@gscombat/content"
import type { ExternalBuff } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "./declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const trainingEnemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireAction(actionId: string): CombatActionMetadata {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createMixedAction(): CombatActionMetadata {
  const source = requireAction("raiden.skill.transcendence_baleful_omen.initial_hit")
  const part = source.damageParts?.[0]
  if (!part) throw new Error("Raiden's initial hit must provide one declared damage part")
  return {
    ...source,
    id: "test.mixed-direct-lunar-bloom",
    timeline: {
      damageEvents: [
        { at: 0, damagePartId: part.id, id: "ordinary-hit", snapshot: "cast" },
        {
          at: 0.1,
          damagePartId: part.id,
          id: "lunar-bloom-hit",
          snapshot: "hit",
          specialReaction: { kind: "lunar_bloom" }
        }
      ],
      duration: 1
    }
  }
}

describe("mixed ordinary and special-reaction declared actions", () => {
  it("keeps ordinary and lunar events on their independent multiplier pipelines", () => {
    const action = createMixedAction()
    const ordinaryDamageBonus: ExternalBuff = {
      label: "测试普通伤害加成",
      sourceId: "test.ordinary-damage-bonus",
      stat: "damage_bonus",
      value: 1
    }
    const baseline = evaluateDeclaredDirectScenarioAction({
      action,
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy: trainingEnemy,
      gameData
    })
    const withOrdinaryDamageBonus = evaluateDeclaredDirectScenarioAction({
      action,
      build: raidenNationalBuiltinBuild,
      buffs: [ordinaryDamageBonus],
      enemy: trainingEnemy,
      gameData
    })
    const againstLevelOne = evaluateDeclaredDirectScenarioAction({
      action,
      build: raidenNationalBuiltinBuild,
      buffs: [],
      enemy: { ...trainingEnemy, level: 1 },
      gameData
    })
    const baselineOrdinary = baseline.rotation.events.find((event) => event.id.endsWith("ordinary-hit"))
    const baselineLunar = baseline.rotation.events.find((event) => event.id.endsWith("lunar-bloom-hit"))
    const buffedOrdinary = withOrdinaryDamageBonus.rotation.events.find((event) => event.id.endsWith("ordinary-hit"))
    const buffedLunar = withOrdinaryDamageBonus.rotation.events.find((event) => event.id.endsWith("lunar-bloom-hit"))
    const levelOneOrdinary = againstLevelOne.rotation.events.find((event) => event.id.endsWith("ordinary-hit"))
    const levelOneLunar = againstLevelOne.rotation.events.find((event) => event.id.endsWith("lunar-bloom-hit"))

    expect(baseline.rotation.events).toHaveLength(2)
    expect(baseline.result.expectedDamage).toBeCloseTo(baseline.rotation.dpr)
    expect(baselineOrdinary?.trace.map((entry) => entry.kind)).toEqual(
      expect.arrayContaining(["damage_bonus", "defense"])
    )
    expect(baselineLunar?.trace.every((entry) => entry.kind === "special_reaction" || entry.kind === "hit_count")).toBe(true)
    expect(baselineLunar?.trace.some((entry) => entry.kind === "damage_bonus" || entry.kind === "defense")).toBe(false)
    expect(baselineLunar?.trace[0]).toMatchObject({
      formula: {
        kind: "special_reaction_base_damage",
        terms: [expect.objectContaining({ coefficient: expect.any(Number), stat: "attack", value: expect.any(Number) })]
      },
      kind: "special_reaction",
      stage: "base_damage"
    })
    expect(buffedOrdinary?.expectedDamage).toBeGreaterThan(baselineOrdinary?.expectedDamage ?? 0)
    expect(buffedLunar?.expectedDamage).toBeCloseTo(baselineLunar?.expectedDamage ?? 0)
    expect(levelOneOrdinary?.expectedDamage).toBeGreaterThan(baselineOrdinary?.expectedDamage ?? 0)
    expect(levelOneLunar?.expectedDamage).toBeCloseTo(baselineLunar?.expectedDamage ?? 0)
  })
})
