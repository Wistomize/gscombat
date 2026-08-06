import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "../../src/app.js"

const app = buildApp()

interface TeamEffectEvaluation {
  readonly appliedEffects: readonly {
    readonly id: string
    readonly sourceId: string
    readonly target: string
    readonly value: number
  }[]
  readonly stats: { readonly resistanceReduction: number }
}

function createBuild(characterId: string, weaponId: string, buildId: string): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId,
    characterId,
    constellation: 0,
    label: `${characterId} 爱可菲队伍减抗测试`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

const skirk = createBuild("Skirk", "MistsplitterReforged", "test.skirk.escoffier-primary")
const escoffier = createBuild("Escoffier", "FavoniusLance", "test.escoffier.resistance-source")
const furina = createBuild("Furina", "FavoniusSword", "test.furina.escoffier-team")
const shenhe = createBuild("Shenhe", "CalamityQueller", "test.shenhe.escoffier-team")
const venti = createBuild("Venti", "FavoniusWarbow", "test.venti.escoffier-team")
const noelle = createBuild("Noelle", "Whiteblind", "test.noelle.escoffier-team")

async function evaluateSkirkWithTeammates(teammates: readonly CharacterBuild[]): Promise<TeamEffectEvaluation> {
  const response = await app.inject({
    method: "POST",
    payload: {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
      externalBuffs: [],
      primary: skirk,
      targetActionId: "skirk.skill.seven_phase_flash.normal.fifth_hit",
      teammates
    },
    url: "/v1/analysis"
  })

  expect(response.statusCode, response.body).toBe(200)
  return response.json().evaluation as TeamEffectEvaluation
}

afterAll(async () => {
  await app.close()
})

describe("Escoffier team resistance reduction API integration", () => {
  it("automatically applies the matching Hydro/Cryo party resistance-reduction tier to Skirk", async () => {
    const cases = [
      { expectedReduction: 0.1, teammates: [escoffier, venti, noelle] },
      { expectedReduction: 0.15, teammates: [escoffier, furina, venti] },
      { expectedReduction: 0.55, teammates: [escoffier, furina, shenhe] }
    ] as const

    for (const testCase of cases) {
      const evaluation = await evaluateSkirkWithTeammates(testCase.teammates)

      expect(evaluation.stats.resistanceReduction).toBeCloseTo(testCase.expectedReduction)
      expect(evaluation.appliedEffects).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(/^escoffier\.passive\.better_than_medicine\.cryo_hydro_resistance_reduction/),
          sourceId: escoffier.buildId,
          target: "enemyResistanceReduction"
        })
      ]))
    }
  })
})
