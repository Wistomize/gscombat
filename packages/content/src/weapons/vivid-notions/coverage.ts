import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.vivid-notions.attack-percent"],
      id: "weapon.vivid-notions.attack-percent",
      label: "溢彩心念 · 攻击力",
      source: weaponSource("VividNotions"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.vivid-notions.dawn.plunge-crit-damage",
        "weapon.vivid-notions.dusk.plunge-crit-damage"
      ],
      id: "weapon.vivid-notions.dawn-and-dusk.plunge-crit-damage",
      label: "溢彩心念 · 晨曦与暮色状态下的下落攻击暴击伤害",
      source: weaponSource("VividNotions"),
      status: "implemented"
    }
  ],
  equipmentId: "VividNotions",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
