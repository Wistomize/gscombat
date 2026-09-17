import { GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT, type RecipientEquipmentEffect } from "../../rules/equipment/recipient/types.js"

/** Entity-owned recipient contributions; qualification is resolved by the shared lifecycle evaluator. */
export const summitShaperRecipientEquipmentEffects: readonly RecipientEquipmentEffect[] = [
  {
    id: "weapon.summit-shaper.shield-strength",
    label: "斫峰之刃 · 护盾强效",
    source: { kind: "weapon", weaponId: "SummitShaper" },
    target: "shieldStrength",
    value: { kind: "refinement_table", values: GOLDEN_MAJESTY_SHIELD_STRENGTH_BY_REFINEMENT }
  }
]
