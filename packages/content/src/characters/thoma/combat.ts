import type { CharacterCombatCoverage } from "../../combat/types.js"

import { thomaDefinition } from "./definition.js"

export const thomaCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Thoma",
      element: thomaDefinition.element,
      id: "thoma.skill.blazing_blessing.blazing_barrier",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "blazing-barrier-initial-shield-hp-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "blazing-barrier-initial-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Thoma",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "blazing-blessing-initial-kick-damage",
          id: "blazing-blessing-initial-kick",
          snapshotChecks: [
            { expectedCoefficient: 1.464, talentLevel: 1 },
            { expectedCoefficient: 2.6352, talentLevel: 10 }
          ]
        }
      ],
      element: thomaDefinition.element,
      evaluator: "declared_direct",
      id: "thoma.skill.blazing_blessing.initial_kick",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "blazing-blessing-initial-kick-damage",
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
      characterId: "Thoma",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "crimson-ooyoroi-skill-damage",
          id: "crimson-ooyoroi-initial-sweep",
          snapshotChecks: [
            { expectedCoefficient: 0.88, talentLevel: 1 },
            { expectedCoefficient: 1.584, talentLevel: 10 }
          ]
        }
      ],
      element: thomaDefinition.element,
      evaluator: "declared_direct",
      id: "thoma.burst.crimson_ooyoroi.initial_sweep",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "crimson-ooyoroi-skill-damage",
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
  actionEffects: [
    {
      activation: "active",
      id: "thoma.constellation.6.burning_heart.normal_charged_plunge_damage_bonus",
      label: "炽烧的至心 · C6 获取或刷新烈烧佑命护盾后普通、重击与下落攻击伤害加成",
      source: { characterId: "Thoma", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: { attackKinds: ["normal", "charged", "plunge"] },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Thoma",
  metrics: [
    {
      characterId: "Thoma",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "blazing-barrier-initial-shield-flat-absorption",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 693.33484, talentLevel: 1 },
          { expectedValue: 1525.4523, talentLevel: 10 }
        ]
      },
      id: "thoma.skill.blazing_blessing.blazing_barrier.initial_absorption",
      kind: "scalar",
      label: "烈烧佑命之侍护 / 烈烧佑命基础护盾吸收量（C0、非火元素伤害）",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "blazing-barrier-initial-shield-hp-ratio",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.072, talentLevel: 1 },
          { expectedValue: 0.1296, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "hp",
      semantic: "shield",
      sourceActionId: "thoma.skill.blazing_blessing.blazing_barrier",
      status: "verified",
      target: "friendly_recipient",
      unit: "hp"
    }
  ],
  detail: [
    "Blazing Blessing's initial kick and Crimson Ooyoroi's initial sweep remain verified baseline C0 attack-scaling Pyro",
    "actions for lower-level calculation, but neither is selected as a display metric: Thoma's role-correct output here is",
    "his shield. The selected support metric calculates one initial Blazing Barrier's non-Pyro base absorption on the",
    "current active friendly recipient as Thoma's max HP × skill[1] plus skill[2], before that recipient's Shield",
    "Strength; C3 adds three Skill levels. C6 can be selected as an explicit current-action snapshot after a Blazing",
    "Barrier is obtained or refreshed: Thoma and teammates gain 15% damage bonus only for normal, charged, and plunge",
    "actions. It does not infer the shield trigger, duration, refresh, stacking, maximum absorption, or timing. It",
    "excludes the 250% Pyro-damage absorption branch, self-Pyro application, A1's stacking increase, C1/C2/C4, all",
    "damage actions and reactions outside that selected snapshot, external effects, and other character states."
  ].join(" "),
  label: thomaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
