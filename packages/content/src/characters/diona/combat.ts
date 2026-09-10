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
          id: "signature-mix-healing-hp-ratio",
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
  actionEffects: [
    {
      activation: "active",
      id: "diona.constellation.6.cat_tail_closing_time.high_hp.elemental_mastery",
      label: "猫尾酒馆打烊之时 · C6 最烈特调领域内生命值高于50%（元素精通提高200）",
      source: { characterId: "Diona", kind: "character", minimumSourceConstellation: 6 },
      target: "elementalMastery",
      value: { kind: "fixed", value: 200 }
    },
    {
      activation: "active",
      id: "diona.constellation.6.cat_tail_closing_time.superconduct_damage_bonus",
      label: "猫尾酒馆打烊之时 · C6 最烈特调领域内·辉映：星超导（超导反应伤害提高40%）",
      source: { characterId: "Diona", kind: "character", minimumSourceConstellation: 6 },
      target: "reactionDamageBonus",
      targetFilter: { reactionKinds: ["superconduct"] },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "active",
      id: "diona.constellation.6.cat_tail_closing_time.cryo_swirl_damage_bonus",
      label: "猫尾酒馆打烊之时 · C6 最烈特调领域内·辉映：星扩散（冰元素扩散反应伤害提高40%）",
      source: { characterId: "Diona", kind: "character", minimumSourceConstellation: 6 },
      target: "reactionDamageBonus",
      targetFilter: { elements: ["cryo"], reactionKinds: ["swirl"] },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "active",
      id: "diona.constellation.6.cat_tail_closing_time.stellar_superconduct_damage_bonus",
      label: "猫尾酒馆打烊之时 · C6 最烈特调领域内·辉映：星超导（星超导反应伤害提高40%）",
      source: { characterId: "Diona", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_superconduct"] },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "active",
      id: "diona.constellation.6.cat_tail_closing_time.stellar_swirl_damage_bonus",
      label: "猫尾酒馆打烊之时 · C6 最烈特调领域内·辉映：星扩散（星扩散反应伤害提高40%）",
      source: { characterId: "Diona", kind: "character", minimumSourceConstellation: 6 },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_swirl"] },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "automatic",
      id: "diona.constellation.6.cat_tail_closing_time.self_hp_percent",
      label: "猫尾酒馆打烊之时 · C6 迪奥娜生命值上限提高25%",
      source: { characterId: "Diona", kind: "character", minimumSourceConstellation: 6 },
      target: "hpPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.25 }
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
      shieldAbsorptionMultipliers: [
        { label: "猫爪冰摇 · C2 猫爪冻冻整体伤害吸收量提高15%", minimumSourceConstellation: 2, value: 1.15 }
      ],
      label: "猫爪冻冻 / 点按基础护盾吸收量（非冰元素伤害）",
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
          id: "signature-mix-healing-hp-ratio",
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
      recipientIncomingHealingBonuses: [
        {
          label: "猫尾酒馆打烊之时 · C6 生命值不高于50%时受治疗加成",
          minimumSourceConstellation: 6,
          recipientRequirement: {
            comparison: "at_most",
            kind: "recipient_hp_fraction",
            label: "受治疗角色当前生命值不高于50%",
            threshold: 0.5
          },
          value: 0.3
        }
      ],
      scalingStat: "hp",
      sourceActionId: "diona.burst.signature_mix.heal_tick",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "The selected support metrics calculate one point-press Icy Paws shield and one Signature Mix field healing tick. The non-Cryo shield starts from max HP × skill[1] plus skill[2]; C2 multiplies that entire base absorption by 1.15 before recipient Shield Strength, and C5 adds three Skill levels. Healing uses max HP × burst[2] plus burst[3], followed by source Healing Bonus and recipient Incoming Healing Bonus; C3 adds three Burst levels. At C6, a field recipient at or below 50% HP gains 30% Incoming Healing Bonus, while the above-50% branch exposes 200 Elemental Mastery. C6's automatic 25% Max-HP increase participates in both support source panels. Its Radiance states expose 40% Superconduct/Stellar-Superconduct or Cryo-Swirl/Stellar-Swirl reaction bonuses. The selected shield excludes hold-only 75% absorption, the separate co-op shield, and the 250% Cryo-absorption branch. Lower-level attack-scaling Icy Paws and Burst damage remain separate from these support metrics. Tick counts, duration, movement, enemy attack reduction, and full rotations are not inferred.",
  label: dionaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
