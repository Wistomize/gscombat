import type { CharacterCombatCoverage } from "../../combat/types.js"

import { monaDefinition } from "./definition.js"

export const monaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Mona",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.376, talentLevel: 1 },
            { expectedCoefficient: 0.6768, talentLevel: 10 }
          ]
        }
      ],
      element: monaDefinition.element,
      evaluator: "declared_direct",
      id: "mona.normal.auto.first_hit",
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
      characterId: "Mona",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "mirror-reflection-of-doom-continuous-damage",
          id: "phantom-continuous-damage-tick",
          snapshotChecks: [
            { expectedCoefficient: 0.32, talentLevel: 1 },
            { expectedCoefficient: 0.576, talentLevel: 10 }
          ]
        }
      ],
      element: monaDefinition.element,
      evaluator: "declared_direct",
      id: "mona.skill.mirror_reflection_of_doom.phantom.tick",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "mirror-reflection-of-doom-continuous-damage",
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
      characterId: "Mona",
      element: monaDefinition.element,
      id: "mona.burst.stellaris_phantasm.omen",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "omen-damage-bonus",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      condition: { kind: "hexerei_secret_rite" },
      id: "mona.locked_passive.true_origin_of_astral_steps.three_mercurial_radiance_stacks.vaporize_bonus",
      label: "魔女的前夜礼·天步真原 · 3层水星天的辉光蒸发伤害提升",
      source: { characterId: "Mona", kind: "character" },
      target: "amplifyingReactionBonus",
      targetFilter: {
        amplifyingReactionKinds: ["vaporize_forward", "vaporize_reverse"],
        recipientSourceRelation: "not_source"
      },
      value: { kind: "fixed", value: 0.15 }
    },
    {
      activation: "maximum_reachable",
      id: "mona.burst.stellaris_phantasm.omen.damage_bonus",
      label: "星命定轨 · 星异伤害加成",
      source: { characterId: "Mona", kind: "character" },
      target: "damageBonus",
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "burst",
          id: "omen-damage-bonus",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        }
      }
    },
    {
      activation: "active",
      id: "mona.constellation.4.prophecy_of_oblivion.omen_target.crit_rate",
      label: "灭绝的预言 · C4 目标仍处于星异状态时队伍攻击暴击率 +15%",
      source: { characterId: "Mona", kind: "character", minimumSourceConstellation: 4 },
      target: "critRate",
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Mona",
  metrics: [
    {
      characterId: "Mona",
      id: "mona.burst.stellaris_phantasm.omen.damage_bonus",
      kind: "scalar",
      label: "星命定轨 / 星异伤害加成",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "omen-damage-bonus",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.42, talentLevel: 1 },
          { expectedValue: 0.6, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      semantic: "damage_bonus",
      sourceActionId: "mona.burst.stellaris_phantasm.omen",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    }
  ],
  detail:
    "Stellaris Phantasm's Omen remains the selected support metric. True Origin of Astral Steps contributes the maximum three Mercurial Radiance stacks as 15% Vaporize reaction bonus to another party member under Hexerei: Secret Rite. Omen extension changes duration rather than the selected hit amount; Bubble rupture, timing, and other character states remain unmodeled.",
  label: monaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
