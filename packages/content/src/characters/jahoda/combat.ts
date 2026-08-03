import type { CharacterCombatCoverage } from "../../combat/types.js"

import { jahodaDefinition } from "./definition.js"

export const jahodaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Jahoda",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.416739, talentLevel: 1 },
            { expectedCoefficient: 0.823786, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "jahoda.normal.auto.first_hit",
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
      characterId: "Jahoda",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "savvy-strategy-smoke-bomb-damage",
          id: "savvy-strategy-smoke-bomb",
          snapshotChecks: [
            { expectedCoefficient: 1.59, talentLevel: 1 },
            { expectedCoefficient: 2.862, talentLevel: 10 }
          ]
        }
      ],
      element: jahodaDefinition.element,
      evaluator: "declared_direct",
      id: "jahoda.skill.savvy_strategy_splitting_the_spoils.smoke_bomb.on_miss",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "savvy-strategy-smoke-bomb-damage",
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
      characterId: "Jahoda",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "hidden-aces-seven-tools-of-the-hunter-initial-hit-damage",
          id: "hidden-aces-seven-tools-of-the-hunter-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 2.072, talentLevel: 1 },
            { expectedCoefficient: 3.7296, talentLevel: 10 }
          ]
        }
      ],
      element: jahodaDefinition.element,
      evaluator: "declared_direct",
      id: "jahoda.burst.hidden_aces_seven_tools_of_the_hunter.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "hidden-aces-seven-tools-of-the-hunter-initial-hit-damage",
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
      characterId: "Jahoda",
      element: jahodaDefinition.element,
      id: "jahoda.burst.hidden_aces_seven_tools_of_the_hunter.robot.heal_tick",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "hidden-aces-seven-tools-of-the-hunter-robot-healing-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "hidden-aces-seven-tools-of-the-hunter-robot-healing-flat",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Jahoda",
  metrics: [
    {
      characterId: "Jahoda",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "hidden-aces-seven-tools-of-the-hunter-robot-healing-flat",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 500.73764, talentLevel: 1 },
          { expectedValue: 1101.7063, talentLevel: 10 }
        ]
      },
      id: "jahoda.burst.hidden_aces_seven_tools_of_the_hunter.robot.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "秘器·猎人的七道具 / 猫型家用互助协调器单跳治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "hidden-aces-seven-tools-of-the-hunter-robot-healing-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.79872, talentLevel: 1 },
          { expectedValue: 1.437696, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "attack",
      sourceActionId: "jahoda.burst.hidden_aces_seven_tools_of_the_hunter.robot.heal_tick",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One first normal-attack hit, one Smoke Bomb hit, and Hidden Aces: Seven Tools of the Hunter's initial hit remain separately verified baseline C0 attack-scaling damage actions, but none is a selected Jahoda metric because her role-correct output is healing. The selected support metric is one Purrsonal Coordinated Assistance Robot base healing tick for one selected recipient: Jahoda's Attack × burst[3] plus burst[4], then Jahoda's Healing Bonus and that recipient's Incoming Healing Bonus; C3 adds three Burst levels. The pinned 6.7 snapshot maps burst[3] and burst[4] to the robot's base healing multiplier and flat value. It deliberately does not model the separate burst[5] plus burst[6] additional heal because it requires both the normally healed active character to be above 70% HP and a nearby party member to be the team's relative lowest-HP character; the current recipient requirements can express only absolute HP thresholds, not that party-wide ordering. It also excludes robot target selection and count, duration, the Hydro A1 healing multiplier, elemental conversion, C1/C2/C4/C5/C6, the A4 Elemental Mastery buff, external effects, timing, and rotation behavior.",
  label: jahodaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
