import { GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT, type RecipientEquipmentEffect } from "../../rules/equipment/recipient/types.js"

/** Entity-owned recipient contributions; qualification is resolved by the shared lifecycle evaluator. */
export const memoryOfDustRecipientEquipmentEffects: readonly RecipientEquipmentEffect[] = [
  {
    id: "weapon.memory-of-dust.shield-strength",
    label: "尘世之锁 · 护盾强效",
    source: { kind: "weapon", weaponId: "MemoryOfDust" },
    target: "shieldStrength",
    value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
  }
]
