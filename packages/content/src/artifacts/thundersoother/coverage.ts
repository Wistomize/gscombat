import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "artifact.thundersoother.2pc.electro-resistance",
      label: "平息鸣雷的尊者 · 二件套",
      reason: "本轮不计算装备者承伤元素抗性，不转为敌人减抗或其他增益。",
      source: artifactSource("Thundersoother", 2),
      status: "not_applicable"
    },
    {
      effectIds: ["artifact.thundersoother.4pc.electro-aura.damage-bonus"],
      id: "artifact.thundersoother.4pc.electro-aura.damage-bonus",
      label: "平息鸣雷的尊者 · 四件套（前台且队伍含雷默认 35%，不改写敌人附着）",
      source: artifactSource("Thundersoother", 4),
      status: "implemented"
    }
  ],
  equipmentId: "Thundersoother",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
