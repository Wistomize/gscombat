import Type from "typebox"

import { ArtifactSlotSchema, ArtifactStatSchema, CharacterBuildSchema } from "./builds.js"
import { EvaluationScenarioSchema, ExternalBuffSchema } from "./scenarios.js"

const ScalingStatSchema = Type.Union([
  Type.Literal("attack"),
  Type.Literal("defense"),
  Type.Literal("elementalMastery"),
  Type.Literal("hp")
])

const ScalingTermSchema = Type.Object({
  coefficient: Type.Number(),
  label: Type.Optional(Type.String()),
  stat: ScalingStatSchema
})

const SpecialReactionBaseDamageTermSchema = Type.Object({
  coefficient: Type.Number(),
  contribution: Type.Number(),
  label: Type.Optional(Type.String()),
  stat: ScalingStatSchema,
  value: Type.Number()
})

const SpecialReactionKindSchema = Type.Union([
  Type.Literal("lunar_bloom"),
  Type.Literal("lunar_charged"),
  Type.Literal("lunar_crystallize"),
  Type.Literal("stellar_superconduct")
])

const TeamStateSchema = Type.Object({
  activeResonanceIds: Type.Array(Type.Union([
    Type.Literal("resonance.anemo"),
    Type.Literal("resonance.cryo"),
    Type.Literal("resonance.dendro"),
    Type.Literal("resonance.electro"),
    Type.Literal("resonance.geo"),
    Type.Literal("resonance.hydro"),
    Type.Literal("resonance.protective"),
    Type.Literal("resonance.pyro")
  ])),
  hexereiSecretRite: Type.Boolean(),
  moonsign: Type.Object({
    characterBuildIds: Type.Array(Type.String({ minLength: 1, maxLength: 100 })),
    characterCount: Type.Integer({ minimum: 0, maximum: 4 }),
    level: Type.Union([
      Type.Literal("none"),
      Type.Literal("nascent_gleam"),
      Type.Literal("ascendant_gleam")
    ])
  })
})

const ExpectedCritTraceFormulaSchema = Type.Object({
  critDamage: Type.Number(),
  critRate: Type.Number(),
  kind: Type.Literal("expected_crit"),
  multiplier: Type.Number()
})

const ResistanceTraceFormulaSchema = Type.Object({
  effectiveResistance: Type.Number({ description: "Resolved resistance after this direct-damage trace's reduction." }),
  kind: Type.Literal("resistance"),
  multiplier: Type.Number(),
  resistance: Type.Number({
    description: "Enemy resistance before reduction in a direct-damage trace; unlike rotation trace resistance, this is not effective resistance."
  }),
  resistanceReduction: Type.Number({ description: "Resistance reduction applied by this direct-damage trace." })
})

const SpecialReactionTraceFormulaSchema = Type.Union([
  Type.Object({
    kind: Type.Literal("special_reaction_base_damage"),
    terms: Type.Optional(Type.Array(SpecialReactionBaseDamageTermSchema)),
    value: Type.Number()
  }),
  Type.Object({
    kind: Type.Literal("special_reaction_coefficient"),
    multiplier: Type.Number(),
    reactionKind: SpecialReactionKindSchema,
    storedElementalApplications: Type.Optional(Type.Integer({ minimum: 0 }))
  }),
  Type.Object({
    bonus: Type.Number(),
    kind: Type.Literal("special_reaction_base_damage_bonus"),
    multiplier: Type.Number()
  }),
  Type.Object({
    bonus: Type.Number(),
    elementalMastery: Type.Number(),
    kind: Type.Literal("special_reaction_damage_bonus"),
    masteryBonus: Type.Number(),
    multiplier: Type.Number()
  }),
  Type.Object({ kind: Type.Literal("special_reaction_big_power"), multiplier: Type.Number() }),
  Type.Object({ kind: Type.Literal("special_reaction_flat_damage_addition"), flatDamageAddition: Type.Number() }),
  Type.Object({
    ascensionBonus: Type.Number(),
    kind: Type.Literal("special_reaction_ascension"),
    multiplier: Type.Number()
  }),
  ExpectedCritTraceFormulaSchema,
  ResistanceTraceFormulaSchema
])

const SpecialReactionTraceStageSchema = Type.Union([
  Type.Literal("base_damage"),
  Type.Literal("reaction_coefficient"),
  Type.Literal("base_damage_bonus"),
  Type.Literal("reaction_damage_bonus"),
  Type.Literal("big_power"),
  Type.Literal("flat_damage_addition"),
  Type.Literal("crit"),
  Type.Literal("resistance"),
  Type.Literal("ascension")
])

