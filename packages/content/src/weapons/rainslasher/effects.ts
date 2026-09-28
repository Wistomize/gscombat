import type { CombatActionEffect } from "../../combat/types.js"
import { withWeaponToggle } from "../../combat/weapon-preparation.js"

export const RAINSLASHER_HYDRO_OR_ELECTRO_AURA_DAMAGE_BONUS = [0.2, 0.24, 0.28, 0.32, 0.36] as const

/** Typed selected target-aura contribution of Rainslasher to maintained core actions. */
const authoredEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.rainslasher.hydro-or-electro-aura.damage-bonus",
    label: "雨裁 · 当前目标受水元素或雷元素影响",
    source: { kind: "weapon", weaponId: "Rainslasher" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: RAINSLASHER_HYDRO_OR_ELECTRO_AURA_DAMAGE_BONUS }
  }
]

export const rainslasherCombatActionEffects: readonly CombatActionEffect[] = authoredEffects.flatMap((effect) =>
  withWeaponToggle(effect, "rainslasher-target-aura", "目标水／雷附着", true).map((choice) => ({ ...choice,
    weaponChoice: { ...choice.weaponChoice!, targetAuraElements: ["hydro","electro"] }
  }))
)
