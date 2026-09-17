import { declareHitCapability, declareSkillCastCapability, declareWeaponHitCapabilities } from "../../combat/capabilities.js"
import type { CharacterCombatCoverage } from "../../combat/types.js"

import { kamisatoAyatoDefinition } from "./definition.js"

export const kamisatoAyatoCombatCoverage: CharacterCombatCoverage = {
  capabilities: [
    declareSkillCastCapability("kamisato-ayato", 7),
    ...declareWeaponHitCapabilities(kamisatoAyatoDefinition),
    declareHitCapability("kamisato-ayato.kit.skill_burst_hits", "战技/爆发直接命中准备", ["skill","burst"], ["hydro"]),
  ],
  actions: [
    {
      characterId: "KamisatoAyato",
      damageKind: "direct",
      damageParts: [
        {
          id: "shunsuiken-first-hit",
          scalingTerms: [
            {
              coefficientParameterId: "shunsuiken-first-hit-damage",
              snapshotChecks: [
                { expectedCoefficient: 0.5289, talentLevel: 1 },
                { expectedCoefficient: 1.0455, talentLevel: 10 }
              ],
              stat: "attack"
            },
            {
              coefficientMultiplierScenarioParameterId: "namisen-stack-count",
              coefficientParameterId: "namisen-damage-increase-per-stack",
              snapshotChecks: [
                { expectedCoefficient: 0.005611, talentLevel: 1 },
                { expectedCoefficient: 0.011091, talentLevel: 10 }
              ],
              stat: "hp"
            }
          ]
        }
      ],
      element: kamisatoAyatoDefinition.element,
      evaluator: "declared_direct",
      id: "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "shunsuiken-first-hit-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        },
        {
          groupId: "skill",
          id: "namisen-damage-increase-per-stack",
          parameterIndex: 4,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scenarioParameters: [
        {
          allowedValues: [0, 1, 2, 3, 4, 5],
          defaultValue: 4,
          id: "namisen-stack-count",
          label: "当前浪闪层数",
          maximumValue: 4,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 5, maximumValue: 5, minimumSourceConstellation: 2 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "normal"
    }
  ],
  actionEffects: [
    {
      activation: "active",
      id: "kamisato_ayato.constellation.1.kyoika_fushi.low_hp_target.shunsuiken.damage_bonus",
      label: "镜华风姿 · C1 敌人生命值不高于50%（瞬水剑伤害提高40%）",
      source: { characterId: "KamisatoAyato", kind: "character", minimumSourceConstellation: 1 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.4 }
    },
    {
      activation: "active",
      id: "kamisato_ayato.constellation.2.world_source.namisen_three_stacks.hp_percent",
      label: "世有源泉 · C2 当前浪闪至少3层（生命值上限提高50%）",
      source: { characterId: "KamisatoAyato", kind: "character", minimumSourceConstellation: 2 },
      target: "hpPercent",
      targetFilter: {
        actionIds: ["kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit"],
        recipientSourceRelation: "source"
      },
      value: { kind: "fixed", value: 0.5 }
    },
    {
      activation: "maximum_reachable",
      id: "kamisato_ayato.constellation.6.boundless_origin.first_extra_shunsuiken_strike",
      label: "滥觞无底 · C6 镜花后的下一次瞬水剑命中（第一段额外瞬水剑，450%攻击力）",
      source: { characterId: "KamisatoAyato", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit"],
        recipientSourceRelation: "source"
      },
      value: {
        attackKind: "normal",
        canCrit: true,
        coefficient: { kind: "fixed", value: 4.5 },
        element: "hydro",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "normal"
      }
    },
    {
      activation: "maximum_reachable",
      id: "kamisato_ayato.constellation.6.boundless_origin.second_extra_shunsuiken_strike",
      label: "滥觞无底 · C6 镜花后的下一次瞬水剑命中（第二段额外瞬水剑，450%攻击力）",
      source: { characterId: "KamisatoAyato", kind: "character", minimumSourceConstellation: 6 },
      target: "additionalDamageEvent",
      targetFilter: {
        actionIds: ["kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit"],
        recipientSourceRelation: "source"
      },
      value: {
        attackKind: "normal",
        canCrit: true,
        coefficient: { kind: "fixed", value: 4.5 },
        element: "hydro",
        expectedTriggerProbability: 1,
        kind: "additional_damage_event",
        reactionPolicy: "none",
        scalingStat: "attack",
        talentSlot: "normal"
      }
    }
  ],
  characterId: "KamisatoAyato",
  metrics: [
    {
      actionId: "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit",
      characterId: "KamisatoAyato",
      id: "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit",
      kind: "damage",
      label: "神里流·镜花 / 当前浪闪瞬水剑首段（C6自动加入两段额外瞬水剑，无反应）",
      sourceActionId: "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "One Shunsuiken first hit during Kamisato Art: Kyouka is the selected no-reaction Hydro metric. It uses skill[0] times Attack plus the selected Namisen stack count times skill[4] times max HP. C0 and C1 permit zero through four stacks and default to four; C2 and higher extend the range to five stacks and default to five. C1 can be selected as an explicit snapshot when the target is already at or below 50% HP and adds 40% Damage Bonus only to that Shunsuiken hit. C2's separate explicit snapshot raises max HP by 50% only when the selected Namisen count is at least three; keeping it explicit preserves exact zero-through-two-stack calculations. At C6, the ready first Shunsuiken automatically adds two independent 450%-Attack Hydro strikes; they are Normal Attack damage, can crit, and deliberately have no Namisen term. The result is a current-action snapshot only: it does not generate Namisen, validate the Kyouka stance, model the stance duration, the dash and cast hit, burst-field effects, reactions, timing, or a rotation.",
  label: kamisatoAyatoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
