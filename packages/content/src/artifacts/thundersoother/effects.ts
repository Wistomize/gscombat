import type { CombatActionEffect } from "../../combat/types.js"

export const THUNDERSOOTHER_ELECTRO_AURA_DAMAGE_BONUS = 0.35

/** Typed selected four-piece contribution of Thundersoother to one current action. */
export const thundersootherCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "while_applicable",
      trigger: { event: "none", sourceFieldPresence: "any" },
      applicability: { sourceFieldPresence: "on_field", teamElements: ["electro"] },
      explanation: "用户确认：前台且队伍有雷时默认生效，不改变全局敌人附着"
    },
    id: "artifact.thundersoother.4pc.electro-aura.damage-bonus",
    label: "平息鸣雷的尊者 · 四件套（前台、队伍含雷的准备假设）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "Thundersoother" },
    target: "damageBonus",
    value: { kind: "fixed", value: THUNDERSOOTHER_ELECTRO_AURA_DAMAGE_BONUS }
  }
]
