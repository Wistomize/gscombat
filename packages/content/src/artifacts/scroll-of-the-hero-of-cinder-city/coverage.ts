import { artifactSource, type EquipmentCoverageEntry } from "../../equipment-coverage.js"

/** Maintainer-reviewed single-core-action coverage for this equipment item. */
export const equipmentCoverage = {
  clauses: [
    {
      id: "artifact.scroll-of-the-hero-of-cinder-city.2pc.nightsoul-burst-energy",
      label: "烬城勇者绘卷 · 二件套（夜魂迸发后的元素能量恢复）",
      reason: "元素能量恢复只改变后续循环资源，不改变当前核心动作的一次期望伤害。",
      source: artifactSource("ScrollOfTheHeroOfCinderCity", 2, "party_member"),
      status: "not_applicable"
    },
    {
      effectIds: [
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.anemo.standard.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.anemo.nightsoul.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.cryo.standard.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.cryo.nightsoul.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.dendro.standard.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.dendro.nightsoul.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.electro.standard.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.electro.nightsoul.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.geo.standard.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.geo.nightsoul.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.hydro.standard.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.hydro.nightsoul.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.standard.damage-bonus",
        "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element.pyro.nightsoul.damage-bonus"
      ],
      id: "artifact.scroll-of-the-hero-of-cinder-city.4pc.reaction-element-team-damage-bonus",
      label: "烬城勇者绘卷 · 四件套（反应相关元素与夜魂状态的队伍伤害加成快照）",
      source: artifactSource("ScrollOfTheHeroOfCinderCity", 4, "party_member"),
      status: "implemented"
    }
  ],
  equipmentId: "ScrollOfTheHeroOfCinderCity",
  kind: "artifact_set"
} as const satisfies EquipmentCoverageEntry
