import type { CharacterCombatCoverage } from "../../combat/types.js"

import { chioriDefinition } from "./definition.js"

export const chioriCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Chiori",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.494104, talentLevel: 1 },
            { expectedCoefficient: 0.976718, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "chiori.normal.auto.first_hit",
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
      characterId: "Chiori",
      damageKind: "direct",
      damageParts: [
        {
          id: "tamoto-attack",
          scalingTerms: [
            {
              coefficientParameterId: "tamoto-attack-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 0.8208, talentLevel: 1 },
                { expectedCoefficient: 1.47744, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "tamoto-attack-defense-ratio",
              snapshotChecks: [
                { expectedCoefficient: 1.026, talentLevel: 1 },
                { expectedCoefficient: 1.8468, talentLevel: 10 }
              ],
              stat: "defense"
            }
          ]
        }
      ],
      element: chioriDefinition.element,
      evaluator: "declared_direct",
      id: "chiori.skill.fluttering_hasode.tamoto_attack",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "tamoto-attack-attack-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "tamoto-attack-defense-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Chiori",
      damageKind: "direct",
      damageParts: [
        {
          id: "hiyoku-twin-blades",
          scalingTerms: [
            {
              coefficientParameterId: "hiyoku-twin-blades-attack-ratio",
              snapshotChecks: [
                { expectedCoefficient: 2.5632, talentLevel: 1 },
                { expectedCoefficient: 4.61376, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientParameterId: "hiyoku-twin-blades-defense-ratio",
              snapshotChecks: [
                { expectedCoefficient: 3.204, talentLevel: 1 },
                { expectedCoefficient: 5.7672, talentLevel: 10 }
              ],
              stat: "defense"
            }
          ]
        }
      ],
      element: chioriDefinition.element,
      evaluator: "declared_direct",
      id: "chiori.burst.hiyoku_twin_blades",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "hiyoku-twin-blades-attack-ratio",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "hiyoku-twin-blades-defense-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Chiori",
  metrics: [
    {
      actionId: "chiori.skill.fluttering_hasode.tamoto_attack",
      characterId: "Chiori",
      id: "chiori.skill.fluttering_hasode.single_tamoto_attack",
      kind: "damage",
      label: "羽袖一触 / 单个「袖」单次攻击",
      sourceActionId: "chiori.skill.fluttering_hasode.tamoto_attack",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "chiori.skill.fluttering_hasode.tamoto_attack",
      characterId: "Chiori",
      id: "chiori.skill.fluttering_hasode.coordinated_tamoto_attack",
      kind: "damage",
      label: "羽袖一触 / 单次协同攻击",
      sourceActionId: "chiori.skill.fluttering_hasode.tamoto_attack",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "chiori.burst.hiyoku_twin_blades",
      characterId: "Chiori",
      id: "chiori.burst.hiyoku_twin_blades",
      kind: "damage",
      label: "二刀之形·比翼 / 技能伤害",
      sourceActionId: "chiori.burst.hiyoku_twin_blades",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "The selected profile verifies one dual-scaling Tamoto attack, its same-damage coordinated trigger, and Hiyoku: Twin Blades. Tamoto count still depends on Geo constructs and constellations; timing, passives, reactions, infusion, and character states remain in progress.",
  label: chioriDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
