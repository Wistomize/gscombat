import type { CombatActionEffect } from "../../combat/types.js"

export const ARCHAIC_PETRA_GEO_DAMAGE_BONUS = 0.15
export const ARCHAIC_PETRA_CRYSTALLIZE_DAMAGE_BONUS = 0.35

const crystallizeElements = ["pyro", "hydro", "electro", "cryo"] as const

const crystallizeElementLabels: Record<(typeof crystallizeElements)[number], string> = {
  cryo: "冰",
  electro: "雷",
  hydro: "水",
  pyro: "火"
}

function createCrystallizeDamageBonusEffect(
  element: (typeof crystallizeElements)[number]
): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "archaic-petra-crystallize-element", variant: element },
    id: `artifact.archaic-petra.4pc.crystallize.${element}-damage-bonus`,
    label: `悠古的磐岩 · 已拾取${crystallizeElementLabels[element]}元素结晶`,
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "ArchaicPetra" },
    target: "damageBonus",
    targetFilter: { elements: [element] },
    value: { kind: "fixed", value: ARCHAIC_PETRA_CRYSTALLIZE_DAMAGE_BONUS }
  }
}

/** Typed two-piece Geo damage contribution of Archaic Petra to maintained core actions. */
export const archaicPetraCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.archaic-petra.2pc.geo-damage-bonus",
    label: "悠古的磐岩 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "ArchaicPetra" },
    target: "damageBonus",
    targetFilter: { elements: ["geo"] },
    value: { kind: "fixed", value: ARCHAIC_PETRA_GEO_DAMAGE_BONUS }
  },
  ...crystallizeElements.map(createCrystallizeDamageBonusEffect)
]
