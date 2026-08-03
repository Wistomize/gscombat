import type { CombatActionEffect } from "../../combat/types.js"

export const VIRIDESCENT_VENERER_ANEMO_DAMAGE_BONUS = 0.15
export const VIRIDESCENT_VENERER_SWIRL_REACTION_DAMAGE_BONUS = 0.6
export const VIRIDESCENT_VENERER_SWIRLED_ELEMENT_RESISTANCE_REDUCTION = 0.4

const swirledElements = ["pyro", "hydro", "electro", "cryo"] as const

/** Typed two-piece, Swirl reaction-damage, and selected resistance-reduction contributions of Viridescent Venerer. */
export const viridescentVenererCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.viridescent-venerer.2pc.anemo-damage-bonus",
    label: "翠绿之影 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "ViridescentVenerer" },
    target: "damageBonus",
    targetFilter: { elements: ["anemo"] },
    value: { kind: "fixed", value: VIRIDESCENT_VENERER_ANEMO_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "artifact.viridescent-venerer.4pc.swirl.reaction-damage-bonus",
    label: "翠绿之影 · 四件套（扩散反应伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ViridescentVenerer" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["swirl"] },
    value: { kind: "fixed", value: VIRIDESCENT_VENERER_SWIRL_REACTION_DAMAGE_BONUS }
  },
  ...swirledElements.map((element) => ({
    activation: "active" as const,
    id: `artifact.viridescent-venerer.4pc.after-${element}-swirl.${element}-resistance-shred`,
    label: `翠绿之影 · 四件套（装备者扩散${
      { cryo: "冰", electro: "雷", hydro: "水", pyro: "火" }[element]
    }元素后）`,
    source: {
      holder: "party_member" as const,
      kind: "artifact_set" as const,
      minimumPieces: 4,
      setId: "ViridescentVenerer"
    },
    target: "enemyResistanceReduction" as const,
    targetFilter: { elements: [element] },
    value: { kind: "fixed" as const, value: VIRIDESCENT_VENERER_SWIRLED_ELEMENT_RESISTANCE_REDUCTION }
  }))
]
