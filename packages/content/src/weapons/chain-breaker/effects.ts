import type { CombatActionEffect } from "../../combat/types.js"

export const CHAIN_BREAKER_ATTACK_PERCENT_PER_QUALIFYING_CHARACTER = [0.048, 0.06, 0.072, 0.084, 0.096] as const
export const CHAIN_BREAKER_ELEMENTAL_MASTERY_AT_THREE_OR_MORE_CHARACTERS = [24, 30, 36, 42, 48] as const

const qualifyingCharacterCounts = [1, 2, 3, 4] as const

function getAttackPercentValues(qualifyingCharacterCount: number): readonly number[] {
  return CHAIN_BREAKER_ATTACK_PERCENT_PER_QUALIFYING_CHARACTER.map((value) => value * qualifyingCharacterCount)
}

function createQualifyingCharacterEffects(
  qualifyingCharacterCount: (typeof qualifyingCharacterCounts)[number]
): readonly CombatActionEffect[] {
  const condition = {
    kind: "primary_different_element_or_region_party_count" as const,
    ...(qualifyingCharacterCount === 4 ? {} : { maximum: qualifyingCharacterCount }),
    minimum: qualifyingCharacterCount,
    region: "natlan"
  }
  const effectSuffix = `${qualifyingCharacterCount}-character`
  const exclusivity = { group: "chain-breaker-qualifying-party", variant: effectSuffix }
  const effects: CombatActionEffect[] = [
    {
      activation: "automatic",
      condition,
      exclusivity,
      id: `weapon.chain-breaker.qualifying-party.${effectSuffix}.attack-percent`,
      label: `碎链 · ${qualifyingCharacterCount}名符合条件角色的攻击力`,
      source: { kind: "weapon", weaponId: "ChainBreaker" },
      target: "attackPercent",
      value: { kind: "refinement_table", values: getAttackPercentValues(qualifyingCharacterCount) }
    }
  ]
  if (qualifyingCharacterCount >= 3) {
    effects.push({
      activation: "automatic",
      condition,
      exclusivity,
      id: `weapon.chain-breaker.qualifying-party.${effectSuffix}.elemental-mastery`,
      label: `碎链 · ${qualifyingCharacterCount}名符合条件角色的元素精通`,
      source: { kind: "weapon", weaponId: "ChainBreaker" },
      target: "elementalMastery",
      value: { kind: "refinement_table", values: CHAIN_BREAKER_ELEMENTAL_MASTERY_AT_THREE_OR_MORE_CHARACTERS }
    })
  }
  return effects
}

/** Typed selected qualifying-party-count contributions of Chain Breaker. */
export const chainBreakerCombatActionEffects: readonly CombatActionEffect[] = qualifyingCharacterCounts.flatMap(
  createQualifyingCharacterEffects
)
