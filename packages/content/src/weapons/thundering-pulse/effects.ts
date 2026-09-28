import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

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
    activation: "automatic",
    lifecycle: stackCount === 2 ? { kind: "all_of", alternatives: [
      prepareWeaponEffect({ kind: "skill_cast", provider: "source", recipient: "source" }, "提前施放战技准备巴印"),
      prepareWeaponEffect({ kind: "damage_hit", provider: "source", recipient: "source", hitKinds: ["normal"] }, "提前普攻命中准备巴印")
    ] } : { kind: "excluded", reason: "总层数已由普攻、战技和能量状态分别决定，旧手选总层数不生效" },
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
  ...normalDamageStackCounts.map(createNormalDamageStackEffect),
  ...(["off", "on"] as const).map((variant): CombatActionEffect => ({
    activation: "active", selectionMode: "optional",
    weaponChoice: { group: "thundering-pulse-full-energy", label: "元素能量已满", variant,
      variantLabel: variant === "on" ? "是（两层巴印）" : "否（三层巴印）", defaultVariant: "off" },
    exclusivity: { group: "thundering-pulse-full-energy", variant },
    lifecycle: { kind: "conditional", preparation: "qualified", retention: "while_applicable",
      trigger: { event: "none", sourceFieldPresence: "any" }, applicability: { energyResource: "elemental" },
      explanation: "普通元素能量未满时额外取得第三枚巴印；不把特殊资源当普通能量" },
    id: `weapon.thundering-pulse.energy-not-full.${variant}.normal-damage-bonus`,
    label: "飞雷之弦振 · 未满能量第三层巴印额外普通攻击增伤",
    source: { kind: "weapon", weaponId: "ThunderingPulse" }, target: "damageBonus", targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: THUNDERING_PULSE_NORMAL_DAMAGE_BONUS_BY_STACK[2].map((value, index) =>
      variant === "on" ? 0 : Number((value - THUNDERING_PULSE_NORMAL_DAMAGE_BONUS_BY_STACK[1][index]!).toFixed(12))) }
  }))
]
