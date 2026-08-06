import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "../../../src/evaluators/declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createXinyanBuild(buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId: "Xinyan",
    constellation,
    label: `辛焱 C${constellation} 自动命中率效果测试配置`,
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
  }
}

function getFinalExpectedCritRate(result: ReturnType<typeof evaluateDeclaredDirectScenarioAction>): number {
  const critTrace = result.result.trace.find((entry) => entry.formula.kind === "expected_crit")
  if (!critTrace || critTrace.formula.kind !== "expected_crit") {
    throw new Error("Expected direct action to include one expected-crit trace entry")
  }
  return critTrace.formula.critRate
}

describe("Xinyan C2 automatic effect", () => {
  it("automatically makes only the initial Physical strum reach the calculator's final 100% crit-rate cap", () => {
    const effectId = "xinyan.constellation.2.impromptu_opening.initial_strum.crit_rate"
    const initialStrum = requireAction("xinyan.burst.riff_revolution.initial_strum")
    const otherAction = requireAction("xinyan.normal.auto.first_hit")
    const c0Build = createXinyanBuild("test.xinyan.c0", 0)
    const c2Build = createXinyanBuild("test.xinyan.c2", 2)
    const c6Build = createXinyanBuild("test.xinyan.c6", 6)
    const c0InitialStrum = evaluateDeclaredDirectScenarioAction({
      action: initialStrum,
      build: c0Build,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const c2InitialStrum = evaluateDeclaredDirectScenarioAction({
      action: initialStrum,
      build: c2Build,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const c6InitialStrum = evaluateDeclaredDirectScenarioAction({
      action: initialStrum,
      build: c6Build,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const c0OtherAction = evaluateDeclaredDirectScenarioAction({
      action: otherAction,
      build: c0Build,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const c2OtherAction = evaluateDeclaredDirectScenarioAction({
      action: otherAction,
      build: c2Build,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    expect(c0InitialStrum.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(c0InitialStrum.stats.critRate).toBeLessThan(1)
    expect(c2InitialStrum.stats.critRate - c0InitialStrum.stats.critRate).toBeCloseTo(1)
    expect(c2InitialStrum.stats.critRate).toBeGreaterThan(1)
    expect(c2InitialStrum.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: c2Build.buildId, target: "critRate", value: 1 })
      ])
    )
    expect(c6InitialStrum.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: c6Build.buildId, target: "critRate", value: 1 })
      ])
    )
    expect(getFinalExpectedCritRate(c0InitialStrum)).toBeCloseTo(c0InitialStrum.stats.critRate)
    expect(getFinalExpectedCritRate(c2InitialStrum)).toBe(1)
    expect(getFinalExpectedCritRate(c6InitialStrum)).toBe(1)
    expect(c2OtherAction.stats.critRate).toBeCloseTo(c0OtherAction.stats.critRate)
    expect(getFinalExpectedCritRate(c2OtherAction)).toBeCloseTo(getFinalExpectedCritRate(c0OtherAction))
    expect(c2OtherAction.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
  })
})
