import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
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
      readonly formula: { readonly kind: string }
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
})
