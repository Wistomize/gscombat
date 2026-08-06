import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.a-thousand-blazing-suns.after-skill-or-burst.crit-damage",
        "weapon.a-thousand-blazing-suns.after-skill-or-burst.attack-percent",
        "weapon.a-thousand-blazing-suns.nightsoul.extra-crit-damage",
        "weapon.a-thousand-blazing-suns.nightsoul.extra-attack-percent"
      ],
      id: "weapon.a-thousand-blazing-suns.blazing-light.stats",
      label: "焚曜千阳 · 焚光与夜魂加持下的额外数值",
      source: weaponSource("AThousandBlazingSuns"),
      status: "implemented"
    },
    {
      id: "weapon.a-thousand-blazing-suns.blazing-light.duration-extension",
      label: "焚曜千阳 · 普通攻击或重击造成元素伤害后的焚光持续时间延长",
      reason: "持续时间延长只影响状态可用时段；当前模型显式选择已生效的当前动作快照。",
      source: weaponSource("AThousandBlazingSuns"),
      status: "not_applicable"
    }
  ],
  equipmentId: "AThousandBlazingSuns",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
