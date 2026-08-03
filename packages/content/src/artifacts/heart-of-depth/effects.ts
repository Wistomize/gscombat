import type { CombatActionEffect } from "../../combat/types.js"

export const HEART_OF_DEPTH_HYDRO_DAMAGE_BONUS = 0.15
export const HEART_OF_DEPTH_AFTER_SKILL_NORMAL_CHARGED_DAMAGE_BONUS = 0.3

/** Typed contributions of Heart of Depth to maintained Hydro and selected post-skill weapon-hit actions. */
export const heartOfDepthCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.heart-of-depth.2pc.hydro-damage-bonus",
    label: "沉沦之心 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "HeartOfDepth" },
    target: "damageBonus",
    targetFilter: { elements: ["hydro"] },
    value: { kind: "fixed", value: HEART_OF_DEPTH_HYDRO_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "artifact.heart-of-depth.4pc.after-skill.normal-charged-damage-bonus",
    label: "沉沦之心 · 四件套（元素战技后）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "HeartOfDepth" },
    target: "damageBonus",
    targetFilter: { attackKinds: ["normal", "charged"] },
    value: { kind: "fixed", value: HEART_OF_DEPTH_AFTER_SKILL_NORMAL_CHARGED_DAMAGE_BONUS }
  }
]
