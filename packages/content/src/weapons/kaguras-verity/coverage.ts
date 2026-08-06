import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.kaguras-verity.kagura-dance.1-stack.skill-damage-bonus",
        "weapon.kaguras-verity.kagura-dance.2-stack.skill-damage-bonus",
        "weapon.kaguras-verity.kagura-dance.3-stack.skill-damage-bonus",
        "weapon.kaguras-verity.kagura-dance.3-stack.all-element-damage-bonus"
      ],
      id: "weapon.kaguras-verity.kagura-dance.damage-bonuses",
      label: "神乐之真意 · 神乐舞层数对应的元素战技与所有元素伤害",
      source: weaponSource("KagurasVerity"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.kaguras-verity.kagura-dance.1-stack.star-superconduct-damage-bonus",
        "weapon.kaguras-verity.kagura-dance.2-stack.star-superconduct-damage-bonus",
        "weapon.kaguras-verity.kagura-dance.3-stack.star-superconduct-damage-bonus"
      ],
      id: "weapon.kaguras-verity.kagura-dance.star-superconduct-damage-bonus",
      label: "神乐之真意 · 神乐舞层数对应的星超导伤害",
      source: weaponSource("KagurasVerity"),
      status: "implemented"
    }
  ],
  equipmentId: "KagurasVerity",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
