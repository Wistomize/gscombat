import type { CombatActionEffect } from "../../combat/types.js"

const critRateByRefinement = [0.08, 0.1, 0.12, 0.14, 0.16] as const
const vacuumBladeCoefficientByRefinement = [0.4, 0.55, 0.7, 0.85, 1] as const

/** Typed automatic CRIT Rate contribution of Skyward Spine to any maintained action. */
export const skywardSpineCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.skyward-spine.crit-rate",
    label: "天空之脊 · 暴击率",
    source: { kind: "weapon", weaponId: "SkywardSpine" },
    target: "critRate",
    value: { kind: "refinement_table", values: critRateByRefinement }
  },
  {
    activation: "active",
    id: "weapon.skyward-spine.vacuum-blade",
    label: "天空之脊 · 真空刃（2秒冷却已就绪）",
    source: { kind: "weapon", weaponId: "SkywardSpine" },
    target: "additionalDamageEvent",
    targetFilter: { attackKinds: ["normal", "charged"], talentSlots: ["normal"] },
    value: {
      canCrit: true,
      coefficient: { kind: "refinement_table", values: vacuumBladeCoefficientByRefinement },
      element: "physical",
      expectedTriggerProbability: 0.5,
      kind: "additional_damage_event",
      reactionPolicy: "none",
      scalingStat: "attack"
    }
  }
]

/** Returns Skyward Spine's unconditional CRIT Rate bonus. */
export function getSkywardSpineCritRate(refinement: number): number {
  return critRateByRefinement[Math.min(Math.max(refinement, 1), 5) - 1] ?? critRateByRefinement[0]
}
