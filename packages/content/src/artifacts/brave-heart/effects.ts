import type { CombatActionEffect } from "../../combat/types.js"
import { whileSourceOnField } from "../../combat/capabilities.js"

export const BRAVE_HEART_ATTACK_PERCENT = 0.18
export const BRAVE_HEART_ENEMY_ABOVE_HALF_HEALTH_DAMAGE_BONUS = 0.3
export const BRAVE_HEART_AVERAGE_DAMAGE_BONUS = 0.15

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
    activation: "automatic",
    lifecycle: whileSourceOnField("用户确认：四件套前台按平均 15% 增伤折算，不推断敌人生命比例"),
    id: "artifact.brave-heart.4pc.enemy-above-half-health.damage-bonus",
    label: "勇士之心 · 四件套（前台平均折算 15%）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "BraveHeart" },
    target: "damageBonus",
    value: { kind: "fixed", value: BRAVE_HEART_AVERAGE_DAMAGE_BONUS }
  }
]
