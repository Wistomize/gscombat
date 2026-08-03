import type { CombatActionEffect } from "../../combat/types.js"

export const GAMBLER_SKILL_DAMAGE_BONUS = 0.2

/** Typed two-piece contribution of Gambler to maintained Elemental Skill actions. */
export const gamblerCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.gambler.2pc.skill-damage-bonus",
    label: "赌徒 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "Gambler" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "fixed", value: GAMBLER_SKILL_DAMAGE_BONUS }
  }
]
