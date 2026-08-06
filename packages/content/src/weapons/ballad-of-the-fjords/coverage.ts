import { weaponSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["weapon.ballad-of-the-fjords.team-elemental-mastery"],
      id: "weapon.ballad-of-the-fjords.team-elemental-mastery",
      label: "峡湾长歌 · 队伍至少三种元素类型时的元素精通",
      source: weaponSource("BalladOfTheFjords"),
      status: "implemented"
    }
  ],
  equipmentId: "BalladOfTheFjords",
  kind: "weapon"
} as const satisfies EquipmentCoverageEntry
