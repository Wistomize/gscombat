import Type from "typebox"

import { CharacterBuildSchema } from "./builds.js"
import { MetricEvaluationContextSchema } from "./scenarios.js"

const ScalingStatSchema = Type.Union([
  Type.Literal("attack"),
  Type.Literal("base_attack"),
  Type.Literal("defense"),
  Type.Literal("elementalMastery"),
  Type.Literal("hp")
])

const HealingScalingStatSchema = Type.Union([
  Type.Literal("attack"),
  Type.Literal("defense"),
  Type.Literal("elementalMastery"),
  Type.Literal("hp")
])

const MetricConditionSchema = Type.Union([
  Type.Object({
    kind: Type.Literal("recipient_in_source_area"),
    label: Type.String(),
    satisfied: Type.Boolean()
  }),
  Type.Object({
    comparison: Type.Union([Type.Literal("at_most"), Type.Literal("above")]),
    currentHpFraction: Type.Optional(Type.Number()),
    kind: Type.Literal("recipient_hp_fraction"),
    label: Type.String(),
    satisfied: Type.Boolean(),
    threshold: Type.Number(),
    waived: Type.Boolean()
  }),
  Type.Object({
    actualAscension: Type.Integer(),
    kind: Type.Literal("source_ascension"),
    label: Type.String(),
    minimumAscension: Type.Integer(),
    satisfied: Type.Boolean()
  }),
  Type.Object({
    comparison: Type.Union([Type.Literal("at_most"), Type.Literal("above")]),
    currentHpFraction: Type.Number(),
    kind: Type.Literal("source_hp_fraction"),
    label: Type.String(),
    satisfied: Type.Boolean(),
    threshold: Type.Number()
  })
])

const MetricFormulaTermSchema = Type.Object({
  kind: Type.Literal("term"),
  label: Type.String(),
  parameterId: Type.Optional(Type.String()),
  role: Type.Union([
    Type.Literal("constant"),
    Type.Literal("recipient_modifier"),
    Type.Literal("recipient_state"),
    Type.Literal("source_constellation"),
    Type.Literal("source_action_snapshot"),
    Type.Literal("source_modifier"),
    Type.Literal("source_stat"),
    Type.Literal("source_talent_parameter")
  ]),
  stat: Type.Optional(ScalingStatSchema),
  talentLevel: Type.Optional(Type.Integer()),
  value: Type.Number()
})

const FriendlyRecipientSchema = Type.Object({
  buildId: Type.String({ minLength: 1, maxLength: 100 }),
  characterId: Type.String({ minLength: 1, maxLength: 100 }),
  kind: Type.Literal("friendly_recipient")
})

