import type { CombatActionEffect } from "../../combat/types.js"

export const THUNDERSOOTHER_ELECTRO_AURA_DAMAGE_BONUS = 0.35

/** Typed selected four-piece contribution of Thundersoother to one current action. */
export const thundersootherCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "active",
    id: "artifact.thundersoother.4pc.electro-aura.damage-bonus",
    label: "平息鸣雷的尊者 · 四件套（当前目标受雷元素影响）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "Thundersoother" },
    target: "damageBonus",
    value: { kind: "fixed", value: THUNDERSOOTHER_ELECTRO_AURA_DAMAGE_BONUS }
  }
]
