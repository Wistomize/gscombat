import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kaedeharaKazuhaDefinition } from "./definition.js"

export const kaedeharaKazuhaCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("kaedehara-kazuha", 1),
    { id: "kaedehara-kazuha.kit.plunge-access", label: "千早振振腾空后进行乱岚拨止", kind: "plunge_access", recipient: "self", sourceFieldPresence: "on_field", sustained: true },
    ...declareWeaponHitCapabilities(kaedeharaKazuhaDefinition),
    declareHitCapability("kaedehara-kazuha.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["anemo"]),
  ],
  actions: [
    {
      characterId: "KaedeharaKazuha",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "chihayaburu-press-skill-damage",
          id: "chihayaburu-press-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.92, talentLevel: 1 },
            { expectedCoefficient: 3.456, talentLevel: 10 }
          ]
        }
      ],
      element: kaedeharaKazuhaDefinition.element,
      evaluator: "declared_direct",
      id: "kaedehara_kazuha.skill.chihayaburu.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "chihayaburu-press-skill-damage",
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
      characterId: "KaedeharaKazuha",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "kazuha-slash-initial-slash-damage",
          id: "kazuha-slash-initial-slash",
          snapshotChecks: [
            { expectedCoefficient: 2.624, talentLevel: 1 },
            { expectedCoefficient: 4.7232, talentLevel: 10 }
          ]
        }
      ],
      element: kaedeharaKazuhaDefinition.element,
      evaluator: "declared_direct",
      id: "kaedehara_kazuha.burst.kazuha_slash.initial_slash",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "kazuha-slash-initial-slash-damage",
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
      attackKind: "normal",
      characterId: "KaedeharaKazuha",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "c6-crimson-momiji-normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.44978, talentLevel: 1 },
            { expectedCoefficient: 0.8891, talentLevel: 10 }
          ]
        }
      ],
      element: kaedeharaKazuhaDefinition.element,
      evaluator: "declared_direct",
      id: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_normal_attack.first_hit",
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
          id: "c6-crimson-momiji-normal-attack-current",
          label: "C6 血赤叶红：施放千早振或万叶之一刀后的风附魔普通攻击",
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
              parameterId: "c6-crimson-momiji-normal-attack-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-crimson-momiji-normal-attack-first-hit",
            id: "c6-crimson-momiji-normal-attack-first-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      attackKind: "charged",
      characterId: "KaedeharaKazuha",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-first-hit-damage",
          id: "c6-crimson-momiji-charged-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.43, talentLevel: 1 },
            { expectedCoefficient: 0.85, talentLevel: 10 }
          ]
        },
        {
          coefficientParameterId: "charged-attack-second-hit-damage",
          id: "c6-crimson-momiji-charged-attack-second-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.74648, talentLevel: 1 },
            { expectedCoefficient: 1.4756, talentLevel: 10 }
          ]
        }
      ],
      element: kaedeharaKazuhaDefinition.element,
      evaluator: "declared_direct",
      id: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_charged_attack",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-first-hit-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "auto",
          id: "charged-attack-second-hit-damage",
          parameterIndex: 7,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-crimson-momiji-charged-attack-current",
          label: "C6 血赤叶红：施放千早振或万叶之一刀后的风附魔重击",
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
              parameterId: "c6-crimson-momiji-charged-attack-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-crimson-momiji-charged-attack-first-hit",
            id: "c6-crimson-momiji-charged-attack-first-hit",
            snapshot: "hit"
          },
          {
            at: 0.1,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-crimson-momiji-charged-attack-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-crimson-momiji-charged-attack-second-hit",
            id: "c6-crimson-momiji-charged-attack-second-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      attackKind: "plunge",
      characterId: "KaedeharaKazuha",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "high-plunge-damage",
          id: "c6-crimson-momiji-high-plunge",
          snapshotChecks: [
            { expectedCoefficient: 2.043855, talentLevel: 1 },
            { expectedCoefficient: 4.040179, talentLevel: 10 }
          ]
        }
      ],
      element: kaedeharaKazuhaDefinition.element,
      evaluator: "declared_direct",
      id: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_high_plunge",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "high-plunge-damage",
          parameterIndex: 11,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-crimson-momiji-high-plunge-current",
          label: "C6 血赤叶红：施放千早振或万叶之一刀后的风附魔高空下落攻击",
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
              parameterId: "c6-crimson-momiji-high-plunge-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-crimson-momiji-high-plunge",
            id: "c6-crimson-momiji-high-plunge",
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
      id: "kaedehara_kazuha.passive.poetics_of_fuubutsu.elemental_damage_bonus",
      label: "风物之诗咏 · 对应元素伤害加成",
      source: { characterId: "KaedeharaKazuha", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: { elements: ["pyro", "hydro", "electro", "cryo"] },
      value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 0.0004 } }
    },
    {
      activation: "active",
      id: "kaedehara_kazuha.constellation.2.yamaarashi_tailwind.field.elemental_mastery",
      label: "山岚残芯 · C2 流风秋野持续期间且角色位于其中（元素精通提高200点）",
      source: { characterId: "KaedeharaKazuha", kind: "character", minimumSourceConstellation: 2 },
      target: "elementalMastery",
      value: { kind: "fixed", value: 200 }
    },
    {
      activation: "automatic",
      id: "kaedehara_kazuha.constellation.6.crimson_momiji.normal_charged_plunge.damage_bonus",
      label: "血赤叶红 · C6 每点元素精通使普通攻击、重击与下落攻击伤害提高0.2%",
      source: { characterId: "KaedeharaKazuha", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: {
        actionIds: [
          "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_normal_attack.first_hit",
          "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_charged_attack",
          "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_high_plunge"
        ],
        attackKinds: ["normal", "charged", "plunge"],
        recipientSourceRelation: "source"
      },
      value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 0.002 } }
    }
  ],
  characterId: "KaedeharaKazuha",
  metrics: [
    {
      characterId: "KaedeharaKazuha",
      id: "kaedehara_kazuha.passive.poetics_of_fuubutsu.elemental_damage_bonus",
      kind: "scalar",
      label: "风物之诗咏 / 对应元素伤害加成",
      recipientRequirements: [],
      ratio: 0.0004,
      scalingStat: "elementalMastery",
      semantic: "damage_bonus",
      sourceActionId: "kaedehara_kazuha.skill.chihayaburu.press",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    },
    {
      actionId: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_normal_attack.first_hit",
      characterId: "KaedeharaKazuha",
      id: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_normal_attack.first_hit",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "血赤叶红 / C6 风附魔普通攻击首段（精通转增伤、无反应）",
      sourceActionId: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_normal_attack.first_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_charged_attack",
      characterId: "KaedeharaKazuha",
      id: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_charged_attack",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "血赤叶红 / C6 风附魔重击两段合计（精通转增伤、无反应）",
      sourceActionId: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_charged_attack",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_high_plunge",
      characterId: "KaedeharaKazuha",
      id: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_high_plunge",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "血赤叶红 / C6 风附魔高空下落攻击（精通转增伤、无反应）",
      sourceActionId: "kaedehara_kazuha.constellation.6.crimson_momiji.anemo_high_plunge",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Chihayaburu's press damage and Kazuha Slash's initial Anemo slash are verified as baseline attack-scaling Anemo hits. The selected support profile exposes Poetics of Fuubutsu's 0.04% corresponding-element damage bonus per point of Kazuha's Elemental Mastery after he triggers Swirl, without converting it into recipient damage. The swirled element and its eight-second active window remain explicit effect-state choices. C2 is an explicit current-action snapshot after the user confirms Kazuha's field remains active and the evaluated on-field character is inside it; it adds 200 Elemental Mastery to Kazuha or that on-field recipient without inferring field location or duration. C6's dedicated Normal, two-hit Charged, and high Plunging Attack actions are zero through C5. At C6, each is Anemo-infused during Crimson Momiji's five-second post-Skill-or-Burst window and receives an automatic Damage Bonus equal to 0.2% per point of Kazuha's final Elemental Mastery; an active C2 field therefore contributes to that conversion when explicitly selected. The burst excludes its damage-over-time ticks, conversion bonus damage, Swirl damage, duration, energy availability, and other character states. Hold damage, Midare Ranzan, and absorption remain unmodeled.",
  label: kaedeharaKazuhaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
