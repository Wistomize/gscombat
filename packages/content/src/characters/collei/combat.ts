import type { CharacterCombatCoverage } from "../../combat/types.js"

import { colleiDefinition } from "./definition.js"

export const colleiCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      additiveReaction: { bonus: 0, kind: "spread" },
      characterId: "Collei",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "floral-sidewinder-outbound-damage",
          id: "floral-sidewinder-outbound",
          snapshotChecks: [
            { expectedCoefficient: 1.512, talentLevel: 1 },
            { expectedCoefficient: 2.7216, talentLevel: 10 }
          ]
        }
      ],
      element: colleiDefinition.element,
      evaluator: "declared_direct",
      id: "collei.skill.floral_sidewinder.outbound.spread",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "floral-sidewinder-outbound-damage",
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
      characterId: "Collei",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "trump-card-kitty-initial-explosion-damage",
          id: "trump-card-kitty-initial-explosion",
          snapshotChecks: [
            { expectedCoefficient: 2.01824, talentLevel: 1 },
            { expectedCoefficient: 3.632832, talentLevel: 10 }
          ]
        }
      ],
      element: colleiDefinition.element,
      evaluator: "declared_direct",
      id: "collei.burst.trump_card_kitty.initial_explosion",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "trump-card-kitty-initial-explosion-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Collei",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "trump-card-kitty-leap-damage",
          id: "trump-card-kitty-leap",
          snapshotChecks: [
            { expectedCoefficient: 0.43248, talentLevel: 1 },
            { expectedCoefficient: 0.778464, talentLevel: 10 }
          ]
        }
      ],
      element: colleiDefinition.element,
      evaluator: "declared_direct",
      id: "collei.burst.trump_card_kitty.leap_tick",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "trump-card-kitty-leap-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      additiveReaction: { bonus: 0, kind: "spread" },
      characterId: "Collei",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "floral-sidewinder-outbound-damage",
          id: "c6-mini-cuilein-anbar",
          snapshotChecks: [
            { expectedCoefficient: 1.512, talentLevel: 1 },
            { expectedCoefficient: 2.7216, talentLevel: 10 }
          ]
        }
      ],
      element: colleiDefinition.element,
      evaluator: "declared_direct",
      id: "collei.constellation.6.forest_of_falling_arrows.mini_cuilein_anbar.spread",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "floral-sidewinder-outbound-damage",
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
          id: "c6-mini-cuilein-anbar-ready",
          label: "C6 坠镞为林：飞叶轮命中并产生迷你柯里安巴",
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
              parameterId: "c6-mini-cuilein-anbar-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-mini-cuilein-anbar",
            hitCount: { kind: "scenario_parameter", parameterId: "c6-mini-cuilein-anbar-ready" },
            id: "c6-mini-cuilein-anbar",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "collei.constellation.4.gift_of_the_woods.party_elemental_mastery",
      label: "骞林馈遗 · C4 猫猫秘宝施放后附近队友元素精通（不包括柯莱）",
      source: { characterId: "Collei", kind: "character", minimumSourceConstellation: 4 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "not_source" },
      value: { kind: "fixed", value: 60 }
    },
    {
      activation: "maximum_reachable",
      id: "collei.constellation.6.forest_of_falling_arrows.mini_cuilein_anbar.base_damage",
      label: "坠镞为林 · C6 迷你柯里安巴基础伤害（200%攻击力）",
      source: { characterId: "Collei", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["collei.constellation.6.forest_of_falling_arrows.mini_cuilein_anbar.spread"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 2 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    }
  ],
  characterId: "Collei",
  metrics: [
    {
      actionId: "collei.skill.floral_sidewinder.outbound.spread",
      characterId: "Collei",
      id: "collei.skill.floral_sidewinder.outbound.spread",
      kind: "damage",
      label: "拂花偈叶 / 去程单次命中 · 蔓激化",
      sourceActionId: "collei.skill.floral_sidewinder.outbound.spread",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "collei.burst.trump_card_kitty.leap_tick",
      characterId: "Collei",
      id: "collei.burst.trump_card_kitty.leap_tick",
      kind: "damage",
      label: "猫猫秘宝 / 柯里安巴单次跃动伤害（无反应）",
      sourceActionId: "collei.burst.trump_card_kitty.leap_tick",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "collei.constellation.6.forest_of_falling_arrows.mini_cuilein_anbar.spread",
      characterId: "Collei",
      id: "collei.constellation.6.forest_of_falling_arrows.mini_cuilein_anbar.spread",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "坠镞为林 / 迷你柯里安巴单次伤害 · 蔓激化",
      sourceActionId: "collei.constellation.6.forest_of_falling_arrows.mini_cuilein_anbar.spread",
      status: "verified",
      target: "enemy"
    }
  ],
  detail: [
    "The first selected metric is one outbound Floral Sidewinder hit against a Quickened target, using skill[0] and",
    "one fixed Spread reaction. The second selected metric is one Trump-Card Kitty leap tick against one enemy:",
    "Attack × burst[1], or 43.248% Attack at Burst Level 1 and 77.8464% at Level 10, with no preset aura or reaction.",
    "The burst's initial explosion remains a separately verified raw action but is not its selected periodic output. C4",
    "can be selected as an explicit current-action snapshot after Trump-Card Kitty has been cast: nearby teammates gain",
    "60 Elemental Mastery while Collei herself is excluded. It does not infer the cast, the 12-second duration, range,",
    "recipient position, timing, or rotation. At C6, a dedicated metric calculates the independently applying",
    "200% Attack Mini Cuilein-Anbar hit and its own Spread against the same Quickened target; it is absent through C5.",
    "The return hit, leap count and duration, passives, external buffs, other elemental auras",
    "and reactions, and other character states remain outside the selected metrics."
  ].join(" "),
  label: colleiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
