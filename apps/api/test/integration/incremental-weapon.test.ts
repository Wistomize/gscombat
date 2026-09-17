import { raidenNationalBuiltinScenario } from "@gscombat/content"
import { afterAll, expect, it } from "vitest"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { buildApp } from "../../src/app.js"

const app = buildApp()
afterAll(() => app.close())
const body = { scenario: raidenNationalBuiltinScenario, weaponId: "TheCatch", refinement: 2 }

it("preserves the explicitly selected active teammate across a full report and incremental weapon comparison", async () => {
  const build = (characterId: string, weaponId: string): CharacterBuild => ({
    ...structuredClone(raidenNationalBuiltinScenario.primary), characterId, buildId: `api-field.${characterId}`,
    constellation: 6, artifacts: [], weapon: { weaponId, refinement: 1, level: 90, ascension: 6 }
  })
  const primary = build("Odette", "FavoniusSword")
  const mizuki = build("YumemizukiMizuki", "FavoniusCodex")
  const scenario: EvaluationScenario = {
    ...raidenNationalBuiltinScenario, primary, teammates: [mizuki, build("Diona", "FavoniusWarbow")], externalBuffs: [],
    targetActionId: "odette.constellation.4.snow_swan_dream.coordinated_attack.stellar_swirl",
    conditions: { activeEffectIds: ["diona.constellation.6.cat_tail_closing_time.high_hp.elemental_mastery"],
      enemyCount: 1, equipmentEffectMode: "maximum_reachable", onFieldBuildId: mizuki.buildId }
  }
  const full = await app.inject({ method: "POST", url: "/v1/analysis",
    body: { ...scenario, weaponComparisonRefinements: { FavoniusSword: 2 } } })
  const single = await app.inject({ method: "POST", url: "/v1/analysis/weapon-comparison",
    body: { scenario, weaponId: "FavoniusSword", refinement: 2 } })
  expect(full.statusCode, full.body).toBe(200)
  expect(single.statusCode, single.body).toBe(200)
  expect(single.json()).toEqual({ baselineExpectedDamage: full.json().analysis.baselineExpectedDamage,
    weapon: full.json().analysis.weapons.find((weapon: { weaponId: string }) => weapon.weaponId === "FavoniusSword") })
  const ids = full.json().evaluation.appliedEffects.map((effect: { id: string }) => effect.id)
  expect(ids).toContain("yumemizuki_mizuki.locked_passive.revelation.dreamdrifter.party_elemental_mastery")
  expect(ids).not.toContain("diona.constellation.6.cat_tail_closing_time.high_hp.elemental_mastery")
})

it("returns only a candidate and authoritative baseline", async () => {
  const response = await app.inject({ method: "POST", url: "/v1/analysis/weapon-comparison", body })
  expect(response.statusCode).toBe(200)
  expect(Object.keys(response.json()).sort()).toEqual(["baselineExpectedDamage", "weapon"])
  expect(response.json().weapon).toMatchObject({ weaponId: "TheCatch", refinement: 2 })
  expect(response.json().weapon.expectedDamage).toBeGreaterThan(0)
})

it("uses the same Jade default for the full report and single-weapon refinement endpoint", async () => {
  const scenario = {
    ...raidenNationalBuiltinScenario,
    primary: { ...raidenNationalBuiltinScenario.primary, characterId: "Neuvillette",
      weapon: { weaponId: "FavoniusCodex", refinement: 1, level: 90, ascension: 6 } },
    targetActionId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
    teammates: [], externalBuffs: [],
    conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" }
  }
  const full = await app.inject({ method: "POST", url: "/v1/analysis",
    body: { ...scenario, weaponComparisonRefinements: { SacrificialJade: 2 } } })
  const single = await app.inject({ method: "POST", url: "/v1/analysis/weapon-comparison",
    body: { scenario, weaponId: "SacrificialJade", refinement: 2 } })
  expect(full.statusCode, full.body).toBe(200)
  expect(single.statusCode, single.body).toBe(200)
  expect(single.json()).toEqual({ baselineExpectedDamage: full.json().analysis.baselineExpectedDamage,
    weapon: full.json().analysis.weapons.find((weapon: { weaponId: string }) => weapon.weaponId === "SacrificialJade") })
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
