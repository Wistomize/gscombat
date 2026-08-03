import type { CharacterCombatCoverage } from "../../combat/types.js"

import { beidouDefinition } from "./definition.js"

export const beidouCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Beidou",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "stormbreaker-initial-aoe-damage",
          id: "stormbreaker-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 1.216, talentLevel: 1 },
            { expectedCoefficient: 2.1888, talentLevel: 10 }
          ]
        }
      ],
      element: beidouDefinition.element,
      evaluator: "declared_direct",
      id: "beidou.burst.stormbreaker.initial_aoe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "stormbreaker-initial-aoe-damage",
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
      characterId: "Beidou",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "tidecaller-press-base-damage",
          id: "tidecaller-press-base-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.216, talentLevel: 1 },
            { expectedCoefficient: 2.1888, talentLevel: 10 }
          ]
        }
      ],
      element: beidouDefinition.element,
      evaluator: "declared_direct",
      id: "beidou.skill.tidecaller.press.base_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "tidecaller-press-base-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Beidou",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.71122, talentLevel: 1 },
            { expectedCoefficient: 1.4059, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "beidou.normal.auto.first_hit",
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
      characterId: "Beidou",
      damageKind: "direct",
      damageParts: [
        {
          id: "tidecaller-full-counter-damage",
          scalingTerms: [
            {
              coefficientParameterId: "tidecaller-base-damage",
              snapshotChecks: [
                { expectedCoefficient: 1.216, talentLevel: 1 },
                { expectedCoefficient: 2.1888, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierScenarioParameterId: "tidecaller-counter-hit-count",
              coefficientParameterId: "tidecaller-damage-bonus-on-hit-taken",
              snapshotChecks: [
                { expectedCoefficient: 1.6, talentLevel: 1 },
                { expectedCoefficient: 2.88, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: beidouDefinition.element,
      evaluator: "declared_direct",
      id: "beidou.skill.tidecaller.full_counter",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "tidecaller-base-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "tidecaller-damage-bonus-on-hit-taken",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scenarioParameters: [
        {
          allowedValues: [2],
          defaultValue: 2,
          id: "tidecaller-counter-hit-count",
          label: "捉浪受击计数（本指标固定完全格挡）",
          maximumValue: 2,
          minimumValue: 2
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Beidou",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "stormbreaker-lightning-arc-damage",
          id: "stormbreaker-lightning-arc",
          snapshotChecks: [
            { expectedCoefficient: 0.96, talentLevel: 1 },
            { expectedCoefficient: 1.728, talentLevel: 10 }
          ]
        }
      ],
      element: beidouDefinition.element,
      evaluator: "declared_direct",
      id: "beidou.burst.stormbreaker.lightning_arc",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "stormbreaker-lightning-arc-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "beidou.stormbreaker.c6.electro_resistance_shred",
      label: "斫雷持续期间 · C6 雷元素抗性降低",
      source: { characterId: "Beidou", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["electro"] },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Beidou",
  metrics: [
    {
      actionId: "beidou.skill.tidecaller.full_counter",
      characterId: "Beidou",
      id: "beidou.skill.tidecaller.full_counter",
      kind: "damage",
      label: "捉浪 / 完全格挡反击（C0、无反应）",
      sourceActionId: "beidou.skill.tidecaller.full_counter",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "beidou.burst.stormbreaker.lightning_arc",
      characterId: "Beidou",
      id: "beidou.burst.stormbreaker.lightning_arc",
      kind: "damage",
      label: "斫雷 / 单次闪雷伤害（C0、无反应）",
      sourceActionId: "beidou.burst.stormbreaker.lightning_arc",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Tidecaller's press or zero-hit counter base damage, Stormbreaker's initial AoE, and one uninfused normal first hit remain separately verified baseline actions. The selected C0, no-reaction, attack-scaling Electro metrics are one Tidecaller full-counterattack and one Stormbreaker lightning arc. The full-counter action is exactly skill[2] plus two times skill[3], all times Attack: 441.6% Attack at Talent Level 1 and 794.88% at Level 10. Its fixed two-hit input represents only the already-achieved maximum multiplier; it does not infer whether it came from two received hits or Retribution's precise counter. One lightning arc is burst[1], or 96% Attack at Talent Level 1 and 172.8% at Level 10, against one affected target. C6 Electro resistance reduction during Stormbreaker is an explicit current-action snapshot. The metrics do not infer lightning-arc trigger count, chain target count, duration, shield absorption, elemental aura or reactions, external buffs, timing, remaining passives, or rotation behavior.",
  label: beidouDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
