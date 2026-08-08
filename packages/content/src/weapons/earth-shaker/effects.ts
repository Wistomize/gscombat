import type { CombatActionEffect } from "../../combat/types.js"

export const EARTH_SHAKER_AFTER_PYRO_RELATED_REACTION_SKILL_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed selected post-Pyro-related-reaction contribution of Earth Shaker. */
export const earthShakerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.earth-shaker.after-pyro-related-reaction.skill-damage-bonus",
    label: "撼地者 · 队伍中任意角色触发火元素相关反应后8秒内",
    source: { kind: "weapon", weaponId: "EarthShaker" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "refinement_table", values: EARTH_SHAKER_AFTER_PYRO_RELATED_REACTION_SKILL_DAMAGE_BONUS }
  }
]
