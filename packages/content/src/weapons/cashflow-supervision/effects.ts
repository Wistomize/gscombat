import type { CombatActionEffect } from "../../combat/types.js"

export const CASHFLOW_SUPERVISION_ATTACK_PERCENT = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const CASHFLOW_SUPERVISION_NORMAL_DAMAGE_BONUS_PER_STACK = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const CASHFLOW_SUPERVISION_CHARGED_DAMAGE_BONUS_PER_STACK = [0.14, 0.175, 0.21, 0.245, 0.28] as const
export const CASHFLOW_SUPERVISION_STELLAR_SUPERCONDUCT_DAMAGE_BONUS_PER_STACK = [
  0.14,
  0.175,
  0.21,
  0.245,
  0.28
] as const

const hpChangeStackCounts = [1, 2, 3] as const

function getStackValues(values: readonly number[], stackCount: number): readonly number[] {
  return values.map((value) => value * stackCount)
}

function createHpChangeStackEffect(
  stackCount: (typeof hpChangeStackCounts)[number],
  attackKind: "normal" | "charged",
  values: readonly number[]
): CombatActionEffect {
  const actionLabel = attackKind === "normal" ? "普通攻击" : "重击"
  return {
    activation: "active",
    exclusivity: { group: "cashflow-supervision-hp-change", variant: `${stackCount}-stack` },
    id: `weapon.cashflow-supervision.hp-change.${stackCount}-stack.${attackKind}-damage-bonus`,
    label: `金流监督 · 生命值变化后的${stackCount}层${actionLabel}伤害`,
    source: { kind: "weapon", weaponId: "CashflowSupervision" },
    target: "damageBonus",
    targetFilter: { attackKinds: [attackKind] },
    value: { kind: "refinement_table", values: getStackValues(values, stackCount) }
  }
}

function createHpChangeStellarSuperconductStackEffect(
  stackCount: (typeof hpChangeStackCounts)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "cashflow-supervision-hp-change", variant: `${stackCount}-stack` },
    id: `weapon.cashflow-supervision.hp-change.${stackCount}-stack.star-superconduct-damage-bonus`,
    label: `金流监督 · 生命值变化后的${stackCount}层星超导伤害`,
    source: { kind: "weapon", weaponId: "CashflowSupervision" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["stellar_superconduct"] },
    value: {
      kind: "refinement_table",
      values: getStackValues(CASHFLOW_SUPERVISION_STELLAR_SUPERCONDUCT_DAMAGE_BONUS_PER_STACK, stackCount)
    }
  }
}

/** Typed self attack and selected HP-change stack contributions of Cashflow Supervision. */
export const cashflowSupervisionCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.cashflow-supervision.attack-percent",
    label: "金流监督 · 攻击力",
    source: { kind: "weapon", weaponId: "CashflowSupervision" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: CASHFLOW_SUPERVISION_ATTACK_PERCENT }
  },
  ...hpChangeStackCounts.flatMap((stackCount) => [
    createHpChangeStackEffect(stackCount, "normal", CASHFLOW_SUPERVISION_NORMAL_DAMAGE_BONUS_PER_STACK),
    createHpChangeStackEffect(stackCount, "charged", CASHFLOW_SUPERVISION_CHARGED_DAMAGE_BONUS_PER_STACK),
    createHpChangeStellarSuperconductStackEffect(stackCount)
  ])
]
