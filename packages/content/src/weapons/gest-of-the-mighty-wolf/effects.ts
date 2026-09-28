import type { CombatActionEffect } from "../../combat/types.js"
import { prepareMaximumWeaponStacks } from "../../combat/weapon-preparation.js"

export const GEST_OF_THE_MIGHTY_WOLF_DAMAGE_OR_CRIT_DAMAGE_PER_STACK = [0.075, 0.095, 0.115, 0.135, 0.155] as const

const stackCounts = [1, 2, 3, 4] as const

function getValues(stackCount: number): readonly number[] {
  return GEST_OF_THE_MIGHTY_WOLF_DAMAGE_OR_CRIT_DAMAGE_PER_STACK.map((value) => value * stackCount)
}

function createStackEffects(stackCount: (typeof stackCounts)[number]): readonly CombatActionEffect[] {
  return [
    {
      activation: "automatic",
      lifecycle: prepareMaximumWeaponStacks(stackCount, 4, { kind: "damage_hit", hitKinds: ["normal", "charged"], provider: "source", recipient: "source" }, true),
      exclusivity: { group: "gest-of-the-mighty-wolf-howl-damage", variant: `${stackCount}-stack` },
      id: `weapon.gest-of-the-mighty-wolf.howl.${stackCount}-stack.damage-bonus`,
      label: `狼的武功歌 · ${stackCount}层狼嚎全伤害`,
      source: { kind: "weapon", weaponId: "GestOfTheMightyWolf" },
      target: "damageBonus",
      value: { kind: "refinement_table", values: getValues(stackCount) }
    },
    {
      activation: "automatic",
      lifecycle: { kind: "all_of", alternatives: [
        prepareMaximumWeaponStacks(stackCount, 4, { kind: "damage_hit", hitKinds: ["normal", "charged"], provider: "source", recipient: "source" }, true),
        { kind: "conditional", preparation: "qualified", retention: "while_applicable", trigger: { event: "none", sourceFieldPresence: "any" }, applicability: { sourceHomework: true }, explanation: "用户确认的装备者本人魔导资格" }
      ] },
      condition: { kind: "hexerei_secret_rite" },
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
