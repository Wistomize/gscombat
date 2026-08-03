import type { CombatActionEffect } from "../../combat/types.js"

export const ULTIMATE_OVERLORDS_MEGA_MAGIC_SWORD_ATTACK_PERCENT = [
  0.12, 0.15, 0.18, 0.21, 0.24
] as const
export const ULTIMATE_OVERLORDS_MEGA_MAGIC_SWORD_ATTACK_PERCENT_PER_MELUSINE = [
  0.01, 0.0125, 0.015, 0.0175, 0.02
] as const

const melusineCounts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

function getMelusineAttackPercentValues(melusineCount: number): readonly number[] {
  return ULTIMATE_OVERLORDS_MEGA_MAGIC_SWORD_ATTACK_PERCENT_PER_MELUSINE.map(
    (value) => value * melusineCount
  )
}

function createMelusineEffect(melusineCount: (typeof melusineCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: {
      group: "ultimate-overlords-mega-magic-sword-melusine",
      variant: melusineCount + "-melusine"
    },
    id: "weapon.ultimate-overlords-mega-magic-sword.melusine." + melusineCount + "-stack.attack-percent",
    label: "「究极霸王超级魔剑」· 梅露辛" + melusineCount + "层额外攻击力",
    source: { kind: "weapon", weaponId: "UltimateOverlordsMegaMagicSword" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: getMelusineAttackPercentValues(melusineCount) }
  }
}

/** Typed self attack and selected Melusine contributions of Ultimate Overlord's Mega Magic Sword. */
export const ultimateOverlordsMegaMagicSwordCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.ultimate-overlords-mega-magic-sword.attack-percent",
    label: "「究极霸王超级魔剑」· 攻击力",
    source: { kind: "weapon", weaponId: "UltimateOverlordsMegaMagicSword" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: ULTIMATE_OVERLORDS_MEGA_MAGIC_SWORD_ATTACK_PERCENT }
  },
  ...melusineCounts.map(createMelusineEffect)
]
