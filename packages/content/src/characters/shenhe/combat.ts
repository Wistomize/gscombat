import type { CharacterCombatCoverage } from "../../combat/types.js"

import { shenheDefinition } from "./definition.js"

export const shenheCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Shenhe",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "spring-spirit-summoning-press-damage",
          id: "spring-spirit-summoning-press-damage",
          snapshotChecks: [
            { expectedCoefficient: 1.392, talentLevel: 1 },
            { expectedCoefficient: 2.5056, talentLevel: 10 }
          ]
        }
      ],
      element: shenheDefinition.element,
      evaluator: "declared_direct",
      id: "shenhe.skill.spring_spirit_summoning.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "spring-spirit-summoning-press-damage",
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
      characterId: "Shenhe",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "divine-maidens-deliverance-initial-aoe-damage",
          id: "divine-maidens-deliverance-initial-aoe",
          snapshotChecks: [
            { expectedCoefficient: 1.008, talentLevel: 1 },
            { expectedCoefficient: 1.8144, talentLevel: 10 }
          ]
        }
      ],
      element: shenheDefinition.element,
      evaluator: "declared_direct",
      id: "shenhe.burst.divine_maidens_deliverance.initial_aoe",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "divine-maidens-deliverance-initial-aoe-damage",
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
      characterId: "Shenhe",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.43258, talentLevel: 1 },
            { expectedCoefficient: 0.8551, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "shenhe.normal.auto.first_hit",
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
      activation: "maximum_reachable",
      id: "shenhe.skill.spring_spirit_summoning.icy_quill.single_cryo_flat_damage_increase",
      label: "冰翎 · 单次冰元素伤害增加值",
      source: { characterId: "Shenhe", kind: "character" },
      target: "baseDamageFlat",
      targetFilter: {
        elements: ["cryo"],
        talentSlots: ["normal", "skill", "burst"]
      },
      value: {
        kind: "source_final_attack",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "skill",
            id: "icy-quill-damage-increase",
            parameterIndex: 2,
            source: "talent",
            talentSlot: "skill"
          }
        }
      }
    },
    {
      activation: "active",
      id: "shenhe.divine_maidens_deliverance.c2.current_character.cryo_damage_bonus",
      label: "神女遣灵真诀领域内 · C2 当前场上角色冰元素伤害加成",
      source: { characterId: "Shenhe", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: { elements: ["cryo"] },
      value: { kind: "fixed", value: 0.15 }
    }
  ],
  characterId: "Shenhe",
  metrics: [
    {
      affectedElement: "cryo",
      appliesTo: ["normal", "charged", "plunge", "skill", "burst"],
      characterId: "Shenhe",
      id: "shenhe.skill.spring_spirit_summoning.icy_quill.single_cryo_flat_damage_increase",
      kind: "scalar",
      label: "仰灵威召将役咒 / 冰翎单次冰元素伤害增加值",
      ratioParameter: {
        reference: {
          groupId: "skill",
          id: "icy-quill-damage-increase",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        },
        snapshotChecks: [
          { expectedValue: 0.45656, talentLevel: 1 },
          { expectedValue: 0.821808, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      scalingStat: "attack",
      semantic: "elemental_flat_damage_bonus",
      sourceActionId: "shenhe.skill.spring_spirit_summoning.press",
      status: "verified",
      target: "friendly_recipient",
      unit: "damage"
    }
  ],
  detail:
    "Spring Spirit Summoning's press damage and Divine Maiden's Deliverance initial AoE are verified as baseline C0 attack-scaling Cryo hits. One uninfused normal first hit is separately verified as baseline Physical damage. Icy Quill's one-hit raw Cryo flat-damage increase is verified independently as Shenhe's attack × skill[2] for normal, charged, plunge, skill, and burst damage; it does not convert into any recipient's final damage. The burst excludes field resistance reduction and later damage over time. C2 can be selected as an explicit current-action snapshot while Divine Maiden's Deliverance's field is already active: the current on-field Cryo action gains 15% Cryo Damage Bonus. It does not infer the burst cast, field existence, duration extension, recipient position, or timing. Icy Quill's press/hold duration, quota, multi-target consumption, C6 exception, elemental infusions, C1, C4, C6, reactions, energy availability, and other character states remain unmodeled.",
  label: shenheDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
