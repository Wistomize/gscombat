import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.crimson-witch-of-flames.2pc.pyro-damage-bonus"],
      id: "artifact.crimson-witch-of-flames.2pc.pyro-damage-bonus",
      label: "炽烈的炎之魔女 · 二件套",
      source: artifactSource("CrimsonWitchOfFlames", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.crimson-witch-of-flames.4pc.skill-cast.1-stack.extra-pyro-damage-bonus",
        "artifact.crimson-witch-of-flames.4pc.skill-cast.2-stack.extra-pyro-damage-bonus",
        "artifact.crimson-witch-of-flames.4pc.skill-cast.3-stack.extra-pyro-damage-bonus"
      ],
      id: "artifact.crimson-witch-of-flames.4pc.skill-cast-extra-pyro-damage-bonus",
      label: "炽烈的炎之魔女 · 四件套（元素战技施放后的二件套额外火元素伤害）",
      source: artifactSource("CrimsonWitchOfFlames", 4),
      status: "implemented"
    },
    {
      effectIds: ["artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus"],
      id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus",
      label: "炽烈的炎之魔女 · 四件套（蒸发与融化反应加成）",
      source: artifactSource("CrimsonWitchOfFlames", 4),
      status: "implemented"
    },
    {
      effectIds: ["artifact.crimson-witch-of-flames.4pc.overload-burning-burgeon.reaction-damage-bonus"],
      id: "artifact.crimson-witch-of-flames.4pc.overload-burning-burgeon.reaction-damage-bonus",
      label: "炽烈的炎之魔女 · 四件套（超载、燃烧、烈绽放反应加成）",
      source: artifactSource("CrimsonWitchOfFlames", 4),
      status: "implemented"
    }
  ],
  equipmentId: "CrimsonWitchOfFlames",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
