import type { CharacterCombatCoverage } from "../../combat/types.js"

import { eulaDefinition } from "./definition.js"

export const eulaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Eula",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "icetide-vortex-press-damage",
          id: "icetide-vortex-press-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.464, talentLevel: 1 },
            { expectedCoefficient: 2.6352, talentLevel: 10 }
          ]
        }
      ],
      element: eulaDefinition.element,
      evaluator: "declared_direct",
      id: "eula.skill.icetide_vortex.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "icetide-vortex-press-damage",
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
      characterId: "Eula",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "glacial-illumination-initial-slash-damage",
          id: "glacial-illumination-initial-slash",
          snapshotChecks: [
            { expectedCoefficient: 2.456, talentLevel: 1 },
            { expectedCoefficient: 4.4208, talentLevel: 10 }
          ]
        }
      ],
      element: eulaDefinition.element,
      evaluator: "declared_direct",
      id: "eula.burst.glacial_illumination.initial_slash",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "glacial-illumination-initial-slash-damage",
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
      characterId: "Eula",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.897324, talentLevel: 1 },
            { expectedCoefficient: 1.77378, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "eula.normal.auto.first_hit",
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
      characterId: "Eula",
      damageKind: "direct",
      damageParts: [
        {
          id: "lightfall-sword-explosion",
          scalingTerms: [
            {
              coefficientParameterId: "lightfall-sword-base-damage",
              snapshotChecks: [
                { expectedCoefficient: 3.67048, talentLevel: 1 },
                { expectedCoefficient: 7.2556, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierScenarioParameterId: "lightfall-sword-stack-count",
              coefficientParameterId: "lightfall-sword-damage-per-stack",
              snapshotChecks: [
                { expectedCoefficient: 0.74992, talentLevel: 1 },
                { expectedCoefficient: 1.4824, talentLevel: 10 }
              ],
              stat: "attack"
            }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "eula.burst.glacial_illumination.lightfall_sword.explosion",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "lightfall-sword-base-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "lightfall-sword-damage-per-stack",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scenarioParameters: [
        {
          defaultValue: 0,
          id: "lightfall-sword-stack-count",
          label: "光降之剑能量层数",
          maximumValue: 30,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "eula.constellation.4.obstinacy_of_ones_inferiors.low_hp_target.lightfall_sword.damage_bonus",
      label: "自卑者的逞强 · C4 目标生命值低于50%（光降之剑伤害提高25%）",
      source: { characterId: "Eula", kind: "character", minimumSourceConstellation: 4 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["eula.burst.glacial_illumination.lightfall_sword.explosion"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.25 }
    }
  ],
  characterId: "Eula",
  metrics: [
    {
      actionId: "eula.burst.glacial_illumination.lightfall_sword.explosion",
      characterId: "Eula",
      id: "eula.burst.glacial_illumination.lightfall_sword.explosion",
      kind: "damage",
      label: "凝浪之光剑 / 光降之剑爆炸（物理、无反应、手填层数）",
      sourceActionId: "eula.burst.glacial_illumination.lightfall_sword.explosion",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Glacial Illumination's Lightfall Sword explosion is the selected no-reaction, attack-scaling Physical metric: burst[1] plus the caller-selected current Lightfall Sword energy-stack count times burst[2]. The integer input accepts zero through thirty stacks and represents the explosion's current snapshot, not a count of normal attacks. C4 can be selected only when the target is already below 50% HP before this Lightfall Sword explosion, adding 25% damage bonus. The evaluator does not simulate stack generation, the 0.1-second interval, the seven-second duration, switching, expiry detonation, Grimheart, other constellations, infusions, aura/reactions, timing, or energy availability. Explicit scenario buffs still enter the shared damage pipeline. Icetide Vortex press and the initial slash remain separately verified baseline hits; hold damage remains unmodeled.",
  label: eulaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
