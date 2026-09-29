import type { HealingEquipmentEffect } from "../../rules/equipment/healing/types.js"

export const hymnOfTheMaelstromHealingEquipmentEffects: readonly HealingEquipmentEffect[] = [{
  id: "weapon.hymn-of-the-maelstrom.healing-bonus", label: "漩流颂歌 · 治疗加成",
  source: { kind: "weapon", weaponId: "HymnOfTheMaelstrom" }, target: "outgoingHealingBonus",
  value: { kind: "refinement_table", values: [0.04, 0.05, 0.06, 0.07, 0.08] }
}]
