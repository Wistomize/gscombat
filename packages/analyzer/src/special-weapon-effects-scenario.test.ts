import {
  raidenNationalBuiltinBuild,
  raidenNationalBuiltinScenario
} from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { evaluateScenario } from "./scenario.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

function createBuild(
  characterId: "Sandrone" | "Zibai",
  weaponId: "ATeaspoonOfTranscendence" | "LightbearingMoonshard"
): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.${characterId.toLowerCase()}.${weaponId.toLowerCase()}`,
    characterId,
    constellation: 0,
    label: `${characterId} ${weaponId} 特殊反应测试配置`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

function createSpecialScenario(
  primary: CharacterBuild,
  targetActionId: string,
  activeEffectIds: readonly string[] = [],
  actionParameters?: Readonly<Record<string, number>>
): EvaluationScenario {
  return {
    ...raidenNationalBuiltinScenario,
    conditions: {
      activeEffectIds: [...activeEffectIds],
      ...(actionParameters === undefined ? {} : { actionParameters }),
      equipmentEffectMode: "maximum_reachable",
      enemyCount: 1
    },
    externalBuffs: [],
    primary,
    targetActionId,
    teammates: []
  }
}

function expectIndependentSpecialFormula(evaluation: ReturnType<typeof evaluateScenario>): void {
  const stages = evaluation.result.trace.map((entry) => entry.stage)
  const eventStages = evaluation.rotation.events[0]?.trace.flatMap((entry) =>
    entry.kind === "special_reaction" ? [entry.stage] : [],
  )

  expect(stages).toContain("reaction_damage_bonus")
  expect(stages).not.toContain("damage_bonus")
  expect(stages).not.toContain("defense")
  expect(eventStages).toEqual(stages)
}

describe("special-reaction weapon effects in real selected actions", () => {
  it("routes A Teaspoon of Transcendence's selected Stellar-Superconduct stack into only the special bonus stage", () => {
    const build = createBuild("Sandrone", "ATeaspoonOfTranscendence")
    const targetActionId = "sandrone.skill.phenomenon_calculus.prism_bullet.stellar_superconduct"
    const activeEffectId = "weapon.a-teaspoon-of-transcendence.charged-hit.3-stack.star-superconduct-damage-bonus"
    const baseline = evaluateScenario(
      createSpecialScenario(build, targetActionId, [], { "stored-elemental-applications": 12 }),
      gameData
    )
    const active = evaluateScenario(
      createSpecialScenario(build, targetActionId, [activeEffectId], { "stored-elemental-applications": 12 }),
      gameData
    )
    const reactionDamageBonus = active.result.trace.find((entry) => entry.stage === "reaction_damage_bonus")

    expect(active.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: activeEffectId,
          sourceId: build.buildId,
          target: "specialReactionDamageBonus",
          value: 0.48
        })
      ])
    )
    expect(reactionDamageBonus?.formula).toMatchObject({
      bonus: expect.any(Number),
      kind: "special_reaction_damage_bonus"
    })
    expect((reactionDamageBonus?.formula as { readonly bonus?: number } | undefined)?.bonus).toBeCloseTo(0.48)
    expect(active.actionExpectedDamage).toBeCloseTo(baseline.actionExpectedDamage)
    expectIndependentSpecialFormula(active)

    expect(() =>
      evaluateScenario(
        createSpecialScenario(
          build,
          targetActionId,
          [
            "weapon.a-teaspoon-of-transcendence.charged-hit.1-stack.star-superconduct-damage-bonus",
            activeEffectId
          ],
          { "stored-elemental-applications": 12 }
        ),
        gameData
      )
    ).toThrow("a-teaspoon-of-transcendence-transcendence effects cannot stack")
  })

  it("routes Lightbearing Moonshard's selected Lunar-Crystallize window into only the special bonus stage", () => {
    const build = createBuild("Zibai", "LightbearingMoonshard")
    const targetActionId = "zibai.burst.tri_sphere_eminence.second_hit.lunar_crystallize"
    const activeEffectId = "weapon.lightbearing-moonshard.after-skill.lunar-crystallize.reaction-damage-bonus"
    const baseline = evaluateScenario(createSpecialScenario(build, targetActionId), gameData)
    const active = evaluateScenario(createSpecialScenario(build, targetActionId, [activeEffectId]), gameData)
    const reactionDamageBonus = active.result.trace.find((entry) => entry.stage === "reaction_damage_bonus")

    expect(active.appliedEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: activeEffectId,
          sourceId: build.buildId,
          target: "specialReactionDamageBonus",
          value: 0.64
        })
      ])
    )
    expect((reactionDamageBonus?.formula as { readonly bonus?: number } | undefined)?.bonus).toBeCloseTo(0.64)
    expect(active.actionExpectedDamage).toBeCloseTo(baseline.actionExpectedDamage)
    expectIndependentSpecialFormula(active)
  })
})
