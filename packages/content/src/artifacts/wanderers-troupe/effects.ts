import type { CombatActionEffect } from "../../combat/types.js"

export const WANDERERS_TROUPE_TWO_PIECE_ELEMENTAL_MASTERY = 80
export const WANDERERS_TROUPE_CHARGED_ATTACK_DAMAGE_BONUS = 0.35

/** Typed automatic two-piece and weapon-restricted four-piece contributions of Wanderer's Troupe. */
export const wanderersTroupeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.wanderers-troupe.2pc.elemental-mastery",
    label: "流浪大地的乐团 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "WanderersTroupe" },
    target: "elementalMastery",
    value: { kind: "fixed", value: WANDERERS_TROUPE_TWO_PIECE_ELEMENTAL_MASTERY }
  },
  {
    activation: "automatic",
    id: "artifact.wanderers-troupe.4pc.bow-catalyst-charged-damage-bonus",
    label: "流浪大地的乐团 · 四件套",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "WanderersTroupe" },
    target: "damageBonus",
    targetFilter: {
      attackKinds: ["charged"],
      recipientWeaponTypes: ["bow", "catalyst"]
    },
    value: { kind: "fixed", value: WANDERERS_TROUPE_CHARGED_ATTACK_DAMAGE_BONUS }
  }
]
