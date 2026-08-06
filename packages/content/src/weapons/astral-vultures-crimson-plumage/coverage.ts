import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.astral-vultures-crimson-plumage.after-swirl.attack-percent"],
      id: "weapon.astral-vultures-crimson-plumage.after-swirl.attack-percent",
      label: "星鹫赤羽 · 触发扩散反应后的攻击力",
      source: weaponSource("AstralVulturesCrimsonPlumage"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.astral-vultures-crimson-plumage.team-different-element.1-character.charged-damage-bonus",
        "weapon.astral-vultures-crimson-plumage.team-different-element.1-character.burst-damage-bonus",
        "weapon.astral-vultures-crimson-plumage.team-different-element.2-character.charged-damage-bonus",
        "weapon.astral-vultures-crimson-plumage.team-different-element.2-character.burst-damage-bonus"
      ],
      id: "weapon.astral-vultures-crimson-plumage.team-different-element.charged-burst-damage-bonus",
      label: "星鹫赤羽 · 队伍不同元素角色数量对应的重击与元素爆发伤害",
      source: weaponSource("AstralVulturesCrimsonPlumage"),
      status: "implemented"
    }
  ],
  equipmentId: "AstralVulturesCrimsonPlumage",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
