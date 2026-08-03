import type { CombatActionEffect } from "../../combat/types.js"

export const HAMAYUMI_NORMAL_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const HAMAYUMI_CHARGED_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const

/** Typed automatic and selected full-energy contributions of Hamayumi. */
export const hamayumiCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.hamayumi.normal-damage-bonus",
    label: "破魔之弓 · 普通攻击伤害",
    source: { kind: "weapon", weaponId: "Hamayumi" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: HAMAYUMI_NORMAL_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "weapon.hamayumi.charged-damage-bonus",
    label: "破魔之弓 · 重击伤害",
    source: { kind: "weapon", weaponId: "Hamayumi" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "refinement_table", values: HAMAYUMI_CHARGED_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "weapon.hamayumi.full-energy.normal-damage-bonus",
    label: "破魔之弓 · 元素能量为100%时（普通攻击额外伤害）",
    source: { kind: "weapon", weaponId: "Hamayumi" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal"] },
    value: { kind: "refinement_table", values: HAMAYUMI_NORMAL_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "weapon.hamayumi.full-energy.charged-damage-bonus",
    label: "破魔之弓 · 元素能量为100%时（重击额外伤害）",
    source: { kind: "weapon", weaponId: "Hamayumi" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "refinement_table", values: HAMAYUMI_CHARGED_DAMAGE_BONUS }
  }
]
