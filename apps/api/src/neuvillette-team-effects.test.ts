import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { buildApp } from "./app.js"

const app = buildApp()

function createBuild(
  characterId: string,
  weaponId: string,
  buildId: string
): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId,
    characterId,
    constellation: 0,
    label: `${characterId} team-effect fixture`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

const neuvillette = createBuild("Neuvillette", "TheWidsith", "test.neuvillette.team-effects")
const furina = createBuild("Furina", "FavoniusSword", "test.furina.team-effects")
const xilonen = createBuild("Xilonen", "PeakPatrolSong", "test.xilonen.team-effects")
const venti = createBuild("Venti", "FavoniusWarbow", "test.venti.team-effects")
const kazuha = createBuild("KaedeharaKazuha", "FavoniusSword", "test.kazuha.team-effects")
const mona = createBuild("Mona", "TheWidsith", "test.mona.team-effects")
const zhongli = createBuild("Zhongli", "TheCatch", "test.zhongli.team-effects")

interface TeamEffectEvaluation {
  readonly appliedBuffs: readonly { readonly sourceId: string; readonly stat: string; readonly value: number }[]
  readonly appliedEffects: readonly { readonly id: string; readonly sourceId: string; readonly target: string; readonly value: number }[]
  readonly rotation: {
    readonly events: readonly {
      readonly trace: readonly { readonly coefficient?: number; readonly kind: string; readonly value?: number }[]
    }[]
  }
  readonly stats: { readonly damageBonus: number; readonly resistanceReduction: number; readonly talentMultiplier: number }
}

let evaluation: TeamEffectEvaluation
let kazuhaEvaluation: TeamEffectEvaluation
let stackedSupportEvaluation: TeamEffectEvaluation

beforeAll(async () => {
  const response = await app.inject({
    method: "POST",
    payload: {
      ...raidenNationalBuiltinScenario,
      conditions: {
        actionParameters: { "past-draconic-glories-stack-count": 3 },
        activeEffectIds: [],
        enemyCount: 1,
        equipmentEffectMode: "maximum_reachable"
      },
      externalBuffs: [],
      primary: neuvillette,
      targetActionId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
      teammates: [venti, xilonen, furina]
    },
    url: "/v1/analysis"
  })

  expect(response.statusCode, response.body).toBe(200)
  evaluation = response.json().evaluation as TeamEffectEvaluation

  const kazuhaResponse = await app.inject({
    method: "POST",
    payload: {
      ...raidenNationalBuiltinScenario,
      conditions: {
        actionParameters: { "past-draconic-glories-stack-count": 3 },
        activeEffectIds: [],
        enemyCount: 1,
        equipmentEffectMode: "maximum_reachable"
      },
      externalBuffs: [],
      primary: neuvillette,
      targetActionId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
      teammates: [kazuha, xilonen, furina]
    },
    url: "/v1/analysis"
  })

  expect(kazuhaResponse.statusCode, kazuhaResponse.body).toBe(200)
  kazuhaEvaluation = kazuhaResponse.json().evaluation as TeamEffectEvaluation

  const stackedSupportResponse = await app.inject({
    method: "POST",
    payload: {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" },
      externalBuffs: [],
      primary: neuvillette,
      targetActionId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
      teammates: [kazuha, mona, zhongli]
    },
    url: "/v1/analysis"
  })

  expect(stackedSupportResponse.statusCode, stackedSupportResponse.body).toBe(200)
  stackedSupportEvaluation = stackedSupportResponse.json().evaluation as TeamEffectEvaluation
}, 30_000)

afterAll(async () => {
  await app.close()
})

describe("Neuvillette team effects API integration", () => {
  it("applies Hydro resonance to the primary maximum HP", () => {
    expect(evaluation.appliedBuffs).toContainEqual(expect.objectContaining({
      sourceId: "resonance.hydro",
      stat: "hp_percent",
      value: 0.25
    }))
  })

  it("applies Furina maximum Fanfare damage bonus to the selected primary action", () => {
    expect(evaluation.appliedEffects).toContainEqual(expect.objectContaining({
      id: "furina.burst.let-the-people-rejoice.maximum-fanfare.damage-bonus",
      sourceId: furina.buildId,
      target: "damageBonus",
      value: 0.75
    }))
    expect(evaluation.stats.damageBonus).toBeGreaterThanOrEqual(0.75)
  })

  it("applies Xilonen Source Sample resistance reduction to an eligible Hydro action", () => {
    expect(evaluation.appliedEffects).toContainEqual(expect.objectContaining({
      id: "xilonen.skill.source-samples.resistance-reduction",
      sourceId: xilonen.buildId,
      target: "enemyResistanceReduction",
      value: 0.36
    }))
    expect(evaluation.stats.resistanceReduction).toBeGreaterThanOrEqual(0.36)
  })

  it("applies Kazuha Poetics of Fuubutsu to the corresponding elemental action", () => {
    expect(kazuhaEvaluation.appliedEffects).toContainEqual(expect.objectContaining({
      id: "kaedehara_kazuha.passive.poetics_of_fuubutsu.elemental_damage_bonus",
      sourceId: kazuha.buildId,
      target: "damageBonus"
    }))
    expect(kazuhaEvaluation.stats.damageBonus).toBeGreaterThan(evaluation.stats.damageBonus)
  })

  it("stacks independent teammate conversion, talent, and resistance support effects", () => {
    expect(stackedSupportEvaluation.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "kaedehara_kazuha.passive.poetics_of_fuubutsu.elemental_damage_bonus",
        sourceId: kazuha.buildId,
        target: "damageBonus"
      }),
      expect.objectContaining({
        id: "mona.burst.stellaris_phantasm.omen.damage_bonus",
        sourceId: mona.buildId,
        target: "damageBonus",
        value: 0.6
      }),
      expect.objectContaining({
        id: "zhongli.skill.jade_shield.universal_resistance_reduction",
        sourceId: zhongli.buildId,
        target: "enemyResistanceReduction",
        value: 0.2
      })
    ]))
  })

  it("applies three Past Draconic Glories stacks to the action coefficient", () => {
    const scaling = evaluation.rotation.events[0]?.trace.find((entry) => entry.kind === "scaling")

    expect(evaluation.stats.talentMultiplier).toBeCloseTo(0.14467)
    expect(scaling?.coefficient).toBeCloseTo(0.14467 * 1.6)
  })

  it("does not choose a random Widsith theme automatically", () => {
    expect(evaluation.appliedEffects).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: expect.stringMatching(/^weapon\.the-widsith\./) })
    ]))
  })
})
