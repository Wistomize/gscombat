import type { CharacterCombatCoverage } from "../../combat/types.js"

import { yumemizukiMizukiDefinition } from "./definition.js"

export const yumemizukiMizukiCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "YumemizukiMizuki",
      element: yumemizukiMizukiDefinition.element,
      id: "yumemizuki_mizuki.burst.anraku_secret_spring_therapy.mini_baku.snack_heal",
      kind: "support",
      parameterReferences: [
        {
          groupId: "burst",
          id: "mini-baku-snack-elemental-mastery-heal-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "burst",
          id: "mini-baku-snack-flat-heal",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        }
      ],
      status: "verified",
      talentSlot: "burst"
    },
    {
      characterId: "YumemizukiMizuki",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.522768, talentLevel: 1 },
            { expectedCoefficient: 0.940982, talentLevel: 10 }
          ]
        }
      ],
      element: yumemizukiMizukiDefinition.element,
      evaluator: "declared_direct",
      id: "yumemizuki_mizuki.normal.auto.first_hit",
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
      characterId: "YumemizukiMizuki",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "aisa-utamakura-pilgrimage-skill-damage",
          id: "aisa-utamakura-pilgrimage-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.44912, talentLevel: 1 },
            { expectedCoefficient: 0.808416, talentLevel: 10 }
          ]
        }
      ],
      element: yumemizukiMizukiDefinition.element,
      evaluator: "declared_direct",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "aisa-utamakura-pilgrimage-skill-damage",
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
      characterId: "YumemizukiMizuki",
      damageKind: "transformative",
      element: "pyro",
      evaluator: "declared_transformative",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_pyro_swirl",
      kind: "damage",
      status: "verified",
      talentSlot: "skill",
      transformativeReaction: { damageElement: "pyro", kind: "swirl" }
    },
    {
      characterId: "YumemizukiMizuki",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "revelation-radiance-stellar-swirl-damage",
          id: "revelation-radiance-stellar-swirl-damage",
          snapshotChecks: [{ expectedCoefficient: 10, talentLevel: 1 }]
        },
        {
          id: "c1-awaiting-stellar-swirl-damage",
          scalingTerms: [
            {
              fixedCoefficient: 4,
              minimumSourceConstellation: 1,
              stat: "elementalMastery"
            }
          ]
        }
      ],
      element: yumemizukiMizukiDefinition.element,
      evaluator: "declared_direct",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.radiance_stellar_swirl_combo",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "lockedPassive",
          id: "revelation-radiance-stellar-swirl-damage",
          parameterIndex: 3,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "elementalMastery",
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            id: "radiance-stellar-swirl-trigger",
            snapshot: "hit",
            stellarSwirlReaction: { event: "trigger" }
          },
          {
            at: 0.1,
            damagePartId: "revelation-radiance-stellar-swirl-damage",
            id: "revelation-radiance-stellar-swirl-damage",
            snapshot: "hit",
            specialReaction: { kind: "stellar_swirl" }
          },
          {
            at: 0.2,
            damagePartId: "c1-awaiting-stellar-swirl-damage",
            id: "c1-awaiting-stellar-swirl-damage",
            minimumSourceConstellation: 1,
            snapshot: "hit",
            specialReaction: { kind: "stellar_swirl" }
          }
        ],
        duration: 1
      }
    },
    {
      characterId: "YumemizukiMizuki",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "anraku-secret-spring-therapy-initial-hit-damage",
          id: "anraku-secret-spring-therapy-initial-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.9408, talentLevel: 1 },
            { expectedCoefficient: 1.69344, talentLevel: 10 }
          ]
        }
      ],
      element: yumemizukiMizukiDefinition.element,
      evaluator: "declared_direct",
      id: "yumemizuki_mizuki.burst.anraku_secret_spring_therapy.initial_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "burst",
          id: "anraku-secret-spring-therapy-initial-hit-damage",
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
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.dreamdrifter.party_swirl.damage_bonus",
      label: "秋沙歌枕巡礼 · 梦浮期间全队扩散反应伤害加成",
      source: { characterId: "YumemizukiMizuki", kind: "character" },
      target: "reactionDamageBonus",
      targetFilter: { reactionKinds: ["swirl"] },
      value: {
        kind: "final_elemental_mastery",
        multiplier: {
          kind: "talent_parameter",
          multiplier: 0.01,
          parameter: {
            groupId: "skill",
            id: "dreamdrifter-swirl-damage-bonus-per-elemental-mastery",
            parameterIndex: 1,
            source: "talent",
            talentSlot: "skill"
          }
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.dreamdrifter.party_stellar_swirl.damage_bonus",
      label: "秋沙歌枕巡礼 · 梦浮期间全队星扩散反应伤害加成",
      source: { characterId: "YumemizukiMizuki", kind: "character" },
      target: "specialReactionDamageBonus",
      targetFilter: { specialReactionKinds: ["stellar_swirl"] },
      value: {
        kind: "final_elemental_mastery",
        multiplier: {
          kind: "talent_parameter",
          multiplier: 0.01,
          parameter: {
            groupId: "skill",
            id: "dreamdrifter-stellar-swirl-damage-bonus-per-elemental-mastery",
            parameterIndex: 5,
            source: "talent",
            talentSlot: "skill"
          }
        }
      }
    },
    {
      activation: "automatic",
      condition: {
        elements: ["pyro", "hydro", "electro", "cryo"],
        kind: "team_element_count",
        minimum: 1
      },
      id: "yumemizuki_mizuki.passive.daydream_night_dream.phec_hit.elemental_mastery",
      label: "昼想夜梦 · 梦浮期间火水雷冰队友攻击命中后元素精通提升100点",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceAscension: 4 },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        kind: "talent_parameter",
        parameter: {
          groupId: "passive2",
          id: "daydream-night-dream-elemental-mastery",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.locked_passive.revelation.dreamdrifter.party_elemental_mastery",
      label: "廓然梦生 · 梦浮期间瑞希自身元素精通提升（最终精通的10%）",
      source: { characterId: "YumemizukiMizuki", kind: "character" },
      target: "elementalMastery",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        kind: "final_elemental_mastery",
        multiplier: {
          kind: "talent_parameter",
          parameter: {
            groupId: "lockedPassive",
            id: "dreamdrifter-party-elemental-mastery-ratio",
            parameterIndex: 2,
            source: "talent",
            talentSlot: "passive"
          }
        }
      }
    },
    {
      activation: "automatic",
      id: "yumemizuki_mizuki.constellation.1.awaiting_stellar_swirl.flat_damage_addition",
      label: "雾霞流生 · C1待宵之茧被星扩散触发（550%最终元素精通）",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 1 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: {
        actionIds: ["yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.radiance_stellar_swirl_combo"],
        eventIds: ["radiance-stellar-swirl-trigger"],
        recipientSourceRelation: "source",
        specialReactionKinds: ["stellar_swirl"]
      },
      value: {
        kind: "final_elemental_mastery",
        multiplier: { kind: "fixed", value: 5.5 }
      }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.2.dreamdrifter.party_phec_damage_bonus",
      label: "缠忆君影梦相见 · C2梦浮期间其他角色火水雷冰元素伤害加成",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 2 },
      target: "damageBonus",
      targetFilter: {
        elements: ["pyro", "hydro", "electro", "cryo"],
        recipientSourceRelation: "not_source"
      },
      value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 0.0004 } }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.2.dreamdrifter.enemy_phec_anemo_resistance_reduction",
      label: "缠忆君影梦相见 · C2梦浮期间敌人火水雷冰风元素抗性降低20%",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 2 },
      target: "enemyResistanceReduction",
      targetFilter: { elements: ["pyro", "hydro", "electro", "cryo", "anemo"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.6.elemental_mastery_over_500.crit_rate",
      label: "慕念萦心间 · C6最终元素精通超过500的部分提升暴击率（最高20%）",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 6 },
      target: "critRate",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        kind: "final_elemental_mastery",
        maximumValue: { kind: "fixed", value: 0.2 },
        multiplier: { kind: "fixed", value: 0.0004 },
        offset: -500
      }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.6.elemental_mastery_over_500.crit_damage",
      label: "慕念萦心间 · C6最终元素精通超过500的部分提升暴击伤害（最高80%）",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { recipientSourceRelation: "source" },
      value: {
        kind: "final_elemental_mastery",
        maximumValue: { kind: "fixed", value: 0.8 },
        multiplier: { kind: "fixed", value: 0.0016 },
        offset: -500
      }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.6.dreamdrifter.party_stellar_swirl.crit_rate",
      label: "慕念萦心间 · C6梦浮期间全队星扩散暴击率提升10%",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 6 },
      target: "critRate",
      targetFilter: { specialReactionKinds: ["stellar_swirl"] },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.6.dreamdrifter.party_stellar_swirl.crit_damage",
      label: "慕念萦心间 · C6梦浮期间全队星扩散暴击伤害提升20%",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { specialReactionKinds: ["stellar_swirl"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.6.dreamdrifter.party_swirl.crit_rate",
      label: "慕念萦心间 · C6梦浮期间全队普通扩散固定暴击率30%",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 6 },
      target: "transformativeReactionCritRate",
      targetFilter: { reactionKinds: ["swirl"] },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.6.dreamdrifter.party_swirl.crit_damage",
      label: "慕念萦心间 · C6梦浮期间全队普通扩散固定暴击伤害100%",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 6 },
      target: "transformativeReactionCritDamage",
      targetFilter: { reactionKinds: ["swirl"] },
      value: { kind: "fixed", value: 1 }
    }
  ],
  characterId: "YumemizukiMizuki",
  metrics: [
    {
      actionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.radiance_stellar_swirl_combo",
      characterId: "YumemizukiMizuki",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.radiance_stellar_swirl_combo",
      kind: "damage",
      label: "秋沙歌枕巡礼 / 辉映·星扩散联动伤害",
      sourceActionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.radiance_stellar_swirl_combo",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_pyro_swirl",
      characterId: "YumemizukiMizuki",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_pyro_swirl",
      kind: "damage",
      label: "秋沙歌枕巡礼 / 梦浮期间单次火元素扩散",
      sourceActionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_pyro_swirl",
      status: "verified",
      target: "enemy"
    },
    {
      characterId: "YumemizukiMizuki",
      flatParameter: {
        reference: {
          groupId: "burst",
          id: "mini-baku-snack-flat-heal",
          parameterIndex: 6,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 314.57, talentLevel: 1 },
          { expectedValue: 692.10645, talentLevel: 10 }
        ]
      },
      id: "yumemizuki_mizuki.burst.anraku_secret_spring_therapy.mini_baku.snack_heal",
      includeHealingBonus: true,
      kind: "healing",
      label: "安乐秘方疗法 / 貉灵小食单次治疗",
      percentageParameter: {
        reference: {
          groupId: "burst",
          id: "mini-baku-snack-elemental-mastery-heal-ratio",
          parameterIndex: 2,
          source: "talent",
          talentSlot: "burst"
        },
        snapshotChecks: [
          { expectedValue: 1.3056, talentLevel: 1 },
          { expectedValue: 2.35008, talentLevel: 10 }
        ]
      },
      recipientRequirements: [
        {
          comparison: "at_most",
          kind: "recipient_hp_fraction",
          label: "当前场上角色拾取小食且生命值不高于70%",
          threshold: 0.7,
          waivedAtSourceConstellation: 4
        }
      ],
      scalingStat: "elementalMastery",
      sourceActionId: "yumemizuki_mizuki.burst.anraku_secret_spring_therapy.mini_baku.snack_heal",
      status: "verified",
      target: "friendly_recipient"
    },
    {
      characterId: "YumemizukiMizuki",
      id: "yumemizuki_mizuki.constellation.4.snack.additional_low_hp_party_heal",
      includeHealingBonus: true,
      kind: "healing",
      label: "安乐秘汤疗法 / C4额外低生命队友治疗",
      minimumSourceConstellation: 4,
      ratio: 2.66,
      recipientRequirements: [{ kind: "recipient_in_source_area", label: "点心额外治疗附近另一名生命值较低的队友" }],
      scalingStat: "elementalMastery",
      sourceActionId: "yumemizuki_mizuki.burst.anraku_secret_spring_therapy.mini_baku.snack_heal",
      status: "verified",
      target: "friendly_recipient"
    }
  ],
  detail:
    "The selected Dreamdrifter damage metrics calculate one Pyro Swirl and one fixed Radiance Stellar-Swirl linkage snapshot. Dreamdrifter's talent-level-aware Swirl and Stellar-Swirl bonuses, the A4 100 Elemental-Mastery trigger, and Revelation's 10% Elemental-Mastery increase use the same maintained effect pipeline. Revelation is scoped to Mizuki's own Dreamdrifter metrics because switching characters ends Dreamdrifter, so it does not propagate into another character's foreground metric. The linkage contains one actual participant-aggregated Stellar-Swirl trigger plus Revelation's independent 1000% Elemental-Mastery Stellar-Swirl damage; at C1 and above, consuming Awaiting Cocoon adds 550% of Mizuki's final Elemental Mastery only to the trigger event's post-reaction flat-damage stage and creates a separate 400% Elemental-Mastery Stellar-Swirl event. C2 grants other party members a PHEC damage bonus equal to 0.04% per point of Mizuki's final Elemental Mastery and reduces enemy PHEC and Anemo resistance by 20%. The selected snack-heal metric uses Mizuki's Elemental Mastery × burst[2] plus burst[6], then applies source Healing Bonus and recipient Incoming Healing Bonus; its 70% HP condition is waived at C4, which also exposes the independent 266% Elemental-Mastery heal for another nearby low-HP party member. C5 adds three Burst levels. At C6, ordinary Swirl uses a fixed 30% Crit Rate and 100% Crit DMG during Dreamdrifter; the part of Mizuki's final Elemental Mastery above 500 converts to ordinary character Crit Rate and Crit DMG at 0.04% and 0.16% per point, capped at 20% and 80%; all party members' Stellar-Swirl damage also gains 10% Crit Rate and 20% Crit DMG. The ordinary reaction-specific CRIT does not read character panel CRIT. Energy restoration, pull, exact multi-target routing, external timing, and full rotation behavior do not alter these selected single-event outputs and remain outside the fixed snapshot.",
  label: yumemizukiMizukiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
