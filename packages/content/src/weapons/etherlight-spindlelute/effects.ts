import type { CombatActionEffect } from "../../combat/types.js"

export const ETHERLIGHT_SPINDLELUTE_AFTER_SKILL_ELEMENTAL_MASTERY = [100, 125, 150, 175, 200] as const

/** Typed selected post-skill elemental-mastery contribution of Etherlight Spindlelute. */
export const etherlightSpindleluteCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.etherlight-spindlelute.after-skill.elemental-mastery",
    label: "天光的纺琴 · 施放元素战技后20秒内",
    source: { kind: "weapon", weaponId: "EtherlightSpindlelute" },
    target: "elementalMastery",
    value: { kind: "refinement_table", values: ETHERLIGHT_SPINDLELUTE_AFTER_SKILL_ELEMENTAL_MASTERY }
  }
]
