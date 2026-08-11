import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.night-of-the-skys-unveiling.2pc.elemental-mastery"],
      id: "artifact.night-of-the-skys-unveiling.2pc.elemental-mastery",
      label: "穹境示现之夜 · 二件套",
      source: artifactSource("NightOfTheSkysUnveiling", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.initial-moonsign.crit-rate",
        "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.full-moonsign.crit-rate"
      ],
      id: "artifact.night-of-the-skys-unveiling.4pc.lunar-reaction.moonsign-crit-rate",
      label: "穹境示现之夜 · 四件套（附近队伍触发月曜反应后的装备者暴击率）",
      source: artifactSource("NightOfTheSkysUnveiling", 4),
      status: "implemented"
    },
    {
      effectIds: ["artifact.night-of-the-skys-unveiling.4pc.moongleam.lunar-reaction-damage-bonus"],
      id: "artifact.night-of-the-skys-unveiling.4pc.moongleam.lunar-reaction-damage-bonus",
      label: "穹境示现之夜 · 四件套（不同月辉明光的月曜反应伤害加成）",
      source: artifactSource("NightOfTheSkysUnveiling", 4, "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "NightOfTheSkysUnveiling",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
