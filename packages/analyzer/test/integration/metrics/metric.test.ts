import {
  bennettNationalBuiltinBuild,
  getCombatMetricDefinition,
  listCharacterCombatMetrics,
  raidenNationalBuiltinBuild,
  xianglingNationalBuiltinBuild,
  xingqiuNationalBuiltinBuild
} from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import {
  evaluateCombatMetric,
  type CombatMetricFormula,
  type CombatMetricFormulaNode,
  type CombatMetricFormulaTerm
} from "../../../src/metrics/evaluate.js"
import { resolveCoreCombatStats } from "../../../src/core/base-stats.js"
import { evaluateScenario, raidenNationalBuiltinScenario } from "../../../src/scenario/evaluate.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)

afterAll(() => gameData.close())

interface RecipientContextOverrides {
  readonly currentHpFraction?: number
  readonly incomingHealingBonus?: number
  readonly isMoonsign?: boolean
  readonly isWithinSourceArea?: boolean
  readonly missingHp?: number
}

function evaluateBennettMetric(
  metricId: string,
  build = bennettNationalBuiltinBuild,
  recipient: CharacterBuild = raidenNationalBuiltinBuild,
  recipientOverrides: RecipientContextOverrides = {}
) {
  return evaluateCombatMetric({
    build,
    context: {
      recipient: {
        buildId: recipient.buildId,
        currentHpFraction: 0.5,
        incomingHealingBonus: 0,
        isMoonsign: true,
        isWithinSourceArea: true,
        ...recipientOverrides
      },
      teammates: [recipient]
    },
    gameData,
    metricId
  })
}

