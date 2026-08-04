import Type from "typebox"

export const CombatCoverageStatusSchema = Type.Union([
  Type.Literal("unsupported"),
  Type.Literal("draft"),
  Type.Literal("verified")
])

const CombatTalentParameterGroupIdSchema = Type.Union([
  Type.Literal("auto"),
  Type.Literal("burst"),
  Type.Literal("lockedPassive"),
  Type.Literal("passive"),
  Type.Literal("passive1"),
  Type.Literal("passive2"),
  Type.Literal("passive3"),
  Type.Literal("skill"),
  Type.Literal("sprint")
])

const CombatTalentParameterSlotSchema = Type.Union([
  Type.Literal("normal"),
  Type.Literal("skill"),
  Type.Literal("burst"),
  Type.Literal("passive")
])

const CombatParameterReferenceSchema = Type.Union([
  Type.Object({
    groupId: CombatTalentParameterGroupIdSchema,
    id: Type.String(),
    parameterIndex: Type.Integer({ minimum: 0 }),
    source: Type.Literal("talent"),
    talentSlot: CombatTalentParameterSlotSchema
  }),
  Type.Object({
    groupId: Type.String(),
    id: Type.String(),
    path: Type.Array(Type.Integer({ minimum: 0 })),
    source: Type.Literal("raw")
  })
])

const CombatDamageScalingTermSchema = Type.Object({
  coefficientMultiplierScenarioParameterId: Type.Optional(Type.String({ minLength: 1 })),
  coefficientParameterId: Type.String({ minLength: 1 }),
  minimumSourceAscension: Type.Optional(Type.Integer({ minimum: 0, maximum: 6 })),
  stat: Type.Union([
    Type.Literal("attack"),
    Type.Literal("defense"),
    Type.Literal("elementalMastery"),
    Type.Literal("hp")
  ])
})

const CombatDamagePartSchema = Type.Union([
  Type.Object({
    coefficientParameterId: Type.String({ minLength: 1 }),
    id: Type.String({ minLength: 1 })
  }),
  Type.Object({
    id: Type.String({ minLength: 1 }),
    scalingTerms: Type.Array(CombatDamageScalingTermSchema, { minItems: 1 })
  })
])

const CombatEventSnapshotSchema = Type.Union([Type.Literal("cast"), Type.Literal("hit")])

const ElementalApplicationIcdSchema = Type.Union([
  Type.Object({ kind: Type.Literal("none") }),
  Type.Object({
    groupId: Type.String({ minLength: 1, pattern: ".*\\S.*" }),
    kind: Type.Literal("standard")
  })
])

const RotationElementalApplicationSchema = Type.Object({
  activation: Type.Optional(Type.Union([Type.Literal("always"), Type.Literal("while_element_overridden")])),
  icd: ElementalApplicationIcdSchema,
  reactionBonus: Type.Optional(Type.Number())
})

const CombatEventHitCountSchema = Type.Union([
  Type.Integer({ minimum: 0 }),
  Type.Object({
    kind: Type.Literal("scenario_parameter"),
    parameterId: Type.String({ minLength: 1 })
  })
])

const CombatEventSpecialReactionConfigSchema = Type.Object({
  ascensionBonus: Type.Optional(Type.Number()),
  baseDamageBonus: Type.Optional(Type.Number()),
  bigPowerMultiplier: Type.Optional(Type.Number({ minimum: 0 })),
  flatDamageAddition: Type.Optional(Type.Number()),
  kind: Type.Union([
    Type.Literal("lunar_bloom"),
    Type.Literal("lunar_charged"),
    Type.Literal("lunar_crystallize"),
    Type.Literal("stellar_superconduct")
  ]),
  reactionDamageBonus: Type.Optional(Type.Number()),
  stellarStoredElementalApplicationsParameterId: Type.Optional(Type.String({ minLength: 1 }))
})

const CombatEventScenarioParameterCoefficientMultiplierSchema = Type.Union([
  Type.Object({
    kind: Type.Literal("scenario_parameter_lookup"),
    parameterId: Type.String({ minLength: 1 }),
    values: Type.Array(
      Type.Object({
        multiplier: Type.Number({ minimum: 0 }),
        parameterValue: Type.Integer()
      }),
      { minItems: 1 }
    )
  }),
  Type.Object({
    base: Type.Number({ minimum: 0 }),
    kind: Type.Literal("scenario_parameter_talent_linear"),
    parameterId: Type.String({ minLength: 1 }),
    perParameterTalentCoefficientId: Type.String({ minLength: 1 })
  })
])

