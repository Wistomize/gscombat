import { raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "./app.js"

const app = buildApp()

afterAll(async () => app.close())

function requireTeammate(characterId: string): CharacterBuild {
  const build = raidenNationalBuiltinScenario.teammates.find((candidate) => candidate.characterId === characterId)
  if (!build) throw new Error(`Missing built-in ${characterId} teammate`)
  return build
}

describe("Bennett C6 field API", () => {
  it("derives the Pyro damage bonus for Xiangling Pyronado from a selected C6 teammate field", async () => {
    const bennettC6 = {
      ...requireTeammate("Bennett"),
      buildId: "api.bennett-c6-field",
      constellation: 6
    }
    const xiangling = {
      ...requireTeammate("Xiangling"),
      buildId: "api.xiangling-bennett-c6-field"
    }
    const scenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: ["bennett.burst.field"], enemyCount: 1 },
      externalBuffs: [],
      primary: xiangling,
      targetActionId: "xiangling.burst.pyronado.reverse_vaporize",
      teammates: [raidenNationalBuiltinScenario.primary, bennettC6, requireTeammate("Xingqiu")]
    }

    const response = await app.inject({ method: "POST", payload: scenario, url: "/v1/analysis" })

    expect(response.statusCode).toBe(200)
    const evaluation = response.json().evaluation as {
      readonly appliedEffects: readonly {
        readonly id: string
        readonly sourceId: string
        readonly target: string
        readonly value: number
      }[]
      readonly result: { readonly expectedDamage: number }
    }
    expect(scenario.conditions.activeEffectIds).toEqual(["bennett.burst.field"])
    expect(evaluation.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "bennett.constellation.6.pyro_infusion",
          sourceId: bennettC6.buildId,
          target: "damageBonus",
          value: 0.15
        })
      ])
    )
    expect(evaluation.result.expectedDamage).toBeGreaterThan(0)
  }, 20_000)

  it("does not retain a client-supplied deterministic post-Burst state for Xiangling Guoba", async () => {
    const xiangling = {
      ...requireTeammate("Xiangling"),
      buildId: "api.xiangling.engulfing-lightning-guoba",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "EngulfingLightning" }
    }
    const scenario: EvaluationScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], enemyCount: 1 },
      externalBuffs: [],
      primary: xiangling,
      targetActionId: "xiangling.skill.guoba.single_flame_breath",
      teammates: []
    }
    const injectedScenario: EvaluationScenario = {
      ...scenario,
      conditions: {
        ...scenario.conditions,
        activeEffectIds: ["weapon.engulfing-lightning.post-burst-energy-recharge"]
      }
    }
    const [baselineResponse, injectedResponse] = await Promise.all([
      app.inject({ method: "POST", payload: scenario, url: "/v1/analysis" }),
      app.inject({ method: "POST", payload: injectedScenario, url: "/v1/analysis" })
    ])

    expect(baselineResponse.statusCode).toBe(200)
    expect(injectedResponse.statusCode).toBe(200)
    const baselineEvaluation = baselineResponse.json().evaluation as {
      readonly appliedEffects: readonly { readonly id: string }[]
      readonly result: { readonly expectedDamage: number }
      readonly stats: { readonly energyRecharge: number }
    }
    const injectedEvaluation = injectedResponse.json().evaluation as typeof baselineEvaluation

    expect(injectedEvaluation.appliedEffects).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "weapon.engulfing-lightning.post-burst-energy-recharge" })])
    )
    expect(injectedEvaluation.stats.energyRecharge).toBeCloseTo(baselineEvaluation.stats.energyRecharge)
    expect(injectedEvaluation.result.expectedDamage).toBeCloseTo(baselineEvaluation.result.expectedDamage)
  }, 20_000)
})