function createGeoMetricBuild(
  characterId:
    | "Albedo"
    | "Chiori"
    | "Gorou"
    | "Illuga"
    | "Kachina"
    | "Linnea"
    | "Noelle"
    | "Xilonen"
    | "YunJin"
    | "Zhongli",
  weaponId:
    | "BalladOfTheFjords"
    | "Deathmatch"
    | "FavoniusGreatsword"
    | "FavoniusWarbow"
    | "SacrificialSword"
    | "TheCatch"
): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.metric.${characterId}`,
    characterId,
    constellation: 0,
    label: `${characterId} metric fixture`,
    talents: { burst: 10, normal: 6, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

function evaluateFriendlyMetric(
  metricId: string,
  build: CharacterBuild,
  recipient: CharacterBuild = raidenNationalBuiltinBuild
) {
  return evaluateCombatMetric({
    build,
    context: {
      recipient: {
        buildId: recipient.buildId,
        currentHpFraction: 0.5,
        incomingHealingBonus: 0,
        isMoonsign: true,
        isWithinSourceArea: true
      },
      teammates: recipient.buildId === build.buildId ? [] : [recipient]
    },
    gameData,
    metricId
  })
}

function withArtifactSetPieces(
  build: CharacterBuild,
  setId: string,
  pieceCount: number,
  buildId: string
): CharacterBuild {
  return {
    ...build,
    artifacts: build.artifacts.map((artifact, index) => (index < pieceCount ? { ...artifact, setId } : artifact)),
    buildId,
    label: `${build.label} / ${setId} ${pieceCount}pc`
  }
}

function withWeapon(
  build: CharacterBuild,
  weaponId: CharacterBuild["weapon"]["weaponId"],
  refinement: number,
  buildId: string
): CharacterBuild {
  return {
    ...build,
    buildId,
    label: `${build.label} / ${weaponId} R${refinement}`,
    weapon: { ...build.weapon, refinement, weaponId }
  }
}

function createShieldMetricBuild(
  characterId: "Baizhu" | "Layla" | "Noelle" | "Zhongli",
  weaponId: "FavoniusCodex" | "FavoniusGreatsword" | "SacrificialSword" | "TheCatch"
): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.metric.${characterId}.${weaponId}`,
    characterId,
    constellation: 0,
    label: `${characterId} shield metric fixture`,
    talents: { burst: 10, normal: 6, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

function createDionaMetricBuild(constellation = 0): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.metric.Diona.c${constellation}.aqua-simulacra`,
    characterId: "Diona",
    constellation,
    label: "Diona Aqua Simulacra metric fixture",
    talents: { burst: 10, normal: 6, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquaSimulacra" }
  }
}

function createJeanMetricBuild(): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: "test.metric.Jean.aquila-favonia",
    characterId: "Jean",
    constellation: 0,
    label: "Jean Aquila Favonia metric fixture",
    talents: { burst: 10, normal: 6, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "AquilaFavonia" }
  }
}

function createQiqiMetricBuild(constellation: number): CharacterBuild {
  return {
    ...raidenNationalBuiltinBuild,
    buildId: `test.metric.Qiqi.c${constellation}`,
    characterId: "Qiqi",
    constellation,
    label: "Qiqi metric fixture",
    talents: { burst: 10, normal: 6, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SacrificialSword" }
  }
}

function collectFormulaTerms(formula: CombatMetricFormula): readonly CombatMetricFormulaTerm[] {
  if (formula.kind === "rotation_events") return []
  return collectFormulaNodeTerms(formula)
}

function collectFormulaNodeTerms(node: CombatMetricFormulaNode): readonly CombatMetricFormulaTerm[] {
  if (node.kind === "term") return [node]
  if (node.kind === "condition") return collectFormulaNodeTerms(node.operand)
  return node.operands.flatMap((operand) => collectFormulaNodeTerms(operand))
}

describe("character metrics with explicit target context", () => {
  it("applies Aqua Simulacra's automatic HP to Diona's shield metric formula without an active snapshot", () => {
    const diona = createDionaMetricBuild()
    const baseline = resolveCoreCombatStats(diona, gameData)
    const metric = evaluateFriendlyMetric("diona.skill.icy_paws.press.base_absorption", diona)

    expect(metric.kind).toBe("scalar")
    if (metric.kind !== "scalar") throw new Error("Expected Diona's shield metric")
    const expectedScalingValue = baseline.hp + baseline.baseHp * 0.16
    expect(metric.scalingValue).toBeCloseTo(expectedScalingValue)
    expect(
      collectFormulaTerms(metric.formula).find(
        (term) => term.role === "source_stat" && term.stat === "hp"
      )?.value
    ).toBeCloseTo(expectedScalingValue)
  })

  it("uses Retracing Bolide only from the build that receives Diona's shield", () => {
    const diona = createDionaMetricBuild()
    const onePieceRecipient = withArtifactSetPieces(
      raidenNationalBuiltinBuild,
      "RetracingBolide",
      1,
      "test.metric.raiden.retracing-bolide.1pc"
    )
    const twoPieceRecipient = withArtifactSetPieces(
      raidenNationalBuiltinBuild,
      "RetracingBolide",
      2,
      "test.metric.raiden.retracing-bolide.2pc"
    )
    const twoPieceSource = withArtifactSetPieces(
      diona,
      "RetracingBolide",
      2,
      "test.metric.diona.retracing-bolide.2pc"
    )
    const metricId = "diona.skill.icy_paws.press.base_absorption"
    const baseline = evaluateFriendlyMetric(metricId, diona)
    const onePieceShield = evaluateFriendlyMetric(metricId, diona, onePieceRecipient)
    const recipientShield = evaluateFriendlyMetric(metricId, diona, twoPieceRecipient)
    const sourceShield = evaluateFriendlyMetric(metricId, twoPieceSource)

    expect(baseline.kind).toBe("scalar")
    expect(onePieceShield.kind).toBe("scalar")
    expect(recipientShield.kind).toBe("scalar")
    expect(sourceShield.kind).toBe("scalar")
    if (
      baseline.kind !== "scalar" ||
      onePieceShield.kind !== "scalar" ||
      recipientShield.kind !== "scalar" ||
      sourceShield.kind !== "scalar"
    ) {
      throw new Error("Expected Diona's shield metric")
    }

    expect(onePieceShield.value).toBeCloseTo(baseline.value)
    expect(recipientShield.potentialValue).toBeCloseTo(baseline.potentialValue * 1.35)
    expect(recipientShield.scalingValue).toBeCloseTo(baseline.scalingValue ?? 0)
    expect(recipientShield.value).toBeCloseTo(baseline.value * 1.35)
    expect(sourceShield.potentialValue).toBeCloseTo(baseline.potentialValue)
    expect(sourceShield.value).toBeCloseTo(baseline.value)
    expect(collectFormulaTerms(recipientShield.formula)).toContainEqual(
      expect.objectContaining({
        label: "逆飞的流星 · 二件套",
        role: "recipient_modifier",
        value: 0.35
      })
    )
  })

  it("resolves each Golden Majesty weapon at the shield recipient's refinement", () => {
    const fixtures = [
      {
        baselineWeaponId: "FavoniusCodex",
        characterId: "Baizhu",
        label: "尘世之锁 · 护盾强效",
        metricId: "baizhu.burst.holistic_revivification.seamless_shield.initial_absorption",
        weaponId: "MemoryOfDust"
      },
      {
        baselineWeaponId: "SacrificialSword",
        characterId: "Layla",
        label: "斫峰之刃 · 护盾强效",
        metricId: "layla.skill.nights_of_formal_focus.curtain_of_slumber.initial_absorption",
        weaponId: "SummitShaper"
      },
      {
        baselineWeaponId: "FavoniusGreatsword",
        characterId: "Noelle",
        label: "无工之剑 · 护盾强效",
        metricId: "noelle.skill.breastplate.initial_absorption",
        weaponId: "TheUnforged"
      },
      {
        baselineWeaponId: "TheCatch",
        characterId: "Zhongli",
        label: "贯虹之槊 · 护盾强效",
        metricId: "zhongli.skill.jade_shield.initial_absorption",
        weaponId: "VortexVanquisher"
      }
    ] as const

    for (const fixture of fixtures) {
      const baselineBuild = createShieldMetricBuild(fixture.characterId, fixture.baselineWeaponId)
      const r1Build = withWeapon(
        baselineBuild,
        fixture.weaponId,
        1,
        `test.metric.${fixture.characterId}.${fixture.weaponId}.r1`
      )
      const r5Build = withWeapon(
        baselineBuild,
        fixture.weaponId,
        5,
        `test.metric.${fixture.characterId}.${fixture.weaponId}.r5`
      )
      const baseline = evaluateFriendlyMetric(fixture.metricId, baselineBuild, baselineBuild)
      const r1Shield = evaluateFriendlyMetric(fixture.metricId, r1Build, r1Build)
      const r5Shield = evaluateFriendlyMetric(fixture.metricId, r5Build, r5Build)

      expect(baseline.kind).toBe("scalar")
      expect(r1Shield.kind).toBe("scalar")
      expect(r5Shield.kind).toBe("scalar")
      if (baseline.kind !== "scalar" || r1Shield.kind !== "scalar" || r5Shield.kind !== "scalar") {
        throw new Error(`Expected ${fixture.characterId}'s shield metric`)
      }

      expect(r1Shield.potentialValue).toBeCloseTo(baseline.potentialValue * 1.2)
      expect(r1Shield.value).toBeCloseTo(baseline.value * 1.2)
      expect(r5Shield.potentialValue).toBeCloseTo(baseline.potentialValue * 1.4)
      expect(r5Shield.value).toBeCloseTo(baseline.value * 1.4)
      expect(r1Shield.scalingValue).toBeCloseTo(baseline.scalingValue ?? 0)
      expect(r5Shield.scalingValue).toBeCloseTo(baseline.scalingValue ?? 0)
      expect(r1Shield.uncappedValue).toBeCloseTo(baseline.uncappedValue)
      expect(r5Shield.uncappedValue).toBeCloseTo(baseline.uncappedValue)
      expect(collectFormulaTerms(r1Shield.formula)).toContainEqual(
        expect.objectContaining({ label: fixture.label, role: "recipient_modifier", value: 0.2 })
      )
      expect(collectFormulaTerms(r5Shield.formula)).toContainEqual(
        expect.objectContaining({ label: fixture.label, role: "recipient_modifier", value: 0.4 })
      )
    }
  })

  it("does not read Vortex Vanquisher from the shield source when another character receives the shield", () => {
    const baselineZhongli = createShieldMetricBuild("Zhongli", "TheCatch")
    const vortexZhongli = withWeapon(
      baselineZhongli,
      "VortexVanquisher",
      1,
      "test.metric.zhongli.vortex-vanquisher.r1"
    )
    const metricId = "zhongli.skill.jade_shield.initial_absorption"
    const baseline = evaluateFriendlyMetric(metricId, baselineZhongli)
    const sourceWeaponShield = evaluateFriendlyMetric(metricId, vortexZhongli)

    expect(baseline.kind).toBe("scalar")
    expect(sourceWeaponShield.kind).toBe("scalar")
    if (baseline.kind !== "scalar" || sourceWeaponShield.kind !== "scalar") {
      throw new Error("Expected Zhongli's shield metric")
    }

    expect(sourceWeaponShield.potentialValue).toBeCloseTo(baseline.potentialValue)
    expect(sourceWeaponShield.value).toBeCloseTo(baseline.value)
    expect(collectFormulaTerms(sourceWeaponShield.formula)).not.toContainEqual(
      expect.objectContaining({ label: "贯虹之槊 · 护盾强效", role: "recipient_modifier" })
    )
  })

  it("applies Aquila Favonia's automatic attack to Jean's healing metric formula", () => {
    const jean = createJeanMetricBuild()
    const baseline = resolveCoreCombatStats(jean, gameData)
    const metric = evaluateFriendlyMetric("jean.burst.dandelion_breeze.field_heal_tick", jean)

    expect(metric.kind).toBe("healing")
    if (metric.kind !== "healing") throw new Error("Expected Jean's healing metric")
    const expectedScalingValue = baseline.attack + baseline.baseAttack * 0.2
    expect(metric.scalingValue).toBeCloseTo(expectedScalingValue)
    expect(
      collectFormulaTerms(metric.formula).find(
        (term) => term.role === "source_stat" && term.stat === "attack"
      )?.value
    ).toBeCloseTo(expectedScalingValue)
  })

  it("applies Primordial Jade Cutter's refinement-indexed final HP conversion to Jean's attack-scaled healing", () => {
    const r1Jean = withWeapon(
      createJeanMetricBuild(),
      "PrimordialJadeCutter",
      1,
      "test.metric.Jean.primordial-jade-cutter.r1"
    )
    const r5Jean = withWeapon(
      r1Jean,
      "PrimordialJadeCutter",
      5,
      "test.metric.Jean.primordial-jade-cutter.r5"
    )
    const r1Core = resolveCoreCombatStats(r1Jean, gameData)
    const r5Core = resolveCoreCombatStats(r5Jean, gameData)
    const r1Metric = evaluateFriendlyMetric("jean.burst.dandelion_breeze.field_heal_tick", r1Jean)
    const r5Metric = evaluateFriendlyMetric("jean.burst.dandelion_breeze.field_heal_tick", r5Jean)

    expect(r1Metric.kind).toBe("healing")
    expect(r5Metric.kind).toBe("healing")
    if (r1Metric.kind !== "healing" || r5Metric.kind !== "healing") {
      throw new Error("Expected Jean's healing metrics")
    }

    const expectedR1Hp = r1Core.hp + r1Core.baseHp * 0.2
    const expectedR5Hp = r5Core.hp + r5Core.baseHp * 0.4
    const expectedR1Attack =
      r1Core.baseAttack * (1 + r1Core.attackPercent) + r1Core.flatAttack + expectedR1Hp * 0.012
    const expectedR5Attack =
      r5Core.baseAttack * (1 + r5Core.attackPercent) + r5Core.flatAttack + expectedR5Hp * 0.024

    expect(r1Metric.scalingValue).toBeCloseTo(expectedR1Attack)
    expect(r5Metric.scalingValue).toBeCloseTo(expectedR5Attack)
    expect(r5Metric.scalingValue).toBeGreaterThan(r1Metric.scalingValue)
    expect(
      collectFormulaTerms(r1Metric.formula).find(
        (term) => term.role === "source_stat" && term.stat === "attack"
      )?.value
    ).toBeCloseTo(expectedR1Attack)
  })

  it("applies Qiqi's shared C5 Skill level to every Skill parameter in her healing metric", () => {
    const c0Metric = evaluateFriendlyMetric(
      "qiqi.skill.adeptus_art_herald_of_frost.continuous_regeneration.heal_tick",
      createQiqiMetricBuild(0)
    )
    const c5Metric = evaluateFriendlyMetric(
      "qiqi.skill.adeptus_art_herald_of_frost.continuous_regeneration.heal_tick",
      createQiqiMetricBuild(5)
    )

    expect(c0Metric).toMatchObject({ flatAmount: 991.2866, percentage: 1.2528, talentLevel: 10 })
    expect(c5Metric).toMatchObject({ flatAmount: 1239.1239, percentage: 1.479, talentLevel: 13 })
    expect(c5Metric.value).toBeGreaterThan(c0Metric.value)
  })

  it("uses Diona's source-verified C5 Skill level instead of the legacy reversed metric metadata", () => {
    const c3Metric = evaluateFriendlyMetric(
      "diona.skill.icy_paws.press.base_absorption",
      createDionaMetricBuild(3)
    )
    const c5Metric = evaluateFriendlyMetric(
      "diona.skill.icy_paws.press.base_absorption",
      createDionaMetricBuild(5)
    )
    const c3TalentLevel = collectFormulaTerms(c3Metric.formula).find(
      (term) => term.parameterId === "icy-paws-point-press-shield-hp-ratio"
    )?.talentLevel
    const c5TalentLevel = collectFormulaTerms(c5Metric.formula).find(
      (term) => term.parameterId === "icy-paws-point-press-shield-hp-ratio"
    )?.talentLevel

    expect(c3TalentLevel).toBe(10)
    expect(c5TalentLevel).toBe(13)
    expect(c5Metric.value).toBeGreaterThan(c3Metric.value)
  })

  it("applies Deathmatch's multi-target defense bonus to Yun Jin only with explicit source enemy context", () => {
    const yunJin = createGeoMetricBuild("YunJin", "Deathmatch")
    const baseline = resolveCoreCombatStats(yunJin, gameData)
    const withoutEnemyContext = evaluateFriendlyMetric(
      "yun_jin.burst.flying_cloud_flag_formation.base_damage_increase",
      yunJin
    )
    const withTwoEnemies = evaluateCombatMetric({
      build: yunJin,
      context: {
        recipient: {
          buildId: raidenNationalBuiltinBuild.buildId,
          currentHpFraction: 0.5,
          incomingHealingBonus: 0,
          isMoonsign: true,
          isWithinSourceArea: true
        },
        source: { enemyCount: 2 },
        teammates: [raidenNationalBuiltinBuild]
      },
      gameData,
      metricId: "yun_jin.burst.flying_cloud_flag_formation.base_damage_increase"
    })

    expect(withoutEnemyContext.kind).toBe("scalar")
    expect(withTwoEnemies.kind).toBe("scalar")
    if (withoutEnemyContext.kind !== "scalar" || withTwoEnemies.kind !== "scalar") {
      throw new Error("Expected Yun Jin's defense-scaled support metric")
    }
    expect(withoutEnemyContext.scalingValue).toBeCloseTo(baseline.defense)
    expect(withTwoEnemies.scalingValue).toBeCloseTo(baseline.defense + baseline.baseDefense * 0.16)
    expect(
      collectFormulaTerms(withTwoEnemies.formula).find(
        (term) => term.role === "source_stat" && term.stat === "defense"
      )?.value
    ).toBeCloseTo(baseline.defense + baseline.baseDefense * 0.16)
  })

  it("applies reviewed fixed health and defense artifact bonuses to support metric source stats", () => {
    const baselineBennett = evaluateBennettMetric("bennett.burst.field.heal_tick")
    const adventurerBennett = {
      ...bennettNationalBuiltinBuild,
      artifacts: bennettNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "Adventurer" })),
      buildId: "test.metric.bennett.adventurer"
    }
    const adventurerHealing = evaluateBennettMetric("bennett.burst.field.heal_tick", adventurerBennett)
    const yunJin = {
      ...createGeoMetricBuild("YunJin", "TheCatch"),
      artifacts: raidenNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "LuckyDog" })),
      buildId: "test.metric.yun-jin.lucky-dog"
    }
    const baselineYunJin = resolveCoreCombatStats({ ...yunJin, artifacts: raidenNationalBuiltinBuild.artifacts }, gameData)
    const luckyDogMetric = evaluateFriendlyMetric("yun_jin.burst.flying_cloud_flag_formation.base_damage_increase", yunJin)

    expect(adventurerHealing.kind).toBe("healing")
    if (adventurerHealing.kind !== "healing") throw new Error("Expected Bennett's healing metric")
    expect(adventurerHealing.potentialValue).toBeCloseTo(baselineBennett.potentialValue + adventurerHealing.percentage * 1000)
    expect(luckyDogMetric.kind).toBe("scalar")
    if (luckyDogMetric.kind !== "scalar") throw new Error("Expected Yun Jin's defense-scaled support metric")
    expect(luckyDogMetric.scalingValue).toBeCloseTo(baselineYunJin.defense + 100)
  })

  it("applies Ballad of the Fjords to a support metric only with three configured elements", () => {
    const illuga = createGeoMetricBuild("Illuga", "BalladOfTheFjords")
    const baseContext = {
      recipient: {
        buildId: raidenNationalBuiltinBuild.buildId,
        currentHpFraction: 0.5,
        incomingHealingBonus: 0,
        isMoonsign: true,
        isWithinSourceArea: true
      }
    }
    const twoElements = evaluateCombatMetric({
      build: illuga,
      context: { ...baseContext, teammates: [raidenNationalBuiltinBuild] },
      gameData,
      metricId: "illuga.burst.song_of_the_nightbird.single_geo_damage_bonus"
    })
    const threeElements = evaluateCombatMetric({
      build: illuga,
      context: { ...baseContext, teammates: [raidenNationalBuiltinBuild, xingqiuNationalBuiltinBuild] },
      gameData,
      metricId: "illuga.burst.song_of_the_nightbird.single_geo_damage_bonus"
    })

    expect(twoElements.kind).toBe("scalar")
    expect(threeElements.kind).toBe("scalar")
    if (
      twoElements.kind !== "scalar" ||
      threeElements.kind !== "scalar" ||
      twoElements.scalingValue === undefined ||
      threeElements.scalingValue === undefined
    ) {
      throw new Error("Expected Illuga's elemental-mastery-scaled support metric")
    }
    expect(threeElements.scalingValue).toBeCloseTo(twoElements.scalingValue + 120)
    expect(threeElements.value).toBeGreaterThan(twoElements.value)
  })

  it("selects the configured Raiden and Xiangling core damage actions as their own damage metrics", () => {
    expect(listCharacterCombatMetrics("RaidenShogun")).toEqual([
      expect.objectContaining({ actionId: "raiden.burst.initial_slash", kind: "damage" })
    ])
    expect(listCharacterCombatMetrics("Xiangling")).toEqual([
      expect.objectContaining({ actionId: "xiangling.burst.pyronado.reverse_vaporize", kind: "damage" })
    ])

    const soloRaidenScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...raidenNationalBuiltinScenario.conditions, activeEffectIds: [] },
      teammates: []
    }
    const metric = evaluateCombatMetric({
      build: raidenNationalBuiltinBuild,
      gameData,
      metricId: "raiden.burst.initial_slash",
      scenario: soloRaidenScenario
    })

    expect(metric).toMatchObject({
      actionId: "raiden.burst.initial_slash",
      formula: expect.objectContaining({ kind: "rotation_events" }),
      kind: "damage",
      unit: "damage",
      value: evaluateScenario(soloRaidenScenario, gameData).actionExpectedDamage
    })
    if (metric.formula.kind !== "rotation_events") throw new Error("Expected event-level damage formula")
    expect(metric.formula.events.reduce((total, event) => total + event.expectedDamage, 0)).toBeCloseTo(metric.value)
    expect(metric.value).toBeGreaterThan(0)
  })

  it("selects Tighnari's one Wreath Arrow hit under the declared Spread assumption", () => {
    const tighnari: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.Tighnari",
      characterId: "Tighnari",
      constellation: 0,
      label: "Tighnari metric fixture",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...raidenNationalBuiltinScenario.conditions, activeEffectIds: [] },
      primary: tighnari,
      teammates: []
    }

    expect(listCharacterCombatMetrics("Tighnari")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "tighnari.normal.wreath_arrow.single_hit.spread",
          kind: "damage",
          label: "藏蕴破障 / 藏蕴花矢单次命中 · 蔓激化"
        })
      ])
    )

    const metric = evaluateCombatMetric({
      build: tighnari,
      gameData,
      metricId: "tighnari.normal.wreath_arrow.single_hit.spread",
      scenario
    })

    expect(metric).toMatchObject({
      actionId: "tighnari.normal.wreath_arrow.single_hit.spread",
      formula: expect.objectContaining({ kind: "rotation_events" }),
      kind: "damage",
      target: { kind: "enemy" },
      unit: "damage"
    })
    if (metric.formula.kind !== "rotation_events") throw new Error("Expected event-level damage formula")
    expect(metric.formula.events[0]?.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "additive_reaction", reaction: "spread" })])
    )
    expect(metric.value).toBeGreaterThan(0)
  })

  it("evaluates state-neutral registered core metrics through the common action pipeline", () => {
    const fixtures: readonly { readonly build: CharacterBuild; readonly metricId: string }[] = [
      {
        build: {
          ...raidenNationalBuiltinBuild,
          buildId: "test.metric.Fischl",
          characterId: "Fischl",
          constellation: 0,
          label: "Fischl metric fixture",
          talents: { burst: 10, normal: 6, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
        },
        metricId: "fischl.skill.nightrider.oz.level_one_bolt"
      },
      {
        build: {
          ...raidenNationalBuiltinBuild,
          buildId: "test.metric.YaeMiko",
          characterId: "YaeMiko",
          constellation: 0,
          label: "Yae Miko metric fixture",
          talents: { burst: 10, normal: 6, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
        },
        metricId: "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt"
      },
      {
        build: {
          ...raidenNationalBuiltinBuild,
          buildId: "test.metric.Keqing",
          characterId: "Keqing",
          constellation: 0,
          label: "Keqing metric fixture",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
        },
        metricId: "keqing.skill.stellar_restoration.recast_slash"
      },
      {
        build: {
          ...raidenNationalBuiltinBuild,
          buildId: "test.metric.Klee",
          characterId: "Klee",
          constellation: 0,
          label: "Klee metric fixture",
          talents: { burst: 10, normal: 10, skill: 10 },
          weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
        },
        metricId: "klee.normal.charged_attack.single_hit"
      }
    ]

    for (const fixture of fixtures) {
      const metric = evaluateCombatMetric({
        build: fixture.build,
        gameData,
        metricId: fixture.metricId,
        scenario: {
          ...raidenNationalBuiltinScenario,
          conditions: { ...raidenNationalBuiltinScenario.conditions, activeEffectIds: [] },
          primary: fixture.build,
          teammates: []
        }
      })

      expect(metric).toMatchObject({ actionId: fixture.metricId, kind: "damage", target: { kind: "enemy" } })
      if (metric.formula.kind !== "rotation_events") throw new Error("Expected one core damage event trace")
      expect(metric.formula.events).toHaveLength(1)
      expect(metric.value).toBeGreaterThan(0)
    }
  })

  it("selects Xingqiu's explicitly conditioned double Pyro-aura Fatal Rainscreen metric", () => {
    const xingqiu: CharacterBuild = {
      ...xingqiuNationalBuiltinBuild,
      buildId: "test.metric.Xingqiu",
      constellation: 0
    }
    const scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...raidenNationalBuiltinScenario.conditions, activeEffectIds: [] },
      primary: xingqiu,
      teammates: []
    }

    expect(listCharacterCombatMetrics("Xingqiu")).toEqual([
      expect.objectContaining({
        actionId: "xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize",
        kind: "damage",
        label: "画雨笼山 / 双段火底蒸发"
      }),
      expect.objectContaining({
        actionId: "xingqiu.burst.raincutter.rain_sword.single_volley",
        kind: "damage",
        label: "古华剑·裁雨留虹 / 一次雨帘剑齐射（手填数量）"
      })
    ])

    const metric = evaluateCombatMetric({
      build: xingqiu,
      gameData,
      metricId: "xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize",
      scenario
    })

    expect(metric).toMatchObject({
      actionId: "xingqiu.skill.fatal_rainscreen.double_pyro_aura_vaporize",
      formula: expect.objectContaining({ kind: "rotation_events" }),
      kind: "damage",
      target: { kind: "enemy" },
      unit: "damage"
    })
    if (metric.formula.kind !== "rotation_events") throw new Error("Expected event-level damage formula")
    expect(
      metric.formula.events.every((event) =>
        event.trace.some((entry) => entry.kind === "amplifying_reaction" && entry.reaction === "vaporize_forward")
      )
    ).toBe(true)
    expect(metric.value).toBeGreaterThan(0)
  })

  it("selects Yelan's C0 Exquisite Throw as a three-projectile core damage metric", () => {
    const yelan: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.Yelan",
      characterId: "Yelan",
      constellation: 0,
      label: "Yelan metric fixture",
      talents: { burst: 10, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...raidenNationalBuiltinScenario.conditions, activeEffectIds: [] },
      primary: yelan,
      teammates: []
    }

    expect(listCharacterCombatMetrics("Yelan")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actionId: "yelan.burst.exquisite_throw.single_wave",
          kind: "damage",
          label: "渊图玲珑骰 / 玄掷玲珑一轮三箭"
        })
      ])
    )

    const metric = evaluateCombatMetric({
      build: yelan,
      gameData,
      metricId: "yelan.burst.exquisite_throw.single_wave",
      scenario
    })

    expect(metric).toMatchObject({
      actionId: "yelan.burst.exquisite_throw.single_wave",
      formula: expect.objectContaining({ kind: "rotation_events" }),
      kind: "damage",
      target: { kind: "enemy" },
      unit: "damage"
    })
    if (metric.formula.kind !== "rotation_events") throw new Error("Expected event-level damage formula")
    expect(metric.formula.events).toMatchObject([{ hitCount: 3, id: expect.stringContaining("exquisite-throw") }])
    expect(metric.value).toBeGreaterThan(0)
  })

  it("selects Furina's Ousia Crabaletta hit as a state-aware core damage metric", () => {
    const furina: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.Furina",
      characterId: "Furina",
      constellation: 0,
      label: "Furina metric fixture",
      talents: { burst: 10, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...raidenNationalBuiltinScenario.conditions, activeEffectIds: [] },
      primary: furina,
      teammates: []
    }

    expect(listCharacterCombatMetrics("Furina")).toEqual(expect.arrayContaining([
      expect.objectContaining({
        actionId: "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit",
        kind: "damage",
        label: "孤心沙龙 / 谢贝蕾妲小姐单次命中（荒性）"
      }),
      expect.objectContaining({
        id: "furina.burst.let_the_people_rejoice.fanfare.damage_bonus",
        kind: "scalar",
        semantic: "damage_bonus"
      })
    ]))

    const metric = evaluateCombatMetric({
      build: furina,
      gameData,
      metricId: "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit",
      scenario
    })

    expect(metric).toMatchObject({
      actionId: "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit",
      formula: expect.objectContaining({ kind: "rotation_events" }),
      kind: "damage",
      target: { kind: "enemy" },
      unit: "damage"
    })
    expect(metric.value).toBeGreaterThan(0)
  })

  it("selects Neuvillette's full-stack Equitable Judgment tick as a core damage metric", () => {
    const neuvillette: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.Neuvillette",
      characterId: "Neuvillette",
      constellation: 0,
      label: "Neuvillette metric fixture",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...raidenNationalBuiltinScenario.conditions, activeEffectIds: [] },
      primary: neuvillette,
      teammates: []
    }

    expect(listCharacterCombatMetrics("Neuvillette")).toEqual([
      expect.objectContaining({
        actionId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
        kind: "damage",
        label: "如水从平 / 衡平推裁单次命中"
      })
    ])

    const metric = evaluateCombatMetric({
      build: neuvillette,
      gameData,
      metricId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
      scenario
    })

    expect(metric).toMatchObject({
      actionId: "neuvillette.normal.charged_attack.equitable_judgment.single_tick",
      formula: expect.objectContaining({ kind: "rotation_events" }),
      kind: "damage",
      target: { kind: "enemy" },
      unit: "damage"
    })
    expect(metric.value).toBeGreaterThan(0)
  })

  it("selects Ganyu's C0 level-two Frostflake Arrow as a two-hit no-reaction core metric", () => {
    const ganyu: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.Ganyu",
      characterId: "Ganyu",
      constellation: 0,
      label: "Ganyu metric fixture",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...raidenNationalBuiltinScenario.conditions, activeEffectIds: [] },
      primary: ganyu,
      teammates: []
    }

    expect(listCharacterCombatMetrics("Ganyu")).toEqual([
      expect.objectContaining({
        actionId: "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom",
        kind: "damage",
        label: "流天射术 / C0 二段蓄力霜华矢 + 霜华绽发（无反应）"
      })
    ])

    const metric = evaluateCombatMetric({
      build: ganyu,
      gameData,
      metricId: "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom",
      scenario
    })

    expect(metric).toMatchObject({ formula: expect.objectContaining({ kind: "rotation_events" }), kind: "damage" })
    if (metric.formula.kind !== "rotation_events") throw new Error("Expected event-level damage formula")
    expect(metric.formula.events).toHaveLength(2)
    expect(metric.formula.events.map((event) => event.id)).toEqual([
      "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom.frostflake-arrow-hit",
      "ganyu.normal.frostflake_arrow.level_two.hit_and_bloom.frostflake-arrow-bloom"
    ])
  })

  it("selects Mualani's full-stack Sharky's Surging Bite while leaving Pyro aura explicit", () => {
    const mualani: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.Mualani",
      characterId: "Mualani",
      constellation: 0,
      label: "Mualani metric fixture",
      talents: { burst: 10, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const baselineScenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { ...raidenNationalBuiltinScenario.conditions, activeEffectIds: [] },
      primary: mualani,
      teammates: []
    }
    const vaporizeScenario = {
      ...baselineScenario,
      conditions: {
        ...baselineScenario.conditions,
        targetAuraWindows: [{ element: "pyro" as const, end: 1, id: "target.pyro", start: 0 }]
      }
    }

    expect(listCharacterCombatMetrics("Mualani")).toEqual([
      expect.objectContaining({
        actionId: "mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum",
        kind: "damage",
        label: "冲浪时光 / 满层鲨鲨撕咬（火底蒸发需火附着）"
      }),
      expect.objectContaining({
        actionId: "mualani.burst.boomsharka_laka.tracking_missile",
        kind: "damage",
        label: "爆瀑飞弹 / 飞弹伤害（逐浪心得按队伍最大可达层数）"
      })
    ])

    const hydro = evaluateCombatMetric({
      build: mualani,
      gameData,
      metricId: "mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum",
      scenario: baselineScenario
    })
    const vaporize = evaluateCombatMetric({
      build: mualani,
      gameData,
      metricId: "mualani.skill.surfshark_wavebreaker.sharkys_surging_bite.full_wave_momentum",
      scenario: vaporizeScenario
    })

    if (hydro.formula.kind !== "rotation_events" || vaporize.formula.kind !== "rotation_events") {
      throw new Error("Expected event-level damage formulas")
    }
    expect(hydro.formula.events[0]?.trace.some((entry) => entry.kind === "amplifying_reaction")).toBe(false)
    expect(vaporize.formula.events[0]?.trace).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "amplifying_reaction", reaction: "vaporize_forward" })])
    )
    expect(vaporize.value).toBeCloseTo(hydro.value * 2)
  })

  it("evaluates Kazuha's swirled-element damage bonus as an independent source output", () => {
    const kazuha: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      artifacts: raidenNationalBuiltinBuild.artifacts.map((artifact) =>
        artifact.slot === "sands" ? { ...artifact, mainStat: { stat: "elemental_mastery", value: 187 } } : artifact
      ),
      buildId: "test.metric.KaedeharaKazuha",
      characterId: "KaedeharaKazuha",
      constellation: 0,
      label: "Kazuha metric fixture",
      talents: { burst: 10, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }

    expect(listCharacterCombatMetrics("KaedeharaKazuha")).toEqual([
      expect.objectContaining({
        id: "kaedehara_kazuha.passive.poetics_of_fuubutsu.elemental_damage_bonus",
        kind: "scalar",
        semantic: "damage_bonus"
      })
    ])

    const metric = evaluateFriendlyMetric("kaedehara_kazuha.passive.poetics_of_fuubutsu.elemental_damage_bonus", kazuha)

    expect(metric).toMatchObject({
      kind: "scalar",
      ratio: 0.0004,
      scalingStat: "elementalMastery",
      semantic: "damage_bonus",
      unit: "ratio"
    })
    if (metric.kind !== "scalar") throw new Error("Expected Kazuha's scalar damage-bonus metric")
    expect(metric.value).toBeCloseTo((metric.scalingValue ?? 0) * metric.ratio)
    expect(metric.value).toBeGreaterThan(0)
  })

  it("applies Instructor's automatic elemental mastery to an elemental-mastery support metric", () => {
    const noSetKazuha: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      artifacts: raidenNationalBuiltinBuild.artifacts.map((artifact) => ({ ...artifact, setId: "TestNoArtifactSet" })),
      buildId: "test.metric.KaedeharaKazuha.no-set",
      characterId: "KaedeharaKazuha",
      constellation: 0,
      label: "Kazuha no-set metric fixture",
      talents: { burst: 10, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const instructorKazuha: CharacterBuild = {
      ...noSetKazuha,
      artifacts: noSetKazuha.artifacts.map((artifact) => ({ ...artifact, setId: "Instructor" })),
      buildId: "test.metric.KaedeharaKazuha.instructor"
    }
    const metricId = "kaedehara_kazuha.passive.poetics_of_fuubutsu.elemental_damage_bonus"
    const baseline = evaluateFriendlyMetric(metricId, noSetKazuha)
    const instructor = evaluateFriendlyMetric(metricId, instructorKazuha)

    if (baseline.kind !== "scalar" || instructor.kind !== "scalar") {
      throw new Error("Expected Kazuha's scalar elemental-mastery metric")
    }
    expect(instructor.scalingValue).toBeCloseTo((baseline.scalingValue ?? 0) + 80)
    expect(instructor.value).toBeCloseTo((baseline.value ?? 0) + 80 * instructor.ratio)
  })

  it("evaluates Shenhe's Icy Quill as an elemental flat-damage source output", () => {
    const shenhe: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.Shenhe",
      characterId: "Shenhe",
      constellation: 0,
      label: "Shenhe metric fixture",
      talents: { burst: 10, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "TheCatch" }
    }

    expect(listCharacterCombatMetrics("Shenhe")).toEqual([
      expect.objectContaining({
        affectedElement: "cryo",
        appliesTo: ["normal", "charged", "plunge", "skill", "burst"],
        id: "shenhe.skill.spring_spirit_summoning.icy_quill.single_cryo_flat_damage_increase",
        kind: "scalar",
        semantic: "elemental_flat_damage_bonus"
      })
    ])

    const c0Metric = evaluateFriendlyMetric(
      "shenhe.skill.spring_spirit_summoning.icy_quill.single_cryo_flat_damage_increase",
      shenhe
    )
    const c3Metric = evaluateFriendlyMetric(
      "shenhe.skill.spring_spirit_summoning.icy_quill.single_cryo_flat_damage_increase",
      { ...shenhe, buildId: "test.metric.Shenhe.c3", constellation: 3 }
    )

    expect(c0Metric).toMatchObject({
      affectedElement: "cryo",
      appliesTo: ["normal", "charged", "plunge", "skill", "burst"],
      kind: "scalar",
      ratio: 0.821808,
      scalingStat: "attack",
      semantic: "elemental_flat_damage_bonus",
      unit: "damage"
    })
    expect(c3Metric).toMatchObject({ ratio: 0.97019 })
    if (c0Metric.kind !== "scalar") throw new Error("Expected Shenhe's scalar Icy Quill metric")
    expect(c0Metric.value).toBeCloseTo((c0Metric.scalingValue ?? 0) * c0Metric.ratio)
  })

  it("evaluates Kokomi's Bake-Kurage healing with her kit bonus and C2 recipient condition", () => {
    const kokomi: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.SangonomiyaKokomi",
      characterId: "SangonomiyaKokomi",
      constellation: 0,
      label: "Kokomi metric fixture",
      talents: { burst: 10, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const metricId = "sangonomiya_kokomi.skill.kurages_oath.bake_kurage.heal_tick"
    const c0Metric = evaluateCombatMetric({
      build: kokomi,
      context: {
        recipient: {
          buildId: raidenNationalBuiltinBuild.buildId,
          incomingHealingBonus: 0,
          isWithinSourceArea: true
        },
        teammates: [raidenNationalBuiltinBuild]
      },
      gameData,
      metricId
    })
    const c2HighHealthMetric = evaluateCombatMetric({
      build: { ...kokomi, buildId: "test.metric.SangonomiyaKokomi.c2.high", constellation: 2 },
      context: {
        recipient: {
          buildId: raidenNationalBuiltinBuild.buildId,
          currentHpFraction: 0.6,
          incomingHealingBonus: 0,
          isWithinSourceArea: true
        },
        teammates: [raidenNationalBuiltinBuild]
      },
      gameData,
      metricId
    })
    const c2LowHealthMetric = evaluateCombatMetric({
      build: { ...kokomi, buildId: "test.metric.SangonomiyaKokomi.c2.low", constellation: 2 },
      context: {
        recipient: {
          buildId: raidenNationalBuiltinBuild.buildId,
          currentHpFraction: 0.5,
          incomingHealingBonus: 0,
          isWithinSourceArea: true
        },
        teammates: [raidenNationalBuiltinBuild]
      },
      gameData,
      metricId
    })

    expect(listCharacterCombatMetrics("SangonomiyaKokomi")).toEqual([
      expect.objectContaining({ id: metricId, kind: "healing", label: "海月之誓 / 化海月单跳治疗量" })
    ])
    expect(c0Metric).toMatchObject({
      flatAmount: 932.22455,
      healingBonus: 0.25,
      kind: "healing",
      percentage: 0.0792,
      scalingStat: "hp",
      unit: "hp"
    })
    expect(c2HighHealthMetric).toMatchObject({ kind: "healing" })
    expect(c2LowHealthMetric).toMatchObject({ kind: "healing" })
    if (
      c0Metric.kind !== "healing" ||
      c2HighHealthMetric.kind !== "healing" ||
      c2LowHealthMetric.kind !== "healing"
    ) {
      throw new Error("Expected Kokomi healing metrics")
    }
    expect(c2LowHealthMetric.value).toBeGreaterThan(c2HighHealthMetric.value)
    expect(collectFormulaTerms(c0Metric.formula)).toContainEqual(
      expect.objectContaining({ label: "匣中玉栉 / 固有治疗加成", role: "source_modifier", value: 0.25 })
    )
    expect(collectFormulaTerms(c2LowHealthMetric.formula)).toContainEqual(
      expect.objectContaining({ label: "条件追加治疗倍率", role: "source_modifier", value: 0.045 })
    )
  })

  it("applies Everlasting Moonglow's refinement-indexed outgoing healing only to Kokomi's healing metric", () => {
    const metricId = "sangonomiya_kokomi.skill.kurages_oath.bake_kurage.heal_tick"
    const evaluateKokomiHealing = (build: CharacterBuild) =>
      evaluateCombatMetric({
        build,
        context: {
          recipient: {
            buildId: raidenNationalBuiltinBuild.buildId,
            incomingHealingBonus: 0,
            isWithinSourceArea: true
          },
          teammates: [raidenNationalBuiltinBuild]
        },
        gameData,
        metricId
      })
    const baseline: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.kokomi.favonius-codex",
      characterId: "SangonomiyaKokomi",
      constellation: 0,
      label: "Kokomi Favonius Codex healing fixture",
      talents: { burst: 10, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const r1Build: CharacterBuild = {
      ...baseline,
      buildId: "test.metric.kokomi.everlasting-moonglow.r1",
      label: "Kokomi Everlasting Moonglow R1 healing fixture",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "EverlastingMoonglow" }
    }
    const r5Build: CharacterBuild = {
      ...r1Build,
      buildId: "test.metric.kokomi.everlasting-moonglow.r5",
      label: "Kokomi Everlasting Moonglow R5 healing fixture",
      weapon: { ...r1Build.weapon, refinement: 5 }
    }
    const baselineHealing = evaluateKokomiHealing(baseline)
    const r1Healing = evaluateKokomiHealing(r1Build)
    const r5Healing = evaluateKokomiHealing(r5Build)

    expect(baselineHealing.kind).toBe("healing")
    expect(r1Healing.kind).toBe("healing")
    expect(r5Healing.kind).toBe("healing")
    if (baselineHealing.kind !== "healing" || r1Healing.kind !== "healing" || r5Healing.kind !== "healing") {
      throw new Error("Expected Kokomi's healing metric")
    }

    expect(baselineHealing.healingBonus).toBeCloseTo(0.25)
    expect(r1Healing.healingBonus).toBeCloseTo(0.35)
    expect(r5Healing.healingBonus).toBeCloseTo(0.45)
    expect(r1Healing.scalingValue).toBeCloseTo(r5Healing.scalingValue)
    expect(r1Healing.sourceValue / (1 + r1Healing.healingBonus)).toBeCloseTo(
      r5Healing.sourceValue / (1 + r5Healing.healingBonus)
    )
    expect(r1Healing.value).toBeCloseTo(r1Healing.sourceValue)
    expect(r5Healing.value).toBeCloseTo(r5Healing.sourceValue)
    expect(collectFormulaTerms(baselineHealing.formula)).not.toContainEqual(
      expect.objectContaining({ label: "不灭月华 · 治疗加成", role: "source_modifier" })
    )
    expect(collectFormulaTerms(r1Healing.formula)).toContainEqual(
      expect.objectContaining({ label: "不灭月华 · 治疗加成", role: "source_modifier", value: 0.1 })
    )
    expect(collectFormulaTerms(r5Healing.formula)).toContainEqual(
      expect.objectContaining({ label: "不灭月华 · 治疗加成", role: "source_modifier", value: 0.2 })
    )
  })

  it("applies source and recipient state through the common support metric pipeline", () => {
    const kuki: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.KukiShinobu",
      characterId: "KukiShinobu",
      constellation: 0,
      label: "Conditional support metric fixture",
      talents: { burst: 6, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusSword" }
    }
    const yaoyao: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.Yaoyao",
      characterId: "Yaoyao",
      constellation: 0,
      label: "Conditional support metric fixture",
      talents: { burst: 6, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "TheCatch" }
    }
    const sara: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.KujouSara",
      characterId: "KujouSara",
      constellation: 0,
      label: "Conditional support metric fixture",
      talents: { burst: 10, normal: 6, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusWarbow" }
    }
    const recipient = {
      buildId: raidenNationalBuiltinBuild.buildId,
      incomingHealingBonus: 0,
      isWithinSourceArea: true
    }
    const evaluateConditionalMetric = (
      build: CharacterBuild,
      metricId: string,
      currentHpFraction: number | undefined,
      isWithinSourceArea = true
    ) =>
      evaluateCombatMetric({
        build,
        context: {
          recipient: { ...recipient, isWithinSourceArea },
          ...(currentHpFraction === undefined ? {} : { source: { currentHpFraction } }),
          teammates: [raidenNationalBuiltinBuild]
        },
        gameData,
        metricId
      })

    const kukiHighHp = evaluateConditionalMetric(
      kuki,
      "kuki_shinobu.skill.sanctifying_ring.grass_ring.heal_tick",
      0.6
    )
    const kukiLowHp = evaluateConditionalMetric(
      kuki,
      "kuki_shinobu.skill.sanctifying_ring.grass_ring.heal_tick",
      0.5
    )
    const yaoyaoInside = evaluateConditionalMetric(
      yaoyao,
      "yaoyao.skill.raphanus_sky_cluster.white_jade_radish.heal_tick",
      undefined
    )
    const yaoyaoOutside = evaluateConditionalMetric(
      yaoyao,
      "yaoyao.skill.raphanus_sky_cluster.white_jade_radish.heal_tick",
      undefined,
      false
    )
    const saraInside = evaluateConditionalMetric(
      sara,
      "kujou_sara.skill.tengu_stormcall.ambush.attack_buff",
      undefined
    )
    const saraOutside = evaluateConditionalMetric(
      sara,
      "kujou_sara.skill.tengu_stormcall.ambush.attack_buff",
      undefined,
      false
    )

    expect(kukiHighHp).toMatchObject({ kind: "healing", healingBonus: 0 })
    expect(kukiLowHp).toMatchObject({ kind: "healing", healingBonus: 0.15 })
    expect(yaoyaoInside).toMatchObject({ kind: "healing" })
    expect(saraInside).toMatchObject({ affectedStat: "attack_flat", kind: "stat_buff", unit: "attack" })
    if (
      kukiHighHp.kind !== "healing" ||
      kukiLowHp.kind !== "healing" ||
      yaoyaoInside.kind !== "healing" ||
      yaoyaoOutside.kind !== "healing" ||
      saraInside.kind !== "stat_buff" ||
      saraOutside.kind !== "stat_buff"
    ) {
      throw new Error("Expected conditional support metrics")
    }
    expect(kukiLowHp.value).toBeGreaterThan(kukiHighHp.value)
    expect(collectFormulaTerms(kukiLowHp.formula)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: "source_stat", stat: "elementalMastery" })
      ])
    )
    expect(kukiLowHp.conditions).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "source_hp_fraction", satisfied: true })])
    )
    expect(yaoyaoOutside).toMatchObject({ potentialValue: yaoyaoInside.value, value: 0 })
    expect(saraOutside).toMatchObject({ potentialValue: saraInside.value, value: 0 })
    expect(() =>
      evaluateConditionalMetric(kuki, "kuki_shinobu.skill.sanctifying_ring.grass_ring.heal_tick", undefined)
    ).toThrow("Metric source test.metric.KukiShinobu must declare a current HP fraction")
  })

  it("evaluates Geo support outputs as independent formula-traced metrics", () => {
    const gorou = createGeoMetricBuild("Gorou", "FavoniusWarbow")
    const xilonen = createGeoMetricBuild("Xilonen", "SacrificialSword")
    const yunJin = createGeoMetricBuild("YunJin", "TheCatch")
    const zhongli = createGeoMetricBuild("Zhongli", "TheCatch")

    const gorouDefense = evaluateFriendlyMetric("gorou.skill.field.defense_buff", gorou)
    const gorouGeoBonus = evaluateFriendlyMetric("gorou.skill.field.geo_damage_bonus", gorou)
    const xilonenResistance = evaluateCombatMetric({
      build: xilonen,
      gameData,
      metricId: "xilonen.skill.source_samples.resistance_reduction"
    })
    const xilonenHealing = evaluateFriendlyMetric("xilonen.burst.healing_rhythm.heal_tick", xilonen)
    const yunJinBonus = evaluateFriendlyMetric(
      "yun_jin.burst.flying_cloud_flag_formation.base_damage_increase",
      yunJin
    )
    const zhongliShield = evaluateFriendlyMetric("zhongli.skill.jade_shield.initial_absorption", zhongli)
    const zhongliResistance = evaluateCombatMetric({
      build: zhongli,
      gameData,
      metricId: "zhongli.skill.jade_shield.universal_resistance_reduction"
    })

    expect(gorouDefense).toMatchObject({
      flatAmount: 371.088,
      kind: "scalar",
      semantic: "defense_buff",
      unit: "defense",
      value: 371.088
    })
    expect(gorouGeoBonus).toMatchObject({ kind: "scalar", unit: "ratio", value: 0.15 })
    expect(xilonenResistance).toMatchObject({
      kind: "scalar",
      target: { kind: "enemy" },
      unit: "ratio",
      value: 0.36
    })
    expect(xilonenHealing).toMatchObject({ kind: "healing", scalingStat: "defense", unit: "hp" })
    expect(yunJinBonus).toMatchObject({ kind: "scalar", ratio: 0.57888, unit: "damage" })
    expect(zhongliShield).toMatchObject({ kind: "scalar", ratio: 0.2304, unit: "hp" })
    expect(zhongliResistance).toMatchObject({ kind: "scalar", target: { kind: "enemy" }, value: 0.2 })

    if (yunJinBonus.kind !== "scalar" || zhongliShield.kind !== "scalar") {
      throw new Error("Expected scalar Geo support metrics")
    }
    expect(yunJinBonus.value).toBeCloseTo((yunJinBonus.scalingValue ?? 0) * yunJinBonus.ratio)
    expect(zhongliShield.value).toBeCloseTo(
      (zhongliShield.scalingValue ?? 0) * zhongliShield.ratio + zhongliShield.flatAmount
    )
    expect(collectFormulaTerms(zhongliShield.formula)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: "source_stat", stat: "hp" }),
        expect.objectContaining({ parameterId: "jade-shield-hp-ratio", role: "source_talent_parameter" }),
        expect.objectContaining({ parameterId: "jade-shield-flat-absorption", role: "source_talent_parameter" })
      ])
    )
  })

  it("evaluates Itto's burst defense-to-attack conversion as a self-only metric", () => {
    const itto: CharacterBuild = {
      ...raidenNationalBuiltinBuild,
      buildId: "test.metric.AratakiItto",
      characterId: "AratakiItto",
      constellation: 0,
      label: "AratakiItto metric fixture",
      talents: { burst: 10, normal: 10, skill: 10 },
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusGreatsword" }
    }
    const metric = evaluateCombatMetric({
      build: itto,
      gameData,
      metricId: "arataki_itto.burst.royal_descent.defense_to_attack"
    })

    expect(metric).toMatchObject({
      kind: "scalar",
      ratio: 1.0368,
      scalingStat: "defense",
      semantic: "attack_buff",
      target: { characterId: "AratakiItto", kind: "self" },
      unit: "attack"
    })
    if (metric.kind !== "scalar") throw new Error("Expected Itto's self scalar metric")
    expect(metric.value).toBeCloseTo((metric.scalingValue ?? 0) * metric.ratio)
  })

  it("keeps Geo healing, shields, probabilities, and fixed buffs in their own units", () => {
    const albedo = createGeoMetricBuild("Albedo", "SacrificialSword")
    const linnea = createGeoMetricBuild("Linnea", "FavoniusWarbow")
    const noelle = createGeoMetricBuild("Noelle", "FavoniusGreatsword")

    const albedoMastery = evaluateFriendlyMetric(
      "albedo.passive.homuncular_nature.elemental_mastery_buff",
      albedo
    )
    const linneaInitial = evaluateFriendlyMetric("linnea.burst.initial_team_healing", linnea)
    const linneaTick = evaluateFriendlyMetric("linnea.burst.continuous_healing_tick", linnea)
    const noelleShield = evaluateFriendlyMetric("noelle.skill.breastplate.initial_absorption", noelle)
    const noelleHealing = evaluateFriendlyMetric("noelle.skill.breastplate.heal", noelle)
    const noelleProbability = evaluateFriendlyMetric(
      "noelle.skill.breastplate.healing_trigger_probability",
      noelle
    )

    expect(albedoMastery).toMatchObject({
      kind: "scalar",
      semantic: "elemental_mastery_buff",
      unit: "elemental_mastery",
      value: 125
    })
    expect(linneaInitial).toMatchObject({
      flatAmount: 1694.9546,
      kind: "healing",
      percentage: 2.88,
      scalingStat: "defense"
    })
    expect(linneaTick).toMatchObject({ flatAmount: 338.9909, kind: "healing", percentage: 0.576 })
    expect(noelleShield).toMatchObject({ kind: "scalar", ratio: 2.16, semantic: "shield", unit: "hp" })
    expect(noelleHealing).toMatchObject({
      flatAmount: 225.99677,
      kind: "healing",
      percentage: 0.38304,
      scalingStat: "defense"
    })
    expect(noelleProbability).toMatchObject({
      kind: "scalar",
      semantic: "trigger_probability",
      unit: "ratio",
      value: 0.59
    })
  })

  it("evaluates the second Geo metric batch with reviewed scaling terms", () => {
    const chiori = createGeoMetricBuild("Chiori", "SacrificialSword")
    const illuga = createGeoMetricBuild("Illuga", "TheCatch")
    const kachina = createGeoMetricBuild("Kachina", "TheCatch")
    const scenarioFor = (build: CharacterBuild) => ({
      ...raidenNationalBuiltinScenario,
      conditions: { ...raidenNationalBuiltinScenario.conditions, activeEffectIds: [] },
      primary: build,
      teammates: []
    })

    const chioriTamoto = evaluateCombatMetric({
      build: chiori,
      gameData,
      metricId: "chiori.skill.fluttering_hasode.single_tamoto_attack",
      scenario: scenarioFor(chiori)
    })
    const kachinaMounted = evaluateCombatMetric({
      build: kachina,
      gameData,
      metricId: "kachina.skill.go_go_turbo_twirly.mounted_attack",
      scenario: scenarioFor(kachina)
    })
    const kachinaIndependent = evaluateCombatMetric({
      build: kachina,
      gameData,
      metricId: "kachina.skill.go_go_turbo_twirly.independent_attack",
      scenario: scenarioFor(kachina)
    })
    const illugaGeoBonus = evaluateFriendlyMetric(
      "illuga.burst.song_of_the_nightbird.single_geo_damage_bonus",
      illuga
    )
    const illugaLunarBonus = evaluateFriendlyMetric(
      "illuga.burst.song_of_the_nightbird.single_lunar_crystallize_bonus",
      illuga
    )

    expect(chioriTamoto).toMatchObject({
      actionId: "chiori.skill.fluttering_hasode.tamoto_attack",
      formula: expect.objectContaining({ kind: "rotation_events" }),
      kind: "damage"
    })
    expect(chioriTamoto.value).toBeGreaterThan(0)
    expect(kachinaMounted.value).toBeGreaterThan(kachinaIndependent.value)
    expect(illugaGeoBonus).toMatchObject({
      kind: "scalar",
      ratio: 0.6048,
      scalingStat: "elementalMastery",
      semantic: "geo_damage_flat_bonus",
      unit: "damage"
    })
    expect(illugaLunarBonus).toMatchObject({
      kind: "scalar",
      ratio: 4.06656,
      scalingStat: "elementalMastery",
      semantic: "lunar_crystallize_flat_damage_bonus",
      unit: "damage"
    })
    expect(illugaLunarBonus.value).toBeGreaterThan(illugaGeoBonus.value)
  })

  it("publishes Bennett's default profile as healing and attack-buff outputs, never self damage", () => {
    const metrics = listCharacterCombatMetrics("Bennett")

    expect(metrics.map((metric) => ({ id: metric.id, kind: metric.kind }))).toEqual([
      { id: "bennett.burst.field.heal_tick", kind: "healing" },
      { id: "bennett.burst.field.attack_buff", kind: "stat_buff" }
    ])
    expect(metrics).not.toContainEqual(expect.objectContaining({ kind: "damage" }))
    expect(getCombatMetricDefinition("bennett.burst.initial_hit")).toBeUndefined()
  })

  it("requires an explicit friendly recipient before it evaluates a support metric", () => {
    expect(() =>
      evaluateCombatMetric({
        build: bennettNationalBuiltinBuild,
        gameData,
        metricId: "bennett.burst.field.heal_tick"
      })
    ).toThrow("requires a friendly recipient context")
  })

  it("rejects a support recipient that is not the source character or a configured teammate", () => {
    expect(() =>
      evaluateCombatMetric({
        build: bennettNationalBuiltinBuild,
        context: {
          recipient: {
            buildId: xianglingNationalBuiltinBuild.buildId,
            currentHpFraction: 0.5,
            isWithinSourceArea: true
          },
          teammates: [raidenNationalBuiltinBuild]
        },
        gameData,
        metricId: "bennett.burst.field.heal_tick"
      })
    ).toThrow("is not the source character or a selected teammate")
  })

  it("evaluates Bennett's Q outputs for a selected teammate and keeps their formula trace", () => {
    const healing = evaluateBennettMetric("bennett.burst.field.heal_tick")
    const attackBuff = evaluateBennettMetric("bennett.burst.field.attack_buff")

    expect(healing).toMatchObject({
      conditions: [
        expect.objectContaining({ kind: "recipient_in_source_area", satisfied: true }),
        expect.objectContaining({ kind: "recipient_hp_fraction", satisfied: true, threshold: 0.7 })
      ],
      flatAmount: 1270.2417,
      healingBonus: 0,
      id: "bennett.burst.field.heal_tick",
      kind: "healing",
      percentage: 0.108,
      potentialValue: 3125.4012875256003,
      recipient: { buildId: raidenNationalBuiltinBuild.buildId, kind: "friendly_recipient" },
      scalingStat: "hp",
      sourceValue: 3125.4012875256003,
      talentLevel: 10,
      unit: "hp",
      value: 3125.4012875256003
    })
    expect(healing.formula).toMatchObject({ kind: "condition", satisfied: true, value: healing.value })
    expect(attackBuff).toMatchObject({
      affectedStat: "attack_flat",
      conditions: [
        expect.objectContaining({ kind: "recipient_in_source_area", satisfied: true }),
        expect.objectContaining({ kind: "recipient_hp_fraction", satisfied: true, waived: true })
      ],
      id: "bennett.burst.field.attack_buff",
      kind: "stat_buff",
      potentialValue: 1045.5143587103998,
      ratio: 1.008,
      ratioConstellationBonus: 0.2,
      recipient: { buildId: raidenNationalBuiltinBuild.buildId, kind: "friendly_recipient" },
      scalingStat: "base_attack",
      talentLevel: 10,
      unit: "attack",
      value: 1045.5143587103998
    })
    expect(attackBuff.formula).toMatchObject({ kind: "condition", satisfied: true, value: attackBuff.value })
  })

  it("applies recipient-side healing and eligibility without turning a support value into main-damage gain", () => {
    const baseline = evaluateBennettMetric("bennett.burst.field.heal_tick")
    const withIncomingHealing = evaluateBennettMetric(
      "bennett.burst.field.heal_tick",
      bennettNationalBuiltinBuild,
      raidenNationalBuiltinBuild,
      { incomingHealingBonus: 0.25 }
    )
    const outsideField = evaluateBennettMetric(
      "bennett.burst.field.heal_tick",
      bennettNationalBuiltinBuild,
      raidenNationalBuiltinBuild,
      { isWithinSourceArea: false }
    )
    const healthyRecipient = evaluateBennettMetric(
      "bennett.burst.field.heal_tick",
      bennettNationalBuiltinBuild,
      raidenNationalBuiltinBuild,
      { currentHpFraction: 0.8 }
    )
    const cappedRecovery = evaluateBennettMetric(
      "bennett.burst.field.heal_tick",
      bennettNationalBuiltinBuild,
      raidenNationalBuiltinBuild,
      { missingHp: 500 }
    )

    expect(withIncomingHealing).toMatchObject({
      incomingHealingBonus: 0.25,
      potentialValue: baseline.value * 1.25,
      sourceValue: baseline.value,
      value: baseline.value * 1.25
    })
    expect(collectFormulaTerms(withIncomingHealing.formula)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: "source_stat", stat: "hp" }),
        expect.objectContaining({ parameterId: "healing-percentage", role: "source_talent_parameter" }),
        expect.objectContaining({ parameterId: "healing-flat", role: "source_talent_parameter" }),
        expect.objectContaining({ role: "source_modifier", value: 0 }),
        expect.objectContaining({ role: "recipient_modifier", value: 0.25 })
      ])
    )
    expect(outsideField).toMatchObject({ potentialValue: baseline.value, value: 0 })
    expect(healthyRecipient).toMatchObject({ potentialValue: baseline.value, value: 0 })
    expect(outsideField.conditions).toContainEqual(
      expect.objectContaining({ kind: "recipient_in_source_area", satisfied: false })
    )
    expect(healthyRecipient.conditions).toContainEqual(
      expect.objectContaining({ kind: "recipient_hp_fraction", satisfied: false, threshold: 0.7 })
    )
    expect(cappedRecovery).toMatchObject({
      actualRestoredFormula: expect.objectContaining({ kind: "minimum", value: 500 }),
      actualRestoredValue: 500,
      missingHp: 500,
      potentialValue: baseline.value,
      value: baseline.value
    })
    expect(withIncomingHealing).not.toHaveProperty("actionExpectedDamage")
  })

  it("uses Traveling Doctor only from the build that receives Bennett's healing", () => {
    const twoPieceRecipient = withArtifactSetPieces(
      raidenNationalBuiltinBuild,
      "TravelingDoctor",
      2,
      "test.metric.raiden.traveling-doctor.2pc"
    )
    const twoPieceSource = withArtifactSetPieces(
      bennettNationalBuiltinBuild,
      "TravelingDoctor",
      2,
      "test.metric.bennett.traveling-doctor.2pc"
    )
    const metricId = "bennett.burst.field.heal_tick"
    const baseline = evaluateBennettMetric(metricId)
    const recipientHealing = evaluateBennettMetric(metricId, bennettNationalBuiltinBuild, twoPieceRecipient)
    const sourceHealing = evaluateBennettMetric(metricId, twoPieceSource)
    const combinedHealing = evaluateBennettMetric(
      metricId,
      bennettNationalBuiltinBuild,
      twoPieceRecipient,
      { incomingHealingBonus: 0.25 }
    )

    expect(baseline.kind).toBe("healing")
    expect(recipientHealing.kind).toBe("healing")
    expect(sourceHealing.kind).toBe("healing")
    expect(combinedHealing.kind).toBe("healing")
    if (
      baseline.kind !== "healing" ||
      recipientHealing.kind !== "healing" ||
      sourceHealing.kind !== "healing" ||
      combinedHealing.kind !== "healing"
    ) {
      throw new Error("Expected Bennett's healing metric")
    }

    expect(recipientHealing).toMatchObject({
      incomingHealingBonus: 0.2,
      potentialValue: baseline.potentialValue * 1.2,
      sourceValue: baseline.sourceValue,
      value: baseline.value * 1.2
    })
    expect(sourceHealing).toMatchObject({
      incomingHealingBonus: 0,
      potentialValue: baseline.potentialValue,
      sourceValue: baseline.sourceValue,
      value: baseline.value
    })
    expect(combinedHealing).toMatchObject({
      incomingHealingBonus: 0.45,
      potentialValue: baseline.potentialValue * 1.45,
      sourceValue: baseline.sourceValue,
      value: baseline.value * 1.45
    })
    expect(collectFormulaTerms(recipientHealing.formula)).toContainEqual(
      expect.objectContaining({
        label: "游医 · 二件套（受到的治疗效果）",
        role: "recipient_modifier",
        value: 0.2
      })
    )
  })

  it("uses selected-recipient conditions for Bennett's field attack bonus", () => {
    const c0Build = { ...bennettNationalBuiltinBuild, buildId: "test.bennett.c0", constellation: 0 }
    const c0LowHealthRecipient = evaluateBennettMetric(
      "bennett.burst.field.attack_buff",
      c0Build,
      raidenNationalBuiltinBuild,
      { currentHpFraction: 0.6 }
    )
    const c1LowHealthRecipient = evaluateBennettMetric(
      "bennett.burst.field.attack_buff",
      bennettNationalBuiltinBuild,
      raidenNationalBuiltinBuild,
      { currentHpFraction: 0.6 }
    )

    expect(c0LowHealthRecipient).toMatchObject({ potentialValue: expect.any(Number), value: 0 })
    expect(c0LowHealthRecipient.conditions).toContainEqual(
      expect.objectContaining({ kind: "recipient_hp_fraction", satisfied: false, waived: false })
    )
    expect(c1LowHealthRecipient.value).toBeGreaterThan(0)
    expect(c1LowHealthRecipient.conditions).toContainEqual(
      expect.objectContaining({ kind: "recipient_hp_fraction", satisfied: true, waived: true })
    )
  })

  it("routes selected party-owned recipient equipment snapshots through healing and shield metrics", () => {
    const maidenEffectId = "artifact.maiden-beloved.4pc.after-skill-or-burst.party-incoming-healing-bonus"
    const tenacityEffectId = "artifact.tenacity-of-the-millelith.4pc.after-skill-hit.party-shield-strength"
    const maidenHolder = withArtifactSetPieces(
      xingqiuNationalBuiltinBuild,
      "MaidenBeloved",
      4,
      "test.metric.xingqiu.maiden-beloved.4pc"
    )
    const tenacityHolder = withArtifactSetPieces(
      xingqiuNationalBuiltinBuild,
      "TenacityOfTheMillelith",
      4,
      "test.metric.xingqiu.tenacity-of-the-millelith.4pc"
    )
    const recipient = raidenNationalBuiltinBuild
    const evaluateBennettHealing = (activeEffectIds: string[]) =>
      evaluateCombatMetric({
        build: bennettNationalBuiltinBuild,
        context: {
          ...(activeEffectIds.length === 0
            ? {}
            : {
                activeEffectIds,
                activeEffectSourceBuildIds: { [maidenEffectId]: maidenHolder.buildId }
              }),
          recipient: {
            buildId: recipient.buildId,
            currentHpFraction: 0.5,
            incomingHealingBonus: 0,
            isWithinSourceArea: true
          },
          teammates: [recipient, maidenHolder]
        },
        gameData,
        metricId: "bennett.burst.field.heal_tick"
      })
    const baselineHealing = evaluateBennettHealing([])
    const maidenHealing = evaluateBennettHealing([maidenEffectId])

    expect(baselineHealing.kind).toBe("healing")
    expect(maidenHealing.kind).toBe("healing")
    if (baselineHealing.kind !== "healing" || maidenHealing.kind !== "healing") {
      throw new Error("Expected Bennett's healing metric")
    }
    expect(maidenHealing).toMatchObject({
      incomingHealingBonus: 0.2,
      potentialValue: baselineHealing.potentialValue * 1.2,
      value: baselineHealing.value * 1.2
    })
    expect(collectFormulaTerms(maidenHealing.formula)).toContainEqual(
      expect.objectContaining({
        label: "被怜爱的少女 · 四件套（已手填元素战技或元素爆发后10秒的队伍受治疗效果）",
        role: "recipient_modifier",
        value: 0.2
      })
    )

    const layla = createShieldMetricBuild("Layla", "SacrificialSword")
    const evaluateLaylaShield = (activeEffectIds: string[]) =>
      evaluateCombatMetric({
        build: layla,
        context: {
          ...(activeEffectIds.length === 0
            ? {}
            : {
                activeEffectIds,
                activeEffectSourceBuildIds: { [tenacityEffectId]: tenacityHolder.buildId }
              }),
          recipient: { buildId: recipient.buildId, isWithinSourceArea: true },
          teammates: [recipient, tenacityHolder]
        },
        gameData,
        metricId: "layla.skill.nights_of_formal_focus.curtain_of_slumber.initial_absorption"
      })
    const baselineShield = evaluateLaylaShield([])
    const tenacityShield = evaluateLaylaShield([tenacityEffectId])

    expect(baselineShield.kind).toBe("scalar")
    expect(tenacityShield.kind).toBe("scalar")
    if (baselineShield.kind !== "scalar" || tenacityShield.kind !== "scalar") {
      throw new Error("Expected Layla's shield metric")
    }
    expect(tenacityShield).toMatchObject({
      potentialValue: baselineShield.potentialValue * 1.3,
      value: baselineShield.value * 1.3
    })
    expect(collectFormulaTerms(tenacityShield.formula)).toContainEqual(
      expect.objectContaining({
        label: "千岩牢固 · 四件套（已手填元素战技命中后3秒的队伍护盾强效）",
        role: "recipient_modifier",
        value: 0.3
      })
    )
  })

  it("rejects invalid manually selected recipient equipment snapshots", () => {
    const maidenEffectId = "artifact.maiden-beloved.4pc.after-skill-or-burst.party-incoming-healing-bonus"
    const automaticEffectId = "artifact.traveling-doctor.2pc.incoming-healing-bonus"
    const maidenHolder = withArtifactSetPieces(
      xingqiuNationalBuiltinBuild,
      "MaidenBeloved",
      4,
      "test.metric.xingqiu.maiden-beloved.first-holder"
    )
    const secondMaidenHolder = withArtifactSetPieces(
      xianglingNationalBuiltinBuild,
      "MaidenBeloved",
      4,
      "test.metric.xiangling.maiden-beloved.second-holder"
    )
    const evaluateHealingWithSnapshot = (
      activeEffectIds: string[],
      activeEffectSourceBuildIds?: Record<string, string>
    ) =>
      evaluateCombatMetric({
        build: bennettNationalBuiltinBuild,
        context: {
          activeEffectIds,
          ...(activeEffectSourceBuildIds === undefined ? {} : { activeEffectSourceBuildIds }),
          recipient: {
            buildId: raidenNationalBuiltinBuild.buildId,
            currentHpFraction: 0.5,
            incomingHealingBonus: 0,
            isWithinSourceArea: true
          },
          teammates: [raidenNationalBuiltinBuild, maidenHolder, secondMaidenHolder]
        },
        gameData,
        metricId: "bennett.burst.field.heal_tick"
      })

    expect(() => evaluateHealingWithSnapshot(["artifact.unknown.recipient-effect"])).toThrow(
      "Metric equipment effect artifact.unknown.recipient-effect is not registered"
    )
    expect(() => evaluateHealingWithSnapshot([maidenEffectId, maidenEffectId])).toThrow(
      `Metric equipment snapshots contain duplicate active effect ${maidenEffectId}`
    )
    expect(() => evaluateHealingWithSnapshot([], { [maidenEffectId]: maidenHolder.buildId })).toThrow(
      `Metric equipment source selection ${maidenEffectId} has no matching active effect`
    )
    expect(() => evaluateHealingWithSnapshot([automaticEffectId])).toThrow(
      `Metric equipment effect ${automaticEffectId} is automatic and cannot be selected`
    )
    expect(() => evaluateHealingWithSnapshot([maidenEffectId])).toThrow(
      `Metric equipment effect ${maidenEffectId} has multiple eligible party sources; select one explicitly`
    )
    expect(() =>
      evaluateHealingWithSnapshot([maidenEffectId], { [maidenEffectId]: raidenNationalBuiltinBuild.buildId })
    ).toThrow(`Metric equipment effect ${maidenEffectId} cannot use source ${raidenNationalBuiltinBuild.buildId}`)
  })

  it("keeps healing and attack buff independent when Bennett's own attributes change", () => {
    const baselineHealing = evaluateBennettMetric("bennett.burst.field.heal_tick")
    const baselineAttackBuff = evaluateBennettMetric("bennett.burst.field.attack_buff")
    const hpBuild = {
      ...bennettNationalBuiltinBuild,
      artifacts: bennettNationalBuiltinBuild.artifacts.map((artifact) =>
        artifact.slot === "goblet" ? { ...artifact, mainStat: { stat: "hp_percent" as const, value: 0.466 } } : artifact
      ),
      buildId: "test.bennett.hp-goblet"
    }
    const weaponBuild = {
      ...bennettNationalBuiltinBuild,
      buildId: "test.bennett.sacrificial-sword",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "SacrificialSword" }
    }
    const healingBonusBuild = {
      ...bennettNationalBuiltinBuild,
      artifacts: bennettNationalBuiltinBuild.artifacts.map((artifact) =>
        artifact.slot === "circlet"
          ? { ...artifact, mainStat: { stat: "healing_bonus" as const, value: 0.359 } }
          : artifact
      ),
      buildId: "test.bennett.healing-bonus"
    }
    const maidenBennett = {
      ...bennettNationalBuiltinBuild,
      artifacts: bennettNationalBuiltinBuild.artifacts.map((artifact, index) =>
        index < 2 ? { ...artifact, setId: "MaidenBeloved" } : artifact
      ),
      buildId: "test.bennett.maiden-beloved"
    }

    expect(evaluateBennettMetric("bennett.burst.field.heal_tick", hpBuild).value).toBeGreaterThan(
      baselineHealing.value
    )
    expect(evaluateBennettMetric("bennett.burst.field.attack_buff", hpBuild).value).toBeCloseTo(
      baselineAttackBuff.value
    )
    expect(evaluateBennettMetric("bennett.burst.field.heal_tick", weaponBuild).value).toBeCloseTo(
      baselineHealing.value
    )
    expect(evaluateBennettMetric("bennett.burst.field.attack_buff", weaponBuild).value).toBeLessThan(
      baselineAttackBuff.value
    )
    expect(evaluateBennettMetric("bennett.burst.field.heal_tick", healingBonusBuild).value).toBeCloseTo(
      baselineHealing.value * 1.359
    )
    expect(evaluateBennettMetric("bennett.burst.field.attack_buff", healingBonusBuild).value).toBeCloseTo(
      baselineAttackBuff.value
    )
    const maidenHealing = evaluateBennettMetric("bennett.burst.field.heal_tick", maidenBennett)
    expect(maidenHealing).toMatchObject({ healingBonus: 0.15, value: baselineHealing.value * 1.15 })
    expect(collectFormulaTerms(maidenHealing.formula)).toContainEqual(
      expect.objectContaining({ label: "两件套治疗加成", role: "source_modifier", value: 0.15 })
    )
  })

  it("applies Bennett's C1 ratio and C5 burst-level bonus to both of his own field metrics", () => {
    const c5Build = { ...bennettNationalBuiltinBuild, buildId: "test.bennett.c5", constellation: 5 }
    const healing = evaluateBennettMetric("bennett.burst.field.heal_tick", c5Build)
    const attackBuff = evaluateBennettMetric("bennett.burst.field.attack_buff", c5Build)

    expect(healing).toMatchObject({ flatAmount: 1587.8221, percentage: 0.1275, talentLevel: 13 })
    expect(attackBuff).toMatchObject({ ratio: 1.19, ratioConstellationBonus: 0.2, talentLevel: 13 })
    expect(healing.value).toBeGreaterThan(evaluateBennettMetric("bennett.burst.field.heal_tick").value)
    expect(attackBuff.value).toBeGreaterThan(evaluateBennettMetric("bennett.burst.field.attack_buff").value)
  })

})
