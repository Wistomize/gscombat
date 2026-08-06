import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: [
        "weapon.song-of-broken-pines.attack-percent",
        "weapon.song-of-broken-pines.full-sigil.party-attack-percent"
      ],
      id: "weapon.song-of-broken-pines.attack-percent",
      label: "松籁响起之时 · 揭旗的叛逆之歌（攻击力）",
      source: weaponSource("SongOfBrokenPines"),
      status: "implemented"
    },
    {
      id: "weapon.song-of-broken-pines.full-sigil.party-attack-speed",
      label: "松籁响起之时 · 揭旗的叛逆之歌（攻击速度）",
      reason: "攻击速度不会改变一个已选核心动作单次命中的伤害数值。",
      source: weaponSource("SongOfBrokenPines"),
      status: "not_applicable"
    }
  ],
  equipmentId: "SongOfBrokenPines",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
