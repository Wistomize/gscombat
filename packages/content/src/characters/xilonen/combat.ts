import type { CharacterCombatCoverage } from "../../combat/types.js"

import { xilonenDefinition } from "./definition.js"

export const xilonenCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Xilonen",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.517918, talentLevel: 1 },
            { expectedCoefficient: 1.023791, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "xilonen.normal.auto.first_hit",
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
      characterId: "Xilonen",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "yohuals-scratch-dash-damage",
          id: "yohuals-scratch-dash",
          snapshotChecks: [
            { expectedCoefficient: 1.792, talentLevel: 1 },
            { expectedCoefficient: 3.2256, talentLevel: 10 }
          ]
        }
      ],
      element: xilonenDefinition.element,
      evaluator: "declared_direct",
      id: "xilonen.skill.yohuals_scratch.dash",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "yohuals-scratch-dash-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "defense",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Xilonen",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "ocelotlicues-ode-initial-hit-damage",
          id: "ocelotlicues-ode-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 2.8128, talentLevel: 1 },
            { expectedCoefficient: 5.06304, talentLevel: 10 }
          ]
        }
      ],
      element: xilonenDefinition.element,
      evaluator: "declared_direct",
      id: "xilonen.burst.ocelotlicues_ode.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "ocelotlicues-ode-initial-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "defense",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Xilonen",
      element: xilonenDefinition.element,
      id: "xilonen.skill.source_samples.active",
      kind: "support",
      parameterReferences: [
        {
          groupId: "skill",
          id: "source-sample-resistance-reduction",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Xilonen",
      element: xilonenDefinition.element,
      id: "xilonen.burst.healing_rhythm",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "healing-flat",
          parameterIndex: 2,
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
      condition: { kind: "team_nightsoul_burst", minimumTriggers: 1 },
      id: "xilonen.passive.portable_armored_sheath.after_nightsoul_burst.defense_percent",
      label: "固有天赋 · 便携铠装层（夜魂迸发后15秒，防御力提高）",
      source: { characterId: "Xilonen", kind: "character", minimumSourceAscension: 4 },
      target: "defensePercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "automatic",
      condition: {
        elements: ["pyro", "hydro", "cryo", "electro"],
        kind: "team_element_count",
        minimum: 2
      },
      id: "xilonen.skill.source-samples.resistance-reduction",
      label: "源音采样 · 对应元素抗性降低",
      source: { characterId: "Xilonen", kind: "character" },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["pyro", "hydro", "cryo", "electro", "geo"] },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "skill",
          id: "source-sample-resistance-reduction",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      }
    },
    {
      activation: "maximum_reachable",
      condition: {
        elements: ["pyro", "hydro", "cryo", "electro"],
        kind: "team_element_count",
        minimum: 2
      },
      id: "xilonen.constellation.2.cryo.crit_damage",
      label: "献予灼原的五重奏 · C2 冰元素原音采样（暴击伤害提高60%）",
      source: { characterId: "Xilonen", kind: "character", minimumSourceConstellation: 2 },
      target: "critDamage",
      targetFilter: { elements: ["cryo"] },
      value: { kind: "fixed", value: 0.6 }
    }
  ],
  characterId: "Xilonen",
  metrics: [
    {
      characterId: "Xilonen",
      flatParameter: {
        reference: {
          groupId: "skill",
          id: "source-sample-resistance-reduction",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.09, talentLevel: 1 },
          { expectedValue: 0.36, talentLevel: 10 }
        ]
      },
      id: "xilonen.skill.source_samples.resistance_reduction",
      kind: "scalar",
      label: "源音采样 / 对应元素抗性降低",
      semantic: "resistance_reduction",
      sourceActionId: "xilonen.skill.source_samples.active",
      status: "verified",
      target: "enemy",
      unit: "ratio"
    },
    {
      characterId: "Xilonen",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 500.73764, talentLevel: 1 },
          { expectedValue: 1101.7063, talentLevel: 10 }
        ]
      },
      id: "xilonen.burst.healing_rhythm.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "豹烈律动 / 单次持续治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1.04, talentLevel: 1 },
          { expectedValue: 1.872, talentLevel: 10 }
        ]
      },
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "受治疗角色位于欢兴律动范围内" }],
      scalingStat: "defense",
      sourceActionId: "xilonen.burst.healing_rhythm",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "The selected support profile verifies active Source Sample resistance reduction, C2's 60% Cryo Crit DMG sample, and one healing-rhythm tick, including C3/C5 talent levels and recipient context. Portable Armored Sheath automatically adds 20% Defense after a party-reachable Nightsoul Burst, and Xilonen's independent 14-second trigger contributes to other characters' maximum reachable Nightsoul Burst stacks. One first normal hit, skill dash, and burst initial Geo hit remain verified baseline damage actions. No infusion is modeled; additional beats, other C2 branches, C4/C6 effects, reactions, and rotation timing remain unmodeled.",
  label: xilonenDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
