import type { CharacterCombatCoverage } from "../../combat/types.js"

import { flinsDefinition } from "./definition.js"

export const flinsCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Flins",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.44726, talentLevel: 1 },
            { expectedCoefficient: 0.884119, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "flins.normal.auto.first_hit",
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
      characterId: "Flins",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "elemental-burst-initial-direct-hit-damage",
          id: "elemental-burst-initial-direct-hit",
          snapshotChecks: [
            { expectedCoefficient: 2.5984, talentLevel: 1 },
            { expectedCoefficient: 4.67712, talentLevel: 10 }
          ]
        }
      ],
      element: flinsDefinition.element,
      evaluator: "declared_direct",
      id: "flins.burst.initial_direct_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "elemental-burst-initial-direct-hit-damage",
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
      characterId: "Flins",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "thunder-symphony-lunar-charged-damage",
          id: "thunder-symphony-lunar-charged",
          snapshotChecks: [
            { expectedCoefficient: 0.71456, talentLevel: 1 },
            { expectedCoefficient: 1.286208, talentLevel: 10 }
          ]
        }
      ],
      element: flinsDefinition.element,
      evaluator: "declared_special_reaction",
      id: "flins.burst.thunder_symphony.lunar_charged",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "thunder-symphony-lunar-charged-damage",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      specialReaction: { kind: "lunar_charged" },
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Flins",
      damageKind: "special_reaction",
      damageParts: [
        {
          coefficientParameterId: "thunder-symphony-additional-lunar-charged-damage",
          id: "thunder-symphony-additional-lunar-charged",
          snapshotChecks: [
            { expectedCoefficient: 1.03936, talentLevel: 1 },
            { expectedCoefficient: 1.870848, talentLevel: 10 }
          ]
        }
      ],
      element: flinsDefinition.element,
      evaluator: "declared_special_reaction",
      id: "flins.burst.thunder_symphony.additional_lunar_charged",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "thunder-symphony-additional-lunar-charged-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      specialReaction: { kind: "lunar_charged" },
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "flins.passive.moonsign_benediction.lunar_charged_base_damage_bonus",
      label: "月兆祝赐·旧世潜藏 · 月感电基础伤害加成",
      source: { characterId: "Flins", kind: "character" },
      target: "specialReactionBaseDamageBonus",
      targetFilter: { specialReactionKinds: ["lunar_charged"] },
      value: {
        kind: "source_final_attack",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive3",
            id: "lunar-charged-base-damage-bonus-maximum",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "passive"
          }
        },
        multiplier: {
          kind: "talent_parameter",
          multiplier: 0.01,
          parameter: {
            groupId: "passive3",
            id: "lunar-charged-base-damage-bonus-per-100-attack",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        },
        sourceAttackSnapshotEffectIds: ["flins.constellation.4.attack_percent"]
      }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "flins.passive.winters_symphony.lunar_charged_damage_bonus",
      label: "寒冬的交响 · 满辉月感电反应伤害提升",
      source: { characterId: "Flins", kind: "character", minimumSourceAscension: 1 },
      target: "specialReactionDamageBonus",
      targetFilter: { recipientSourceRelation: "source", specialReactionKinds: ["lunar_charged"] },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "passive1",
          id: "full-moonsign-lunar-charged-damage-bonus",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "maximum_reachable",
      exclusivity: { group: "flins-attack-to-elemental-mastery", variant: "base" },
      id: "flins.passive.whispers_of_the_spectral_flame.elemental_mastery",
      label: "幽焰的呢喃 · 攻击力的8%转为元素精通（至多160点）",
      source: { characterId: "Flins", kind: "character", minimumSourceAscension: 4 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        kind: "source_final_attack",
        maximumValue: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive2",
            id: "attack-to-elemental-mastery-maximum",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "passive"
          }
        },
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "passive2",
            id: "attack-to-elemental-mastery-ratio",
            parameterIndex: 0,
            source: "talent",
            talentSlot: "passive"
          }
        },
        sourceAttackSnapshotEffectIds: ["flins.constellation.4.attack_percent"]
      }
    },
    {
      activation: "maximum_reachable",
      exclusivity: { group: "flins-attack-to-elemental-mastery", variant: "constellation-4" },
      id: "flins.constellation.4.whispers_of_the_spectral_flame.elemental_mastery",
      label: "荒山嘶啭之夜 · C4攻击力的10%转为元素精通（至多220点）",
      source: { characterId: "Flins", kind: "character", minimumSourceAscension: 4, minimumSourceConstellation: 4 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        kind: "source_final_attack",
        maximumValue: { kind: "fixed", value: 220 },
        multiplier: { kind: "fixed", value: 0.1 },
        sourceAttackSnapshotEffectIds: ["flins.constellation.4.attack_percent"]
      }
    },
    {
      activation: "maximum_reachable",
      id: "flins.constellation.2.electro_resistance_reduction",
      label: "渡越魍魉之墙 · C2满辉雷元素攻击命中后雷元素抗性降低",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      source: { characterId: "Flins", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["electro"] },
      value: { kind: "fixed", value: 0.25 }
    },
    {
      activation: "maximum_reachable",
      id: "flins.constellation.4.attack_percent",
      label: "荒山嘶啭之夜 · C4攻击力提升20%",
      source: { characterId: "Flins", kind: "character", minimumSourceConstellation: 4 },
      target: "attackPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "maximum_reachable",
      id: "flins.constellation.6.self_lunar_charged_elevation",
      label: "歌与亡者之舞 · C6菲林斯月感电反应伤害擢升35%",
      source: { characterId: "Flins", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionElevation",
      targetFilter: { recipientSourceRelation: "source", specialReactionKinds: ["lunar_charged"] },
      value: { kind: "fixed", value: 0.35 }
    },
    {
      activation: "maximum_reachable",
      condition: { kind: "moonsign_level", minimum: "ascendant_gleam" },
      id: "flins.constellation.6.team_lunar_charged_elevation",
      label: "歌与亡者之舞 · C6满辉全队月感电反应伤害擢升10%",
      source: { characterId: "Flins", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionElevation",
      targetFilter: { specialReactionKinds: ["lunar_charged"] },
      value: { kind: "fixed", value: 0.1 }
    }
  ],
  characterId: "Flins",
  metrics: [
    {
      actionId: "flins.burst.thunder_symphony.lunar_charged",
      characterId: "Flins",
      id: "flins.burst.thunder_symphony.lunar_charged",
      kind: "damage",
      label: "雷霆交响 / 月感电单次伤害",
      sourceActionId: "flins.burst.thunder_symphony.lunar_charged",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "flins.burst.thunder_symphony.additional_lunar_charged",
      characterId: "Flins",
      id: "flins.burst.thunder_symphony.additional_lunar_charged",
      kind: "damage",
      label: "雷霆交响 / 满辉雷暴云额外月感电伤害",
      sourceActionId: "flins.burst.thunder_symphony.additional_lunar_charged",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The maintained metrics are Thunder Symphony's Lunar-Charged hit and its separate Ascendant-Gleam Thundercloud additional Lunar-Charged hit. Both scale from final Attack, use the dedicated Lunar-Charged coefficient, and exclude ordinary damage bonus and defense. Flins's capped final-Attack-derived 14% base-damage bonus is team-wide; Winter's Symphony adds 20% only to Flins in Ascendant Gleam. A4 converts final Attack to Elemental Mastery, with C4 replacing the 8%/160 conversion by 10%/220 after its own 20% Attack bonus. C2 supplies the reachable 25% Electro resistance reduction, while C6 adds 35% self and 10% Ascendant-Gleam team elevation in the final elevation stage. C2's separate 50% Attack Lunar-Charged event is deliberately not merged into either Thunder Symphony action. The initial Burst hit and one first normal hit remain verified lower-level actions; energy, timing, thundercloud creation, and rotations are not inferred.",
  label: flinsDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
