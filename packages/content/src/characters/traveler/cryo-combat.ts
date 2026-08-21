import type { CharacterCombatCoverage, CombatDamageMetricDefinition } from "../../combat/types.js"

const stellarConductApplicationsParameter = {
  defaultValue: 12,
  id: "stellar-conduct-stored-elemental-applications",
  label: "极星辉域已存储元素附着次数",
  maximumValue: 12,
  minimumValue: 0
} as const

const cryoTravelerDamageActions = [
  {
    attackKind: "charged",
    characterId: "Traveler",
    damageKind: "special_reaction",
    damageParts: [
      {
        id: "icebound-charged-attack",
        scalingTerms: [
          { coefficientParameterId: "charged-attack-first-slash", stat: "attack" },
          { coefficientParameterId: "charged-attack-second-slash", stat: "attack" }
        ]
      }
    ],
    element: "cryo",
    evaluator: "declared_special_reaction",
    id: "traveler.cryo.normal.icebound_charged_attack.stellar_superconduct",
    kind: "damage",
    parameterReferences: [
      {
        groupId: "auto",
        id: "charged-attack-first-slash",
        parameterIndex: 5,
        source: "talent",
        talentSlot: "normal"
      },
      {
        groupId: "auto",
        id: "charged-attack-second-slash",
        parameterIndex: 6,
        source: "talent",
        talentSlot: "normal"
      }
    ],
    scenarioParameters: [stellarConductApplicationsParameter],
    specialReaction: {
      kind: "stellar_superconduct",
      stellarStoredElementalApplicationsParameterId: stellarConductApplicationsParameter.id
    },
    status: "verified",
    talentSlot: "normal",
    travelerElement: "cryo"
  },
  {
    characterId: "Traveler",
    damageKind: "special_reaction",
    damageParts: [
      {
        id: "ice-spear-full-cold-radiance",
        scalingTerms: [
          {
            coefficientMultiplierParameterId: "base-hit-count",
            coefficientParameterId: "stellar-superconduct-spear-hit-damage",
            stat: "attack"
          },
          {
            coefficientMultiplierParameterId: "full-cold-radiance-extra-hit-count",
            coefficientParameterId: "stellar-superconduct-spear-hit-damage",
            stat: "attack"
          },
          {
            coefficientMultiplierParameterId: "base-hit-count",
            coefficientMultiplierScenarioParameterId: "cold-radiance-stacks",
            coefficientParameterId: "stellar-superconduct-cold-radiance-damage-increase",
            stat: "attack"
          },
          {
            coefficientMultiplierParameterId: "full-cold-radiance-extra-hit-count",
            coefficientMultiplierScenarioParameterId: "cold-radiance-stacks",
            coefficientParameterId: "stellar-superconduct-cold-radiance-damage-increase",
            stat: "attack"
          }
        ]
      }
    ],
    element: "cryo",
    evaluator: "declared_special_reaction",
    id: "traveler.cryo.burst.ice_forged_edge.full_cold_radiance.stellar_superconduct",
    kind: "damage",
    parameterReferences: [
      {
        groupId: "burst",
        id: "stellar-superconduct-spear-hit-damage",
        parameterIndex: 2,
        source: "talent",
        talentSlot: "burst"
      },
      {
        groupId: "burst",
        id: "stellar-superconduct-cold-radiance-damage-increase",
        parameterIndex: 3,
        source: "talent",
        talentSlot: "burst"
      },
      {
        groupId: "burst",
        id: "base-hit-count",
        parameterIndex: 6,
        source: "talent",
        talentSlot: "burst"
      },
      {
        groupId: "burst",
        id: "full-cold-radiance-extra-hit-count",
        parameterIndex: 7,
        source: "talent",
        talentSlot: "burst"
      }
    ],
    scenarioParameters: [
      stellarConductApplicationsParameter,
      {
        defaultValue: 8,
        id: "cold-radiance-stacks",
        label: "施放聚冰成锋时消耗的寒辉层数",
        maximumValue: 8,
        minimumValue: 0
      }
    ],
    specialReaction: {
      kind: "stellar_superconduct",
      stellarStoredElementalApplicationsParameterId: stellarConductApplicationsParameter.id
    },
    status: "verified",
    talentSlot: "burst",
    travelerElement: "cryo"
  }
] as const

