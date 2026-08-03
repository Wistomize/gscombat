import type { CombatActionEffect } from "../../combat/types.js"

export const SKYWARD_BLADE_CRIT_RATE = [0.04, 0.05, 0.06, 0.07, 0.08] as const
export const SKYWARD_BLADE_PHYSICAL_COEFFICIENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const

/** Typed self critical-rate and selected burst-window physical-hit contributions of Skyward Blade. */
export const skywardBladeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.skyward-blade.crit-rate",
    label: "天空之刃 · 暴击率",
    source: { kind: "weapon", weaponId: "SkywardBlade" },
    target: "critRate",
    value: { kind: "refinement_table", values: SKYWARD_BLADE_CRIT_RATE }
  },
  {
    activation: "active",
    id: "weapon.skyward-blade.after-burst.additional-physical-damage",
    label: "天空之刃 · 施放元素爆发后的普通攻击或重击额外物理伤害",
    source: { kind: "weapon", weaponId: "SkywardBlade" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"], talentSlots: ["normal"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: SKYWARD_BLADE_PHYSICAL_COEFFICIENT },
      element: "physical",
      expectedTriggerProbability: 1,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]
