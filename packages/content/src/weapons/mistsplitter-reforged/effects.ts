import type { CombatActionEffect } from "../../combat/types.js"

export const MISTSPLITTER_REFORGED_ALL_ELEMENT_DAMAGE_BONUS = [0.12, 0.15, 0.18, 0.21, 0.24] as const
export const MISTSPLITTER_REFORGED_ONE_EMBLEM_DAMAGE_BONUS = [0.08, 0.1, 0.12, 0.14, 0.16] as const
export const MISTSPLITTER_REFORGED_TWO_EMBLEM_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const MISTSPLITTER_REFORGED_THREE_EMBLEM_DAMAGE_BONUS = [0.28, 0.35, 0.42, 0.49, 0.56] as const

const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const
const elementalLabels = {
  anemo: "风",
  cryo: "冰",
  dendro: "草",
  electro: "雷",
  geo: "岩",
  hydro: "水",
  pyro: "火"
} as const
const emblemStackEffects = [
  { stackCount: 1, values: MISTSPLITTER_REFORGED_ONE_EMBLEM_DAMAGE_BONUS },
  { stackCount: 2, values: MISTSPLITTER_REFORGED_TWO_EMBLEM_DAMAGE_BONUS },
  { stackCount: 3, values: MISTSPLITTER_REFORGED_THREE_EMBLEM_DAMAGE_BONUS }
] as const

function createEmblemEffect(
  element: (typeof elementalDamageElements)[number],
  stack: (typeof emblemStackEffects)[number]
): CombatActionEffect {
  return {
    activation: "active",
    lifecycle: { kind: "excluded", reason: "层数按独立准备条件自动计算，旧总层数不再覆盖" },
    exclusivity: { group: "mistsplitter-reforged-emblem", variant: `${element}-${stack.stackCount}-stack` },
    id: `weapon.mistsplitter-reforged.emblem.${element}.${stack.stackCount}-stack.damage-bonus`,
    label: `雾切之回光 · ${elementalLabels[element]}元素${stack.stackCount}层雾切之巴伤害`,
    source: { kind: "weapon", weaponId: "MistsplitterReforged" },
    target: "damageBonus",
    targetFilter: { elements: [element] },
    value: { kind: "refinement_table", values: stack.values }
  }
}

/** Native-element emblems use independent preparation sources, not an arbitrary full-stack default. */
export const mistsplitterReforgedCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.mistsplitter-reforged.all-element-damage-bonus",
    label: "雾切之回光 · 所有元素伤害",
    source: { kind: "weapon", weaponId: "MistsplitterReforged" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: { kind: "refinement_table", values: MISTSPLITTER_REFORGED_ALL_ELEMENT_DAMAGE_BONUS }
  },
  ...elementalDamageElements.flatMap((element) => emblemStackEffects.map((stack) => createEmblemEffect(element, stack))),
  ...elementalDamageElements.flatMap((element): CombatActionEffect[] => ([false, true].map((full) => ({
    activation: "active",
    id: `weapon.mistsplitter-reforged.prepared.${element}.${full ? "full" : "not-full"}`,
    label: `雾切之回光 · ${elementalLabels[element]}元素雾切之巴（独立条件自动叠层）`,
    source: { kind: "weapon", weaponId: "MistsplitterReforged" },
    exclusivity: { group: "mistsplitter-full-energy", variant: full ? "on" : "off" },
    weaponChoice: { group: "mistsplitter-full-energy", label: "元素能量已满", defaultVariant: "off",
      variant: full ? "on" : "off", variantLabel: full ? "已满" : "未满",
      fixedVariantByCharacter: { Skirk: "off" } },
    target: "damageBonus",
    targetFilter: { elements: [element], recipientNativeElements: [element] },
    value: { kind: "prepared_stack_refinement_table", includeBurstCast: true, includeEnergyNotFull: !full,
      specialEnergyNotFullCharacterIds: ["Skirk"],
      capability: { kind: "elemental_normal_hit", provider: "source", recipient: "source", hitKinds: ["normal", "charged"] },
      valuesByStack: [[0, 0, 0, 0, 0], MISTSPLITTER_REFORGED_ONE_EMBLEM_DAMAGE_BONUS,
        MISTSPLITTER_REFORGED_TWO_EMBLEM_DAMAGE_BONUS, MISTSPLITTER_REFORGED_THREE_EMBLEM_DAMAGE_BONUS] }
  }))))
]
