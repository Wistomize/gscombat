import type { CombatActionEffect } from "../../combat/types.js"

export const VERMILLION_HEREAFTER_ATTACK_PERCENT = 0.18
export const VERMILLION_HEREAFTER_AFTER_BURST_ATTACK_PERCENT = 0.08
export const VERMILLION_HEREAFTER_AFTER_HP_LOSS_ATTACK_PERCENT = [0.18, 0.28, 0.38, 0.48] as const

const hpLossCounts = [1, 2, 3, 4] as const

function getHpLossAttackPercent(hpLossCount: (typeof hpLossCounts)[number]): number {
  const attackPercent = VERMILLION_HEREAFTER_AFTER_HP_LOSS_ATTACK_PERCENT[hpLossCount - 1]
  if (attackPercent === undefined) throw new Error("Vermillion Hereafter HP-loss attack value is unavailable")
  return attackPercent
}

function createHpLossAttackEffect(hpLossCount: (typeof hpLossCounts)[number]): CombatActionEffect {
  return {
    activation: "active",
    exclusivity: { group: "vermillion-hereafter-after-burst-hp-loss", variant: `${hpLossCount}-stack` },
    id: `artifact.vermillion-hereafter.4pc.after-burst.${hpLossCount}-stack.attack-percent`,
    label: `辰砂往生录 · 四件套（施放元素爆发后，已触发${hpLossCount}次生命值降低）`,
    source: { kind: "artifact_set", minimumPieces: 4, setId: "VermillionHereafter" },
    target: "attackPercent",
    value: { kind: "fixed", value: getHpLossAttackPercent(hpLossCount) }
  }
}

/** Typed two-piece and current-action post-Burst HP-loss snapshots of Vermillion Hereafter. */
export const vermillionHereafterCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.vermillion-hereafter.2pc.attack-percent",
    label: "辰砂往生录 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "VermillionHereafter" },
    target: "attackPercent",
    value: { kind: "fixed", value: VERMILLION_HEREAFTER_ATTACK_PERCENT }
  },
  {
    activation: "active",
    exclusivity: { group: "vermillion-hereafter-after-burst-hp-loss", variant: "0-stack" },
    id: "artifact.vermillion-hereafter.4pc.after-burst.attack-percent",
    label: "辰砂往生录 · 四件套（施放元素爆发后，0次生命值降低）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "VermillionHereafter" },
    target: "attackPercent",
    value: { kind: "fixed", value: VERMILLION_HEREAFTER_AFTER_BURST_ATTACK_PERCENT }
  },
  ...hpLossCounts.map(createHpLossAttackEffect)
]
