import { raidenNationalBuiltinScenario } from "@gscombat/content"
import { afterAll, expect, it } from "vitest"
import { buildApp } from "../../src/app.js"

const app = buildApp()
afterAll(() => app.close())
const body = { scenario: raidenNationalBuiltinScenario, weaponId: "TheCatch", refinement: 2 }

it("returns only a candidate and authoritative baseline", async () => {
  const response = await app.inject({ method: "POST", url: "/v1/analysis/weapon-comparison", body })
  expect(response.statusCode).toBe(200)
  expect(Object.keys(response.json()).sort()).toEqual(["baselineExpectedDamage", "weapon"])
  expect(response.json().weapon).toMatchObject({ weaponId: "TheCatch", refinement: 2 })
  expect(response.json().weapon.expectedDamage).toBeGreaterThan(0)
})

it("rejects invalid refinements, incompatible or unavailable candidates, and unowned metrics", async () => {
  const cases = [
    ...[0, 6, 1.5].map((refinement) => ({ ...body, refinement })),
    ...["missing", "DullBlade"].map((weaponId) => ({ ...body, weaponId })),
    { ...body, weaponId: "WavebreakersFin", scenario: { ...body.scenario, teammates: [] } },
    { ...body, scenario: { ...body.scenario, primary: { ...body.scenario.primary, constellation: 0 },
      targetActionId: "sandrone.constellation.6.narcissus_awaking.condensed_cluster_beam.stellar_superconduct" } }
  ]
  for (const candidate of cases) {
    const response = await app.inject({ method: "POST", url: "/v1/analysis/weapon-comparison", body: candidate })
    expect(response.statusCode, response.body).toBe(400)
    expect(response.json().message).toBeTruthy()
  }
})