const CombatDamageEventTemplateBaseSchema = {
  at: Type.Number({ minimum: 0 }),
  coefficientMultiplier: Type.Optional(CombatEventScenarioParameterCoefficientMultiplierSchema),
  damagePartId: Type.String({ minLength: 1 }),
  elementalApplication: Type.Optional(RotationElementalApplicationSchema),
  elementOverrideTarget: Type.Optional(Type.Literal("normal_attack")),
  hitCount: Type.Optional(CombatEventHitCountSchema),
  id: Type.String({ minLength: 1 }),
  specialReaction: Type.Optional(CombatEventSpecialReactionConfigSchema)
}

const CombatDamageEventTemplateSchema = Type.Union([
  Type.Object({ ...CombatDamageEventTemplateBaseSchema, snapshot: CombatEventSnapshotSchema }),
  Type.Object({
    ...CombatDamageEventTemplateBaseSchema,
    snapshot: Type.Literal("time"),
    snapshotAt: Type.Number({ minimum: 0 })
  })
])

const CombatActionTimelineSchema = Type.Object({
  damageEvents: Type.Array(CombatDamageEventTemplateSchema, { minItems: 1 }),
  duration: Type.Number({ exclusiveMinimum: 0 })
})

const AmplifyingReactionSchema = Type.Object({
  bonus: Type.Number(),
  kind: Type.Union([
    Type.Literal("melt_forward"),
    Type.Literal("melt_reverse"),
    Type.Literal("vaporize_forward"),
    Type.Literal("vaporize_reverse")
  ])
})

const AdditiveReactionSchema = Type.Object({
  bonus: Type.Number(),
  kind: Type.Union([Type.Literal("aggravate"), Type.Literal("spread")])
})

const TransformativeReactionSchema = Type.Object({
  damageElement: Type.Optional(
    Type.Union([Type.Literal("cryo"), Type.Literal("electro"), Type.Literal("hydro"), Type.Literal("pyro")])
  ),
  kind: Type.Union([
    Type.Literal("bloom"),
    Type.Literal("burning"),
    Type.Literal("burgeon"),
    Type.Literal("electro_charged"),
    Type.Literal("hyperbloom"),
    Type.Literal("overload"),
    Type.Literal("shatter"),
    Type.Literal("superconduct"),
    Type.Literal("swirl")
  ])
})

const DirectSpecialReactionKindSchema = Type.Union([
  Type.Literal("lunar_bloom"),
  Type.Literal("lunar_charged"),
  Type.Literal("lunar_crystallize"),
  Type.Literal("stellar_superconduct")
])

const CombatDirectSpecialReactionConfigSchema = Type.Object({
  ascensionBonus: Type.Optional(Type.Number()),
  baseDamageBonus: Type.Optional(Type.Number()),
  bigPowerMultiplier: Type.Optional(Type.Number({ minimum: 0 })),
  flatDamageAddition: Type.Optional(Type.Number()),
  kind: DirectSpecialReactionKindSchema,
  reactionDamageBonus: Type.Optional(Type.Number()),
  stellarStoredElementalApplicationsParameterId: Type.Optional(Type.String({ minLength: 1 }))
})

export const CombatActionIntegerScenarioParameterSchema = Type.Object({
  allowedValues: Type.Optional(Type.Array(Type.Integer(), { minItems: 1 })),
  defaultValue: Type.Integer(),
  id: Type.String({ minLength: 1 }),
  label: Type.String({ minLength: 1 }),
  maximumValue: Type.Integer(),
  maximumValueByParameter: Type.Optional(
    Type.Object({
      parameterId: Type.String({ minLength: 1 }),
      values: Type.Array(
        Type.Object({
          maximumValue: Type.Integer(),
          parameterValue: Type.Integer()
        }),
        { minItems: 1 }
      )
    })
  ),
  minimumValue: Type.Integer(),
  rangeBySourceConstellation: Type.Optional(
    Type.Array(
      Type.Object({
        defaultValue: Type.Optional(Type.Integer()),
        maximumValue: Type.Optional(Type.Integer()),
        minimumSourceConstellation: Type.Integer({ minimum: 1, maximum: 6 }),
        minimumValue: Type.Optional(Type.Integer())
      }),
      { minItems: 1 }
    )
  )
})

const CombatTalentCoefficientSnapshotCheckSchema = Type.Object({
  expectedCoefficient: Type.Number(),
  talentLevel: Type.Integer({ minimum: 1, maximum: 15 })
})

const CombatActionScenarioParameterLookupMultiplierSchema = Type.Object({
  parameterId: Type.String({ minLength: 1 }),
  values: Type.Array(
    Type.Object({
      multiplier: Type.Number({ minimum: 0 }),
      parameterValue: Type.Integer()
    }),
    { minItems: 1 }
  )
})

