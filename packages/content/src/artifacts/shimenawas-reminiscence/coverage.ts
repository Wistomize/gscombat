import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.shimenawas-reminiscence.2pc.attack-percent"],
      id: "artifact.shimenawas-reminiscence.2pc.attack-percent",
      label: "追忆之注连 · 二件套",
      source: artifactSource("ShimenawasReminiscence", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.shimenawas-reminiscence.4pc.after-skill.normal-charged-plunge-damage-bonus"],
      id: "artifact.shimenawas-reminiscence.4pc.after-skill.normal-charged-plunge-damage-bonus",
      label: "追忆之注连 · 四件套（施放元素战技并已消耗15点元素能量后）",
      source: artifactSource("ShimenawasReminiscence", 4),
      status: "implemented"
    },
    {
      id: "artifact.shimenawas-reminiscence.4pc.energy-consumption",
      label: "追忆之注连 · 四件套（元素能量消耗）",
      reason: "消耗元素能量影响后续元素爆发可用性，不改变当前已选核心动作的一次期望伤害。",
      source: artifactSource("ShimenawasReminiscence", 4),
      status: "not_applicable"
    }
  ],
  equipmentId: "ShimenawasReminiscence",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
