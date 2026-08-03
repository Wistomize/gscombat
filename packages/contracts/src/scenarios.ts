import Type from "typebox"

import { CharacterBuildSchema } from "./builds.js"

export const ExternalBuffStatSchema = Type.Union([
  Type.Literal("attack_flat"),
  Type.Literal("attack_percent"),
  Type.Literal("defense_flat"),
  Type.Literal("defense_percent"),
  Type.Literal("crit_rate"),
  Type.Literal("crit_damage"),
  Type.Literal("damage_bonus"),
  Type.Literal("elemental_mastery"),
  Type.Literal("energy_recharge"),
  Type.Literal("enemy_resistance_reduction"),
  Type.Literal("hp_flat"),
  Type.Literal("hp_percent"),
  Type.Literal("special_reaction_damage_bonus")
])

export type ExternalBuffStat = Type.Static<typeof ExternalBuffStatSchema>

export const ExternalBuffSchema = Type.Object({
  label: Type.String({ minLength: 1, maxLength: 80 }),
  sourceId: Type.String({ minLength: 1, maxLength: 100 }),
  stat: ExternalBuffStatSchema,
  value: Type.Number()
})

export type ExternalBuff = Type.Static<typeof ExternalBuffSchema>

export const EnemyConfigSchema = Type.Object({
  defenseReduction: Type.Number({ maximum: 1, minimum: 0 }),
  level: Type.Integer({ maximum: 200, minimum: 1 }),
  name: Type.String({ minLength: 1, maxLength: 80 }),
  resistance: Type.Number({ maximum: 1.5, minimum: -1 })
})

export type EnemyConfig = Type.Static<typeof EnemyConfigSchema>

const TargetAuraElementSchema = Type.Union([
  Type.Literal("cryo"),
  Type.Literal("hydro"),
  Type.Literal("pyro"),
  Type.Literal("quicken")
])

const TargetAuraWindowSchema = Type.Object({
  element: TargetAuraElementSchema,
  end: Type.Number({ minimum: 0 }),
  id: Type.String({ minLength: 1, maxLength: 100 }),
  start: Type.Number({ minimum: 0 })
})

const ActionParameterValuesSchema = Type.Record(
  Type.String({ minLength: 1, maxLength: 80 }),
  Type.Integer({ maximum: 100000, minimum: -100000 }),
  { maxProperties: 20 }
)

const ActiveEffectSourceBuildIdsSchema = Type.Record(
  Type.String({ minLength: 1, maxLength: 100 }),
  Type.String({ minLength: 1, maxLength: 100 }),
  { maxProperties: 40 }
)

export const ScenarioConditionsSchema = Type.Object({
  activeEffectIds: Type.Array(Type.String({ minLength: 1, maxLength: 100 }), { maxItems: 40, uniqueItems: true }),
  /** Selects a concrete source build when one active party-owned effect has multiple eligible holders. */
  activeEffectSourceBuildIds: Type.Optional(ActiveEffectSourceBuildIdsSchema),
  /** Bounded manual snapshot input owned and validated by the selected action. */
  actionParameters: Type.Optional(ActionParameterValuesSchema),
  /** Resolves every equipment effect that can reach its strongest valid state for the current action and party. */
  equipmentEffectMode: Type.Optional(Type.Literal("maximum_reachable")),
  enemyCount: Type.Integer({ maximum: 20, minimum: 1 }),
  /** Whether the selected primary is currently protected by a shield for conditional team effects. */
  primaryShielded: Type.Optional(Type.Boolean()),
  /** Whether the target is frozen at the selected hit for conditional team effects. */
  targetFrozen: Type.Optional(Type.Boolean()),
  targetAuraWindows: Type.Optional(Type.Array(TargetAuraWindowSchema, { maxItems: 20 }))
}, { additionalProperties: false })

export type ScenarioConditions = Type.Static<typeof ScenarioConditionsSchema>

/** Runtime state for one friendly recipient selected by a character support metric. */
export const MetricFriendlyRecipientContextSchema = Type.Object({
  buildId: Type.String({ minLength: 1, maxLength: 100 }),
  currentHpFraction: Type.Optional(Type.Number({ maximum: 1, minimum: 0 })),
  incomingHealingBonus: Type.Optional(Type.Number()),
  /** Whether the selected active recipient currently has Moonsign for source-defined target routing. */
  isMoonsign: Type.Optional(Type.Boolean()),
  isWithinSourceArea: Type.Optional(Type.Boolean()),
  /** Exact current HP deficit when the caller wants the actual restored HP rather than only healing capacity. */
  missingHp: Type.Optional(Type.Number({ minimum: 0 }))
}, { additionalProperties: false })

export type MetricFriendlyRecipientContext = Type.Static<typeof MetricFriendlyRecipientContextSchema>

/** Runtime state for the source character when one support metric needs an explicit self condition. */
export const MetricSourceContextSchema = Type.Object({
  currentHpFraction: Type.Optional(Type.Number({ maximum: 1, minimum: 0 })),
  /** Explicit source-action enemy count used only for relevant self-owned equipment passives. */
  enemyCount: Type.Optional(Type.Integer({ maximum: 20, minimum: 1 }))
}, { additionalProperties: false })

export type MetricSourceContext = Type.Static<typeof MetricSourceContextSchema>

/** Team state supplied to a typed character metric without binding it to a main-damage conversion. */
export const MetricEvaluationContextSchema = Type.Object({
  /** Explicit active support-metric snapshots, such as party recipient equipment effects. */
  activeEffectIds: Type.Optional(Type.Array(Type.String({ minLength: 1, maxLength: 100 }), { maxItems: 40, uniqueItems: true })),
  /** Selects a concrete equipped source build when an active metric effect has multiple eligible holders. */
  activeEffectSourceBuildIds: Type.Optional(ActiveEffectSourceBuildIdsSchema),
  /** Bounded manual snapshot input declared by the selected support metric's source action. */
  actionParameters: Type.Optional(ActionParameterValuesSchema),
  recipient: Type.Optional(MetricFriendlyRecipientContextSchema),
  source: Type.Optional(MetricSourceContextSchema),
  teammates: Type.Optional(Type.Array(CharacterBuildSchema, { maxItems: 3 }))
}, { additionalProperties: false })

export type MetricEvaluationContext = Type.Static<typeof MetricEvaluationContextSchema>

export const EvaluationScenarioSchema = Type.Object({
  conditions: ScenarioConditionsSchema,
  enemy: EnemyConfigSchema,
  externalBuffs: Type.Array(ExternalBuffSchema, { maxItems: 30 }),
  gameDataVersion: Type.String({ minLength: 1, maxLength: 20 }),
  primary: CharacterBuildSchema,
  targetActionId: Type.String({ minLength: 1, maxLength: 120 }),
  teammates: Type.Array(CharacterBuildSchema, { maxItems: 3 })
})

export type EvaluationScenario = Type.Static<typeof EvaluationScenarioSchema>

export const DEFAULT_TRAINING_ENEMY: EnemyConfig = {
  defenseReduction: 0,
  level: 100,
  name: "100级 · 全抗10%木桩",
  resistance: 0.1
}
