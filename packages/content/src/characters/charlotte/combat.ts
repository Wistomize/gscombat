import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { charlotteDefinition } from "./definition.js"

export const charlotteCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("charlotte", 8),
    ...declareWeaponHitCapabilities(charlotteDefinition),
    declareHitCapability("charlotte.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["cryo"]),
    { ...declareHitCapability("charlotte.kit.sustained_skill_hits", "可持续造成战技命中", ["skill"], ["cryo"], true, "any"), skillHitOpportunities: { withinSeconds: 7, count: 2, minimumSeparationSeconds: 0.3 } },
  ],
  actions: [
    {
      characterId: "Charlotte",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.498456, talentLevel: 1 },
            { expectedCoefficient: 0.897221, talentLevel: 10 }
          ]
        }
      ],
      element: charlotteDefinition.element,
      evaluator: "declared_direct",
      id: "charlotte.normal.auto.first_hit",
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
      characterId: "Charlotte",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "freezing-point-composition-press-damage",
          id: "freezing-point-composition-press",
          snapshotChecks: [
            { expectedCoefficient: 0.672, talentLevel: 1 },
            { expectedCoefficient: 1.2096, talentLevel: 10 }
          ]
        }
      ],
      element: charlotteDefinition.element,
      evaluator: "declared_direct",
      id: "charlotte.skill.framing_freezing_point_composition.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "freezing-point-composition-press-damage",
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
      characterId: "Charlotte",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "still-photo-comprehensive-confirmation-initial-hit-damage",
          id: "still-photo-comprehensive-confirmation-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.77616, talentLevel: 1 },
            { expectedCoefficient: 1.397088, talentLevel: 10 }
          ]
        }
      ],
      element: charlotteDefinition.element,
      evaluator: "declared_direct",
      id: "charlotte.burst.still_photo_comprehensive_confirmation.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-initial-hit-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Charlotte",
      element: charlotteDefinition.element,
      id: "charlotte.burst.still_photo_comprehensive_confirmation.cast_healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-cast-healing-attack-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-cast-healing-flat",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Charlotte",
      element: charlotteDefinition.element,
      id: "charlotte.burst.still_photo_comprehensive_confirmation.newsflash_field.heal_tick",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-newsflash-field-heal-tick-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-newsflash-field-heal-tick-flat",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Charlotte",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "still-photo-comprehensive-confirmation-initial-hit-damage",
          id: "c6-monsieur-verite-coordinated-attack",
          snapshotChecks: [
            { expectedCoefficient: 0.77616, talentLevel: 1 },
            { expectedCoefficient: 1.397088, talentLevel: 10 }
          ]
        }
      ],
      element: charlotteDefinition.element,
      evaluator: "declared_direct",
      id: "charlotte.constellation.6.a_summation_of_interest.coordinated_attack.no_reaction",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-initial-hit-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-monsieur-verite-trigger-count",
          label: "C6 勘破的绝对真理 / 当前普通或重击已触发协同攻击",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "burst",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-monsieur-verite-trigger-count",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-monsieur-verite-coordinated-attack",
            hitCount: { kind: "scenario_parameter", parameterId: "c6-monsieur-verite-trigger-count" },
            id: "c6-monsieur-verite-coordinated-attack",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    ...[1, 2, 3].map((stack) => ({
      activation: "maximum_reachable" as const,
      condition: { kind: "enemy_count" as const, minimum: stack },
      id: `charlotte.constellation.2.a_duty_to_pursue_truth.attack_percent.stack_${stack}`,
      label: `求真是职责所在 · C2 元素战技命中第${stack}名敌人（攻击力提高10%）`,
      source: { characterId: "Charlotte", kind: "character" as const, minimumSourceConstellation: 2 },
      target: "attackPercent" as const,
      targetFilter: {
        recipientSourceRelation: "source" as const
      },
      value: { kind: "fixed" as const, value: 0.1 }
    })),
    {
      activation: "automatic",
      id: "charlotte.constellation.6.a_summation_of_interest.coordinated_attack.base_damage",
      label: "勘破的绝对真理 · C6 协同攻击基础伤害（夏洛蒂攻击力的180%）",
      source: { characterId: "Charlotte", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["charlotte.constellation.6.a_summation_of_interest.coordinated_attack.no_reaction"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 1.8 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "attack"
      }
    }
  ],
  characterId: "Charlotte",
  metrics: [
    {
      characterId: "Charlotte",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-cast-healing-flat",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1608.4863, talentLevel: 1 },
          { expectedValue: 3538.9382, talentLevel: 10 }
        ]
      },
      id: "charlotte.burst.still_photo_comprehensive_confirmation.cast_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "定格·全方位确证 / 施放单名队员治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-cast-healing-attack-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 2.565734, talentLevel: 1 },
          { expectedValue: 4.618322, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为施放时队伍中的附近角色" }
      ],
      scalingStat: "attack",
      sourceActionId: "charlotte.burst.still_photo_comprehensive_confirmation.cast_healing",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Charlotte",
      id: "charlotte.constellation.1.a_need_to_verify.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "以核实为约束 / C1「核验」印记单次治疗量",
      minimumSourceConstellation: 1,
      ratio: 0.8,
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色持有「核验」印记" }
      ],
      scalingStat: "attack",
      sourceActionId: "charlotte.burst.still_photo_comprehensive_confirmation.cast_healing",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Charlotte",
      id: "charlotte.constellation.6.a_summation_of_interest.coordinated_attack.healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "勘破的绝对真理 / C6 协同攻击当前场上角色治疗量",
      minimumSourceConstellation: 6,
      ratio: 0.42,
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为协同攻击触发时的当前场上角色" }
      ],
      scalingStat: "attack",
      sourceActionId: "charlotte.constellation.6.a_summation_of_interest.coordinated_attack.no_reaction",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Charlotte",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-newsflash-field-heal-tick-flat",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 57.447098, talentLevel: 1 },
          { expectedValue: 126.393196, talentLevel: 10 }
        ]
      },
      id: "charlotte.burst.still_photo_comprehensive_confirmation.newsflash_field.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "定格·全方位确证 / 「临事场域」单次当前场上角色治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "still-photo-comprehensive-confirmation-newsflash-field-heal-tick-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.09216, talentLevel: 1 },
          { expectedValue: 0.165888, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为「临事场域」中的当前场上角色" }
      ],
      scalingStat: "attack",
      sourceActionId: "charlotte.burst.still_photo_comprehensive_confirmation.newsflash_field.heal_tick",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      actionId: "charlotte.constellation.6.a_summation_of_interest.coordinated_attack.no_reaction",
      characterId: "Charlotte",
      id: "charlotte.constellation.6.a_summation_of_interest.coordinated_attack.no_reaction",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "勘破的绝对真理 / C6 协同攻击单次伤害（无反应）",
      sourceActionId: "charlotte.constellation.6.a_summation_of_interest.coordinated_attack.no_reaction",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected Charlotte profile reports two Burst healing outputs, C1's independent marked-recipient healing tick, and C6's coordinated damage and healing outputs. The cast heal is Attack × burst[0] plus burst[1], then Charlotte's Healing Bonus and the recipient's Incoming Healing Bonus; the field tick is Attack × burst[3] plus burst[4] and uses the same healing bonuses. C1's separate marked-recipient tick is 80% of Charlotte's Attack, and C6's coordinated-hit heal is 42% of her Attack; both then apply source and recipient healing modifiers. C2's maximum-reachable three-target Skill state contributes 30% Attack to Charlotte's own outputs, while C3 adds three Burst levels to both talent-derived healing outputs. The C6 damage metric is absent through C5 and evaluates one ready Monsieur Verite coordinated hit at exactly 180% of Charlotte's own final Attack as Cryo Elemental Burst damage; it is not evaluated with the triggering character's stats. Its six-second trigger cooldown, Focused Impression setup, repeated healing cadence, and elemental reaction are not inferred. One first normal-attack hit, one Framing press hit, and Still Photo's initial Cryo hit remain verified lower-level actions rather than selected outputs. Newsflash Field damage, field duration, timing, external effects, and other character states remain outside these metrics.",
  label: charlotteDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
