import type { CombatActionEffect } from "../../combat/types.js"

export const HERETICS_MOLTEN_BLADE_MAXIMUM_ATTACK_PERCENT = [0.36, 0.45, 0.54, 0.63, 0.72] as const

/** Typed maximum on-field movement contribution of Heretic's Molten Blade. */
export const hereticsMoltenBladeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.heretics-molten-blade.after-skill.maximum-movement.attack-percent",
    label: "熔猎异端之刃 · 施放元素战技后上一秒移动距离达到最高档（装备者保持在场）",
    source: { kind: "weapon", weaponId: "HereticsMoltenBlade" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: HERETICS_MOLTEN_BLADE_MAXIMUM_ATTACK_PERCENT }
  }
]
