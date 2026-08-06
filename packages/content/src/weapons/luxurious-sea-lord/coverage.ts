import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.luxurious-sea-lord.burst-damage-bonus"],
      id: "weapon.luxurious-sea-lord.burst-damage-bonus",
      label: "衔珠海皇 · 元素爆发伤害",
      source: weaponSource("LuxuriousSeaLord"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.luxurious-sea-lord.tuna-impact"],
      id: "weapon.luxurious-sea-lord.tuna-impact",
      label: "衔珠海皇 · 大鲔冲击（本次元素爆发命中且15秒冷却已就绪）",
      source: weaponSource("LuxuriousSeaLord"),
      status: "implemented"
    }
  ],
  equipmentId: "LuxuriousSeaLord",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
