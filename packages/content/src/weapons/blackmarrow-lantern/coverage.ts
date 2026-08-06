import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.blackmarrow-lantern.bloom.reaction-damage-bonus"],
      id: "weapon.blackmarrow-lantern.bloom-damage-bonus",
      label: "乌髓孑灯 · 绽放反应伤害",
      source: weaponSource("BlackmarrowLantern"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.blackmarrow-lantern.lunar-bloom.reaction-damage-bonus",
        "weapon.blackmarrow-lantern.full-moonsign.lunar-bloom.reaction-damage-bonus"
      ],
      id: "weapon.blackmarrow-lantern.lunar-bloom-damage-bonus",
      label: "乌髓孑灯 · 月绽放反应伤害与满辉额外提升",
      source: weaponSource("BlackmarrowLantern"),
      status: "implemented"
    }
  ],
  equipmentId: "BlackmarrowLantern",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
