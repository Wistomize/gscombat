import type { CombatActionEffect } from "../../combat/types.js"

export const PREDATOR_NORMAL_CHARGED_DAMAGE_BONUS_PER_STACK = 0.1

const stackCounts = [1, 2] as const

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "predator-strong-strike", variant: `${stackCount}-stack` },
    id: `weapon.predator.strong-strike.${stackCount}-stack.normal-charged-damage-bonus`,
    label: `掠食者 · PlayStation Network 被动已生效，造成冰元素伤害后的${stackCount}层普通攻击与重击伤害`,
    source: { kind: "weapon", weaponId: "Predator" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "fixed", value: PREDATOR_NORMAL_CHARGED_DAMAGE_BONUS_PER_STACK * stackCount }
  }
}

/** Typed selected PlayStation-passive Strong Strike stacks and Aloy-specific flat attack of Predator. */
export const predatorCombatActionEffects: readonly CombatActionEffect[] = [
  ...stackCounts.map(createStackEffect),
  {
    activation: "active",
    id: "weapon.predator.playstation.aloy.flat-attack",
    label: "掠食者 · PlayStation Network 被动已生效且埃洛伊装备时的固定攻击力",
    source: { kind: "weapon", weaponId: "Predator" },
    target: "flatAttack",
    targetFilter: { recipientCharacterIds: ["Aloy"] },
    value: { kind: "fixed", value: 66 }
  }
]
