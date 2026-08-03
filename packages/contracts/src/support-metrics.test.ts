import { Value } from "typebox/value"
import { describe, expect, it } from "vitest"

import {
  SupportMetricEvaluationRequestSchema,
  SupportMetricEvaluationResponseSchema
} from "./support-metrics.js"

describe("SupportMetricEvaluationRequestSchema", () => {
  it("accepts a support metric source build and an explicit friendly recipient context", () => {
    expect(
      Value.Check(SupportMetricEvaluationRequestSchema, {
        build: {
          artifacts: [
            { id: "flower", level: 20, mainStat: { stat: "hp", value: 4780 }, rarity: 5, setId: "NoblesseOblige", slot: "flower", substats: [] },
            { id: "plume", level: 20, mainStat: { stat: "atk", value: 311 }, rarity: 5, setId: "NoblesseOblige", slot: "plume", substats: [] },
            { id: "sands", level: 20, mainStat: { stat: "hp_percent", value: 0.466 }, rarity: 5, setId: "NoblesseOblige", slot: "sands", substats: [] },
            { id: "goblet", level: 20, mainStat: { stat: "hp_percent", value: 0.466 }, rarity: 5, setId: "NoblesseOblige", slot: "goblet", substats: [] },
            { id: "circlet", level: 20, mainStat: { stat: "healing_bonus", value: 0.359 }, rarity: 5, setId: "NoblesseOblige", slot: "circlet", substats: [] }
          ],
          ascension: 6,
          buildId: "test.bennett",
          characterId: "Bennett",
          constellation: 1,
          gameDataVersion: "6.7",
          label: "班尼特测试配置",
          level: 90,
          source: { kind: "local" },
          talents: { burst: 10, normal: 6, skill: 6 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
        },
        context: {
          recipient: {
            buildId: "test.raiden",
            currentHpFraction: 0.5,
            isWithinSourceArea: true
          },
          teammates: []
        },
        metricId: "bennett.burst.field.heal_tick"
      })
    ).toBe(true)
  })
})

describe("SupportMetricEvaluationResponseSchema", () => {
  it("accepts a nested formula tree for a healing metric", () => {
    expect(
      Value.Check(SupportMetricEvaluationResponseSchema, {
        engineVersion: "support-metric-1",
        metric: {
          conditions: [{ kind: "recipient_in_source_area", label: "领域内", satisfied: true }],
          flatAmount: 1270.2417,
          formula: {
            condition: { kind: "recipient_in_source_area", label: "领域内", satisfied: true },
            kind: "condition",
            operand: {
              kind: "multiply",
              label: "治疗公式",
              operands: [
                { kind: "term", label: "生命值", role: "source_stat", stat: "hp", value: 20_000 },
                { kind: "term", label: "治疗倍率", role: "source_talent_parameter", talentLevel: 10, value: 0.108 }
              ],
              value: 2160
            },
            satisfied: true,
            value: 2160
          },
          healingBonus: 0,
          id: "bennett.burst.field.heal_tick",
          incomingHealingBonus: 0,
          kind: "healing",
          label: "美妙旅程 / 单跳治疗量",
          percentage: 0.108,
          potentialValue: 2160,
          recipient: { buildId: "test.raiden", characterId: "RaidenShogun", kind: "friendly_recipient" },
          scalingStat: "hp",
          scalingValue: 20_000,
          sourceActionId: "bennett.burst.field",
          sourceValue: 2160,
          talentLevel: 10,
          unit: "hp",
          value: 2160
        }
      })
    ).toBe(true)
  })
})
