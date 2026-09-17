import type { CombatActionEffect } from "../../combat/types.js"
import { afterSkillUntilExit } from "../../combat/capabilities.js"

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
    activation: "automatic",
    lifecycle: afterSkillUntilExit("前台默认施放战技，保留基础岩伤20%；后台不计"),
    id: "artifact.nighttime-whispers-in-the-echoing-woods.4pc.after-skill.geo-damage-bonus",
    label: "回声之林夜话 · 四件套（施放元素战技后10秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "NighttimeWhispersInTheEchoingWoods" },
    target: "damageBonus",
    targetFilter: { elements: ["geo"] },
    value: { kind: "fixed", value: NIGHTTIME_WHISPERS_AFTER_SKILL_GEO_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "clear_on_exit",
      trigger: { event: "capability", sourceFieldPresence: "any", capability: {
        kind: "reaction_trigger", provider: "party", recipient: "source", reactionFamily: "crystallize"
      } }, explanation: "前台且队伍具有岩与可结晶元素攻击条件，默认结晶护盾或月笼，追加30%岩伤；不借普通护盾开关"
    },
    id: "artifact.nighttime-whispers-in-the-echoing-woods.4pc.crystallize-shield.extra-geo-damage-bonus",
    label: "回声之林夜话 · 四件套（处于结晶反应护盾或附近月笼时；与战技后效果叠加）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "NighttimeWhispersInTheEchoingWoods" },
    target: "damageBonus",
    targetFilter: { elements: ["geo"] },
    value: { kind: "fixed", value: NIGHTTIME_WHISPERS_CRYSTALLIZE_SHIELD_EXTRA_GEO_DAMAGE_BONUS }
  }
]
