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
    }
  ],
  characterId: "Flins",
  metrics: [
    {
      actionId: "flins.burst.initial_direct_hit",
      characterId: "Flins",
      id: "flins.burst.initial_direct_hit",
      kind: "damage",
      label: "元素爆发 / 初始直伤（C0、无反应）",
      sourceActionId: "flins.burst.initial_direct_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Elemental Burst initial direct hit is the selected C0, no-reaction, attack-scaling Electro damage metric. It uses burst[0] (259.84% ATK at talent level 1; 467.712% ATK at level 10). The metric excludes the later Lunar-Charged phases, Thunder damage and its additional damage, Moon Sign and Lunar-reaction context, passives, constellations, external buffs, timing, and rotation behavior. One first normal-attack hit remains separately verified as baseline C0 attack-scaling Physical damage.",
  label: flinsDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
