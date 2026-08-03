import {
  bennettNationalBuiltinBuild,
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  xianglingNationalBuiltinBuild,
  xingqiuNationalBuiltinBuild
} from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { EFFECT_BENNETT_BURST_FIELD, evaluateScenario, raidenNationalBuiltinScenario } from "./scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

function withoutActionParameters(conditions: EvaluationScenario["conditions"]): EvaluationScenario["conditions"] {
  const normalizedConditions = { ...conditions }
  delete normalizedConditions.actionParameters
  return normalizedConditions
}

describe("team scenario", () => {
  it("derives Bennett, Noblesse, and Pyro resonance from configured teammates", () => {
    const evaluation = evaluateScenario(raidenNationalBuiltinScenario, gameData)

    expect(evaluation.appliedBuffs.map((buff) => buff.label)).toEqual(["热诚之火"])
    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "bennett.burst.field.attack_bonus",
          sourceId: bennettNationalBuiltinBuild.buildId,
          target: "flatAttack"
        }),
        expect.objectContaining({
          id: "bennett.constellation.1.grand_expectation.field_attack_bonus",
          sourceId: bennettNationalBuiltinBuild.buildId,
          target: "flatAttack"
        }),
        expect.objectContaining({
          id: "artifact.noblesse-oblige.4pc-attack",
          sourceId: bennettNationalBuiltinBuild.buildId,
          target: "attackPercent",
          value: 0.2
        })
      ])
    )
    expect(evaluation.result.expectedDamage).toBeGreaterThan(140_000)
  })

  it("derives Raiden's deterministic post-Burst weapon state through generic equipment effects exactly once", () => {
    const automaticallyResolved = evaluateScenario(raidenNationalBuiltinScenario, gameData)
    const withExplicitEngulfingState = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: {
          ...raidenNationalBuiltinScenario.conditions,
          activeEffectIds: [
            ...raidenNationalBuiltinScenario.conditions.activeEffectIds,
            "weapon.engulfing-lightning.post-burst-energy-recharge"
          ]
        }
      },
      gameData
    )
    const withBothNoblesseSelections = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: {
          ...raidenNationalBuiltinScenario.conditions,
          activeEffectIds: [
            ...raidenNationalBuiltinScenario.conditions.activeEffectIds,
            "artifact.noblesse-oblige.4pc-attack"
          ]
        }
      },
      gameData
    )

    expect(raidenNationalBuiltinScenario.conditions.activeEffectIds).not.toContain("raiden.weapon.burst")
    expect(automaticallyResolved.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.emblem-of-severed-fate.2pc.energy-recharge",
          target: "energyRecharge",
          value: 0.2
        }),
        expect.objectContaining({
          id: "artifact.emblem-of-severed-fate.4pc.burst-damage-bonus",
          target: "damageBonus",
          value: 0.75
        }),
        expect.objectContaining({
          id: "weapon.engulfing-lightning.energy-recharge-to-attack",
          target: "attackPercent"
        }),
        expect.objectContaining({
          id: "weapon.engulfing-lightning.post-burst-energy-recharge",
          target: "energyRecharge",
          value: 0.3
        })
      ])
    )
    expect(
      automaticallyResolved.appliedEffects.filter((effect) => effect.id === "artifact.noblesse-oblige.4pc-attack")
    ).toHaveLength(1)
    expect(automaticallyResolved.stats.energyRecharge).toBeCloseTo(3.31728)
    expect(withExplicitEngulfingState.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.engulfing-lightning.post-burst-energy-recharge",
          target: "energyRecharge",
          value: 0.3
        })
      ])
    )
    expect(withExplicitEngulfingState.stats.energyRecharge).toBeCloseTo(automaticallyResolved.stats.energyRecharge)
    expect(withExplicitEngulfingState.actionExpectedDamage).toBeCloseTo(automaticallyResolved.actionExpectedDamage)
    expect(withBothNoblesseSelections.stats.attackPercent).toBeCloseTo(automaticallyResolved.stats.attackPercent)
  })

  it("does not apply Bennett's field when the condition is disabled", () => {
    const evaluation = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: {
          ...raidenNationalBuiltinScenario.conditions,
          activeEffectIds: raidenNationalBuiltinScenario.conditions.activeEffectIds.filter(
            (effectId) => effectId !== "bennett.burst.field"
          )
        }
      },
      gameData
    )

    expect(evaluation.appliedBuffs.map((buff) => buff.label)).toEqual(["热诚之火"])
    expect(evaluation.appliedEffects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "bennett.burst.field.attack_bonus" }),
        expect.objectContaining({ id: "bennett.constellation.1.grand_expectation.field_attack_bonus" })
      ])
    )
  })

  it("derives a C6 teammate Bennett's Pyro damage bonus from Fantastic Voyage for Pyronado", () => {
    const bennettC5 = { ...bennettNationalBuiltinBuild, buildId: "test.xiangling.bennett-c5", constellation: 5 }
    const bennettC6 = { ...bennettC5, buildId: "test.xiangling.bennett-c6", constellation: 6 }
    const createScenario = (bennett: CharacterBuild, activeEffectIds: readonly string[]) => ({
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: [...activeEffectIds]
      },
      primary: { ...xianglingNationalBuiltinBuild, buildId: `test.xiangling.pyronado.${bennett.constellation}` },
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
      teammates: [raidenNationalBuiltinBuild, bennett, xingqiuNationalBuiltinBuild]
    })
    const c5Field = evaluateScenario(createScenario(bennettC5, [EFFECT_BENNETT_BURST_FIELD]), gameData)
    const c6Field = evaluateScenario(createScenario(bennettC6, [EFFECT_BENNETT_BURST_FIELD]), gameData)
    const c6WithoutField = evaluateScenario(createScenario(bennettC6, []), gameData)

    expect(c6Field.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "bennett.constellation.6.pyro_infusion",
          sourceId: bennettC6.buildId,
          target: "damageBonus",
          value: 0.15
        })
      ])
    )
    expect(c5Field.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "bennett.constellation.6.pyro_infusion" })])
    )
    expect(c6WithoutField.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "bennett.constellation.6.pyro_infusion" })])
    )
    expect(c6Field.stats.damageBonus - c5Field.stats.damageBonus).toBeCloseTo(0.15)
    expect(c6Field.actionExpectedDamage).toBeGreaterThan(c5Field.actionExpectedDamage)
  })

  it("rejects actions that are present in content but not verified damage calculations", () => {
    expect(() =>
      evaluateScenario(
        { ...raidenNationalBuiltinScenario, targetActionId: "bennett.burst.field" },
        gameData
      )
    ).toThrow("not registered as a verified damage action")
  })

  it("does not allow a verified action to run against a different primary character", () => {
    expect(() =>
      evaluateScenario(
        { ...raidenNationalBuiltinScenario, primary: raidenNationalBuiltinScenario.teammates[0]! },
        gameData
      )
    ).toThrow("belongs to RaidenShogun")
  })

  it("rejects a non-Traveler build that declares a Traveler variant", () => {
    expect(() =>
      evaluateScenario(
        {
          ...raidenNationalBuiltinScenario,
          primary: {
            ...raidenNationalBuiltinScenario.primary,
            variant: { element: "pyro", gender: "female", kind: "traveler" }
          }
        },
        gameData
      )
    ).toThrow("Only Traveler builds may declare a character variant")
  })

  it("derives Pyro resonance from a Traveler's selected element", () => {
    const travelerPyroBuild: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.traveler.pyro-female",
      characterId: "Traveler",
      variant: { element: "pyro", gender: "female", kind: "traveler" },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
    }
    const evaluation = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        teammates: [bennettNationalBuiltinBuild, travelerPyroBuild, xingqiuNationalBuiltinBuild]
      },
      gameData
    )

    expect(evaluation.appliedBuffs.map((buff) => buff.label)).toContain("热诚之火")
  })

  it("uses the Traveler's selected element Burst cost for Wavebreaker's Fin", () => {
    const travelerPyroBuild: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.traveler.pyro-male",
      characterId: "Traveler",
      variant: { element: "pyro", gender: "male", kind: "traveler" },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
    }

    const evaluation = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        primary: {
          ...raidenNationalBuiltinScenario.primary,
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "WavebreakersFin" }
        },
        teammates: [bennettNationalBuiltinBuild, travelerPyroBuild, xingqiuNationalBuiltinBuild]
      },
      gameData
    )

    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.wavebreakers-fin.burst-damage-bonus",
          value: 0.36
        })
      ])
    )
  })

  it("applies Ballad of the Fjords through Raiden's generic declared initial-slash evaluator", () => {
    const primary = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.raiden.ballad-of-the-fjords",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "BalladOfTheFjords" }
    }
    const twoElements = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        primary,
        teammates: [xianglingNationalBuiltinBuild, bennettNationalBuiltinBuild]
      },
      gameData
    )
    const threeElements = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        primary,
        teammates: [xianglingNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
      },
      gameData
    )

    expect(twoElements.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.ballad-of-the-fjords.team-elemental-mastery" })])
    )
    expect(threeElements.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.ballad-of-the-fjords.team-elemental-mastery",
          target: "elementalMastery",
          value: 120
        })
      ])
    )
    expect(threeElements.stats.elementalMastery).toBeCloseTo(twoElements.stats.elementalMastery + 120)
  })

  it("routes a verified declared direct action through the shared scenario buffs", () => {
    const evaluation = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        primary: bennettNationalBuiltinBuild,
        targetActionId: "bennett.burst.initial_hit",
        teammates: [raidenNationalBuiltinBuild, xianglingNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
      },
      gameData
    )

    expect(evaluation.stats.talentMultiplier).toBeCloseTo(4.1904)
    expect(evaluation.rotation.events).toHaveLength(1)
    expect(evaluation.result.expectedDamage).toBeGreaterThan(0)
  })

  it("applies Xiangling's built-in burst equipment, C3, and selected Guoba states", () => {
    const baseScenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: ["bennett.burst.field"]
      },
      primary: xianglingNationalBuiltinBuild,
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
      teammates: [bennettNationalBuiltinBuild, raidenNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
    }
    const baseline = evaluateScenario(baseScenario, gameData)
    const withGuobaStates = evaluateScenario(
      {
        ...baseScenario,
        conditions: {
          ...baseScenario.conditions,
          activeEffectIds: [
            "bennett.burst.field",
            "xiangling.guoba.chili.attack",
            "xiangling.guoba.c1.pyro_resistance_shred"
          ]
        }
      },
      gameData
    )

    expect(baseline.stats.critRate).toBeCloseTo(0.481)
    expect(baseline.stats.energyRecharge).toBeCloseTo(2.1774)
    expect(baseline.stats.damageBonus).toBeCloseTo(0.466 + 0.32 + baseline.stats.energyRecharge * 0.25)
    expect(baseline.stats.talentMultiplier).toBeCloseTo(2.38)
    expect(baseline.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "weapon.the-catch.burst-crit-rate", target: "critRate", value: 0.12 }),
        expect.objectContaining({ id: "weapon.the-catch.burst-damage-bonus", target: "damageBonus", value: 0.32 }),
        expect.objectContaining({
          id: "artifact.emblem-of-severed-fate.2pc.energy-recharge",
          target: "energyRecharge",
          value: 0.2
        }),
        expect.objectContaining({
          id: "artifact.emblem-of-severed-fate.4pc.burst-damage-bonus",
          target: "damageBonus",
          value: baseline.stats.energyRecharge * 0.25
        }),
        expect.objectContaining({ id: "xiangling.constellation.3.burst-talent-level", target: "talentLevel", value: 3 })
      ])
    )
    expect(withGuobaStates.stats.attackPercent).toBeCloseTo(baseline.stats.attackPercent + 0.1)
    expect(withGuobaStates.stats.resistanceReduction).toBeCloseTo(0.15)
    expect(withGuobaStates.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "xiangling.guoba.chili.attack", target: "attackPercent", value: 0.1 }),
        expect.objectContaining({
          id: "xiangling.guoba.c1.pyro_resistance_shred",
          target: "enemyResistanceReduction",
          value: 0.15
        })
      ])
    )
    expect(withGuobaStates.actionExpectedDamage).toBeGreaterThan(baseline.actionExpectedDamage)
  })

  it("keeps Xiangling's C1 Guoba Pyro RES reduction available at C6", () => {
    const c1EffectId = "xiangling.guoba.c1.pyro_resistance_shred"
    const c0Scenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: [c1EffectId]
      },
      primary: { ...xianglingNationalBuiltinBuild, buildId: "test.xiangling.c1-effect.c0", constellation: 0 },
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
      teammates: []
    }

    expect(() => evaluateScenario(c0Scenario, gameData)).toThrow(
      "Active effect xiangling.guoba.c1.pyro_resistance_shred requires Xiangling constellation 1"
    )

    const c6Evaluation = evaluateScenario(
      {
        ...c0Scenario,
        primary: { ...c0Scenario.primary, buildId: "test.xiangling.c1-effect.c6", constellation: 6 }
      },
      gameData
    )

    expect(c6Evaluation.stats.resistanceReduction).toBeCloseTo(0.15)
    expect(c6Evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: c1EffectId, target: "enemyResistanceReduction", value: 0.15 })
      ])
    )
  })

  it("applies Faruzan's selected C6 Crit DMG from a configured teammate only to Anemo actions", () => {
    const effectId = "faruzan.constellation.6.prayerful_wind.anemo_crit_damage"
    const primary: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.xiao.faruzan-c6",
      characterId: "Xiao",
      constellation: 0,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusLance" }
    }
    const faruzanC5: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.faruzan.c5",
      characterId: "Faruzan",
      constellation: 5,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const scenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: [effectId]
      },
      primary,
      targetActionId: "xiao.burst.bane_of_all_evil.high_plunge",
      teammates: [faruzanC5]
    }

    expect(() => evaluateScenario(scenario, gameData)).toThrow(
      "Active effect faruzan.constellation.6.prayerful_wind.anemo_crit_damage requires Faruzan constellation 6"
    )

    const baseline = evaluateScenario(
      { ...scenario, conditions: { ...scenario.conditions, activeEffectIds: [] }, teammates: [{ ...faruzanC5, constellation: 6 }] },
      gameData
    )
    const c6 = evaluateScenario(
      { ...scenario, teammates: [{ ...faruzanC5, buildId: "test.faruzan.c6", constellation: 6 }] },
      gameData
    )

    expect(c6.stats.critDamage).toBeCloseTo(baseline.stats.critDamage + 0.4)
    expect(c6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: "test.faruzan.c6", target: "critDamage", value: 0.4 })
      ])
    )
  })

  it("applies Deathmatch's single-target attack bonus to a generic core action", () => {
    const evaluation = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: {
          ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
          activeEffectIds: [],
          enemyCount: 1
        },
        primary: {
          ...xianglingNationalBuiltinBuild,
          buildId: "test.xiangling.deathmatch",
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "Deathmatch" }
        },
        targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
        teammates: []
      },
      gameData
    )

    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.deathmatch.single-target.attack",
          target: "attackPercent",
          value: 0.24
        })
      ])
    )
  })

  it("applies Deathmatch's multi-target defense bonus to a defense-scaled core action", () => {
    const yunJin: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.yun-jin.deathmatch",
      characterId: "YunJin",
      talents: { burst: 10, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "Deathmatch" }
    }
    const baseScenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: [],
        enemyCount: 1
      },
      primary: yunJin,
      targetActionId: "yun_jin.skill.opening_flourish.press",
      teammates: []
    }
    const singleTarget = evaluateScenario(baseScenario, gameData)
    const multiTarget = evaluateScenario(
      {
        ...baseScenario,
        conditions: { ...baseScenario.conditions, enemyCount: 2 }
      },
      gameData
    )

    expect(singleTarget.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ target: "defensePercent" })])
    )
    expect(multiTarget.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.deathmatch.multi-target.attack",
          target: "attackPercent",
          value: 0.16
        }),
        expect.objectContaining({
          id: "weapon.deathmatch.multi-target.defense",
          target: "defensePercent",
          value: 0.16
        })
      ])
    )
    expect(multiTarget.actionExpectedDamage).toBeCloseTo(singleTarget.actionExpectedDamage * 1.16)
  })

  it("applies Skyward Spine's CRIT Rate to a generic core action", () => {
    const evaluation = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: { ...withoutActionParameters(raidenNationalBuiltinScenario.conditions), activeEffectIds: [] },
        primary: {
          ...xianglingNationalBuiltinBuild,
          buildId: "test.xiangling.skyward-spine",
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SkywardSpine" }
        },
        targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
        teammates: []
      },
      gameData
    )

    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.skyward-spine.crit-rate",
          target: "critRate",
          value: 0.08
        })
      ])
    )
  })

  it("adds Skyward Spine's cooldown-ready Vacuum Blade as a separate physical normal-attack event", () => {
    const baseScenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: []
      },
      primary: {
        ...xianglingNationalBuiltinBuild,
        buildId: "test.xiangling.skyward-spine-vacuum-blade-r1",
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SkywardSpine" }
      },
      targetActionId: "xiangling.normal.auto.first_hit",
      teammates: []
    }
    const withoutCooldownReady = evaluateScenario(baseScenario, gameData)
    const withCooldownReady = evaluateScenario(
      {
        ...baseScenario,
        conditions: {
          ...baseScenario.conditions,
          activeEffectIds: ["weapon.skyward-spine.vacuum-blade"]
        }
      },
      gameData
    )

    expect(withoutCooldownReady.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.skyward-spine.vacuum-blade" })])
    )
    expect(withoutCooldownReady.rotation.events).toHaveLength(1)
    expect(withCooldownReady.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.skyward-spine.vacuum-blade",
          target: "additionalDamageEvent",
          value: 0.2
        })
      ])
    )
    const vacuumBlade = withCooldownReady.rotation.events.find(
      (event) => event.id === "xiangling.normal.auto.first_hit.weapon.skyward-spine.vacuum-blade"
    )
    expect(vacuumBlade).toMatchObject({ element: "physical", hitCount: 1 })
    expect(vacuumBlade?.elementalApplication).toBeUndefined()
    expect(vacuumBlade?.trace[0]).toMatchObject({ coefficient: 0.2, kind: "scaling", stat: "attack" })
  })

  it("uses Skyward Spine's R5 Vacuum Blade expected coefficient on an explicitly charged attack", () => {
    const chargedAction = getCombatActionDefinition(
      "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize"
    )
    expect(chargedAction?.attackKind).toBe("charged")

    const evaluation = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: {
          ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
          activeEffectIds: ["weapon.skyward-spine.vacuum-blade"]
        },
        primary: {
          ...xianglingNationalBuiltinBuild,
          buildId: "test.hu-tao.skyward-spine-vacuum-blade-r5",
          characterId: "HuTao",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "SkywardSpine" }
        },
        targetActionId: "hu_tao.skill.guide_to_afterlife.paramita_papilio.charged_attack.hydro_aura_vaporize",
        teammates: []
      },
      gameData
    )

    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.skyward-spine.vacuum-blade",
          target: "additionalDamageEvent",
          value: 0.5
        })
      ])
    )
    const vacuumBlade = evaluation.rotation.events.find(
      (event) => event.id.endsWith("weapon.skyward-spine.vacuum-blade")
    )
    expect(vacuumBlade?.trace[0]).toMatchObject({ coefficient: 0.5, kind: "scaling", stat: "attack" })
    expect(vacuumBlade?.trace.some((entry) => entry.kind === "amplifying_reaction")).toBe(false)
    expect(vacuumBlade?.trace.find((entry) => entry.kind === "damage_bonus")).toMatchObject({ bonus: 0 })
  })

  it("does not add Skyward Spine's Vacuum Blade to plunge, Skill, or Burst actions", () => {
    const skywardXiangling: CharacterBuild = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.xiangling.skyward-spine-ineligible-actions",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SkywardSpine" }
    }
    const skywardXiao: CharacterBuild = {
      ...skywardXiangling,
      buildId: "test.xiao.skyward-spine-plunge",
      characterId: "Xiao",
      talents: { burst: 10, normal: 10, skill: 10 }
    }
    const conditions = {
      ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
      activeEffectIds: ["weapon.skyward-spine.vacuum-blade"]
    }
    const evaluations = [
      evaluateScenario(
        {
          ...raidenNationalBuiltinScenario,
          conditions,
          primary: skywardXiao,
          targetActionId: "xiao.burst.bane_of_all_evil.high_plunge",
          teammates: []
        },
        gameData
      ),
      evaluateScenario(
        {
          ...raidenNationalBuiltinScenario,
          conditions,
          primary: skywardXiangling,
          targetActionId: "xiangling.skill.guoba.single_flame_breath",
          teammates: []
        },
        gameData
      ),
      evaluateScenario(
        {
          ...raidenNationalBuiltinScenario,
          conditions,
          primary: skywardXiangling,
          targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
          teammates: []
        },
        gameData
      )
    ]

    for (const evaluation of evaluations) {
      expect(evaluation.appliedEffects).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: "weapon.skyward-spine.vacuum-blade" })])
      )
      expect(evaluation.rotation.events).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: expect.stringContaining("vacuum-blade") })])
      )
    }
  })

  it("applies Aquila Favonia's attack bonus to a generic core action", () => {
    const evaluation = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: { ...withoutActionParameters(raidenNationalBuiltinScenario.conditions), activeEffectIds: [] },
        primary: {
          ...bennettNationalBuiltinBuild,
          buildId: "test.bennett.aquila-favonia",
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
        },
        targetActionId: "bennett.burst.initial_hit",
        teammates: []
      },
      gameData
    )

    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.aquila-favonia.attack",
          target: "attackPercent",
          value: 0.2
        })
      ])
    )
  })

  it("applies Noblesse Oblige's two-piece Burst bonus to a generic core action", () => {
    const evaluation = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: { ...withoutActionParameters(raidenNationalBuiltinScenario.conditions), activeEffectIds: [] },
        primary: {
          ...xianglingNationalBuiltinBuild,
          artifacts: xianglingNationalBuiltinBuild.artifacts.map((piece) => ({ ...piece, setId: "NoblesseOblige" })),
          buildId: "test.xiangling.noblesse-oblige",
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "Deathmatch" }
        },
        targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
        teammates: []
      },
      gameData
    )

    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.noblesse-oblige.2pc.burst-damage-bonus",
          target: "damageBonus",
          value: 0.2
        })
      ])
    )
  })

  it("automatically applies the reachable Noblesse Oblige four-piece snapshot from a teammate", () => {
    const baseScenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: [],
        equipmentEffectMode: "maximum_reachable"
      },
      primary: {
        ...xianglingNationalBuiltinBuild,
        buildId: "test.xiangling.noblesse-recipient",
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "Deathmatch" }
      },
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
      teammates: [bennettNationalBuiltinBuild]
    }
    const withoutNoblesse = evaluateScenario(baseScenario, gameData)
    const withNoblesse = evaluateScenario(
      {
        ...baseScenario,
        conditions: {
          ...baseScenario.conditions,
          activeEffectIds: ["artifact.noblesse-oblige.4pc-attack"]
        }
      },
      gameData
    )

    expect(withNoblesse.stats.attackPercent).toBeCloseTo(withoutNoblesse.stats.attackPercent)
    expect(withoutNoblesse.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "artifact.noblesse-oblige.4pc-attack",
          sourceId: bennettNationalBuiltinBuild.buildId,
          target: "attackPercent",
          value: 0.2
        })
      ])
    )
  })

  it("applies Wavebreaker's Fin from the configured full-party Burst costs", () => {
    const evaluation = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: { ...withoutActionParameters(raidenNationalBuiltinScenario.conditions), activeEffectIds: [] },
        primary: {
          ...xianglingNationalBuiltinBuild,
          buildId: "test.xiangling.wavebreakers-fin",
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "WavebreakersFin" }
        },
        targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
        teammates: [bennettNationalBuiltinBuild, raidenNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
      },
      gameData
    )

    const wavebreakersFin = evaluation.appliedEffects.find(
      (effect) => effect.id === "weapon.wavebreakers-fin.burst-damage-bonus"
    )

    expect(wavebreakersFin).toMatchObject({ target: "damageBonus" })
    expect(wavebreakersFin?.value).toBeCloseTo(0.372)
  })

  it("derives Engulfing Lightning's deterministic post-Burst ER before converting ER to attack", () => {
    const baseScenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...withoutActionParameters(raidenNationalBuiltinScenario.conditions), activeEffectIds: [] },
      primary: {
        ...xianglingNationalBuiltinBuild,
        buildId: "test.xiangling.engulfing-lightning",
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "EngulfingLightning" }
      },
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
      teammates: []
    }
    const automaticallyResolved = evaluateScenario(baseScenario, gameData)
    const explicitlySelected = evaluateScenario(
      {
        ...baseScenario,
        conditions: {
          ...baseScenario.conditions,
          activeEffectIds: ["weapon.engulfing-lightning.post-burst-energy-recharge"]
        }
      },
      gameData
    )
    const attackConversion = automaticallyResolved.appliedEffects.find(
      (effect) => effect.id === "weapon.engulfing-lightning.energy-recharge-to-attack"
    )

    expect(automaticallyResolved.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.engulfing-lightning.post-burst-energy-recharge",
          target: "energyRecharge",
          value: 0.3
        })
      ])
    )
    expect(automaticallyResolved.stats.energyRecharge).toBeCloseTo(2.56928)
    expect(explicitlySelected.stats.energyRecharge).toBeCloseTo(automaticallyResolved.stats.energyRecharge)
    expect(explicitlySelected.actionExpectedDamage).toBeCloseTo(automaticallyResolved.actionExpectedDamage)
    expect(attackConversion).toMatchObject({ target: "attackPercent" })
    expect(attackConversion?.value).toBeCloseTo((automaticallyResolved.stats.energyRecharge - 1) * 0.28)
  })

  it("does not retain a manually supplied deterministic post-Burst state for an action without that state", () => {
    const baseScenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...withoutActionParameters(raidenNationalBuiltinScenario.conditions), activeEffectIds: [] },
      primary: {
        ...xianglingNationalBuiltinBuild,
        buildId: "test.xiangling.engulfing-lightning-guoba",
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "EngulfingLightning" }
      },
      targetActionId: "xiangling.skill.guoba.single_flame_breath",
      teammates: []
    }
    const withoutInjectedState = evaluateScenario(baseScenario, gameData)
    const withInjectedState = evaluateScenario(
      {
        ...baseScenario,
        conditions: {
          ...baseScenario.conditions,
          activeEffectIds: ["weapon.engulfing-lightning.post-burst-energy-recharge"]
        }
      },
      gameData
    )

    expect(withInjectedState.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.engulfing-lightning.post-burst-energy-recharge" })])
    )
    expect(withInjectedState.stats.energyRecharge).toBeCloseTo(withoutInjectedState.stats.energyRecharge)
    expect(withInjectedState.actionExpectedDamage).toBeCloseTo(withoutInjectedState.actionExpectedDamage)
  })

  it("applies Aqua Simulacra's HP and selected nearby-enemy damage bonuses to a core action", () => {
    const baseScenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: [],
        equipmentEffectMode: "maximum_reachable"
      },
      primary: {
        ...raidenNationalBuiltinBuild,
        buildId: "test.yelan.aqua-simulacra",
        characterId: "Yelan",
        constellation: 0,
        talents: { burst: 10, normal: 6, skill: 10 },
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquaSimulacra" }
      },
      targetActionId: "yelan.skill.lingering_lifeline.explosion",
      teammates: []
    }
    const withoutNearbyEnemy = evaluateScenario(baseScenario, gameData)
    const withNearbyEnemy = evaluateScenario(
      {
        ...baseScenario,
        conditions: {
          ...baseScenario.conditions,
          activeEffectIds: ["weapon.aqua-simulacra.nearby-enemy-damage-bonus"]
        }
      },
      gameData
    )

    expect(withoutNearbyEnemy.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "weapon.aqua-simulacra.hp-percent",
          target: "hpPercent",
          value: 0.16
        })
      ])
    )
    expect(withNearbyEnemy.stats.damageBonus).toBeCloseTo(withoutNearbyEnemy.stats.damageBonus)
    expect(withNearbyEnemy.actionExpectedDamage).toBeCloseTo(withoutNearbyEnemy.actionExpectedDamage)
  })

  it("resolves a declared evaluator's bounded manual snapshot inputs through the shared action parameter path", () => {
    const withResolveStacks = (resolveStacks: number) => ({
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...raidenNationalBuiltinScenario.conditions,
        actionParameters: { "resolve-stack-count": resolveStacks }
      }
    })
    const zeroStacks = evaluateScenario(withResolveStacks(0), gameData)
    const sixtyStacks = evaluateScenario(withResolveStacks(60), gameData)

    expect(zeroStacks.stats.actionParameters).toEqual({ "resolve-stack-count": 0 })
    expect(sixtyStacks.stats.actionParameters).toEqual({ "resolve-stack-count": 60 })
    expect(sixtyStacks.rotation.dpr).toBeGreaterThan(zeroStacks.rotation.dpr)
    expect(sixtyStacks.rotation.dpr).toBeGreaterThan(0)
    expect(() => evaluateScenario(withResolveStacks(-1), gameData)).toThrow("must be an allowed integer from 0 to 60")
    expect(() => evaluateScenario(withResolveStacks(61), gameData)).toThrow("must be an allowed integer from 0 to 60")
    expect(() =>
      evaluateScenario(
        {
          ...raidenNationalBuiltinScenario,
          conditions: {
            ...raidenNationalBuiltinScenario.conditions,
            actionParameters: { "unknown-stack": 1 }
          }
        },
        gameData
      )
    ).toThrow("does not declare scenario parameter unknown-stack")
  })

  it("requires Xingqiu C6 before a Raincutter volley may use the five-sword snapshot", () => {
    const baseScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: [],
        actionParameters: { "rain-sword-hit-count": 5 }
      },
      primary: { ...xingqiuNationalBuiltinBuild, buildId: "test.xingqiu.rain-sword-c5", constellation: 5 },
      targetActionId: "xingqiu.burst.raincutter.rain_sword.single_volley",
      teammates: []
    }

    expect(() => evaluateScenario(baseScenario, gameData)).toThrow(
      "Scenario parameter rain-sword-hit-count value 5 for action xingqiu.burst.raincutter.rain_sword.single_volley requires source constellation 6"
    )

    const c6 = evaluateScenario(
      {
        ...baseScenario,
        primary: { ...baseScenario.primary, buildId: "test.xingqiu.rain-sword-c6", constellation: 6 }
      },
      gameData
    )

    expect(c6.stats.actionParameters).toEqual({ "rain-sword-hit-count": 5 })
    expect(c6.rotation.events).toEqual([
      expect.objectContaining({ hitCount: 5, id: expect.stringContaining("rain-sword-volley") })
    ])
  })

  it("derives Bennett C6's field effects from the selected Fantastic Voyage snapshot", () => {
    const c6Build: CharacterBuild = {
      ...bennettNationalBuiltinBuild,
      artifacts: bennettNationalBuiltinBuild.artifacts.map((artifact) => ({
        ...artifact,
        setId: "CrimsonWitchOfFlames"
      })),
      buildId: "test.bennett.normal-c6",
      constellation: 6,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "MistsplitterReforged" }
    }
    const c5Scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: ["bennett.burst.field"]
      },
      primary: { ...bennettNationalBuiltinBuild, buildId: "test.bennett.normal-c5", constellation: 5 },
      targetActionId: "bennett.normal.auto.first_hit",
      teammates: []
    }

    const c5 = evaluateScenario(c5Scenario, gameData)

    const c6 = evaluateScenario(
      {
        ...c5Scenario,
        primary: c6Build
      },
      gameData
    )
    const uninfusedC6 = evaluateScenario(
      {
        ...c5Scenario,
        conditions: { ...c5Scenario.conditions, activeEffectIds: [] },
        primary: c6Build
      },
      gameData
    )

    expect(c6.rotation.events).toEqual([expect.objectContaining({ element: "pyro" })])
    expect(c5.rotation.events).toEqual([expect.objectContaining({ element: "physical" })])
    expect(uninfusedC6.appliedEffects).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "artifact.crimson-witch-of-flames.2pc.pyro-damage-bonus" }),
        expect.objectContaining({ id: "weapon.mistsplitter-reforged.all-element-damage-bonus" })
      ])
    )
    expect(c6.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "artifact.crimson-witch-of-flames.2pc.pyro-damage-bonus", value: 0.15 }),
        expect.objectContaining({ id: "weapon.mistsplitter-reforged.all-element-damage-bonus", value: 0.12 }),
        expect.objectContaining({ id: "bennett.constellation.6.pyro_infusion", value: 0.15 })
      ])
    )
    expect(c6.rotation.dpr).toBeGreaterThan(uninfusedC6.rotation.dpr)
  })

  it("applies element-filtered resistance reduction to an owned physical proc without buffing the Pyro trigger", () => {
    const klee: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.klee.eye-of-perception",
      characterId: "Klee",
      constellation: 0,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "EyeOfPerception" }
    }
    const venti: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.venti.c2",
      characterId: "Venti",
      constellation: 2,
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const baseScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: ["weapon.eye-of-perception.initial-projectile.physical-hit"]
      },
      primary: klee,
      targetActionId: "klee.normal.charged_attack.single_hit",
      teammates: [venti]
    }
    const baseline = evaluateScenario(baseScenario, gameData)
    const debuffed = evaluateScenario(
      {
        ...baseScenario,
        conditions: {
          ...baseScenario.conditions,
          activeEffectIds: [
            ...baseScenario.conditions.activeEffectIds,
            "venti.skyward_sonnet.c2.physical_resistance_shred"
          ]
        }
      },
      gameData
    )
    const procId = "weapon.eye-of-perception.initial-projectile.physical-hit"
    const baselinePrimary = baseline.rotation.events.find((event) => !event.id.includes(procId))
    const debuffedPrimary = debuffed.rotation.events.find((event) => !event.id.includes(procId))
    const baselineProc = baseline.rotation.events.find((event) => event.id.includes(procId))
    const debuffedProc = debuffed.rotation.events.find((event) => event.id.includes(procId))

    expect(debuffed.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "venti.skyward_sonnet.c2.physical_resistance_shred" })])
    )
    expect(baselinePrimary?.expectedDamage).toBeCloseTo(debuffedPrimary?.expectedDamage ?? 0)
    expect(baselineProc).toMatchObject({ element: "physical" })
    expect(debuffedProc?.expectedDamage).toBeGreaterThan(baselineProc?.expectedDamage ?? 0)
    expect(debuffedProc?.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "resistance", resistanceReduction: 0.12 })])
    )
  })

  it("resolves Navia's actual Crystalshot shard hits within the selected Crystal Shrapnel limit", () => {
    const naviaBuild: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.navia.primary",
      characterId: "Navia",
      talents: { ...raidenNationalBuiltinBuild.talents, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusGreatsword" }
    }
    const baseScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: []
      },
      primary: naviaBuild,
      targetActionId: "navia.skill.ceremonial_crystalshot",
      teammates: []
    }
    const fullHit = evaluateScenario(baseScenario, gameData)
    const sevenHit = evaluateScenario(
      {
        ...baseScenario,
        conditions: {
          ...baseScenario.conditions,
          actionParameters: { "crystal-shrapnel-count": 1, "rosula-shard-hit-count": 7 }
        }
      },
      gameData
    )

    expect(fullHit.stats.actionParameters).toEqual({
      "crystal-shrapnel-count": 3,
      "rosula-shard-hit-count": 11
    })
    expect(sevenHit.stats.actionParameters).toEqual({
      "crystal-shrapnel-count": 1,
      "rosula-shard-hit-count": 7
    })
    expect(sevenHit.rotation.dpr / fullHit.rotation.dpr).toBeCloseTo(0.7)
    expect(() =>
      evaluateScenario(
        {
          ...baseScenario,
          conditions: {
            ...baseScenario.conditions,
            actionParameters: { "crystal-shrapnel-count": 1, "rosula-shard-hit-count": 8 }
          }
        },
        gameData
      )
    ).toThrow("must not exceed 7")
  })

  it("resolves Ningguang's complete Starshatter as six or twelve gems only", () => {
    const ningguangBuild: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.ningguang.primary",
      characterId: "Ningguang",
      talents: { ...raidenNationalBuiltinBuild.talents, burst: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusCodex" }
    }
    const baseScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: []
      },
      primary: ningguangBuild,
      targetActionId: "ningguang.burst.starshatter.full",
      teammates: []
    }
    const twelveGem = evaluateScenario(baseScenario, gameData)
    const sixGem = evaluateScenario(
      {
        ...baseScenario,
        conditions: { ...baseScenario.conditions, actionParameters: { "starshatter-gem-count": 6 } }
      },
      gameData
    )

    expect(twelveGem.rotation.events[0]).toMatchObject({ hitCount: 12 })
    expect(sixGem.rotation.events[0]).toMatchObject({ hitCount: 6 })
    expect(sixGem.rotation.dpr / twelveGem.rotation.dpr).toBeCloseTo(0.5)
    expect(() =>
      evaluateScenario(
        {
          ...baseScenario,
          conditions: { ...baseScenario.conditions, actionParameters: { "starshatter-gem-count": 9 } }
        },
        gameData
      )
    ).toThrow("allowed")
  })

  it("derives Chongyun's source-locked Cryo infusion and event reaction from the active field", () => {
    const chongyunBuild: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.chongyun.primary",
      characterId: "Chongyun",
      talents: { ...raidenNationalBuiltinBuild.talents, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusGreatsword" }
    }
    const baseScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: [],
        targetAuraWindows: [{ element: "pyro" as const, end: 1, id: "target.pyro", start: 0 }]
      },
      primary: chongyunBuild,
      targetActionId: "chongyun.normal.auto.first_hit",
      teammates: []
    }
    const uninfused = evaluateScenario(baseScenario, gameData)
    const infused = evaluateScenario(
      {
        ...baseScenario,
        conditions: {
          ...baseScenario.conditions,
          activeEffectIds: ["chongyun.skill.chonghuas_frost_field"]
        }
      },
      gameData
    )

    expect(uninfused.rotation.events[0]).toMatchObject({
      element: "physical",
      elementalApplication: { applied: false }
    })
    expect(infused.rotation.events[0]).toMatchObject({
      element: "cryo",
      elementOverride: {
        baseElement: "physical",
        element: "cryo",
        id: "chongyun.skill.chonghuas_frost_field"
      },
      elementalApplication: { applied: true, reaction: "melt_reverse" }
    })
    expect(infused.rotation.dpr).toBeGreaterThan(infused.result.expectedDamage)
  })

  it("applies Chongyun's active field to a separately configured eligible melee teammate", () => {
    const chongyunTeammate: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.chongyun.field-source",
      characterId: "Chongyun",
      talents: { ...raidenNationalBuiltinBuild.talents, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusGreatsword" }
    }
    const alhaithamPrimary: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.alhaitham.primary",
      characterId: "Alhaitham",
      talents: { ...raidenNationalBuiltinBuild.talents, normal: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
    }
    const evaluation = evaluateScenario(
      {
        ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutActionParameters(raidenNationalBuiltinScenario.conditions),
        activeEffectIds: ["chongyun.skill.chonghuas_frost_field"],
          targetAuraWindows: [{ element: "pyro", end: 1, id: "target.pyro", start: 0 }]
        },
        primary: alhaithamPrimary,
        targetActionId: "alhaitham.normal.auto.first_hit",
        teammates: [chongyunTeammate]
      },
      gameData
    )

    expect(evaluation.rotation.events[0]).toMatchObject({
      element: "cryo",
      elementOverride: { id: "chongyun.skill.chonghuas_frost_field" },
      elementalApplication: { applied: true, reaction: "melt_reverse" }
    })
  })
})
