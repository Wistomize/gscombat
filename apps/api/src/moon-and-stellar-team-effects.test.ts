import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "./app.js"

const app = buildApp()

interface SpecialReactionEvaluation {
  readonly appliedEffects: readonly {
    readonly id: string
    readonly label: string
    readonly sourceId: string
    readonly target: string
    readonly value: number
  }[]
  readonly result: { readonly expectedDamage: number }
  readonly rotation: {
    readonly events: readonly {
      readonly trace: readonly {
        readonly formula: {
          readonly bonus?: number
          readonly kind: string
          readonly terms?: readonly {
            readonly coefficient: number
            readonly label?: string
            readonly stat: string
            readonly value: number
          }[]
        }
        readonly stage: string
      }[]
    }[]
  }
  readonly stats: {
    readonly critDamage: number
    readonly critRate: number
    readonly effectiveDefense: number
    readonly elementalMastery: number
  }
}

function createBuild(
  characterId: string,
  weaponId: CharacterBuild["weapon"]["weaponId"],
  buildId: string,
  constellation = 0
): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    ascension: 6,
    buildId,
    characterId,
    constellation,
    label: `${characterId} 特殊反应队伍集成测试`,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

function withTriplePercentMainStats(
  build: CharacterBuild,
  stat: "def_percent" | "hp_percent"
): CharacterBuild {
  return {
    ...build,
    artifacts: build.artifacts.map((artifact) => {
      if (artifact.slot === "flower" || artifact.slot === "plume") return artifact
      return { ...artifact, mainStat: { stat, value: stat === "def_percent" ? 0.583 : 0.466 } }
    })
  }
}

async function evaluate(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  targetActionId: string,
  actionParameters: Readonly<Record<string, number>> = {}
): Promise<SpecialReactionEvaluation> {
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
  return response.json().evaluation as SpecialReactionEvaluation
}

function findEffect(evaluation: SpecialReactionEvaluation, effectId: string) {
  return evaluation.appliedEffects.find((effect) => effect.id === effectId)
}

afterAll(async () => {
  await app.close()
})

