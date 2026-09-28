import type { CombatActionEffect } from "../../combat/types.js"
import { withWeaponToggle } from "../../combat/weapon-preparation.js"

export const RAVEN_BOW_DAMAGE_BONUS_BY_REFINEMENT = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed selected target-aura contribution of Raven Bow to a maintained core action. */
const authoredEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    selectionMode: "optional",
    id: "weapon.raven-bow.hydro-or-pyro-aura.damage-bonus",
    label: "鸦羽弓 · 当前目标受水元素或火元素影响",
    source: { kind: "weapon", weaponId: "RavenBow" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: RAVEN_BOW_DAMAGE_BONUS_BY_REFINEMENT }
  }
]

export const ravenBowCombatActionEffects: readonly CombatActionEffect[] = authoredEffects.flatMap((effect) =>
  withWeaponToggle(effect, "raven-bow-target-aura", "目标水／火附着", true).map((choice) => ({ ...choice,
    weaponChoice: { ...choice.weaponChoice!, targetAuraElements: ["hydro","pyro"] }
  }))
)
