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
  characterId: "Lynette",
  metrics: [
    {
      actionId: "lynette.skill.enigmatic_feint.enigma_thrust",
      characterId: "Lynette",
      id: "lynette.skill.enigmatic_feint.enigma_thrust",
      kind: "damage",
      label: "谜影障身法 / 谜影突刺（C0、无反应）",
      sourceActionId: "lynette.skill.enigmatic_feint.enigma_thrust",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Enigma Thrust from an Enigmatic Feint press is the selected C0, no-reaction, attack-scaling Anemo damage metric. It uses the skill's first parameter (268% ATK at talent level 1; 482.4% at level 10). One first normal-attack hit and Magic Trick: Astonishing Shift's initial AoE are separately verified. The selected metric excludes Bogglecat Box periodic damage, conversion bullets, duration, elemental aura and reactions, passives, constellations, external buffs, timing, and rotation behavior. No infusion, hold movement, Surging Blade, healing, or HP effects are modeled.",
  label: lynetteDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
