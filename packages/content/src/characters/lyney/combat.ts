import type { CharacterCombatCoverage } from "../../combat/types.js"

import { lyneyDefinition } from "./definition.js"

export const lyneyCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Lyney",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.38786, talentLevel: 1 },
            { expectedCoefficient: 0.7667, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "lyney.normal.auto.first_hit",
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
      characterId: "Lyney",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "bewildering-lights-base-hit-damage",
          id: "bewildering-lights-base-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.672, talentLevel: 1 },
            { expectedCoefficient: 3.0096, talentLevel: 10 }
          ]
        }
      ],
      element: lyneyDefinition.element,
      evaluator: "declared_direct",
      id: "lyney.skill.bewildering_lights.base_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "bewildering-lights-base-hit-damage",
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
      attackKind: "charged",
      characterId: "Lyney",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "prop-arrow-damage",
          id: "prop-arrow",
          snapshotChecks: [
            { expectedCoefficient: 1.728, talentLevel: 1 },
            { expectedCoefficient: 3.1104, talentLevel: 10 }
          ]
        }
      ],
      element: lyneyDefinition.element,
      evaluator: "declared_direct",
      id: "lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "prop-arrow-damage",
          parameterIndex: 10,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      amplifyingReaction: { bonus: 0, kind: "melt_forward" },
      attackKind: "charged",
      characterId: "Lyney",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "prop-arrow-damage",
          id: "prop-arrow",
          snapshotChecks: [
            { expectedCoefficient: 1.728, talentLevel: 1 },
            { expectedCoefficient: 3.1104, talentLevel: 10 }
          ]
        }
      ],
      element: lyneyDefinition.element,
      evaluator: "declared_direct",
      id: "lyney.normal.card_force_translocation.second_charge.prop_arrow.cryo_aura_melt",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "prop-arrow-damage",
          parameterIndex: 10,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "normal"
    },
    {
      attackKind: "charged",
      characterId: "Lyney",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "pyrotechnic-strike-damage",
          id: "c6-pyrotechnic-strike-reprised",
          snapshotChecks: [
            { expectedCoefficient: 0.64, talentLevel: 1 },
            { expectedCoefficient: 1.152, talentLevel: 10 }
          ]
        }
      ],
      element: lyneyDefinition.element,
      evaluator: "declared_direct",
      id: "lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "pyrotechnic-strike-damage",
          parameterIndex: 12,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-pyrotechnic-strike-reprised-ready",
          label: "C6 守备区的魔术师：追加礼花术弹已触发",
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
              parameterId: "c6-pyrotechnic-strike-reprised-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0.8, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-pyrotechnic-strike-reprised",
            id: "c6-pyrotechnic-strike-reprised",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { elements: ["pyro"], kind: "team_element_count", minimum: 1 },
      id: "lyney.passive.conclusive_ovation.pyro_affected_target.base_damage_bonus",
      label: "固有天赋 · 完场喝彩（目标处于火元素影响下，伤害提高60%）",
      source: { characterId: "Lyney", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised"],
        elements: ["pyro"],
        recipientSourceRelation: "source"
      },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "passive2",
          id: "conclusive-ovation-pyro-affected-target-base-damage-bonus",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "maximum_reachable",
      condition: { elements: ["pyro"], kind: "team_element_count", minimum: 2 },
      id: "lyney.passive.conclusive_ovation.first_other_pyro_member.damage_bonus",
      label: "固有天赋 · 完场喝彩（第1名林尼以外的火元素队员，伤害提高20%）",
      source: { characterId: "Lyney", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised"],
        elements: ["pyro"],
        recipientSourceRelation: "source"
      },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "passive2",
          id: "conclusive-ovation-damage-bonus-per-other-pyro-member",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "maximum_reachable",
      condition: { elements: ["pyro"], kind: "team_element_count", minimum: 3 },
      id: "lyney.passive.conclusive_ovation.second_other_pyro_member.damage_bonus",
      label: "固有天赋 · 完场喝彩（第2名林尼以外的火元素队员，伤害提高20%）",
      source: { characterId: "Lyney", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised"],
        elements: ["pyro"],
        recipientSourceRelation: "source"
      },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "passive2",
          id: "conclusive-ovation-damage-bonus-per-other-pyro-member",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "active",
      id: "lyney.constellation.2.conclusive_ovation.full_stacks.crit_damage",
      label: "巧言贴耳的诱引 · C2 在场满3层集意专注（林尼暴击伤害提高60%）",
      source: { characterId: "Lyney", kind: "character", minimumSourceConstellation: 2 },
      target: "critDamage",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.6 }
    },
    {
      activation: "active",
      id: "lyney.constellation.4.well_versed_well_rehearsed.pyro_charged_attack.pyro_resistance_reduction",
      label: "熟稔习练的筹谋 · C4 火元素重击已命中目标（火元素抗性降低 20%，6秒）",
      source: { characterId: "Lyney", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["pyro"] },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Lyney",
  metrics: [
    {
      actionId: "lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize",
      characterId: "Lyney",
      id: "lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize",
      kind: "damage",
      label: "普通攻击·迫牌易位 / 二段蓄力 Prop Arrow·水底蒸发",
      sourceActionId: "lyney.normal.card_force_translocation.second_charge.prop_arrow.hydro_aura_vaporize",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "lyney.normal.card_force_translocation.second_charge.prop_arrow.cryo_aura_melt",
      characterId: "Lyney",
      id: "lyney.normal.card_force_translocation.second_charge.prop_arrow.cryo_aura_melt",
      kind: "damage",
      label: "普通攻击·迫牌易位 / 二段蓄力 Prop Arrow·冰底融化",
      sourceActionId: "lyney.normal.card_force_translocation.second_charge.prop_arrow.cryo_aura_melt",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised",
      characterId: "Lyney",
      id: "lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "C6 守备区的魔术师 / 追加礼花术弹（无反应）",
      sourceActionId: "lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal hit and Bewildering Lights base hit remain verified raw actions. The selected core hit is the Pyro Prop Arrow from one second-stage charged attack: Attack × auto[10]. Hydro-aura Vaporize and Cryo-aura Melt are mutually exclusive alternatives for that projectile. C2 exposes the full three-stack Crit-DMG snapshot and C4 exposes the already-applied Pyro resistance reduction. C6 now has an owner-scoped independent charged-hit metric for Pyrotechnic Strike: Reprised: Attack × auto[12] × 80%, which therefore uses Lyney's own normal-talent level, Pyro bonus, and Crit; its constellation range makes the metric zero from C0 through C5. Its maximum-reachable snapshot assumes the preceding Prop Arrow has left the target under Pyro and applies Conclusive Ovation's 60% base bonus plus 20% for each of up to two other Pyro party members, capped at 100% with three or more Pyro members total. Hat creation, A1, timing, and rotation remain outside this metric.",
  label: lyneyDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
