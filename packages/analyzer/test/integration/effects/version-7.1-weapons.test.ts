import { fileURLToPath } from "node:url"
import { afterAll, describe, expect, it } from "vitest"
import { raidenNationalBuiltinScenario, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { GameDataRepository } from "@gscombat/game-data"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"
import { analyzeWeaponComparison } from "../../../src/analysis/analyze.js"
import { evaluateCombatMetric } from "../../../src/metrics/evaluate.js"

const db = new GameDataRepository(fileURLToPath(new URL("../../../../game-data/snapshots/7.1/game-data.sqlite", import.meta.url)))
afterAll(() => db.close())

function build(characterId: string, weaponId: string): CharacterBuild {
  return { ...structuredClone(xianglingNationalBuiltinBuild), characterId, buildId: `7.1.${characterId}`,
    constellation: 0, artifacts: [], weapon: { weaponId, refinement: 1, level: 90, ascension: 6 } }
}

function scenario(primary: CharacterBuild, targetActionId: string, teammates: CharacterBuild[] = []): EvaluationScenario {
  return { ...raidenNationalBuiltinScenario, gameDataVersion: "7.1", primary, teammates, targetActionId,
    conditions: { activeEffectIds: [], enemyCount: 1 } }
}

describe("7.1 weapon integration", () => {
  it("replaces ordinary New Bough and Winter bonuses under Radiance instead of stacking them", () => {
    const kaeya = build("Kaeya", "NewBough")
    const vesna = build("Vesna", "FavoniusSword")
    const ordinary = evaluateScenario(scenario(kaeya, "kaeya.skill.frostgnaw"), db)
    const radiance = evaluateScenario(scenario(kaeya, "kaeya.skill.frostgnaw", [vesna]), db)
    expect(ordinary.appliedEffects.some(effect => effect.id.startsWith("weapon.new-bough.ordinary.") && effect.target === "elementalMastery")).toBe(true)
    expect(radiance.appliedEffects.filter(effect => effect.id.startsWith("weapon.new-bough.ordinary."))).toEqual([])
    expect(radiance.appliedEffects.some(effect => effect.id.startsWith("weapon.new-bough.stellar.") && effect.target === "attackPercent")).toBe(true)
    const yae = build("YaeMiko", "WintersHeavyHeart")
    const winter = evaluateScenario(scenario(yae, "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt", [kaeya, vesna]), db)
    const effects = winter.appliedEffects.filter(effect => effect.id.startsWith("weapon.winters-heavy-heart."))
    expect(effects.filter(effect => effect.id.includes(".false."))).toEqual([])
    expect(effects.find(effect => effect.target === "elementalMastery")?.value).toBe(40)
  })
  it("clears both Chrysalis winds off-field without offering a weapon choice", () => {
    const owner = build("Furina", "BeyondTheChrysalis")
    const result = evaluateScenario(scenario(owner, "furina.skill.salon_solitaire.mademoiselle_crabaletta.single_hit", [build("Kaeya", "FavoniusSword")]), db)
    expect(result.appliedEffects.filter(effect => effect.id.startsWith("weapon.beyond-the-chrysalis."))).toEqual([])
  })
  it.each([0, 4, 6])("keeps Vodyanitsa's auxiliary additions equal to the applied damage source at C%s", constellation => {
    const source: CharacterBuild = { ...build("Vodyanitsa", "HymnOfTheMaelstrom"), constellation,
      artifacts: xianglingNationalBuiltinBuild.artifacts.map(piece => ({ ...piece,
        setId: "TenacityOfTheMillelith", substats: [],
        mainStat: ["sands", "goblet", "circlet"].includes(piece.slot)
          ? { stat: "hp_percent" as const, value: 0.466 } : piece.mainStat })) }
    const kaeya = build("Kaeya", "FavoniusSword")
    const vesna = build("Vesna", "BeyondTheChrysalis")
    const furina = build("Furina", "FavoniusSword")
    for (const stellar of [false, true]) {
      const primary = stellar ? vesna : kaeya
      const teammates = stellar ? [source, kaeya, furina] : [source, furina]
      const action = stellar ? "vesna.burst.spirit_blades.stellar_swirl" : "kaeya.skill.frostgnaw"
      const damageScenario = scenario(primary, action, teammates)
      damageScenario.conditions.targetFrozen = true
      const damage = evaluateScenario(damageScenario, db)
      const metric = evaluateCombatMetric({ build: source, gameData: db,
        metricId: `vodyanitsa.passive.song.${stellar ? "stellar" : "hydro-cryo"}.addition`,
        context: { source: { targetFrozen: true }, onFieldBuildId: primary.buildId, teammates: stellar ? [primary, kaeya, furina] : [primary, furina],
          recipient: { buildId: primary.buildId, currentHpFraction: 1, incomingHealingBonus: 0, isWithinSourceArea: true } } })
      const effect = damage.appliedEffects.find(entry => entry.id === `vodyanitsa.passive.song.${stellar}.${stellar ? "stellar" : "hydro-cryo"}`)
      expect(metric.value).toBeGreaterThan(0)
      expect(effect?.value).toBeCloseTo(metric.value, 6)
    }
  })
  it.each([
    ["Vesna", "BeyondTheChrysalis", "vesna.skill.soaring_blade.highest_tier.stellar_swirl"],
    ["Vesna", "BeyondTheChrysalis", "vesna.burst.spirit_blades.stellar_swirl"],
    ["Vodyanitsa", "HymnOfTheMaelstrom", "vodyanitsa.skill.spring_horn.hydro"],
    ["Vodyanitsa", "HymnOfTheMaelstrom", "vodyanitsa.burst.finale.hydro"]
  ])("evaluates the approved %s damage metric %s/%s at C0 and C6", (character, weapon, action) => {
    for (const constellation of [0, 6]) {
      const input = scenario({ ...build(character, weapon), constellation }, action,
        character === "Vesna" ? [build("Kaeya", "FavoniusSword"), build("Vodyanitsa", "HymnOfTheMaelstrom")] : [])
      const result = evaluateScenario(input, db)
      expect(result.actionExpectedDamage).toBeGreaterThan(0)
      expect(Number.isFinite(result.actionExpectedDamage)).toBe(true)
      if (action === "vesna.skill.soaring_blade.highest_tier.stellar_swirl") expect(result.rotation.events).toHaveLength(5)
    }
  })

  it("evaluates Vodyanitsa's healing and constellation talent level from the 7.1 SQLite", () => {
    const source = { ...build("Vodyanitsa", "HymnOfTheMaelstrom"), constellation: 3 }
    const result = evaluateCombatMetric({ build: source, metricId: "vodyanitsa.skill.distant_song.heal", gameData: db,
      context: { recipient: { buildId: source.buildId, currentHpFraction: 0.5, incomingHealingBonus: 0, isWithinSourceArea: true }, teammates: [] } })
    expect(result.kind).toBe("healing")
    expect(result.value).toBeGreaterThan(0)
  })

  it("applies C4's independent healing multiplier strictly below 40%, not at the boundary", () => {
    const source = { ...build("Vodyanitsa", "HymnOfTheMaelstrom"), constellation: 4 }
    const healing = (fraction: number) => evaluateCombatMetric({
      build: source, metricId: "vodyanitsa.skill.distant_song.heal", gameData: db,
      context: { recipient: { buildId: source.buildId, currentHpFraction: fraction,
        incomingHealingBonus: 0.2, isWithinSourceArea: true }, teammates: [] }
    })
    expect(healing(0.399).value).toBeCloseTo(healing(0.4).value * 1.5)
    expect(healing(0.4).value).toBeCloseTo(healing(0.401).value)
  })
  it.each([
    ["Silverlight", "Kaeya", "kaeya.skill.frostgnaw"],
    ["NewBough", "Kaeya", "kaeya.skill.frostgnaw"],
    ["BeyondTheChrysalis", "Kaeya", "kaeya.skill.frostgnaw"],
    ["WintersHeavyHeart", "YaeMiko", "yae_miko.skill.yakan_evocation.sesshou_sakura.level_three_bolt"],
    ["BreezeborneRefrain", "Fischl", "fischl.skill.nightrider.oz.level_one_bolt"],
    ["HymnOfTheMaelstrom", "SangonomiyaKokomi", "sangonomiya_kokomi.normal.auto.first_hit"]
  ])("evaluates %s with identical equipped and single-comparison results", (weapon, character, action) => {
    const input = scenario(build(character, weapon), action)
    const result = evaluateScenario(input, db)
    expect(Number.isFinite(result.actionExpectedDamage)).toBe(true)
    expect(result.actionExpectedDamage).toBeGreaterThan(0)
    const compared = analyzeWeaponComparison(input, db, weapon, 1)
    expect(compared.weapon.expectedDamage).toBeCloseTo(result.actionExpectedDamage, 8)
    expect(compared.weapon.gainRatio).toBe(0)
  })

  it("only grants Hymn's source-HP attack conversion to the foreground recipient", () => {
    const kokomi = build("SangonomiyaKokomi", "HymnOfTheMaelstrom")
    const kaeya = build("Kaeya", "FavoniusSword")
    const result = evaluateScenario(scenario(kaeya, "kaeya.skill.frostgnaw", [kokomi]), db)
    expect(result.appliedEffects.some(effect => effect.id.startsWith("weapon.hymn-of-the-maelstrom.") && effect.id.endsWith("party-attack"))).toBe(true)
  })
})
