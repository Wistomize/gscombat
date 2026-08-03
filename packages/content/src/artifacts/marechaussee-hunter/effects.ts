import type { CombatActionEffect } from "../../combat/types.js"

export const MARECHAUSSEE_HUNTER_NORMAL_CHARGED_DAMAGE_BONUS = 0.15
export const MARECHAUSSEE_HUNTER_CRIT_RATE_PER_STACK = 0.12

const stackCounts = [1, 2, 3] as const

function createHpChangeCritRateEffect(stackCount: (typeof stackCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "marechaussee-hunter-hp-change", variant: `${stackCount}-stack` },
    id: `artifact.marechaussee-hunter.4pc.hp-change.${stackCount}-stack.crit-rate`,
    label: `逐影猎人 · 已达成${stackCount}层生命值变化`,
    source: { kind: "artifact_set", minimumPieces: 4, setId: "MarechausseeHunter" },
    target: "critRate",
    value: { kind: "fixed", value: MARECHAUSSEE_HUNTER_CRIT_RATE_PER_STACK * stackCount }
  }
}

/** Typed two-piece and selected current-action HP-change stack contributions of Marechaussee Hunter. */
export const marechausseeHunterCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.marechaussee-hunter.2pc.normal-charged-damage-bonus",
    label: "逐影猎人 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "MarechausseeHunter" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "fixed", value: MARECHAUSSEE_HUNTER_NORMAL_CHARGED_DAMAGE_BONUS }
  },
  ...stackCounts.map(createHpChangeCritRateEffect)
]
