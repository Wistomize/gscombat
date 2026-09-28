/** Maintained same-effect pairs; not an enumeration of all interchangeable real sets. */
export const artifactComparisonGroups = [
  { id: "attack", label: "攻击力＋攻击力", sets: ["GladiatorsFinale", "ShimenawasReminiscence"] },
  { id: "hp", label: "生命值＋生命值", sets: ["TenacityOfTheMillelith", "VourukashasGlow"] },
  { id: "defense", label: "防御力＋防御力", sets: ["DefendersWill", "HuskOfOpulentDreams"] },
  { id: "mastery", label: "元素精通＋元素精通", sets: ["GildedDreams", "WanderersTroupe"] },
  { id: "recharge", label: "元素充能＋元素充能", sets: ["EmblemOfSeveredFate", "SilkenMoonsSerenade"] },
  { id: "cryo", label: "冰伤＋冰伤", sets: ["BlizzardStrayer", "FinaleOfTheDeepGalleries"] },
  { id: "anemo", label: "风伤＋风伤", sets: ["DesertPavilionChronicle", "ViridescentVenerer"] },
  { id: "hydro", label: "水伤＋水伤", sets: ["HeartOfDepth", "NymphsDream"] },
  { id: "physical", label: "物伤＋物伤", sets: ["BloodstainedChivalry", "PaleFlame"] },
  { id: "skill", label: "战技增伤＋战技增伤", sets: ["Gambler", "GoldenTroupe"] },
  { id: "normal-charged", label: "普攻重击增伤＋普攻重击增伤", sets: ["MarechausseeHunter", "MartialArtist"] },
  { id: "healing", label: "治疗加成＋治疗加成", sets: ["MaidenBeloved", "OceanHuedClam"] }
] as const
