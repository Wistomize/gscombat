import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild, ExternalBuff } from "@gscombat/contracts"
import { afterAll, describe, expect, it } from "vitest"

import { buildApp } from "../../src/app.js"

const app = buildApp()

interface SpecialReactionEvaluation {
  readonly appliedEffects: readonly {
    readonly id: string
    readonly label: string
    readonly scalingStat?: string
    readonly sourceId: string
    readonly target: string
    readonly value: number
  }[]
  readonly result: {
    readonly expectedDamage: number
    readonly trace: readonly {
      readonly formula: {
        readonly critDamage?: number
        readonly critRate?: number
        readonly kind: string
        readonly multiplier?: number
      }
      readonly stage: string
    }[]
  }
  readonly rotation: {
    readonly dpr: number
    readonly events: readonly {
      readonly expectedDamage: number
      readonly hitCount: number
      readonly id: string
      readonly trace: readonly {
        readonly formula: {
          readonly ascensionBonus?: number
          readonly bonus?: number
          readonly elementalMastery?: number
          readonly flatDamageAddition?: number
          readonly kind: string
          readonly multiplier?: number
          readonly resistanceReduction?: number
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
    readonly effectiveAttack: number
    readonly effectiveDefense: number
    readonly effectiveHp: number
    readonly elementalMastery: number
  }
}

interface SpecialReactionAnalysis {
  readonly analysis: {
    readonly marginalSubstats: readonly { readonly gainRatio: number; readonly stat: string }[]
    readonly progressionGains: readonly { readonly gainRatio: number; readonly id: string }[]
    readonly weapons: readonly { readonly expectedDamage: number; readonly weaponId: string }[]
  }
  readonly evaluation: SpecialReactionEvaluation
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

function withTripleElementalMasteryMainStats(build: CharacterBuild): CharacterBuild {
  return {
    ...build,
    artifacts: build.artifacts.map((artifact) => {
      if (artifact.slot === "flower" || artifact.slot === "plume") return artifact
      return { ...artifact, mainStat: { stat: "elemental_mastery", value: 187 } }
    })
  }
}

async function analyze(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  targetActionId: string,
  actionParameters: Readonly<Record<string, number>> = {},
  externalBuffs: readonly ExternalBuff[] = []
): Promise<SpecialReactionAnalysis> {
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
      externalBuffs,
      primary,
      targetActionId,
      teammates
    },
    url: "/v1/analysis"
  })

  expect(response.statusCode, response.body).toBe(200)
  return response.json() as SpecialReactionAnalysis
}

async function evaluate(
  primary: CharacterBuild,
  teammates: readonly CharacterBuild[],
  targetActionId: string,
  actionParameters: Readonly<Record<string, number>> = {},
  externalBuffs: readonly ExternalBuff[] = []
): Promise<SpecialReactionEvaluation> {
  return (await analyze(primary, teammates, targetActionId, actionParameters, externalBuffs)).evaluation
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
    const yae = createBuild("YaeMiko", "TheWidsith", "test.yae.c2.stellar", 2)
    const qiqi = createBuild("Qiqi", "FavoniusSword", "test.qiqi.c6.stellar", 6)
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
      expect(findEffect(evaluation, "qiqi.locked_passive.stellar_superconduct_damage_bonus")?.value).toBeCloseTo(0.5)
      expect(findEffect(evaluation, "qiqi.constellation.6.profound_mystery.stellar_superconduct_base_damage")?.value)
        .toBeGreaterThan(0)
      expect(findEffect(evaluation, "yae_miko.constellation.1.stellar_superconduct_damage_bonus")?.value).toBeCloseTo(0.5)
      expect(findEffect(evaluation, "yae_miko.constellation.2.active_character.elemental_mastery")?.value).toBe(200)
      expect(findEffect(evaluation, "xilonen.constellation.2.cryo.crit_damage")?.value).toBeCloseTo(0.6)
      expect(evaluation.appliedEffects.some((effect) => effect.id.includes("a-thousand-blazing-suns.nightsoul"))).toBe(false)
      expect(evaluation.result.expectedDamage).toBeGreaterThan(0)
    }
    expect(burst.result.expectedDamage).toBeGreaterThan(charged.result.expectedDamage)
  }, 30_000)

  it("evaluates Zibai's Spirit Steed Lunar-Crystallize hit with the full team stat and fixed-damage ledger", async () => {
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
    const selenicDescent = findEffect(
      evaluation,
      "zibai.passive.selenic_descent.spirit_steed_second_hit.base_damage"
    )
    const fullMoonsignC2 = findEffect(
      evaluation,
      "zibai.constellation.2.full_moonsign.spirit_steed_second_hit.base_damage"
    )
    expect(selenicDescent).toMatchObject({ target: "specialReactionFlatDamageAddition" })
    expect(selenicDescent?.value).toBeCloseTo(evaluation.stats.effectiveDefense * 0.6)
    expect(fullMoonsignC2).toMatchObject({ target: "specialReactionFlatDamageAddition" })
    expect(fullMoonsignC2?.value).toBeCloseTo(evaluation.stats.effectiveDefense * 5.5)

    const baseDamageBonus = evaluation.rotation.events[0]?.trace.find(
      (entry) => entry.stage === "base_damage_bonus"
    )?.formula
    expect(baseDamageBonus?.kind).toBe("special_reaction_base_damage_bonus")
    expect(baseDamageBonus?.bonus).toBeCloseTo(0.35)

    const baseTerms = evaluation.rotation.events[0]?.trace.find((entry) => entry.stage === "base_damage")?.formula.terms
    expect(baseTerms?.some((term) => term.label?.includes("太阴降"))).toBe(false)
    const fixedDamageAddition = evaluation.rotation.events[0]?.trace.find(
      (entry) => entry.stage === "flat_damage_addition"
    )?.formula
    const expectedFixedDamageAddition = evaluation.appliedEffects
      .filter((effect) => effect.target === "specialReactionFlatDamageAddition")
      .reduce((total, effect) => total + effect.value, 0)
    expect(fixedDamageAddition?.kind).toBe("special_reaction_flat_damage_addition")
    expect(fixedDamageAddition?.flatDamageAddition).toBeCloseTo(expectedFixedDamageAddition)
    expect(evaluation.result.expectedDamage).toBeGreaterThan(0)
  }, 20_000)

  it("publishes Linnea's two heals and two Lunar-Crystallize hammers with cumulative constellation stages", async () => {
    const actionIds = [
      "linnea.skill.lumi.enhanced_hammer.lunar_crystallize",
      "linnea.skill.lumi.million_ton_hammer.lunar_crystallize"
    ] as const
    const columbina = withTriplePercentMainStats(
      createBuild("Columbina", "NocturnesCurtainCall", "test.columbina.linnea-support"),
      "hp_percent"
    )
    const createLinnea = (constellation: number) =>
      withTriplePercentMainStats(
        createBuild("Linnea", "TheFirstGreatMagic", `test.linnea.c${constellation}.lunar`, constellation),
        "def_percent"
      )
    const c0 = createLinnea(0)
    const c4 = createLinnea(4)
    const c6 = createLinnea(6)
    const [c0Enhanced, c0Million, c4Enhanced, c4Million, c6Enhanced, c6Million, catalogResponse] =
      await Promise.all([
        evaluate(c0, [columbina], actionIds[0]),
        evaluate(c0, [columbina], actionIds[1]),
        evaluate(c4, [columbina], actionIds[0]),
        evaluate(c4, [columbina], actionIds[1]),
        evaluate(c6, [columbina], actionIds[0]),
        evaluate(c6, [columbina], actionIds[1]),
        app.inject({ method: "GET", url: "/v1/catalog" })
      ])

    expect(catalogResponse.statusCode).toBe(200)
    const catalogLinnea = (catalogResponse.json().characters as readonly {
      readonly characterId: string
      readonly primaryActionIds: readonly string[]
      readonly supportMetrics: readonly { readonly id: string }[]
    }[]).find((character) => character.characterId === "Linnea")
    expect(catalogLinnea?.primaryActionIds).toEqual(actionIds)
    expect(catalogLinnea?.supportMetrics.map((metric) => metric.id)).toEqual([
      "linnea.burst.initial_team_healing",
      "linnea.burst.continuous_healing_tick"
    ])

    const c0Evaluations = [c0Enhanced, c0Million]
    for (const [index, evaluation] of c0Evaluations.entries()) {
      const trace = evaluation.rotation.events[0]?.trace ?? []
      const baseTerms = trace.find((entry) => entry.stage === "base_damage")?.formula.terms
      expect(baseTerms?.[0]).toMatchObject({ coefficient: index === 0 ? 1.8 : 7.2, stat: "defense" })
      expect(trace.find((entry) => entry.stage === "reaction_coefficient")?.formula.multiplier).toBeCloseTo(1.6)
      expect(findEffect(evaluation, "linnea.passive.defense_to_elemental_mastery")?.value).toBeGreaterThan(0)
      expect(findEffect(evaluation, "linnea.passive.lunar_crystallize_base_damage_bonus")?.value).toBeCloseTo(0.14)
      expect(trace.some((entry) => entry.stage === "defense" || entry.stage === "damage_bonus")).toBe(false)
    }
    expect(c0Million.result.expectedDamage).toBeGreaterThan(c0Enhanced.result.expectedDamage)

    expect(findEffect(c4Enhanced, "linnea.constellation.4.lunar_cage_chord.linnea.defense_percent")?.value)
      .toBeCloseTo(0.25)
    expect(findEffect(c4Enhanced, "linnea.constellation.4.lunar_cage_chord.active_linnea.defense_percent"))
      .toBeUndefined()
    expect(findEffect(c4Million, "linnea.constellation.4.lunar_cage_chord.linnea.defense_percent")?.value)
      .toBeCloseTo(0.25)
    expect(findEffect(c4Million, "linnea.constellation.4.lunar_cage_chord.active_linnea.defense_percent")?.value)
      .toBeCloseTo(0.25)
    expect(c4Enhanced.stats.effectiveDefense).toBeGreaterThan(c0Enhanced.stats.effectiveDefense)
    expect(c4Million.stats.effectiveDefense).toBeGreaterThan(c4Enhanced.stats.effectiveDefense)

    const c4EnhancedChronicle = findEffect(
      c4Enhanced,
      "linnea.constellation.1.chronicle.enhanced_hammer.flat_damage_addition"
    )
    const c4MillionChronicle = findEffect(
      c4Million,
      "linnea.constellation.1.chronicle.million_ton_hammer.flat_damage_addition"
    )
    expect(c4EnhancedChronicle).toMatchObject({ target: "specialReactionFlatDamageAddition" })
    expect(c4EnhancedChronicle?.value).toBeCloseTo(c4Enhanced.stats.effectiveDefense * 0.75)
    expect(c4MillionChronicle).toMatchObject({ target: "specialReactionFlatDamageAddition" })
    expect(c4MillionChronicle?.value).toBeCloseTo(c4Million.stats.effectiveDefense * 7.5)
    expect(findEffect(c4Enhanced, "linnea.constellation.2.lunar_cage_chord.hydro_geo_crit_damage")?.value)
      .toBeCloseTo(0.4)
    expect(findEffect(c4Enhanced, "linnea.constellation.2.million_ton_hammer.crit_damage")).toBeUndefined()
    expect(findEffect(c4Million, "linnea.constellation.2.lunar_cage_chord.hydro_geo_crit_damage")?.value)
      .toBeCloseTo(0.4)
    expect(findEffect(c4Million, "linnea.constellation.2.million_ton_hammer.crit_damage")?.value).toBeCloseTo(1.5)

    const c6EnhancedExtra = findEffect(
      c6Enhanced,
      "linnea.constellation.6.chronicle.enhanced_hammer.extra_flat_damage_addition"
    )
    const c6MillionExtra = findEffect(
      c6Million,
      "linnea.constellation.6.chronicle.million_ton_hammer.extra_flat_damage_addition"
    )
    expect(c6EnhancedExtra?.value).toBeCloseTo(c6Enhanced.stats.effectiveDefense * 0.375)
    expect(c6MillionExtra?.value).toBeCloseTo(c6Million.stats.effectiveDefense * 3.75)
    expect(findEffect(c6Enhanced, "linnea.constellation.6.full_moonsign.lunar_crystallize_elevation")?.value)
      .toBeCloseTo(0.25)
    expect(findEffect(c6Million, "linnea.constellation.6.full_moonsign.lunar_crystallize_elevation")?.value)
      .toBeCloseTo(0.25)
    expect(c6Million.result.expectedDamage).toBeGreaterThan(c4Million.result.expectedDamage)
  }, 30_000)

  it("evaluates both Flins Thunder Symphony Lunar-Charged hits through their reviewed stages", async () => {
    const flins = createBuild("Flins", "CalamityQueller", "test.flins.c6.lunar-charged", 6)
    const ineffa = createBuild("Ineffa", "CalamityQueller", "test.ineffa.c1.flins-support", 1)
    const [thunder, additional, catalogResponse] = await Promise.all([
      evaluate(flins, [ineffa], "flins.burst.thunder_symphony.lunar_charged"),
      evaluate(flins, [ineffa], "flins.burst.thunder_symphony.additional_lunar_charged"),
      app.inject({ method: "GET", url: "/v1/catalog" })
    ])

    expect(catalogResponse.statusCode).toBe(200)
    const catalogFlins = (catalogResponse.json().characters as readonly {
      readonly characterId: string
      readonly primaryActionIds: readonly string[]
    }[]).find((character) => character.characterId === "Flins")
    expect(catalogFlins?.primaryActionIds).toEqual([
      "flins.burst.thunder_symphony.lunar_charged",
      "flins.burst.thunder_symphony.additional_lunar_charged"
    ])

    for (const evaluation of [thunder, additional]) {
      const enhancedMastery = findEffect(
        evaluation,
        "flins.constellation.4.whispers_of_the_spectral_flame.elemental_mastery"
      )
      expect(findEffect(evaluation, "flins.passive.whispers_of_the_spectral_flame.elemental_mastery")).toBeUndefined()
      expect(enhancedMastery?.value).toBeCloseTo(Math.min(evaluation.stats.effectiveAttack * 0.1, 220))
      expect(findEffect(evaluation, "flins.constellation.4.attack_percent")?.value).toBeCloseTo(0.2)
      expect(findEffect(evaluation, "flins.passive.moonsign_benediction.lunar_charged_base_damage_bonus")?.value)
        .toBeCloseTo(0.14)
      expect(findEffect(evaluation, "ineffa.passive.moonsign_benediction.lunar_charged_base_damage_bonus")?.value)
        .toBeCloseTo(0.14)
      expect(findEffect(evaluation, "flins.passive.winters_symphony.lunar_charged_damage_bonus")?.value)
        .toBeCloseTo(0.2)
      expect(findEffect(evaluation, "ineffa.constellation.1.lunar_charged_damage_bonus")?.value).toBeCloseTo(0.5)
      expect(findEffect(evaluation, "flins.constellation.2.electro_resistance_reduction")?.value).toBeCloseTo(0.25)
      expect(findEffect(evaluation, "flins.constellation.6.self_lunar_charged_elevation")?.value).toBeCloseTo(0.35)
      expect(findEffect(evaluation, "flins.constellation.6.team_lunar_charged_elevation")?.value).toBeCloseTo(0.1)
      expect(findEffect(evaluation, "ineffa.passive.total_phase_reconfiguration_protocol.elemental_mastery")?.value)
        .toBeGreaterThan(0)

      const trace = evaluation.rotation.events[0]?.trace ?? []
      expect(trace.find((entry) => entry.stage === "base_damage_bonus")?.formula.bonus).toBeCloseTo(0.28)
      expect(trace.find((entry) => entry.stage === "reaction_damage_bonus")?.formula.bonus).toBeCloseTo(0.7)
      expect(trace.find((entry) => entry.stage === "flat_damage_addition")?.formula.flatDamageAddition).toBe(0)
      expect(trace.find((entry) => entry.stage === "resistance")?.formula.resistanceReduction).toBeCloseTo(0.25)
      expect(trace.find((entry) => entry.stage === "ascension")?.formula.ascensionBonus).toBeCloseTo(0.45)
      expect(trace.some((entry) => entry.stage === "defense")).toBe(false)
    }

    const thunderCoefficient = thunder.rotation.events[0]?.trace.find((entry) => entry.stage === "base_damage")
      ?.formula.terms?.[0]?.coefficient
    const additionalCoefficient = additional.rotation.events[0]?.trace.find((entry) => entry.stage === "base_damage")
      ?.formula.terms?.[0]?.coefficient
    expect(thunderCoefficient).toBeCloseTo(1.51844)
    expect(additionalCoefficient).toBeCloseTo(2.20864)
    expect(additional.result.expectedDamage).toBeGreaterThan(thunder.result.expectedDamage)
  }, 20_000)

  it("uses Ineffa's passive Lunar-Charged hit as her primary damage metric without merging C2 or C6 events", async () => {
    const ineffa = createBuild("Ineffa", "CalamityQueller", "test.ineffa.c1.lunar-charged", 1)
    const flins = createBuild("Flins", "CalamityQueller", "test.flins.ineffa-support")
    const [passive, skill, burst, catalogResponse] = await Promise.all([
      evaluate(ineffa, [flins], "ineffa.passive.frequency_overlimit_circuit.additional_lunar_charged"),
      evaluate(ineffa, [flins], "ineffa.skill.cleaning_mode_carrier_frequency.initial_hit"),
      evaluate(ineffa, [flins], "ineffa.burst.supreme_instruction_cyclonic_exterminator.initial_hit"),
      app.inject({ method: "GET", url: "/v1/catalog" })
    ])

    expect(catalogResponse.statusCode).toBe(200)
    const catalogIneffa = (catalogResponse.json().characters as readonly {
      readonly characterId: string
      readonly primaryActionIds: readonly string[]
      readonly supportMetrics: readonly { readonly id: string }[]
    }[]).find((character) => character.characterId === "Ineffa")
    expect(catalogIneffa?.primaryActionIds).toEqual([
      "ineffa.passive.frequency_overlimit_circuit.additional_lunar_charged",
      "ineffa.skill.cleaning_mode_carrier_frequency.initial_hit",
      "ineffa.burst.supreme_instruction_cyclonic_exterminator.initial_hit"
    ])
    expect(catalogIneffa?.supportMetrics.map((metric) => metric.id)).toContain(
      "ineffa.skill.cleaning_mode_carrier_frequency.optical_flow_shield.initial_absorption"
    )

    const ownBaseDamageBonus = findEffect(
      passive,
      "ineffa.passive.moonsign_benediction.lunar_charged_base_damage_bonus"
    )
    const flinsBaseDamageBonus = findEffect(
      passive,
      "flins.passive.moonsign_benediction.lunar_charged_base_damage_bonus"
    )
    const mastery = findEffect(passive, "ineffa.passive.total_phase_reconfiguration_protocol.elemental_mastery")
    const c1DamageBonus = findEffect(passive, "ineffa.constellation.1.lunar_charged_damage_bonus")
    expect(ownBaseDamageBonus?.value).toBeCloseTo(Math.min(passive.stats.effectiveAttack * 0.00007, 0.14))
    expect(flinsBaseDamageBonus?.value).toBeGreaterThan(0)
    expect(mastery?.value).toBeCloseTo(passive.stats.effectiveAttack * 0.06)
    expect(c1DamageBonus?.value).toBeCloseTo(Math.min(passive.stats.effectiveAttack * 0.00025, 0.5))

    const trace = passive.rotation.events[0]?.trace ?? []
    const baseTerms = trace.find((entry) => entry.stage === "base_damage")?.formula.terms
    expect(baseTerms?.[0]?.coefficient).toBeCloseTo(0.65)
    expect(trace.find((entry) => entry.stage === "reaction_coefficient")?.formula.multiplier).toBe(3)
    expect(trace.find((entry) => entry.stage === "base_damage_bonus")?.formula.bonus).toBeCloseTo(
      (ownBaseDamageBonus?.value ?? 0) + (flinsBaseDamageBonus?.value ?? 0)
    )
    expect(trace.find((entry) => entry.stage === "reaction_damage_bonus")?.formula.bonus).toBeCloseTo(
      c1DamageBonus?.value ?? 0
    )
    expect(trace.find((entry) => entry.stage === "flat_damage_addition")?.formula.flatDamageAddition).toBe(0)
    expect(trace.find((entry) => entry.stage === "ascension")?.formula.ascensionBonus).toBe(0)
    expect(passive.appliedEffects.some((effect) => effect.id.includes("constellation.2"))).toBe(false)
    expect(passive.appliedEffects.some((effect) => effect.id.includes("constellation.6"))).toBe(false)
    expect(passive.result.expectedDamage).toBeGreaterThan(0)
    expect(burst.result.expectedDamage).toBeGreaterThan(skill.result.expectedDamage)
  }, 20_000)

  it("publishes Columbina's three Gravity Interference metrics with their reviewed Moon stages", async () => {
    const columbina = withTriplePercentMainStats(
      createBuild("Columbina", "NocturnesCurtainCall", "test.columbina.c6.gravity-interference", 6),
      "hp_percent"
    )
    const actionIds = [
      "columbina.skill.eternal_tides.gravity_interference.lunar_charged",
      "columbina.skill.eternal_tides.gravity_interference.lunar_bloom",
      "columbina.skill.eternal_tides.gravity_interference.lunar_crystallize"
    ] as const
    const [lunarCharged, lunarBloom, lunarCrystallize, catalogResponse] = await Promise.all([
      evaluate(columbina, [], actionIds[0]),
      evaluate(columbina, [], actionIds[1]),
      evaluate(columbina, [], actionIds[2]),
      app.inject({ method: "GET", url: "/v1/catalog" })
    ])
    const evaluations = [lunarCharged, lunarBloom, lunarCrystallize]
    const expectedTalentCoefficients = [0.09996, 0.02992, 0.18751]
    const expectedReactionCoefficients = [3, 1, 1.6]
    const expectedC4Ratios = [0.125, 0.025, 0.125]

    expect(catalogResponse.statusCode).toBe(200)
    const catalogColumbina = (catalogResponse.json().characters as readonly {
      readonly characterId: string
      readonly primaryActionIds: readonly string[]
      readonly primaryActions: readonly {
        readonly id: string
        readonly label: string
        readonly tracePresentation?: { readonly totalLabel: string }
      }[]
    }[]).find((character) => character.characterId === "Columbina")
    expect(catalogColumbina?.primaryActionIds).toEqual(actionIds)
    expect(catalogColumbina?.primaryActions[1]).toMatchObject({
      label: "万古潮汐 / 引力干涉·月绽放五次伤害合计",
      tracePresentation: { totalLabel: "引力干涉·月绽放五次伤害合计" }
    })

    for (const [index, evaluation] of evaluations.entries()) {
      const trace = evaluation.rotation.events[0]?.trace ?? []
      const baseTerms = trace.find((entry) => entry.stage === "base_damage")?.formula.terms
      const c4Effect = evaluation.appliedEffects.find((effect) =>
        effect.id.startsWith("columbina.constellation.4.gravity_interference.") &&
        effect.id.endsWith(".flat_damage_addition")
      )
      const elevation = evaluation.appliedEffects
        .filter((effect) => effect.id.match(/^columbina\.constellation\.\d\.party_lunar_reaction_elevation$/))
        .reduce((total, effect) => total + effect.value, 0)

      expect(findEffect(evaluation, "columbina.passive.gravity_interference.full_stacks.crit_rate")?.value)
        .toBeCloseTo(0.15)
      expect(
        findEffect(
          evaluation,
          "columbina.constellation.2.illumine_the_night.gravity_interference.radiant_moon.hp_percent"
        )?.value
      ).toBeCloseTo(0.4)
      expect(findEffect(evaluation, "columbina.passive.lunar_reaction_base_damage_bonus")?.value).toBeCloseTo(0.07)
      expect(findEffect(evaluation, "columbina.burst.lunar_domain.lunar_reaction_damage_bonus")?.value).toBeCloseTo(0.49)
      expect(c4Effect?.target).toBe("specialReactionFlatDamageAddition")
      expect(c4Effect?.value).toBeCloseTo(evaluation.stats.effectiveHp * (expectedC4Ratios[index] ?? 0))
      expect(elevation).toBeCloseTo(0.2)
      expect(evaluation.appliedEffects.find((effect) =>
        effect.id.startsWith("columbina.constellation.6.gravity_interference.") &&
        effect.id.endsWith(".crit_damage")
      )?.value).toBeCloseTo(0.8)
      expect(baseTerms?.[0]?.coefficient).toBeCloseTo(expectedTalentCoefficients[index] ?? 0)
      expect(trace.find((entry) => entry.stage === "reaction_coefficient")?.formula.multiplier)
        .toBeCloseTo(expectedReactionCoefficients[index] ?? 0)
      expect(trace.find((entry) => entry.stage === "base_damage_bonus")?.formula.bonus).toBeCloseTo(0.07)
      expect(trace.find((entry) => entry.stage === "reaction_damage_bonus")?.formula.bonus).toBeCloseTo(0.49)
      expect(trace.find((entry) => entry.stage === "flat_damage_addition")?.formula.flatDamageAddition)
        .toBeCloseTo(c4Effect?.value ?? 0)
      expect(trace.find((entry) => entry.stage === "ascension")?.formula.ascensionBonus).toBeCloseTo(0.2)
      expect(trace.some((entry) => entry.stage === "defense" || entry.stage === "damage_bonus")).toBe(false)
      expect(evaluation.result.expectedDamage).toBeGreaterThan(0)
    }

    expect(lunarBloom.rotation.events[0]).toMatchObject({ hitCount: 5 })
    expect(lunarBloom.rotation.dpr).toBeCloseTo(lunarBloom.rotation.events[0]?.expectedDamage ?? 0)
  }, 20_000)

  it("applies every damage-relevant Xilonen C2 Source Sample branch to its matching recipient", async () => {
    const xilonen = createBuild("Xilonen", "FluteOfEzpitzal", "test.xilonen.c2.samples", 2)
    const pyro = await evaluate(
      createBuild("Xiangling", "DragonsBane", "test.xiangling.xilonen-c2"),
      [xilonen, createBuild("Yelan", "FavoniusWarbow", "test.yelan.xilonen-c2")],
      "xiangling.burst.pyronado.no_reaction"
    )
    const hydro = await evaluate(
      createBuild("Neuvillette", "TheWidsith", "test.neuvillette.xilonen-c2"),
      [xilonen, createBuild("Bennett", "FavoniusSword", "test.bennett.xilonen-c2")],
      "neuvillette.normal.charged_attack.equitable_judgment.single_tick"
    )
    const geo = await evaluate(
      createBuild("Zibai", "FluteOfEzpitzal", "test.zibai.xilonen-c2"),
      [xilonen],
      "zibai.burst.tri_sphere_eminence.first_hit"
    )

    expect(findEffect(pyro, "xilonen.constellation.2.pyro.attack_percent")?.value).toBeCloseTo(0.45)
    expect(findEffect(hydro, "xilonen.constellation.2.hydro.hp_percent")?.value).toBeCloseTo(0.45)
    expect(findEffect(geo, "xilonen.constellation.2.geo.damage_bonus")?.value).toBeCloseTo(0.5)
    expect(findEffect(geo, "xilonen.constellation.2.geo.always_active.resistance_reduction")?.value).toBeGreaterThan(0)
  }, 20_000)

  it("publishes and evaluates Yae Miko's rank-three Sesshou Sakura Aggravate metric in a Dendro team", async () => {
    const yae = createBuild("YaeMiko", "TheWidsith", "test.yae.aggravate")
    const nahida = createBuild("Nahida", "FavoniusCodex", "test.nahida.yae-aggravate")
    const actionId = "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt.aggravate"
    const [aggravate, direct, catalogResponse] = await Promise.all([
      evaluate(yae, [nahida], actionId),
      evaluate(yae, [nahida], "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt"),
      app.inject({ method: "GET", url: "/v1/catalog" })
    ])

    expect(catalogResponse.statusCode).toBe(200)
    const catalogYae = (catalogResponse.json().characters as readonly {
      readonly characterId: string
      readonly primaryActionIds: readonly string[]
    }[]).find((character) => character.characterId === "YaeMiko")
    expect(catalogYae?.primaryActionIds).toContain(actionId)
    expect(aggravate.result.expectedDamage).toBeGreaterThan(direct.result.expectedDamage)
    expect(aggravate.result.trace.some((entry) => entry.formula.kind === "additive_reaction")).toBe(true)
  }, 20_000)

  it("publishes Yae Miko's 200% ATK Purification Proclamation Stellar-Superconduct metric", async () => {
    const actionId = "yae_miko.locked_passive.purification_proclamation.radiance.stellar_superconduct"
    const actionParameters = { "stored-elemental-applications": 12 }
    const [constellationFive, constellationSix, catalogResponse] = await Promise.all([
      evaluate(createBuild("YaeMiko", "TheWidsith", "test.yae.c5.stellar", 5), [], actionId, actionParameters),
      evaluate(createBuild("YaeMiko", "TheWidsith", "test.yae.c6.stellar", 6), [], actionId, actionParameters),
      app.inject({ method: "GET", url: "/v1/catalog" })
    ])

    expect(catalogResponse.statusCode).toBe(200)
    const catalogYae = (catalogResponse.json().characters as readonly {
      readonly characterId: string
      readonly primaryActionIds: readonly string[]
    }[]).find((character) => character.characterId === "YaeMiko")
    expect(catalogYae?.primaryActionIds).toContain(actionId)

    const baseDamage = constellationFive.rotation.events[0]?.trace.find((entry) => entry.stage === "base_damage")
    expect(baseDamage?.formula.terms).toEqual([
      expect.objectContaining({ coefficient: 2, stat: "attack", value: constellationFive.stats.effectiveAttack })
    ])
    expect(findEffect(constellationFive, "yae_miko.constellation.6.self.stellar_superconduct.crit_damage"))
      .toBeUndefined()
    expect(findEffect(constellationSix, "yae_miko.constellation.6.self.stellar_superconduct.crit_damage")?.value)
      .toBe(2)
    expect(constellationSix.stats.critDamage).toBeCloseTo(constellationFive.stats.critDamage + 2)
    expect(constellationSix.result.expectedDamage).toBeGreaterThan(constellationFive.result.expectedDamage)
  }, 20_000)

  it("evaluates Mizuki's Radiance Stellar-Swirl linkage as one constellation-aware event sum", async () => {
    const actionId = "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.radiance_stellar_swirl_combo"
    const teammates = [
      createBuild("Sucrose", "FavoniusCodex", "test.mizuki.stellar.sucrose"),
      createBuild("Fischl", "FavoniusWarbow", "test.mizuki.stellar.fischl"),
      createBuild("Bennett", "FavoniusSword", "test.mizuki.stellar.bennett")
    ]
    const [constellationZero, constellationOne, constellationSix, catalogResponse] = await Promise.all([
      evaluate(
        withTripleElementalMasteryMainStats(
          createBuild("YumemizukiMizuki", "FavoniusCodex", "test.mizuki.stellar.c0", 0)
        ),
        teammates,
        actionId
      ),
      evaluate(
        withTripleElementalMasteryMainStats(
          createBuild("YumemizukiMizuki", "FavoniusCodex", "test.mizuki.stellar.c1", 1)
        ),
        teammates,
        actionId
      ),
      evaluate(
        withTripleElementalMasteryMainStats(
          createBuild("YumemizukiMizuki", "FavoniusCodex", "test.mizuki.stellar.c6", 6)
        ),
        teammates,
        actionId
      ),
      app.inject({ method: "GET", url: "/v1/catalog" })
    ])

    expect(catalogResponse.statusCode).toBe(200)
    const catalogMizuki = (catalogResponse.json().characters as readonly {
      readonly characterId: string
      readonly primaryActions: readonly { readonly id: string }[]
    }[]).find((character) => character.characterId === "YumemizukiMizuki")
    expect(catalogMizuki?.primaryActions.filter((action) => action.id.includes("stellar_swirl"))).toEqual([
      expect.objectContaining({ id: actionId })
    ])

    const eventIds = (evaluation: SpecialReactionEvaluation) =>
      evaluation.rotation.events.map((event) => event.id.replace(`${actionId}.`, ""))
    expect(eventIds(constellationZero)).toEqual([
      "radiance-stellar-swirl-trigger",
      "revelation-radiance-stellar-swirl-damage"
    ])
    expect(eventIds(constellationOne)).toEqual([
      "radiance-stellar-swirl-trigger",
      "revelation-radiance-stellar-swirl-damage",
      "c1-awaiting-stellar-swirl-damage"
    ])
    expect(eventIds(constellationSix)).toEqual(eventIds(constellationOne))

    const a4ElementalMasteryId = "yumemizuki_mizuki.passive.daydream_night_dream.phec_hit.elemental_mastery"
    const partyElementalMasteryId =
      "yumemizuki_mizuki.locked_passive.revelation.dreamdrifter.party_elemental_mastery"
    const stellarSwirlDamageBonusId =
      "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.dreamdrifter.party_stellar_swirl.damage_bonus"
    const c2ResistanceReductionId =
      "yumemizuki_mizuki.constellation.2.dreamdrifter.enemy_phec_anemo_resistance_reduction"
    const partyElementalMastery = findEffect(constellationZero, partyElementalMasteryId)?.value
    expect(findEffect(constellationZero, a4ElementalMasteryId)?.value).toBe(100)
    expect(partyElementalMastery).toBeGreaterThan(0)
    expect(partyElementalMastery).toBeCloseTo((constellationZero.stats.elementalMastery - (partyElementalMastery ?? 0)) * 0.1)
    expect(findEffect(constellationZero, stellarSwirlDamageBonusId)?.value).toBeGreaterThan(0)
    expect(findEffect(constellationOne, c2ResistanceReductionId)).toBeUndefined()
    expect(findEffect(constellationSix, c2ResistanceReductionId)?.value).toBe(0.2)

    const trigger = constellationOne.rotation.events[0]
    const revelation = constellationOne.rotation.events[1]
    const awaiting = constellationOne.rotation.events[2]
    if (!trigger || !revelation || !awaiting) throw new Error("Expected Mizuki's three C1 Stellar-Swirl events")
    const aggregation = trigger.trace.find(
      (entry) => (entry as { readonly kind?: string }).kind === "stellar_swirl_participant_aggregation"
    ) as unknown as
      | {
          readonly participants: readonly {
            readonly participantId: string
            readonly trace: readonly {
              readonly formula: { readonly flatDamageAddition?: number }
              readonly stage: string
            }[]
          }[]
          readonly reactionCoefficient: number
        }
      | undefined
    const mizukiParticipant = aggregation?.participants.find(
      (participant) => participant.participantId === "test.mizuki.stellar.c1"
    )
    const c1FlatDamage = mizukiParticipant?.trace.find((entry) => entry.stage === "flat_damage_addition")
    expect(aggregation?.reactionCoefficient).toBeCloseTo(0.75)
    expect(aggregation?.participants).toHaveLength(4)
    expect(c1FlatDamage?.formula.flatDamageAddition).toBeCloseTo(constellationOne.stats.elementalMastery * 5.5)
    expect(revelation.trace.find((entry) => entry.stage === "base_damage")?.formula.terms?.[0]?.coefficient).toBe(10)
    expect(awaiting.trace.find((entry) => entry.stage === "base_damage")?.formula.terms?.[0]?.coefficient).toBe(4)
    expect(revelation.trace.find((entry) => entry.stage === "flat_damage_addition")?.formula.flatDamageAddition).toBe(0)
    expect(awaiting.trace.find((entry) => entry.stage === "flat_damage_addition")?.formula.flatDamageAddition).toBe(0)
    expect(constellationOne.rotation.dpr).toBeCloseTo(
      constellationOne.rotation.events.reduce((total, event) => total + event.expectedDamage, 0)
    )
    expect(constellationZero.rotation.dpr).toBeCloseTo(
      constellationZero.rotation.events.reduce((total, event) => total + event.expectedDamage, 0)
    )
    expect(findEffect(constellationZero, "yumemizuki_mizuki.constellation.1.awaiting_stellar_swirl.flat_damage_addition"))
      .toBeUndefined()
    expect(findEffect(constellationOne, "yumemizuki_mizuki.constellation.1.awaiting_stellar_swirl.flat_damage_addition")?.value)
      .toBeCloseTo(constellationOne.stats.elementalMastery * 5.5)
    expect(constellationOne.result.expectedDamage).toBeGreaterThan(constellationZero.result.expectedDamage)
  }, 60_000)

  it("evaluates both Coda at Dawn endings with their cumulative C1 extra hit", async () => {
    const odette = createBuild("Odette", "FavoniusSword", "test.odette.coda-c1", 1)
    const stellarSuperconductId = "odette.skill.adagio_coda_at_dawn.final_hit.stellar_superconduct"
    const stellarSwirlId = "odette.skill.adagio_coda_at_dawn.final_hit.stellar_swirl"
    const [stellarSuperconduct, stellarSwirl] = await Promise.all([
      evaluate(odette, [], stellarSuperconductId),
      evaluate(odette, [], stellarSwirlId)
    ])

    for (const [evaluation, actionId, coefficients] of [
      [stellarSuperconduct, stellarSuperconductId, [5.50368, 3]],
      [stellarSwirl, stellarSwirlId, [8.25552, 4.5]]
    ] as const) {
      const events = evaluation.rotation.events
      expect(events.map((event) => event.id)).toEqual([
        `${actionId}.coda-final-hit`,
        `${actionId}.c1-additional-hit`
      ])
      expect(
        events.map((event) => event.trace.find((entry) => entry.stage === "base_damage")?.formula.terms?.[0]?.coefficient)
      ).toEqual(coefficients)
      expect(evaluation.rotation.dpr).toBeCloseTo(
        events.reduce((total, event) => total + event.expectedDamage, 0)
      )
    }
  }, 60_000)

  it("applies every damage-relevant part of Yumemizuki Mizuki's C6 without leaking reaction crit", async () => {
    const mizukiC5 = withTripleElementalMasteryMainStats(
      createBuild("YumemizukiMizuki", "FavoniusCodex", "test.mizuki.c5", 5)
    )
    const mizukiC6 = { ...mizukiC5, buildId: "test.mizuki.c6", constellation: 6 }
    const mizukiActionId = "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.initial_hit"
    const odetteActionId = "odette.skill.adagio_coda_at_dawn.final_hit.stellar_swirl"
    const mizukiSwirlActionId = "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_pyro_swirl"
    const sucroseSwirlActionId = "sucrose.skill.astable_anemohypostasis_creation_6308.single_pyro_swirl"
    const hyperbloomActionId = "kuki_shinobu.skill.sanctifying_ring.grass_ring.single_hyperbloom"
    const [
      selfC5,
      selfC6,
      partyC5,
      partyC6,
      ownSwirlC5,
      ownSwirlC6Analysis,
      ownSwirlC6WithPanelCritBuffs,
      teammateSwirlC5,
      teammateSwirlC6,
      hyperbloomC5,
      hyperbloomC6
    ] = await Promise.all([
      evaluate(mizukiC5, [], mizukiActionId),
      evaluate(mizukiC6, [], mizukiActionId),
      evaluate(createBuild("Odette", "FavoniusSword", "test.odette.mizuki-c5"), [mizukiC5], odetteActionId),
      evaluate(createBuild("Odette", "FavoniusSword", "test.odette.mizuki-c6"), [mizukiC6], odetteActionId),
      evaluate(mizukiC5, [], mizukiSwirlActionId),
      analyze(mizukiC6, [], mizukiSwirlActionId),
      evaluate(mizukiC6, [], mizukiSwirlActionId, {}, [
        { label: "测试面板暴击率", sourceId: "test.panel-crit-rate", stat: "crit_rate", value: 0.5 },
        { label: "测试面板暴击伤害", sourceId: "test.panel-crit-damage", stat: "crit_damage", value: 1 }
      ]),
      evaluate(createBuild("Sucrose", "FavoniusCodex", "test.sucrose.mizuki-c5"), [mizukiC5], sucroseSwirlActionId),
      evaluate(createBuild("Sucrose", "FavoniusCodex", "test.sucrose.mizuki-c6"), [mizukiC6], sucroseSwirlActionId),
      evaluate(createBuild("KukiShinobu", "FavoniusSword", "test.kuki.mizuki-c5"), [mizukiC5], hyperbloomActionId),
      evaluate(createBuild("KukiShinobu", "FavoniusSword", "test.kuki.mizuki-c6"), [mizukiC6], hyperbloomActionId)
    ])
    const ownSwirlC6 = ownSwirlC6Analysis.evaluation

    const expectedCritRate = Math.min(Math.max(selfC6.stats.elementalMastery - 500, 0) * 0.0004, 0.2)
    const expectedCritDamage = Math.min(Math.max(selfC6.stats.elementalMastery - 500, 0) * 0.0016, 0.8)
    const selfCritRateId = "yumemizuki_mizuki.constellation.6.elemental_mastery_over_500.crit_rate"
    const selfCritDamageId = "yumemizuki_mizuki.constellation.6.elemental_mastery_over_500.crit_damage"
    const partyCritRateId = "yumemizuki_mizuki.constellation.6.dreamdrifter.party_stellar_swirl.crit_rate"
    const partyCritDamageId = "yumemizuki_mizuki.constellation.6.dreamdrifter.party_stellar_swirl.crit_damage"
    const swirlCritRateId = "yumemizuki_mizuki.constellation.6.dreamdrifter.party_swirl.crit_rate"
    const swirlCritDamageId = "yumemizuki_mizuki.constellation.6.dreamdrifter.party_swirl.crit_damage"

    expect(findEffect(selfC5, selfCritRateId)).toBeUndefined()
    expect(findEffect(selfC5, selfCritDamageId)).toBeUndefined()
    expect(findEffect(selfC6, selfCritRateId)?.value).toBeCloseTo(expectedCritRate)
    expect(findEffect(selfC6, selfCritDamageId)?.value).toBeCloseTo(expectedCritDamage)
    expect(selfC6.stats.critRate).toBeCloseTo(selfC5.stats.critRate + expectedCritRate)
    expect(selfC6.stats.critDamage).toBeCloseTo(selfC5.stats.critDamage + expectedCritDamage)
    expect(findEffect(partyC5, partyCritRateId)).toBeUndefined()
    expect(findEffect(partyC5, partyCritDamageId)).toBeUndefined()
    expect(findEffect(partyC6, partyCritRateId)?.value).toBeCloseTo(0.1)
    expect(findEffect(partyC6, partyCritDamageId)?.value).toBeCloseTo(0.2)
    expect(partyC6.stats.critRate).toBeCloseTo(partyC5.stats.critRate + 0.1)
    expect(partyC6.stats.critDamage).toBeCloseTo(partyC5.stats.critDamage + 0.2)
    expect(partyC6.result.expectedDamage).toBeGreaterThan(partyC5.result.expectedDamage)
    expect(findEffect(ownSwirlC5, swirlCritRateId)).toBeUndefined()
    expect(findEffect(ownSwirlC5, swirlCritDamageId)).toBeUndefined()
    expect(findEffect(ownSwirlC6, swirlCritRateId)?.value).toBe(0.3)
    expect(findEffect(ownSwirlC6, swirlCritDamageId)?.value).toBe(1)
    expect(ownSwirlC6.result.expectedDamage / ownSwirlC5.result.expectedDamage).toBeCloseTo(1.3)
    expect(ownSwirlC6WithPanelCritBuffs.result.expectedDamage).toBeCloseTo(ownSwirlC6.result.expectedDamage)
    expect(findEffect(teammateSwirlC5, swirlCritRateId)).toBeUndefined()
    expect(findEffect(teammateSwirlC5, swirlCritDamageId)).toBeUndefined()
    expect(findEffect(teammateSwirlC6, swirlCritRateId)?.value).toBe(0.3)
    expect(findEffect(teammateSwirlC6, swirlCritDamageId)?.value).toBe(1)
    expect(teammateSwirlC6.result.expectedDamage / teammateSwirlC5.result.expectedDamage).toBeCloseTo(1.3)
    expect(findEffect(hyperbloomC6, swirlCritRateId)).toBeUndefined()
    expect(findEffect(hyperbloomC6, swirlCritDamageId)).toBeUndefined()
    expect(hyperbloomC6.result.expectedDamage).toBeCloseTo(hyperbloomC5.result.expectedDamage)
    expect(ownSwirlC6.result.trace.find((entry) => entry.stage === "crit")?.formula).toMatchObject({
      critDamage: 1,
      critRate: 0.3,
      kind: "expected_crit",
      multiplier: 1.3
    })
    expect(
      ownSwirlC6Analysis.analysis.marginalSubstats.find((result) => result.stat === "crit_rate")?.gainRatio
    ).toBe(0)
    expect(
      ownSwirlC6Analysis.analysis.marginalSubstats.find((result) => result.stat === "crit_damage")?.gainRatio
    ).toBe(0)
    expect(
      ownSwirlC6Analysis.analysis.marginalSubstats.find((result) => result.stat === "elemental_mastery")?.gainRatio
    ).toBeGreaterThan(0)
    expect(ownSwirlC6Analysis.analysis.progressionGains.length).toBeGreaterThan(0)
    expect(ownSwirlC6Analysis.analysis.weapons.length).toBeGreaterThan(0)
  }, 120_000)
})
