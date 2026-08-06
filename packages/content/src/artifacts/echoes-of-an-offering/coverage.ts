import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.echoes-of-an-offering.2pc.attack-percent"],
      id: "artifact.echoes-of-an-offering.2pc.attack-percent",
      label: "来歆余响 · 二件套",
      source: artifactSource("EchoesOfAnOffering", 2),
      status: "implemented"
    },
    {
      effectIds: ["artifact.echoes-of-an-offering.4pc.valley-rite.normal-attack-additive-damage"],
      id: "artifact.echoes-of-an-offering.4pc.valley-rite.additional-damage",
      label: "来歆余响 · 四件套（本次普通攻击触发幽谷祝祀的同一命中加算）",
      source: artifactSource("EchoesOfAnOffering", 4),
      status: "implemented"
    }
  ],
  equipmentId: "EchoesOfAnOffering",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
