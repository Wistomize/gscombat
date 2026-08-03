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
    "One first normal-attack hit and Mirror Reflection of Doom's Phantom tick remain verified lower-level C0 Hydro damage actions from the pinned 6.7 Genshin Optimizer snapshot at commit 21c98eb60355160274a8c4cecfc5671e2151a073, but neither is a selected support output. Stellaris Phantasm's Omen exposes its burst[6] corresponding damage bonus for any selected friendly recipient while the enemy remains affected; C3 adds three Burst levels. The metric does not convert that bonus into another character's damage. C4 can be selected as an explicit current-action snapshot after the user confirms the target is still affected by Omen: Mona and teammates gain 15% Crit Rate when attacking that target. It does not infer Omen application, the target, duration, timing, or a rotation. It excludes Illusory Bubble rupture, Omen duration and Hydro application, Phantom taunt/recurrence/end explosion, alternate-sprint Phantom behavior, Waterborne Destiny's Energy-Recharge-to-Hydro bonus, locked Hexerei states, external infusions, other constellations, and character states.",
  label: monaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
