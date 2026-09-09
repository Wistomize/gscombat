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
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "lohen.locked_passive.unhealing_thorn.high_will_to_win.normal_charged_damage_bonus",
      label: "魔女的前夜礼·不愈之刺 · 争胜不低于50%后普通攻击与重击伤害提升",
      source: { characterId: "Lohen", kind: "character" },
      target: "damageBonus",
      targetFilter: { attackKinds: ["normal", "charged"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "automatic",
      id: "lohen.constellation.6.soul_and_body_sunk_only_joy_remains.bone_chilling_heart.crit_damage",
      label: "身沦魂销，唯余欢悦 · C6 特殊元素战技「镂骨彻心」暴击伤害提升175%",
      source: { characterId: "Lohen", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: {
        actionIds: ["lohen.skill.bone_chilling_heart.single_hit"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 1.75 }
    }
  ],
  metrics: [
    {
      actionId: "lohen.skill.bone_chilling_heart.single_hit",
      characterId: "Lohen",
      id: "lohen.skill.bone_chilling_heart.single_hit",
      kind: "damage",
      label: "镂骨彻心 / 单次命中（争胜100、无反应）",
      sourceActionId: "lohen.skill.bone_chilling_heart.single_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Cryo Bone-Chilling Heart hit is the selected no-reaction metric and defaults to 100 Will to Win consumed. Unhealing Thorn contributes its 40% Normal and Charged Attack damage snapshot under Hexerei: Secret Rite. At C6, this special Skill hit automatically gains 175% Crit DMG; the no-consumption clause, stance extension, and two additional uses change sequence availability rather than one-hit damage. Will generation, stance timing, burst, reactions, and rotation behavior remain unmodeled.",
  label: lohenDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
