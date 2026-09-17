import type { CombatEffectLifecycle } from "../../../combat/capabilities.js"

export const RETRACING_BOLIDE_TWO_PIECE_SHIELD_STRENGTH = 0.35
export const TRAVELING_DOCTOR_TWO_PIECE_INCOMING_HEALING_BONUS = 0.2
export const MAIDEN_BELOVED_FOUR_PIECE_PARTY_INCOMING_HEALING_BONUS = 0.2
export const TENACITY_OF_THE_MILLELITH_FOUR_PIECE_PARTY_SHIELD_STRENGTH = 0.3
export const GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

type StaticRecipientEquipmentEffectSource =
  | {
      readonly kind: "artifact_set"
      readonly minimumPieces: 2
      readonly setId: string
    }
  | {
      readonly kind: "weapon"
      readonly weaponId: string
    }

type ActiveRecipientEquipmentEffectSource = {
  readonly holder: "party_member"
  readonly kind: "artifact_set"
  readonly minimumPieces: 4
  readonly setId: string
}

/** The equipment requirement for one bonus owned by the build receiving a metric. */
export type RecipientEquipmentEffectSource = StaticRecipientEquipmentEffectSource | ActiveRecipientEquipmentEffectSource

/** A fixed or refinement-indexed scalar owned by the build receiving a metric. */
export type RecipientEquipmentEffectValue =
  | { readonly kind: "fixed"; readonly value: number }
  | { readonly kind: "refinement_table"; readonly values: readonly [number, number, number, number, number] }

interface RecipientEquipmentEffectBase {
  readonly lifecycle?: CombatEffectLifecycle
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
      readonly activation: "active" | "automatic"
      readonly source: ActiveRecipientEquipmentEffectSource
    })
