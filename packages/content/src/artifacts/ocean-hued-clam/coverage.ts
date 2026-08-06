import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.ocean-hued-clam.2pc.healing-bonus"],
      id: "artifact.ocean-hued-clam.2pc.healing-bonus",
      label: "海染砗磲 · 二件套（治疗加成）",
      source: artifactSource("OceanHuedClam", 2),
      status: "implemented"
    },
    {
      id: "artifact.ocean-hued-clam.4pc.sea-dyed-foam-damage",
      label: "海染砗磲 · 四件套（海染泡沫的治疗记录伤害）",
      reason: "需要治疗累计、溢出治疗、延迟独立伤害事件、上限与专属结算规则。",
      requiredCapability: "healing_accumulation_delayed_independent_damage_event",
      source: artifactSource("OceanHuedClam", 4),
      status: "unsupported"
    }
  ],
  equipmentId: "OceanHuedClam",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