/** The evaluated non-damage result returned by the support-metric endpoint. */
export const SupportMetricResultSchema = Type.Cyclic(
  {
    formula: Type.Union([
      MetricFormulaTermSchema,
      Type.Object({
        kind: Type.Literal("add"),
        label: Type.String(),
        operands: Type.Array(Type.Ref("formula")),
        value: Type.Number()
      }),
      Type.Object({
        kind: Type.Literal("multiply"),
        label: Type.String(),
        operands: Type.Array(Type.Ref("formula")),
        value: Type.Number()
      }),
      Type.Object({
        kind: Type.Literal("minimum"),
        label: Type.String(),
        operands: Type.Array(Type.Ref("formula"), { maxItems: 2, minItems: 2 }),
        value: Type.Number()
      }),
      Type.Object({
        kind: Type.Literal("maximum"),
        label: Type.String(),
        operands: Type.Array(Type.Ref("formula"), { maxItems: 2, minItems: 2 }),
        value: Type.Number()
      }),
      Type.Object({
        condition: MetricConditionSchema,
        kind: Type.Literal("condition"),
        operand: Type.Ref("formula"),
        satisfied: Type.Boolean(),
        value: Type.Number()
      })
    ]),
    result: Type.Union([
      Type.Object({
        conditions: Type.Array(MetricConditionSchema),
        formula: Type.Ref("formula"),
        id: Type.String({ minLength: 1, maxLength: 120 }),
        label: Type.String({ minLength: 1, maxLength: 160 }),
        potentialValue: Type.Number(),
        sourceActionId: Type.String({ minLength: 1, maxLength: 120 }),
        value: Type.Number(),
        actualRestoredFormula: Type.Optional(Type.Ref("formula")),
        actualRestoredValue: Type.Optional(Type.Number()),
        flatAmount: Type.Number(),
        healingBonus: Type.Number(),
        incomingHealingBonus: Type.Number(),
        kind: Type.Literal("healing"),
        missingHp: Type.Optional(Type.Number({ minimum: 0 })),
        percentage: Type.Number(),
        recipient: FriendlyRecipientSchema,
        scalingStat: HealingScalingStatSchema,
        scalingValue: Type.Number(),
        sourceValue: Type.Number(),
        talentLevel: Type.Integer({ minimum: 1, maximum: 15 }),
        unit: Type.Literal("hp")
      }),
      Type.Object({
        conditions: Type.Array(MetricConditionSchema),
        formula: Type.Ref("formula"),
        id: Type.String({ minLength: 1, maxLength: 120 }),
        label: Type.String({ minLength: 1, maxLength: 160 }),
        potentialValue: Type.Number(),
        sourceActionId: Type.String({ minLength: 1, maxLength: 120 }),
        value: Type.Number(),
        affectedElement: Type.Optional(
          Type.Union([
            Type.Literal("anemo"),
            Type.Literal("cryo"),
            Type.Literal("dendro"),
            Type.Literal("electro"),
            Type.Literal("geo"),
            Type.Literal("hydro"),
            Type.Literal("pyro")
          ])
        ),
        appliesTo: Type.Optional(
          Type.Array(
            Type.Union([
              Type.Literal("normal"),
              Type.Literal("charged"),
              Type.Literal("plunge"),
              Type.Literal("skill"),
              Type.Literal("burst")
            ])
          )
        ),
        flatAmount: Type.Number(),
        kind: Type.Literal("scalar"),
        maximumValue: Type.Optional(Type.Number()),
        ratio: Type.Number(),
        scalingStat: Type.Optional(ScalingStatSchema),
        scalingValue: Type.Optional(Type.Number()),
        semantic: Type.Union([
          Type.Literal("attack_buff"),
          Type.Literal("attack_speed_bonus"),
          Type.Literal("bloom_related_reaction_damage_bonus"),
          Type.Literal("bloom_related_reaction_flat_damage_addition"),
          Type.Literal("damage_bonus"),
          Type.Literal("defense_buff"),
          Type.Literal("elemental_flat_damage_bonus"),
          Type.Literal("elemental_normal_attack_damage_bonus"),
          Type.Literal("elemental_mastery_buff"),
          Type.Literal("geo_damage_flat_bonus"),
          Type.Literal("lunar_bloom_flat_damage_bonus"),
          Type.Literal("lunar_crystallize_base_damage_bonus"),
          Type.Literal("lunar_crystallize_flat_damage_bonus"),
          Type.Literal("normal_attack_flat_damage_bonus"),
          Type.Literal("normal_and_charged_attack_damage_bonus"),
          Type.Literal("resistance_reduction"),
          Type.Literal("shield"),
          Type.Literal("trigger_probability")
        ]),
        target: Type.Union([
          Type.Object({ kind: Type.Literal("enemy") }),
          FriendlyRecipientSchema,
          Type.Object({ characterId: Type.String({ minLength: 1, maxLength: 100 }), kind: Type.Literal("self") })
        ]),
        uncappedValue: Type.Number(),
        unit: Type.Union([
          Type.Literal("attack"),
          Type.Literal("damage"),
          Type.Literal("defense"),
          Type.Literal("elemental_mastery"),
          Type.Literal("hp"),
          Type.Literal("ratio")
        ])
      }),
      Type.Object({
        conditions: Type.Array(MetricConditionSchema),
        formula: Type.Ref("formula"),
        id: Type.String({ minLength: 1, maxLength: 120 }),
        label: Type.String({ minLength: 1, maxLength: 160 }),
        potentialValue: Type.Number(),
        sourceActionId: Type.String({ minLength: 1, maxLength: 120 }),
        value: Type.Number(),
        affectedStat: Type.Literal("attack_flat"),
        kind: Type.Literal("stat_buff"),
        ratio: Type.Number(),
        ratioConstellationBonus: Type.Number(),
        recipient: FriendlyRecipientSchema,
        scalingStat: ScalingStatSchema,
        scalingValue: Type.Number(),
        talentLevel: Type.Integer({ minimum: 1, maximum: 15 }),
        unit: Type.Literal("attack")
      })
    ])
  },
  "result"
)

export type SupportMetricResult = Type.Static<typeof SupportMetricResultSchema>
export type SupportMetricFormula = SupportMetricResult["formula"]

/** Request body for evaluating one verified healing, stat-buff, or scalar character metric. */
export const SupportMetricEvaluationRequestSchema = Type.Object(
  {
    build: CharacterBuildSchema,
    context: Type.Optional(MetricEvaluationContextSchema),
    metricId: Type.String({ minLength: 1, maxLength: 120 })
  },
  { additionalProperties: false }
)

export type SupportMetricEvaluationRequest = Type.Static<typeof SupportMetricEvaluationRequestSchema>

/** Response returned by the support-metric endpoint with its formula tree and evaluated conditions. */
export const SupportMetricEvaluationResponseSchema = Type.Object({
  engineVersion: Type.String({ minLength: 1, maxLength: 40 }),
  metric: SupportMetricResultSchema
})

export type SupportMetricEvaluationResponse = Type.Static<typeof SupportMetricEvaluationResponseSchema>
