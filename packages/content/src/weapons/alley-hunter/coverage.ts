import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.alley-hunter.off-field.1-stack.damage-bonus",
        "weapon.alley-hunter.off-field.2-stack.damage-bonus",
        "weapon.alley-hunter.off-field.3-stack.damage-bonus",
        "weapon.alley-hunter.off-field.4-stack.damage-bonus",
        "weapon.alley-hunter.off-field.5-stack.damage-bonus",
        "weapon.alley-hunter.off-field.6-stack.damage-bonus",
        "weapon.alley-hunter.off-field.7-stack.damage-bonus",
        "weapon.alley-hunter.off-field.8-stack.damage-bonus",
        "weapon.alley-hunter.off-field.9-stack.damage-bonus",
        "weapon.alley-hunter.off-field.10-stack.damage-bonus"
      ],
      id: "weapon.alley-hunter.off-field-damage-bonus",
      label: "暗巷猎手 · 后台累积伤害提升与登场后衰减",
      source: weaponSource("AlleyHunter"),
      status: "implemented"
    }
  ],
  equipmentId: "AlleyHunter",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
