import type { CharacterCombatCoverage } from "../../combat/types.js"

import { xinyanDefinition } from "./definition.js"

export const xinyanCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Xinyan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sweeping-fervor-swing-damage",
          id: "sweeping-fervor-swing-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.696, talentLevel: 1 },
            { expectedCoefficient: 3.0528, talentLevel: 10 }
          ]
        }
      ],
      element: xinyanDefinition.element,
      evaluator: "declared_direct",
      id: "xinyan.skill.sweeping_fervor.swing",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "sweeping-fervor-swing-damage",
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
      characterId: "Xinyan",
      element: xinyanDefinition.element,
      id: "xinyan.skill.sweeping_fervor.level_three_shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "sweeping-fervor-level-three-shield-defense-ratio",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "sweeping-fervor-level-three-shield-flat-absorption",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Xinyan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "riff-revolution-skill-damage",
          id: "riff-revolution-initial-strum",
          snapshotChecks: [
            { expectedCoefficient: 3.408, talentLevel: 1 },
            { expectedCoefficient: 6.1344, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "xinyan.burst.riff_revolution.initial_strum",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "riff-revolution-skill-damage",
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
      characterId: "Xinyan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.7654, talentLevel: 1 },
            { expectedCoefficient: 1.513, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "xinyan.normal.auto.first_hit",
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
    }
  ],
  actionEffects: [
    {
      activation: "automatic",
      id: "xinyan.constellation.2.impromptu_opening.initial_strum.crit_rate",
      label: "C2 · 开场即兴段：叛逆刮弦初段物理伤害暴击率 +100%",
      source: { characterId: "Xinyan", kind: "character", minimumSourceConstellation: 2 },
      target: "critRate",
      targetFilter: {
        actionIds: ["xinyan.burst.riff_revolution.initial_strum"],
        elements: ["physical"]
      },
      value: { kind: "fixed", value: 1 }
    },
    {
      activation: "active",
      id: "xinyan.constellation.4.wildfire_rhythm.sweeping_fervor.physical_resistance_reduction",
      label: "节奏的传染 · C4 热情拂扫已命中目标（物理抗性降低 15%，12秒）",
      source: { characterId: "Xinyan", kind: "character", minimumSourceConstellation: 4 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["physical"] },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Xinyan",
  metrics: [
    {
      actionId: "xinyan.burst.riff_revolution.initial_strum",
      characterId: "Xinyan",
      id: "xinyan.burst.riff_revolution.initial_strum",
      kind: "damage",
      label: "叛逆刮弦 / 开场单次物理命中（C0，无反应）",
      sourceActionId: "xinyan.burst.riff_revolution.initial_strum",
      status: "verified",
      target: "enemy"
    },
    {
      characterId: "Xinyan",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "sweeping-fervor-level-three-shield-flat-absorption",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 692.8066, talentLevel: 1 },
          { expectedValue: 1524.29, talentLevel: 10 }
        ]
      },
      id: "xinyan.skill.sweeping_fervor.level_three_shield.base_absorption",
      kind: "scalar",
      label: "热情拂扫 / 三级护盾基础吸收量（C0、非火元素伤害）",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "sweeping-fervor-level-three-shield-defense-ratio",
          parameterIndex: 5,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 1.44, talentLevel: 1 },
          { expectedValue: 2.592, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "defense",
      semantic: "shield",
      sourceActionId: "xinyan.skill.sweeping_fervor.level_three_shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    }
  ],
  detail:
    "Xinyan remains a hybrid profile: Sweeping Fervor's swing, Riff Revolution's opening Physical strum, and one uninfused normal first hit are verified lower-level actions, while the selected burst metric retains one C0 Physical opening strum against one enemy. The selected shield metric calculates the level-three Sweeping Fervor shield created by hitting three or more enemies: non-Pyro base absorption is Xinyan's Defense × skill[5] plus skill[6], before the recipient's Shield Strength; C3 adds three Skill levels. The 250% Pyro-damage absorption branch is deliberately not merged into this non-Pyro base value. C2 automatically adds 100% Crit Rate only to Riff Revolution's opening Physical strum; the calculator clamps its final expected Crit Rate to 100%. C4 can be selected as an explicit current-action snapshot after the user confirms Sweeping Fervor hit the target and its Physical Resistance reduction remains active: the target's Physical Resistance is reduced by 15%. It does not infer the hit, target, 12-second duration, timing, or a rotation. It excludes the separate level-one and level-two shields, level-three periodic Pyro damage, target count; C2's burst-created level-three shield; C5's Burst-level increase; C6; elemental infusions, reactions, passives, external effects, and other character states.",
  label: xinyanDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
