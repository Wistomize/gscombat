import type { CombatActionEffect } from "../../combat/types.js"

export const MAGIC_GUIDE_DAMAGE_BONUS_BY_REFINEMENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected target-aura contribution of Magic Guide to a maintained core action. */
export const magicGuideCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "weapon.magic-guide.hydro-or-electro-aura.damage-bonus",
    label: "魔导绪论 · 当前目标受水元素或雷元素影响",
    source: { kind: "weapon", weaponId: "MagicGuide" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: MAGIC_GUIDE_DAMAGE_BONUS_BY_REFINEMENT }
  }
]
