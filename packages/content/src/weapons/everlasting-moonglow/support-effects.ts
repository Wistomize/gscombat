import { EVERLASTING_MOONGLOW_OUTGOING_HEALING_BONUS_BY_REFINEMENT, type HealingEquipmentEffect } from "../../rules/equipment/healing/types.js"

/** Entity-owned healing contributions; qualification is resolved by the shared lifecycle evaluator. */
export const everlastingMoonglowHealingEquipmentEffects: readonly HealingEquipmentEffect[] = [
  {
    id: "weapon.everlasting-moonglow.outgoing-healing-bonus",
    label: "不灭月华 · 治疗加成",
    source: { kind: "weapon", weaponId: "EverlastingMoonglow" },
    target: "outgoingHealingBonus",
    value: { kind: "refinement_table", values: EVERLASTING_MOONGLOW_OUTGOING_HEALING_BONUS_BY_REFINEMENT }
  }
]
