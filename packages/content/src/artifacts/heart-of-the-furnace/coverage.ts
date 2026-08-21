import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Reviewed 7.0 coverage for Heart of the Furnace. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.heart-of-the-furnace.2pc.attack-percent"],
      id: "artifact.heart-of-the-furnace.2pc.attack-percent",
      label: "炉火融炼之心 · 二件套",
      source: artifactSource("HeartOfTheFurnace", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.heart-of-the-furnace.4pc.after-stellar-reaction.self-attack-percent"],
      id: "artifact.heart-of-the-furnace.4pc.after-stellar-reaction.self-attack-percent",
      label: "炉火融炼之心 · 四件套（自身攻击力）",
      source: artifactSource("HeartOfTheFurnace", 4),
      status: "implemented"
    },
    {
      effectIds: ["artifact.heart-of-the-furnace.4pc.party-stellar-reaction-damage-bonus"],
      id: "artifact.heart-of-the-furnace.4pc.party-stellar-reaction-damage-bonus",
      label: "炉火融炼之心 · 四件套（不可叠加的队伍星烁反应增伤）",
      source: artifactSource("HeartOfTheFurnace", 4, "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "HeartOfTheFurnace",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
