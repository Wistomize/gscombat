import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.rainbow-serpents-rain-bow.after-off-field-hit.attack-percent"],
      id: "weapon.rainbow-serpents-rain-bow.after-off-field-hit.attack-percent",
      label: "虹蛇的雨弦 · 后台攻击命中后的攻击力",
      source: weaponSource("RainbowSerpentsRainBow"),
      status: "implemented"
    }
  ],
  equipmentId: "RainbowSerpentsRainBow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
