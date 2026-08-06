import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.gilded-dreams.2pc.elemental-mastery"],
      id: "artifact.gilded-dreams.2pc.elemental-mastery",
      label: "饰金之梦 · 二件套",
      source: artifactSource("GildedDreams", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.gilded-dreams.4pc.after-reaction.1-same-element-teammate.attack-percent",
        "artifact.gilded-dreams.4pc.after-reaction.2-same-element-teammates.attack-percent",
        "artifact.gilded-dreams.4pc.after-reaction.3-same-element-teammates.attack-percent",
        "artifact.gilded-dreams.4pc.after-reaction.1-different-element-teammate.elemental-mastery",
        "artifact.gilded-dreams.4pc.after-reaction.2-different-element-teammates.elemental-mastery",
        "artifact.gilded-dreams.4pc.after-reaction.3-different-element-teammates.elemental-mastery"
      ],
      id: "artifact.gilded-dreams.4pc.party-element-composition",
      label: "饰金之梦 · 四件套（触发元素反应后的同元素攻击力与异元素元素精通）",
      source: artifactSource("GildedDreams", 4),
      status: "implemented"
    }
  ],
  equipmentId: "GildedDreams",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
