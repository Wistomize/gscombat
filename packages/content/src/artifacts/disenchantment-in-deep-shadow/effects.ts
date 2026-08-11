import type { CombatActionEffect } from "../../combat/types.js"

export const DISENCHANTMENT_IN_DEEP_SHADOW_ATTACK_PERCENT = 0.18
export const DISENCHANTMENT_IN_DEEP_SHADOW_SUPERCONDUCT_CRIT_RATE = 0.16
export const DISENCHANTMENT_IN_DEEP_SHADOW_SUPERCONDUCT_REACTION_DAMAGE_BONUS = 0.8
export const DISENCHANTMENT_IN_DEEP_SHADOW_STELLAR_SUPERCONDUCT_REACTION_DAMAGE_BONUS = 0.4

/** Typed two-piece, Superconduct reaction-damage, and selected affected-target contributions of Disenchantment in Deep Shadow. */
export const disenchantmentInDeepShadowCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.disenchantment-in-deep-shadow.2pc.attack-percent",
    label: "影中沉凝的幻灭 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "DisenchantmentInDeepShadow" },
    target: "attackPercent",
    value: { kind: "fixed", value: DISENCHANTMENT_IN_DEEP_SHADOW_ATTACK_PERCENT }
  },
  {
    activation: "automatic",
    id: "artifact.disenchantment-in-deep-shadow.4pc.superconduct.reaction-damage-bonus",
    label: "影中沉凝的幻灭 · 四件套（超导反应伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "DisenchantmentInDeepShadow" },
    target: "reactionDamageBonus",
    targetFilter: { reactionKinds: ["superconduct"] },
    value: { kind: "fixed", value: DISENCHANTMENT_IN_DEEP_SHADOW_SUPERCONDUCT_REACTION_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "artifact.disenchantment-in-deep-shadow.4pc.stellar-superconduct.reaction-damage-bonus",
    label: "影中沉凝的幻灭 · 四件套（星超导反应伤害）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "DisenchantmentInDeepShadow" },
    target: "specialReactionDamageBonus",
    targetFilter: { specialReactionKinds: ["stellar_superconduct"] },
    value: { kind: "fixed", value: DISENCHANTMENT_IN_DEEP_SHADOW_STELLAR_SUPERCONDUCT_REACTION_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "artifact.disenchantment-in-deep-shadow.4pc.superconduct-affected-target.crit-rate",
    label: "影中沉凝的幻灭 · 四件套（当前攻击的目标受超导或星超导影响）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "DisenchantmentInDeepShadow" },
    target: "critRate",
    value: { kind: "fixed", value: DISENCHANTMENT_IN_DEEP_SHADOW_SUPERCONDUCT_CRIT_RATE }
  }
]
