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
      id: "artifact.aubade-of-morningstar-and-moon.4pc.lunar-reaction",
      label: "晨星与月的晓歌 · 四件套",
      reason: "需要月曜反应、月兆满辉和装备者前后台状态的组合快照。",
      requiredCapability: "lunar_reaction_moonsign_and_field_state",
      source: artifactSource("AubadeOfMorningstarAndMoon", 4),
      status: "unsupported"
    }
  ],
  equipmentId: "AubadeOfMorningstarAndMoon",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
