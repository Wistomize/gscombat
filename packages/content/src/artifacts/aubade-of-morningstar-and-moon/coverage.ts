import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.aubade-of-morningstar-and-moon.2pc.elemental-mastery"],
      id: "artifact.aubade-of-morningstar-and-moon.2pc.elemental-mastery",
      label: "晨星与月的晓歌 · 二件套",
      source: artifactSource("AubadeOfMorningstarAndMoon", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.aubade-of-morningstar-and-moon.4pc.off-field.lunar-reaction-damage-bonus",
        "artifact.aubade-of-morningstar-and-moon.4pc.full-moonsign.lunar-reaction-damage-bonus"
      ],
      id: "artifact.aubade-of-morningstar-and-moon.4pc.lunar-reaction",
      label: "晨星与月的晓歌 · 四件套",
      source: artifactSource("AubadeOfMorningstarAndMoon", 4),
      status: "implemented"
    }
  ],
  equipmentId: "AubadeOfMorningstarAndMoon",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
