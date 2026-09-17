import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.vourukashas-glow.2pc.hp-percent"],
      id: "artifact.vourukashas-glow.2pc.hp-percent",
      label: "花海甘露之光 · 二件套",
      source: artifactSource("VourukashasGlow", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.vourukashas-glow.4pc.skill-burst-damage-bonus",
        "artifact.vourukashas-glow.4pc.taking-damage.0-stack.skill-burst-damage-bonus",
        "artifact.vourukashas-glow.4pc.taking-damage.1-stack.skill-burst-damage-bonus",
        "artifact.vourukashas-glow.4pc.taking-damage.2-stack.skill-burst-damage-bonus",
        "artifact.vourukashas-glow.4pc.taking-damage.3-stack.skill-burst-damage-bonus",
        "artifact.vourukashas-glow.4pc.taking-damage.4-stack.skill-burst-damage-bonus",
        "artifact.vourukashas-glow.4pc.taking-damage.5-stack.skill-burst-damage-bonus"
      ],
      id: "artifact.vourukashas-glow.4pc.skill-burst-damage-bonus",
      label: "花海甘露之光 · 四件套（自身持续承伤默认五层，其他零层；可手选，后台保留）",
      source: artifactSource("VourukashasGlow", 4),
      status: "implemented"
    }
  ],
  equipmentId: "VourukashasGlow",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
