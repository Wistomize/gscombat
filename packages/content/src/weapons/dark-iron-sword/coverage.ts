import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.dark-iron-sword.electro-reaction-window.attack-percent"],
      id: "weapon.dark-iron-sword.electro-reaction-window.attack-percent",
      label: "暗铁剑 · 此前触发雷元素相关反应后的12秒内攻击力",
      source: weaponSource("DarkIronSword"),
      status: "implemented"
    }
  ],
  equipmentId: "DarkIronSword",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
