import type { CharacterCombatCoverage } from "../../combat/types.js"

import { xiaoDefinition } from "./definition.js"

export const xiaoCombatCoverage: CharacterCombatCoverage = {
  actions: [
    {
      characterId: "Xiao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "lemniscatic-wind-cycling-damage",
          id: "lemniscatic-wind-cycling",
          snapshotChecks: [
            { expectedCoefficient: 2.528, talentLevel: 1 },
            { expectedCoefficient: 4.5504, talentLevel: 10 }
          ]
        }
      ],
      element: xiaoDefinition.element,
      evaluator: "declared_direct",
      id: "xiao.skill.lemniscatic_wind_cycling",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "lemniscatic-wind-cycling-damage",
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
      characterId: "Xiao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "normal-attack-first-hit-damage",
          id: "normal-attack-first-hit",
          snapshotChecks: [
            { expectedCoefficient: 0.27544, talentLevel: 1 },
            { expectedCoefficient: 0.49141, talentLevel: 10 }
          ]
        }
      ],
      element: "physical",
      evaluator: "declared_direct",
      id: "xiao.normal.auto.first_hit",
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
      attackKind: "plunge",
      characterId: "Xiao",
      damageKind: "direct",
      deterministicSnapshotCapabilities: ["after_primary_burst"],
      damageParts: [
        {
          coefficientParameterId: "high-plunge-damage",
          id: "bane-of-all-evil-high-plunge",
          snapshotChecks: [
            { expectedCoefficient: 2.043855, talentLevel: 1 },
            { expectedCoefficient: 4.040179, talentLevel: 10 }
          ]
        }
      ],
      element: xiaoDefinition.element,
      evaluator: "declared_direct",
      id: "xiao.burst.bane_of_all_evil.high_plunge",
      intrinsicEffects: [
        {
          coefficientParameterId: "bane-of-all-evil-damage-bonus",
          kind: "flat",
          label: "元素爆发 · 靖妖傩舞",
          snapshotChecks: [
            { expectedCoefficient: 0.5845, talentLevel: 1 },
            { expectedCoefficient: 0.952, talentLevel: 10 }
          ],
          target: "damageBonus"
        },
        {
          coefficientParameterId: "a1-bane-damage-bonus-per-stage",
          kind: "flat",
          label: "固有天赋 · 降魔·平妖大圣",
          minimumSourceAscension: 1,
          scenarioParameterMultiplier: {
            parameterId: "a1-bane-extra-stage-count",
            values: [
              { multiplier: 1, parameterValue: 0 },
              { multiplier: 2, parameterValue: 1 },
              { multiplier: 3, parameterValue: 2 },
              { multiplier: 4, parameterValue: 3 },
              { multiplier: 5, parameterValue: 4 }
            ]
          },
          snapshotChecks: [{ expectedCoefficient: 0.05, talentLevel: 1 }],
          target: "damageBonus"
        }
      ],
      kind: "damage",
      parameterReferences: [
        {
          groupId: "auto",
          id: "high-plunge-damage",
          // GO 98aafa1f: Characters/Xiao/index.tsx dm.plunging.high = auto[12]; auto[8] is charged.
          parameterIndex: 12,
          source: "talent",
          talentSlot: "normal"
        },
        {
          groupId: "burst",
          id: "bane-of-all-evil-damage-bonus",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "burst"
        },
        {
          groupId: "passive1",
          id: "a1-bane-damage-bonus-per-stage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "passive"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1, 2, 3, 4],
          defaultValue: 0,
          id: "a1-bane-extra-stage-count",
          label: "A1 靖妖傩舞额外层数（每3秒+5%）",
          maximumValue: 4,
          minimumValue: 0
        }
      ],
      status: "verified",
      talentSlot: "normal"
    },
    {
      characterId: "Xiao",
      damageKind: "direct",
      damageParts: [
        {
          coefficientParameterId: "lemniscatic-wind-cycling-damage",
          id: "c6-free-lemniscatic-wind-cycling",
          snapshotChecks: [
            { expectedCoefficient: 2.528, talentLevel: 1 },
            { expectedCoefficient: 4.5504, talentLevel: 10 }
          ]
        }
      ],
      element: xiaoDefinition.element,
      evaluator: "declared_direct",
      id: "xiao.constellation.6.conqueror_of_evil.guardian_yaksha.free_lemniscatic_wind_cycling",
      kind: "damage",
      parameterReferences: [
        {
          groupId: "skill",
          id: "lemniscatic-wind-cycling-damage",
          parameterIndex: 0,
          source: "talent",
          talentSlot: "skill"
        }
      ],
      scalingStat: "attack",
      scenarioParameters: [
        {
          allowedValues: [0, 1],
          defaultValue: 0,
          id: "c6-free-lemniscatic-wind-cycling-current",
          label: "C6 降魔·护法夜叉 / 下落攻击命中至少两名敌人后的免费风轮两立",
          maximumValue: 0,
          minimumValue: 0,
          rangeBySourceConstellation: [
            { defaultValue: 1, maximumValue: 1, minimumSourceConstellation: 6, minimumValue: 1 }
          ]
        }
      ],
      status: "verified",
      talentSlot: "skill",
      timeline: {
        damageEvents: [
          {
            at: 0,
            coefficientMultiplier: {
              kind: "scenario_parameter_lookup",
              parameterId: "c6-free-lemniscatic-wind-cycling-current",
              values: [
                { multiplier: 0, parameterValue: 0 },
                { multiplier: 1, parameterValue: 1 }
              ]
            },
            damagePartId: "c6-free-lemniscatic-wind-cycling",
            elementalApplication: { icd: { kind: "none" } },
            id: "c6-free-lemniscatic-wind-cycling",
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
      id: "xiao.passive.conqueror_of_evil.tamer_of_demons.c6_skill.maximum_damage_bonus",
      label: "降魔·平妖大圣 · C6 免费风轮两立处于靖妖傩舞满5层（伤害提高25%）",
      source: { characterId: "Xiao", kind: "character", minimumSourceAscension: 1 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["xiao.constellation.6.conqueror_of_evil.guardian_yaksha.free_lemniscatic_wind_cycling"],
        recipientSourceRelation: "source"
      },
      value: {
        kind: "talent_parameter", multiplier: 5,
        parameter: { groupId: "passive1", id: "a1-damage-bonus-per-stage", parameterIndex: 0, source: "talent", talentSlot: "passive" }
      }
    },
    {
      activation: "maximum_reachable",
      id: "xiao.passive.dissolution.eon_fall.c6_skill.maximum_damage_bonus",
      label: "坏劫·国土碾尘 · C6 免费风轮两立已有3层（元素战技伤害提高45%）",
      source: { characterId: "Xiao", kind: "character", minimumSourceAscension: 4 },
      target: "damageBonus",
      targetFilter: {
        actionIds: ["xiao.constellation.6.conqueror_of_evil.guardian_yaksha.free_lemniscatic_wind_cycling"],
        recipientSourceRelation: "source"
      },
      value: {
        kind: "talent_parameter", multiplier: 3,
        parameter: { groupId: "passive2", id: "a4-skill-damage-bonus-per-stack", parameterIndex: 1, source: "talent", talentSlot: "passive" }
      }
    }
  ],
  characterId: "Xiao",
  metrics: [
    {
      actionId: "xiao.burst.bane_of_all_evil.high_plunge",
      characterId: "Xiao",
      id: "xiao.burst.bane_of_all_evil.high_plunge",
      kind: "damage",
      label: "靖妖傩舞 / 高空下落攻击（无反应）",
      sourceActionId: "xiao.burst.bane_of_all_evil.high_plunge",
      status: "verified",
      target: "enemy"
    },
    {
      actionId: "xiao.constellation.6.conqueror_of_evil.guardian_yaksha.free_lemniscatic_wind_cycling",
      characterId: "Xiao",
      id: "xiao.constellation.6.conqueror_of_evil.guardian_yaksha.free_lemniscatic_wind_cycling",
      kind: "damage",
      minimumSourceConstellation: 6,
      label: "降魔·护法夜叉 / 下落命中至少两名敌人后的免费风轮两立单次伤害",
      sourceActionId: "xiao.constellation.6.conqueror_of_evil.guardian_yaksha.free_lemniscatic_wind_cycling",
      status: "verified",
      target: "enemy"
    }
  ],
  detail:
    "High Plunge during Bane of All Evil reads Attack × auto[12] (204.3855% at level 1, 404.0179% at level 10), not charged auto[8]. Burst[0] and its selected A1 5–25% state enter the ordinary damage-bonus stage. The separate C6-only free Wind Cycling represents one Skill hit after a burst-state plunge hit two enemies. Its explicitly maximum-reachable state includes A1 five-stage 25% and A4 three-stack 45% Skill damage, but never the Burst's normal/charged/plunge-only damage bonus. It does not count charge generation, additional free Skills, low plunge, collision, target count, or a rotation.",
  label: xiaoDefinition.name,
  status: "draft",
  talentLevelConstellationBonuses: [
    { minimumSourceConstellation: 3, talentSlot: "skill", value: 3 },
    { minimumSourceConstellation: 5, talentSlot: "burst", value: 3 }
  ]
}
