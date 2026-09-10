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
      fieldPresence: "on_field",
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
      fieldPresence: "on_field",
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
            damagePartId: "revelation-radiance-stellar-swirl-damage",
            id: "revelation-radiance-stellar-swirl-damage",
            snapshot: "hit",
            specialReaction: { kind: "stellar_swirl" }
          },
          {
            at: 0.1,
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
      damageParts: [],
      element: "anemo",
      evaluator: "declared_direct",
      fieldPresence: "on_field",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl",
      kind: "damage",
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [{
          at: 0,
          id: "radiance-stellar-swirl-trigger",
          snapshot: "hit",
          stellarSwirlReaction: { event: "trigger" }
        }],
        duration: 1
      }
    },
    {
      characterId: "YumemizukiMizuki",
      damageKind: "direct",
      damageParts: [],
      element: "cryo",
      evaluator: "declared_direct",
      fieldPresence: "on_field",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl_vortex",
      kind: "damage",
      scenarioParameters: [{
        id: "vortex_level",
        label: "风旋等级（1–2级倍率2，3–6级倍率3）",
        defaultValue: 6,
        minimumValue: 1,
        maximumValue: 6,
        allowedValues: [1, 2, 3, 4, 5, 6]
      }],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [{
          at: 0,
          id: "stellar-swirl-vortex",
          snapshot: "hit",
          stellarSwirlReaction: { event: "vortex", vortexLevel: { parameterId: "vortex_level" } }
        }],
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
      requiresSourceOnField: true,
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
      requiresSourceOnField: true,
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
      requiresSourceOnField: true,
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
      requiresSourceOnField: true,
      label: "廓然梦生 · 梦浮期间队伍元素精通提升（瑞希最终精通的10%）",
      source: { characterId: "YumemizukiMizuki", kind: "character" },
      target: "elementalMastery",
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
      label: "宿雾若水遥 · C1二十三夜待被星扩散触发（550%最终元素精通）",
      requiresSourceOnField: true,
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 1 },
      target: "specialReactionFlatDamageAddition",
      targetFilter: {
        actionIds: ["yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl"],
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
      activation: "automatic",
      id: "yumemizuki_mizuki.constellation.1.awaiting_swirl.flat_damage_addition",
      label: "宿雾若水遥 · C1二十三夜待被普通扩散触发（1100%最终元素精通）",
      requiresSourceOnField: true,
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 1 },
      target: "transformativeReactionFlatDamageAddition",
      targetFilter: {
        actionIds: ["yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_pyro_swirl"],
        recipientSourceRelation: "source", reactionKinds: ["swirl"]
      },
      value: { kind: "final_elemental_mastery", multiplier: { kind: "fixed", value: 11 } }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.2.dreamdrifter.party_phec_damage_bonus",
      requiresSourceOnField: true,
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
      requiresSourceOnField: true,
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
      requiresSourceOnField: true,
      label: "慕念萦心间 · C6梦浮期间全队星扩散暴击率提升10%",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 6 },
      target: "critRate",
      targetFilter: { specialReactionKinds: ["stellar_swirl"] },
      value: { kind: "fixed", value: 0.1 }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.6.dreamdrifter.party_stellar_swirl.crit_damage",
      requiresSourceOnField: true,
      label: "慕念萦心间 · C6梦浮期间全队星扩散暴击伤害提升20%",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 6 },
      target: "critDamage",
      targetFilter: { specialReactionKinds: ["stellar_swirl"] },
      value: { kind: "fixed", value: 0.2 }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.6.dreamdrifter.party_swirl.crit_rate",
      requiresSourceOnField: true,
      label: "慕念萦心间 · C6梦浮期间全队普通扩散固定暴击率30%",
      source: { characterId: "YumemizukiMizuki", kind: "character", minimumSourceConstellation: 6 },
      target: "transformativeReactionCritRate",
      targetFilter: { reactionKinds: ["swirl"] },
      value: { kind: "fixed", value: 0.3 }
    },
    {
      activation: "maximum_reachable",
      id: "yumemizuki_mizuki.constellation.6.dreamdrifter.party_swirl.crit_damage",
      requiresSourceOnField: true,
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
      label: "廓然梦生 / 梦浮·辉映星扩散直伤（C1含标记追加）",
      sourceActionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.radiance_stellar_swirl_combo",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl",
      characterId: "YumemizukiMizuki",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl",
      kind: "damage",
      label: "秋沙歌枕巡礼 / 梦浮·反应星扩散·风（冰底、标记可用）",
      sourceActionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl_vortex",
      characterId: "YumemizukiMizuki",
      id: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl_vortex",
      kind: "damage",
      label: "秋沙歌枕巡礼 / 梦浮·反应星扩散·冰（风旋单次爆炸）",
      sourceActionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl_vortex",
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
      selfRecipientMultiplier: { label: "瑞希本人拾取点心 · 治疗量提高100%", value: 2 },
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
    "Dreamdrifter exposes separate direct Stellar-Swirl, single Anemo reaction and Cryo Vortex metrics, alongside the existing ordinary Pyro Swirl and snack healing metrics. All three stellar metrics assume Dreamdrifter and Radiance are active and the relevant trigger cooldowns are available. The legacy combo ID now represents direct damage only: Revelation contributes one 1000% Elemental-Mastery Stellar-Swirl hit, with a separate 400% hit at C1 and above when Twenty-Three Nights Awaiting is consumed. It excludes the actual reaction and the ordinary periodic Anemo hit, including its separate 1000% Elemental-Mastery base addition. The new reaction metric contains only one Anemo Stellar-Swirl trigger, with the 550% Elemental-Mastery C1 addition in its post-reaction flat stage. For this fixed Cryo-aura snapshot the current trigger owner and Cryo teammates with assumed surviving application contribute; other teammates still supply eligible buffs. The Cryo Vortex metric takes a manual level from 1 through 6 (default 6), uses coefficient 2 at levels 1-2 and 3 at levels 3-6, and excludes the C1 trigger addition. Its assumed contributors are the party Anemo and Cryo characters. Under the user-approved calculation convention, each critical outcome assigns 60% to an eligible Anemo contributor for the Anemo reaction, or 60% to Cryo and 30% to Anemo for the Vortex; other slots use the highest remaining damage, without reusing a contributor or promoting another element into an empty required slot. Conflicting research is recorded in the change design; this convention is not asserted as independently proven. Dreamdrifter talent bonuses, A4 mastery, Revelation mastery sharing, C2 and C6 use the maintained source-on-field effect pipeline; another foreground action cannot overlap Dreamdrifter. C6 ordinary Swirl retains fixed 30% Crit Rate and 100% Crit DMG; Stellar-Swirl instead uses character CRIT with the applicable C6 party and mastery-conversion bonuses. Existing snack healing, self-recipient doubling, C4 extra healing and cumulative talent levels are unchanged. This is a fixed single-action snapshot, not an aura-history, cooldown or full-rotation simulator.",
  label: yumemizukiMizukiDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
