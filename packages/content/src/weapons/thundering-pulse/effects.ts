import type { CombatActionEffect } from "../../combat/types.js"

export const THUNDERING_PULSE_ATTACK_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const THUNDERING_PULSE_NORMAL_DAMAGE_BONUS_BY_STACK = [
  [0.12, 0.15, 0.18, 0.21, 0.24],
  [0.24, 0.3, 0.36, 0.42, 0.48],
  [0.4, 0.5, 0.6, 0.7, 0.8]
] as const

const normalDamageStackCounts = [1, 2, 3] as const

function createNormalDamageStackEffect(
  stackCount: (typeof normalDamageStackCounts)[number]
): CombatActionEffect {
  const values = THUNDERING_PULSE_NORMAL_DAMAGE_BONUS_BY_STACK[stackCount - 1]
  if (!values) throw new Error("Thundering Pulse stack values are unavailable")
  return {
    activation: "active",
    exclusivity: { group: "thundering-pulse-thunder-emblem", variant: stackCount + "-stack" },
    id: "weapon.thundering-pulse.thunder-emblem." + stackCount + "-stack.normal-damage-bonus",
    label: "飞雷之弦振 · 飞雷之巴印" + stackCount + "层普通攻击伤害",
    source: { kind: "weapon", weaponId: "ThunderingPulse" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values }
  }
}

/** Typed self attack and selected Thunder Emblem contributions of Thundering Pulse. */
export const thunderingPulseCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.thundering-pulse.attack-percent",
    label: "飞雷之弦振 · 攻击力",
    source: { kind: "weapon", weaponId: "ThunderingPulse" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: THUNDERING_PULSE_ATTACK_PERCENT }
  },
  ...normalDamageStackCounts.map(createNormalDamageStackEffect)
]
