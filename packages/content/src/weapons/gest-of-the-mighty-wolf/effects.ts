import type { CombatActionEffect } from "../../combat/types.js"

export const GEST_OF_THE_MIGHTY_WOLF_DAMAGE_OR_CRIT_DAMAGE_PER_STACK = [0.075, 0.095, 0.115, 0.135, 0.155] as const

const stackCounts = [1, 2, 3, 4] as const

function getValues(stackCount: number): readonly number[] {
  return GEST_OF_THE_MIGHTY_WOLF_DAMAGE_OR_CRIT_DAMAGE_PER_STACK.map((value) => value * stackCount)
}

function createStackEffects(stackCount: (typeof stackCounts)[number]): readonly CombatActionEffect[] {
  return [
    {
      activation: "active",
      exclusivity: { group: "gest-of-the-mighty-wolf-howl-damage", variant: `${stackCount}-stack` },
      id: `weapon.gest-of-the-mighty-wolf.howl.${stackCount}-stack.damage-bonus`,
      label: `狼的武功歌 · ${stackCount}层狼嚎全伤害`,
      source: { kind: "weapon", weaponId: "GestOfTheMightyWolf" },
      target: "damageBonus",
      value: { kind: "refinement_table", values: getValues(stackCount) }
    },
    {
      activation: "active",
      exclusivity: { group: "gest-of-the-mighty-wolf-howl-magic-secret", variant: `${stackCount}-stack` },
      id: `weapon.gest-of-the-mighty-wolf.magic-secret.${stackCount}-stack.crit-damage`,
      label: `狼的武功歌 · 魔导·秘仪下${stackCount}层狼嚎暴击伤害`,
      source: { kind: "weapon", weaponId: "GestOfTheMightyWolf" },
      target: "critDamage",
      value: { kind: "refinement_table", values: getValues(stackCount) }
    }
  ]
}

/** Typed selected Howl stack contributions of Gest of the Mighty Wolf. */
export const gestOfTheMightyWolfCombatActionEffects: readonly CombatActionEffect[] = stackCounts.flatMap(
  createStackEffects
)
