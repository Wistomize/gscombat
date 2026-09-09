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
      scalingStat: "attack",
      sourceActionId: "diona.burst.signature_mix.heal_tick",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "One Icy Paws hit and Signature Mix's initial Cryo AoE remain verified lower-level attack-scaling direct actions, but neither is a selected Diona metric because they do not represent her support output. The selected metrics calculate the point-press Icy Paws shield applied to the current active party member and one Signature Mix field healing tick. Non-Cryo base shield absorption is Diona's max HP × skill[1] plus skill[2], before Shield Strength; C3 adds three Skill levels. One field healing tick for a recipient in the field is Diona's Attack × burst[2] plus burst[3], then Diona's Healing Bonus and that recipient's Incoming Healing Bonus; C5 adds three Burst levels. At C6, a recipient at or below 50% HP gains the declared 30% Incoming Healing Bonus, while the above-50%-HP branch exposes 200 Elemental Mastery. C6 also automatically grants Diona 25% maximum HP. Its Radiance: Stellar-Conduct state exposes 40% Superconduct and Stellar-Superconduct reaction bonuses, while Radiance: Stellar-Swirl exposes 40% Cryo-Swirl and Stellar-Swirl reaction bonuses; the Cryo-Swirl branch is restricted by both the declared Swirl kind and its Cryo damage element. The shield metric excludes the hold-only 75% whole-shield multiplier, C2's 15% whole-shield multiplier and its separate 50% co-op shield, and the 250% Cryo-damage absorption branch. The healing metric excludes tick count and timing. Diona's A1 movement and stamina effect and A4 burst enemy-attack reduction do not change these selected values. Remaining passives, external effects, and state changes remain unmodeled.",
  label: dionaDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
