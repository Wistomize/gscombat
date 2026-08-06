import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.song-of-days-past.2pc.healing-bonus"],
      id: "artifact.song-of-days-past.2pc.healing-bonus",
      label: "昔时之歌 · 二件套（治疗加成）",
      source: artifactSource("SongOfDaysPast", 2),
      status: "implemented"
    },
    {
      id: "artifact.song-of-days-past.4pc.yearning.healing-recorded-damage",
      label: "昔时之歌 · 四件套（昔时之歌之咏的治疗记录伤害加成）",
      reason: "需要全队治疗记录、溢出治疗、上限、命中次数消耗与受益角色状态。",
      requiredCapability: "team_healing_accumulation_and_consumable_damage_bonus",
      source: artifactSource("SongOfDaysPast", 4, "party_member"),
      status: "unsupported"
    }
  ],
  equipmentId: "SongOfDaysPast",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