const CombatActionScenarioParameterLinearMultiplierSchema = Type.Object({
  base: Type.Number({ minimum: 0 }),
  parameterId: Type.String({ minLength: 1 }),
  perParameterValue: Type.Number({ minimum: 0 })
})

const CombatActionScenarioParameterMultiplierSchema = Type.Union([
  CombatActionScenarioParameterLookupMultiplierSchema,
  CombatActionScenarioParameterLinearMultiplierSchema
])

const CombatActionIntrinsicEffectBaseSchema = {
  minimumSourceAscension: Type.Optional(Type.Integer({ minimum: 0, maximum: 6 })),
  scenarioParameterMultiplier: Type.Optional(CombatActionScenarioParameterMultiplierSchema)
}

const CombatActionIntrinsicEffectSchema = Type.Union([
  Type.Object({
    ...CombatActionIntrinsicEffectBaseSchema,
    coefficientParameterId: Type.Optional(Type.String({ minLength: 1 })),
    fixedValue: Type.Optional(Type.Number()),
    kind: Type.Literal("flat"),
    snapshotChecks: Type.Optional(Type.Array(CombatTalentCoefficientSnapshotCheckSchema)),
    target: Type.Union([Type.Literal("critRate"), Type.Literal("damageBonus"), Type.Literal("elementalMastery")]),
    valueMultiplier: Type.Optional(Type.Number({ minimum: 0 }))
  }),
  Type.Object({
    ...CombatActionIntrinsicEffectBaseSchema,
    coefficientParameterId: Type.String({ minLength: 1 }),
    kind: Type.Literal("source_stat"),
    maximumValue: Type.Optional(Type.Number({ minimum: 0 })),
    maximumValueParameterId: Type.Optional(Type.String({ minLength: 1 })),
    maximumValueSnapshotChecks: Type.Optional(Type.Array(CombatTalentCoefficientSnapshotCheckSchema)),
    sourceStat: Type.Union([
      Type.Literal("attack"),
      Type.Literal("defense"),
      Type.Literal("elementalMastery"),
      Type.Literal("hp")
    ]),
    sourceStatMaximumParameterId: Type.Optional(Type.String({ minLength: 1 })),
    sourceStatMaximumSnapshotChecks: Type.Optional(Type.Array(CombatTalentCoefficientSnapshotCheckSchema)),
    sourceStatOffsetParameterId: Type.Optional(Type.String({ minLength: 1 })),
    sourceStatOffsetSnapshotChecks: Type.Optional(Type.Array(CombatTalentCoefficientSnapshotCheckSchema)),
    target: Type.Union([Type.Literal("critRate"), Type.Literal("damageBonus")]),
    valueMultiplier: Type.Optional(Type.Number({ minimum: 0 }))
  })
])

export const CombatActionMetadataSchema = Type.Object({
  additiveReaction: Type.Optional(AdditiveReactionSchema),
  amplifyingReaction: Type.Optional(AmplifyingReactionSchema),
  characterId: Type.String(),
  damageKind: Type.Optional(
    Type.Union([Type.Literal("direct"), Type.Literal("special_reaction"), Type.Literal("transformative")])
  ),
  damageParts: Type.Optional(Type.Array(CombatDamagePartSchema, { minItems: 1 })),
  element: Type.String(),
  evaluator: Type.Optional(
    Type.Union([
      Type.Literal("declared_direct"),
      Type.Literal("declared_special_reaction"),
      Type.Literal("declared_transformative"),
      Type.Literal("special")
    ])
  ),
  id: Type.String(),
  intrinsicEffects: Type.Optional(Type.Array(CombatActionIntrinsicEffectSchema, { maxItems: 20 })),
  kind: Type.Union([Type.Literal("damage"), Type.Literal("support")]),
  parameterReferences: Type.Optional(Type.Array(CombatParameterReferenceSchema)),
  scalingStat: Type.Optional(
    Type.Union([Type.Literal("attack"), Type.Literal("defense"), Type.Literal("elementalMastery"), Type.Literal("hp")])
  ),
  specialReaction: Type.Optional(CombatDirectSpecialReactionConfigSchema),
  scenarioParameters: Type.Optional(Type.Array(CombatActionIntegerScenarioParameterSchema, { maxItems: 20 })),
  status: CombatCoverageStatusSchema,
  talentParameterOwnerId: Type.Optional(Type.String({ minLength: 1 })),
  talentSlot: Type.Union([
    Type.Literal("normal"),
    Type.Literal("plunge"),
    Type.Literal("skill"),
    Type.Literal("burst"),
    Type.Literal("passive"),
    Type.Literal("constellation")
  ]),
  timeline: Type.Optional(CombatActionTimelineSchema),
  transformativeReaction: Type.Optional(TransformativeReactionSchema)
})

