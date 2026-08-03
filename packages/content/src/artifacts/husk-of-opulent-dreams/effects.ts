import type { CombatActionEffect } from "../../combat/types.js"

export const HUSK_OF_OPULENT_DREAMS_DEFENSE_PERCENT = 0.3
export const HUSK_OF_OPULENT_DREAMS_CURIOSITY_DEFENSE_PERCENT_PER_STACK = 0.06
export const HUSK_OF_OPULENT_DREAMS_CURIOSITY_GEO_DAMAGE_BONUS_PER_STACK = 0.06

const curiosityStackCounts = [1, 2, 3, 4] as const

function createCuriosityStackEffects(
  stackCount: (typeof curiosityStackCounts)[number]
): readonly CombatActionEffect[] {
  const label = `华馆梦醒形骸记 · 当前核心动作前已持有${stackCount}层问答（每层防御力与岩元素伤害）`
  const source = { kind: "artifact_set" as const, minimumPieces: 4 as const, setId: "HuskOfOpulentDreams" }
  const exclusivity = { group: "husk-of-opulent-dreams-curiosity", variant: `${stackCount}-stack` }

  return [
    {
      activation: "active",
      exclusivity,
      id: `artifact.husk-of-opulent-dreams.4pc.curiosity.${stackCount}-stack.defense-percent`,
      label,
      source,
      target: "defensePercent",
      value: { kind: "fixed", value: HUSK_OF_OPULENT_DREAMS_CURIOSITY_DEFENSE_PERCENT_PER_STACK * stackCount }
    },
    {
      activation: "active",
      exclusivity,
      id: `artifact.husk-of-opulent-dreams.4pc.curiosity.${stackCount}-stack.geo-damage-bonus`,
      label,
      source,
      target: "damageBonus",
      targetFilter: { elements: ["geo"] },
      value: { kind: "fixed", value: HUSK_OF_OPULENT_DREAMS_CURIOSITY_GEO_DAMAGE_BONUS_PER_STACK * stackCount }
    }
  ]
}

/** Typed two-piece and selected current-action Curiosity contributions of Husk of Opulent Dreams. */
export const huskOfOpulentDreamsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.husk-of-opulent-dreams.2pc.defense-percent",
    label: "华馆梦醒形骸记 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "HuskOfOpulentDreams" },
    target: "defensePercent",
    value: { kind: "fixed", value: HUSK_OF_OPULENT_DREAMS_DEFENSE_PERCENT }
  },
  ...curiosityStackCounts.flatMap(createCuriosityStackEffects)
]
