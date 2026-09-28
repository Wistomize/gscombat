import { afterAll, describe, expect, it } from "vitest"
import { raidenNationalBuiltinScenario, supportedCharacters } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { buildApp } from "../../src/app.js"

const app = buildApp()
const jean: CharacterBuild = { ...raidenNationalBuiltinScenario.primary, artifacts: [], characterId: "Jean",
  buildId: "support-choice.jean", constellation: 0,
  weapon: { weaponId: "BlackcliffLongsword", level: 90, ascension: 6, refinement: 1 } }
const metricId = "jean.burst.dandelion_breeze.party_healing"
const groupId = "blackcliff-longsword-defeated-enemy"
afterAll(async () => app.close())

describe("support weapon choice projection", () => {
  it("projects a source stat choice and uses its selected value in real healing evaluation", async () => {
    const options = await app.inject({ method: "POST", url: "/v1/action-effect-options",
      payload: { actionId: metricId, supportMetricId: metricId, primary: jean, teammates: [] } })
    expect(options.statusCode, options.body).toBe(200)
    expect(options.json().weaponChoices[0]).toMatchObject({ sourceBuildId: jean.buildId,
      choiceGroups: [{ id: groupId, defaultVariant: "none" }] })
    const evaluations = []
    for (const variant of ["none", "three-stack"]) {
      const response = await app.inject({ method: "POST", url: "/v1/support-metrics/evaluate",
        payload: { build: jean, metricId, context: { recipient: { buildId: jean.buildId },
          weaponEffectChoices: { [jean.buildId]: { [groupId]: variant } } } } })
      expect(response.statusCode, response.body).toBe(200)
      evaluations.push(response.json().metric)
    }
    expect(evaluations[1].scalingValue).toBeGreaterThan(evaluations[0].scalingValue)
    expect(evaluations[1].value - evaluations[0].value).toBeCloseTo(
      (evaluations[1].scalingValue - evaluations[0].scalingValue) * evaluations[0].percentage * (1 + evaluations[0].healingBonus))
  })

  it("uses the same unknown, on-field and off-field identities for support controls and source stats", async () => {
    const source = { ...jean, characterId: "Sayu", buildId: "support-choice.sayu",
      weapon: { ...jean.weapon, weaponId: "HereticsMoltenBlade" } }
    const metric = supportedCharacters.find((entry) => entry.characterId === "Sayu")!.supportMetrics![0]!
    const results: number[] = []
    for (const onFieldBuildId of [undefined, source.buildId, jean.buildId]) {
      const field = onFieldBuildId === undefined ? {} : { onFieldBuildId }
      const options = await app.inject({ method: "POST", url: "/v1/action-effect-options", payload: {
        actionId: metric.sourceActionId, supportMetricId: metric.id, primary: source, teammates: [jean],
        conditions: { activeEffectIds: [], enemyCount: 1, ...field } } })
      expect(options.statusCode, options.body).toBe(200)
      expect(options.json().weaponChoices.some((entry: { sourceBuildId: string }) => entry.sourceBuildId === source.buildId))
        .toBe(onFieldBuildId === source.buildId)
      const evaluation = await app.inject({ method: "POST", url: "/v1/support-metrics/evaluate", payload: {
        build: source, metricId: metric.id, context: { ...field, teammates: [jean],
          recipient: { buildId: jean.buildId, isWithinSourceArea: true, currentHpFraction: 0.5 },
          weaponEffectChoices: { [source.buildId]: { "heretics-molten-blade-movement": "maximum" } } } } })
      expect(evaluation.statusCode, evaluation.body).toBe(200)
      results.push(evaluation.json().metric.scalingValue)
    }
    expect(results[1]).toBeGreaterThan(results[0]!)
    expect(results[2]).toBe(results[0])
  })

  it("distinguishes a support metric reusing a damage action and hides pure damage groups", async () => {
    const shenhe = { ...jean, characterId: "Shenhe", buildId: "support-choice.shenhe",
      weapon: { ...jean.weapon, weaponId: "BlackcliffPole" } }
    const metric = supportedCharacters.find((entry) => entry.characterId === "Shenhe")!.supportMetrics![0]!
    const payload = { actionId: metric.sourceActionId, supportMetricId: metric.id, primary: shenhe,
      teammates: [jean], conditions: { activeEffectIds: [], enemyCount: 1, onFieldBuildId: jean.buildId } }
    const support = await app.inject({ method: "POST", url: "/v1/action-effect-options", payload })
    expect(support.statusCode, support.body).toBe(200)
    expect(support.json().weaponChoices.map((entry: { sourceBuildId: string }) => entry.sourceBuildId)).toEqual([shenhe.buildId])
    const damageWeaponJean = { ...jean, weapon: { ...jean.weapon, weaponId: "TheAlleyFlash" } }
    const damageOnly = await app.inject({ method: "POST", url: "/v1/action-effect-options", payload: {
      actionId: metricId, supportMetricId: metricId, primary: damageWeaponJean } })
    expect(damageOnly.statusCode, damageOnly.body).toBe(200)
    expect(damageOnly.json().weaponChoices).toEqual([])
  })

  it("rejects illegal support identities and explicit field conflicts without an internal server error", async () => {
    const damageAction = raidenNationalBuiltinScenario.targetActionId
    for (const payload of [
      { actionId: metricId, supportMetricId: metricId, primary: { ...jean, characterId: "Bennett" } },
      { actionId: damageAction, supportMetricId: metricId, primary: jean },
      { actionId: "yun_jin.burst.flying_cloud_flag_formation", supportMetricId: "yun_jin.constellation.6.decorous_harmony.flying_cloud_flag_formation.normal_attack_speed_bonus",
        primary: { ...jean, characterId: "YunJin", weapon: { ...jean.weapon, weaponId: "BlackcliffPole" } } }
    ]) {
      const response = await app.inject({ method: "POST", url: "/v1/action-effect-options", payload })
      expect(response.statusCode, response.body).toBeGreaterThanOrEqual(400)
      expect(response.statusCode).toBeLessThan(500)
    }
    for (const onFieldBuildId of ["missing-build", jean.buildId]) {
      const response = await app.inject({ method: "POST", url: "/v1/action-effect-options", payload: {
        actionId: damageAction, primary: raidenNationalBuiltinScenario.primary, teammates: [jean],
        conditions: { activeEffectIds: [], enemyCount: 1, onFieldBuildId } } })
      expect(response.statusCode, response.body).toBe(400)
      expect(response.json().message).toContain("前台")
    }
  })
})
