import type { CharacterCombatCoverage } from "../../combat/types.js"

import { rosariaDefinition } from "./definition.js"

export const rosariaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Rosaria",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.5246, talentLevel: 1 },
            { expectedCoefficient: 1.037, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "rosaria.normal.auto.first_hit",
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
      characterId: "Rosaria",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "ravaging-confession-damage",
          id: "ravaging-confession",
          snapshotChecks: [
            { expectedCoefficient: 0.584, talentLevel: 1 },
            { expectedCoefficient: 1.0512, talentLevel: 10 }
          ]
        }
      ],
      element: rosariaDefinition.element,
      evaluator: "declared_direct",
      id: "rosaria.skill.ravaging_confession",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "ravaging-confession-damage",
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
      characterId: "Rosaria",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "rites-of-termination-first-hit-damage",
          id: "rites-of-termination-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.04, talentLevel: 1 },
            { expectedCoefficient: 1.872, talentLevel: 10 }
          ]
        }
      ],
      element: rosariaDefinition.element,
      evaluator: "declared_direct",
      id: "rosaria.burst.rites_of_termination.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "rites-of-termination-first-hit-damage",
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
      characterId: "Rosaria",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "ravaging-confession-second-hit-damage",
          id: "ravaging-confession-second-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.36, talentLevel: 1 },
            { expectedCoefficient: 2.448, talentLevel: 10 }
          ]
        }
      ],
      element: rosariaDefinition.element,
      evaluator: "declared_direct",
      id: "rosaria.skill.ravaging_confession.second_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "ravaging-confession-second-hit-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "rosaria.ravaging_confession.c6.physical_resistance_shred",
      label: "终命的圣礼命中后 · C6 物理抗性降低（10秒）",
      source: { characterId: "Rosaria", kind: "character", minimumSourceConstellation: 6 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["physical"] },
      value: { kind: "fixed", value: 0.2 }
    }
  ],
  characterId: "Rosaria",
  metrics: [
    {
      actionId: "rosaria.skill.ravaging_confession.second_hit",
      characterId: "Rosaria",
      id: "rosaria.skill.ravaging_confession.second_hit",
      kind: "damage",
      label: "噬罪的告解 / 第二段伤害（C0，无预设反应）",
      sourceActionId: "rosaria.skill.ravaging_confession.second_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit, both Ravaging Confession hits, and Rites of Termination's first Cryo lance hit are verified as baseline C0 attack-scaling damage. The selected core metric isolates Ravaging Confession's second hit, reading the pinned 6.7 game-data snapshot's skill[1] coefficient (1.36 at talent level one and 2.448 at level ten) as one Cryo hit with no declared target aura, elemental application, or reaction. Its first same-cast hit remains a separate action rather than an implicit total. C6 Physical resistance reduction after a Rites of Termination hit is an explicit current-action snapshot. The burst excludes its same-cast second hit, subsequent damage over time, critical-rate sharing, reactions, timing, remaining passives, other constellations, positioning and teleport constraints, external effects, and character states. No infusion is modeled.",
  label: rosariaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
