import type { CharacterCombatCoverage } from "../../combat/types.js"

import { candaceDefinition } from "./definition.js"

export const candaceCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Candace",
      element: candaceDefinition.element,
      id: "candace.burst.sacred_rite_wagtails_tide.prayer_of_the_crimson_crown.normal_damage_bonus",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "prayer-of-the-crimson-crown-duration",
          parameterIndex: 1,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "prayer-of-the-crimson-crown-elemental-normal-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Candace",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sacred-rite-wagtails-tide-skill-damage",
          id: "sacred-rite-wagtails-tide-skill-damage",
          snapshotChecks: [
            { expectedCoefficient: 0.066104, talentLevel: 1 },
            { expectedCoefficient: 0.118987, talentLevel: 10 }
          ]
        }
      ],
      element: candaceDefinition.element,
      evaluator: "declared_direct",
      id: "candace.burst.sacred_rite_wagtails_tide.skill_damage",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "sacred-rite-wagtails-tide-skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "Candace",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sacred-rite-herons-sanctum-press-damage",
          id: "sacred-rite-herons-sanctum-press",
          snapshotChecks: [
            { expectedCoefficient: 0.12, talentLevel: 1 },
            { expectedCoefficient: 0.216, talentLevel: 10 }
          ]
        }
      ],
      element: candaceDefinition.element,
      evaluator: "declared_direct",
      id: "candace.skill.sacred_rite_herons_sanctum.press",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "sacred-rite-herons-sanctum-press-damage",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Candace",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sacred-rite-herons-sanctum-hold-release-damage",
          id: "sacred-rite-herons-sanctum-hold-release",
          snapshotChecks: [
            { expectedCoefficient: 0.1904, talentLevel: 1 },
            { expectedCoefficient: 0.34272, talentLevel: 10 }
          ]
        }
      ],
      element: candaceDefinition.element,
      evaluator: "declared_direct",
      id: "candace.skill.sacred_rite_herons_sanctum.hold_release",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "sacred-rite-herons-sanctum-hold-release-damage",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "hp",
      status: "verified",
      talentSlot: "skill"
    },
    {
      characterId: "Candace",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "sacred-rite-wagtails-tide-skill-damage",
          id: "c6-the-overflow-hydro-wave",
          snapshotChecks: [
            { expectedCoefficient: 0.066104, talentLevel: 1 },
            { expectedCoefficient: 0.118987, talentLevel: 10 }
          ]
        }
      ],
      element: candaceDefinition.element,
      evaluator: "declared_direct",
      id: "candace.constellation.6.the_overflow.hydro_wave.no_reaction",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "sacred-rite-wagtails-tide-skill-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      scalingStat: "hp",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-the-overflow-trigger-count",
          label: "C6 衍溢的汐潮 / 本次元素普通攻击已触发水波",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "burst",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-the-overflow-trigger-count",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 0, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-the-overflow-hydro-wave",
            hitCount: { kind: "scenario_parameter", parameterId: "c6-the-overflow-trigger-count" },
            id: "c6-the-overflow-hydro-wave",
            snapshot: "hit"
          }
        ],
        duration: 1
      }
    }
  ],
  actionEffects: [
    {
      activation: "maximum_reachable",
      id: "candace.burst.sacred_rite_wagtails_tide.prayer_of_the_crimson_crown.elemental_normal_damage_bonus",
      label: "赤冕祝祷 · 元素普通攻击伤害加成",
      source: { characterId: "Candace", kind: "character" },
      target: "damageBonus",
      targetFilter: {
        attackKinds: ["normal"],
        elements: ["anemo", "cryo", "dendro", "electro", "geo", "hydro", "pyro"]
      },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "burst",
          id: "prayer-of-the-crimson-crown-elemental-normal-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        }
      }
    },
    {
      activation: "active",
      id: "candace.constellation.2.moon_piercing_brilliance.after_skill_hit.hp_percent",
      label: "贯月的耀锋 · C2 元素战技命中后的15秒内（生命值上限提高20%）",
      source: { characterId: "Candace", kind: "character", minimumSourceConstellation: 2 },
      target: "hpPercent",
      targetFilter: { recipientSourceRelation: "source" },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "automatic",
      id: "candace.constellation.6.the_overflow.hydro_wave.base_damage",
      label: "衍溢的汐潮 · C6 水波基础伤害（坎蒂丝生命值上限的15%）",
      source: { characterId: "Candace", kind: "character", minimumSourceConstellation: 6 },
      target: "matchedActionAdditiveDamageTerm",
      targetFilter: {
        actionIds: ["candace.constellation.6.the_overflow.hydro_wave.no_reaction"],
        recipientSourceRelation: "source"
      },
      value: {
        coefficient: { kind: "fixed", value: 0.15 },
        kind: "matched_action_additive_damage_term",
        scalingStat: "hp"
      }
    }
  ],
  characterId: "Candace",
  metrics: [
    {
      characterId: "Candace",
      appliesTo: ["normal"],
      id: "candace.burst.sacred_rite_wagtails_tide.prayer_of_the_crimson_crown.elemental_normal_damage_bonus",
      kind: "scalar",
      label: "圣仪·苍鹭庇卫 / 赤冕祝祷元素普通攻击伤害加成",
      ratioParameter: {
        reference: {
          groupId: "burst",
          id: "prayer-of-the-crimson-crown-elemental-normal-damage-bonus",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 0.2, talentLevel: 1 },
          { expectedValue: 0.2, talentLevel: 10 }
        ]
      },
      recipientRequirements: [],
      semantic: "elemental_normal_attack_damage_bonus",
      sourceActionId: "candace.burst.sacred_rite_wagtails_tide.prayer_of_the_crimson_crown.normal_damage_bonus",
      status: "verified",
      target: "friendly_recipient",
      unit: "ratio"
    },
    {
      actionId: "candace.constellation.6.the_overflow.hydro_wave.no_reaction",
      characterId: "Candace",
      id: "candace.constellation.6.the_overflow.hydro_wave.no_reaction",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "衍溢的汐潮 / C6 水波单次伤害（无反应）",
      sourceActionId: "candace.constellation.6.the_overflow.hydro_wave.no_reaction",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "Sacred Rite: Wagtail's Tide's initial skill damage plus Sacred Rite: Heron's Sanctum's press hit and one hold release remain verified health-scaling Hydro actions from the pinned game-data snapshot, but none is selected as Candace's display output. The selected support metric calculates Prayer of the Crimson Crown's 20% elemental Normal Attack damage bonus for one friendly recipient from burst[2]. It is deliberately scoped to elemental Normal Attacks of any element: it neither grants nor simulates Hydro infusion, and it does not apply to Physical attacks, Charged Attacks, Plunges, Skills, Bursts, or any flat-damage effect. At C6, the dedicated water-wave metric is absent through C5 and evaluates exactly 15% of Candace's own final Max HP as Hydro Elemental Burst damage after another affected character deals elemental Normal Attack damage. Selecting the explicit C2 post-Skill snapshot first adds its 20% Max-HP increase, so the inherited lower constellation changes this C6 result. The wave intentionally has no preset reaction and is not evaluated with the triggering character's stats. Its 2.3-second cooldown and the Burst-field setup are represented by selecting this one ready trigger rather than inferred as a rotation. Duration handling, target count, A4's separate Max-HP-scaled bonus, C1/C4, external effects, and rotation behavior remain outside this metric.",
  label: candaceDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "burst", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "skill", value: 3 }
  ]
}
