import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { wriothesleyDefinition } from "./definition.js"

export const wriothesleyCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("wriothesley", 3),
    ...declareWeaponHitCapabilities(wriothesleyDefinition),
    declareHitCapability("wriothesley.kit.skill_burst_hits", "战技/爆发直接命中准备", ["burst"], ["cryo"]),
  {
    id: "wriothesley.skill.chilling_penalty.hp_loss", label: "冰驰惩戒 · 强化普攻消耗自身生命值",
    kind: "hp_loss", recipient: "self", sourceFieldPresence: "on_field", sustained: true
  }],
  actions: [
    {
      characterId: "Wriothesley",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.533596, talentLevel: 1 },
            { expectedCoefficient: 1.054782, talentLevel: 10 }
          ]
        }
      ],
      element: wriothesleyDefinition.element,
      evaluator: "declared_direct",
      id: "wriothesley.normal.auto.first_hit",
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
      characterId: "Wriothesley",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "darkgold-wolfbite-single-hit-damage",
          id: "darkgold-wolfbite-single-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.272, talentLevel: 1 },
            { expectedCoefficient: 2.2896, talentLevel: 10 }
          ]
        }
      ],
      element: "cryo",
      evaluator: "declared_direct",
      id: "wriothesley.burst.darkgold_wolfbite.single_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "darkgold-wolfbite-single-hit-damage",
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
      attackKind: "charged",
      characterId: "Wriothesley",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-damage",
          id: "rebuke-vaulting-fist",
          snapshotChecks: [
            { expectedCoefficient: 1.5296, talentLevel: 1 },
            { expectedCoefficient: 2.75328, talentLevel: 10 }
          ]
        }
      ],
      element: "cryo",
      evaluator: "declared_direct",
      id: "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-damage",
          // GO 98aafa1f: Characters/Wriothesley/index.tsx dm.charged.dmg = auto[6], not normal hit 5.
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-rebuke-vaulting-fist-ready",
          label: "C6 罪人之赦：满命已获得 C1 强化的斥逐拳·凌跃拳",
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
              parameterId: "c6-rebuke-vaulting-fist-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "rebuke-vaulting-fist",
            id: "rebuke-vaulting-fist",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    },
    {
      attackKind: "charged",
      characterId: "Wriothesley",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-damage",
          id: "c6-rebuke-vaulting-fist-icicle",
          snapshotChecks: [
            { expectedCoefficient: 1.5296, talentLevel: 1 },
            { expectedCoefficient: 2.75328, talentLevel: 10 }
          ]
        }
      ],
      element: "cryo",
      evaluator: "declared_direct",
      id: "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.icicle",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "normal"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-rebuke-vaulting-fist-icicle-ready",
          label: "C6 罪人之赦：斥逐拳·凌跃拳追加冰柱已触发",
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
              parameterId: "c6-rebuke-vaulting-fist-icicle-ready",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-rebuke-vaulting-fist-icicle",
            id: "c6-rebuke-vaulting-fist-icicle",
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
      id: "wriothesley.constellation.1.terror_for_the_evildoers.rebuke_vaulting_fist.damage_bonus",
      label: "恶行终须受惩之时 · C1 斥逐拳·凌跃拳伤害加成提高至200%（冰柱同样适用）",
      source: { characterId: "Wriothesley", kind: "character", minimumSourceConstellation: 1 },
      target: "damageBonus",
      targetFilter: {
        actionIds: [
          "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable",
          "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.icicle"
        ],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 2 }
    },
    {
      activation: "maximum_reachable",
      id: "wriothesley.passive.there_shall_be_a_plea_for_justice.full_stacks.attack_percent",
      label: "固有天赋 · 罪业终有报偿之时（满5层检偿之敕，攻击力提高30%）",
      source: { characterId: "Wriothesley", kind: "character", minimumSourceAscension: 4 },
      target: "attackPercent",
      targetFilter: {
        actionIds: [
          "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable",
          "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.icicle"
        ],
        recipientSourceRelation: "source"
      },
      value: {
        kind: "talent_parameter",
        multiplier: 5,
        parameter: {
          groupId: "passive2",
          id: "there-shall-be-a-plea-for-justice-attack-percent-per-stack",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "automatic",
      id: "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.crit_rate",
      label: "C6 罪人之赦 · 斥逐拳·凌跃拳暴击率提高10%",
      source: { characterId: "Wriothesley", kind: "character", minimumSourceConstellation: 6 },
      target: "critRate",
      targetFilter: {
        actionIds: [
          "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable",
          "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.icicle"
        ],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "automatic",
      id: "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.crit_damage",
      label: "C6 罪人之赦 · 斥逐拳·凌跃拳暴击伤害提高80%",
      source: { characterId: "Wriothesley", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: {
        actionIds: [
          "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable",
          "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.icicle"
        ],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.8 }
    }
  ],
  characterId: "Wriothesley",
  metrics: [
    {
      actionId: "wriothesley.burst.darkgold_wolfbite.single_hit",
      characterId: "Wriothesley",
      id: "wriothesley.burst.darkgold_wolfbite.single_hit",
      kind: "damage",
      label: "黑金狼噬 / 单次主段命中（无反应）",
      sourceActionId: "wriothesley.burst.darkgold_wolfbite.single_hit",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable",
      characterId: "Wriothesley",
      id: "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "斥逐拳·凌跃拳 / C6 满命强化重击（无反应）",
      sourceActionId: "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.icicle",
      characterId: "Wriothesley",
      id: "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.icicle",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "罪人之赦 / C6 斥逐拳·凌跃拳追加冰柱（无反应）",
      sourceActionId: "wriothesley.constellation.6.esteem_for_the_innocent.rebuke_vaulting_fist.icicle",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one Darkgold Wolfbite main hit are locked to the pinned game-data snapshot. The C6 fist and its separate icicle both read charged auto[6] at the cumulative normal talent level, and both receive C1's 200% in the ordinary damage-bonus stage, C6's +10% Crit Rate/+80% Crit Damage and the five-stack 30% Attack passive. The icicle retains the same enhanced charged-hit formula, not an unenhanced third of the fist. Neither metric is selectable below C6. No reaction, full burst sequence, HP timing or rotation is inferred.",
  label: wriothesleyDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "normal", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
