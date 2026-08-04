import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "./app.js"

const app = buildApp()

function createBuild(characterId: string, buildId: string): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId,
    characterId,
    constellation: 0,
    label: `${characterId} 月绽放 API 集成配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
  }
}

interface LunarBloomEvaluation {
  readonly appliedEffects: readonly {
    readonly id: string
    readonly sourceId: string
    readonly target: string
    readonly value: number
  }[]
  readonly result: { readonly expectedDamage: number }
  readonly rotation: {
    readonly events: readonly {
      readonly trace: readonly {
        readonly formula: {
          readonly bonus?: number
          readonly flatDamageAddition?: number
          readonly kind: string
        }
        readonly kind: string
        readonly stage: string
      }[]
    }[]
  }
}

afterAll(async () => app.close())

describe("Lunar-Bloom effects API integration", () => {
  it("places Lauma's Pale Hymn in the additive base-damage stage without leaking it into the reaction-bonus stage", async () => {
    const nefer = createBuild("Nefer", "api.lunar-bloom.nefer")
    const lauma = createBuild("Lauma", "api.lunar-bloom.lauma")
    const response = await app.inject({
      method: "POST",
      payload: {
        ...raidenNationalBuiltinScenario,
        conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
        externalBuffs: [],
        primary: nefer,
        targetActionId: "nefer.skill.senet_strategy.phantom_performance.second_hit",
        teammates: [lauma]
      },
      url: "/v1/analysis"
    })

    expect(response.statusCode, response.body).toBe(200)
    const evaluation = response.json().evaluation as LunarBloomEvaluation
    const paleHymn = evaluation.appliedEffects.find(
      (effect) => effect.id === "lauma.burst.pale_hymn.lunar_bloom_flat_damage_addition"
    )
    const lunarEvents = evaluation.rotation.events.filter((event) =>
      event.trace.some((entry) => entry.kind === "special_reaction")
    )
    const ordinaryEvents = evaluation.rotation.events.filter((event) =>
      event.trace.some((entry) => entry.kind !== "special_reaction")
    )

    expect(paleHymn).toMatchObject({
      sourceId: lauma.buildId,
      target: "specialReactionFlatDamageAddition"
    })
    if (!paleHymn) throw new Error("Expected Lauma's Lunar-Bloom Pale Hymn contribution")
    expect(lunarEvents).toHaveLength(3)
    expect(ordinaryEvents).toHaveLength(2)
    for (const event of lunarEvents) {
      const additiveBaseDamage = event.trace.find(
        (entry) => entry.formula.kind === "special_reaction_flat_damage_addition"
      )
      const reactionBonus = event.trace.find(
        (entry) => entry.formula.kind === "special_reaction_damage_bonus"
      )

      expect(additiveBaseDamage?.formula.flatDamageAddition).toBeCloseTo(paleHymn.value)
      expect(reactionBonus?.formula.bonus ?? 0).toBeLessThan(5)
      expect(event.trace.some((entry) => entry.kind === "damage_bonus" || entry.kind === "defense")).toBe(false)
    }
    for (const event of ordinaryEvents) {
      expect(event.trace.some((entry) => entry.kind === "damage_bonus")).toBe(true)
      expect(event.trace.some((entry) => entry.kind === "defense")).toBe(true)
    }
    expect(evaluation.result.expectedDamage).toBeGreaterThan(10_000)
    expect(evaluation.result.expectedDamage).toBeLessThan(300_000)
  })
})
