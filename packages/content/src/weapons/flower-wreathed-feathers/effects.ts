import type { CombatActionEffect } from "../../combat/types.js"

export const FLOWER_WREATHED_FEATHERS_CHARGED_DAMAGE_BONUS_PER_STACK = [0.06, 0.075, 0.09, 0.105, 0.12] as const

const stackCounts = [1, 2, 3, 4, 5, 6] as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return FLOWER_WREATHED_FEATHERS_CHARGED_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "flower-wreathed-feathers-aimed-shot", variant: `${stackCount}-stack` },
    id: `weapon.flower-wreathed-feathers.aimed-shot.${stackCount}-stack.charged-damage-bonus`,
    label: `缀花之翎 · 本次重击的${stackCount}层瞄准增伤`,
    source: { kind: "weapon", weaponId: "FlowerWreathedFeathers" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed selected aimed-shot stack contributions of Flower-Wreathed Feathers. */
export const flowerWreathedFeathersCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(createStackEffect)
