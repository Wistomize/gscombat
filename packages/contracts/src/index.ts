import Type from "typebox"

export const PresetIdSchema = Type.Literal("raiden-national.initial-slash")

export const EvaluationRequestSchema = Type.Object({
  additionalAttackPercent: Type.Optional(Type.Number({ minimum: 0 })),
  presetId: PresetIdSchema
})

export type EvaluationRequest = Type.Static<typeof EvaluationRequestSchema>

export const TraceEntrySchema = Type.Object({
  after: Type.Number(),
  before: Type.Number(),
  source: Type.String(),
  stage: Type.Union([
    Type.Literal("attack"),
    Type.Literal("talent"),
    Type.Literal("damage_bonus"),
    Type.Literal("crit"),
    Type.Literal("defense"),
    Type.Literal("resistance")
  ])
})

export const EvaluationResponseSchema = Type.Object({
  contentVersion: Type.String(),
  engineVersion: Type.String(),
  presetVersion: Type.String(),
  result: Type.Object({
    critDamage: Type.Number(),
    expectedDamage: Type.Number(),
    nonCritDamage: Type.Number(),
    trace: Type.Array(TraceEntrySchema)
  })
})

export type EvaluationResponse = Type.Static<typeof EvaluationResponseSchema>

export const HealthResponseSchema = Type.Object({
  status: Type.Literal("ok")
})

export type HealthResponse = Type.Static<typeof HealthResponseSchema>
