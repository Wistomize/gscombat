import type { CharacterCombatCoverage } from "../../combat/types.js"

import { lynetteDefinition } from "./definition.js"

export const lynetteCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Lynette",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.430817, talentLevel: 1 },
            { expectedCoefficient: 0.851615, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "lynette.normal.auto.first_hit",
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
      characterId: "Lynette",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "enigmatic-feint-enigma-thrust-damage",
          id: "enigmatic-feint-enigma-thrust",
          snapshotChecks: [
            { expectedCoefficient: 2.68, talentLevel: 1 },
            { expectedCoefficient: 4.824, talentLevel: 10 }
          ]
        }
      ],
      element: lynetteDefinition.element,
      evaluator: "declared_direct",
      id: "lynette.skill.enigmatic_feint.enigma_thrust",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "enigmatic-feint-enigma-thrust-damage",
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
      characterId: "Lynette",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "magic-trick-astonishing-shift-initial-aoe-damage",
          id: "magic-trick-astonishing-shift-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 0.832, talentLevel: 1 },
            { expectedCoefficient: 1.4976, talentLevel: 10 }
          ]
        }
      ],
      element: lynetteDefinition.element,
      evaluator: "declared_direct",
      id: "lynette.burst.magic_trick_astonishing_shift.initial_aoe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "magic-trick-astonishing-shift-initial-aoe-damage",
          parameterIndex: 0,
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
      id: "lynette.constellation.6.watchful_eye.after_enigma_thrust.anemo_damage_bonus",
      label: "示辨真意的眼 · C6 施放谜影突刺后风元素伤害加成20%（6秒）",
      source: { characterId: "Lynette", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: { elements: ["anemo"], recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Lynette",
  metrics: [
    {
      actionId: "lynette.skill.enigmatic_feint.enigma_thrust",
      characterId: "Lynette",
      id: "lynette.skill.enigmatic_feint.enigma_thrust",
      kind: "damage",
      label: "谜影障身法 / 谜影突刺（无反应）",
      sourceActionId: "lynette.skill.enigmatic_feint.enigma_thrust",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Enigma Thrust from an Enigmatic Feint press is the selected no-reaction, attack-scaling Anemo damage metric. At C6, the explicit post-thrust six-second snapshot adds 20% Anemo Damage Bonus; the accompanying self Anemo infusion affects later weapon attacks rather than changing this action's element. One first normal hit and the Burst's initial AoE remain separately verified. Bogglecat Box ticks, conversion bullets, timing, and rotation remain outside this metric.",
  label: lynetteDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
