import { getCombatActionDefinition, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateDeclaredDirectScenarioAction } from "./declared-scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const enemy = { defenseReduction: 0, level: 100, name: "训练木桩", resistance: 0.1 } as const

afterAll(() => gameData.close())

function requireAction(actionId: string) {
  const action = getCombatActionDefinition(actionId)
  if (!action) throw new Error(`Missing declared action: ${actionId}`)
  return action
}

function createSethosBuild(buildId: string, constellation: number): CharacterBuild {
  return {
    ...xianglingNationalBuiltinBuild,
    artifacts: xianglingNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
    buildId,
    characterId: "Sethos",
    constellation,
    label: `赛索斯 C${constellation} 自动暴击率效果测试配置`,
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
  }
}

function getFinalExpectedCritRate(result: ReturnType<typeof evaluateDeclaredDirectScenarioAction>): number {
  const critTrace = result.result.trace.find((entry) => entry.formula.kind === "expected_crit")
  if (!critTrace || critTrace.formula.kind !== "expected_crit") {
    throw new Error("Expected direct action to include one expected-crit trace entry")
  }
  return critTrace.formula.critRate
}

describe("Sethos C1 automatic effect", () => {
  it("applies +15% crit rate only to Sethos's Shadowpiercing Shot from C1 onward", () => {
    const effectId = "sethos.constellation.1.seal_of_the_forbidden_rite.shadowpiercing_shot.crit_rate"
    const shadowpiercingShot = requireAction("sethos.normal.royal_reed_archery.shadowpiercing_shot")
    const skillDamage = requireAction("sethos.skill.ancient_rite_the_thundering_sand.skill_damage")
    const c0Build = createSethosBuild("test.sethos.c0", 0)
    const c1Build = createSethosBuild("test.sethos.c1", 1)
    const c6Build = createSethosBuild("test.sethos.c6", 6)
    const c0Shot = evaluateDeclaredDirectScenarioAction({
      action: shadowpiercingShot,
      build: c0Build,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const c1Shot = evaluateDeclaredDirectScenarioAction({
      action: shadowpiercingShot,
      build: c1Build,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const c6Shot = evaluateDeclaredDirectScenarioAction({
      action: shadowpiercingShot,
      build: c6Build,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const c0Skill = evaluateDeclaredDirectScenarioAction({
      action: skillDamage,
      build: c0Build,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })
    const c1Skill = evaluateDeclaredDirectScenarioAction({
      action: skillDamage,
      build: c1Build,
      buffs: [],
      enemy,
      gameData,
      teammates: []
    })

    expect(c0Shot.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
    expect(c1Shot.stats.critRate - c0Shot.stats.critRate).toBeCloseTo(0.15)
    expect(c1Shot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: c1Build.buildId, target: "critRate", value: 0.15 })
      ])
    )
    expect(c6Shot.stats.critRate - c0Shot.stats.critRate).toBeCloseTo(0.15)
    expect(c6Shot.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: effectId, sourceId: c6Build.buildId, target: "critRate", value: 0.15 })
      ])
    )
    expect(getFinalExpectedCritRate(c1Shot) - getFinalExpectedCritRate(c0Shot)).toBeCloseTo(0.15)
    expect(getFinalExpectedCritRate(c6Shot) - getFinalExpectedCritRate(c0Shot)).toBeCloseTo(0.15)
    expect(c1Skill.stats.critRate).toBeCloseTo(c0Skill.stats.critRate)
    expect(getFinalExpectedCritRate(c1Skill)).toBeCloseTo(getFinalExpectedCritRate(c0Skill))
    expect(c1Skill.appliedEffects).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: effectId })]))
  })
})
