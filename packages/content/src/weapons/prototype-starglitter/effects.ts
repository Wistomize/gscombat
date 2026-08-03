import type { CombatActionEffect } from "../../combat/types.js"

export const PROTOTYPE_STARGLITTER_NORMAL_CHARGED_DAMAGE_BONUS_PER_STACK = [0.08, 0.1, 0.12, 0.14, 0.16] as const

const stackCounts = [1, 2] as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return PROTOTYPE_STARGLITTER_NORMAL_CHARGED_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "prototype-starglitter-magic-affinity", variant: `${stackCount}-stack` },
    id: `weapon.prototype-starglitter.magic-affinity.${stackCount}-stack.normal-charged-damage-bonus`,
    label: `试作星镰 · 施放元素战技后的${stackCount}层普通攻击与重击伤害`,
    source: { kind: "weapon", weaponId: "PrototypeStarglitter" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed selected post-skill Magic Affinity stack contributions of Prototype Starglitter. */
export const prototypeStarglitterCombatActionEffects: readonly CombatActionEffect[] = stackCounts.map(createStackEffect)
