import type { CombatActionEffect } from "../../combat/types.js"

export const KATSURAGIKIRI_NAGAMASA_SKILL_DAMAGE_BONUS_BY_REFINEMENT = [0.06, 0.075, 0.09, 0.105, 0.12] as const

/** Typed automatic Elemental Skill contribution of Katsuragikiri Nagamasa. */
export const katsuragikiriNagamasaCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.katsuragikiri-nagamasa.skill-damage-bonus",
    label: "桂木斩长正 · 元素战技伤害",
    source: { kind: "weapon", weaponId: "KatsuragikiriNagamasa" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: KATSURAGIKIRI_NAGAMASA_SKILL_DAMAGE_BONUS_BY_REFINEMENT }
  }
]
