import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { ArtifactStat, CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"

import { resolveCoreCombatStats } from "../../../src/core/base-stats.js"
import { evaluateCombatMetric } from "../../../src/metrics/evaluate.js"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
const weapons = {
  bow: "HuntersBow", catalyst: "ApprenticesNotes", claymore: "WasterGreatsword",
  polearm: "BeginnersProtector", sword: "DullBlade"
} as const

afterAll(() => gameData.close())

function build(characterId: string, constellation = 0): CharacterBuild {
  const character = gameData.getCharacter(characterId)
  if (!character) throw new Error(`Missing fixture character ${characterId}`)
  const weaponId = weapons[character.weaponType as keyof typeof weapons]
  if (!weaponId) throw new Error(`Missing fixture weapon for ${characterId}`)
  return {
    ...raidenNationalBuiltinBuild,
    artifacts: [],
    ascension: 6,
    buildId: `support-regression.${characterId}`,
    characterId,
    constellation,
    level: 90,
    talents: { burst: 10, normal: 10, skill: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId }
  }
}

function addStat(source: CharacterBuild, stat: ArtifactStat, value: number): CharacterBuild {
  return {
    ...source,
    artifacts: [{
      id: "support-regression.stat", level: 20, mainStat: { stat, value }, rarity: 5,
      setId: "GladiatorsFinale", slot: "sands", substats: []
    }]
  }
}

function support(
  metricId: string,
  source: CharacterBuild,
  recipient = source,
  teammates = recipient.buildId === source.buildId ? [] : [recipient]
) {
  return evaluateCombatMetric({
    build: source,
    context: {
      recipient: {
        buildId: recipient.buildId, currentHpFraction: 0.5, incomingHealingBonus: 0.2, isWithinSourceArea: true
      },
      teammates
    },
    gameData,
    metricId
  })
}

describe("support and HP metric semantic regressions", () => {
  it("includes only unlocked automatic source HP in support panels", () => {
    const metricId = "diona.skill.icy_paws.press.base_absorption"
    const c5 = support(metricId, build("Diona", 5))
    const c6 = support(metricId, build("Diona", 6))
    if (c5.kind !== "scalar" || c6.kind !== "scalar") throw new Error("Expected shield scalars")
    const core = resolveCoreCombatStats(build("Diona", 6), gameData)
    expect(c5.scalingValue).toBeCloseTo(core.hp)
    expect(c6.scalingValue).toBeCloseTo(core.hp + core.baseHp * 0.25)
    expect(c6.value).toBeGreaterThan(c5.value)
  })

  it("uses HP rather than attack for Diona healing and Layla burst damage", () => {
    const diona = build("Diona")
    const healId = "diona.burst.signature_mix.heal_tick"
    const healing = support(healId, diona)
    if (healing.kind !== "healing") throw new Error("Expected healing")
    expect(healing.scalingStat).toBe("hp")
    expect(healing.value).toBeCloseTo(
      (resolveCoreCombatStats(diona, gameData).hp * healing.percentage + healing.flatAmount) * 1.2
    )
    expect(support(healId, addStat(diona, "atk", 100)).value).toBeCloseTo(healing.value)
    expect(support(healId, addStat(diona, "hp", 1000)).value - healing.value)
      .toBeCloseTo(1000 * healing.percentage * 1.2)

    const scenario = {
      ...raidenNationalBuiltinScenario,
      conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" as const },
      externalBuffs: [], primary: build("Layla", 6), teammates: [],
      targetActionId: "layla.burst.dream_of_the_star_stream_shaker.starlight_slug.single_hit"
    }
    const baseline = evaluateScenario(scenario, gameData)
    expect(baseline.rotation.events[0]?.trace[0]).toMatchObject({ kind: "scaling", stat: "hp" })
    expect(evaluateScenario(scenario, gameData, { artifactStatDeltas: { atk: 100 } }).actionExpectedDamage)
      .toBeCloseTo(baseline.actionExpectedDamage)
    const extraHp = evaluateScenario(scenario, gameData, { artifactStatDeltas: { hp: 1000 } })
    expect(extraHp.actionExpectedDamage / baseline.actionExpectedDamage)
      .toBeCloseTo((baseline.stats.effectiveHp + 1000) / baseline.stats.effectiveHp)
  })

  it("adds Sayu C6 mastery healing before healing multipliers and caps only that term", () => {
    const metricId = "sayu.burst.yoohoo_art_mujina_flurry.muji_muji_daruma.heal_tick"
    for (const extraMastery of [100, 1904, 2104]) {
      const c5 = addStat(build("Sayu", 5), "elemental_mastery", extraMastery)
      const c6 = { ...c5, constellation: 6 }
      const before = support(metricId, c5)
      const after = support(metricId, c6)
      const mastery = resolveCoreCombatStats(c6, gameData).elementalMastery
      expect(after.value - before.value).toBeCloseTo(Math.min(3 * mastery, 6000) * 1.2)
      expect(after.formula.value).toBeCloseTo(after.value)
    }
  })

  it("doubles only the source recipient's snack healing after nonzero healing bonuses", () => {
    const source = addStat(build("YumemizukiMizuki", 6), "healing_bonus", 0.3)
    const metricId = "yumemizuki_mizuki.burst.anraku_secret_spring_therapy.mini_baku.snack_heal"
    const teammate = build("Fischl")
    const self = support(metricId, source, source, [teammate])
    const other = support(metricId, source, teammate, [teammate])
    expect(self.value).toBeCloseTo(other.value * 2)
    if (self.kind !== "healing" || other.kind !== "healing") throw new Error("Expected healing")
    expect(self.healingBonus).toBeCloseTo(0.3)
    expect(other.healingBonus).toBeCloseTo(0.3)
    expect(self.formula.value).toBeCloseTo(self.value)
  })

  it.each([
    ["Layla", "layla.skill.nights_of_formal_focus.curtain_of_slumber.initial_absorption", 1, 1.2],
    ["Diona", "diona.skill.icy_paws.press.base_absorption", 2, 1.15]
  ] as const)("multiplies %s's complete base shield at its constellation threshold", (characterId, metricId, threshold, multiplier) => {
    const locked = support(metricId, build(characterId, threshold - 1))
    const unlocked = support(metricId, build(characterId, threshold))
    if (locked.kind !== "scalar" || unlocked.kind !== "scalar") throw new Error("Expected shield scalars")
    expect(locked.flatAmount).toBeGreaterThan(0)
    expect(unlocked.value).toBeCloseTo(locked.value * multiplier)
    expect(unlocked.formula.value).toBeCloseTo(unlocked.value)
  })
})
