import type { CombatActionEffect } from "../../combat/types.js"

export const DEEPWOOD_DENDRO_DAMAGE_BONUS = 0.15
export const DEEPWOOD_DENDRO_RESISTANCE_REDUCTION = 0.3

/** Typed two-piece and selected four-piece contributions of Deepwood Memories to maintained core actions. */
export const deepwoodMemoriesCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.deepwood-memories.2pc.dendro-damage-bonus",
    label: "深林的记忆 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "DeepwoodMemories" },
    target: "damageBonus",
    targetFilter: { elements: ["dendro"] },
    value: { kind: "fixed", value: DEEPWOOD_DENDRO_DAMAGE_BONUS }
  },
  {
    activation: "active",
    id: "artifact.deepwood-memories.4pc.dendro-resistance-shred",
    label: "深林的记忆 · 四件套（元素战技或元素爆发命中后）",
    source: { holder: "party_member", kind: "artifact_set", minimumPieces: 4, setId: "DeepwoodMemories" },
    target: "enemyResistanceReduction",
    targetFilter: { elements: ["dendro"] },
    value: { kind: "fixed", value: DEEPWOOD_DENDRO_RESISTANCE_REDUCTION }
  }
]
