import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.desert-pavilion-chronicle.2pc.anemo-damage-bonus"],
      id: "artifact.desert-pavilion-chronicle.2pc.anemo-damage-bonus",
      label: "沙上楼阁史话 · 二件套",
      source: artifactSource("DesertPavilionChronicle", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.desert-pavilion-chronicle.4pc.after-charged-hit.weapon-damage-bonus"],
      id: "artifact.desert-pavilion-chronicle.4pc.after-charged-hit.weapon-damage-bonus",
      label: "沙上楼阁史话 · 四件套（重击命中后15秒内）",
      source: artifactSource("DesertPavilionChronicle", 4),
      status: "implemented"
    },
    {
      id: "artifact.desert-pavilion-chronicle.4pc.after-charged-hit.attack-speed",
      label: "沙上楼阁史话 · 四件套（普通攻击速度）",
      reason: "普通攻击速度改变连续攻击次数，不改变当前单次核心命中的期望伤害。",
      source: artifactSource("DesertPavilionChronicle", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "DesertPavilionChronicle",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
