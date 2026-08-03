import Type from "typebox"

import { TraceEntrySchema } from "./analysis.js"

export * from "./analysis.js"
export * from "./builds.js"
export * from "./combat-authoring-audit.js"
export * from "./catalog.js"
export * from "./combat-coverage.js"
export * from "./scenarios.js"
export * from "./support-metrics.js"
export * from "./workspace.js"

export const PresetIdSchema = Type.Literal("raiden-national.initial-slash")

export const EvaluationRequestSchema = Type.Object({
  additionalAttackPercent: Type.Optional(Type.Number({ minimum: 0 })),
  presetId: PresetIdSchema
})

export type EvaluationRequest = Type.Static<typeof EvaluationRequestSchema>

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

export const GameDataStatusResponseSchema = Type.Object({
  counts: Type.Object({
    artifactSets: Type.Integer({ minimum: 0 }),
    characterSkillParameterGroups: Type.Integer({ minimum: 0 }),
    characterSkillParameters: Type.Integer({ minimum: 0 }),
    characters: Type.Integer({ minimum: 0 }),
    weapons: Type.Integer({ minimum: 0 })
  }),
  gameVersion: Type.String(),
  schemaVersion: Type.Integer({ minimum: 1 }),
  upstreamCommit: Type.String()
})

export type GameDataStatusResponse = Type.Static<typeof GameDataStatusResponseSchema>
