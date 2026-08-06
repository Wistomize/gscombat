import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.nighttime-whispers-in-the-echoing-woods.2pc.attack-percent"],
      id: "artifact.nighttime-whispers-in-the-echoing-woods.2pc.attack-percent",
      label: "回声之林夜话 · 二件套",
      source: artifactSource("NighttimeWhispersInTheEchoingWoods", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.nighttime-whispers-in-the-echoing-woods.4pc.after-skill.geo-damage-bonus",
        "artifact.nighttime-whispers-in-the-echoing-woods.4pc.crystallize-shield.extra-geo-damage-bonus"
      ],
      id: "artifact.nighttime-whispers-in-the-echoing-woods.4pc.geo-damage-bonus",
      label: "回声之林夜话 · 四件套（战技后与结晶护盾或月笼状态）",
      source: artifactSource("NighttimeWhispersInTheEchoingWoods", 4),
      status: "implemented"
    }
  ],
  equipmentId: "NighttimeWhispersInTheEchoingWoods",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
