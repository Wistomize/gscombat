import type { CharacterCombatCoverage } from "../../combat/types.js"

import { xianyunDefinition } from "./definition.js"

export const xianyunCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Xianyun",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.403024, talentLevel: 1 },
            { expectedCoefficient: 0.725443, talentLevel: 10 }
          ]
        }
      ],
      element: xianyunDefinition.element,
      evaluator: "declared_direct",
      id: "xianyun.normal.auto.first_hit",
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
      characterId: "Xianyun",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "white-clouds-at-dawn-skill-damage",
          id: "white-clouds-at-dawn-first-skyladder",
          snapshotChecks: [
            { expectedCoefficient: 0.248, talentLevel: 1 },
            { expectedCoefficient: 0.4464, talentLevel: 10 }
          ]
        }
      ],
      element: xianyunDefinition.element,
      evaluator: "declared_direct",
      id: "xianyun.skill.white_clouds_at_dawn.first_skyladder",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "white-clouds-at-dawn-skill-damage",
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
      characterId: "Xianyun",
      element: xianyunDefinition.element,
      id: "xianyun.burst.stars_gather_at_dusk.instant_healing",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "stars-gather-at-dusk-instant-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "stars-gather-at-dusk-instant-healing-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Xianyun",
  metrics: [
    {
      characterId: "Xianyun",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "stars-gather-at-dusk-instant-healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 577.7816, talentLevel: 1 },
          { expectedValue: 1271.216, talentLevel: 10 }
        ]
      },
      id: "xianyun.burst.stars_gather_at_dusk.instant_healing",
      includeHealingBonus: true,
      kind: "healing",
      label: "暮集竹星 / 施放单名队员治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "stars-gather-at-dusk-instant-healing-attack-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.9216, talentLevel: 1 },
          { expectedValue: 1.65888, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色为施放时队伍中的附近角色" }
      ],
      scalingStat: "attack",
      sourceActionId: "xianyun.burst.stars_gather_at_dusk.instant_healing",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "The selected Xianyun profile reports one core self-produced support result: Stars Gather at Dusk's cast heal for one selected nearby party member. Its formula is Xianyun's Attack × burst[3] + burst[2], then Xianyun's Healing Bonus and the recipient's Incoming Healing Bonus; the pinned 6.7 snapshot gives burst[3] as 0.9216 at Talent Level 1 and 1.65888 at Level 10, and burst[2] as 577.7816 and 1271.216. C3 adds three Burst levels. One first normal-attack hit and one first Skyladder from White Clouds at Dawn remain verified lower-level attack-scaling Anemo actions, but are not selected as role metrics. The metric excludes the Starwicker's periodic healing and coordinated damage, all remaining Cloud Transmogrification state, Skyladder counts and their one-hit-per-opponent limit, Driftcloud Wave and its jump-count scaling, external infusion, reactions, timing, passives, C1/C2/C4/C5/C6, external effects, party-size aggregation, and all other character states.",
  label: xianyunDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
