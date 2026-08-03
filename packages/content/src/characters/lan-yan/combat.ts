import type { CharacterCombatCoverage } from "../../combat/types.js"

import { lanYanDefinition } from "./definition.js"

export const lanYanCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "LanYan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "lustrous-moonrise-damage",
          id: "lustrous-moonrise",
          snapshotChecks: [
            { expectedCoefficient: 2.41064, talentLevel: 1 },
            { expectedCoefficient: 4.339152, talentLevel: 10 }
          ]
        }
      ],
      element: lanYanDefinition.element,
      evaluator: "declared_direct",
      id: "lan_yan.burst.lustrous_moonrise",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "lustrous-moonrise-damage",
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
      characterId: "LanYan",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "swallow-wisp-pinion-feathermoon-ring-damage",
          id: "feathermoon-ring-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.96256, talentLevel: 1 },
            { expectedCoefficient: 1.732608, talentLevel: 10 }
          ]
        }
      ],
      element: lanYanDefinition.element,
      evaluator: "declared_direct",
      id: "lan_yan.skill.swallow_wisp_pinion.feathermoon_ring.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "swallow-wisp-pinion-feathermoon-ring-damage",
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
      characterId: "LanYan",
      element: lanYanDefinition.element,
      id: "lan_yan.skill.swallow_wisp_pinion.shield",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "swallow-wisp-pinion-shield-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "swallow-wisp-pinion-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    }
  ],
  characterId: "LanYan",
  metrics: [
    {
      characterId: "LanYan",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "swallow-wisp-pinion-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 1155.5629, talentLevel: 1 },
          { expectedValue: 2542.4312, talentLevel: 10 }
        ]
      },
      id: "lan_yan.skill.swallow_wisp_pinion.shield.initial_absorption",
      kind: "scalar",
      label: "凤缕随翦舞 / 翦月环护盾基础吸收量（C0、非风元素伤害）",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "swallow-wisp-pinion-shield-attack-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 2.7648, talentLevel: 1 },
          { expectedValue: 4.97664, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "attack",
      semantic: "shield",
      sourceActionId: "lan_yan.skill.swallow_wisp_pinion.shield",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    }
  ],
  detail:
    "One Lustrous Moonrise hit and one outgoing Feathermoon Ring first hit remain verified lower-level actions from the pinned 6.7 game-data snapshot at Genshin Optimizer commit 21c98eb60355160274a8c4cecfc5671e2151a073, but neither is a selected display metric because Lan Yan's role-correct output here is her shield. The selected C0 support metric calculates one Swallow-Wisp Pinion shield delivered to the current active friendly recipient as total Attack × skill[1] plus skill[2], before that recipient's Shield Strength; C3 adds three Skill levels. It excludes the 250% Anemo-damage absorption branch, duration, self-Anemo application, C2 shield restoration, ring damage and return/bounce behavior, absorbed-element damage, burst hits, passives, other constellations, reactions, external effects, timing, and other character states.",
  label: lanYanDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
