import Type from "typebox"
import { ArtifactSlotSchema } from "./builds.js"
import { AnalysisRequestSchema, AnalysisResponseSchema, WeaponComparisonResultSchema } from "./analysis.js"

export const EquipmentChoicesSchema = Type.Record(Type.String({ minLength: 1, maxLength: 180 }), Type.String({ maxLength: 180 }))
export const DeferredComparisonRequestSchema = Type.Object({
  scenario: AnalysisRequestSchema,
  computationId: Type.Optional(Type.String({ minLength: 1, maxLength: 100 }))
})
export const ArtifactComparisonRequestSchema = Type.Object({
  ...DeferredComparisonRequestSchema.properties,
  choices: Type.Optional(Type.Record(Type.String({ minLength: 1, maxLength: 180 }), EquipmentChoicesSchema)),
  candidateId: Type.Optional(Type.String({ minLength: 1, maxLength: 180 })),
  selectedCandidateId: Type.Optional(Type.String({ minLength: 1, maxLength: 180 }))
})
export const ArtifactCandidateComparisonRequestSchema = Type.Object({
  ...ArtifactComparisonRequestSchema.properties,
  candidateId: Type.String({ minLength: 1, maxLength: 180 })
})
export const CoreAnalysisResponseSchema = Type.Object({
  ...AnalysisResponseSchema.properties, computationId: Type.String()
})
export const DeferredWeaponResponseSchema = Type.Object({
  computationId: Type.String(), baselineExpectedDamage: Type.Number(),
  weapons: Type.Array(WeaponComparisonResultSchema)
})
export const ArtifactComparisonResultSchema = Type.Object({
  fourStarSlots: Type.Optional(Type.Array(ArtifactSlotSchema, { maxItems: 4, uniqueItems: true })),
  critConversions: Type.Array(Type.Object({ eventId: Type.String(), ownerId: Type.String(),
    critRateConverted: Type.Number({ minimum: 0 }), critDamageAdded: Type.Number({ minimum: 0 }) })),
  id: Type.String(), label: Type.String(), kind: Type.Union([Type.Literal("four_piece"), Type.Literal("two_plus_two")]),
  counts: Type.Record(Type.String(), Type.Integer()), combinations: Type.Array(Type.Array(Type.String())),
  theoretical: Type.Boolean(), expectedDamage: Type.Number(), deltaDamage: Type.Number(),
  gainRatio: Type.Union([Type.Number(), Type.Null()]), choices: EquipmentChoicesSchema,
  choiceGroups: Type.Array(Type.Object({ id: Type.String(), label: Type.String(),
    options: Type.Array(Type.Object({ value: Type.String(), label: Type.String() })) }))
})
export const ArtifactComparisonResponseSchema = Type.Object({
  computationId: Type.String(), baselineExpectedDamage: Type.Number(), candidateCount: Type.Integer(),
  complete: Type.Boolean(), results: Type.Array(ArtifactComparisonResultSchema),
  selectableFourPieceCandidates: Type.Array(Type.Object({ id: Type.String(), label: Type.String() })),
  selectedCandidate: Type.Optional(ArtifactComparisonResultSchema),
  failures: Type.Array(Type.Object({ candidateId: Type.String(), message: Type.String() })),
  excludedSets: Type.Array(Type.Object({ setId: Type.String(), label: Type.String(), reason: Type.String() })),
  changedCandidateVisible: Type.Optional(Type.Boolean())
})
export type CoreAnalysisResponse = Type.Static<typeof CoreAnalysisResponseSchema>
export type DeferredComparisonRequest = Type.Static<typeof DeferredComparisonRequestSchema>
export type ArtifactComparisonRequest = Type.Static<typeof ArtifactComparisonRequestSchema>
export type ArtifactComparisonResponse = Type.Static<typeof ArtifactComparisonResponseSchema>
export type ArtifactComparisonResult = Type.Static<typeof ArtifactComparisonResultSchema>
export type DeferredWeaponResponse = Type.Static<typeof DeferredWeaponResponseSchema>
