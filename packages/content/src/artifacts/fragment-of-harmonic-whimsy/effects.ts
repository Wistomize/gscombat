import type { CombatActionEffect } from "../../combat/types.js"

export const FRAGMENT_OF_HARMONIC_WHIMSY_ATTACK_PERCENT = 0.18
export const FRAGMENT_OF_HARMONIC_WHIMSY_DAMAGE_BONUS_PER_STACK = 0.18

const stackCounts = [1, 2, 3] as const

function createBondOfLifeDamageBonusEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "fragment-of-harmonic-whimsy-bond-of-life-change", variant: `${stackCount}-stack` },
    id: `artifact.fragment-of-harmonic-whimsy.4pc.bond-of-life-change.${stackCount}-stack.damage-bonus`,
    label: `谐律异想断章 · 已达成${stackCount}层生命之契增减`,
    source: { kind: "artifact_set", minimumPieces: 4, setId: "FragmentOfHarmonicWhimsy" },
    target: "damageBonus",
    value: { kind: "fixed", value: FRAGMENT_OF_HARMONIC_WHIMSY_DAMAGE_BONUS_PER_STACK * stackCount }
  }
}

/** Typed two-piece and selected current-action Bond of Life stack contributions of Fragment of Harmonic Whimsy. */
export const fragmentOfHarmonicWhimsyCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.fragment-of-harmonic-whimsy.2pc.attack-percent",
    label: "谐律异想断章 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "FragmentOfHarmonicWhimsy" },
    target: "attackPercent",
    value: { kind: "fixed", value: FRAGMENT_OF_HARMONIC_WHIMSY_ATTACK_PERCENT }
  },
  ...stackCounts.map(createBondOfLifeDamageBonusEffect)
]
