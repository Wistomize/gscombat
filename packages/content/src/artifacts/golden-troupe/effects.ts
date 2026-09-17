import type { CombatActionEffect } from "../../combat/types.js"

export const GOLDEN_TROUPE_TWO_PIECE_SKILL_DAMAGE_BONUS = 0.2
export const GOLDEN_TROUPE_FOUR_PIECE_ON_FIELD_SKILL_DAMAGE_BONUS = 0.25

/** Base skill bonuses and the separately qualified off-field contribution. */
export const goldenTroupeCombatActionEffects: readonly CombatActionEffect[] = [
  {
    activation: "automatic",
    lifecycle: { kind: "constant" },
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
    lifecycle: { kind: "constant" },
    label: "黄金剧团 · 四件套（基础战技增伤）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "GoldenTroupe" },
    target: "damageBonus",
    targetFilter: { talentSlots: ["skill"] },
    value: { kind: "fixed", value: GOLDEN_TROUPE_FOUR_PIECE_ON_FIELD_SKILL_DAMAGE_BONUS }
  },
  {
    activation: "automatic",
    lifecycle: {
      kind: "conditional", preparation: "qualified", retention: "while_applicable",
      trigger: { event: "none", sourceFieldPresence: "any" },
      applicability: { sourceFieldPresence: "off_field" }, explanation: "装备者在后台；前台不计短暂保留"
    },
    id: "artifact.golden-troupe.4pc.off-field.additional-skill-damage-bonus",
    label: "黄金剧团 · 四件套（后台额外战技增伤）",
    source: { kind: "artifact_set", minimumPieces: 4, setId: "GoldenTroupe" },
    target: "damageBonus", targetFilter: { talentSlots: ["skill"] }, value: { kind: "fixed", value: 0.25 }
  }
]
