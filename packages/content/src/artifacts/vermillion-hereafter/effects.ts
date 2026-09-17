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
    activation: "automatic",
    lifecycle: hpLossCount === 4 ? {
      kind: "conditional", preparation: "qualified", retention: "clear_on_exit",
      trigger: {
        event: "burst_cast", sourceFieldPresence: "on_field",
        capability: { kind: "hp_loss", recipient: "source" }
      },
      explanation: "默认已施放爆发；有效主动扣血来源按已确认策略准备满层"
    } : { kind: "excluded", reason: "旧手选层数兼容保留；由实际扣血资格自动决定零层或满层" },
    exclusivity: { group: "vermillion-hereafter-after-burst-hp-loss", variant: `${hpLossCount}-stack` },
    id: `artifact.vermillion-hereafter.4pc.after-burst.${hpLossCount}-stack.attack-percent`,
    label: `辰砂往生录 · 四件套（默认爆发后，有效扣血能力准备${hpLossCount}层）`,
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
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "clear_on_exit",
      trigger: {
        event: "burst_cast", sourceFieldPresence: "on_field",
        capability: { kind: "hp_loss", recipient: "source", present: false }
      },
      explanation: "默认已施放爆发；无有效主动扣血来源，仅计基础8%攻击"
    },
    exclusivity: { group: "vermillion-hereafter-after-burst-hp-loss", variant: "0-stack" },
    id: "artifact.vermillion-hereafter.4pc.after-burst.attack-percent",
    label: "辰砂往生录 · 四件套（施放元素爆发后，0次生命值降低）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "VermillionHereafter" },
    target: "attackPercent",
    value: { kind: "fixed", value: VERMILLION_HEREAFTER_AFTER_BURST_ATTACK_PERCENT }
  },
  ...hpLossCounts.map(createHpLossAttackEffect)
]
