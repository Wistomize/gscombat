import { getCombatActionDefinition, listCombatMetrics, raidenNationalBuiltinScenario } from "@gscombat/content"
import { afterEach, describe, expect, it, vi } from "vitest"

import { buildApp } from "../../src/app.js"
import { resolveActionScenarioParameters } from "../../../../packages/analyzer/src/evaluators/scenario-parameters.js"
import { ApiServiceError } from "../../src/services/http-errors.js"

const applications: ReturnType<typeof buildApp>[] = []
function createApp() {
  const app = buildApp()
  applications.push(app)
  return app
}

afterEach(async () => {
  await Promise.all(applications.splice(0).map(app => app.close()))
  vi.restoreAllMocks()
})

describe("HTTP domain errors", () => {
  it("classifies caller choices across old and core entrypoints while bad declarations stay internal", async () => {
    const app = createApp()
    const diagnostic = vi.spyOn(process.stderr, "write").mockImplementation(() => true)
    const base = structuredClone(raidenNationalBuiltinScenario)
    const action = getCombatActionDefinition(base.targetActionId)!
    app.post("/test/bad-declaration", async () => resolveActionScenarioParameters({ ...action, scenarioParameters: [{
      id: "bad-default", label: "bad-default", minimumValue: 0, maximumValue: 1, defaultValue: 2
    }] }, undefined, 0))
    for (const [scenario, code] of [
      [{ ...base, targetActionId: "unknown-action" }, "invalid_metric"],
      [{ ...base, primary: { ...base.primary,
        artifacts: base.primary.artifacts.map(piece => ({ ...piece, slot: "flower" })) } }, "invalid_build"],
      [{ ...base, targetActionId: listCombatMetrics().find(metric => metric.kind === "damage" && metric.characterId === "Xiangling")!.sourceActionId }, "invalid_metric"],
      [{ ...base, primary: { ...base.primary, characterId: "Neuvillette", constellation: 5,
        weapon: { ...base.primary.weapon, weaponId: "FavoniusCodex" } },
        conditions: { ...base.conditions, activeEffectIds: [] }, teammates: [],
        targetActionId: "neuvillette.constellation.6.wrathful_recompense.three_droplets.six_waterfalls" }, "invalid_metric"],
      [{ ...base, conditions: { ...base.conditions, actionParameters: { "unknown-parameter": 1 } } }, "invalid_action_parameters"],
      [{ ...base, conditions: { ...base.conditions, activeEffectIds: ["unknown-effect"] } }, "invalid_effect_selection"]
    ] as const) {
      for (const url of ["/v1/analysis", "/v1/analysis/core"]) {
        const response = await app.inject({ method: "POST", url, payload: scenario })
        expect(response.statusCode, response.body).toBe(400)
        expect(response.json().code).toBe(code)
      }
    }
    const declaration = await app.inject({ method: "POST", url: "/test/bad-declaration" })
    expect(declaration.statusCode).toBe(500)
    expect(declaration.json().code).toBe("internal_error")
    expect(diagnostic).toHaveBeenCalledTimes(1)
  })

  it("rejects invalid field identity consistently through damage, core and support endpoints", async () => {
    const app = createApp()
    const scenario = structuredClone(raidenNationalBuiltinScenario)
    scenario.conditions.onFieldBuildId = "not-a-team-member"
    for (const url of ["/v1/analysis", "/v1/analysis/core"]) {
      const response = await app.inject({ method: "POST", url, payload: scenario })
      expect(response.statusCode, response.body).toBe(400)
      expect(response.json()).toMatchObject({ code: "invalid_field_presence", message: "前台角色必须是当前队伍成员" })
    }
    const metric = listCombatMetrics().find(entry => entry.characterId === "Bennett" && entry.kind === "healing")!
    const build = scenario.teammates.find(entry => entry.characterId === "Bennett")!
    const response = await app.inject({ method: "POST", url: "/v1/support-metrics/evaluate", payload: {
      build, metricId: metric.id, context: { onFieldBuildId: "not-a-team-member" }
    } })
    expect(response.statusCode, response.body).toBe(400)
    expect(response.json().code).toBe("invalid_field_presence")
  })

  it("normalizes malformed requests and unknown routes without reflecting private input", async () => {
    const app = createApp()
    for (const request of [
      { method: "POST" as const, url: "/v1/analysis/core", payload: {} },
      { method: "POST" as const, url: "/v1/analysis/core", payload: '{"private-invite":', headers: { "content-type": "application/json" } }
    ]) {
      const response = await app.inject(request)
      expect(response.statusCode).toBe(400)
      expect(response.json()).toMatchObject({ code: "invalid_request", message: expect.any(String) })
      expect(response.body).not.toContain("private-invite")
    }
    const response = await app.inject({ method: "GET", url: "/unknown" })
    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ code: "not_found", message: expect.any(String) })
    for (const [headers, payload, status] of [
      [{ "content-type": "application/unknown" }, "private-input", 415],
      [{ "content-type": "application/json" }, `"${"x".repeat(1_048_576)}"`, 413]
    ] as const) {
      const invalid = await app.inject({ method: "POST", url: "/v1/analysis/core", headers, payload })
      expect(invalid.statusCode, invalid.body).toBe(status)
      expect(invalid.json().code).toBe("invalid_request")
    }
  })

  it("maps only typed comparison service failures, including connected cancellation", async () => {
    const app = createApp()
    vi.spyOn(process.stderr, "write").mockImplementation(() => true)
    const cases = [["comparison_busy", 429], ["comparison_timeout", 503],
      ["comparison_unavailable", 503], ["comparison_cancelled", 499], ["computation_conflict", 409]] as const
    for (const [code] of cases) app.post(`/test/${code}`, async () => { throw new ApiServiceError(code) })
    for (const [code, status] of cases) {
      const response = await app.inject({ method: "POST", url: `/test/${code}` })
      expect(response.statusCode).toBe(status)
      expect(response.json().code).toBe(code)
    }
  })

  it("keeps unclassified internal errors as 500 and correlates only redacted diagnostics", async () => {
    const app = createApp()
    const diagnostic = vi.spyOn(process.stderr, "write").mockImplementation(() => true)
    app.post("/test/internal-failure", async () => {
      throw Object.assign(new Error("private-invite Cookie=private-cookie UID=249548209 private-build"), { statusCode: 400 })
    })
    const response = await app.inject({ method: "POST", url: "/test/internal-failure", payload: { private: "private-payload" },
      headers: { cookie: "private-cookie", authorization: "private-auth", "x-request-id": "forged-request-id" } })
    expect(response.statusCode, response.body).toBe(500)
    expect(response.json().code).toBe("internal_error")
    const requestId = response.headers["x-request-id"]
    expect(requestId).toEqual(expect.any(String))
    expect(requestId).not.toBe("forged-request-id")
    expect(response.json().message).toContain(requestId)
    const logs = diagnostic.mock.calls.map(call => String(call[0])).join("")
    expect(logs).toContain(requestId)
    for (const secret of ["private-invite", "private-cookie", "private-auth", "private-payload", "private-build", "249548209"]) {
      expect(response.body + logs).not.toContain(secret)
    }
  })

  it("distinguishes game-data version conflicts from internal failure", async () => {
    const app = createApp()
    const scenario = { ...raidenNationalBuiltinScenario, gameDataVersion: "0.0" }
    for (const url of ["/v1/analysis", "/v1/analysis/core"]) {
      const response = await app.inject({ method: "POST", url, payload: scenario })
      expect(response.statusCode, response.body).toBe(409)
      expect(response.json().code).toBe("game_data_version_mismatch")
    }
  })
})
