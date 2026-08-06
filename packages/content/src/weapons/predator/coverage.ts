import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.predator.strong-strike.1-stack.normal-charged-damage-bonus",
        "weapon.predator.strong-strike.2-stack.normal-charged-damage-bonus"
      ],
      id: "weapon.predator.strong-strike.normal-charged-damage-bonus",
      label: "掠食者 · 造成冰元素伤害后的普通攻击与重击伤害层数",
      source: weaponSource("Predator"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.predator.strong-strike.1-stack.normal-charged-damage-bonus",
        "weapon.predator.strong-strike.2-stack.normal-charged-damage-bonus",
        "weapon.predator.playstation.aloy.flat-attack"
      ],
      id: "weapon.predator.platform-restriction",
      label: "掠食者 · PlayStation Network 被动已生效快照",
      source: weaponSource("Predator"),
      status: "implemented"
    },
    {
      effectIds: ["weapon.predator.playstation.aloy.flat-attack"],
      id: "weapon.predator.aloy-flat-attack",
      label: "掠食者 · 埃洛伊装备时的固定攻击力",
      source: weaponSource("Predator"),
      status: "implemented"
    }
  ],
  equipmentId: "Predator",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
