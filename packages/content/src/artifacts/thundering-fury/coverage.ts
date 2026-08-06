import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.thundering-fury.2pc.electro-damage-bonus"],
      id: "artifact.thundering-fury.2pc.electro-damage-bonus",
      label: "如雷的盛怒 · 二件套",
      source: artifactSource("ThunderingFury", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.thundering-fury.4pc.overload-electro-charged-superconduct-hyperbloom.reaction-damage-bonus"
      ],
      id: "artifact.thundering-fury.4pc.overload-electro-charged-superconduct-hyperbloom.reaction-damage-bonus",
      label: "如雷的盛怒 · 四件套（超载、感电、超导、超绽放反应伤害）",
      source: artifactSource("ThunderingFury", 4),
      status: "implemented"
    },
    {
      effectIds: ["artifact.thundering-fury.4pc.aggravate.reaction-damage-bonus"],
      id: "artifact.thundering-fury.4pc.aggravate.reaction-damage-bonus",
      label: "如雷的盛怒 · 四件套（超激化附加伤害）",
      source: artifactSource("ThunderingFury", 4),
      status: "implemented"
    },
    {
      id: "artifact.thundering-fury.4pc.lunar-charged-stellar-superconduct.reaction-damage-bonus",
      label: "如雷的盛怒 · 四件套（月感电、星超导反应伤害）",
      reason: "月曜反应使用独立伤害公式，当前单核心动作流水线尚未建模。",
      requiredCapability: "lunar_reaction_damage_bonus",
      source: artifactSource("ThunderingFury", 4),
      status: "unsupported"
    },
    {
      id: "artifact.thundering-fury.4pc.skill-cooldown-reduction",
      label: "如雷的盛怒 · 四件套（元素战技冷却时间降低）",
      reason: "元素战技冷却缩减只影响后续循环可施放次数，不改变当前核心动作的一次期望伤害。",
      source: artifactSource("ThunderingFury", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "ThunderingFury",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
