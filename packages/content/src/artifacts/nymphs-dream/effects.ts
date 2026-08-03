import type { CombatActionEffect } from "../../combat/types.js"

export const NYMPHS_DREAM_HYDRO_DAMAGE_BONUS = 0.15
export const NYMPHS_DREAM_MIRRORED_NYMPH_ATTACK_PERCENT_BY_STACK = [0.07, 0.16, 0.25] as const
export const NYMPHS_DREAM_MIRRORED_NYMPH_HYDRO_DAMAGE_BONUS_BY_STACK = [0.04, 0.09, 0.15] as const

const mirroredNymphStacks = [
  { attackPercent: 0.07, hydroDamageBonus: 0.04, label: "1层", stackCount: 1 },
  { attackPercent: 0.16, hydroDamageBonus: 0.09, label: "2层", stackCount: 2 },
  { attackPercent: 0.25, hydroDamageBonus: 0.15, label: "3层及以上", stackCount: 3 }
] as const

function createMirroredNymphStackEffects(
  stack: (typeof mirroredNymphStacks)[number]
): readonly CombatActionEffect[] {
  const label = `水仙之梦 · 当前核心动作前已持有${stack.label}镜中水仙（8秒内）`
  const source = { kind: "artifact_set" as const, minimumPieces: 4 as const, setId: "NymphsDream" }
  const exclusivity = { group: "nymphs-dream-mirrored-nymph", variant: `${stack.stackCount}-stack` }

  return [
    {
      activation: "active",
      exclusivity,
      id: `artifact.nymphs-dream.4pc.mirrored-nymph.${stack.stackCount}-stack.attack-percent`,
      label,
      source,
      target: "attackPercent",
      value: { kind: "fixed", value: stack.attackPercent }
    },
    {
      activation: "active",
      exclusivity,
      id: `artifact.nymphs-dream.4pc.mirrored-nymph.${stack.stackCount}-stack.hydro-damage-bonus`,
      label,
      source,
      target: "damageBonus",
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: stack.hydroDamageBonus }
    }
  ]
}

/** Typed two-piece and selected current-action Mirrored Nymph contributions of Nymph's Dream. */
export const nymphsDreamCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.nymphs-dream.2pc.hydro-damage-bonus",
    label: "水仙之梦 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "NymphsDream" },
    target: "damageBonus",
    targetFilter: { elements: ["hydro"] },
    value: { kind: "fixed", value: NYMPHS_DREAM_HYDRO_DAMAGE_BONUS }
  },
  ...mirroredNymphStacks.flatMap(createMirroredNymphStackEffects)
]
