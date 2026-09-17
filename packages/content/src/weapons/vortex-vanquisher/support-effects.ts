import { GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT, type RecipientEquipmentEffect } from "../../rules/equipment/recipient/types.js"

/** Entity-owned recipient contributions; qualification is resolved by the shared lifecycle evaluator. */
export const vortexVanquisherRecipientEquipmentEffects: readonly RecipientEquipmentEffect[] = [
  {
    id: "weapon.vortex-vanquisher.shield-strength",
    label: "贯虹之槊 · 护盾强效",
    source: { kind: "weapon", weaponId: "VortexVanquisher" },
    target: "shieldStrength",
    value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
  }
]
