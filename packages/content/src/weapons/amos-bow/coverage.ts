import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.amos-bow.normal-charged-damage-bonus"],
      id: "weapon.amos-bow.normal-charged-damage-bonus",
      label: "阿莫斯之弓 · 普通攻击与重击伤害",
      source: weaponSource("AmosBow"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.amos-bow.projectile-flight-time.1-stack.damage-bonus",
        "weapon.amos-bow.projectile-flight-time.2-stack.damage-bonus",
        "weapon.amos-bow.projectile-flight-time.3-stack.damage-bonus",
        "weapon.amos-bow.projectile-flight-time.4-stack.damage-bonus",
        "weapon.amos-bow.projectile-flight-time.5-stack.damage-bonus"
      ],
      id: "weapon.amos-bow.projectile-flight-time.extra-damage-bonus",
      label: "阿莫斯之弓 · 箭矢发射后的飞行时间伤害提升",
      source: weaponSource("AmosBow"),
      status: "implemented"
    }
  ],
  equipmentId: "AmosBow",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
