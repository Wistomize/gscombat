import type { CombatActionEffect } from "../../combat/types.js"

export const FESTERING_DESIRE_SKILL_DAMAGE_BONUS_BY_REFINEMENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const FESTERING_DESIRE_SKILL_CRIT_RATE_BY_REFINEMENT = [0.06, 0.075, 0.09, 0.105, 0.12] as const

/** Typed automatic Elemental Skill contributions of Festering Desire. */
export const festeringDesireCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.festering-desire.skill-damage-bonus",
    label: "腐殖之剑 · 元素战技伤害",
    source: { kind: "weapon", weaponId: "FesteringDesire" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: FESTERING_DESIRE_SKILL_DAMAGE_BONUS_BY_REFINEMENT }
  },
  {
    activation: "automatic",
    id: "weapon.festering-desire.skill-crit-rate",
    label: "腐殖之剑 · 元素战技暴击率",
    source: { kind: "weapon", weaponId: "FesteringDesire" },
    target: "critRate",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: FESTERING_DESIRE_SKILL_CRIT_RATE_BY_REFINEMENT }
  }
]
