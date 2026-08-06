import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.the-daybreak-chronicles.radiance.normal.1-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.normal.2-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.normal.3-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.normal.4-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.normal.5-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.normal.6-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.skill.1-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.skill.2-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.skill.3-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.skill.4-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.skill.5-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.skill.6-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.burst.1-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.burst.2-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.burst.3-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.burst.4-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.burst.5-stack.damage-bonus",
        "weapon.the-daybreak-chronicles.radiance.burst.6-stack.damage-bonus"
      ],
      id: "weapon.the-daybreak-chronicles.radiance.damage-bonus",
      label: "黎明破晓之史 · 当前攻击类别的光辉层数",
      source: weaponSource("TheDaybreakChronicles"),
      status: "implemented"
    }
  ],
  equipmentId: "TheDaybreakChronicles",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
