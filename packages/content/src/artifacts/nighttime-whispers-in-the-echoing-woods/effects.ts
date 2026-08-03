import type { CombatActionEffect } from "../../combat/types.js"

export const NIGHTTIME_WHISPERS_ATTACK_PERCENT = 0.18
export const NIGHTTIME_WHISPERS_AFTER_SKILL_GEO_DAMAGE_BONUS = 0.2
export const NIGHTTIME_WHISPERS_CRYSTALLIZE_SHIELD_EXTRA_GEO_DAMAGE_BONUS = 0.3

/** Typed selected post-skill Geo contributions of Nighttime Whispers in the Echoing Woods. */
export const nighttimeWhispersInTheEchoingWoodsCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.nighttime-whispers-in-the-echoing-woods.2pc.attack-percent",
    label: "回声之林夜话 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "NighttimeWhispersInTheEchoingWoods" },
    target: "attackPercent",
    value: { kind: "fixed", value: NIGHTTIME_WHISPERS_ATTACK_PERCENT }
  },
  {
    activation: "active",
    id: "artifact.nighttime-whispers-in-the-echoing-woods.4pc.after-skill.geo-damage-bonus",
    label: "回声之林夜话 · 四件套（施放元素战技后10秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "NighttimeWhispersInTheEchoingWoods" },
    target: "damageBonus",
    targetFilter: { elements: ["geo"] },
    value: { kind: "fixed", value: NIGHTTIME_WHISPERS_AFTER_SKILL_GEO_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "artifact.nighttime-whispers-in-the-echoing-woods.4pc.crystallize-shield.extra-geo-damage-bonus",
    label: "回声之林夜话 · 四件套（处于结晶反应护盾或附近月笼时；与战技后效果叠加）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "NighttimeWhispersInTheEchoingWoods" },
    target: "damageBonus",
    targetFilter: { elements: ["geo"] },
    value: { kind: "fixed", value: NIGHTTIME_WHISPERS_CRYSTALLIZE_SHIELD_EXTRA_GEO_DAMAGE_BONUS }
  }
]
