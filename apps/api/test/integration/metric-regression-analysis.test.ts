import { evaluateCombatMetric, evaluateScenario } from "@gscombat/analyzer"
import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { AnalysisResponse, CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "../../src/app.js"

const app = buildApp()
const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

function build(characterId: string, weaponId: string, constellation = 0): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    artifacts: [],
    buildId: `http-regression.${characterId}`,
    characterId,
    constellation,
    talents: { normal: 10, skill: 10, burst: 10 },
    weapon: { ascension: 6, level: 90, refinement: 5, weaponId }
  }
}

function scenario(primary: CharacterBuild, targetActionId: string, teammates: readonly CharacterBuild[] = []): EvaluationScenario {
  return {
    ...raidenNationalBuiltinScenario,
    conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
    externalBuffs: [],
    primary,
    targetActionId,
    teammates: [...teammates]
  }
}

async function analyze(input: EvaluationScenario): Promise<AnalysisResponse> {
  const response = await app.inject({ method: "POST", url: "/v1/analysis", payload: input })
  expect(response.statusCode, response.body).toBe(200)
  return response.json<AnalysisResponse>()
}

afterAll(async () => {
  await app.close()
  gameData.close()
})

describe("repaired metric public analysis consistency", () => {
  it("resolves all four legacy Mavuika no-reaction IDs and rejects a low-constellation C6 request", async () => {
    const primary = build("Mavuika", "FavoniusGreatsword", 6)
    for (const branch of ["flamestrider_crash", "scorching_ring"]) {
      const prefix = `mavuika.constellation.6.humanitys_name_unfettered.${branch}`
      const canonical = await analyze(scenario(primary, `${prefix}.none`))
      expect(canonical.analysis.baselineExpectedDamage).toBeGreaterThan(0)
      for (const reaction of ["melt", "vaporize"]) {
        const legacy = await analyze(scenario(primary, `${prefix}.${reaction}.no_reaction`))
        expect(legacy.analysis.baselineExpectedDamage).toBeCloseTo(canonical.analysis.baselineExpectedDamage, 8)
        expect(legacy.evaluation.rotation.dpr).toBeCloseTo(canonical.evaluation.rotation.dpr, 8)
        expect(legacy.analysis.marginalSubstats).toEqual(canonical.analysis.marginalSubstats)
      }
    }
    const response = await app.inject({
      method: "POST", url: "/v1/analysis",
      payload: scenario({ ...primary, constellation: 5 },
        "mavuika.constellation.6.humanitys_name_unfettered.flamestrider_crash.melt.no_reaction")
    })
    expect(response.statusCode, response.body).toBe(400)
    expect(response.body).toMatch(/constellation|命座/i)
  })

  it.each([
    ["Layla", "FavoniusSword", 0, "layla.burst.dream_of_the_star_stream_shaker.starlight_slug.single_hit", "atk", "hp"],
    ["Ifa", "FavoniusCodex", 6, "ifa.skill.airborne_disease_prevention.supporting_fire.held_remedy_bullet", "hp", "atk"]
  ] as const)("shares one evaluated baseline across the complete %s analysis", async (character, weapon, constellation, action, irrelevant, relevant) => {
    const input = scenario(build(character, weapon, constellation), action,
      character === "Ifa" ? [build("YunJin", "FavoniusLance")] : [])
    const response = await analyze(input)
    const baseline = evaluateScenario(input, gameData).actionExpectedDamage
    const metric = evaluateCombatMetric({ build: input.primary, gameData, metricId: action, scenario: input })
    expect(metric.kind).toBe("damage")
    expect(response.analysis.baselineExpectedDamage).toBeCloseTo(baseline, 8)
    expect(metric.value).toBeCloseTo(baseline, 8)
    expect(response.evaluation.rotation.dpr).toBeCloseTo(baseline, 8)
    expect(response.evaluation.rotation.events.reduce((sum, event) => sum + event.expectedDamage, 0)).toBeCloseTo(baseline, 8)

    const currentWeapon = response.analysis.weapons.find((candidate) => candidate.weaponId === weapon)
    expect(currentWeapon).toMatchObject({ refinement: 5, gainRatio: 0 })
    expect(currentWeapon!.expectedDamage).toBeCloseTo(baseline, 8)
    const alternate = response.analysis.weapons.find((candidate) => candidate.weaponId !== weapon)!
    expect(alternate).toBeDefined()
    const alternateDamage = evaluateScenario({ ...input, primary: { ...input.primary,
      weapon: { ...input.primary.weapon, weaponId: alternate.weaponId, refinement: alternate.refinement } } }, gameData).actionExpectedDamage
    expect(alternate.expectedDamage).toBeCloseTo(alternateDamage, 8)
    for (const candidate of response.analysis.weapons) {
      expect(Number.isFinite(candidate.expectedDamage)).toBe(true)
      expect(candidate.gainRatio).toBeCloseTo(candidate.expectedDamage / baseline - 1, 8)
    }

    expect(response.analysis.marginalSubstats.find((entry) => entry.stat === irrelevant)?.deltaDamage).toBe(0)
    expect(response.analysis.marginalSubstats.find((entry) => entry.stat === relevant)!.deltaDamage).toBeGreaterThan(0)
    for (const entry of response.analysis.marginalSubstats) {
      const improved = evaluateScenario(input, gameData, {
        artifactStatDeltas: { [entry.stat]: entry.averageRoll }
      }).actionExpectedDamage
      expect(entry.deltaDamage, entry.stat).toBeCloseTo(improved - baseline, 8)
      expect(entry.gainRatio, entry.stat).toBeCloseTo(entry.deltaDamage / baseline, 8)
    }
    if (character === "Ifa") {
      expect(response.evaluation.rotation.events).toHaveLength(2)
      expect(response.evaluation.rotation.events[1]!.trace.at(-1)).toMatchObject({
        kind: "trigger_probability", probability: 0.5
      })
      expect(response.evaluation.rotation.events[1]!.trace).toContainEqual(expect.objectContaining({
        kind: "scaling", flatDamage: expect.any(Number)
      }))
    }
  })
})
