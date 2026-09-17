import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { xilonenDefinition } from "./definition.js"

export const xilonenCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("xilonen", 5),
    ...declareWeaponHitCapabilities(xilonenDefinition),
    declareHitCapability("xilonen.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["geo"]),
  ],
  actions: [
    {
      characterId: "Xilonen",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.517918, talentLevel: 1 },
            { expectedCoefficient: 1.023791, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "xilonen.normal.auto.first_hit",
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
      attackKind: "normal",
      characterId: "Xilonen",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "evernight-blessing-normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.560221, talentLevel: 1 },
            { expectedCoefficient: 1.107414, talentLevel: 10 }
          ]
        }
      ],
      element: xilonenDefinition.element,
      evaluator: "declared_direct",
      id: "xilonen.constellation.6.evernight_blessing.normal_attack.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "normal-attack-first-hit-damage",
          // GO 98aafa1f: Characters/Xilonen/index.tsx Nightsoul normal uses auto[9] and DEF.
          parameterIndex: 9,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "defense",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-evernight-blessing-current",
          label: "C6 永夜的赐福 / 当前普通攻击处于永夜祝福状态",
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
              parameterId: "c6-evernight-blessing-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "evernight-blessing-normal-attack-first-hit",
            elementalApplication: { icd: { kind: "none" } },
            id: "evernight-blessing-normal-attack-first-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "Xilonen",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "yohuals-scratch-dash-damage",
          id: "yohuals-scratch-dash",
          snapshotChecks: [
            { expectedCoefficient: 1.792, talentLevel: 1 },
            { expectedCoefficient: 3.2256, talentLevel: 10 }
          ]
        }
      ],
      element: xilonenDefinition.element,
      evaluator: "declared_direct",
      id: "xilonen.skill.yohuals_scratch.dash",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "yohuals-scratch-dash-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "defense",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Xilonen",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "ocelotlicues-ode-initial-hit-damage",
          id: "ocelotlicues-ode-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 2.8128, talentLevel: 1 },
            { expectedCoefficient: 5.06304, talentLevel: 10 }
          ]
        }
      ],
      element: xilonenDefinition.element,
      evaluator: "declared_direct",
      id: "xilonen.burst.ocelotlicues_ode.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "ocelotlicues-ode-initial-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "defense",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Xilonen",
      element: xilonenDefinition.element,
      id: "xilonen.skill.source_samples.active",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "source-sample-resistance-reduction",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Xilonen",
      element: xilonenDefinition.element,
      id: "xilonen.burst.healing_rhythm",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "healing-flat",
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
      condition: { kind: "team_nightsoul_burst", minimumTriggers: 1 },
      id: "xilonen.passive.portable_armored_sheath.after_nightsoul_burst.defense_percent",
      label: "固有天赋 · 便携铠装层（夜魂迸发后15秒，防御力提高）",
      source: { characterId: "Xilonen", kind: "character", minimumSourceAscension: 4 },
      target: "defensePercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "automatic",
      condition: {
        elements: ["pyro", "hydro", "cryo", "electro"],
        kind: "team_element_count",
        minimum: 2
      },
      id: "xilonen.skill.source-samples.resistance-reduction",
      label: "源音采样 · 对应元素抗性降低",
      source: { characterId: "Xilonen", kind: "character" },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["pyro", "hydro", "cryo", "electro", "geo"] },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "skill",
          id: "source-sample-resistance-reduction",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      }
    },
    {
      activation: "automatic",
      condition: {
        elements: ["pyro", "hydro", "cryo", "electro"],
        kind: "team_element_count",
        maximum: 1,
        minimum: 0
      },
      id: "xilonen.constellation.2.geo.always_active.resistance_reduction",
      label: "献予灼原的五重奏 · C2 岩元素原音采样始终保持活跃（岩元素抗性降低）",
      source: { characterId: "Xilonen", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["geo"] },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "skill",
          id: "source-sample-resistance-reduction",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      }
    },
    {
      activation: "automatic",
      id: "xilonen.constellation.2.geo.damage_bonus",
      label: "献予灼原的五重奏 · C2 岩元素原音采样（造成的伤害提高50%）",
      source: { characterId: "Xilonen", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["geo"] },
      value: { kind: "fixed", value: 0.5 }
    },
    {
      activation: "maximum_reachable",
      condition: {
        elements: ["pyro", "hydro", "cryo", "electro"],
        kind: "team_element_count",
        minimum: 2
      },
      id: "xilonen.constellation.2.pyro.attack_percent",
      label: "献予灼原的五重奏 · C2 火元素原音采样（攻击力提高45%）",
      source: { characterId: "Xilonen", kind: "character", minimumSourceConstellation: 2 },
      target: "attackPercent",
      targetFilter: { elements: ["pyro"] },
      value: { kind: "fixed", value: 0.45 }
    },
    {
      activation: "maximum_reachable",
      condition: {
        elements: ["pyro", "hydro", "cryo", "electro"],
        kind: "team_element_count",
        minimum: 2
      },
      id: "xilonen.constellation.2.hydro.hp_percent",
      label: "献予灼原的五重奏 · C2 水元素原音采样（生命值上限提高45%）",
      source: { characterId: "Xilonen", kind: "character", minimumSourceConstellation: 2 },
      target: "hpPercent",
      targetFilter: { elements: ["hydro"] },
      value: { kind: "fixed", value: 0.45 }
    },
    {
      activation: "maximum_reachable",
      condition: {
        elements: ["pyro", "hydro", "cryo", "electro"],
        kind: "team_element_count",
        minimum: 2
      },
      id: "xilonen.constellation.2.cryo.crit_damage",
      label: "献予灼原的五重奏 · C2 冰元素原音采样（暴击伤害提高60%）",
      source: { characterId: "Xilonen", kind: "character", minimumSourceConstellation: 2 },
      target: "critDamage",
      targetFilter: { elements: ["cryo"] },
      value: { kind: "fixed", value: 0.6 }
    },
    {
      activation: "active",
      id: "xilonen.constellation.4.such_a_transfiguration.source_samples.normal_attack.base_damage",
      label: "午日的转轮 · C4 战技后荣花之赐（队伍普攻、重击与下落攻击基础伤害增加希诺宁防御力的65%）",
      source: { characterId: "Xilonen", kind: "character", minimumSourceConstellation: 4 },
      target: "baseDamageFlat",
      targetFilter: {
        attackKinds: ["normal", "charged", "plunge"]
      },
      value: { kind: "source_final_defense", multiplier: { kind: "fixed", value: 0.65 } }
    },
    {
      activation: "automatic",
      id: "xilonen.constellation.6.evernight_blessing.normal_and_plunge.additive_defense_damage",
      label: "永夜的赐福 · C6 永夜祝福中普通攻击与下落攻击伤害追加300%防御力",
      source: { characterId: "Xilonen", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["xilonen.constellation.6.evernight_blessing.normal_attack.first_hit"],
        attackKinds: ["normal", "plunge"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 3 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "defense"
      }
    }
  ],
  characterId: "Xilonen",
  metrics: [
    {
      characterId: "Xilonen",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "source-sample-resistance-reduction",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.09, talentLevel: 1 },
          { expectedValue: 0.36, talentLevel: 10 }
        ]
      },
      id: "xilonen.skill.source_samples.resistance_reduction",
      kind: "scalar",
      label: "源音采样 / 对应元素抗性降低",
      semantic: "resistance_reduction",
      sourceActionId: "xilonen.skill.source_samples.active",
      status: "verified",
      target: "enemy",
      unit: "ratio"
    },
    {
      characterId: "Xilonen",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 500.73764, talentLevel: 1 },
          { expectedValue: 1101.7063, talentLevel: 10 }
        ]
      },
      id: "xilonen.burst.healing_rhythm.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "豹烈律动 / 单次持续治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1.04, talentLevel: 1 },
          { expectedValue: 1.872, talentLevel: 10 }
        ]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "受治疗角色位于欢兴律动范围内" }],
      scalingStat: "defense",
      sourceActionId: "xilonen.burst.healing_rhythm",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "Xilonen",
      id: "xilonen.constellation.6.evernight_blessing.nearby_party.healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "永夜的赐福 / C6 命中后附近队伍治疗量",
      minimumSourceConstellation: 6,
      ratio: 1.2,
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为永夜祝福攻击命中时附近的队伍角色" }
      ],
      scalingStat: "defense",
      sourceActionId: "xilonen.constellation.6.evernight_blessing.normal_attack.first_hit",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      actionId: "xilonen.constellation.6.evernight_blessing.normal_attack.first_hit",
      characterId: "Xilonen",
      id: "xilonen.constellation.6.evernight_blessing.normal_attack.first_hit",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "永夜的赐福 / 普通攻击首段（300%防御力追加伤害）",
      sourceActionId: "xilonen.constellation.6.evernight_blessing.normal_attack.first_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The support profile retains Source Sample resistance reduction, damage-relevant C2 branches, healing and cumulative talent levels. Portable Armored Sheath adds 20% Defense after a reachable Nightsoul Burst. The C6 Evernight normal reads the Nightsoul auto[9] DEF ratio, then adds 300% final DEF to that same hit; the ordinary physical normal still uses Attack × auto[0]. Explicitly selecting C4 Blooming Blessing applies 65% of source Xilonen's final DEF to eligible party normal, charged and plunge hits, including her own, but never Skills/Bursts. Its existing two-trigger-per-recipient state is an explicit single-hit assumption, not a simulated rotation. The separate C6 heal remains 120% final DEF before healing modifiers. Trigger cadence, additional beats and rotation timing remain unmodeled.",
  label: xilonenDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
