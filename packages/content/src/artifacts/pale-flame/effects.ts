import type { CombatActionEffect } from "../../combat/types.js"
import type { CombatEffectLifecycle } from "../../combat/capabilities.js"

export const PALE_FLAME_PHYSICAL_DAMAGE_BONUS = 0.25
export const PALE_FLAME_SKILL_HIT_ATTACK_PERCENT_PER_STACK = 0.09

function skillHitLifecycle(count: 1 | 2): CombatEffectLifecycle {
  return {
    kind: "conditional", preparation: "qualified", retention: "clear_on_exit",
    trigger: { event: "capability", sourceFieldPresence: "on_field", capability: {
      kind: "damage_hit", recipient: "source", provider: "source", hitKinds: ["skill"],
      opportunityWindow: { seconds: 7, measure: "hits", minimum: count, ...(count === 1 ? { maximum: 1 } : {}) }
    } }, explanation: "前台七秒内合法战技命中机会，间隔至少0.3秒；多目标同击只算一次，后台不保留四件套"
  }
}

/** Typed two-piece and selected current-action skill-hit stack contributions of Pale Flame. */
export const paleFlameCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.pale-flame.2pc.physical-damage-bonus",
    label: "苍白之火 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "PaleFlame" },
    target: "damageBonus",
    targetFilter: { elements: ["physical"] },
    value: { kind: "fixed", value: PALE_FLAME_PHYSICAL_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: skillHitLifecycle(1),
    exclusivity: { group: "pale-flame-skill-hit", variant: "1-stack" },
    id: "artifact.pale-flame.4pc.skill-hit.1-stack.attack-percent",
    label: "苍白之火 · 当前核心动作前已持有1层元素战技命中攻击力（7秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "PaleFlame" },
    target: "attackPercent",
    value: { kind: "fixed", value: PALE_FLAME_SKILL_HIT_ATTACK_PERCENT_PER_STACK }
  },
  {
    activation: "automatic",
    lifecycle: skillHitLifecycle(2),
    exclusivity: { group: "pale-flame-skill-hit", variant: "2-stack" },
    id: "artifact.pale-flame.4pc.skill-hit.2-stack.attack-percent",
    label: "苍白之火 · 当前核心动作前已持有2层元素战技命中攻击力（7秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "PaleFlame" },
    target: "attackPercent",
    value: { kind: "fixed", value: PALE_FLAME_SKILL_HIT_ATTACK_PERCENT_PER_STACK * 2 }
  },
  {
    activation: "automatic",
    lifecycle: skillHitLifecycle(2),
    exclusivity: { group: "pale-flame-skill-hit", variant: "2-stack" },
    id: "artifact.pale-flame.4pc.skill-hit.2-stack.extra-physical-damage-bonus",
    label: "苍白之火 · 当前核心动作前已持有2层时二件套物理伤害额外提升（7秒内）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "PaleFlame" },
    target: "damageBonus",
    targetFilter: { elements: ["physical"] },
    value: { kind: "fixed", value: PALE_FLAME_PHYSICAL_DAMAGE_BONUS }
  }
]
