import type {
  CharacterCombatCoverage,
  CombatActionMetadata,
  CombatDamageMetricDefinition
} from "../../combat/types.js"

import { odetteDefinition } from "./definition.js"

export const odetteEffectIds = {
  stellarConductRadiance: "odette.constellation.2.radiance.stellar_conduct.resistance_reduction",
  stellarSwirlRadiance: "odette.constellation.2.radiance.stellar_swirl.resistance_reduction"
} as const

const stellarConductApplicationsParameter = {
  defaultValue: 12,
  id: "stellar-conduct-stored-elemental-applications",
  label: "极星辉域已存储元素附着次数",
  maximumValue: 12,
  minimumValue: 0
} as const

function createSkillDamageAction(input: {
  readonly coefficientParameterId: string
  readonly id: string
  readonly parameterIndex: number
  readonly snapshots: readonly [number, number]
}): CombatActionMetadata {
  return {
    characterId: "Odette",
    damageKind: "direct",
    damageParts: [
      {
        coefficientParameterId: input.coefficientParameterId,
        id: input.coefficientParameterId,
        snapshotChecks: [
          { expectedCoefficient: input.snapshots[0], talentLevel: 1 },
          { expectedCoefficient: input.snapshots[1], talentLevel: 10 }
        ]
      }
    ],
    element: odetteDefinition.element,
    evaluator: "declared_direct",
    id: input.id,
    kind: "damage",
    parameterReferences: [
      {
        groupId: "skill",
        id: input.coefficientParameterId,
        parameterIndex: input.parameterIndex,
        source: "talent",
        talentSlot: "skill"
      }
    ],
    scalingStat: "attack",
    status: "verified",
    talentSlot: "skill"
  }
}

function createStellarSkillDamageAction(input: {
  readonly coefficientParameterId: string
  readonly id: string
  readonly kind: "stellar_superconduct" | "stellar_swirl"
  readonly parameterIndex: number
  readonly snapshots: readonly [number, number]
}): CombatActionMetadata {
  return {
    ...createSkillDamageAction(input),
    damageKind: "special_reaction",
    evaluator: "declared_special_reaction",
    ...(input.kind === "stellar_superconduct"
      ? { scenarioParameters: [stellarConductApplicationsParameter] }
      : {}),
    specialReaction:
      input.kind === "stellar_superconduct"
        ? {
            kind: input.kind,
            stellarStoredElementalApplicationsParameterId: stellarConductApplicationsParameter.id
          }
        : { kind: input.kind }
  }
}

const odetteDamageActions = [
  createSkillDamageAction({
    coefficientParameterId: "solo-dance-double-plume-move-damage",
    id: "odette.skill.adagio_phantom_night_dancers.solo_dance_double.plume",
    parameterIndex: 4,
    snapshots: [0.4304, 0.77472]
  }),
  createStellarSkillDamageAction({
    coefficientParameterId: "solo-dance-double-plume-move-stellar-conduct-damage",
    id: "odette.skill.adagio_phantom_night_dancers.solo_dance_double.plume.stellar_conduct",
    kind: "stellar_superconduct",
    parameterIndex: 5,
    snapshots: [0.27024, 0.486432]
  }),
  createStellarSkillDamageAction({
    coefficientParameterId: "solo-dance-double-plume-move-stellar-swirl-damage",
    id: "odette.skill.adagio_phantom_night_dancers.solo_dance_double.plume.stellar_swirl",
    kind: "stellar_swirl",
    parameterIndex: 6,
    snapshots: [0.40528, 0.729504]
  }),
  createSkillDamageAction({
    coefficientParameterId: "solo-dance-double-wing-move-damage",
    id: "odette.skill.adagio_phantom_night_dancers.solo_dance_double.wing",
    parameterIndex: 7,
    snapshots: [0.51464, 0.926352]
  }),
  createStellarSkillDamageAction({
    coefficientParameterId: "solo-dance-double-wing-move-stellar-conduct-damage",
    id: "odette.skill.adagio_phantom_night_dancers.solo_dance_double.wing.stellar_conduct",
    kind: "stellar_superconduct",
    parameterIndex: 8,
    snapshots: [0.32312, 0.581616]
  }),
  createStellarSkillDamageAction({
    coefficientParameterId: "solo-dance-double-wing-move-stellar-swirl-damage",
    id: "odette.skill.adagio_phantom_night_dancers.solo_dance_double.wing.stellar_swirl",
    kind: "stellar_swirl",
    parameterIndex: 9,
    snapshots: [0.48464, 0.872352]
  })
] as const

