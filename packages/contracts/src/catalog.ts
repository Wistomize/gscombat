import Type from "typebox"

import { CombatActionIntegerScenarioParameterSchema } from "./combat-coverage.js"
import { ExternalBuffSchema } from "./scenarios.js"

const WeaponTypeSchema = Type.Union([
  Type.Literal("bow"),
  Type.Literal("catalyst"),
  Type.Literal("claymore"),
  Type.Literal("polearm"),
  Type.Literal("sword")
])

const ActiveScenarioEffectOptionSourceSchema = Type.Union([
  Type.Object({
    characterId: Type.String({ minLength: 1, maxLength: 100 }),
    kind: Type.Literal("character"),
    minimumSourceConstellation: Type.Optional(Type.Integer({ minimum: 0, maximum: 6 }))
  }),
  Type.Object({
    holder: Type.Optional(Type.Union([Type.Literal("party_member"), Type.Literal("primary")])),
    kind: Type.Literal("weapon"),
    weaponId: Type.String({ minLength: 1, maxLength: 100 })
  }),
  Type.Object({
    holder: Type.Optional(Type.Union([Type.Literal("party_member"), Type.Literal("primary")])),
    kind: Type.Literal("artifact_set"),
    minimumPieces: Type.Integer({ minimum: 1, maximum: 5 }),
    setId: Type.String({ minLength: 1, maxLength: 100 })
  })
])

const ActiveScenarioEffectOptionSchema = Type.Object({
  exclusiveGroup: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  id: Type.String({ minLength: 1, maxLength: 100 }),
  label: Type.String({ minLength: 1, maxLength: 120 }),
  recipientSourceRelation: Type.Optional(Type.Union([Type.Literal("not_source"), Type.Literal("source")])),
  requiredActiveEffectIds: Type.Optional(Type.Array(Type.String({ minLength: 1, maxLength: 100 }), { minItems: 1, maxItems: 20 })),
  selectionMode: Type.Optional(Type.Literal("optional")),
  source: ActiveScenarioEffectOptionSourceSchema
})

const SupportMetricKindSchema = Type.Union([
  Type.Literal("healing"),
  Type.Literal("scalar"),
  Type.Literal("stat_buff")
])

const SupportMetricTargetSchema = Type.Union([
  Type.Literal("enemy"),
  Type.Literal("friendly_recipient"),
  Type.Literal("self")
])

const RecipientRequirementSchema = Type.Union([
  Type.Object({
    kind: Type.Literal("recipient_in_source_area"),
    label: Type.String({ minLength: 1, maxLength: 160 })
  }),
  Type.Object({
    comparison: Type.Union([Type.Literal("at_most"), Type.Literal("above")]),
    kind: Type.Literal("recipient_hp_fraction"),
    label: Type.String({ minLength: 1, maxLength: 160 }),
    threshold: Type.Number({ maximum: 1, minimum: 0 }),
    waivedAtSourceConstellation: Type.Optional(Type.Integer({ maximum: 6, minimum: 0 }))
  })
])

const SourceHpRequirementSchema = Type.Object({
  comparison: Type.Union([Type.Literal("at_most"), Type.Literal("above")]),
  kind: Type.Literal("source_hp_fraction"),
  label: Type.String({ minLength: 1, maxLength: 160 }),
  threshold: Type.Number({ maximum: 1, minimum: 0 })
})

const SupportMetricCatalogEntrySchema = Type.Object({
  conditionalRecipientRequirements: Type.Optional(
    Type.Array(
      Type.Object({
        minimumSourceConstellation: Type.Integer({ maximum: 6, minimum: 0 }),
        requirement: Type.Object({
          comparison: Type.Union([Type.Literal("at_most"), Type.Literal("above")]),
          kind: Type.Literal("recipient_hp_fraction"),
          label: Type.String({ minLength: 1, maxLength: 160 }),
          threshold: Type.Number({ maximum: 1, minimum: 0 })
        })
      }),
      { maxItems: 20 }
    )
  ),
  id: Type.String({ minLength: 1, maxLength: 120 }),
  kind: SupportMetricKindSchema,
  label: Type.String({ minLength: 1, maxLength: 160 }),
  recipientRequirements: Type.Optional(Type.Array(RecipientRequirementSchema, { maxItems: 20 })),
  recipientTargetRouting: Type.Optional(Type.Literal("active_recipient_if_moonsign_else_self")),
  scenarioParameters: Type.Optional(Type.Array(CombatActionIntegerScenarioParameterSchema, { maxItems: 20 })),
  sourceActionId: Type.String({ minLength: 1, maxLength: 120 }),
  sourceHpRequirements: Type.Optional(Type.Array(SourceHpRequirementSchema, { maxItems: 20 })),
  target: SupportMetricTargetSchema
})

export const CatalogResponseSchema = Type.Object({
  artifactSets: Type.Array(Type.Object({ label: Type.String(), setId: Type.String() })),
  buffPresets: Type.Array(
    Type.Object({ buffs: Type.Array(ExternalBuffSchema), id: Type.String(), label: Type.String() })
  ),
  characters: Type.Array(
    Type.Object({
      characterId: Type.String(),
      label: Type.String(),
      primaryActions: Type.Array(
        Type.Object({
          id: Type.String(),
          label: Type.String(),
          scenarioEffects: Type.Optional(Type.Array(ActiveScenarioEffectOptionSchema, { maxItems: 100 })),
          scenarioParameters: Type.Optional(Type.Array(CombatActionIntegerScenarioParameterSchema, { maxItems: 20 }))
        })
      ),
      primaryActionIds: Type.Array(Type.String()),
      supportMetrics: Type.Array(SupportMetricCatalogEntrySchema, { maxItems: 100 }),
      weaponType: WeaponTypeSchema
    })
  ),
  weapons: Type.Array(
    Type.Object({
      label: Type.String(),
      rarity: Type.Integer(),
      weaponId: Type.String(),
      weaponType: WeaponTypeSchema
    })
  )
})

export type CatalogResponse = Type.Static<typeof CatalogResponseSchema>
