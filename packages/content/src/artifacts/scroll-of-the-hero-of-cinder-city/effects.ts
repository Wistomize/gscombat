import type { CombatActionEffect } from "../../combat/types.js"

export const SCROLL_OF_THE_HERO_OF_CINDER_CITY_REACTION_ELEMENT_DAMAGE_BONUS = 0.12
export const SCROLL_OF_THE_HERO_OF_CINDER_CITY_NIGHTSOUL_REACTION_ELEMENT_DAMAGE_BONUS = 0.4

const reactionRelatedElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const
const reactionRelatedElementLabels = {
  anemo: "风",
  cryo: "冰",
  dendro: "草",
  electro: "雷",
  geo: "岩",
  hydro: "水",
  pyro: "火"
} as const
const reactionSnapshotStates = ["standard", "nightsoul"] as const

function createReactionElementDamageBonusEffect(
  element: (typeof reactionRelatedElements)[number],
  state: (typeof reactionSnapshotStates)[number]
): CombatActionEffect {
  const isNightsoul = state === "nightsoul"
  return {
    activation: "active",
    exclusivity: {
      group: `scroll-of-the-hero-of-cinder-city-reaction-element-${element}`,
      variant: state
    },
    id: `artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.${element}.${state}.damage-bonus`,
    label: `烬城勇者绘卷 · ${reactionRelatedElementLabels[element]}元素关联反应已触发（触发者${isNightsoul ? "处于" : "未处于"}夜魂加持）`,
    source: {
      holder: "party_member",
      kind: "artifact_set",
      minimumPieces: 4,
      setId: "ScrollOfTheHeroOfCinderCity"
    },
    target: "damageBonus",
    targetFilter: { elements: [element] },
    value: {
      kind: "fixed",
      value: isNightsoul
        ? SCROLL_OF_THE_HERO_OF_CINDER_CITY_NIGHTSOUL_REACTION_ELEMENT_DAMAGE_BONUS
        : SCROLL_OF_THE_HERO_OF_CINDER_CITY_REACTION_ELEMENT_DAMAGE_BONUS
    }
  }
}

/** Typed explicit reaction-element team snapshots of Scroll of the Hero of Cinder City. */
export const scrollOfTheHeroOfCinderCityCombatActionEffects: readonly CombatActionEffect[] =
  reactionRelatedElements.flatMap((element) =>
    reactionSnapshotStates.map((state) => createReactionElementDamageBonusEffect(element, state))
  )
