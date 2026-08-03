import type { CombatActionEffect } from "../../combat/types.js"

export const RAVEN_BOW_DAMAGE_BONUS_BY_REFINEMENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected target-aura contribution of Raven Bow to a maintained core action. */
export const ravenBowCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.raven-bow.hydro-or-pyro-aura.damage-bonus",
    label: "鸦羽弓 · 当前目标受水元素或火元素影响",
    source: { kind: "weapon", weaponId: "RavenBow" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: RAVEN_BOW_DAMAGE_BONUS_BY_REFINEMENT }
  }
]
