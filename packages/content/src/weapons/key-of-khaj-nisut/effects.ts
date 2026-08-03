import type { CombatActionEffect } from "../../combat/types.js"

export const KEY_OF_KHAJ_NISUT_HP_PERCENT = [0.2, 0.25, 0.3, 0.35, 0.4] as const
export const KEY_OF_KHAJ_NISUT_GRAND_HYMN_FINAL_HP_TO_ELEMENTAL_MASTERY_BY_REFINEMENT = [
  0.0012,
  0.0015,
  0.0018,
  0.0021,
  0.0024
] as const
export const KEY_OF_KHAJ_NISUT_PARTY_FINAL_HP_TO_ELEMENTAL_MASTERY_BY_REFINEMENT = [
  0.002,
  0.0025,
  0.003,
  0.0035,
  0.004
] as const

const grandHymnStacks = [1, 2, 3] as const

function createGrandHymnStackEffect(stackCount: (typeof grandHymnStacks)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "key-of-khaj-nisut-grand-hymn", variant: `${stackCount}-stack` },
    id: `weapon.key-of-khaj-nisut.grand-hymn.${stackCount}-stack.final-hp-to-elemental-mastery`,
    label: `圣显之钥 · 当前核心动作前已持有${stackCount}层宏大诗篇（20秒内）`,
    source: { kind: "weapon", weaponId: "KeyOfKhajNisut" },
    target: "finalHpToElementalMastery",
    value: {
      kind: "refinement_table",
      values: KEY_OF_KHAJ_NISUT_GRAND_HYMN_FINAL_HP_TO_ELEMENTAL_MASTERY_BY_REFINEMENT.map(
        (value) => value * stackCount
      )
    }
  }
}

/** Typed automatic health and selected Grand Hymn contributions of Key of Khaj-Nisut. */
export const keyOfKhajNisutCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.key-of-khaj-nisut.hp-percent",
    label: "圣显之钥 · 生命值",
    source: { kind: "weapon", weaponId: "KeyOfKhajNisut" },
    target: "hpPercent",
    value: { kind: "refinement_table", values: KEY_OF_KHAJ_NISUT_HP_PERCENT }
  },
  ...grandHymnStacks.map(createGrandHymnStackEffect),
  {
    activation: "active",
    id: "weapon.key-of-khaj-nisut.grand-hymn.3-stack.party-source-final-hp-to-elemental-mastery",
    label: "圣显之钥 · 当前核心动作前已满3层宏大诗篇（队伍元素精通，20秒内）",
    source: { holder: "party_member", kind: "weapon", weaponId: "KeyOfKhajNisut" },
    target: "sourceFinalHpToElementalMastery",
    value: {
      kind: "final_hp",
      multiplier: {
        kind: "refinement_table",
        values: KEY_OF_KHAJ_NISUT_PARTY_FINAL_HP_TO_ELEMENTAL_MASTERY_BY_REFINEMENT
      }
    }
  }
]
