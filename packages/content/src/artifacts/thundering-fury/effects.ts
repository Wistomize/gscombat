import type { CombatActionEffect } from "../../combat/types.js"

export const THUNDERING_FURY_ELECTRO_DAMAGE_BONUS = 0.15
export const THUNDERING_FURY_TRANSFORMATIVE_REACTION_DAMAGE_BONUS = 0.4
export const THUNDERING_FURY_AGGRAVATE_REACTION_DAMAGE_BONUS = 0.2

/** Typed two-piece Electro damage and ordinary-reaction contributions of Thundering Fury. */
export const thunderingFuryCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.thundering-fury.2pc.electro-damage-bonus",
    label: "如雷的盛怒 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "ThunderingFury" },
    target: "damageBonus",
    targetFilter: { elements: ["electro"] },
    value: { kind: "fixed", value: THUNDERING_FURY_ELECTRO_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "artifact.thundering-fury.4pc.overload-electro-charged-superconduct-hyperbloom.reaction-damage-bonus",
    label: "如雷的盛怒 · 四件套（超载、感电、超导、超绽放反应伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ThunderingFury" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["overload", "electro_charged", "superconduct", "hyperbloom"] },
    value: { kind: "fixed", value: THUNDERING_FURY_TRANSFORMATIVE_REACTION_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "artifact.thundering-fury.4pc.aggravate.reaction-damage-bonus",
    label: "如雷的盛怒 · 四件套（超激化附加伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "ThunderingFury" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["aggravate"] },
    value: { kind: "fixed", value: THUNDERING_FURY_AGGRAVATE_REACTION_DAMAGE_BONUS }
  }
]
