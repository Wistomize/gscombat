import type { CharacterCombatCoverage } from "../../combat/types.js"

import { lohenDefinition } from "./definition.js"

export const lohenCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Lohen",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "bone-chilling-heart-damage",
          id: "bone-chilling-heart",
          snapshotChecks: [
            { expectedCoefficient: 0.6, talentLevel: 1 },
            { expectedCoefficient: 1.08, talentLevel: 10 }
          ]
        }
      ],
      element: lohenDefinition.element,
      evaluator: "declared_direct",
      id: "lohen.skill.bone_chilling_heart.single_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "bone-chilling-heart-damage",
          parameterIndex: 16,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "bone-chilling-heart-damage-increase-per-will-to-win",
          parameterIndex: 17,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 20, 40, 60, 80, 100],
          defaultValue: 100,
          id: "will-to-win-consumed",
          label: "本次消耗的争胜",
          maximumValue: 100,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              base: 1,
              kind: "scenario_parameter_talent_linear",
              parameterId: "will-to-win-consumed",
              perParameterTalentCoefficientId: "bone-chilling-heart-damage-increase-per-will-to-win",
              perParameterTalentCoefficientSnapshotChecks: [
                { expectedCoefficient: 0.004, talentLevel: 1 },
                { expectedCoefficient: 0.004, talentLevel: 10 }
              ]
            },
            damagePartId: "bone-chilling-heart",
            id: "bone-chilling-heart",
            snapshot: "cast"
          }
        ],
        duration: 1
      }
    }
  ],
  characterId: "Lohen",
  metrics: [
    {
      actionId: "lohen.skill.bone_chilling_heart.single_hit",
      characterId: "Lohen",
      id: "lohen.skill.bone_chilling_heart.single_hit",
      kind: "damage",
      label: "镂骨彻心 / 单次命中（C0、争胜100、无反应）",
      sourceActionId: "lohen.skill.bone_chilling_heart.single_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One C0 Cryo Bone-Chilling Heart hit is the selected no-reaction metric. Its current-action snapshot uses skill[16] times Attack, then multiplies the hit by 1 plus the selected consumed Will to Win times skill[17]; C0 permits 0, 20, 40, 60, 80, or 100 and defaults to 100. It assumes this special hit is currently available, but does not generate or consume Will to Win for subsequent actions, validate Joy or Guile states, model the stance, timing, burst, passives, constellations, reactions, or a rotation.",
  label: lohenDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
