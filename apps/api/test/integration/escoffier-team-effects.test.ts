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

describe("Escoffier damage metric and team effects API integration", () => {
  it("publishes and calculates one regular Cold Storage hit with cumulative talent and team bonuses", async () => {
    const actionId = "escoffier.skill.low_temperature_cooking.cold_storage.frosty_parfait.single_hit"
    const catalogResponse = await app.inject({ method: "GET", url: "/v1/catalog" })
    expect(catalogResponse.statusCode).toBe(200)
    const characters = catalogResponse.json().characters as readonly {
      readonly characterId: string
      readonly primaryActions: readonly { readonly id: string; readonly label: string }[]
    }[]
    expect(characters.find((character) => character.characterId === "Escoffier")?.primaryActions).toContainEqual(
      expect.objectContaining({
        id: actionId,
        label: "低温烹饪 / 低温冷藏·冻霜芭菲单次伤害"
      })
    )

    for (const constellation of [0, 3, 6]) {
      const response = await app.inject({
        method: "POST",
        payload: {
          ...raidenNationalBuiltinScenario,
          conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
          externalBuffs: [],
          primary: { ...escoffier, constellation },
          targetActionId: actionId,
          teammates: [skirk, furina, shenhe]
        },
        url: "/v1/analysis"
      })

      expect(response.statusCode, response.body).toBe(200)
      const { analysis, evaluation } = response.json()
      expect(evaluation.stats.talentMultiplier).toBeCloseTo(constellation >= 3 ? 2.55 : 2.16)
      expect(evaluation.stats.resistanceReduction).toBeCloseTo(0.55)
      expect(evaluation.rotation.events).toHaveLength(1)
      expect(evaluation.rotation.events[0].expectedDamage).toBeGreaterThan(0)
      expect(analysis.weapons.length).toBeGreaterThan(0)
      expect(analysis.marginalSubstats).toContainEqual(expect.objectContaining({ stat: "atk" }))
      if (constellation >= 1) {
        expect(evaluation.appliedEffects).toContainEqual(expect.objectContaining({
          id: "escoffier.constellation.1.pre_dinner_dance_for_your_tastebuds.freshly_prepared_delicacy.cryo_crit_damage",
          sourceId: escoffier.buildId,
          target: "critDamage",
          value: 0.6
        }))
      }
    }
  })

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
