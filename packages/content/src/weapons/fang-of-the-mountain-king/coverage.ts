import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.fang-of-the-mountain-king.verdant-ember.1-stack.skill-burst-damage-bonus",
        "weapon.fang-of-the-mountain-king.verdant-ember.2-stack.skill-burst-damage-bonus",
        "weapon.fang-of-the-mountain-king.verdant-ember.3-stack.skill-burst-damage-bonus",
        "weapon.fang-of-the-mountain-king.verdant-ember.4-stack.skill-burst-damage-bonus",
        "weapon.fang-of-the-mountain-king.verdant-ember.5-stack.skill-burst-damage-bonus",
        "weapon.fang-of-the-mountain-king.verdant-ember.6-stack.skill-burst-damage-bonus"
      ],
      id: "weapon.fang-of-the-mountain-king.verdant-ember.skill-burst-damage-bonus",
      label: "山王长牙 · 悬木祝赐层数对应的元素战技与元素爆发伤害",
      source: weaponSource("FangOfTheMountainKing"),
      status: "implemented"
    }
  ],
  equipmentId: "FangOfTheMountainKing",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
