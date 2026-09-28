import type { EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed executable effects; excluded legacy states and independent weapon procs are not coverage claims. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.talking-stick.pyro-attachment.attack-percent",
        "weapon.talking-stick.hydro-cryo-electro-dendro-attachment.elemental-damage-bonus",
        "weapon.talking-stick.pyro-attachment.attack-percent.disabled",
        "weapon.talking-stick.hydro-cryo-electro-dendro-attachment.elemental-damage-bonus.disabled"
      ],
      id: "weapon.talking-stick.elemental-attachment.stats",
      label: "聊聊棒 · 承受元素附着后的攻击力或所有元素伤害",
      source: {
        kind: "weapon",
        weaponId: "TalkingStick"
      },
      status: "implemented"
    }
  ],
  equipmentId: "TalkingStick",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
