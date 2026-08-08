import type { CharacterCombatCoverage } from "../../combat/types.js"

import { skirkDefinition } from "./definition.js"

export const skirkCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Skirk",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.54524, talentLevel: 1 },
            { expectedCoefficient: 1.0778, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "skirk.normal.auto.first_hit",
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
      attackKind: "normal",
      characterId: "Skirk",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "seven-phase-flash-normal-attack-fifth-hit-damage",
          id: "seven-phase-flash-normal-attack-fifth-hit",
          snapshotChecks: [
            { expectedCoefficient: 1.966244, talentLevel: 1 },
            { expectedCoefficient: 3.886761, talentLevel: 10 }
          ]
        }
      ],
      element: skirkDefinition.element,
      evaluator: "declared_direct",
      id: "skirk.skill.seven_phase_flash.normal.fifth_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "seven-phase-flash-normal-attack-fifth-hit-damage",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Skirk",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "havoc-ruin-slash-damage",
          id: "havoc-ruin-slash",
          snapshotChecks: [
            { expectedCoefficient: 1.2276, talentLevel: 1 },
            { expectedCoefficient: 2.20968, talentLevel: 10 }
          ]
        }
      ],
      element: skirkDefinition.element,
      evaluator: "declared_direct",
      id: "skirk.burst.havoc_ruin.slash",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "havoc-ruin-slash-damage",
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
  characterId: "Skirk",
  metrics: [
    {
      actionId: "skirk.skill.seven_phase_flash.normal.fifth_hit",
      characterId: "Skirk",
      id: "skirk.skill.seven_phase_flash.normal.fifth_hit",
      kind: "damage",
      label: "七相闪 / 第五段普攻（C0、无反应）",
      sourceActionId: "skirk.skill.seven_phase_flash.normal.fifth_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One first normal-attack hit and one Havoc: Ruin slash remain verified raw actions. The selected C0 core hit is one fifth normal-attack hit while Seven-Phase Flash is already active: Attack × skill[6], or 196.6244% Attack at Skill Level 1 and 388.6761% at Level 10 in the pinned 6.7 snapshot. It is a fixed source-action state, not a state-generation or attack sequence model. Per the locked metric boundary, it declares no target aura, Melt, Freeze, or other fixed reaction. Serpent's Subtlety generation and consumption, Void Rift absorption, A4 stacks, the final slash, other Seven-Phase Flash hits, passives, constellations, external effects, timing, and rotation behavior remain excluded.",
  label: skirkDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
