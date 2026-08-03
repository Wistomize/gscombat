import type { CombatActionEffect } from "../../combat/types.js"

export const CELESTIAL_GIFT_ENERGY_RECHARGE = 0.2
export const CELESTIAL_GIFT_CELESTIAL_GUIDANCE_DAMAGE_BONUS = 0.2
export const CELESTIAL_GIFT_MORTAL_HYMN_DAMAGE_BONUS = 0.4

const celestialGiftElements = ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"] as const
const celestialGiftElementLabels = {
  anemo: "风",
  cryo: "冰",
  dendro: "草",
  electro: "雷",
  geo: "岩",
  hydro: "水",
  pyro: "火"
} as const
const celestialGiftSnapshotStates = ["celestial-guidance", "mortal-hymn"] as const

function createCelestialGiftElementDamageBonusEffect(
  element: (typeof celestialGiftElements)[number],
  state: (typeof celestialGiftSnapshotStates)[number]
): CombatActionEffect {
  const isMortalHymn = state === "mortal-hymn"
  return {
    activation: "active",
    ...(isMortalHymn ? { condition: { kind: "hexerei_secret_rite" as const } } : {}),
    exclusivity: {
      group: `celestial-gift-4pc-${element}-damage-bonus`,
      variant: state
    },
    id: `artifact.celestial-gift.4pc.${state}.${element}.damage-bonus`,
    label: isMortalHymn
      ? `天之美赐 · 凡世颂歌（已完成魔女的课业且队伍拥有魔导·秘仪，装备者或当前前台为${celestialGiftElementLabels[element]}元素；施放元素战技后20秒内）`
      : `天之美赐 · 天光之引（已完成魔女的课业，装备者为${celestialGiftElementLabels[element]}元素；施放元素战技后20秒内）`,
    source: {
      holder: "party_member",
      kind: "artifact_set",
      minimumPieces: 4,
      setId: "CelestialGift"
    },
    target: "damageBonus",
    targetFilter: { elements: [element] },
    value: {
      kind: "fixed",
      value: isMortalHymn ? CELESTIAL_GIFT_MORTAL_HYMN_DAMAGE_BONUS : CELESTIAL_GIFT_CELESTIAL_GUIDANCE_DAMAGE_BONUS
    }
  }
}

/** Typed two-piece energy recharge contribution of Celestial Gift to maintained core actions. */
export const celestialGiftCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.celestial-gift.2pc.energy-recharge",
    label: "天之美赐 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "CelestialGift" },
    target: "energyRecharge",
    value: { kind: "fixed", value: CELESTIAL_GIFT_ENERGY_RECHARGE }
  },
  ...celestialGiftElements.flatMap((element) =>
    celestialGiftSnapshotStates.map((state) => createCelestialGiftElementDamageBonusEffect(element, state))
  )
]
