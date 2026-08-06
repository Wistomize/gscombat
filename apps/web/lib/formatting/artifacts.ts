import type { ArtifactPiece, ArtifactStat } from "@gscombat/contracts"

export const artifactSlotLabels: Readonly<Record<ArtifactPiece["slot"], string>> = {
  circlet: "理之冠",
  flower: "生之花",
  goblet: "空之杯",
  plume: "死之羽",
  sands: "时之沙"
}

export const artifactStatLabels: Readonly<Record<ArtifactStat, string>> = {
  anemo_damage_bonus: "风伤%",
  atk: "攻击力",
  atk_percent: "攻击力%",
  crit_damage: "暴击伤害",
  crit_rate: "暴击率",
  cryo_damage_bonus: "冰伤%",
  def: "防御力",
  def_percent: "防御力%",
  dendro_damage_bonus: "草伤%",
  electro_damage_bonus: "雷伤%",
  elemental_mastery: "元素精通",
  energy_recharge: "充能效率%",
  geo_damage_bonus: "岩伤%",
  healing_bonus: "治疗加成%",
  hp: "生命值",
  hp_percent: "生命值%",
  hydro_damage_bonus: "水伤%",
  physical_damage_bonus: "物伤%",
  pyro_damage_bonus: "火伤%"
}

export const artifactStats = Object.keys(artifactStatLabels) as ArtifactStat[]

export const artifactSubstatOptions: ArtifactStat[] = [
  "hp",
  "hp_percent",
  "atk",
  "atk_percent",
  "def",
  "def_percent",
  "elemental_mastery",
  "energy_recharge",
  "crit_rate",
  "crit_damage"
]
