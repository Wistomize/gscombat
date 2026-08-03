import type { CombatActionEffect } from "../../combat/types.js"

export const NOBLESSE_OBLIGE_BURST_DAMAGE_BONUS = 0.2

/** Typed automatic two-piece contribution of Noblesse Oblige to maintained Burst actions. */
export const noblesseObligeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.noblesse-oblige.2pc.burst-damage-bonus",
    label: "昔日宗室之仪 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "NoblesseOblige" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["burst"] },
    value: { kind: "fixed", value: NOBLESSE_OBLIGE_BURST_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "artifact.noblesse-oblige.4pc-attack",
    label: "昔日宗室之仪 · 四件套（当前动作前已触发）",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "NoblesseOblige" },
    target: "attackPercent",
    value: { kind: "fixed", value: 0.2 }
  }
]
