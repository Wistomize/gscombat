import {
  getCombatActionDefinition,
  listCombatMetrics,
  raidenNationalBuiltinBuild,
  type CombatMetricDefinition
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "../../src/app.js"

const app = buildApp()
const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(async () => {
  await app.close()
  gameData.close()
})

function createSupportMetricBuild(metric: Exclude<CombatMetricDefinition, { readonly kind: "damage" }>): CharacterBuild {
  const character = gameData.getCharacter(metric.characterId)
  if (!character) throw new Error(`Missing ${metric.characterId} from the pinned game-data snapshot`)
  const sourceAction = getCombatActionDefinition(metric.sourceActionId)
  if (!sourceAction) throw new Error(`Missing source action ${metric.sourceActionId} for ${metric.id}`)
  const weapon = gameData
    .listWeapons()
    .find(
      (candidate) =>
        candidate.weaponType === character.weaponType && gameData.getWeaponStat(candidate.id, "atk", 90, 6) !== undefined
    )
  if (!weapon) throw new Error(`Missing a level-90 compatible weapon for ${metric.characterId}`)
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.api.support-metric.${metric.characterId}`,
    characterId: metric.characterId,
    constellation: 0,
    label: `${metric.characterId} support metric API fixture`,
    talents: { burst: 10, normal: 10, skill: 10 },
    ...(metric.characterId === "Traveler"
      ? { variant: { element: sourceAction.travelerElement ?? "anemo", gender: "female", kind: "traveler" } }
      : {}),
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: weapon.id }
  }
}

function createFurinaSupportMetricBuild(constellation: 0 | 1): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.api.support-metric.furina.c${constellation}`,
    characterId: "Furina",
    constellation,
    label: `Furina C${constellation} support metric API fixture`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
  }
}

function createFurinaFanfareContext(build: CharacterBuild, fanfarePoints?: number) {
  return {
    ...(fanfarePoints === undefined ? {} : { actionParameters: { "fanfare-points": fanfarePoints } }),
    recipient: {
      buildId: build.buildId,
      currentHpFraction: 1,
      incomingHealingBonus: 0,
      isMoonsign: false,
      isWithinSourceArea: true,
      missingHp: 999_999
    },
    source: { currentHpFraction: 1 },
    teammates: []
  }
}

describe("support metric API system", () => {
  it("serializes every verified non-damage metric through real Fastify injection", async () => {
    const metrics = listCombatMetrics().filter(
      (metric): metric is Exclude<CombatMetricDefinition, { readonly kind: "damage" }> =>
        metric.kind !== "damage" && metric.status === "verified"
    )

    expect(metrics.length).toBeGreaterThan(0)
    for (const metric of metrics) {
      const build = createSupportMetricBuild(metric)
      const sourceAction = getCombatActionDefinition(metric.sourceActionId)
      const ratioParameter =
        metric.kind === "scalar" && metric.ratioScenarioParameter !== undefined
          ? sourceAction?.scenarioParameters?.find((parameter) => parameter.id === metric.ratioScenarioParameter?.parameterId)
          : undefined
      const response = await app.inject({
        method: "POST",
        payload: {
          build,
          context: {
            ...(ratioParameter ? { actionParameters: { [ratioParameter.id]: ratioParameter.minimumValue } } : {}),
            recipient: {
              buildId: build.buildId,
              currentHpFraction: 0.5,
              incomingHealingBonus: 0,
              isMoonsign: true,
              isWithinSourceArea: true,
              missingHp: 999_999
            },
            source: { currentHpFraction: 0.5 },
            teammates: []
          },
          metricId: metric.id
        },
        url: "/v1/support-metrics/evaluate"
      })

      expect(response.statusCode, `${metric.id}: ${response.body}`).toBe(200)
      expect(response.json()).toMatchObject({
        engineVersion: "support-metric-1",
        metric: { id: metric.id, kind: metric.kind }
      })
      expect(response.json().metric.label).not.toMatch(/C0|0命|零命/)
    }
  })

  it("uses Furina's configured constellation to resolve Fanfare defaults and manual bounds", async () => {
    const metricId = "furina.burst.let_the_people_rejoice.fanfare.damage_bonus"
    const furinaC0 = createFurinaSupportMetricBuild(0)
    const furinaC1 = createFurinaSupportMetricBuild(1)
    const c0Default = await app.inject({
      method: "POST",
      payload: { build: furinaC0, context: createFurinaFanfareContext(furinaC0), metricId },
      url: "/v1/support-metrics/evaluate"
    })
    const c1Default = await app.inject({
      method: "POST",
      payload: { build: furinaC1, context: createFurinaFanfareContext(furinaC1), metricId },
      url: "/v1/support-metrics/evaluate"
    })
    const c1InitialBurst = await app.inject({
      method: "POST",
      payload: { build: furinaC1, context: createFurinaFanfareContext(furinaC1, 150), metricId },
      url: "/v1/support-metrics/evaluate"
    })
    const c1BeforeInitialBurst = await app.inject({
      method: "POST",
      payload: { build: furinaC1, context: createFurinaFanfareContext(furinaC1, 149), metricId },
      url: "/v1/support-metrics/evaluate"
    })
    const c0OutOfRange = await app.inject({
      method: "POST",
      payload: { build: furinaC0, context: createFurinaFanfareContext(furinaC0, 400), metricId },
      url: "/v1/support-metrics/evaluate"
    })

    expect(c0Default.statusCode, c0Default.body).toBe(200)
    expect(c1Default.statusCode, c1Default.body).toBe(200)
    expect(c1InitialBurst.statusCode, c1InitialBurst.body).toBe(200)
    expect(c0Default.json().metric.value).toBeCloseTo(0.75)
    expect(c1Default.json().metric.value).toBeCloseTo(1)
    expect(c1InitialBurst.json().metric.value).toBeCloseTo(0.375)
    expect(c0OutOfRange.statusCode).toBe(500)
    expect(c0OutOfRange.json().message).toContain("from 0 to 300")
    expect(c1BeforeInitialBurst.statusCode).toBe(500)
    expect(c1BeforeInitialBurst.json().message).toContain("from 150 to 400")
  })
})
