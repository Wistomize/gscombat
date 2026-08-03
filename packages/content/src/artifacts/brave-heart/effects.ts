import type { CombatActionEffect } from "../../combat/types.js"

export const BRAVE_HEART_ATTACK_PERCENT = 0.18
export const BRAVE_HEART_ENEMY_ABOVE_HALF_HEALTH_DAMAGE_BONUS = 0.3

/** Typed contributions of Brave Heart to maintained core actions. */
export const braveHeartCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.brave-heart.2pc.attack-percent",
    label: "勇士之心 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "BraveHeart" },
    target: "attackPercent",
    value: { kind: "fixed", value: BRAVE_HEART_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "artifact.brave-heart.4pc.enemy-above-half-health.damage-bonus",
    label: "勇士之心 · 四件套（当前目标生命值高于50%）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "BraveHeart" },
    target: "damageBonus",
    value: { kind: "fixed", value: BRAVE_HEART_ENEMY_ABOVE_HALF_HEALTH_DAMAGE_BONUS }
  }
]
