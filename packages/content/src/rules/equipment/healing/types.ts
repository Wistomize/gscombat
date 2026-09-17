/** The fixed two-piece outgoing-healing bonus shared by the currently modeled healing artifact sets. */
export const TWO_PIECE_HEALING_BONUS = 0.15

/** 不灭月华的治疗加成，按精炼一至五阶排列。 */
export const EVERLASTING_MOONGLOW_OUTGOING_HEALING_BONUS_BY_REFINEMENT = [0.1, 0.125, 0.15, 0.175, 0.2] as const

/** The equipment requirement for one self-owned outgoing-healing bonus. */
export type HealingEquipmentEffectSource =
  | {
      readonly kind: "artifact_set"
      readonly minimumPieces: 2
      readonly setId: string
    }
  | {
      readonly kind: "weapon"
      readonly weaponId: string
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
