import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.gest-of-the-mighty-wolf.howl.1-stack.damage-bonus",
        "weapon.gest-of-the-mighty-wolf.howl.2-stack.damage-bonus",
        "weapon.gest-of-the-mighty-wolf.howl.3-stack.damage-bonus",
        "weapon.gest-of-the-mighty-wolf.howl.4-stack.damage-bonus",
        "weapon.gest-of-the-mighty-wolf.magic-secret.1-stack.crit-damage",
        "weapon.gest-of-the-mighty-wolf.magic-secret.2-stack.crit-damage",
        "weapon.gest-of-the-mighty-wolf.magic-secret.3-stack.crit-damage",
        "weapon.gest-of-the-mighty-wolf.magic-secret.4-stack.crit-damage"
      ],
      id: "weapon.gest-of-the-mighty-wolf.howl.damage-or-crit-damage",
      label: "狼的武功歌 · 狼嚎层数对应的全伤害或魔导·秘仪暴击伤害",
      source: weaponSource("GestOfTheMightyWolf"),
      status: "implemented"
    },
    {
      id: "weapon.gest-of-the-mighty-wolf.attack-speed",
      label: "狼的武功歌 · 攻击速度",
      reason: "攻击速度不改变一个已选核心动作的单次伤害。",
      source: weaponSource("GestOfTheMightyWolf"),
      status: "not_applicable"
    }
  ],
  equipmentId: "GestOfTheMightyWolf",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
