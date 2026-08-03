import type { CombatActionEffect } from "../../combat/types.js"

export const GOLDEN_TROUPE_TWO_PIECE_SKILL_DAMAGE_BONUS = 0.2
export const GOLDEN_TROUPE_FOUR_PIECE_ON_FIELD_SKILL_DAMAGE_BONUS = 0.25

/** Typed on-field contributions of Golden Troupe to a selected primary character's Elemental Skill action. */
export const goldenTroupeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    id: "artifact.golden-troupe.2pc.skill-damage-bonus",
    label: "黄金剧团 · 二件套",
    source: { kind: "artifact_set", minimumPieces: 2, setId: "GoldenTroupe" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "fixed", value: GOLDEN_TROUPE_TWO_PIECE_SKILL_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    id: "artifact.golden-troupe.4pc.on-field.skill-damage-bonus",
    label: "黄金剧团 · 四件套（前台元素战技）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "GoldenTroupe" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "fixed", value: GOLDEN_TROUPE_FOUR_PIECE_ON_FIELD_SKILL_DAMAGE_BONUS }
  }
]
