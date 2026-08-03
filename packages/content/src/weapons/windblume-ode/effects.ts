import type { CombatActionEffect } from "../../combat/types.js"

export const WINDBLUME_ODE_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const

/** Typed selected post-skill attack contribution of Windblume Ode. */
export const windblumeOdeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.windblume-ode.after-skill.attack-percent",
    label: "风花之颂 · 此前施放元素战技后的6秒内攻击力",
    source: { kind: "weapon", weaponId: "WindblumeOde" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: WINDBLUME_ODE_ATTACK_PERCENT }
  }
]