const CombatTalentParameterReferenceSchema = Type.Object({
  groupId: CombatTalentParameterGroupIdSchema,
  id: Type.String({ minLength: 1 }),
  parameterIndex: Type.Integer({ minimum: 0 }),
  source: Type.Literal("talent"),
  talentSlot: CombatTalentParameterSlotSchema
})

const CombatEffectDurationCheckSchema = Type.Object({
  expectedCoefficient: Type.Number(),
  talentLevel: Type.Integer({ minimum: 1, maximum: 15 })
})

/** Public catalog shape for a source-locked elemental normal-attack override effect. */
export const CombatElementOverrideEffectSchema = Type.Object({
  durationChecks: Type.Array(CombatEffectDurationCheckSchema, { minItems: 1 }),
  durationParameter: CombatTalentParameterReferenceSchema,
  eligibleWeaponTypes: Type.Array(
    Type.Union([Type.Literal("claymore"), Type.Literal("polearm"), Type.Literal("sword")]),
    { minItems: 1, uniqueItems: true }
  ),
  element: Type.Union([
    Type.Literal("anemo"),
    Type.Literal("cryo"),
    Type.Literal("dendro"),
    Type.Literal("electro"),
    Type.Literal("geo"),
    Type.Literal("hydro"),
    Type.Literal("pyro")
  ]),
  id: Type.String({ minLength: 1 }),
  label: Type.String({ minLength: 1 }),
  minimumSourceConstellation: Type.Optional(Type.Integer({ minimum: 0, maximum: 6 })),
  sourceCharacterId: Type.String({ minLength: 1 }),
  target: Type.Literal("normal_attack")
})

/** Public catalog shape for one maintainer-selected, character-owned analysis output. */
export const CombatMetricMetadataSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  kind: Type.Union([
    Type.Literal("damage"),
    Type.Literal("healing"),
    Type.Literal("scalar"),
    Type.Literal("stat_buff")
  ]),
  label: Type.String({ minLength: 1 }),
  sourceActionId: Type.String({ minLength: 1 }),
  status: CombatCoverageStatusSchema,
  target: Type.Union([Type.Literal("enemy"), Type.Literal("friendly_recipient"), Type.Literal("self")])
})

export const CombatCoverageReportSchema = Type.Object({
  characters: Type.Array(
    Type.Object({
      actions: Type.Array(CombatActionMetadataSchema),
      canCalculateDamage: Type.Boolean({
        description: "True only when this character has a verified damage action that the analyzer can evaluate."
      }),
      characterId: Type.String(),
      detail: Type.String(),
      element: Type.Union([Type.String(), Type.Null()]),
      effects: Type.Array(CombatElementOverrideEffectSchema),
      hasCoreTalentParameters: Type.Boolean(),
      maintainedStatus: Type.Union([Type.Literal("unsupported"), Type.Literal("draft"), Type.Literal("verified")], {
        description: "Developer-maintained battle-logic coverage; it is independent from static snapshot availability."
      }),
      metrics: Type.Array(CombatMetricMetadataSchema),
      parameterGroups: Type.Array(Type.String()),
      rarity: Type.Integer(),
      staticDataAvailable: Type.Boolean({
        description: "Whether this character is present in the bundled immutable game-data snapshot."
      }),
      status: Type.Union([Type.Literal("unsupported"), Type.Literal("draft"), Type.Literal("verified")], {
        description: "Deprecated compatibility alias for maintainedStatus."
      }),
      verifiedActionCount: Type.Integer({
        description: "Count of individually verified actions for this character, including verified support actions.",
        minimum: 0
      }),
      verifiedMetricCount: Type.Integer({
        description: "Count of maintainer-selected metrics that the analyzer can evaluate for this character.",
        minimum: 0
      }),
      weaponType: Type.String()
    })
  ),
  characterStatusCounts: Type.Object({
    draft: Type.Integer({ minimum: 0 }),
    unsupported: Type.Integer({ minimum: 0 }),
    verified: Type.Integer({ minimum: 0 })
  }),
  totalCharacters: Type.Integer({ minimum: 0 }),
  verifiedActionCount: Type.Integer({ minimum: 0 }),
  verifiedMetricCount: Type.Integer({ minimum: 0 })
})

export type CombatCoverageReport = Type.Static<typeof CombatCoverageReportSchema>