const metricLabels: Readonly<Record<(typeof odetteDamageActions)[number]["id"], string>> = {
  "odette.skill.adagio_phantom_night_dancers.solo_dance_double.plume":
    "柔板·幻灵夜舞 / 独舞倒影·拂羽舞步单次冰元素伤害",
  "odette.skill.adagio_phantom_night_dancers.solo_dance_double.plume.stellar_conduct":
    "柔板·幻灵夜舞 / 独舞倒影·拂羽舞步单次星超导伤害",
  "odette.skill.adagio_phantom_night_dancers.solo_dance_double.plume.stellar_swirl":
    "柔板·幻灵夜舞 / 独舞倒影·拂羽舞步单次星扩散伤害",
  "odette.skill.adagio_phantom_night_dancers.solo_dance_double.wing":
    "柔板·幻灵夜舞 / 独舞倒影·旋翼舞步单次冰元素伤害",
  "odette.skill.adagio_phantom_night_dancers.solo_dance_double.wing.stellar_conduct":
    "柔板·幻灵夜舞 / 独舞倒影·旋翼舞步单次星超导伤害",
  "odette.skill.adagio_phantom_night_dancers.solo_dance_double.wing.stellar_swirl":
    "柔板·幻灵夜舞 / 独舞倒影·旋翼舞步单次星扩散伤害"
}

const odetteDamageMetrics: readonly CombatDamageMetricDefinition[] = odetteDamageActions.map((action) => {
  const label = metricLabels[action.id]
  if (!label) throw new Error(`Missing Odette metric label for ${action.id}`)
  return {
    actionId: action.id,
    characterId: "Odette",
    id: action.id,
    kind: "damage",
    label,
    sourceActionId: action.id,
    status: "verified",
    target: "enemy"
  }
})

