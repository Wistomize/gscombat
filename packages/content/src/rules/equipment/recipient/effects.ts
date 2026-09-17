import { recipientEquipmentEffects } from "../../../registry/equipment-recipient-effects.generated.js"
import type { RecipientEquipmentEffect } from "./types.js"
export * from "./types.js"

/** Compatibility catalogs are projections of the generated entity registry. */
export const RECIPIENT_EQUIPMENT_TWO_PIECE_SET_IDS = recipientEquipmentEffects.flatMap((effect) =>
  effect.source.kind === "artifact_set" && effect.source.minimumPieces === 2 ? [effect.source.setId] : [])
export const ACTIVE_PARTY_RECIPIENT_EQUIPMENT_FOUR_PIECE_SET_IDS = recipientEquipmentEffects.flatMap((effect) =>
  effect.source.kind === "artifact_set" && effect.source.minimumPieces === 4 ? [effect.source.setId] : [])
export const RECIPIENT_SHIELD_STRENGTH_WEAPON_IDS = recipientEquipmentEffects.flatMap((effect) =>
  effect.source.kind === "weapon" && effect.target === "shieldStrength" ? [effect.source.weaponId] : [])

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
