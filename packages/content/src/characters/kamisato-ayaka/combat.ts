import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kamisatoAyakaDefinition } from "./definition.js"

export const kamisatoAyakaCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("kamisato-ayaka", 1),
    ...declareWeaponHitCapabilities(kamisatoAyakaDefinition),
    declareHitCapability("kamisato-ayaka.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["cryo"]),
  ],
  actions: [
    {
      characterId: "KamisatoAyaka",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "kamisato-art-hyouka-damage",
          id: "kamisato-art-hyouka",
          snapshotChecks: [
            { expectedCoefficient: 2.392, talentLevel: 1 },
            { expectedCoefficient: 4.3056, talentLevel: 10 }
          ]
        }
      ],
      element: kamisatoAyakaDefinition.element,
      evaluator: "declared_direct",
      id: "kamisato_ayaka.skill.kamisato_art_hyouka",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "kamisato-art-hyouka-damage",
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
      characterId: "KamisatoAyaka",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "kamisato-art-soumetsu-cutting-damage",
          id: "kamisato-art-soumetsu-cutting",
          snapshotChecks: [
            { expectedCoefficient: 1.123, talentLevel: 1 },
            { expectedCoefficient: 2.0214, talentLevel: 10 }
          ]
        }
      ],
      element: kamisatoAyakaDefinition.element,
      evaluator: "declared_direct",
      id: "kamisato_ayaka.burst.kamisato_art_soumetsu.cutting",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-senho-cryo-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 寒天宣命祝词",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.18, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "kamisato-art-soumetsu-cutting-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "a4-senho-cryo-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "KamisatoAyaka",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "kamisato-art-soumetsu-bloom-damage",
          id: "kamisato-art-soumetsu-bloom",
          snapshotChecks: [
            { expectedCoefficient: 1.6845, talentLevel: 1 },
            { expectedCoefficient: 3.0321, talentLevel: 10 }
          ]
        }
      ],
      element: kamisatoAyakaDefinition.element,
      evaluator: "declared_direct",
      id: "kamisato_ayaka.burst.kamisato_art_soumetsu.bloom",
      intrinsicEffects: [
        {
          coefficientParameterId: "a4-senho-cryo-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 寒天宣命祝词",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.18, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "kamisato-art-soumetsu-bloom-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive2",
          id: "a4-senho-cryo-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    },
    {
      attackKind: "charged",
      characterId: "KamisatoAyaka",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "charged-attack-damage",
          id: "c6-dance-of-suigetsu-charged-attack-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.55126, talentLevel: 1 },
            { expectedCoefficient: 1.0897, talentLevel: 10 }
          ]
        }
      ],
      element: kamisatoAyakaDefinition.element,
      evaluator: "declared_direct",
      id: "kamisato_ayaka.constellation.6.dance_of_suigetsu.senho_charged_attack",
      intrinsicEffects: [
        {
          coefficientParameterId: "a1-post-hyouka-normal-charged-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 天罪国罪镇词",
          minimumSourceAscension: 1,
          snapshotChecks: [{ expectedCoefficient: 0.3, talentLevel: 1 }],
          target: "damageBonus"
        },
        {
          coefficientParameterId: "a4-senho-cryo-damage-bonus",
          kind: "flat",
          label: "固有天赋 · 寒天宣命祝词",
          minimumSourceAscension: 4,
          snapshotChecks: [{ expectedCoefficient: 0.18, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "charged-attack-damage",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "passive1",
          id: "a1-post-hyouka-normal-charged-damage-bonus",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        },
        {
          groupId: "passive2",
          id: "a4-senho-cryo-damage-bonus",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-dance-of-suigetsu-charged-attack-current",
          label: "C6 间水月：薄冰舞踏、冰华增伤与霰步冰附魔均已生效",
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
              parameterId: "c6-dance-of-suigetsu-charged-attack-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-dance-of-suigetsu-charged-attack-hit",
            id: "c6-dance-of-suigetsu-charged-attack-hit-one",
            snapshot: "hit"
          },
          {
            at: 0.1,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-dance-of-suigetsu-charged-attack-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-dance-of-suigetsu-charged-attack-hit",
            id: "c6-dance-of-suigetsu-charged-attack-hit-two",
            snapshot: "hit"
          },
          {
            at: 0.2,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-dance-of-suigetsu-charged-attack-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-dance-of-suigetsu-charged-attack-hit",
            id: "c6-dance-of-suigetsu-charged-attack-hit-three",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  characterId: "KamisatoAyaka",
  actionEffects: [
    {
      activation: "active",
      id: "kamisato_ayaka.constellation.4.soumetsu.enemy_defense_reduction",
      label: "目标减防已生效：神里流·霜灭命中后 · C4 防御力降低（30%，6秒；不作用于触发命中）",
      source: { characterId: "KamisatoAyaka", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyDefenseReduction",
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "automatic",
      id: "kamisato_ayaka.constellation.6.dance_of_suigetsu.charged_attack.damage_bonus",
      label: "间水月 · C6 薄冰舞踏使下一次重击伤害提高298%",
      source: { characterId: "KamisatoAyaka", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["kamisato_ayaka.constellation.6.dance_of_suigetsu.senho_charged_attack"],
        attackKinds: ["charged"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 2.98 }
    }
  ],
  metrics: [
    {
      actionId: "kamisato_ayaka.burst.kamisato_art_soumetsu.cutting",
      characterId: "KamisatoAyaka",
      id: "kamisato_ayaka.burst.kamisato_art_soumetsu.cutting",
      kind: "damage",
      label: "神里流·霜灭 / 单次切割伤害（无反应）",
      sourceActionId: "kamisato_ayaka.burst.kamisato_art_soumetsu.cutting",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "kamisato_ayaka.burst.kamisato_art_soumetsu.bloom",
      characterId: "KamisatoAyaka",
      id: "kamisato_ayaka.burst.kamisato_art_soumetsu.bloom",
      kind: "damage",
      label: "神里流·霜灭 / 末端绽放伤害（无反应）",
      sourceActionId: "kamisato_ayaka.burst.kamisato_art_soumetsu.bloom",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "kamisato_ayaka.constellation.6.dance_of_suigetsu.senho_charged_attack",
      characterId: "KamisatoAyaka",
      id: "kamisato_ayaka.constellation.6.dance_of_suigetsu.senho_charged_attack",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "间水月 / C6 薄冰舞踏冰附魔重击三段合计（无反应）",
      sourceActionId: "kamisato_ayaka.constellation.6.dance_of_suigetsu.senho_charged_attack",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected no-reaction, attack-scaling Cryo burst metrics are one Kamisato Art: Soumetsu cutting hit, burst[0] (112.3% Attack at Talent Level 1; 202.14% at Level 10), and its one terminal bloom, burst[1] (168.45% Attack at Talent Level 1; 303.21% at Level 10). Each is an independent single hit: the evaluator does not sum Soumetsu's nineteen cutting hits, infer its timing, or simulate a rotation. At Ascension 4 or above, both conventional metrics include the 18% Cryo Damage Bonus after Senho's Cryo application. Kamisato Art: Hyouka remains a separately verified baseline hit. At C4, the separately selected target-debuff snapshot means the target was already struck by Soumetsu: Defense is reduced by 30% for 6 seconds, never for the triggering hit itself. C6's dedicated charged action is zero through C5. At C6 it evaluates all three hits of one Senho-infused Charged Attack at the maximum-reachable fixed kit state: Dance of Suigetsu adds 298% Damage Bonus, A1 after Hyouka adds 30% Normal/Charged Attack Damage Bonus, and A4 after Senho hits adds 18% Cryo Damage Bonus. It excludes elemental aura and reactions, external buffs, timing, and other character states.",
  label: kamisatoAyakaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