export const odetteCombatCoverage: CharacterCombatCoverage = {
  actions: [
    ...odetteDamageActions,
    {
      characterId: "Odette",
      element: odetteDefinition.element,
      id: "odette.passive.spring_rite.marvelous_splendor.attack_buff",
      kind: "support",
      status: "verified",
      talentSlot: "passive"
    },
    {
      characterId: "Odette",
      element: odetteDefinition.element,
      id: "odette.burst.presto_bluebird_finale.snow_swan_dream",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "snow-swan-dream-stellar-reaction-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "odette.passive.stellar_benediction.silver_dawn_dance.base_damage_bonus",
      label: "星耀祝礼·银晓之舞 · 基于奥黛塔攻击力提升星超导/星扩散基础伤害（最高14%）",
      source: { characterId: "Odette", kind: "character" },
      target: "specialReactionBaseDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
      value: {
        kind: "source_final_attack",
        maximumValue: { kind: "fixed", value: 0.14 },
        multiplier: { kind: "fixed", value: 0.00007 }
      }
    },
    {
      activation: "maximum_reachable",
      id: "odette.passive.spring_rite.marvelous_splendor.stellar_damage_bonus",
      label: "获选者的春祭 · 4层华彩使星烁反应伤害提升60%",
      source: { characterId: "Odette", kind: "character", minimumSourceAscension: 1 },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
      value: { kind: "fixed", value: 0.6 }
    },
    {
      activation: "maximum_reachable",
      id: "odette.constellation.1.marvelous_splendor.additional_stellar_damage_bonus",
      label: "不曾起舞的清晨，她望向倒影 · C1额外2层华彩使星烁反应伤害提升30%",
      source: { characterId: "Odette", kind: "character", minimumSourceConstellation: 1 },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "maximum_reachable",
      id: "odette.passive.pathetique.base_damage_multiplier",
      label: "赤忱者的悲歌 · 超过1000点攻击力的部分提升原本伤害（最高30%）",
      source: { characterId: "Odette", kind: "character", minimumSourceAscension: 4 },
      target: "specialReactionBaseDamageMultiplier",
      targetFilter: {
        recipientSourceRelation: "source",
        specialReactionKinds: ["stellar_superconduct", "stellar_swirl"]
      },
      value: {
        kind: "source_final_attack",
        maximumValue: { kind: "fixed", value: 0.3 },
        multiplier: { kind: "fixed", value: 0.00015 },
        offset: -1000
      }
    },
    {
      activation: "maximum_reachable",
      id: "odette.burst.snow_swan_dream.self_stellar_damage_bonus",
      label: "疾板·苍羽一梦 · 雪鹄之梦提升奥黛塔星烁反应伤害",
      source: { characterId: "Odette", kind: "character" },
      target: "specialReactionDamageBonus",
      targetFilter: {
        recipientSourceRelation: "source",
        specialReactionKinds: ["stellar_superconduct", "stellar_swirl"]
      },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "burst",
          id: "snow-swan-dream-stellar-reaction-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "odette.constellation.4.snow_swan_dream.party_stellar_damage_bonus",
      label: "高飞，飞越那幽蓝漫长的迷狂 · C4队友获得雪鹄之梦50%的星烁反应伤害提升",
      source: { characterId: "Odette", kind: "character", minimumSourceConstellation: 4 },
      target: "specialReactionDamageBonus",
      targetFilter: {
        recipientSourceRelation: "not_source",
        specialReactionKinds: ["stellar_superconduct", "stellar_swirl"]
      },
      value: {
        kind: "talent_parameter",
        multiplier: 0.5,
        parameter: {
          groupId: "burst",
          id: "snow-swan-dream-stellar-reaction-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "odette.constellation.2.marvelous_splendor.attack_percent",
      label: "她想，我要见证雪鹄未见之梦 · C2满6层华彩使攻击力提升42%",
      source: { characterId: "Odette", kind: "character", minimumSourceConstellation: 2 },
      target: "attackPercent",
      value: { kind: "fixed", value: 0.42 }
    },
    {
      activation: "active",
      exclusivity: { group: "odette-radiance", variant: "stellar-conduct" },
      id: odetteEffectIds.stellarConductRadiance,
      label: "辉映·星超导 · C2降低附近敌人20%冰/雷元素抗性",
      source: { characterId: "Odette", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["cryo", "electro"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "active",
      exclusivity: { group: "odette-radiance", variant: "stellar-swirl" },
      id: odetteEffectIds.stellarSwirlRadiance,
      label: "辉映·星扩散 · C2降低附近敌人20%冰/风元素抗性",
      source: { characterId: "Odette", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["cryo", "anemo"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "maximum_reachable",
      id: "odette.constellation.6.marvelous_splendor.party_stellar_elevation",
      label: "伸出手，触及苍穹永恒的面容 · C6华彩使全队星烁反应伤害擢升25%",
      source: { characterId: "Odette", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionElevation",
      targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
      value: { kind: "fixed", value: 0.25 }
    },
    {
      activation: "maximum_reachable",
      id: "odette.constellation.6.self_stellar_elevation",
      label: "伸出手，触及苍穹永恒的面容 · C6奥黛塔星烁反应伤害额外擢升20%",
      source: { characterId: "Odette", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionElevation",
      targetFilter: {
        recipientSourceRelation: "source",
        specialReactionKinds: ["stellar_superconduct", "stellar_swirl"]
      },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Odette",
  detail:
    "The selected damage metrics cover one Plume or Wing Solo Dance Double hit in ordinary Cryo, Stellar-Conduct, or Stellar-Swirl form. Stellar-Conduct keeps its explicit 0–12 stored-application snapshot; Stellar-Swirl direct talent damage uses coefficient one. Silver Dawn Dance enters the base-damage-bonus stage; Pathetique enters the shared base-damage-multiplier stage rather than Elevation. Maximum-reachable Splendor resolves four stacks at C0 and six from C1 onward; because the Attack effect unlocks at C2 after cumulative C1, its maintained C2 output is 42%. C6 resolves 25% party Elevation plus another 20% for Odette.",
  label: odetteDefinition.name,
  metrics: [
    ...odetteDamageMetrics,
    {
      characterId: "Odette",
      id: "odette.constellation.2.marvelous_splendor.attack_percent",
      kind: "scalar",
      label: "华彩 / C2满6层攻击力提升",
      ratio: 0,
      ratioConstellationBonuses: [{ minimumConstellation: 2, value: 0.42 }],
      recipientRequirements: [],
      semantic: "attack_buff",
      sourceActionId: "odette.passive.spring_rite.marvelous_splendor.attack_buff",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  scenarioEffectOptions: [
    {
      id: odetteEffectIds.stellarConductRadiance,
      label: "辉映·星超导（C2冰/雷减抗）",
      minimumSourceConstellation: 2
    },
    {
      id: odetteEffectIds.stellarSwirlRadiance,
      label: "辉映·星扩散（C2冰/风减抗）",
      minimumSourceConstellation: 2
    }
  ],
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