const TraceFormulaSchema = Type.Union([
  Type.Object({
    attackPercent: Type.Number(),
    baseAttack: Type.Number(),
    flatAttack: Type.Number(),
    kind: Type.Literal("attack")
  }),
  Type.Object({ kind: Type.Literal("talent"), multiplier: Type.Number() }),
  Type.Object({
    kind: Type.Literal("scaling"),
    stat: Type.Union([Type.Literal("defense"), Type.Literal("elementalMastery"), Type.Literal("hp")]),
    value: Type.Number()
  }),
  Type.Object({
    kind: Type.Literal("scaling_terms"),
    terms: Type.Readonly(Type.Array(
      Type.Intersect([
        ScalingTermSchema,
        Type.Object({ contribution: Type.Number(), value: Type.Number() })
      ])
    ))
  }),
  Type.Object({
    baseMultiplier: Type.Number(),
    bonus: Type.Number(),
    elementalMastery: Type.Number(),
    kind: Type.Literal("amplifying_reaction"),
    multiplier: Type.Number(),
    reaction: Type.Union([
      Type.Literal("melt_forward"),
      Type.Literal("melt_reverse"),
      Type.Literal("vaporize_forward"),
      Type.Literal("vaporize_reverse")
    ])
  }),
  Type.Object({
    baseDamage: Type.Number(),
    bonus: Type.Number(),
    elementalMastery: Type.Number(),
    kind: Type.Literal("additive_reaction"),
    multiplier: Type.Number(),
    reaction: Type.Union([Type.Literal("aggravate"), Type.Literal("spread")]),
    reactionDamage: Type.Number()
  }),
  Type.Object({
    baseDamage: Type.Number({ description: "Level-scaled transformative reaction base damage." }),
    bonus: Type.Number(),
    elementalMastery: Type.Number({ description: "Elemental mastery used by the transformative reaction formula." }),
    flatDamageAddition: Type.Number({ description: "Additive base damage after the transformative reaction formula." }),
    kind: Type.Literal("transformative_reaction"),
    multiplier: Type.Number(),
    reaction: Type.Union([
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
  }),
  Type.Object({ bonus: Type.Number(), kind: Type.Literal("damage_bonus"), multiplier: Type.Number() }),
  Type.Object({ flatDamageAddition: Type.Number(), kind: Type.Literal("direct_flat_damage_addition") }),
  ExpectedCritTraceFormulaSchema,
  Type.Object({
    attackerLevel: Type.Number(),
    defenseIgnore: Type.Number(),
    defenseReduction: Type.Number(),
    enemyLevel: Type.Number(),
    kind: Type.Literal("defense"),
    multiplier: Type.Number()
  }),
  ResistanceTraceFormulaSchema,
  SpecialReactionTraceFormulaSchema
])

export const TraceEntrySchema = Type.Object({
  after: Type.Number(),
  before: Type.Number(),
  formula: TraceFormulaSchema,
  source: Type.String(),
  stage: Type.Union([
    Type.Literal("attack"),
    Type.Literal("scaling"),
    Type.Literal("talent"),
    Type.Literal("amplifying_reaction"),
    Type.Literal("additive_reaction"),
    Type.Literal("transformative_reaction"),
    Type.Literal("damage_bonus"),
    Type.Literal("crit"),
    Type.Literal("defense"),
    Type.Literal("resistance"),
    Type.Literal("base_damage"),
    Type.Literal("reaction_coefficient"),
    Type.Literal("base_damage_bonus"),
    Type.Literal("reaction_damage_bonus"),
    Type.Literal("big_power"),
    Type.Literal("flat_damage_addition"),
    Type.Literal("ascension")
  ])
})

export const DamageResultSchema = Type.Object({
  critDamage: Type.Number(),
  expectedDamage: Type.Number(),
  kind: Type.Optional(SpecialReactionKindSchema),
  nonCritDamage: Type.Number(),
  reactionCoefficient: Type.Optional(Type.Number()),
  trace: Type.Array(TraceEntrySchema)
})

const RotationElementalApplicationOutcomeSchema = Type.Object({
  applied: Type.Boolean(),
  auraElement: Type.Optional(
    Type.Union([Type.Literal("cryo"), Type.Literal("hydro"), Type.Literal("pyro"), Type.Literal("quicken")])
  ),
  auraId: Type.Optional(Type.String()),
  reaction: Type.Optional(
    Type.Union([
      Type.Literal("aggravate"),
      Type.Literal("bloom"),
      Type.Literal("burning"),
      Type.Literal("burgeon"),
      Type.Literal("electro_charged"),
      Type.Literal("hyperbloom"),
      Type.Literal("melt_forward"),
      Type.Literal("melt_reverse"),
      Type.Literal("overload"),
      Type.Literal("shatter"),
      Type.Literal("spread"),
      Type.Literal("superconduct"),
      Type.Literal("swirl"),
      Type.Literal("vaporize_forward"),
      Type.Literal("vaporize_reverse")
    ])
  )
})

const RotationElementOverrideSchema = Type.Object({
  baseElement: Type.String(),
  element: Type.Union([
    Type.Literal("anemo"),
    Type.Literal("cryo"),
    Type.Literal("dendro"),
    Type.Literal("electro"),
    Type.Literal("geo"),
    Type.Literal("hydro"),
    Type.Literal("pyro")
  ]),
  id: Type.String()
})

const RotationTraceEntrySchema = Type.Union([
  Type.Object({
    after: Type.Number(),
    before: Type.Number(),
    coefficient: Type.Number(),
    flatDamage: Type.Optional(Type.Number()),
    kind: Type.Literal("scaling"),
    stat: ScalingStatSchema,
    value: Type.Number()
  }),
  Type.Object({
    after: Type.Number(),
    before: Type.Number(),
    flatDamage: Type.Optional(Type.Number()),
    kind: Type.Literal("scaling_terms"),
    terms: Type.Array(
      Type.Intersect([
        ScalingTermSchema,
        Type.Object({ contribution: Type.Number(), value: Type.Number() })
      ])
    )
  }),
  Type.Object({
    after: Type.Number(),
    baseMultiplier: Type.Number(),
    before: Type.Number(),
    bonus: Type.Number(),
    elementalMastery: Type.Number(),
    kind: Type.Literal("amplifying_reaction"),
    multiplier: Type.Number(),
    reaction: Type.Union([
      Type.Literal("melt_forward"),
      Type.Literal("melt_reverse"),
      Type.Literal("vaporize_forward"),
      Type.Literal("vaporize_reverse")
    ])
  }),
  Type.Object({
    after: Type.Number(),
    baseDamage: Type.Number(),
    before: Type.Number(),
    bonus: Type.Number(),
    elementalMastery: Type.Number(),
    kind: Type.Literal("additive_reaction"),
    multiplier: Type.Number(),
    reaction: Type.Union([Type.Literal("aggravate"), Type.Literal("spread")]),
    reactionDamage: Type.Number()
  }),
  Type.Object({
    after: Type.Number(),
    before: Type.Number(),
    bonus: Type.Number(),
    kind: Type.Literal("damage_bonus"),
    multiplier: Type.Number()
  }),
  Type.Object({
    after: Type.Number(),
    before: Type.Number(),
    critDamage: Type.Number(),
    critRate: Type.Number(),
    kind: Type.Literal("expected_crit"),
    multiplier: Type.Number()
  }),
  Type.Object({
    after: Type.Number(),
    attackerLevel: Type.Number(),
    before: Type.Number(),
    defenseIgnore: Type.Number(),
    defenseReduction: Type.Number(),
    enemyLevel: Type.Number(),
    kind: Type.Literal("defense"),
    multiplier: Type.Number()
  }),
  Type.Object({
    after: Type.Number(),
    baseResistance: Type.Number({ description: "Enemy resistance before this event's resistance reduction." }),
    before: Type.Number(),
    effectiveResistance: Type.Number({ description: "Resolved resistance after this event's resistance reduction." }),
    element: Type.String(),
    kind: Type.Literal("resistance"),
    multiplier: Type.Number(),
    resistance: Type.Number({ description: "Legacy alias of effectiveResistance retained for response compatibility." }),
    resistanceReduction: Type.Number({ description: "Resistance reduction applied by this event." })
  }),
  Type.Object({
    after: Type.Number(),
    before: Type.Number(),
    hitCount: Type.Integer({
      description: "Combines a non-transformative event's single-hit post-resistance damage into its total damage.",
      minimum: 2
    }),
    kind: Type.Literal("hit_count")
  }),
  Type.Object({
    after: Type.Number(),
    baseDamage: Type.Number({ description: "Level-scaled transformative reaction base damage." }),
    before: Type.Number(),
    bonus: Type.Number(),
    elementalMastery: Type.Number({ description: "Elemental mastery used by the transformative reaction formula." }),
    flatDamageAddition: Type.Number({ description: "Additive base damage after the transformative reaction formula." }),
    hitCount: Type.Integer({
      description: "after = (baseDamage × multiplier × (1 + 16 × EM / (EM + 2000) + bonus) + flatDamageAddition) × hitCount.",
      minimum: 1
    }),
    kind: Type.Literal("transformative_reaction"),
    multiplier: Type.Number(),
    reaction: Type.Union([
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
  }),
  Type.Object({
    after: Type.Number(),
    before: Type.Number(),
    formula: SpecialReactionTraceFormulaSchema,
    kind: Type.Literal("special_reaction"),
    stage: SpecialReactionTraceStageSchema
  })
])

const RotationEventSummarySchema = Type.Object({
  appliedEffectIds: Type.Array(Type.String()),
  critDamage: Type.Number(),
  elementalApplication: Type.Optional(RotationElementalApplicationOutcomeSchema),
  element: Type.String(),
  elementOverride: Type.Optional(RotationElementOverrideSchema),
  expectedDamage: Type.Number(),
  hitCount: Type.Integer({ minimum: 1 }),
  id: Type.String(),
  nonCritDamage: Type.Number(),
  ownerId: Type.String(),
  statSnapshotTime: Type.Number({ minimum: 0 }),
  time: Type.Number({
    description: "Action-relative hit time in seconds.",
    minimum: 0
  }),
  trace: Type.Array(RotationTraceEntrySchema)
})

const RotationSummarySchema = Type.Object({
  dpr: Type.Number(),
  dps: Type.Number(),
  duration: Type.Number({ exclusiveMinimum: 0 }),
  events: Type.Array(RotationEventSummarySchema)
})

export const AnalysisRequestSchema = Type.Object({
  ...EvaluationScenarioSchema.properties,
  weaponComparisonRefinements: Type.Optional(
    Type.Record(Type.String({ minLength: 1, maxLength: 100 }), Type.Integer({ minimum: 1, maximum: 5 }))
  )
})
export type AnalysisRequest = Type.Static<typeof AnalysisRequestSchema>

/** Returns the standardized refinement used by weapon counterfactual comparisons. */
export function getWeaponComparisonRefinement(rarity: number): number {
  return rarity === 5 ? 1 : 5
}

export const AnalysisResponseSchema = Type.Object({
  analysis: Type.Object({
    baselineExpectedDamage: Type.Number(),
    effectiveArtifacts: Type.Array(
      Type.Object({ artifactId: Type.String(), effectiveRolls: Type.Number(), slot: ArtifactSlotSchema })
    ),
    marginalSubstats: Type.Array(
      Type.Object({
        averageRoll: Type.Number(),
        deltaDamage: Type.Number(),
        gainRatio: Type.Number(),
        label: Type.String(),
        stat: ArtifactStatSchema,
        weight: Type.Number()
      })
    ),
    progressionGains: Type.Array(
      Type.Object({
        deltaDamage: Type.Number(),
        gainRatio: Type.Number(),
        id: Type.String(),
        label: Type.String(),
        weight: Type.Number()
      })
    ),
    totalEffectiveRolls: Type.Number(),
    weapons: Type.Array(
      Type.Object({
        expectedDamage: Type.Number(),
        gainRatio: Type.Number(),
        label: Type.String(),
        rarity: Type.Integer(),
        refinement: Type.Integer(),
        weaponId: Type.String()
      })
    )
  }),
  engineVersion: Type.String(),
  evaluation: Type.Object({
    appliedEffects: Type.Array(
      Type.Object({
        actionParameterId: Type.Optional(Type.String({ minLength: 1, maxLength: 80 })),
        id: Type.String({ minLength: 1, maxLength: 160 }),
        label: Type.String({ minLength: 1, maxLength: 160 }),
        scalingStat: Type.Optional(ScalingStatSchema),
        sourceId: Type.String({ minLength: 1, maxLength: 100 }),
        target: Type.Union([
          Type.Literal("additionalDamageEvent"),
          Type.Literal("actionParameter"),
          Type.Literal("attackPercent"),
          Type.Literal("baseDamageFlat"),
          Type.Literal("critDamage"),
          Type.Literal("critRate"),
          Type.Literal("damageBonus"),
          Type.Literal("amplifyingReactionBonus"),
          Type.Literal("reactionDamageBonus"),
          Type.Literal("transformativeReactionFlatDamageAddition"),
          Type.Literal("specialReactionBaseDamageFlat"),
          Type.Literal("specialReactionBaseDamageBonus"),
          Type.Literal("specialReactionBigPowerBonus"),
          Type.Literal("specialReactionDamageBonus"),
          Type.Literal("specialReactionFlatDamageAddition"),
          Type.Literal("specialReactionElevation"),
          Type.Literal("defenseFlat"),
          Type.Literal("defensePercent"),
          Type.Literal("flatAttack"),
          Type.Literal("enemyDefenseIgnore"),
          Type.Literal("enemyDefenseReduction"),
          Type.Literal("energyRecharge"),
          Type.Literal("elementalMastery"),
          Type.Literal("enemyResistanceReduction"),
          Type.Literal("finalHpToFlatAttack"),
          Type.Literal("finalHpToElementalMastery"),
          Type.Literal("finalElementalMasteryToFlatAttack"),
          Type.Literal("finalHpToDamageBonus"),
          Type.Literal("finalHpToOwnElementDamageBonus"),
          Type.Literal("sourceFinalHpToElementalMastery"),
          Type.Literal("sourceFinalElementalMasteryToFlatAttack"),
          Type.Literal("sourceFinalElementalMasteryToEnergyRecharge"),
          Type.Literal("sourceFinalDefenseToDamageBonus"),
          Type.Literal("sourceFinalAttackToDamageBonus"),
          Type.Literal("hpFlat"),
          Type.Literal("hpPercent"),
          Type.Literal("matchedActionAdditiveDamageTerm"),
          Type.Literal("talentLevel")
        ]),
        value: Type.Number()
      })
    ),
    appliedBuffs: Type.Array(ExternalBuffSchema),
    formulaAuthority: Type.Literal("rotation_events", {
      description: "Use each rotation event trace as the authoritative formula after timing, reactions, and overrides."
    }),
    result: DamageResultSchema,
    rotation: RotationSummarySchema,
    teamState: TeamStateSchema,
    stats: Type.Object({
      attackPercent: Type.Number(),
      actionParameters: Type.Optional(Type.Record(Type.String({ minLength: 1, maxLength: 80 }), Type.Integer())),
      baseAttack: Type.Number(),
      baseDefense: Type.Number(),
      baseElementalMastery: Type.Number(),
      baseHp: Type.Number(),
      critDamage: Type.Number(),
      critRate: Type.Number(),
      damageBonus: Type.Number(),
      defensePercent: Type.Number(),
      effectiveAttack: Type.Number(),
      effectiveDefense: Type.Number(),
      effectiveHp: Type.Number(),
      elementalMastery: Type.Number(),
      energyRecharge: Type.Number(),
      flatAttack: Type.Number(),
      flatElementalMastery: Type.Number(),
      flatDefense: Type.Number(),
      flatHp: Type.Number(),
      hpPercent: Type.Number(),
      resistanceReduction: Type.Number(),
      statContributions: Type.Array(
        Type.Object({
          label: Type.String(),
          stage: Type.Union([
            Type.Literal("attackPercent"),
            Type.Literal("baseAttack"),
            Type.Literal("baseDefense"),
            Type.Literal("baseElementalMastery"),
            Type.Literal("baseHp"),
            Type.Literal("damageBonus"),
            Type.Literal("defensePercent"),
            Type.Literal("elementalMastery"),
            Type.Literal("flatAttack"),
            Type.Literal("flatDefense"),
            Type.Literal("flatHp"),
            Type.Literal("hpPercent")
          ]),
          value: Type.Number()
        })
      ),
      scalingTerms: Type.Optional(Type.Readonly(Type.Array(ScalingTermSchema))),
      talentMultiplier: Type.Union([Type.Number(), Type.Null()])
    })
  })
})

export type AnalysisResponse = Type.Static<typeof AnalysisResponseSchema>

export const PresetsResponseSchema = Type.Object({
  presets: Type.Array(
    Type.Object({
      description: Type.String(),
      id: Type.String(),
      label: Type.String(),
      scenario: EvaluationScenarioSchema
    })
  )
})

export type PresetsResponse = Type.Static<typeof PresetsResponseSchema>

export const ShowcaseImportRequestSchema = Type.Object({
  uid: Type.String({ pattern: "^[0-9]{9,10}$" })
})

export type ShowcaseImportRequest = Type.Static<typeof ShowcaseImportRequestSchema>

export const ShowcaseImportResponseSchema = Type.Object({
  builds: Type.Array(CharacterBuildSchema),
  nickname: Type.Optional(Type.String()),
  ttl: Type.Integer({ minimum: 0 }),
  uid: Type.String()
})

export type ShowcaseImportResponse = Type.Static<typeof ShowcaseImportResponseSchema>
