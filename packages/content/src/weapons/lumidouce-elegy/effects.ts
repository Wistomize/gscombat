import type { CombatActionEffect } from "../../combat/types.js"
import { prepareWeaponEffect } from "../../combat/weapon-preparation.js"

export const LUMIDOUCE_ELEGY_ATTACK_PERCENT = [0.15, 0.19, 0.23, 0.27, 0.31] as const
export const LUMIDOUCE_ELEGY_DAMAGE_BONUS_PER_STACK = [0.18, 0.23, 0.28, 0.33, 0.38] as const

const stackCounts = [1, 2] as const

function getDamageBonusValues(stackCount: number): readonly number[] {
  return LUMIDOUCE_ELEGY_DAMAGE_BONUS_PER_STACK.map((value) => value * stackCount)
}

function createStackEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "automatic",
    lifecycle: stackCount === 2 ? { kind: "all_of", alternatives: [
      prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "burning", provider: "party", recipient: "source" }, "队伍具备实际燃烧条件"),
      { kind: "any_of", alternatives: [prepareWeaponEffect({ kind: "reaction_trigger", reactionFamily: "burning", provider: "source", recipient: "source" }, "本人可触发燃烧"),
        prepareWeaponEffect({ kind: "damage_hit", elements: ["dendro"], provider: "source", recipient: "source" }, "本人可对燃烧目标造成草伤")] }
    ] } : { kind: "excluded", reason: "已确认按资格自动两层，旧手选不再决定状态" },
    selectionMode: "optional",
    exclusivity: { group: "lumidouce-elegy-burning", variant: `${stackCount}-stack` },
    id: `weapon.lumidouce-elegy.burning.${stackCount}-stack.damage-bonus`,
    label: `柔灯挽歌 · 燃烧触发后的${stackCount}层全伤害`,
    source: { kind: "weapon", weaponId: "LumidouceElegy" },
    target: "damageBonus",
    value: { kind: "refinement_table", values: getDamageBonusValues(stackCount) }
  }
}

/** Typed automatic attack and selected burning-state contributions of Lumidouce Elegy. */
export const lumidouceElegyCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.lumidouce-elegy.attack-percent",
    label: "柔灯挽歌 · 攻击力",
    source: { kind: "weapon", weaponId: "LumidouceElegy" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: LUMIDOUCE_ELEGY_ATTACK_PERCENT }
  },
  ...stackCounts.map(createStackEffect)
]
