import {
  DEFAULT_TRAINING_ENEMY,
  type ArtifactPiece,
  type ArtifactSlot,
  type ArtifactStat,
  type CharacterBuild,
  type EvaluationScenario
} from "@gscombat/contracts"

const mainStats: Readonly<Record<ArtifactSlot, { readonly stat: ArtifactStat; readonly value: number }>> = {
  circlet: { stat: "crit_rate", value: 0.311 },
  flower: { stat: "hp", value: 4780 },
  goblet: { stat: "electro_damage_bonus", value: 0.466 },
  plume: { stat: "atk", value: 311 },
  sands: { stat: "energy_recharge", value: 0.518 }
}

const substats: Readonly<Record<ArtifactSlot, ArtifactPiece["substats"]>> = {
  circlet: [
    { stat: "crit_damage", value: 0.21 },
    { stat: "atk_percent", value: 0.099 },
    { stat: "energy_recharge", value: 0.11 },
    { stat: "atk", value: 19 }
  ],
  flower: [
    { stat: "crit_rate", value: 0.066 },
    { stat: "crit_damage", value: 0.132 },
    { stat: "atk_percent", value: 0.058 },
    { stat: "energy_recharge", value: 0.11 }
  ],
  goblet: [
    { stat: "crit_rate", value: 0.066 },
    { stat: "crit_damage", value: 0.132 },
    { stat: "atk_percent", value: 0.058 },
    { stat: "energy_recharge", value: 0.104 }
  ],
  plume: [
    { stat: "crit_rate", value: 0.07 },
    { stat: "crit_damage", value: 0.14 },
    { stat: "atk_percent", value: 0.058 },
    { stat: "energy_recharge", value: 0.104 }
  ],
  sands: [
    { stat: "crit_rate", value: 0.062 },
    { stat: "crit_damage", value: 0.124 },
    { stat: "atk_percent", value: 0.099 },
    { stat: "atk", value: 19 }
  ]
}

function createArtifact(slot: ArtifactSlot): ArtifactPiece {
  return {
    id: `raiden-emblem-${slot}`,
    level: 20,
    mainStat: mainStats[slot],
    rarity: 5,
    setId: "EmblemOfSeveredFate",
    slot,
    substats: substats[slot]
  }
}

function createSupportArtifacts(ownerId: string, setId: string, gobletStat: ArtifactStat): ArtifactPiece[] {
  return (["flower", "plume", "sands", "goblet", "circlet"] as const).map((slot) => ({
    id: `${ownerId}-${setId}-${slot}`,
    level: 20,
    mainStat: slot === "goblet" ? { stat: gobletStat, value: 0.466 } : mainStats[slot],
    rarity: 5,
    setId,
    slot,
    substats: []
  }))
}

export const raidenNationalBuiltinBuild: CharacterBuild = {
  artifacts: (["flower", "plume", "sands", "goblet", "circlet"] as const).map(createArtifact),
  ascension: 6,
  buildId: "builtin.raiden-national.raiden",
  characterId: "RaidenShogun",
  constellation: 2,
  gameDataVersion: "6.7",
  label: "雷电将军 · 雷国首刀",
  level: 90,
  source: { kind: "builtin", presetId: "raiden-national.initial-slash" },
  talents: { burst: 10, normal: 6, skill: 9 },
  weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "EngulfingLightning" }
}

export const bennettNationalBuiltinBuild: CharacterBuild = {
  artifacts: createSupportArtifacts("bennett", "NoblesseOblige", "pyro_damage_bonus"),
  ascension: 6,
  buildId: "builtin.raiden-national.bennett",
  characterId: "Bennett",
  constellation: 1,
  gameDataVersion: "6.7",
  label: "班尼特 · 宗室辅助",
  level: 90,
  source: { kind: "builtin", presetId: "raiden-national.initial-slash" },
  talents: { burst: 10, normal: 6, skill: 9 },
  weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
}

export const xianglingNationalBuiltinBuild: CharacterBuild = {
  artifacts: createSupportArtifacts("xiangling", "EmblemOfSeveredFate", "pyro_damage_bonus"),
  ascension: 6,
  buildId: "builtin.raiden-national.xiangling",
  characterId: "Xiangling",
  constellation: 4,
  gameDataVersion: "6.7",
  label: "香菱 · 渔获绝缘",
  level: 90,
  source: { kind: "builtin", presetId: "raiden-national.initial-slash" },
  talents: { burst: 10, normal: 6, skill: 9 },
  weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "TheCatch" }
}

export const xingqiuNationalBuiltinBuild: CharacterBuild = {
  artifacts: createSupportArtifacts("xingqiu", "EmblemOfSeveredFate", "hydro_damage_bonus"),
  ascension: 6,
  buildId: "builtin.raiden-national.xingqiu",
  characterId: "Xingqiu",
  constellation: 6,
  gameDataVersion: "6.7",
  label: "行秋 · 祭礼绝缘",
  level: 90,
  source: { kind: "builtin", presetId: "raiden-national.initial-slash" },
  talents: { burst: 10, normal: 6, skill: 9 },
  weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "SacrificialSword" }
}

export const raidenNationalBuiltinTeam: readonly CharacterBuild[] = [
  raidenNationalBuiltinBuild,
  bennettNationalBuiltinBuild,
  xianglingNationalBuiltinBuild,
  xingqiuNationalBuiltinBuild
]

export const raidenNationalBuiltinScenario: EvaluationScenario = {
  conditions: {
    activeEffectIds: ["raiden.skill.eye", "bennett.burst.field"],
    actionParameters: { "resolve-stack-count": 60 },
    equipmentEffectMode: "maximum_reachable",
    enemyCount: 1,
  },
  enemy: DEFAULT_TRAINING_ENEMY,
  externalBuffs: [],
  gameDataVersion: "6.7",
  primary: raidenNationalBuiltinBuild,
  targetActionId: "raiden.burst.initial_slash",
  teammates: [bennettNationalBuiltinBuild, xianglingNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
}
