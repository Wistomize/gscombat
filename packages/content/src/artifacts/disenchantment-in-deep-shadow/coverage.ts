import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.disenchantment-in-deep-shadow.2pc.attack-percent"],
      id: "artifact.disenchantment-in-deep-shadow.2pc.attack-percent",
      label: "影中沉凝的幻灭 · 二件套",
      source: artifactSource("DisenchantmentInDeepShadow", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.disenchantment-in-deep-shadow.4pc.superconduct-affected-target.crit-rate"],
      id: "artifact.disenchantment-in-deep-shadow.4pc.superconduct-affected-target.crit-rate",
      label: "影中沉凝的幻灭 · 四件套（当前攻击目标受超导或星超导影响）",
      source: artifactSource("DisenchantmentInDeepShadow", 4),
      status: "implemented"
    },
    {
      effectIds: ["artifact.disenchantment-in-deep-shadow.4pc.superconduct.reaction-damage-bonus"],
      id: "artifact.disenchantment-in-deep-shadow.4pc.superconduct.reaction-damage-bonus",
      label: "影中沉凝的幻灭 · 四件套（超导反应伤害）",
      source: artifactSource("DisenchantmentInDeepShadow", 4),
      status: "implemented"
    },
    {
      id: "artifact.disenchantment-in-deep-shadow.4pc.stellar-superconduct.reaction-damage-bonus",
      label: "影中沉凝的幻灭 · 四件套（星超导反应伤害）",
      reason: "星超导使用独立的月曜反应伤害公式，当前单核心动作流水线尚未建模。",
      requiredCapability: "stellar_superconduct_reaction_damage_bonus",
      source: artifactSource("DisenchantmentInDeepShadow", 4),
      status: "unsupported"
    }
  ],
  equipmentId: "DisenchantmentInDeepShadow",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
