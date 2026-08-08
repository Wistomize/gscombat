import type { CombatActionEffect } from "../../combat/types.js"

export const THE_FIRST_GREAT_MAGIC_CHARGED_DAMAGE_BONUS = [0.16, 0.2, 0.24, 0.28, 0.32] as const
export const THE_FIRST_GREAT_MAGIC_ATTACK_PERCENT_PER_SAME_ELEMENT_CHARACTER = [0.16, 0.2, 0.24, 0.28, 0.32] as const

const sameElementCharacterCounts = [1, 2, 3] as const

function getAttackPercentValues(sameElementCharacterCount: number): readonly number[] {
  return THE_FIRST_GREAT_MAGIC_ATTACK_PERCENT_PER_SAME_ELEMENT_CHARACTER.map(
    (value) => value * sameElementCharacterCount
  )
}

function createSameElementCharacterEffect(
  sameElementCharacterCount: (typeof sameElementCharacterCounts)[number]
): CombatActionEffect {
  const sameElementTeammateCount = sameElementCharacterCount - 1
  return {
    activation: "automatic",
    condition: {
      kind: "primary_same_element_teammate_count",
      ...(sameElementCharacterCount === 3 ? {} : { maximum: sameElementTeammateCount }),
      minimum: sameElementTeammateCount
    },
    exclusivity: { group: "the-first-great-magic-same-element-party", variant: `${sameElementCharacterCount}-character` },
    id: `weapon.the-first-great-magic.same-element-party.${sameElementCharacterCount}-character.attack-percent`,
    label: `最初的大魔术 · ${sameElementCharacterCount}名同元素角色的攻击力`,
    source: { kind: "weapon", weaponId: "TheFirstGreatMagic" },
    target: "attackPercent",
    value: { kind: "refinement_table", values: getAttackPercentValues(sameElementCharacterCount) }
  }
}

/** Typed automatic charged and selected same-element-party contributions of The First Great Magic. */
export const theFirstGreatMagicCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "weapon.the-first-great-magic.charged-damage-bonus",
    label: "最初的大魔术 · 重击伤害",
    source: { kind: "weapon", weaponId: "TheFirstGreatMagic" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "refinement_table", values: THE_FIRST_GREAT_MAGIC_CHARGED_DAMAGE_BONUS }
  },
  ...sameElementCharacterCounts.map(createSameElementCharacterEffect)
]
