import Type from "typebox"

export const ArtifactSlotSchema = Type.Union([
  Type.Literal("flower"),
  Type.Literal("plume"),
  Type.Literal("sands"),
  Type.Literal("goblet"),
  Type.Literal("circlet")
])

export type ArtifactSlot = Type.Static<typeof ArtifactSlotSchema>

export const ArtifactStatSchema = Type.Union([
  Type.Literal("hp"),
  Type.Literal("hp_percent"),
  Type.Literal("atk"),
  Type.Literal("atk_percent"),
  Type.Literal("def"),
  Type.Literal("def_percent"),
  Type.Literal("elemental_mastery"),
  Type.Literal("energy_recharge"),
  Type.Literal("crit_rate"),
  Type.Literal("crit_damage"),
  Type.Literal("healing_bonus"),
  Type.Literal("physical_damage_bonus"),
  Type.Literal("anemo_damage_bonus"),
  Type.Literal("cryo_damage_bonus"),
  Type.Literal("dendro_damage_bonus"),
  Type.Literal("electro_damage_bonus"),
  Type.Literal("geo_damage_bonus"),
  Type.Literal("hydro_damage_bonus"),
  Type.Literal("pyro_damage_bonus")
])

export type ArtifactStat = Type.Static<typeof ArtifactStatSchema>

export const ArtifactStatValueSchema = Type.Object({
  stat: ArtifactStatSchema,
  value: Type.Number({ minimum: 0 })
})

export type ArtifactStatValue = Type.Static<typeof ArtifactStatValueSchema>

export const ArtifactPieceSchema = Type.Object({
  id: Type.String({ minLength: 1, maxLength: 80 }),
  level: Type.Integer({ minimum: 0, maximum: 20 }),
  mainStat: ArtifactStatValueSchema,
  rarity: Type.Integer({ minimum: 1, maximum: 5 }),
  setId: Type.String({ minLength: 1, maxLength: 100 }),
  slot: ArtifactSlotSchema,
  substats: Type.Array(ArtifactStatValueSchema, { maxItems: 4 })
})

export type ArtifactPiece = Type.Static<typeof ArtifactPieceSchema>

export const TalentLevelsSchema = Type.Object({
  burst: Type.Integer({ minimum: 1, maximum: 15 }),
  normal: Type.Integer({ minimum: 1, maximum: 15 }),
  skill: Type.Integer({ minimum: 1, maximum: 15 })
})

export type TalentLevels = Type.Static<typeof TalentLevelsSchema>

export const TravelerElementSchema = Type.Union([
  Type.Literal("anemo"),
  Type.Literal("dendro"),
  Type.Literal("electro"),
  Type.Literal("geo"),
  Type.Literal("hydro"),
  Type.Literal("pyro")
])

export type TravelerElement = Type.Static<typeof TravelerElementSchema>

export const TravelerGenderSchema = Type.Union([Type.Literal("female"), Type.Literal("male")])

export type TravelerGender = Type.Static<typeof TravelerGenderSchema>

/** Identifies the Traveler's active element and avatar-specific talent table. */
export const TravelerVariantSchema = Type.Object({
  element: TravelerElementSchema,
  gender: TravelerGenderSchema,
  kind: Type.Literal("traveler")
})

export type TravelerVariant = Type.Static<typeof TravelerVariantSchema>

const travelerElements: ReadonlySet<string> = new Set(["anemo", "dendro", "electro", "geo", "hydro", "pyro"])
const travelerGenders: ReadonlySet<string> = new Set(["female", "male"])

export const WeaponBuildSchema = Type.Object({
  ascension: Type.Integer({ minimum: 0, maximum: 6 }),
  level: Type.Integer({ minimum: 1, maximum: 90 }),
  refinement: Type.Integer({ minimum: 1, maximum: 5 }),
  weaponId: Type.String({ minLength: 1, maxLength: 100 })
})

export type WeaponBuild = Type.Static<typeof WeaponBuildSchema>

export const BuildSourceSchema = Type.Union([
  Type.Object({
    kind: Type.Literal("builtin"),
    presetId: Type.String({ minLength: 1, maxLength: 100 })
  }),
  Type.Object({
    kind: Type.Literal("local")
  }),
  Type.Object({
    importedAt: Type.String({ format: "date-time" }),
    kind: Type.Literal("showcase"),
    uid: Type.String({ pattern: "^[0-9]{9,10}$" })
  }),
  Type.Object({
    importedAt: Type.String({ format: "date-time" }),
    kind: Type.Literal("json")
  })
])

export type BuildSource = Type.Static<typeof BuildSourceSchema>

export const CharacterBuildSchema = Type.Object({
  artifacts: Type.Array(ArtifactPieceSchema, { maxItems: 5, minItems: 5 }),
  ascension: Type.Integer({ minimum: 0, maximum: 6 }),
  buildId: Type.String({ minLength: 1, maxLength: 100 }),
  characterId: Type.String({ minLength: 1, maxLength: 100 }),
  constellation: Type.Integer({ minimum: 0, maximum: 6 }),
  gameDataVersion: Type.String({ minLength: 1, maxLength: 20 }),
  label: Type.String({ minLength: 1, maxLength: 80 }),
  level: Type.Integer({ minimum: 1, maximum: 100 }),
  source: BuildSourceSchema,
  talents: TalentLevelsSchema,
  variant: Type.Optional(TravelerVariantSchema),
  weapon: WeaponBuildSchema
})

export type CharacterBuild = Type.Static<typeof CharacterBuildSchema>

const requiredSlots: readonly ArtifactSlot[] = ["flower", "plume", "sands", "goblet", "circlet"]

/** Performs cross-field validation that JSON Schema cannot express cleanly. */
export function validateCharacterBuild(build: CharacterBuild): readonly string[] {
  const errors: string[] = []
  const slots = new Set(build.artifacts.map((artifact) => artifact.slot))

  if (build.characterId === "Traveler" && !build.variant) {
    errors.push("Traveler builds must declare an element and gender variant")
  }
  if (build.characterId !== "Traveler" && build.variant) {
    errors.push("Only Traveler builds may declare a character variant")
  }
  if (build.variant) {
    const variant = build.variant as {
      readonly element: unknown
      readonly gender: unknown
      readonly kind: unknown
    }
    if (variant.kind !== "traveler") errors.push("Traveler variants must use kind traveler")
    if (typeof variant.element !== "string" || !travelerElements.has(variant.element)) {
      errors.push("Traveler variants must declare a supported element")
    }
    if (typeof variant.gender !== "string" || !travelerGenders.has(variant.gender)) {
      errors.push("Traveler variants must declare female or male gender")
    }
  }

  for (const slot of requiredSlots) {
    if (!slots.has(slot)) errors.push(`Missing artifact slot: ${slot}`)
  }
  if (slots.size !== build.artifacts.length) errors.push("Artifact slots must be unique")

  for (const artifact of build.artifacts) {
    const substatKeys = artifact.substats.map((substat) => substat.stat)
    if (new Set(substatKeys).size !== substatKeys.length) {
      errors.push(`Artifact ${artifact.id} contains duplicate substats`)
    }
    if (substatKeys.includes(artifact.mainStat.stat)) {
      errors.push(`Artifact ${artifact.id} repeats its main stat as a substat`)
    }
  }

  return errors
}
