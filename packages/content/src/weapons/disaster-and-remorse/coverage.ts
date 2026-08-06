import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.disaster-and-remorse.after-skill.normal-charged-damage-bonus",
        "weapon.disaster-and-remorse.after-skill.skill-burst-damage-bonus",
        "weapon.disaster-and-remorse.magic-secret.extra-normal-charged-damage-bonus",
        "weapon.disaster-and-remorse.magic-secret.extra-skill-burst-damage-bonus"
      ],
      id: "weapon.disaster-and-remorse.current-state-damage-bonus",
      label: "灾悔 · 无赦、无愈及魔导·秘仪下的伤害提升",
      source: weaponSource("DisasterAndRemorse"),
      status: "implemented"
    },
    {
      id: "weapon.disaster-and-remorse.duration-extension",
      label: "灾悔 · 命中后延长无赦或无愈持续时间",
      reason: "持续时间延长只影响状态可用时段；当前模型显式选择已生效的当前动作快照。",
      source: weaponSource("DisasterAndRemorse"),
      status: "not_applicable"
    }
  ],
  equipmentId: "DisasterAndRemorse",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