const cryoTravelerDamageMetrics: readonly CombatDamageMetricDefinition[] = [
  {
    actionId: cryoTravelerDamageActions[0].id,
    characterId: "Traveler",
    id: cryoTravelerDamageActions[0].id,
    kind: "damage",
    label: "重击·冰凝 / 辉映·星超导特殊重击总伤害",
    sourceActionId: cryoTravelerDamageActions[0].id,
    status: "verified",
    target: "enemy"
  },
  {
    actionId: cryoTravelerDamageActions[1].id,
    characterId: "Traveler",
    id: cryoTravelerDamageActions[1].id,
    kind: "damage",
    label: "聚冰成锋 / 满8层寒辉·辉映·星超导五段总伤害",
    sourceActionId: cryoTravelerDamageActions[1].id,
    status: "verified",
    target: "enemy"
  }
]

export const travelerCryoCombatCoverage: CharacterCombatCoverage = {
  actions: cryoTravelerDamageActions,
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "traveler.cryo.special_charged_attack.icebound.fixed_attack_scaling",
      label: "异邦的层冰 · 重击·冰凝额外造成旅行者140%攻击力的伤害",
      source: { characterId: "Traveler", kind: "character" },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: [cryoTravelerDamageActions[0].id],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 1.4 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    },
    {
      activation: "maximum_reachable",
      id: "traveler.cryo.passive.stellar_benediction.base_damage_bonus",
      label: "星耀祝礼·幻变冰镜 · 基于旅行者攻击力提升全队星超导/星扩散基础伤害（最高7%）",
      source: { characterId: "Traveler", kind: "character" },
      target: "specialReactionBaseDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct", "stellar_swirl"] },
      value: {
        kind: "source_final_attack",
        maximumValue: { kind: "fixed", value: 0.07 },
        multiplier: { kind: "fixed", value: 0.000035 }
      }
    },
    {
      activation: "maximum_reachable",
      id: "traveler.cryo.passive.clear_ice.elemental_mastery",
      label: "通明的冽冰 · 元素精通提升旅行者攻击力的8%（最高160点）",
      source: { characterId: "Traveler", kind: "character", minimumSourceAscension: 4 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        kind: "source_final_attack",
        maximumValue: { kind: "fixed", value: 160 },
        multiplier: { kind: "fixed", value: 0.08 }
      }
    },
    {
      activation: "maximum_reachable",
      id: "traveler.cryo.constellation.2.active_character.elemental_mastery",
      label: "嗡鸣的陨冰 · C2触发星烁后使当前场上角色元素精通提升120点",
      source: { characterId: "Traveler", kind: "character", minimumSourceConstellation: 2 },
      target: "elementalMastery",
      value: { kind: "fixed", value: 120 }
    },
    {
      activation: "maximum_reachable",
      id: "traveler.cryo.constellation.6.party_stellar_damage_bonus",
      label: "肃杀的熙冰 · C6消耗8层寒辉使其他角色星烁反应伤害提升40%",
      source: { characterId: "Traveler", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionDamageBonus",
      targetFilter: {
        recipientSourceRelation: "not_source",
        specialReactionKinds: ["stellar_superconduct", "stellar_swirl"]
      },
      value: { kind: "fixed", value: 0.4 }
    }
  ],
  characterId: "Traveler",
  detail:
    "The two selected outputs are Icebound Charged Attack and Ice-Forged Edge in the reviewed Stellar-Superconduct Radiance state. Icebound combines both gender-specific normal charged-attack slashes with the fixed 140% Attack addition, while explicitly excluding Self-Sharpening Rime's 80% bonus. Ice-Forged Edge defaults to eight Cold Radiance stacks and therefore resolves five total spear hits. The blessing enters the stellar base-damage-bonus stage, C6 enters the later reaction-damage-bonus stage, and the Attack-derived mastery plus C2 active-character mastery enter the stat stage. Ordinary Cryo and Stellar-Swirl variants remain outside these two selected metrics until one scenario-owned Radiance selector is introduced.",
  label: "旅行者·冰",
  metrics: cryoTravelerDamageMetrics,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", travelerElement: "cryo", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", travelerElement: "cryo", value: 3 }
  ]
}
