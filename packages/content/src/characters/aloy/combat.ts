import type { CharacterCombatCoverage } from "../../combat/types.js"

import { aloyDefinition } from "./definition.js"

export const aloyCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Aloy",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "prophecies-of-dawn-explosion-damage",
          id: "prophecies-of-dawn-explosion",
          snapshotChecks: [
            { expectedCoefficient: 3.592, talentLevel: 1 },
            { expectedCoefficient: 6.4656, talentLevel: 10 }
          ]
        }
      ],
      element: aloyDefinition.element,
      evaluator: "declared_direct",
      id: "aloy.burst.prophecies_of_dawn.explosion",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "prophecies-of-dawn-explosion-damage",
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
      characterId: "Aloy",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "frozen-wilds-ice-dust-bomb-damage",
          id: "frozen-wilds-ice-dust-bomb",
          snapshotChecks: [
            { expectedCoefficient: 1.776, talentLevel: 1 },
            { expectedCoefficient: 3.1968, talentLevel: 10 }
          ]
        }
      ],
      element: aloyDefinition.element,
      evaluator: "declared_direct",
      id: "aloy.skill.frozen_wilds.ice_dust_bomb",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "frozen-wilds-ice-dust-bomb-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    }
  ],
  characterId: "Aloy",
  metrics: [
    {
      actionId: "aloy.burst.prophecies_of_dawn.explosion",
      characterId: "Aloy",
      id: "aloy.burst.prophecies_of_dawn.explosion",
      kind: "damage",
      label: "曙光预言 / 单次爆炸（C0，无反应）",
      sourceActionId: "aloy.burst.prophecies_of_dawn.explosion",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The Prophecies of Dawn explosion and one Frozen Wilds ice-dust bomb are locked to the pinned 6.7 game-data snapshot from Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073. The selected C0 metric is one Prophecies of Dawn explosion against one target: Burst parameter burst[0], or 359.2% Attack at Talent Level 1 and 646.56% at Level 10. It declares no target aura, Melt, or other fixed reaction. Frozen Wilds deployment, ice-dust bomb and Chillwater Bomblet follow-ups, target count, Coil stacks, Rushing Ice's Cryo infusion and Normal Attack bonus, Combat Override's party Attack bonus, Strong Strike's timed Cryo Damage Bonus, external infusions, timing, and character states remain unmodeled.",
  label: aloyDefinition.name,
  status: "draft"
}
