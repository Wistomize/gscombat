import { healingEquipmentEffects } from "../../../registry/equipment-healing-effects.generated.js"
import type { HealingEquipmentEffect } from "./types.js"
export * from "./types.js"

/** Compatibility catalog derived from entity declarations, never a second maintained whitelist. */
export const HEALING_BONUS_TWO_PIECE_SET_IDS = healingEquipmentEffects.flatMap((effect) =>
  effect.source.kind === "artifact_set" ? [effect.source.setId] : [])
export const HEALING_BONUS_WEAPON_IDS = healingEquipmentEffects.flatMap((effect) =>
  effect.source.kind === "weapon" ? [effect.source.weaponId] : [])

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
  return healingEquipmentEffects.reduce((sum, effect) => sum + (
    effect.source.kind === "artifact_set" && effect.source.setId === setId &&
    pieceCount >= effect.source.minimumPieces && effect.value.kind === "fixed" ? effect.value.value : 0
  ), 0)
}
