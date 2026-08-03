import type { CharacterCombatCoverage } from "../../combat/types.js"

import { dionaDefinition } from "./definition.js"

export const dionaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Diona",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "icy-paws-paw-damage",
          id: "icy-paws-paw-damage",
          snapshotChecks: [
            { expectedCoefficient: 0.4192, talentLevel: 1 },
            { expectedCoefficient: 0.75456, talentLevel: 10 }
          ]
        }
      ],
      element: dionaDefinition.element,
      evaluator: "declared_direct",
      id: "diona.skill.icy_paws.paw_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "icy-paws-paw-damage",
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
      characterId: "Diona",
      element: dionaDefinition.element,
      id: "diona.skill.icy_paws.press_shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "icy-paws-point-press-shield-hp-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "icy-paws-point-press-shield-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Diona",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "signature-mix-skill-damage",
          id: "signature-mix-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 0.8, talentLevel: 1 },
            { expectedCoefficient: 1.44, talentLevel: 10 }
          ]
        }
      ],
      element: dionaDefinition.element,
      evaluator: "declared_direct",
      id: "diona.burst.signature_mix.initial_aoe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "signature-mix-skill-damage",
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
      characterId: "Diona",
      element: dionaDefinition.element,
      id: "diona.burst.signature_mix.heal_tick",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "signature-mix-healing-attack-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "signature-mix-healing-flat",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    }
  ],
  characterId: "Diona",
  metrics: [
    {
      characterId: "Diona",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "icy-paws-point-press-shield-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 692.8066, talentLevel: 1 },
          { expectedValue: 1524.29, talentLevel: 10 }
        ]
      },
      id: "diona.skill.icy_paws.press.base_absorption",
      kind: "scalar",
      label: "猫爪冻冻 / 点按基础护盾吸收量（C0、非冰元素伤害）",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "icy-paws-point-press-shield-hp-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.072, talentLevel: 1 },
          { expectedValue: 0.1296, talentLevel: 10 }
        ]
      },
      scalingStat: "hp",
      semantic: "shield",
      sourceActionId: "diona.skill.icy_paws.press_shield",
      status: "verified",
      recipientRequirements: [],
      target: "friendly_recipient",
      unit: "hp"
    },
    {
      characterId: "Diona",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "signature-mix-healing-flat",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 513.19006, talentLevel: 1 },
          { expectedValue: 1129.1038, talentLevel: 10 }
        ]
      },
      id: "diona.burst.signature_mix.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "最烈特调 / 领域单跳治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "signature-mix-healing-attack-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.05336, talentLevel: 1 },
          { expectedValue: 0.096048, talentLevel: 10 }
        ]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "受治疗角色位于最烈特调领域内" }],
      scalingStat: "attack",
      sourceActionId: "diona.burst.signature_mix.heal_tick",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One Icy Paws hit and Signature Mix's initial Cryo AoE remain verified baseline C0 attack-scaling direct actions for lower-level calculation, but neither is a selected Diona metric because they do not represent her support output. The selected metrics calculate the C0 point-press Icy Paws shield applied to the current active party member and one Signature Mix field healing tick. Non-Cryo base shield absorption is Diona's max HP × skill[1] plus skill[2], before Shield Strength; C3 adds three Skill levels. One field healing tick for a recipient in the field is Diona's Attack × burst[2] plus burst[3], then Diona's Healing Bonus and that recipient's Incoming Healing Bonus; C5 adds three Burst levels. The shield metric excludes the hold-only 75% whole-shield multiplier, C2's 15% whole-shield multiplier and its separate 50% co-op shield, and the 250% Cryo-damage absorption branch. The healing metric excludes tick count, C6's recipient-HP-dependent Healing Bonus, timing, and target routing. Diona's A1 movement and stamina effect and A4 burst enemy-attack reduction do not change these selected values. Remaining passives, constellations, external effects, and state changes remain unmodeled.",
  label: dionaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
