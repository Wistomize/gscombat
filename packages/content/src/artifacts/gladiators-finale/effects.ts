import type { CombatActionEffect } from "../../combat/types.js"

export const GLADIATORS_FINALE_ATTACK_PERCENT = 0.18
export const GLADIATORS_FINALE_NORMAL_ATTACK_DAMAGE_BONUS = 0.35

/** Typed automatic two-piece and weapon-restricted four-piece contributions of Gladiator's Finale. */
export const gladiatorsFinaleCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.gladiators-finale.2pc.attack-percent",
    label: "角斗士的终幕礼 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "GladiatorsFinale" },
    target: "attackPercent",
    value: { kind: "fixed", value: GLADIATORS_FINALE_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    id: "artifact.gladiators-finale.4pc.weapon-restricted-normal-damage-bonus",
    label: "角斗士的终幕礼 · 四件套",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "GladiatorsFinale" },
    target: "damageBonus",
    targetFilter: {
      attackKinds: ["normal"],
      recipientWeaponTypes: ["sword", "claymore", "polearm"]
    },
    value: { kind: "fixed", value: GLADIATORS_FINALE_NORMAL_ATTACK_DAMAGE_BONUS }
  }
]
