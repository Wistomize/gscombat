import { GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT, type RecipientEquipmentEffect } from "../../rules/equipment/recipient/types.js"

/** Entity-owned recipient contributions; qualification is resolved by the shared lifecycle evaluator. */
export const theUnforgedRecipientEquipmentEffects: readonly RecipientEquipmentEffect[] = [
  {
    id: "weapon.the-unforged.shield-strength",
    label: "无工之剑 · 护盾强效",
    source: { kind: "weapon", weaponId: "TheUnforged" },
    target: "shieldStrength",
    value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
  }
]
