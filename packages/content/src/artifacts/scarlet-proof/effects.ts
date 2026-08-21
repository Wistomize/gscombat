import type { CombatActionEffect } from "../../combat/types.js"

export const SCARLET_PROOF_ATTACK_PERCENT = 0.18
export const SCARLET_PROOF_STELLAR_SWIRL_CRIT_RATE = 0.16
export const SCARLET_PROOF_STELLAR_SWIRL_DAMAGE_BONUS = 0.4

/** Typed two-piece and post-Stellar-Swirl contributions of Scarlet Proof. */
export const scarletProofCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.scarlet-proof.2pc.attack-percent",
    label: "血红之证 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "ScarletProof" },
    target: "attackPercent",
    value: { kind: "fixed", value: SCARLET_PROOF_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "artifact.scarlet-proof.4pc.after-stellar-swirl.crit-rate",
    label: "血红之证 · 触发星扩散后的暴击率（10秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ScarletProof" },
    target: "critRate",
    value: { kind: "fixed", value: SCARLET_PROOF_STELLAR_SWIRL_CRIT_RATE }
  },
  {
    activation: "active",
    id: "artifact.scarlet-proof.4pc.after-stellar-swirl.reaction-damage-bonus",
    label: "血红之证 · 触发星扩散后的星扩散反应伤害（10秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ScarletProof" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["stellar_swirl"] },
    value: { kind: "fixed", value: SCARLET_PROOF_STELLAR_SWIRL_DAMAGE_BONUS }
  }
]
