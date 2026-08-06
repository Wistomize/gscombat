import {
  bennettNationalBuiltinBuild,
  getCombatActionDefinition,
  raidenNationalBuiltinBuild,
  supportedWeapons,
  xianglingNationalBuiltinBuild,
  xingqiuNationalBuiltinBuild
} from "@gscombat/content"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { analyzeScenario } from "../../../src/analysis/analyze.js"
import { evaluateScenario, raidenNationalBuiltinScenario } from "../../../src/scenario/evaluate.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

function withoutRaidenActionParameters() {
  const conditions = { ...raidenNationalBuiltinScenario.conditions }
  delete conditions.actionParameters
  return conditions
}

function countSelectableWeapons(weaponType: (typeof supportedWeapons)[number]["weaponType"]): number {
  return supportedWeapons.filter(
    (weapon) => weapon.weaponType === weaponType && (weapon.rarity === 4 || weapon.rarity === 5)
  ).length
}

describe("counterfactual scenario analysis", () => {
  it("uses only content-declared post-burst snapshot capabilities for full candidate effects", () => {
    const actionIds = [
      "cyno.burst.sacred_rite_wolfs_swiftness.pactsworn_pathclearer.normal.first_hit",
      "raiden.burst.initial_slash",
      "xiangling.burst.pyronado.reverse_vaporize",
      "xiao.burst.bane_of_all_evil.high_plunge"
    ] as const

    for (const actionId of actionIds) {
      expect(getCombatActionDefinition(actionId)?.deterministicSnapshotCapabilities).toEqual(["after_primary_burst"])
    }
    expect(
      getCombatActionDefinition("raiden.skill.transcendence_baleful_omen.initial_hit")?.deterministicSnapshotCapabilities
    ).toBeUndefined()
    expect(
      getCombatActionDefinition("xiangling.skill.guoba.single_flame_breath")?.deterministicSnapshotCapabilities
    ).toBeUndefined()
  })

  it("compares only selectable effect-audited weapons while freezing the rest of the scenario", () => {
    const analysis = analyzeScenario(raidenNationalBuiltinScenario, gameData)
    const evaluation = evaluateScenario(raidenNationalBuiltinScenario, gameData)

    expect(evaluation.actionExpectedDamage).toBeCloseTo(evaluation.rotation.dpr)
    expect(analysis.baselineExpectedDamage).toBeCloseTo(evaluation.actionExpectedDamage)
    expect(analysis.weapons).toHaveLength(countSelectableWeapons("polearm"))
    expect(analysis.weapons.find((weapon) => weapon.weaponId === "EngulfingLightning")?.refinement).toBe(1)
    expect(analysis.weapons.find((weapon) => weapon.weaponId === "EngulfingLightning")?.label).toBe("薙草之稻光")
    expect(analysis.weapons.find((weapon) => weapon.weaponId === "EngulfingLightning")?.expectedDamage).toBeCloseTo(
      evaluation.actionExpectedDamage
    )
    expect(analysis.weapons.find((weapon) => weapon.weaponId === "TheCatch")?.refinement).toBe(5)
    expect(analysis.weapons.some((weapon) => weapon.weaponId === "WavebreakersFin")).toBe(true)
    expect(analysis.weapons.find((weapon) => weapon.weaponId === "StaffOfHoma")?.label).toBe("护摩之杖")
    expect(analysis.weapons.every((weapon) => weapon.rarity === 4 || weapon.rarity === 5)).toBe(true)
    expect(analysis.weapons.every((weapon) => weapon.label !== weapon.weaponId)).toBe(true)
    expect(analysis.weapons.every((weapon) => Number.isFinite(weapon.gainRatio))).toBe(true)
  })

  it("scores one average roll of every substat and derives weighted effective rolls", () => {
    const analysis = analyzeScenario(raidenNationalBuiltinScenario, gameData)
    const gains = new Map(analysis.marginalSubstats.map((result) => [result.stat, result]))

    expect(gains.get("crit_damage")?.gainRatio).toBeGreaterThan(0)
    expect(gains.get("energy_recharge")?.gainRatio).toBeGreaterThan(0)
    expect(gains.get("hp")?.gainRatio).toBe(0)
    expect(Math.max(...analysis.marginalSubstats.map((result) => result.weight))).toBeCloseTo(1)
    expect(analysis.totalEffectiveRolls).toBeGreaterThan(0)
    expect(analysis.effectiveArtifacts).toHaveLength(5)
  })

  it("compares only weapons compatible with the selected primary character", () => {
    const analysis = analyzeScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: withoutRaidenActionParameters(),
        primary: bennettNationalBuiltinBuild,
        targetActionId: "bennett.burst.initial_hit",
        teammates: [raidenNationalBuiltinBuild, xianglingNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
      },
      gameData
    )

    expect(analysis.weapons).toHaveLength(countSelectableWeapons("sword"))
    expect(analysis.weapons.every((weapon) => Number.isFinite(weapon.expectedDamage))).toBe(true)
  })

  it("compares compatible bow weapons for a verified health-scaling target", () => {
    const yelan = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.yelan.weapon-comparison",
      characterId: "Yelan",
      talents: { ...raidenNationalBuiltinBuild.talents, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusWarbow" }
    }
    const analysis = analyzeScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: withoutRaidenActionParameters(),
        primary: yelan,
        targetActionId: "yelan.skill.lingering_lifeline.explosion",
        teammates: [raidenNationalBuiltinBuild, bennettNationalBuiltinBuild, xianglingNationalBuiltinBuild]
      },
      gameData
    )

    expect(analysis.weapons.map((weapon) => weapon.weaponId)).toEqual(
      expect.arrayContaining(["AquaSimulacra", "FavoniusWarbow"])
    )
    expect(analysis.weapons).toHaveLength(countSelectableWeapons("bow"))
  })

  it("re-evaluates Astral Vulture's Crimson Plumage against each candidate team's different-element tier", () => {
    const ganyu = {
      ...xianglingNationalBuiltinBuild,
      buildId: "test.ganyu.astral-vultures-candidate",
      characterId: "Ganyu",
      talents: { ...xianglingNationalBuiltinBuild.talents, normal: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusWarbow" }
    }
    const baseScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...withoutRaidenActionParameters(), activeEffectIds: [] },
      primary: ganyu,
      targetActionId: "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom"
    }
    const oneDifferentElementScenario = { ...baseScenario, teammates: [bennettNationalBuiltinBuild] }
    const twoDifferentElementScenario = {
      ...baseScenario,
      teammates: [bennettNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
    }
    const oneDifferentElementCandidate = analyzeScenario(oneDifferentElementScenario, gameData).weapons.find(
      (weapon) => weapon.weaponId === "AstralVulturesCrimsonPlumage"
    )
    const twoDifferentElementCandidate = analyzeScenario(twoDifferentElementScenario, gameData).weapons.find(
      (weapon) => weapon.weaponId === "AstralVulturesCrimsonPlumage"
    )

    expect(oneDifferentElementCandidate).toBeDefined()
    expect(twoDifferentElementCandidate).toBeDefined()
    if (!oneDifferentElementCandidate || !twoDifferentElementCandidate) {
      throw new Error("Expected Astral Vulture's Crimson Plumage candidates")
    }

    const expectedTwoDifferentElementScenario = {
      ...twoDifferentElementScenario,
      primary: {
        ...ganyu,
        weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AstralVulturesCrimsonPlumage" }
      }
    }

    expect(twoDifferentElementCandidate.expectedDamage).toBeGreaterThan(oneDifferentElementCandidate.expectedDamage)
    expect(twoDifferentElementCandidate.expectedDamage).toBeCloseTo(
      evaluateScenario(expectedTwoDifferentElementScenario, gameData).actionExpectedDamage,
      8
    )
  })

  it("evaluates Ballad of the Fjords against each candidate scenario's configured team elements", () => {
    const baseScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...withoutRaidenActionParameters(), activeEffectIds: [] },
      primary: xianglingNationalBuiltinBuild,
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize"
    }
    const twoElementScenario = { ...baseScenario, teammates: [raidenNationalBuiltinBuild] }
    const threeElementScenario = {
      ...baseScenario,
      teammates: [raidenNationalBuiltinBuild, xingqiuNationalBuiltinBuild]
    }
    const twoElementBallad = analyzeScenario(twoElementScenario, gameData).weapons.find(
      (weapon) => weapon.weaponId === "BalladOfTheFjords"
    )
    const threeElementBallad = analyzeScenario(threeElementScenario, gameData).weapons.find(
      (weapon) => weapon.weaponId === "BalladOfTheFjords"
    )

    expect(twoElementBallad).toBeDefined()
    expect(threeElementBallad).toBeDefined()
    if (!twoElementBallad || !threeElementBallad) throw new Error("Expected Ballad of the Fjords weapon candidates")

    const expectedThreeElementScenario = {
      ...threeElementScenario,
      primary: {
        ...threeElementScenario.primary,
        weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "BalladOfTheFjords" }
      }
    }

    expect(threeElementBallad.expectedDamage).toBeGreaterThan(twoElementBallad.expectedDamage)
    expect(threeElementBallad.expectedDamage).toBeCloseTo(
      evaluateScenario(expectedThreeElementScenario, gameData).actionExpectedDamage,
      8
    )
  })

  it("compares only selectable effect-audited catalyst weapons", () => {
    const ningguang = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.ningguang.weapon-comparison",
      characterId: "Ningguang",
      talents: { ...raidenNationalBuiltinBuild.talents, burst: 10 },
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FavoniusCodex" }
    }
    const analysis = analyzeScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: {
          ...withoutRaidenActionParameters(),
          activeEffectIds: []
        },
        primary: ningguang,
        targetActionId: "ningguang.burst.starshatter.full",
        teammates: []
      },
      gameData
    )

    expect(analysis.weapons.find((weapon) => weapon.weaponId === "FavoniusCodex")?.label).toBe("西风秘典")
    expect(analysis.weapons.find((weapon) => weapon.weaponId === "SkywardAtlas")?.label).toBe("天空之卷")
  })

  it("removes only unavailable known weapon active effects from weapon comparison candidates", () => {
    const xiangling = {
      ...xianglingNationalBuiltinBuild,
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SkywardSpine" }
    }
    const analysis = analyzeScenario(
      {
        ...raidenNationalBuiltinScenario,
        conditions: {
          ...withoutRaidenActionParameters(),
          activeEffectIds: ["weapon.skyward-spine.vacuum-blade"]
        },
        primary: xiangling,
        targetActionId: "xiangling.normal.auto.first_hit",
        teammates: []
      },
      gameData
    )

    expect(analysis.weapons.some((weapon) => weapon.weaponId === "SkywardSpine")).toBe(true)
    expect(analysis.weapons.every((weapon) => Number.isFinite(weapon.expectedDamage))).toBe(true)
  })

  it("uses a candidate weapon's deterministic full snapshot without inferring other active passives", () => {
    const baseScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutRaidenActionParameters(),
        activeEffectIds: []
      },
      primary: {
        ...xianglingNationalBuiltinBuild,
        weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "TheCatch" }
      },
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
      teammates: []
    }
    const analysis = analyzeScenario(baseScenario, gameData)
    const comparisonCandidate = analysis.weapons.find((weapon) => weapon.weaponId === "EngulfingLightning")
    const candidateWeapon = { ascension: 6, level: 90, refinement: 1, weaponId: "EngulfingLightning" }
    const manuallyFullScenario = {
      ...baseScenario,
      conditions: {
        ...baseScenario.conditions,
        activeEffectIds: ["weapon.engulfing-lightning.post-burst-energy-recharge"]
      },
      primary: { ...baseScenario.primary, weapon: candidateWeapon }
    }
    const manuallyAutomaticScenario = {
      ...baseScenario,
      primary: { ...baseScenario.primary, weapon: candidateWeapon }
    }

    expect(comparisonCandidate?.expectedDamage).toBeCloseTo(
      evaluateScenario(manuallyFullScenario, gameData).actionExpectedDamage,
      8
    )
    expect(comparisonCandidate?.expectedDamage).toBeCloseTo(
      evaluateScenario(manuallyAutomaticScenario, gameData).actionExpectedDamage,
      8
    )

    const guobaScenario = {
      ...baseScenario,
      targetActionId: "xiangling.skill.guoba.single_flame_breath"
    }
    const guobaComparisonCandidate = analyzeScenario(guobaScenario, gameData).weapons.find(
      (weapon) => weapon.weaponId === "EngulfingLightning"
    )
    const guobaCandidateScenario = {
      ...guobaScenario,
      primary: { ...guobaScenario.primary, weapon: candidateWeapon }
    }

    expect(guobaComparisonCandidate?.expectedDamage).toBeCloseTo(
      evaluateScenario(guobaCandidateScenario, gameData).actionExpectedDamage,
      8
    )
  })

  it("uses the burst-after-cast capability for Raiden's initial slash but not her skill", () => {
    const baseScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...raidenNationalBuiltinScenario.conditions,
        activeEffectIds: []
      },
      primary: {
        ...raidenNationalBuiltinBuild,
        weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "TheCatch" }
      }
    }
    const candidateWeapon = { ascension: 6, level: 90, refinement: 1, weaponId: "EngulfingLightning" }
    const comparisonCandidate = analyzeScenario(baseScenario, gameData).weapons.find(
      (weapon) => weapon.weaponId === "EngulfingLightning"
    )
    const manuallyFullScenario = {
      ...baseScenario,
      conditions: {
        ...baseScenario.conditions,
        activeEffectIds: ["weapon.engulfing-lightning.post-burst-energy-recharge"]
      },
      primary: { ...baseScenario.primary, weapon: candidateWeapon }
    }

    expect(comparisonCandidate?.expectedDamage).toBeCloseTo(
      evaluateScenario(manuallyFullScenario, gameData).actionExpectedDamage,
      8
    )

    const skillScenario = {
      ...baseScenario,
      conditions: {
        ...withoutRaidenActionParameters(),
        activeEffectIds: []
      },
      targetActionId: "raiden.skill.transcendence_baleful_omen.initial_hit"
    }
    const skillComparisonCandidate = analyzeScenario(skillScenario, gameData).weapons.find(
      (weapon) => weapon.weaponId === "EngulfingLightning"
    )
    const skillCandidateScenario = {
      ...skillScenario,
      primary: { ...skillScenario.primary, weapon: candidateWeapon }
    }

    expect(skillComparisonCandidate?.expectedDamage).toBeCloseTo(
      evaluateScenario(skillCandidateScenario, gameData).actionExpectedDamage,
      8
    )
  })

  it("keeps a teammate Thrilling Tales source across every weapon candidate while switching primary effects", () => {
    const thrillingTalesEffectId = "weapon.thrilling-tales-of-dragon-slayers.after-switch.party-attack-percent"
    const solarPearlEffectId = "weapon.solar-pearl.after-normal-hit.skill-burst-damage-bonus"
    const primary = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.ningguang.weapon-comparison.primary",
      characterId: "Ningguang",
      talents: { ...raidenNationalBuiltinBuild.talents, burst: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SolarPearl" }
    }
    const thrillingTalesHolder = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.barbara.thrilling-tales-holder",
      characterId: "Barbara",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "ThrillingTalesOfDragonSlayers" }
    }
    const scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutRaidenActionParameters(),
        activeEffectIds: [thrillingTalesEffectId, solarPearlEffectId]
      },
      primary,
      targetActionId: "ningguang.burst.starshatter.full",
      teammates: [thrillingTalesHolder]
    }

    const analysis = analyzeScenario(scenario, gameData)

    expect(analysis.weapons.some((weapon) => weapon.weaponId === "SolarPearl")).toBe(true)
    expect(analysis.weapons.some((weapon) => weapon.weaponId === "ThrillingTalesOfDragonSlayers")).toBe(false)
    for (const candidate of analysis.weapons) {
      const candidateScenario = {
        ...scenario,
        conditions: {
          ...scenario.conditions,
          activeEffectIds: [
            thrillingTalesEffectId,
            ...(candidate.weaponId === "SolarPearl" ? [solarPearlEffectId] : [])
          ],
          activeEffectSourceBuildIds: {
            [thrillingTalesEffectId]: thrillingTalesHolder.buildId,
            ...(candidate.weaponId === "SolarPearl" ? { [solarPearlEffectId]: primary.buildId } : {})
          }
        },
        primary: {
          ...primary,
          weapon: { ascension: 6, level: 90, refinement: candidate.refinement, weaponId: candidate.weaponId }
        }
      }

      expect(candidate.expectedDamage).toBeCloseTo(evaluateScenario(candidateScenario, gameData).actionExpectedDamage, 8)
    }
  })

  it("binds a teammate Freedom-Sworn source when the primary weapon candidate has the same weapon", () => {
    const skywardBladeEffectId = "weapon.skyward-blade.after-burst.additional-physical-damage"
    const freedomSwornAttackEffectId = "weapon.freedom-sworn.full-sigil.party-attack-percent"
    const freedomSwornDamageEffectId = "weapon.freedom-sworn.full-sigil.party-normal-charged-plunge-damage-bonus"
    const primary = {
      ...bennettNationalBuiltinBuild,
      buildId: "test.bennett.weapon-comparison.primary",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SkywardBlade" }
    }
    const freedomSwornHolder = {
      ...xingqiuNationalBuiltinBuild,
      buildId: "test.xingqiu.freedom-sworn-holder",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "FreedomSworn" }
    }
    const scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutRaidenActionParameters(),
        activeEffectIds: [skywardBladeEffectId, freedomSwornAttackEffectId, freedomSwornDamageEffectId]
      },
      primary,
      targetActionId: "bennett.normal.auto.first_hit",
      teammates: [freedomSwornHolder]
    }

    const analysis = analyzeScenario(scenario, gameData)

    expect(analysis.weapons.some((weapon) => weapon.weaponId === "FreedomSworn")).toBe(true)
    expect(analysis.weapons.some((weapon) => weapon.weaponId === "SkywardBlade")).toBe(true)
    for (const candidate of analysis.weapons) {
      const candidateScenario = {
        ...scenario,
        conditions: {
          ...scenario.conditions,
          activeEffectIds: [
            freedomSwornAttackEffectId,
            freedomSwornDamageEffectId,
            ...(candidate.weaponId === "SkywardBlade" ? [skywardBladeEffectId] : [])
          ],
          activeEffectSourceBuildIds: {
            [freedomSwornAttackEffectId]: freedomSwornHolder.buildId,
            [freedomSwornDamageEffectId]: freedomSwornHolder.buildId,
            ...(candidate.weaponId === "SkywardBlade" ? { [skywardBladeEffectId]: primary.buildId } : {})
          }
        },
        primary: {
          ...primary,
          weapon: { ascension: 6, level: 90, refinement: candidate.refinement, weaponId: candidate.weaponId }
        }
      }

      expect(candidate.expectedDamage).toBeCloseTo(evaluateScenario(candidateScenario, gameData).actionExpectedDamage, 8)
    }
  })

  it("keeps a partial-party Xiangling Burst baseline while skipping weapon candidates that require full-party energy", () => {
    const scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutRaidenActionParameters(),
        activeEffectIds: []
      },
      primary: xianglingNationalBuiltinBuild,
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
      teammates: []
    }

    const baseline = evaluateScenario(scenario, gameData)
    const analysis = analyzeScenario(scenario, gameData)

    expect(baseline.actionExpectedDamage).toBeGreaterThan(0)
    expect(analysis.baselineExpectedDamage).toBeCloseTo(baseline.actionExpectedDamage)
    expect(analysis.weapons.some((weapon) => weapon.weaponId === "WavebreakersFin")).toBe(false)
  })

  it("does not suppress a selected full-party-energy weapon's incomplete-party baseline error", () => {
    const scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: {
        ...withoutRaidenActionParameters(),
        activeEffectIds: []
      },
      primary: {
        ...xianglingNationalBuiltinBuild,
        weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "WavebreakersFin" }
      },
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
      teammates: []
    }

    expect(() => evaluateScenario(scenario, gameData)).toThrow(
      "Effect weapon.wavebreakers-fin.burst-damage-bonus requires a fully configured four-character party"
    )
    expect(() => analyzeScenario(scenario, gameData)).toThrow(
      "Effect weapon.wavebreakers-fin.burst-damage-bonus requires a fully configured four-character party"
    )
  })
})
