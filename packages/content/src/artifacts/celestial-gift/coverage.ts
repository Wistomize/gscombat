import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      effectIds: ["artifact.celestial-gift.2pc.energy-recharge"],
      id: "artifact.celestial-gift.2pc.energy-recharge",
      label: "天之美赐 · 二件套",
      source: artifactSource("CelestialGift", 2),
      status: "implemented"
    },
    {
      effectIds: [
        "artifact.celestial-gift.4pc.celestial-guidance.anemo.damage-bonus",
        "artifact.celestial-gift.4pc.celestial-guidance.cryo.damage-bonus",
        "artifact.celestial-gift.4pc.celestial-guidance.dendro.damage-bonus",
        "artifact.celestial-gift.4pc.celestial-guidance.electro.damage-bonus",
        "artifact.celestial-gift.4pc.celestial-guidance.geo.damage-bonus",
        "artifact.celestial-gift.4pc.celestial-guidance.hydro.damage-bonus",
        "artifact.celestial-gift.4pc.celestial-guidance.pyro.damage-bonus",
        "artifact.celestial-gift.4pc.mortal-hymn.anemo.damage-bonus",
        "artifact.celestial-gift.4pc.mortal-hymn.cryo.damage-bonus",
        "artifact.celestial-gift.4pc.mortal-hymn.dendro.damage-bonus",
        "artifact.celestial-gift.4pc.mortal-hymn.electro.damage-bonus",
        "artifact.celestial-gift.4pc.mortal-hymn.geo.damage-bonus",
        "artifact.celestial-gift.4pc.mortal-hymn.hydro.damage-bonus",
        "artifact.celestial-gift.4pc.mortal-hymn.pyro.damage-bonus"
      ],
      id: "artifact.celestial-gift.4pc.elemental-team-damage-bonus",
      label: "天之美赐 · 四件套（天光之引与凡世颂歌的显式元素队伍增益快照）",
      source: artifactSource("CelestialGift", 4, "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "CelestialGift",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
