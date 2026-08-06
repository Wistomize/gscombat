/** The fixed two-piece outgoing-healing bonus shared by the currently modeled healing artifact sets. */
export const TWO_PIECE_HEALING_BONUS = 0.15

/** Artifact set IDs whose two-piece effect grants the configured wearer outgoing healing bonus. */
export const HEALING_BONUS_TWO_PIECE_SET_IDS = [
  "MaidenBeloved",
  "OceanHuedClam",
  "SongOfDaysPast"
] as const

/** Weapons whose passive grants the configured wearer outgoing healing bonus. */
export const HEALING_BONUS_WEAPON_IDS = ["EverlastingMoonglow"] as const

/** 不灭月华的治疗加成，按精炼一至五阶排列。 */
export const EVERLASTING_MOONGLOW_OUTGOING_HEALING_BONUS_BY_REFINEMENT = [0.1, 0.125, 0.15, 0.175, 0.2] as const

const healingBonusTwoPieceSetIds = new Set<string>(HEALING_BONUS_TWO_PIECE_SET_IDS)

/** The equipment requirement for one self-owned outgoing-healing bonus. */
export type HealingEquipmentEffectSource =
  | {
      readonly kind: "artifact_set"
      readonly minimumPieces: 2
      readonly setId: (typeof HEALING_BONUS_TWO_PIECE_SET_IDS)[number]
    }
  | {
      readonly kind: "weapon"
      readonly weaponId: (typeof HEALING_BONUS_WEAPON_IDS)[number]
    }

/** A fixed or weapon-refinement-indexed outgoing-healing bonus. */
export type HealingEquipmentEffectValue =
  | { readonly kind: "fixed"; readonly value: number }
  | { readonly kind: "refinement_table"; readonly values: readonly [number, number, number, number, number] }

/** One typed self-owned equipment effect consumed by the outgoing-healing metric pipeline. */
export interface HealingEquipmentEffect {
  readonly id: string
  readonly label: string
  readonly source: HealingEquipmentEffectSource
  readonly target: "outgoingHealingBonus"
  readonly value: HealingEquipmentEffectValue
}

const healingEquipmentEffects: readonly HealingEquipmentEffect[] = [
  {
    id: "artifact.maiden-beloved.2pc.healing-bonus",
    label: "被怜爱的少女 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "MaidenBeloved" },
    target: "outgoingHealingBonus",
    value: { kind: "fixed", value: TWO_PIECE_HEALING_BONUS }
  },
  {
    id: "artifact.ocean-hued-clam.2pc.healing-bonus",
    label: "海染砗磲 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "OceanHuedClam" },
    target: "outgoingHealingBonus",
    value: { kind: "fixed", value: TWO_PIECE_HEALING_BONUS }
  },
  {
    id: "artifact.song-of-days-past.2pc.healing-bonus",
    label: "昔时之歌 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "SongOfDaysPast" },
    target: "outgoingHealingBonus",
    value: { kind: "fixed", value: TWO_PIECE_HEALING_BONUS }
  },
  {
    id: "weapon.everlasting-moonglow.outgoing-healing-bonus",
    label: "不灭月华 · 治疗加成",
    source: { kind: "weapon", weaponId: "EverlastingMoonglow" },
    target: "outgoingHealingBonus",
    value: { kind: "refinement_table", values: EVERLASTING_MOONGLOW_OUTGOING_HEALING_BONUS_BY_REFINEMENT }
  }
]

/** Lists typed self-owned equipment effects consumed by the outgoing-healing metric pipeline. */
export function listHealingEquipmentEffects(): readonly HealingEquipmentEffect[] {
  return healingEquipmentEffects
}

/** Resolves one self-owned outgoing-healing equipment value at the equipped weapon refinement. */
export function resolveHealingEquipmentEffectValue(effect: HealingEquipmentEffect, weaponRefinement: number): number {
  if (effect.value.kind === "fixed") return effect.value.value

  if (!Number.isInteger(weaponRefinement) || weaponRefinement < 1 || weaponRefinement > effect.value.values.length) {
    throw new Error(
      `Healing equipment effect ${effect.id} requires a weapon refinement from 1 to ${effect.value.values.length}`
    )
  }
  const value = effect.value.values.at(weaponRefinement - 1)
  if (value === undefined) throw new Error(`Missing healing equipment value for ${effect.id}`)
  return value
}

/** Returns the wearer's outgoing-healing bonus granted by a recognized two-piece artifact set. */
export function getTwoPieceHealingBonus(setId: string, pieceCount: number): number {
  return pieceCount >= 2 && healingBonusTwoPieceSetIds.has(setId) ? TWO_PIECE_HEALING_BONUS : 0
}
