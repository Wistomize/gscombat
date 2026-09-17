import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage, CombatActionMetadata } from "../../combat/types.js"

import { furinaDefinition } from "./definition.js"

const furinaC6NormalActionIds = {
  ousia: "furina.constellation.6.center_of_attention.ousia.normal.first_hit",
  pneuma: "furina.constellation.6.center_of_attention.pneuma.normal.first_hit"
} as const

function createCenterOfAttentionNormalAction(arkhe: keyof typeof furinaC6NormalActionIds): CombatActionMetadata {
  return {
    attackKind: "normal",
    characterId: "Furina",
    damageKind: "direct",
    damageParts: [
      {
        coefficientParameterId: "normal-attack-first-hit-damage",
        id: `center-of-attention-${arkhe}-normal-first-hit`,
        snapshotChecks: [
          { expectedCoefficient: 0.483862, talentLevel: 1 },
          { expectedCoefficient: 0.956471, talentLevel: 10 }
        ]
      }
    ],
    element: furinaDefinition.element,
    evaluator: "declared_direct",
    id: furinaC6NormalActionIds[arkhe],
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
    scenarioParameters: [
      {
        allowedValues: [0, 1],
        defaultValue: 0,
        id: "c6-center-of-attention-ready",
        label: "C6 万众瞩目：孤心沙龙施放后的前6次普攻/重击/下落攻击",
        maximumValue: 0,
        minimumValue: 0,
        rangeBySourceConstellation: [
          { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
        ]
      }
    ],
    status: "verified",
    talentSlot: "normal",
    timeline: {
      damageEvents: [
        {
          at: 0,
          coefficientMultiplier: {
            kind: "scenario_parameter_lookup",
            parameterId: "c6-center-of-attention-ready",
            values: [
              { multiplier: 0, parameterValue: 0 },
              { multiplier: 1, parameterValue: 1 }
            ]
          },
          damagePartId: `center-of-attention-${arkhe}-normal-first-hit`,
          hitCount: { kind: "scenario_parameter", parameterId: "c6-center-of-attention-ready" },
          id: `center-of-attention-${arkhe}-normal-first-hit`,
          snapshot: "hit"
        }
      ],
      duration: 1
    }
  }
}

export const furinaCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("furina", 10),
    ...declareWeaponHitCapabilities(furinaDefinition),
    declareHitCapability("furina.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["hydro"]),
    { ...declareHitCapability("furina.kit.sustained_skill_hits", "可持续造成战技命中", ["skill"], ["hydro"], true), skillHitOpportunities: { withinSeconds: 7, count: 2, minimumSeparationSeconds: 0.3 } },
  {
    id: "furina.skill.salon_solitaire.ousia.party_hp_loss", label: "孤心沙龙 · 荒性沙龙成员消耗队伍生命值",
    kind: "hp_loss", recipient: "party", sourceFieldPresence: "any", sustained: true
  }],
  actions: [
    {
      characterId: "Furina",
      element: furinaDefinition.element,
      id: "furina.burst.let_the_people_rejoice.fanfare.damage_bonus",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "fanfare-point-cap",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "fanfare-all-damage-bonus-per-point",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 300,
          id: "fanfare-points",
          label: "当前气氛值（C0：0–300点；C1及以上：施放元素爆发后初始150点，最多400点）",
          maximumValue: 300,
          minimumValue: 0,
          rangeBySourceConstellation: [
            {
              defaultValue: 400,
              maximumValue: 400,
              minimumSourceConstellation: 1,
              minimumValue: 150
            }
          ]
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Furina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.483862, talentLevel: 1 },
            { expectedCoefficient: 0.956471, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "furina.normal.auto.first_hit",
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
      characterId: "Furina",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "mademoiselle-crabaletta-damage",
          id: "mademoiselle-crabaletta",
          snapshotChecks: [
            { expectedCoefficient: 0.08288, talentLevel: 1 },
            { expectedCoefficient: 0.149184, talentLevel: 10 }
          ]
        }
      ],
      element: furinaDefinition.element,
      evaluator: "declared_direct",
      id: "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-salon-member-damage-bonus-per-1000-max-hp",
          kind: "source_stat",
          label: "固有天赋 · 无人听的自白",
          maximumValueParameterId: "a4-maximum-salon-member-damage-bonus",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.007, talentLevel: 1 }],
          sourceStat: "hp",
          target: "damageBonus",
          valueMultiplier: 0.001
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "mademoiselle-crabaletta-damage",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "passive2",
          id: "a4-salon-member-damage-bonus-per-1000-max-hp",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-maximum-salon-member-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "hp",
      scenarioParameters: [
        {
          defaultValue: 4,
          id: "hp-consumption-participant-count",
          label: "本次攻击成功消耗生命值的队伍角色数",
          maximumValue: 4,
          minimumValue: 0
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
              parameterId: "hp-consumption-participant-count",
              values: [
                { multiplier: 1, parameterValue: 0 },
                { multiplier: 1.1, parameterValue: 1 },
                { multiplier: 1.2, parameterValue: 2 },
                { multiplier: 1.3, parameterValue: 3 },
                { multiplier: 1.4, parameterValue: 4 }
              ]
            },
            damagePartId: "mademoiselle-crabaletta",
            id: "mademoiselle-crabaletta",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    createCenterOfAttentionNormalAction("ousia"),
    createCenterOfAttentionNormalAction("pneuma")
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "furina.constellation.2.overflow_fanfare.maximum_hp_percent",
      label: "女人皆善变，仿若水中萍 · C2 超出上限400点气氛值（生命值上限提高140%）",
      source: { characterId: "Furina", kind: "character", minimumSourceConstellation: 2 },
      target: "hpPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 1.4 }
    },
    {
      activation: "automatic",
      id: "furina.burst.let-the-people-rejoice.maximum-fanfare.damage-bonus",
      label: "万众狂欢 · 满气氛值全伤害加成",
      source: { characterId: "Furina", kind: "character" },
      target: "damageBonus",
      value: {
        constellationMultiplierBonuses: [{ minimumSourceConstellation: 1, value: 100 }],
        kind: "talent_parameter",
        multiplier: 300,
        parameter: {
          groupId: "burst",
          id: "fanfare-all-damage-bonus-per-point",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "furina.constellation.6.center_of_attention.common.max_hp_additive_damage",
      label: "万众瞩目 · C6 前6次普攻/重击/下落攻击追加18%生命值上限基础伤害",
      source: { characterId: "Furina", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: [furinaC6NormalActionIds.ousia, furinaC6NormalActionIds.pneuma],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 0.18 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "hp"
      }
    },
    {
      activation: "maximum_reachable",
      id: "furina.constellation.6.center_of_attention.pneuma.max_hp_additive_damage",
      label: "万众瞩目 · C6 芒性命中额外追加25%生命值上限基础伤害",
      source: { characterId: "Furina", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: { actionIds: [furinaC6NormalActionIds.pneuma], recipientSourceRelation: "source" },
      value: {
        coefficient: { kind: "fixed", value: 0.25 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "hp"
      }
    }
  ],
  characterId: "Furina",
  metrics: [
    {
      actionId: furinaC6NormalActionIds.ousia,
      characterId: "Furina",
      id: furinaC6NormalActionIds.ousia,
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "万众瞩目 / C6 荒性水附魔普通攻击第一段（追加18%生命值上限）",
      sourceActionId: furinaC6NormalActionIds.ousia,
      status: "verified",
      target: "enemy"
    },
    {
      actionId: furinaC6NormalActionIds.pneuma,
      characterId: "Furina",
      id: furinaC6NormalActionIds.pneuma,
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "万众瞩目 / C6 芒性水附魔普通攻击第一段（追加43%生命值上限）",
      sourceActionId: furinaC6NormalActionIds.pneuma,
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit",
      characterId: "Furina",
      id: "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit",
      kind: "damage",
      label: "孤心沙龙 / 谢贝蕾妲小姐单次命中（荒性）",
      sourceActionId: "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit",
      status: "verified",
      target: "enemy"
    },
    {
      characterId: "Furina",
      id: "furina.burst.let_the_people_rejoice.fanfare.damage_bonus",
      kind: "scalar",
      label: "万众狂欢 / 气氛值全伤害加成",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "fanfare-all-damage-bonus-per-point",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.0007, talentLevel: 1 },
          { expectedValue: 0.0025, talentLevel: 10 }
        ]
      },
      ratioScenarioParameter: { parameterId: "fanfare-points" },
      recipientRequirements: [],
      semantic: "damage_bonus",
      sourceActionId: "furina.burst.let_the_people_rejoice.fanfare.damage_bonus",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    },
    {
      characterId: "Furina",
      id: "furina.constellation.6.center_of_attention.ousia.nearby_party.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "万众瞩目 / C6 荒性命中后附近队伍单次治疗量",
      minimumSourceConstellation: 6,
      ratio: 0.04,
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为荒性命中后附近的队伍角色" }
      ],
      scalingStat: "hp",
      sourceActionId: furinaC6NormalActionIds.ousia,
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One Ousia Mademoiselle Crabaletta hit is a selected Hydro hit that scales from Furina's max HP and reads stats at hit time. Its selected 0–4 successful HP-consumption participants apply the documented 100–140% member-attack multiplier, defaulting to four. At ascension 4+, A4's min(HP / 1000 × 0.7%, 28%) Salon-member damage bonus is included. The selected source-owned support metric calculates Let the People Rejoice's all-damage bonus for one friendly recipient as current Fanfare point count × burst[4]. Its action snapshot uses a 0–300 range at C0, while C1+ begins Burst at 150 points and caps the damage buff at 400; C3 adds three Burst levels. At C2, the maximum-reachable 400 excess Fanfare points automatically grant Furina 140% maximum HP. At C6, dedicated Ousia and Pneuma Normal-Attack metrics are absent through C5, use Hydro conversion, and add the common 18% maximum-HP base term; Pneuma adds another 25%, for 43% total. A separate C6-only support metric exposes one Ousia-triggered nearby-party healing tick at 4% of Furina's maximum HP before source and recipient healing modifiers, while Pneuma's 1% current-HP drain remains a non-healing state change. Tick cadence, duration, and multi-recipient aggregation are not inferred. The Ousia initial bubble, other Salon Members, Singer of Many Waters, member cadence, reactions, external infusions, Arkhe switching, C4 Energy restoration, and rotation behavior remain outside these single-event metrics.",
  label: furinaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
