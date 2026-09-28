import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const OATHSWORN_EYE_ENERGY_RECHARGE_BY_REFINEMENT = [0.24, 0.3, 0.36, 0.42, 0.48] as const

/** Typed selected post-Elemental-Skill energy-recharge contribution of Oathsworn Eye. */
export const oathswornEyeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "装备者可施放战技时自动准备；退场保留"),
    id: "weapon.oathsworn-eye.after-skill.energy-recharge",
    label: "证誓之明瞳 · 施放元素战技后",
    source: { kind: "weapon", weaponId: "OathswornEye" },
    target: "energyRecharge",
    value: { kind: "refinement_table", values: OATHSWORN_EYE_ENERGY_RECHARGE_BY_REFINEMENT }
  }
]
