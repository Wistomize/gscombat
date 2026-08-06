import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.tamayuratei-no-ohanashi.after-skill.attack-percent"],
      id: "weapon.tamayuratei-no-ohanashi.after-skill.attack-percent",
      label: "且住亭御咄 · 施放元素战技后（攻击力）",
      source: weaponSource("TamayurateiNoOhanashi"),
      status: "implemented"
    },
    {
      id: "weapon.tamayuratei-no-ohanashi.after-skill.movement-speed",
      label: "且住亭御咄 · 施放元素战技后（移动速度）",
      reason: "移动速度不改变当前核心动作的单次期望伤害，需循环时间模型。",
      source: weaponSource("TamayurateiNoOhanashi"),
      status: "not_applicable"
    }
  ],
  equipmentId: "TamayurateiNoOhanashi",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
