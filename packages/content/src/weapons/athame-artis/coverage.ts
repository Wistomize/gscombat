import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.athame-artis.burst-crit-damage",
        "weapon.athame-artis.after-burst-hit.self-attack-percent",
        "weapon.athame-artis.magic-secret.after-burst-hit.self-extra-attack-percent"
      ],
      id: "weapon.athame-artis.self-stats",
      label: "黑蚀 · 装备者的元素爆发暴击伤害与白昼之刃攻击力",
      source: weaponSource("AthameArtis"),
      status: "implemented"
    },
    {
      effectIds: [
        "weapon.athame-artis.daylight-blade.other-current-character.attack-percent",
        "weapon.athame-artis.magic-secret.daylight-blade.other-current-character.extra-attack-percent"
      ],
      id: "weapon.athame-artis.daylight-blade.other-current-character.attack-percent",
      label: "黑蚀 · 元素爆发命中后队伍其他当前场上角色的攻击力",
      source: weaponSource("AthameArtis"),
      status: "implemented"
    }
  ],
  equipmentId: "AthameArtis",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
