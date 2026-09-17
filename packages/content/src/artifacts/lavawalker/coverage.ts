import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "artifact.lavawalker.2pc.pyro-resistance",
      label: "渡过烈火的贤人 · 二件套",
      reason: "本轮不计算装备者承伤元素抗性，不转为敌人减抗或其他增益。",
      source: artifactSource("Lavawalker", 2),
      status: "not_applicable"
    },
    {
      effectIds: ["artifact.lavawalker.4pc.pyro-aura.damage-bonus"],
      id: "artifact.lavawalker.4pc.pyro-aura.damage-bonus",
      label: "渡过烈火的贤人 · 四件套（前台且队伍含火默认 35%，不改写敌人附着）",
      source: artifactSource("Lavawalker", 4),
      status: "implemented"
    }
  ],
  equipmentId: "Lavawalker",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
