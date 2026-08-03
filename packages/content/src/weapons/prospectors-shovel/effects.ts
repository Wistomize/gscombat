import type { CombatActionEffect } from "../../combat/types.js"

export const PROSPECTORS_SHOVEL_ELECTRO_CHARGED_REACTION_DAMAGE_BONUS = [0.48, 0.6, 0.72, 0.84, 0.96] as const
export const PROSPECTORS_SHOVEL_LUNAR_CHARGED_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected Electro-Charged-reaction damage contribution of Prospector's Shovel. */
export const prospectorsShovelCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.prospectors-shovel.electro-charged.reaction-damage-bonus",
    label: "掘金之锹 · 感电反应伤害",
    source: { kind: "weapon", weaponId: "ProspectorsShovel" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["electro_charged"] },
    value: { kind: "refinement_table", values: PROSPECTORS_SHOVEL_ELECTRO_CHARGED_REACTION_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "weapon.prospectors-shovel.lunar-charged.reaction-damage-bonus",
    label: "掘金之锹 · 月感电反应伤害",
    source: { kind: "weapon", weaponId: "ProspectorsShovel" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["lunar_charged"] },
    value: { kind: "refinement_table", values: PROSPECTORS_SHOVEL_LUNAR_CHARGED_DAMAGE_BONUS }
  },
  {
    activation: "active",
    condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
    id: "weapon.prospectors-shovel.full-moonsign.lunar-charged.reaction-damage-bonus",
    label: "掘金之锹 · 月兆满辉时的月感电反应伤害",
    source: { kind: "weapon", weaponId: "ProspectorsShovel" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["lunar_charged"] },
    value: { kind: "refinement_table", values: PROSPECTORS_SHOVEL_LUNAR_CHARGED_DAMAGE_BONUS }
  }
]
