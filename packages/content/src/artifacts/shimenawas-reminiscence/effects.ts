import type { CombatActionEffect } from "../../combat/types.js"

export const SHIMENAWAS_REMINISCENCE_TWO_PIECE_ATTACK_PERCENT = 0.18
export const SHIMENAWAS_REMINISCENCE_WEAPON_DAMAGE_BONUS = 0.5

/** Typed two-piece and selected post-skill four-piece contributions of Shimenawa's Reminiscence. */
export const shimenawasReminiscenceCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.shimenawas-reminiscence.2pc.attack-percent",
    label: "追忆之注连 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "ShimenawasReminiscence" },
    target: "attackPercent",
    value: { kind: "fixed", value: SHIMENAWAS_REMINISCENCE_TWO_PIECE_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "artifact.shimenawas-reminiscence.4pc.after-skill.normal-charged-plunge-damage-bonus",
    label: "追忆之注连 · 四件套（施放元素战技并已消耗15点元素能量后）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ShimenawasReminiscence" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged", "plunge"] },
    value: { kind: "fixed", value: SHIMENAWAS_REMINISCENCE_WEAPON_DAMAGE_BONUS }
  }
]
