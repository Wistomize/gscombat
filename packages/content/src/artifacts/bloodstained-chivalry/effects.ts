import type { CombatActionEffect } from "../../combat/types.js"

export const BLOODSTAINED_PHYSICAL_DAMAGE_BONUS = 0.25
export const BLOODSTAINED_AFTER_DEFEAT_CHARGED_DAMAGE_BONUS = 0.5

/** Typed contributions of Bloodstained Chivalry to maintained physical and charged core actions. */
export const bloodstainedChivalryCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.bloodstained-chivalry.2pc.physical-damage-bonus",
    label: "染血的骑士道 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "BloodstainedChivalry" },
    target: "damageBonus",
    targetFilter: { elements: ["physical"] },
    value: { kind: "fixed", value: BLOODSTAINED_PHYSICAL_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "artifact.bloodstained-chivalry.4pc.after-defeat.charged-damage-bonus",
    label: "染血的骑士道 · 四件套（击败敌人后）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "BloodstainedChivalry" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["charged"] },
    value: { kind: "fixed", value: BLOODSTAINED_AFTER_DEFEAT_CHARGED_DAMAGE_BONUS }
  }
]
