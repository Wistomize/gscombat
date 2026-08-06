import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.ash-graven-drinking-horn.hp-physical-hit"],
      id: "weapon.ash-graven-drinking-horn.hp-physical-hit",
      label: "苍纹角杯 · 攻击命中的基于生命值上限的额外物理伤害",
      source: weaponSource("AshGravenDrinkingHorn"),
      status: "implemented"
    }
  ],
  equipmentId: "AshGravenDrinkingHorn",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
