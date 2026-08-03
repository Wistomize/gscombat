import type { CombatActionEffect } from "../../combat/types.js"

export const SKYWARD_PRIDE_DAMAGE_BONUS_BY_REFINEMENT = [0.08, 0.1, 0.12, 0.14, 0.16] as const
export const SKYWARD_PRIDE_VACUUM_BLADE_COEFFICIENT_BY_REFINEMENT = [0.8, 1, 1.2, 1.4, 1.6] as const

/** Typed universal and selected post-Burst vacuum-blade contributions of Skyward Pride. */
export const skywardPrideCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.skyward-pride.damage-bonus",
    label: "天空之傲 · 造成的伤害",
    source: { kind: "weapon", weaponId: "SkywardPride" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: SKYWARD_PRIDE_DAMAGE_BONUS_BY_REFINEMENT }
  },
  {
    activation: "active",
    id: "weapon.skyward-pride.vacuum-blade",
    label: "天空之傲 · 真空刃（元素爆发后，本次命中可触发）",
    source: { kind: "weapon", weaponId: "SkywardPride" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: SKYWARD_PRIDE_VACUUM_BLADE_COEFFICIENT_BY_REFINEMENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
