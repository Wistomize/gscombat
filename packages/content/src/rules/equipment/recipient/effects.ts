/** Two-piece artifact sets whose bonus belongs to the build receiving the metric result. */
export const RECIPIENT_EQUIPMENT_TWO_PIECE_SET_IDS = ["RetracingBolide", "TravelingDoctor"] as const

/** Four-piece artifact sets that grant a selected active bonus to a party member receiving the metric result. */
export const ACTIVE_PARTY_RECIPIENT_EQUIPMENT_FOUR_PIECE_SET_IDS = ["MaidenBeloved", "TenacityOfTheMillelith"] as const

/** Weapons whose shield-strength passive belongs to the build receiving the shield metric. */
export const RECIPIENT_SHIELD_STRENGTH_WEAPON_IDS = [
  "MemoryOfDust",
  "SummitShaper",
  "TheUnforged",
  "VortexVanquisher"
] as const

export const RETRACING_BOLIDE_TWO_PIECE_SHIELD_STRENGTH = 0.35
export const TRAVELING_DOCTOR_TWO_PIECE_INCOMING_HEALING_BONUS = 0.2
export const MAIDEN_BELOVED_FOUR_PIECE_PARTY_INCOMING_HEALING_BONUS = 0.2
export const TENACITY_OF_THE_MILLELITH_FOUR_PIECE_PARTY_SHIELD_STRENGTH = 0.3
export const GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

type StaticRecipientEquipmentEffectSource =
  | {
      readonly kind: "artifact_set"
      readonly minimumPieces: 2
      readonly setId: (typeof RECIPIENT_EQUIPMENT_TWO_PIECE_SET_IDS)[number]
    }
  | {
      readonly kind: "weapon"
      readonly weaponId: (typeof RECIPIENT_SHIELD_STRENGTH_WEAPON_IDS)[number]
    }

type ActiveRecipientEquipmentEffectSource = {
  readonly holder: "party_member"
  readonly kind: "artifact_set"
  readonly minimumPieces: 4
  readonly setId: (typeof ACTIVE_PARTY_RECIPIENT_EQUIPMENT_FOUR_PIECE_SET_IDS)[number]
}

/** The equipment requirement for one bonus owned by the build receiving a metric. */
export type RecipientEquipmentEffectSource = StaticRecipientEquipmentEffectSource | ActiveRecipientEquipmentEffectSource

/** A fixed or refinement-indexed scalar owned by the build receiving a metric. */
export type RecipientEquipmentEffectValue =
  | { readonly kind: "fixed"; readonly value: number }
  | { readonly kind: "refinement_table"; readonly values: readonly [number, number, number, number, number] }

interface RecipientEquipmentEffectBase {
  readonly id: string
  readonly label: string
  readonly target: "incomingHealingBonus" | "shieldStrength"
  readonly value: RecipientEquipmentEffectValue
}

/** One typed recipient-side effect, static on the recipient or explicitly selected from a party holder. */
export type RecipientEquipmentEffect =
  | (RecipientEquipmentEffectBase & {
      readonly activation?: never
      readonly source: StaticRecipientEquipmentEffectSource
    })
  | (RecipientEquipmentEffectBase & {
      readonly activation: "active"
      readonly source: ActiveRecipientEquipmentEffectSource
    })

const recipientEquipmentEffects: readonly RecipientEquipmentEffect[] = [
  {
    id: "artifact.retracing-bolide.2pc.shield-strength",
    label: "逆飞的流星 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "RetracingBolide" },
    target: "shieldStrength",
    value: { kind: "fixed", value: RETRACING_BOLIDE_TWO_PIECE_SHIELD_STRENGTH }
  },
  {
    id: "artifact.traveling-doctor.2pc.incoming-healing-bonus",
    label: "游医 · 二件套（受到的治疗效果）",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "TravelingDoctor" },
    target: "incomingHealingBonus",
    value: { kind: "fixed", value: TRAVELING_DOCTOR_TWO_PIECE_INCOMING_HEALING_BONUS }
  },
  {
    activation: "active",
    id: "artifact.maiden-beloved.4pc.after-skill-or-burst.party-incoming-healing-bonus",
    label: "被怜爱的少女 · 四件套（已手填元素战技或元素爆发后10秒的队伍受治疗效果）",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "MaidenBeloved" },
    target: "incomingHealingBonus",
    value: { kind: "fixed", value: MAIDEN_BELOVED_FOUR_PIECE_PARTY_INCOMING_HEALING_BONUS }
  },
  {
    activation: "active",
    id: "artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-shield-strength",
    label: "千岩牢固 · 四件套（已手填元素战技命中后3秒的队伍护盾强效）",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "TenacityOfTheMillelith" },
    target: "shieldStrength",
    value: { kind: "fixed", value: TENACITY_OF_THE_MILLELITH_FOUR_PIECE_PARTY_SHIELD_STRENGTH }
  },
  {
    id: "weapon.memory-of-dust.shield-strength",
    label: "尘世之锁 · 护盾强效",
    source: { kind: "weapon", weaponId: "MemoryOfDust" },
    target: "shieldStrength",
    value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
  },
  {
    id: "weapon.summit-shaper.shield-strength",
    label: "斫峰之刃 · 护盾强效",
    source: { kind: "weapon", weaponId: "SummitShaper" },
    target: "shieldStrength",
    value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
  },
  {
    id: "weapon.the-unforged.shield-strength",
    label: "无工之剑 · 护盾强效",
    source: { kind: "weapon", weaponId: "TheUnforged" },
    target: "shieldStrength",
    value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
  },
  {
    id: "weapon.vortex-vanquisher.shield-strength",
    label: "贯虹之槊 · 护盾强效",
    source: { kind: "weapon", weaponId: "VortexVanquisher" },
    target: "shieldStrength",
    value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
  }
]

/** Lists typed equipment effects contributed only by the build receiving a shield or healing metric. */
export function listRecipientEquipmentEffects(): readonly RecipientEquipmentEffect[] {
  return recipientEquipmentEffects
}

/** Resolves one recipient-owned equipment value for the equipped weapon refinement. */
export function resolveRecipientEquipmentEffectValue(
  effect: RecipientEquipmentEffect,
  weaponRefinement: number
): number {
  if (effect.value.kind === "fixed") return effect.value.value

  if (!Number.isInteger(weaponRefinement) || weaponRefinement < 1 || weaponRefinement > effect.value.values.length) {
    throw new Error(
      `Recipient equipment effect ${effect.id} requires a weapon refinement from 1 to ${effect.value.values.length}`
    )
  }
  const value = effect.value.values.at(weaponRefinement - 1)
  if (value === undefined) throw new Error(`Missing recipient equipment value for ${effect.id}`)
  return value
}
