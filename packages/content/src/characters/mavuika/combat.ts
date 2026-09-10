import type {
  CharacterCombatCoverage,
  CombatActionMetadata,
  CombatDamageMetricDefinition
} from "../../combat/types.js"

import { mavuikaDefinition } from "./definition.js"

const mavuikaC6NightsoulHitActionIds = {
  flamestriderCrash: {
    melt: "mavuika.constellation.6.humanitys_name_unfettered.flamestrider_crash.melt",
    none: "mavuika.constellation.6.humanitys_name_unfettered.flamestrider_crash.none",
    vaporize: "mavuika.constellation.6.humanitys_name_unfettered.flamestrider_crash.vaporize"
  },
  scorchingRing: {
    melt: "mavuika.constellation.6.humanitys_name_unfettered.scorching_ring.melt",
    none: "mavuika.constellation.6.humanitys_name_unfettered.scorching_ring.none",
    vaporize: "mavuika.constellation.6.humanitys_name_unfettered.scorching_ring.vaporize"
  }
} as const

const mavuikaC6FlamestriderCrashActionIds = Object.values(mavuikaC6NightsoulHitActionIds.flamestriderCrash)
const mavuikaC6ScorchingRingActionIds = Object.values(mavuikaC6NightsoulHitActionIds.scorchingRing)
const mavuikaC6NightsoulActionIds = [...mavuikaC6FlamestriderCrashActionIds, ...mavuikaC6ScorchingRingActionIds]

