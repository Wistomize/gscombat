import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.talking-stick.pyro-attachment.attack-percent",
        "weapon.talking-stick.hydro-cryo-electro-dendro-attachment.elemental-damage-bonus"
      ],
      id: "weapon.talking-stick.elemental-attachment.stats",
      label: "聊聊棒 · 承受元素附着后的攻击力或所有元素伤害",
      source: weaponSource("TalkingStick"),
      status: "implemented"
    }
  ],
  equipmentId: "TalkingStick",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
