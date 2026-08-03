import type { CombatActionEffect } from "../../combat/types.js"

export const A_THOUSAND_FLOATING_DREAMS_SAME_ELEMENT_ELEMENTAL_MASTERY_BY_REFINEMENT = [32, 40, 48, 56, 64] as const
export const A_THOUSAND_FLOATING_DREAMS_DIFFERENT_ELEMENT_DAMAGE_BONUS_BY_REFINEMENT = [0.1, 0.14, 0.18, 0.22, 0.26] as const
export const A_THOUSAND_FLOATING_DREAMS_OTHER_PARTY_ELEMENTAL_MASTERY_BY_REFINEMENT = [40, 42, 44, 46, 48] as const

const elementalDamageElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const
const teammateCounts = [1, 2, 3] as const

function createSameElementTeammateEffect(
  teammateCount: (typeof teammateCounts)[number]
): CombatActionEffect {
  const suffix = teammateCount === 1 ? "teammate" : "teammates"
  return {
    activation: "automatic",
    condition: {
      kind: "primary_same_element_teammate_count",
      maximum: teammateCount,
      minimum: teammateCount
    },
    id: `weapon.a-thousand-floating-dreams.${teammateCount}-same-element-${suffix}.elemental-mastery`,
    label: `千夜浮梦 · ${teammateCount}名同元素队友提供的元素精通`,
    source: { kind: "weapon", weaponId: "AThousandFloatingDreams" },
    target: "elementalMastery",
    value: {
      kind: "refinement_table",
      values: A_THOUSAND_FLOATING_DREAMS_SAME_ELEMENT_ELEMENTAL_MASTERY_BY_REFINEMENT.map(
        (value) => value * teammateCount
      )
    }
  }
}

function createDifferentElementTeammateEffect(
  teammateCount: (typeof teammateCounts)[number]
): CombatActionEffect {
  const suffix = teammateCount === 1 ? "teammate" : "teammates"
  return {
    activation: "automatic",
    condition: {
      kind: "primary_different_element_teammate_count",
      maximum: teammateCount,
      minimum: teammateCount
    },
    id: `weapon.a-thousand-floating-dreams.${teammateCount}-different-element-${suffix}.damage-bonus`,
    label: `千夜浮梦 · ${teammateCount}名异元素队友提供的装备者元素伤害`,
    source: { kind: "weapon", weaponId: "AThousandFloatingDreams" },
    target: "damageBonus",
    targetFilter: { elements: elementalDamageElements },
    value: {
      kind: "refinement_table",
      values: A_THOUSAND_FLOATING_DREAMS_DIFFERENT_ELEMENT_DAMAGE_BONUS_BY_REFINEMENT.map(
        (value) => value * teammateCount
      )
    }
  }
}

/** Typed self-owned party-element-composition contributions of A Thousand Floating Dreams. */
export const aThousandFloatingDreamsCombatActionEffects: readonly CombatActionEffect[] = [
  ...teammateCounts.map(createSameElementTeammateEffect),
  ...teammateCounts.map(createDifferentElementTeammateEffect),
  {
    activation: "automatic",
    id: "weapon.a-thousand-floating-dreams.other-party.elemental-mastery",
    label: "千夜浮梦 · 其他队友的元素精通",
    source: {
      holder: "party_member",
      kind: "weapon",
      resolveAllMatchingPartySources: true,
      weaponId: "AThousandFloatingDreams"
    },
    target: "elementalMastery",
    targetFilter: { recipientSourceRelation: "not_source" },
    value: { kind: "refinement_table", values: A_THOUSAND_FLOATING_DREAMS_OTHER_PARTY_ELEMENTAL_MASTERY_BY_REFINEMENT }
  }
]