describe("Moon and Stellar reaction team effects API integration", () => {
  it("uses Sandrone's charged and burst Stellar-Superconduct metrics with the reachable team effects", async () => {
    const sandrone = createBuild("Sandrone", "AThousandBlazingSuns", "test.sandrone.stellar")
    const yae = createBuild("YaeMiko", "TheWidsith", "test.yae.stellar")
    const qiqi = createBuild("Qiqi", "FavoniusSword", "test.qiqi.stellar")
    const xilonen = createBuild("Xilonen", "FluteOfEzpitzal", "test.xilonen.c3.stellar", 3)
    const teammates = [yae, qiqi, xilonen]
    const actionParameters = { "improved-tactics-stacks": 10, "stored-elemental-applications": 12 }

    const [charged, burst, catalogResponse] = await Promise.all([
      evaluate(
        sandrone,
        teammates,
        "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct",
        { "stored-elemental-applications": 12 }
      ),
      evaluate(
        sandrone,
        teammates,
        "sandrone.burst.phenomenon_calculus.negative_temperature_beam.stellar_superconduct",
        actionParameters
      ),
      app.inject({ method: "GET", url: "/v1/catalog" })
    ])

    expect(catalogResponse.statusCode).toBe(200)
    const sandroneCatalog = (catalogResponse.json().characters as readonly {
      readonly characterId: string
      readonly primaryActions: readonly { readonly id: string }[]
    }[]).find((character) => character.characterId === "Sandrone")
    expect(sandroneCatalog?.primaryActions.map((action) => action.id)).toEqual([
      "sandrone.normal.charged_attack.condensation_ray.stellar_superconduct",
      "sandrone.burst.phenomenon_calculus.negative_temperature_beam.stellar_superconduct"
    ])

    for (const evaluation of [charged, burst]) {
      expect(findEffect(evaluation, "sandrone.passive.stellar_superconduct_base_damage_bonus")?.value).toBeCloseTo(0.14)
      expect(findEffect(evaluation, "xilonen.constellation.2.cryo.crit_damage")?.value).toBeCloseTo(0.6)
      expect(evaluation.appliedEffects.some((effect) => effect.id.includes("a-thousand-blazing-suns.nightsoul"))).toBe(false)
      expect(evaluation.result.expectedDamage).toBeGreaterThan(0)
    }
    expect(burst.result.expectedDamage).toBeGreaterThan(charged.result.expectedDamage)
  }, 20_000)

  it("evaluates Zibai's Spirit Steed Lunar-Crystallize hit with the full team stat and base-damage ledger", async () => {
    const zibai = withTriplePercentMainStats(
      createBuild("Zibai", "FluteOfEzpitzal", "test.zibai.lunar", 2),
      "def_percent"
    )
    const linnea = withTriplePercentMainStats(
      createBuild("Linnea", "TheFirstGreatMagic", "test.linnea.lunar"),
      "def_percent"
    )
    const columbina = withTriplePercentMainStats(
      createBuild("Columbina", "NocturnesCurtainCall", "test.columbina.lunar"),
      "hp_percent"
    )
    const illuga = createBuild("Illuga", "DragonsBane", "test.illuga.c6.lunar", 6)

    const evaluation = await evaluate(
      zibai,
      [linnea, columbina, illuga],
      "zibai.skill.spirit_steed_stride.second_hit.lunar_crystallize"
    )

    expect(findEffect(evaluation, "zibai.passive.other_geo.defense_percent.stack_1")?.value).toBeCloseTo(0.15)
    expect(findEffect(evaluation, "zibai.passive.other_geo.defense_percent.stack_2")?.value).toBeCloseTo(0.15)
    expect(findEffect(evaluation, "zibai.passive.hydro_teammate.elemental_mastery.stack_1")?.value).toBe(60)
    expect(findEffect(evaluation, "illuga.passive.lightkeepers_oath.geo.crit_rate")?.value).toBeCloseTo(0.05)
    expect(findEffect(evaluation, "illuga.constellation.6.lightkeepers_oath.geo.extra_crit_rate")?.value).toBeCloseTo(0.05)
    expect(findEffect(evaluation, "illuga.passive.lightkeepers_oath.geo.crit_damage")?.value).toBeCloseTo(0.1)
    expect(findEffect(evaluation, "illuga.constellation.6.lightkeepers_oath.geo.extra_crit_damage")?.value).toBeCloseTo(0.2)
    expect(findEffect(evaluation, "illuga.passive.lightkeepers_oath.full_moonsign.elemental_mastery")?.value).toBe(50)
    expect(findEffect(evaluation, "illuga.constellation.6.lightkeepers_oath.full_moonsign.extra_elemental_mastery")?.value).toBe(30)
    expect(findEffect(evaluation, "illuga.constellation.4.active_character.defense")?.value).toBe(200)
    expect(
      findEffect(evaluation, "zibai.constellation.1.first_spirit_steed_stride.lunar_crystallize_damage_bonus")?.value
    ).toBeCloseTo(2.2)
    expect(
      findEffect(evaluation, "zibai.constellation.2.lunar_phase_shift.lunar_crystallize_damage_bonus")?.value
    ).toBeCloseTo(0.3)
    expect(
      findEffect(evaluation, "illuga.passive.hunters_dusk.lunar_crystallize.three_or_more_characters")?.value
    ).toBeGreaterThan(0)
    expect(findEffect(evaluation, "columbina.burst.lunar_domain.lunar_reaction_damage_bonus")?.value).toBeCloseTo(0.4)
    expect(findEffect(evaluation, "linnea.passive.lunar_crystallize_base_damage_bonus")?.value).toBeCloseTo(0.14)
    expect(findEffect(evaluation, "zibai.passive.lunar_crystallize_base_damage_bonus")?.value).toBeCloseTo(0.14)
    expect(findEffect(evaluation, "columbina.passive.lunar_reaction_base_damage_bonus")?.value).toBeCloseTo(0.07)

    const baseDamageBonus = evaluation.rotation.events[0]?.trace.find(
      (entry) => entry.stage === "base_damage_bonus"
    )?.formula
    expect(baseDamageBonus?.kind).toBe("special_reaction_base_damage_bonus")
    expect(baseDamageBonus?.bonus).toBeCloseTo(0.35)

    const baseTerms = evaluation.rotation.events[0]?.trace.find((entry) => entry.stage === "base_damage")?.formula.terms
    expect(baseTerms).toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: expect.stringContaining("太阴降"),
        stat: "defense",
        value: evaluation.stats.effectiveDefense
      }),
      expect.objectContaining({
        label: expect.stringContaining("C2"),
        stat: "defense",
        value: evaluation.stats.effectiveDefense
      })
    ]))
    expect(evaluation.result.expectedDamage).toBeGreaterThan(0)
  }, 20_000)
})
