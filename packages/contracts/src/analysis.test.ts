import { Value } from "typebox/value"
import { describe, expect, it } from "vitest"

import { AnalysisResponseSchema, getWeaponComparisonRefinement, type AnalysisResponse } from "./analysis.js"

const emptyTeamState = {
  activeResonanceIds: [],
  hexereiSecretRite: false,
  moonsign: { characterBuildIds: [], characterCount: 0, level: "none" }
} as const

describe("weapon comparison refinement", () => {
  it("uses R1 for five-star weapons and R5 for lower rarities", () => {
    expect(getWeaponComparisonRefinement(5)).toBe(1)
    expect(getWeaponComparisonRefinement(4)).toBe(5)
    expect(getWeaponComparisonRefinement(3)).toBe(5)
  })
})

describe("AnalysisResponseSchema", () => {
  it("preserves an event-level elemental application outcome in the public rotation summary", () => {
    const response = Value.Clean(AnalysisResponseSchema, {
      analysis: {
        baselineExpectedDamage: 1,
        effectiveArtifacts: [],
        marginalSubstats: [],
        progressionGains: [],
        totalEffectiveRolls: 0,
        weapons: []
      },
      engineVersion: "test",
      evaluation: {
        appliedEffects: [
          {
            id: "weapon.aqua-simulacra.hp-percent",
            label: "若水 · 生命值",
            sourceId: "test.aqua-owner",
            target: "hpPercent",
            value: 0.16
          },
          {
            id: "weapon.deathmatch.multi-target.defense",
            label: "决斗之枪 · 至少两名敌人（防御力）",
            sourceId: "test.deathmatch-owner",
            target: "defensePercent",
            value: 0.16
          },
          {
            id: "arataki_itto.constellation.6.arataki_kesagiri.crit_damage",
            label: "C6 · 荒泷乱舞暴击伤害 +70%",
            sourceId: "test.arataki-itto-owner",
            target: "critDamage",
            value: 0.7
          },
          {
            id: "klee.constellation.2.sparkling_burst.enemy_defense_reduction",
            label: "C2 · 目标的防御力降低（诡雷减防已生效）",
            sourceId: "test.klee-owner",
            target: "enemyDefenseReduction",
            value: 0.23
          },
          {
            id: "yae_miko.constellation.6.sesshou_sakura.level_three.enemy_defense_ignore",
            label: "C6 · 杀生樱叁阶落雷无视 60% 防御力",
            sourceId: "test.yae-miko-owner",
            target: "enemyDefenseIgnore",
            value: 0.6
          },
          {
            id: "weapon.skyward-spine.vacuum-blade",
            label: "天空之脊 · 真空刃（2秒冷却已就绪）",
            sourceId: "test.skyward-owner",
            target: "additionalDamageEvent",
            value: 0.2
          },
          {
            id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus",
            label: "炽烈的炎之魔女 · 四件套（蒸发与融化反应加成）",
            sourceId: "test.crimson-witch-owner",
            target: "amplifyingReactionBonus",
            value: 0.15
          }
        ],
        appliedBuffs: [],
        formulaAuthority: "rotation_events",
        teamState: emptyTeamState,
        result: { critDamage: 1, expectedDamage: 1, nonCritDamage: 1, trace: [] },
        rotation: {
          dpr: 1,
          dps: 1,
          duration: 1,
          events: [
            {
              appliedEffectIds: [],
              critDamage: 1,
              elementalApplication: {
                applied: true,
                auraElement: "hydro",
                auraId: "target.hydro",
                reaction: "vaporize_reverse"
              },
              element: "pyro",
              elementOverride: {
                baseElement: "physical",
                element: "pyro",
                id: "bennett.c6"
              },
              expectedDamage: 1,
              hitCount: 1,
              id: "pyronado.tick-1",
              nonCritDamage: 1,
              ownerId: "xiangling.default",
              statSnapshotTime: 0,
              time: 0,
              trace: [
                {
                  after: 1,
                  before: 1,
                  bonus: 0,
                  kind: "damage_bonus",
                  multiplier: 1
                }
              ]
            }
          ]
        },
        stats: {
          attackPercent: 0,
          baseAttack: 1,
          critDamage: 0,
          critRate: 0,
          damageBonus: 0,
          effectiveAttack: 1,
          elementalMastery: 0,
          energyRecharge: 0,
          flatAttack: 0,
          resistanceReduction: 0,
          statContributions: [],
          talentMultiplier: 1
        }
      }
    }) as AnalysisResponse

    expect(response.evaluation.rotation.events[0]?.elementalApplication).toEqual({
      applied: true,
      auraElement: "hydro",
      auraId: "target.hydro",
      reaction: "vaporize_reverse"
    })
    expect(response.evaluation.rotation.events[0]?.elementOverride).toEqual({
      baseElement: "physical",
      element: "pyro",
      id: "bennett.c6"
    })
    expect(response.evaluation.formulaAuthority).toBe("rotation_events")
    expect(response.evaluation.appliedEffects).toEqual([
      {
        id: "weapon.aqua-simulacra.hp-percent",
        label: "若水 · 生命值",
        sourceId: "test.aqua-owner",
        target: "hpPercent",
        value: 0.16
      },
      {
        id: "weapon.deathmatch.multi-target.defense",
        label: "决斗之枪 · 至少两名敌人（防御力）",
        sourceId: "test.deathmatch-owner",
        target: "defensePercent",
        value: 0.16
      },
      {
        id: "arataki_itto.constellation.6.arataki_kesagiri.crit_damage",
        label: "C6 · 荒泷乱舞暴击伤害 +70%",
        sourceId: "test.arataki-itto-owner",
        target: "critDamage",
        value: 0.7
      },
      {
        id: "klee.constellation.2.sparkling_burst.enemy_defense_reduction",
        label: "C2 · 目标的防御力降低（诡雷减防已生效）",
        sourceId: "test.klee-owner",
        target: "enemyDefenseReduction",
        value: 0.23
      },
      {
        id: "yae_miko.constellation.6.sesshou_sakura.level_three.enemy_defense_ignore",
        label: "C6 · 杀生樱叁阶落雷无视 60% 防御力",
        sourceId: "test.yae-miko-owner",
        target: "enemyDefenseIgnore",
        value: 0.6
      },
      {
        id: "weapon.skyward-spine.vacuum-blade",
        label: "天空之脊 · 真空刃（2秒冷却已就绪）",
        sourceId: "test.skyward-owner",
        target: "additionalDamageEvent",
        value: 0.2
      },
      {
        id: "artifact.crimson-witch-of-flames.4pc.vaporize-melt.amplifying-reaction-bonus",
        label: "炽烈的炎之魔女 · 四件套（蒸发与融化反应加成）",
        sourceId: "test.crimson-witch-owner",
        target: "amplifyingReactionBonus",
        value: 0.15
      }
    ])
    expect(Value.Check(AnalysisResponseSchema, response)).toBe(true)
    expect(response.evaluation.rotation.events[0]?.trace).toEqual([
      {
        after: 1,
        before: 1,
        bonus: 0,
        kind: "damage_bonus",
        multiplier: 1
      }
    ])
  })

  it("accepts elemental mastery in direct-damage scaling traces", () => {
    expect(
      Value.Check(AnalysisResponseSchema, {
        analysis: {
          baselineExpectedDamage: 500,
          effectiveArtifacts: [],
          marginalSubstats: [],
          progressionGains: [],
          totalEffectiveRolls: 0,
          weapons: []
        },
        engineVersion: "test",
        evaluation: {
          appliedEffects: [],
          appliedBuffs: [],
          formulaAuthority: "rotation_events",
          teamState: emptyTeamState,
          result: {
            critDamage: 500,
            expectedDamage: 500,
            nonCritDamage: 500,
            trace: [
              {
                after: 500,
                before: 0,
                formula: { kind: "scaling", stat: "elementalMastery", value: 500 },
                source: "resolved_stats",
                stage: "scaling"
              }
            ]
          },
          rotation: {
            dpr: 500,
            dps: 500,
            duration: 1,
            events: [
              {
                appliedEffectIds: [],
                critDamage: 500,
                element: "dendro",
                expectedDamage: 500,
                hitCount: 1,
                id: "test.elemental-mastery-scale",
                nonCritDamage: 500,
                ownerId: "test.character",
                statSnapshotTime: 0,
                time: 0,
                trace: [
                  {
                    after: 500,
                    before: 0,
                    coefficient: 1,
                    kind: "scaling",
                    stat: "elementalMastery",
                    value: 500
                  }
                ]
              }
            ]
          },
          stats: {
            attackPercent: 0,
            baseAttack: 1,
            critDamage: 0,
            critRate: 0,
            damageBonus: 0,
            effectiveAttack: 1,
            elementalMastery: 500,
            energyRecharge: 0,
            flatAttack: 0,
            resistanceReduction: 0,
            statContributions: [],
            scalingTerms: [{ coefficient: 1, stat: "elementalMastery" }],
            talentMultiplier: null
          }
        }
      })
    ).toBe(true)
  })

  it("round-trips a same-hit additive damage term with its scaling source", () => {
    const response = {
      analysis: {
        baselineExpectedDamage: 500,
        effectiveArtifacts: [],
        marginalSubstats: [],
        progressionGains: [],
        totalEffectiveRolls: 0,
        weapons: []
      },
      engineVersion: "test",
      evaluation: {
        appliedEffects: [
          {
            id: "weapon.redhorn-stonethresher.normal-charged-defense-additive-damage",
            label: "赤角石溃杵 · 普通攻击与重击防御力同一命中加算",
            scalingStat: "defense",
            sourceId: "test.noelle",
            target: "matchedActionAdditiveDamageTerm",
            value: 0.4
          }
        ],
        appliedBuffs: [],
        formulaAuthority: "rotation_events",
        teamState: emptyTeamState,
        result: {
          critDamage: 500,
          expectedDamage: 500,
          nonCritDamage: 500,
          trace: [
            {
              after: 500,
              before: 0,
              formula: {
                kind: "scaling_terms",
                terms: [
                  { coefficient: 1.564, contribution: 300, stat: "attack", value: 191.8 },
                  {
                    coefficient: 0.4,
                    contribution: 200,
                    label: "赤角石溃杵 · 普通攻击与重击防御力同一命中加算",
                    stat: "defense",
                    value: 500
                  }
                ]
              },
              source: "resolved_stats",
              stage: "scaling"
            }
          ]
        },
        rotation: {
          dpr: 500,
          dps: 500,
          duration: 1,
          events: [
            {
              appliedEffectIds: ["weapon.redhorn-stonethresher.normal-charged-defense-additive-damage"],
              critDamage: 500,
              element: "geo",
              expectedDamage: 500,
              hitCount: 1,
              id: "noelle.normal.auto.first_hit",
              nonCritDamage: 500,
              ownerId: "test.noelle",
              statSnapshotTime: 0,
              time: 0,
              trace: [
                {
                  after: 500,
                  before: 0,
                  kind: "scaling_terms",
                  terms: [
                    { coefficient: 1.564, contribution: 300, stat: "attack", value: 191.8 },
                    {
                      coefficient: 0.4,
                      contribution: 200,
                      label: "赤角石溃杵 · 普通攻击与重击防御力同一命中加算",
                      stat: "defense",
                      value: 500
                    }
                  ]
                }
              ]
            }
          ]
        },
        stats: {
          attackPercent: 0,
          baseAttack: 1,
          critDamage: 0,
          critRate: 0,
          damageBonus: 0,
          effectiveAttack: 1,
          elementalMastery: 0,
          energyRecharge: 0,
          flatAttack: 0,
          resistanceReduction: 0,
          statContributions: [],
          scalingTerms: [
            { coefficient: 1.564, stat: "attack" },
            {
              coefficient: 0.4,
              label: "赤角石溃杵 · 普通攻击与重击防御力同一命中加算",
              stat: "defense"
            }
          ],
          talentMultiplier: null
        }
      }
    }

    expect(Value.Check(AnalysisResponseSchema, response)).toBe(true)

    const parsed = Value.Clean(AnalysisResponseSchema, response) as AnalysisResponse
    expect(parsed.evaluation.appliedEffects).toEqual([
      {
        id: "weapon.redhorn-stonethresher.normal-charged-defense-additive-damage",
        label: "赤角石溃杵 · 普通攻击与重击防御力同一命中加算",
        scalingStat: "defense",
        sourceId: "test.noelle",
        target: "matchedActionAdditiveDamageTerm",
        value: 0.4
      }
    ])
    expect(parsed.evaluation.rotation.events[0]?.trace[0]).toEqual({
      after: 500,
      before: 0,
      kind: "scaling_terms",
      terms: [
        { coefficient: 1.564, contribution: 300, stat: "attack", value: 191.8 },
        {
          coefficient: 0.4,
          contribution: 200,
          label: "赤角石溃杵 · 普通攻击与重击防御力同一命中加算",
          stat: "defense",
          value: 500
        }
      ]
    })
  })

  it("preserves complete rotation reaction and mitigation trace formulas", () => {
    const response = Value.Clean(AnalysisResponseSchema, {
      analysis: {
        baselineExpectedDamage: 1,
        effectiveArtifacts: [],
        marginalSubstats: [],
        progressionGains: [],
        totalEffectiveRolls: 0,
        weapons: []
      },
      engineVersion: "test",
      evaluation: {
        appliedEffects: [],
        appliedBuffs: [],
        formulaAuthority: "rotation_events",
        teamState: emptyTeamState,
        result: { critDamage: 1, expectedDamage: 1, nonCritDamage: 1, trace: [] },
        rotation: {
          dpr: 1,
          dps: 1,
          duration: 1,
          events: [
            {
              appliedEffectIds: [],
              critDamage: 1,
              element: "pyro",
              expectedDamage: 1,
              hitCount: 3,
              id: "test.complete-rotation-trace",
              nonCritDamage: 1,
              ownerId: "test.character",
              statSnapshotTime: 0,
              time: 0,
              trace: [
                {
                  after: 1.8,
                  baseMultiplier: 1.5,
                  before: 1,
                  bonus: 0.2,
                  elementalMastery: 300,
                  kind: "amplifying_reaction",
                  multiplier: 1.8,
                  reaction: "vaporize_reverse"
                },
                {
                  after: 2000,
                  baseDamage: 1446.8535,
                  before: 1000,
                  bonus: 0,
                  elementalMastery: 200,
                  kind: "additive_reaction",
                  multiplier: 1.25,
                  reaction: "spread",
                  reactionDamage: 1000
                },
                {
                  after: 500,
                  attackerLevel: 90,
                  before: 1000,
                  defenseIgnore: 0,
                  defenseReduction: 0.3,
                  enemyLevel: 100,
                  kind: "defense",
                  multiplier: 0.5
                },
                {
                  after: 450,
                  baseResistance: 0.1,
                  before: 500,
                  effectiveResistance: 0.05,
                  element: "pyro",
                  kind: "resistance",
                  multiplier: 0.9,
                  resistance: 0.05,
                  resistanceReduction: 0.05
                },
                {
                  after: 1350,
                  before: 450,
                  hitCount: 3,
                  kind: "hit_count"
                },
                {
                  after: 5000,
                  baseDamage: 1446.8535,
                  before: 0,
                  bonus: 0,
                  elementalMastery: 1000,
                  hitCount: 2,
                  kind: "transformative_reaction",
                  multiplier: 3,
                  reaction: "hyperbloom"
                }
              ]
            }
          ]
        },
        stats: {
          attackPercent: 0,
          baseAttack: 1,
          critDamage: 0,
          critRate: 0,
          damageBonus: 0,
          effectiveAttack: 1,
          elementalMastery: 0,
          energyRecharge: 0,
          flatAttack: 0,
          resistanceReduction: 0,
          statContributions: [],
          talentMultiplier: 1
        }
      }
    }) as AnalysisResponse

    expect(Value.Check(AnalysisResponseSchema, response)).toBe(true)
    expect(response.evaluation.rotation.events[0]?.trace).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          baseMultiplier: 1.5,
          elementalMastery: 300,
          kind: "amplifying_reaction"
        }),
        expect.objectContaining({
          baseDamage: 1446.8535,
          elementalMastery: 200,
          kind: "additive_reaction",
          multiplier: 1.25
        }),
        expect.objectContaining({ attackerLevel: 90, enemyLevel: 100, kind: "defense" }),
        expect.objectContaining({
          baseResistance: 0.1,
          effectiveResistance: 0.05,
          kind: "resistance",
          resistance: 0.05,
          resistanceReduction: 0.05
        }),
        expect.objectContaining({ after: 1350, before: 450, hitCount: 3, kind: "hit_count" }),
        expect.objectContaining({
          baseDamage: 1446.8535,
          elementalMastery: 1000,
          hitCount: 2,
          kind: "transformative_reaction",
          multiplier: 3
        })
      ])
    )
  })

  it("preserves the independent Moon and stellar formula trace in the public response", () => {
    const response = Value.Clean(AnalysisResponseSchema, {
      analysis: {
        baselineExpectedDamage: 540,
        effectiveArtifacts: [],
        marginalSubstats: [],
        progressionGains: [],
        totalEffectiveRolls: 0,
        weapons: []
      },
      engineVersion: "test",
      evaluation: {
        appliedEffects: [],
        appliedBuffs: [],
        formulaAuthority: "rotation_events",
        teamState: emptyTeamState,
        result: {
          critDamage: 720,
          expectedDamage: 540,
          kind: "lunar_charged",
          nonCritDamage: 360,
          reactionCoefficient: 3,
          trace: [
            {
              after: 600,
              before: 200,
              formula: {
                kind: "special_reaction_coefficient",
                multiplier: 3,
                reactionKind: "lunar_charged"
              },
              source: "lunar_charged_base_coefficient",
              stage: "reaction_coefficient"
            }
          ]
        },
        rotation: {
          dpr: 540,
          dps: 540,
          duration: 1,
          events: [
            {
              appliedEffectIds: [],
              critDamage: 720,
              element: "electro",
              expectedDamage: 540,
              hitCount: 1,
              id: "test.lunar-charged.direct.single-special-reaction",
              nonCritDamage: 360,
              ownerId: "test.character",
              statSnapshotTime: 0,
              time: 0,
              trace: [
                {
                  after: 600,
                  before: 200,
                  formula: {
                    kind: "special_reaction_coefficient",
                    multiplier: 3,
                    reactionKind: "lunar_charged"
                  },
                  kind: "special_reaction",
                  stage: "reaction_coefficient"
                }
              ]
            }
          ]
        },
        stats: {
          attackPercent: 0,
          baseAttack: 1,
          critDamage: 0,
          critRate: 0,
          damageBonus: 0,
          effectiveAttack: 1,
          elementalMastery: 0,
          energyRecharge: 0,
          flatAttack: 0,
          resistanceReduction: 0,
          statContributions: [],
          talentMultiplier: 1
        }
      }
    }) as AnalysisResponse

    expect(Value.Check(AnalysisResponseSchema, response)).toBe(true)
    expect(response.evaluation.result).toMatchObject({ kind: "lunar_charged", reactionCoefficient: 3 })
    expect(response.evaluation.rotation.events[0]?.trace).toEqual([
      {
        after: 600,
        before: 200,
        formula: {
          kind: "special_reaction_coefficient",
          multiplier: 3,
          reactionKind: "lunar_charged"
        },
        kind: "special_reaction",
        stage: "reaction_coefficient"
      }
    ])
  })
})
