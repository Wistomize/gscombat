import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.flower-of-paradise-lost.2pc.elemental-mastery"],
      id: "artifact.flower-of-paradise-lost.2pc.elemental-mastery",
      label: "乐园遗落之花 · 二件套",
      source: artifactSource("FlowerOfParadiseLost", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.flower-of-paradise-lost.4pc.reaction-trigger.0-stack.reaction-damage-bonus",
        "artifact.flower-of-paradise-lost.4pc.reaction-trigger.1-stack.reaction-damage-bonus",
        "artifact.flower-of-paradise-lost.4pc.reaction-trigger.2-stack.reaction-damage-bonus",
        "artifact.flower-of-paradise-lost.4pc.reaction-trigger.3-stack.reaction-damage-bonus",
        "artifact.flower-of-paradise-lost.4pc.reaction-trigger.4-stack.reaction-damage-bonus"
      ],
      id: "artifact.flower-of-paradise-lost.4pc.bloom-hyperbloom-burgeon.reaction-damage-bonus",
      label: "乐园遗落之花 · 四件套（绽放、超绽放、烈绽放反应伤害）",
      source: artifactSource("FlowerOfParadiseLost", 4),
      status: "implemented"
    },
    {
      id: "artifact.flower-of-paradise-lost.4pc.lunar-bloom.reaction-damage-bonus",
      label: "乐园遗落之花 · 四件套（月绽放反应伤害）",
      reason: "月绽放使用独立伤害公式，当前单核心动作流水线尚未建模。",
      requiredCapability: "lunar_bloom_reaction_damage_bonus",
      source: artifactSource("FlowerOfParadiseLost", 4),
      status: "unsupported"
    }
  ],
  equipmentId: "FlowerOfParadiseLost",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
