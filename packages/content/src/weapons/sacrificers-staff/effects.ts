import type { CombatActionEffect } from "../../combat/types.js"

export const SACRIFICERS_STAFF_ATTACK_PERCENT_PER_STACK = [0.08, 0.1, 0.12, 0.14, 0.16] as const
export const SACRIFICERS_STAFF_ENERGY_RECHARGE_PER_STACK = [0.06, 0.075, 0.09, 0.105, 0.12] as const

const stackCounts = [1, 2, 3] as const

function getValues(values: readonly number[], stackCount: number): readonly number[] {
  return values.map((value) => value * stackCount)
}

function createStackEffects(stackCount: (typeof stackCounts)[number]): readonly CombatActionEffect[] {
  const exclusivity = { group: "sacrificers-staff-sacrificial-rite", variant: `${stackCount}-stack` }
  return [
    {
      activation: "active",
      exclusivity,
      id: `weapon.sacrificers-staff.sacrificial-rite.${stackCount}-stack.attack-percent`,
      label: `圣祭者的辉杖 · 元素战技命中后的${stackCount}层攻击力`,
      source: { kind: "weapon", weaponId: "SacrificersStaff" },
      target: "attackPercent",
      value: { kind: "refinement_table", values: getValues(SACRIFICERS_STAFF_ATTACK_PERCENT_PER_STACK, stackCount) }
    },
    {
      activation: "active",
      exclusivity,
      id: `weapon.sacrificers-staff.sacrificial-rite.${stackCount}-stack.energy-recharge`,
      label: `圣祭者的辉杖 · 元素战技命中后的${stackCount}层元素充能效率`,
      source: { kind: "weapon", weaponId: "SacrificersStaff" },
      target: "energyRecharge",
      value: { kind: "refinement_table", values: getValues(SACRIFICERS_STAFF_ENERGY_RECHARGE_PER_STACK, stackCount) }
    }
  ]
}

/** Typed selected post-skill-hit Sacrificial Rite stack contributions of Sacrificer's Staff. */
export const sacrificersStaffCombatActionEffects: readonly CombatActionEffect[] = stackCounts.flatMap(createStackEffects)
