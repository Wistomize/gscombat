import Type from "typebox"

const CombatAuthoringReadinessSchema = Type.Union([
  Type.Literal("ready_for_semantic_authoring"),
  Type.Literal("requires_explicit_variant_binding"),
  Type.Literal("missing_talent_parameters")
])

const CharacterSkillParameterGroupSummarySchema = Type.Object({
  maximumTalentLevel: Type.Union([Type.Integer({ minimum: 1 }), Type.Null()]),
  minimumTalentLevel: Type.Union([Type.Integer({ minimum: 1 }), Type.Null()]),
  parameterCount: Type.Integer({ minimum: 0 })
})

const CoreTalentParameterGroupsSchema = Type.Object({
  auto: Type.Union([CharacterSkillParameterGroupSummarySchema, Type.Null()]),
  burst: Type.Union([CharacterSkillParameterGroupSummarySchema, Type.Null()]),
  skill: Type.Union([CharacterSkillParameterGroupSummarySchema, Type.Null()])
})

const TalentParameterOwnerSchema = Type.Object({
  coreTalentGroups: CoreTalentParameterGroupsSchema,
  talentParameterOwnerId: Type.String({ minLength: 1 })
})

export const CombatAuthoringAuditReportSchema = Type.Object({
  characters: Type.Array(
    Type.Object({
      candidateTalentParameterOwners: Type.Array(TalentParameterOwnerSchema),
      declaredActionIds: Type.Array(Type.String({ minLength: 1 })),
      element: Type.Union([Type.String(), Type.Null()]),
      inherentBaseStats: Type.Record(Type.String({ minLength: 1 }), Type.Number()),
      readiness: CombatAuthoringReadinessSchema,
      selectedTalentParameterOwnerId: Type.Union([Type.String({ minLength: 1 }), Type.Null()]),
      staticCharacterId: Type.String({ minLength: 1 }),
      weaponType: Type.String({ minLength: 1 })
    })
  ),
  readinessCounts: Type.Object({
    missing_talent_parameters: Type.Integer({ minimum: 0 }),
    ready_for_semantic_authoring: Type.Integer({ minimum: 0 }),
    requires_explicit_variant_binding: Type.Integer({ minimum: 0 })
  }),
  totalStaticCharacters: Type.Integer({ minimum: 0 }),
  unboundTalentParameterOwnerIds: Type.Array(Type.String({ minLength: 1 }))
})

export type CombatAuthoringAuditReport = Type.Static<typeof CombatAuthoringAuditReportSchema>