function createMavuikaC6NightsoulHitAction(
  id: string,
  reaction: CombatActionMetadata["amplifyingReaction"]
): CombatActionMetadata {
  const damagePartId = id.split(".").slice(-2).join("-")
  return {
    ...(reaction ? { amplifyingReaction: reaction } : {}),
    ...(reaction ? { noReactionActionId: mavuikaC6FlamestriderCrashActionIds.some((candidate) => candidate === id)
      ? mavuikaC6NightsoulHitActionIds.flamestriderCrash.none : mavuikaC6NightsoulHitActionIds.scorchingRing.none } : {}),
    characterId: "Mavuika",
    damageKind: "direct",
    damageParts: [
      {
        coefficientParameterId: "the-named-moment-skill-damage",
        id: damagePartId,
        snapshotChecks: [
          { expectedCoefficient: 0.744, talentLevel: 1 },
          { expectedCoefficient: 1.3392, talentLevel: 10 }
        ]
      }
    ],
    element: mavuikaDefinition.element,
    evaluator: "declared_direct",
    id,
    kind: "damage",
    parameterReferences: [
      {
        groupId: "skill",
        id: "the-named-moment-skill-damage",
        parameterIndex: 0,
        source: "talent",
        talentSlot: "skill"
      }
    ],
    scalingStat: "attack",
    scenarioParameters: [
      {
        allowedValues: [0, 1],
        defaultValue: 0,
        id: "c6-all-fire-armaments-hit-ready",
        label: "C6 「人之名」解放：对应诸火武装追加攻击命中",
        maximumValue: 0,
        minimumValue: 0,
        rangeBySourceConstellation: [
          { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
        ]
      }
    ],
    status: "verified",
    talentSlot: "skill",
    timeline: {
      damageEvents: [
        {
          at: 0,
          coefficientMultiplier: {
            kind: "scenario_parameter_lookup",
            parameterId: "c6-all-fire-armaments-hit-ready",
            values: [
              { multiplier: 0, parameterValue: 0 },
              { multiplier: 0, parameterValue: 1 }
            ]
          },
          damagePartId,
          id: damagePartId,
          snapshot: "hit"
        }
      ],
      duration: 1
    }
  }
}

function createMavuikaC6DamageMetric(actionId: string, label: string): CombatDamageMetricDefinition {
  return {
    actionId,
    characterId: "Mavuika",
    id: actionId,
    kind: "damage",
    minimumSourceConstellation: 6,
    label,
    sourceActionId: actionId,
    status: "verified",
    target: "enemy"
  }
}

export const mavuikaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Mavuika",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.80035, talentLevel: 1 },
            { expectedCoefficient: 1.582088, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "mavuika.normal.auto.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "normal-attack-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Mavuika",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "the-named-moment-skill-damage",
          id: "the-named-moment-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.744, talentLevel: 1 },
            { expectedCoefficient: 1.3392, talentLevel: 10 }
          ]
        }
      ],
      element: mavuikaDefinition.element,
      evaluator: "declared_direct",
      id: "mavuika.skill.the_named_moment.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "the-named-moment-skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "vaporize_reverse" },
      characterId: "Mavuika",
      damageKind: "direct",
      damageParts: [
        {
          id: "sunfell-slice",
          scalingTerms: [
            {
              coefficientParameterId: "sunfell-slice-base-damage",
              snapshotChecks: [
                { expectedCoefficient: 4.448, talentLevel: 1 },
                { expectedCoefficient: 8.0064, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierScenarioParameterId: "fighting-spirit",
              coefficientParameterId: "sunfell-slice-damage-increase-per-fighting-spirit",
              snapshotChecks: [
                { expectedCoefficient: 0.016, talentLevel: 1 },
                { expectedCoefficient: 0.0288, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: mavuikaDefinition.element,
      evaluator: "declared_direct",
      id: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-sunfell-slice-damage-bonus-per-fighting-spirit",
          kind: "flat",
          label: "固有天赋 · 基扬戈兹",
          minimumSourceAscension: 4,
          scenarioParameterMultiplier: {
            base: 0,
            parameterId: "fighting-spirit",
            perParameterValue: 1
          },
          snapshotChecks: [{ expectedCoefficient: 0.0001, talentLevel: 1 }],
          target: "damageBonus",
          valueMultiplier: 20
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "sunfell-slice-base-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "sunfell-slice-damage-increase-per-fighting-spirit",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "a4-sunfell-slice-damage-bonus-per-fighting-spirit",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 200,
          id: "fighting-spirit",
          label: "战意（手填整数，100 至 200；默认满战意）",
          maximumValue: 200,
          minimumValue: 100
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "melt_forward" },
      characterId: "Mavuika",
      damageKind: "direct",
      damageParts: [
        {
          id: "sunfell-slice",
          scalingTerms: [
            {
              coefficientParameterId: "sunfell-slice-base-damage",
              snapshotChecks: [
                { expectedCoefficient: 4.448, talentLevel: 1 },
                { expectedCoefficient: 8.0064, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierScenarioParameterId: "fighting-spirit",
              coefficientParameterId: "sunfell-slice-damage-increase-per-fighting-spirit",
              snapshotChecks: [
                { expectedCoefficient: 0.016, talentLevel: 1 },
                { expectedCoefficient: 0.0288, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: mavuikaDefinition.element,
      evaluator: "declared_direct",
      id: "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-sunfell-slice-damage-bonus-per-fighting-spirit",
          kind: "flat",
          label: "固有天赋 · 基扬戈兹",
          minimumSourceAscension: 4,
          scenarioParameterMultiplier: {
            base: 0,
            parameterId: "fighting-spirit",
            perParameterValue: 1
          },
          snapshotChecks: [{ expectedCoefficient: 0.0001, talentLevel: 1 }],
          target: "damageBonus",
          valueMultiplier: 20
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "sunfell-slice-base-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "sunfell-slice-damage-increase-per-fighting-spirit",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "a4-sunfell-slice-damage-bonus-per-fighting-spirit",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 200,
          id: "fighting-spirit",
          label: "战意（手填整数，100 至 200；默认满战意）",
          maximumValue: 200,
          minimumValue: 100
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    createMavuikaC6NightsoulHitAction(mavuikaC6NightsoulHitActionIds.flamestriderCrash.none, undefined),
    createMavuikaC6NightsoulHitAction(mavuikaC6NightsoulHitActionIds.flamestriderCrash.vaporize, {
      bonus: 0,
      kind: "vaporize_reverse"
    }),
    createMavuikaC6NightsoulHitAction(mavuikaC6NightsoulHitActionIds.flamestriderCrash.melt, {
      bonus: 0,
      kind: "melt_forward"
    }),
    createMavuikaC6NightsoulHitAction(mavuikaC6NightsoulHitActionIds.scorchingRing.none, undefined),
    createMavuikaC6NightsoulHitAction(mavuikaC6NightsoulHitActionIds.scorchingRing.vaporize, {
      bonus: 0,
      kind: "vaporize_reverse"
    }),
    createMavuikaC6NightsoulHitAction(mavuikaC6NightsoulHitActionIds.scorchingRing.melt, {
      bonus: 0,
      kind: "melt_forward"
    })
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { kind: "team_nightsoul_burst", minimumTriggers: 1 },
      id: "mavuika.passive.gift_of_flaming_flowers.after_nightsoul_burst.attack_percent",
      label: "固有天赋 · 炎花献礼（夜魂迸发后10秒，攻击力提高）",
      source: { characterId: "Mavuika", kind: "character", minimumSourceAscension: 1 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "active",
      id: "mavuika.constellation.1.the-nights-lord.earned_fighting_spirit.attack_percent",
      label: "夜主的授记 · C1 已获得战意（攻击力提高40%，8秒）",
      source: { characterId: "Mavuika", kind: "character", minimumSourceConstellation: 1 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "maximum_reachable",
      id: "mavuika.constellation.2.the-ashen-price.nightsoul-blessing.base-attack",
      label: "灰烬的代价 · C2 夜魂加持（基础攻击力提升200点）",
      source: { characterId: "Mavuika", kind: "character", minimumSourceConstellation: 2 },
      target: "baseAttackFlat",
      targetFilter: {
        actionIds: [
          "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
          "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
          ...mavuikaC6NightsoulActionIds
        ],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 200 }
    },
    {
      activation: "maximum_reachable",
      id: "mavuika.constellation.2.the-ashen-price.flamestrider.sunfell-slice.base-damage",
      label: "灰烬的代价 · C2 驰轮车形态（坠日斩增加120%攻击力伤害）",
      source: { characterId: "Mavuika", kind: "character", minimumSourceConstellation: 2 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: [
          "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
          "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt"
        ],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 1.2 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    },
    {
      activation: "maximum_reachable",
      id: "mavuika.constellation.4.the-leaders-resolve.kiongozi.damage-bonus",
      label: "「领袖」的觉悟 · C4 基扬戈兹额外伤害加成",
      source: {
        characterId: "Mavuika",
        kind: "character",
        minimumSourceAscension: 4,
        minimumSourceConstellation: 4
      },
      target: "damageBonus",
      targetFilter: {
        actionIds: [
          "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
          "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
          ...mavuikaC6NightsoulActionIds
        ],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "maximum_reachable",
      id: "mavuika.constellation.6.humanitys-name-unfettered.ring.flamestrider-crash.damage",
      label: "「人之名」解放 · C6 焚曜之环命中追加驰轮车冲撞（200%攻击力）",
      source: { characterId: "Mavuika", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: { actionIds: mavuikaC6FlamestriderCrashActionIds, recipientSourceRelation: "source" },
      value: {
        coefficient: { kind: "fixed", value: 2 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    },
    {
      activation: "maximum_reachable",
      id: "mavuika.constellation.6.humanitys-name-unfettered.flamestrider.scorching-ring.damage",
      label: "「人之名」解放 · C6 驰轮车形态灼热焚曜之环单次命中（500%攻击力）",
      source: { characterId: "Mavuika", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: { actionIds: mavuikaC6ScorchingRingActionIds, recipientSourceRelation: "source" },
      value: {
        coefficient: { kind: "fixed", value: 5 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    },
    {
      activation: "maximum_reachable",
      id: "mavuika.constellation.6.humanitys-name-unfettered.flamestrider.ring.enemy-defense-reduction",
      label: "「人之名」解放 · C6 驰轮车形态召唤焚曜之环（附近敌人防御力降低20%）",
      source: { characterId: "Mavuika", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyDefenseReduction",
      targetFilter: {
        actionIds: [
          "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
          "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
          ...mavuikaC6NightsoulActionIds
        ],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Mavuika",
  metrics: [
    createMavuikaC6DamageMetric(
      mavuikaC6NightsoulHitActionIds.flamestriderCrash.none,
      "「人之名」解放 / C6 焚曜之环追加驰轮车冲撞·无反应"
    ),
    createMavuikaC6DamageMetric(
      mavuikaC6NightsoulHitActionIds.flamestriderCrash.vaporize,
      "「人之名」解放 / C6 焚曜之环追加驰轮车冲撞·水底蒸发"
    ),
    createMavuikaC6DamageMetric(
      mavuikaC6NightsoulHitActionIds.flamestriderCrash.melt,
      "「人之名」解放 / C6 焚曜之环追加驰轮车冲撞·冰底融化"
    ),
    createMavuikaC6DamageMetric(
      mavuikaC6NightsoulHitActionIds.scorchingRing.none,
      "「人之名」解放 / C6 驰轮车形态灼热焚曜之环单次命中·无反应"
    ),
    createMavuikaC6DamageMetric(
      mavuikaC6NightsoulHitActionIds.scorchingRing.vaporize,
      "「人之名」解放 / C6 驰轮车形态灼热焚曜之环单次命中·水底蒸发"
    ),
    createMavuikaC6DamageMetric(
      mavuikaC6NightsoulHitActionIds.scorchingRing.melt,
      "「人之名」解放 / C6 驰轮车形态灼热焚曜之环单次命中·冰底融化"
    ),
    {
      actionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
      characterId: "Mavuika",
      id: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
      kind: "damage",
      label: "死生之炉 / 日灼一击·水底蒸发",
      sourceActionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
      characterId: "Mavuika",
      id: "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
      kind: "damage",
      label: "死生之炉 / 日灼一击·冰底融化",
      sourceActionId: "mavuika.burst.hour_of_burning_skies.sunfell_slice.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One uninfused first normal hit and The Named Moment's initial hit remain verified raw actions. The selected core hit is one Hour of Burning Skies Sunfell Slice: Attack × (burst[0] + Fighting Spirit × burst[2]). Fighting Spirit is an action-owned manual integer input from 100 through 200 and defaults to the full 200. At full Fighting Spirit, the pinned 6.7 snapshot resolves to 764.8% Attack at Burst Level 1 and 1376.64% at Level 10. At Ascension 1+, Gift of Flaming Flowers automatically adds 30% Attack after a party-reachable Nightsoul Burst. At Ascension 4+, the initial Sunfell Slice includes Kiongozi's 0.002 × Fighting Spirit Damage Bonus: 40% at the default full 200 Fighting Spirit. C1 remains an explicit current snapshot because its eight-second Attack window depends on when Fighting Spirit was last gained. C2 automatically adds 200 Base Attack before every Attack-percent multiplier and adds another 120% of final Attack to the same Sunfell Slice base-damage stage. C3 raises Burst level, and C4 adds its extra 10% Kiongozi Damage Bonus. At C6, the maintained independent metrics include the 200%-Attack Flamestrider crash triggered by a Ring hit and the once-per-three-seconds 500%-Attack Scorching Ring hit while riding the Flamestrider. Both include the C2 Base Attack increase, C4 maximum post-Burst bonus, and the applicable 20% nearby-enemy Defense reduction; each is exposed as no-reaction, Hydro-aura Vaporize, and Cryo-aura Melt. Nightsoul generation, traversal, trigger cadence beyond the selected hit, and full rotations remain outside these metrics.",
  label: mavuikaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
