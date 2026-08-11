import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "../../src/app.js"

const app = buildApp()

function createBuild(characterId: string, weaponId: string, buildId: string): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    ascension: 6,
    buildId,
    characterId,
    constellation: 0,
    label: `${characterId} 特殊反应圣遗物集成测试`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

function equipArtifactSet(build: CharacterBuild, setId: string): CharacterBuild {
  return {
    ...build,
    artifacts: build.artifacts.map((artifact) => ({ ...artifact, setId }))
  }
}

interface SpecialArtifactEvaluation {
  readonly appliedEffects: readonly { readonly id: string; readonly target: string; readonly value: number }[]
  readonly rotation: {
    readonly events: readonly {
      readonly trace: readonly {
        readonly formula: { readonly bonus?: number }
        readonly stage: string
      }[]
    }[]
  }
}

async function evaluateSpecialAction(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  targetActionId: string,
  actionParameters: Readonly<Record<string, number>> = {}
): Promise<SpecialArtifactEvaluation> {
  const response = await app.inject({
    method: "POST",
    payload: {
      ...raidenNationalBuiltinScenario,
      conditions: {
        actionParameters,
        activeEffectIds: [],
        enemyCount: 1,
        equipmentEffectMode: "maximum_reachable"
      },
      externalBuffs: [],
      primary,
      targetActionId,
      teammates
    },
    url: "/v1/analysis"
  })

  expect(response.statusCode, response.body).toBe(200)
  return response.json().evaluation as SpecialArtifactEvaluation
}

function evaluateSandrone(build: CharacterBuild): Promise<SpecialArtifactEvaluation> {
  return evaluateSpecialAction(
    build,
    [],
    "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct",
    { "stored-elemental-applications": 12 }
  )
}

function getSpecialReactionDamageBonus(evaluation: SpecialArtifactEvaluation): number {
  return evaluation.rotation.events[0]?.trace.find((entry) => entry.stage === "reaction_damage_bonus")?.formula.bonus ?? 0
}

afterAll(async () => app.close())

describe("special-reaction artifact effects API integration", () => {
  it("adds Disenchantment in Deep Shadow's four-piece 40% bonus to Stellar-Superconduct", async () => {
    const baseSandrone = createBuild("Sandrone", "AThousandBlazingSuns", "artifact.stellar.base")
    const deepShadowSandrone = equipArtifactSet(
      { ...baseSandrone, buildId: "artifact.stellar.deep-shadow" },
      "DisenchantmentInDeepShadow"
    )
    const baseline = await evaluateSandrone(baseSandrone)
    const deepShadow = await evaluateSandrone(deepShadowSandrone)
    const effect = deepShadow.appliedEffects.find(
      (candidate) =>
        candidate.id === "artifact.disenchantment-in-deep-shadow.4pc.stellar-superconduct.reaction-damage-bonus"
    )

    expect(effect).toMatchObject({ target: "specialReactionDamageBonus", value: 0.4 })
    expect(getSpecialReactionDamageBonus(deepShadow) - getSpecialReactionDamageBonus(baseline)).toBeCloseTo(0.4)
  }, 30_000)

  it("routes every audited artifact-set bonus into its dedicated Moon or Stellar reaction stage", async () => {
    const stellarThunderingFury = equipArtifactSet(
      createBuild("Sandrone", "AThousandBlazingSuns", "artifact.stellar.thundering-fury"),
      "ThunderingFury"
    )
    const lunarThunderingFury = equipArtifactSet(
      createBuild("Flins", "CalamityQueller", "artifact.lunar.thundering-fury"),
      "ThunderingFury"
    )
    const ineffa = createBuild("Ineffa", "CalamityQueller", "artifact.lunar.ineffa")
    const flowerNefer = equipArtifactSet(
      createBuild("Nefer", "TheWidsith", "artifact.lunar.flower-of-paradise-lost"),
      "FlowerOfParadiseLost"
    )
    const lauma = createBuild("Lauma", "FavoniusCodex", "artifact.lunar.lauma")
    const aubadeFlins = equipArtifactSet(
      createBuild("Flins", "CalamityQueller", "artifact.lunar.aubade"),
      "AubadeOfMorningstarAndMoon"
    )
    const nightFlins = equipArtifactSet(
      createBuild("Flins", "CalamityQueller", "artifact.lunar.night"),
      "NightOfTheSkysUnveiling"
    )
    const silkenIneffa = equipArtifactSet(
      { ...ineffa, buildId: "artifact.lunar.silken" },
      "SilkenMoonsSerenade"
    )
    const stellarThundering = await evaluateSandrone(stellarThunderingFury)
    const lunarThundering = await evaluateSpecialAction(
      lunarThunderingFury,
      [ineffa],
      "flins.burst.thunder_symphony.lunar_charged"
    )
    const flower = await evaluateSpecialAction(
      flowerNefer,
      [lauma],
      "nefer.skill.senet_strategy.phantom_performance.second_hit"
    )
    const aubade = await evaluateSpecialAction(
      aubadeFlins,
      [ineffa],
      "flins.burst.thunder_symphony.lunar_charged"
    )
    const twoMoongleams = await evaluateSpecialAction(
      nightFlins,
      [silkenIneffa],
      "flins.burst.thunder_symphony.lunar_charged"
    )

    expect(stellarThundering.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "artifact.thundering-fury.4pc.lunar-charged-stellar-superconduct.reaction-damage-bonus",
        target: "specialReactionDamageBonus",
        value: 0.2
      })
    ]))
    expect(lunarThundering.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "artifact.thundering-fury.4pc.lunar-charged-stellar-superconduct.reaction-damage-bonus",
        value: 0.2
      })
    ]))
    expect(flower.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "artifact.flower-of-paradise-lost.4pc.reaction-trigger.4-stack.lunar-bloom-reaction-damage-bonus",
        value: 0.2
      })
    ]))
    expect(aubade.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "artifact.aubade-of-morningstar-and-moon.4pc.off-field.lunar-reaction-damage-bonus",
        value: 0.2
      }),
      expect.objectContaining({
        id: "artifact.aubade-of-morningstar-and-moon.4pc.full-moonsign.lunar-reaction-damage-bonus",
        value: 0.4
      })
    ]))
    expect(twoMoongleams.appliedEffects).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "artifact.night-of-the-skys-unveiling.4pc.moongleam.lunar-reaction-damage-bonus",
        value: 0.1
      }),
      expect.objectContaining({
        id: "artifact.silken-moons-serenade.4pc.different-moongleam.lunar-reaction-damage-bonus",
        value: 0.1
      })
    ]))
  }, 30_000)
})
