import type { CharacterCombatCoverage } from "../../combat/types.js"

import { bennettDefinition } from "./definition.js"

export const BENNETT_BURST_FIELD_EFFECT_ID = "bennett.burst.field"

export const bennettCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Bennett",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "initial-hit-multiplier",
          id: "initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 2.328, talentLevel: 1 },
            { expectedCoefficient: 4.1904, talentLevel: 10 }
          ]
        }
      ],
      element: bennettDefinition.element,
      evaluator: "declared_direct",
      id: "bennett.burst.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "initial-hit-multiplier",
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
      characterId: "Bennett",
      element: bennettDefinition.element,
      id: BENNETT_BURST_FIELD_EFFECT_ID,
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
        },
        {
          groupId: "burst",
          id: "attack-bonus-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Bennett",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "passion-overload-press-damage",
          id: "passion-overload-press",
          snapshotChecks: [
            { expectedCoefficient: 1.376, talentLevel: 1 },
            { expectedCoefficient: 2.4768, talentLevel: 10 }
          ]
        }
      ],
      element: bennettDefinition.element,
      evaluator: "declared_direct",
      id: "bennett.skill.passion_overload.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "passion-overload-press-damage",
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
      characterId: "Bennett",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "passion-overload-hold-level-one-first-hit-damage",
          id: "passion-overload-hold-level-one-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.84, talentLevel: 1 },
            { expectedCoefficient: 1.512, talentLevel: 10 }
          ]
        }
      ],
      element: bennettDefinition.element,
      evaluator: "declared_direct",
      id: "bennett.skill.passion_overload.hold_level_one.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "passion-overload-hold-level-one-first-hit-damage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Bennett",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.44548, talentLevel: 1 },
            { expectedCoefficient: 0.8806, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "bennett.normal.auto.first_hit",
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
      talentSlot: "normal",
      timeline: {
        damageEvents: [
          {
            at: 0,
            damagePartId: "normal-attack-first-hit",
            elementalApplication: {
              activation: "while_element_overridden",
              icd: { groupId: "bennett.normal", kind: "standard" }
            },
            elementOverrideTarget: "normal_attack",
            id: "normal-attack-first-hit",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "bennett.burst.field.attack_bonus",
      label: "美妙旅程 · 领域基础加攻",
      requiredActiveEffectIds: [BENNETT_BURST_FIELD_EFFECT_ID],
      source: { characterId: "Bennett", kind: "character" },
      target: "flatAttack",
      value: {
        kind: "source_base_attack",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "burst",
            id: "attack-bonus-ratio",
            parameterIndex: 3,
            source: "talent",
            talentSlot: "burst"
          }
        }
      }
    },
    {
      activation: "active",
      id: "bennett.constellation.1.grand_expectation.field_attack_bonus",
      label: "冒险憧憬 · C1 领域追加20%基础攻击力",
      requiredActiveEffectIds: [BENNETT_BURST_FIELD_EFFECT_ID],
      source: { characterId: "Bennett", kind: "character", minimumSourceConstellation: 1 },
      target: "flatAttack",
      value: { kind: "source_base_attack", multiplier: { kind: "fixed", value: 0.2 } }
    },
    {
      activation: "active",
      id: "bennett.constellation.2.impasse_conqueror.energy_recharge",
      label: "踏破绝境 · C2 生命值低于70%时的元素充能效率",
      source: { characterId: "Bennett", kind: "character", minimumSourceConstellation: 2 },
      target: "energyRecharge",
      targetFilter: {
        actionIds: [
          "bennett.burst.initial_hit",
          "bennett.skill.passion_overload.press",
          "bennett.skill.passion_overload.hold_level_one.first_hit",
          "bennett.normal.auto.first_hit"
        ]
      },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "active",
      id: "bennett.constellation.6.pyro_infusion",
      label: "美妙旅程领域内 · C6 火元素伤害加成",
      requiredActiveEffectIds: [BENNETT_BURST_FIELD_EFFECT_ID],
      source: { characterId: "Bennett", kind: "character", minimumSourceConstellation: 6 },
      target: "damageBonus",
      targetFilter: { elements: ["pyro"] },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Bennett",
  effects: [
    {
      durationChecks: [
        { expectedCoefficient: 12, talentLevel: 1 },
        { expectedCoefficient: 12, talentLevel: 10 }
      ],
      durationParameter: {
        groupId: "burst",
        id: "inspiration-field-duration",
        parameterIndex: 4,
        source: "talent",
        talentSlot: "burst"
      },
      eligibleWeaponTypes: ["claymore", "polearm", "sword"],
      element: "pyro",
      id: "bennett.constellation.6.pyro_infusion",
      label: "美妙旅程领域内 · C6 普通攻击火元素附魔",
      minimumSourceConstellation: 6,
      requiredActiveEffectIds: ["bennett.burst.field"],
      sourceCharacterId: "Bennett",
      target: "normal_attack"
    }
  ],
  metrics: [
    {
      characterId: "Bennett",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "healing-flat",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 577.3388, talentLevel: 1 },
          { expectedValue: 1270.2417, talentLevel: 10 }
        ]
      },
      id: "bennett.burst.field.heal_tick",
      includeHealingBonus: true,
      kind: "healing",
      label: "美妙旅程 / 单跳治疗量",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "healing-percentage",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.06, talentLevel: 1 },
          { expectedValue: 0.108, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受治疗角色位于美妙旅程领域内" },
        {
          comparison: "at_most",
          kind: "recipient_hp_fraction",
          label: "受治疗角色当前生命值不高于 70%",
          threshold: 0.7
        }
      ],
      scalingStat: "hp",
      sourceActionId: "bennett.burst.field",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      affectedStat: "attack_flat",
      characterId: "Bennett",
      id: "bennett.burst.field.attack_buff",
      kind: "stat_buff",
      label: "美妙旅程 / 领域加攻值",
      ratioConstellationBonuses: [{ minimumConstellation: 1, value: 0.2 }],
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "attack-bonus-ratio",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.56, talentLevel: 1 },
          { expectedValue: 1.008, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        { kind: "recipient_in_source_area", label: "受益角色位于美妙旅程领域内" },
        {
          comparison: "above",
          kind: "recipient_hp_fraction",
          label: "受益角色当前生命值高于 70%（1 命解除）",
          threshold: 0.7,
          waivedAtSourceConstellation: 1
        }
      ],
      scalingStat: "base_attack",
      sourceActionId: "bennett.burst.field",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  scenarioEffectOptions: [
    {
      id: BENNETT_BURST_FIELD_EFFECT_ID,
      label: "班尼特领域"
    }
  ],
  detail:
    "The burst initial hit, one Passion Overload press hit, and a Level-one hold first hit are verified as baseline direct actions. One uninfused normal first hit is separately verified as baseline Physical damage. Long-press later hits and explosions remain unmodeled. C2's self-only 30% Energy Recharge below 70% HP is an explicit current-action snapshot; it is intentionally not inferred from a health timeline. The metric profile verifies Inspiration Field's one-tick healing and flat attack contribution, including source C1 and C5 changes plus selected-recipient eligibility. C6's field-gated Pyro infusion is implemented for currently declared eligible melee normal attacks through an explicit selected snapshot; its charged/plunging infusions and the 15% Pyro damage-bonus recipient rules remain unmodeled.",
  label: bennettDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
