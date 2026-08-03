import type { CombatActionEffect } from "../../combat/types.js"

export const HAKUSHIN_RING_RELATED_ELEMENT_DAMAGE_BONUS = [0.1, 0.125, 0.15, 0.175, 0.2] as const

const reactionElementPairs = [
  { elements: ["electro", "pyro"] as const, id: "overloaded", label: "超载" },
  { elements: ["electro", "cryo"] as const, id: "superconduct", label: "超导" },
  { elements: ["electro", "hydro"] as const, id: "electro-charged", label: "感电" },
  { elements: ["electro", "anemo"] as const, id: "swirl", label: "扩散" },
  { elements: ["electro", "geo"] as const, id: "crystallize", label: "结晶" },
  { elements: ["electro", "dendro"] as const, id: "aggravate", label: "激化" }
] as const

function createReactionEffect(
  reaction: (typeof reactionElementPairs)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "hakushin-ring-reaction", variant: reaction.id },
    id: `weapon.hakushin-ring.${reaction.id}-related-element-damage-bonus`,
    label: `白辰之环 · 持有者触发${reaction.label}后的关联元素伤害`,
    source: { holder: "party_member", kind: "weapon", weaponId: "HakushinRing" },
    target: "damageBonus",
    targetFilter: { elements: reaction.elements },
    value: { kind: "refinement_table", values: HAKUSHIN_RING_RELATED_ELEMENT_DAMAGE_BONUS }
  }
}

/** Typed party-owned related-element snapshots of Hakushin Ring. */
export const hakushinRingCombatActionEffects: readonly CombatActionEffect[] = reactionElementPairs.map(createReactionEffect)
