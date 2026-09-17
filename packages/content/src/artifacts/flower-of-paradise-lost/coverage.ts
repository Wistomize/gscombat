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
        "artifact.flower-of-paradise-lost.4pc.reaction-trigger.4-stack.reaction-damage-bonus"
      ],
      id: "artifact.flower-of-paradise-lost.4pc.bloom-hyperbloom-burgeon.reaction-damage-bonus",
      label: "乐园遗落之花 · 四件套（无触发资格40%，有自身绽放系列触发资格80%，后台可用）",
      source: artifactSource("FlowerOfParadiseLost", 4),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.flower-of-paradise-lost.4pc.reaction-trigger.0-stack.lunar-bloom-reaction-damage-bonus",
        "artifact.flower-of-paradise-lost.4pc.reaction-trigger.4-stack.lunar-bloom-reaction-damage-bonus"
      ],
      id: "artifact.flower-of-paradise-lost.4pc.lunar-bloom.reaction-damage-bonus",
      label: "乐园遗落之花 · 四件套（月绽放基础10%，有自身绽放系列触发资格20%，不由直伤指标倒推）",
      source: artifactSource("FlowerOfParadiseLost", 4),
      status: "implemented"
    }
  ],
  equipmentId: "FlowerOfParadiseLost",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
