import { afterAll, describe, expect, it } from "vitest"
import { getCombatActionDefinition, raidenNationalBuiltinScenario, xianglingNationalBuiltinBuild } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { analyzeWeaponComparison } from "../../../src/analysis/analyze.js"
import { resolveCombatActionEffects } from "../../../src/effects/action-effects.js"
import { describeWeaponChoices } from "../../../src/effects/weapon-state.js"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"
import { findCapabilityProviders } from "../../../src/scenario/capabilities.js"
import { resolveScenarioSourceStatMaps } from "../../../src/evaluators/source-stats.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())

function build(characterId: string, weaponId: string, refinement = 1): CharacterBuild {
  expect(db.getWeapon(weaponId)?.weaponType).toBe(db.getCharacter(characterId)?.weaponType)
  return { ...structuredClone(xianglingNationalBuiltinBuild), characterId, buildId: `audit.${characterId}`,
    constellation: 0, artifacts: [], weapon: { weaponId, refinement, level: 90, ascension: 6 } }
}

function scenario(primary: CharacterBuild, targetActionId: string, teammates: CharacterBuild[] = []): EvaluationScenario {
  const { actionParameters: _unused, ...conditions } = raidenNationalBuiltinScenario.conditions
  expect(getCombatActionDefinition(targetActionId)?.characterId).toBe(primary.characterId)
  return { ...raidenNationalBuiltinScenario, primary, teammates, targetActionId,
    conditions: { ...conditions, activeEffectIds: [] } }
}

function effects(input: EvaluationScenario) {
  const action = getCombatActionDefinition(input.targetActionId)!
  return resolveCombatActionEffects({ action, primary: input.primary, teammates: input.teammates,
    activeEffectIds: input.conditions.activeEffectIds, baseEnergyRecharge: 1, gameData: db, enemyCount: input.conditions.enemyCount,
    fieldContext: { actionOwnerBuildId: input.primary.buildId, onFieldBuildId: input.primary.buildId,
      ...(input.conditions.weaponEffectChoices ? { weaponEffectChoices: input.conditions.weaponEffectChoices } : {}) } })
}

function withChoice(input: EvaluationScenario, group: string, variant: string): EvaluationScenario {
  return { ...input, conditions: { ...input.conditions,
    weaponEffectChoices: { [input.primary.buildId]: { [group]: variant } } } }
}

describe("reviewed weapon audit fixes", () => {
  it.each(["stellar_superconduct", "stellar_swirl"])(
    "prepares all Whitelake stacks for Odette's %s Coda in equipment and comparisons", (reaction) => {
      const input = scenario(build("Odette", "PrimordialJadeCutter"),
        `odette.skill.adagio_coda_at_dawn.final_hit.${reaction}`)
      for (const [refinement, attackPercent, critDamage] of [[1, 0.24, 0.5], [5, 0.48, 1.1]] as const) {
        const equipped = { ...input, primary: { ...input.primary,
          weapon: { ...input.primary.weapon, weaponId: "WhitelakeFrostfeather", refinement } } }
        const result = evaluateScenario(equipped, db)
        expect(result.appliedEffects.filter((effect) => effect.id.startsWith("weapon.whitelake-frostfeather.")))
          .toEqual(expect.arrayContaining([
            expect.objectContaining({ id: "weapon.whitelake-frostfeather.lake-hued-lament.3-stack.attack-percent",
              value: attackPercent }),
            expect.objectContaining({ id: "weapon.whitelake-frostfeather.lake-hued-lament.3-stack.stellar-reaction-crit-damage",
              value: critDamage })
          ]))
        expect(result.appliedEffects.some((effect) => /lake-hued-lament\.[12]-stack/.test(effect.id))).toBe(false)
        expect(analyzeWeaponComparison(input, db, "WhitelakeFrostfeather", refinement).weapon.expectedDamage)
          .toBeCloseTo(result.actionExpectedDamage, 8)
        expect(analyzeWeaponComparison(equipped, db, "WhitelakeFrostfeather", refinement).weapon.gainRatio).toBe(0)
      }
    }
  )

  it("counts Xianyun's Widsith theme only once in her source ATK and EM snapshots", () => {
    const xiao = build("Xiao", "FavoniusLance")
    const xianyun = build("Xianyun", "TheWidsith")
    const action = getCombatActionDefinition("xiao.burst.bane_of_all_evil.high_plunge")!
    const sourceStats = (theme: string | undefined, activeEffectIds: string[] = []) => resolveScenarioSourceStatMaps({
      action, primary: xiao, teammates: [xianyun], activeEffectIds, buffs: [], enemyCount: 1, gameData: db,
      activeEffectSourceBuildIds: Object.fromEntries(activeEffectIds.map((id) => [id, xianyun.buildId])),
      fieldContext: { actionOwnerBuildId: xiao.buildId, onFieldBuildId: xiao.buildId,
        ...(theme === undefined ? {} : { weaponEffectChoices: { [xianyun.buildId]: { "the-widsith-theme": theme } } }) }
    })
    const baseAttack = db.getCharacterStat("Xianyun", "atk", 90, 6)! + db.getWeaponStat("TheWidsith", "atk", 90, 6)!
    const ascensionAttack = db.getCharacterAscensionBonus("Xianyun", "atk_", 6)!
    expect(sourceStats("none").sourceFinalAttackByBuildId.get(xianyun.buildId))
      .toBeCloseTo(baseAttack * (1 + ascensionAttack), 8)
    expect(sourceStats("recitative").sourceFinalAttackByBuildId.get(xianyun.buildId))
      .toBeCloseTo(baseAttack * (1 + ascensionAttack + 0.6), 8)
    expect(sourceStats("interlude").sourceFinalElementalMasteryByBuildId.get(xianyun.buildId)).toBe(240)
    expect(sourceStats(undefined, ["weapon.the-widsith.recitative.attack-percent"]).sourceFinalAttackByBuildId.get(xianyun.buildId))
      .toBeCloseTo(baseAttack * (1 + ascensionAttack + 0.6), 8)
    expect(sourceStats(undefined, ["weapon.the-widsith.interlude.elemental-mastery"]).sourceFinalElementalMasteryByBuildId.get(xianyun.buildId))
      .toBe(240)
  })

  it("adds and removes Prototype Amber's applicable teammate healing when that teammate changes weapon", () => {
    const diluc = build("Diluc", "TidalShadow")
    const lisa = build("Lisa", "FavoniusCodex")
    const amberLisa = { ...lisa, weapon: { ...lisa.weapon, weaponId: "PrototypeAmber" } }
    const input = scenario(diluc, "diluc.skill.searing_onslaught.first_hit", [lisa])
    const healedInput = { ...input, teammates: [amberLisa] }
    const tidal = (value: EvaluationScenario) => evaluateScenario(value, db).appliedEffects
      .filter((effect) => effect.id.startsWith("weapon.tidal-shadow."))
    expect(tidal(input)).toHaveLength(0)
    expect(tidal(healedInput)).toEqual([expect.objectContaining({ sourceId: diluc.buildId, value: 0.24 })])
    expect(tidal({ ...healedInput, teammates: [lisa] })).toHaveLength(0)
    // A teammate's equipment is not a performed-healing capability of the queried source.
    const providers = (recipient: CharacterBuild, provider: "source" | "party") => findCapabilityProviders({
      builds: [recipient, amberLisa], sourceBuildId: recipient.buildId, recipientBuildId: recipient.buildId,
      fieldContext: { actionOwnerBuildId: recipient.buildId, onFieldBuildId: recipient.buildId },
      activeEffectIds: [], gameData: db, requirement: { kind: "healing", provider, recipient: "source" }
    })
    expect(providers(diluc, "source")).toHaveLength(0)
    expect(providers(diluc, "party").map((entry) => entry.sourceBuildId)).toEqual([lisa.buildId])
    // Arlecchino may receive only her own kit's healing; Amber must not leak through that restriction.
    expect(providers(build("Arlecchino", "ProspectorsDrill"), "party")
      .some((entry) => entry.sourceBuildId === lisa.buildId)).toBe(false)
  })

  it("allows simultaneous multi-target Sacrificer's stacks without multiplying separated-hit consumers", () => {
    const mika = build("Mika", "SacrificersStaff")
    const input = scenario(mika, "mika.skill.star_frost_swirl.flowfrost_arrow")
    const withTargets = (enemyCount: number) => effects({ ...input, conditions: { ...input.conditions, enemyCount } })
    // One E cast in six seconds; only the explicit zero-interval consumer counts simultaneous targets.
    expect(withTargets(1)).toMatchObject({ attackPercent: 0.08, energyRecharge: 0.06 })
    expect(withTargets(3).attackPercent).toBeCloseTo(0.24)
    expect(withTargets(3).energyRecharge).toBeCloseTo(0.18)
    expect(withTargets(20).attackPercent).toBeCloseTo(0.24)
    const canPrepareThree = (minimumSeparationSeconds: number, enemyCount: number) => findCapabilityProviders({
      builds: [mika], sourceBuildId: mika.buildId, recipientBuildId: mika.buildId, enemyCount,
      fieldContext: { actionOwnerBuildId: mika.buildId, onFieldBuildId: mika.buildId },
      activeEffectIds: [], gameData: db, requirement: { kind: "damage_hit", provider: "source", recipient: "source",
        hitKinds: ["skill"], opportunityWindow: { seconds: 6, minimum: 3, measure: "hits", minimumSeparationSeconds } }
    }).length > 0
    expect(canPrepareThree(0, 1)).toBe(false)
    expect(canPrepareThree(0, 3)).toBe(true)
    expect(canPrepareThree(0.1, 20)).toBe(false)
    expect(canPrepareThree(0.3, 20)).toBe(false)
  })

  it("inverts Alley Flash's injury question without inverting the old ready/disabled IDs", () => {
    const input = scenario(build("Kaeya", "TheAlleyFlash"), "kaeya.skill.frostgnaw")
    const group = "the-alley-flash-ready"
    expect(describeWeaponChoices(input, db).choiceGroups.find((choice) => choice.id === group))
      .toMatchObject({ label: "最近 5 秒受到伤害", defaultVariant: "off" })
    expect(effects(input).damageBonus).toBeCloseTo(0.12)
    expect(effects(withChoice(input, group, "off")).damageBonus).toBeCloseTo(0.12)
    expect(effects(withChoice(input, group, "on")).damageBonus).toBe(0)
    const legacy = (id: string) => effects({ ...input, conditions: { ...input.conditions, activeEffectIds: [id] } })
    expect(legacy("weapon.the-alley-flash.damage-bonus-ready").damageBonus).toBeCloseTo(0.12)
    expect(legacy("weapon.the-alley-flash.damage-bonus-ready.disabled").damageBonus).toBe(0)
  })

  it("fixes Dehya's Beacon injury state while leaving other legal wearers' injury choice off", () => {
    const dehya = scenario(build("Dehya", "BeaconOfTheReedSea"), "dehya.burst.flame_manes_fist")
    const diluc = scenario(build("Diluc", "BeaconOfTheReedSea"), "diluc.skill.searing_onslaught.first_hit")
    const group = "beacon-damage-taken"
    expect(describeWeaponChoices(dehya, db).choiceGroups.some((choice) => choice.id === group)).toBe(false)
    expect(describeWeaponChoices(diluc, db).choiceGroups.find((choice) => choice.id === group))
      .toMatchObject({ defaultVariant: "off" })
    expect(effects(dehya).attackPercent).toBeCloseTo(0.4)
    expect(effects(withChoice(dehya, group, "off")).attackPercent).toBeCloseTo(0.4)
    expect(effects(diluc).attackPercent).toBeCloseTo(0.2)
    expect(effects(withChoice(diluc, group, "on")).attackPercent).toBeCloseTo(0.4)
    expect(effects(dehya).hpPercent).toBeCloseTo(0.32)
  })

  it.each([[1, 1], [1, 5], [5, 1]] as const)(
    "does not stack self and recipient Sweet Echoes with Mika R%s and Yaoyao R%s",
    (mikaRefinement, yaoyaoRefinement) => {
      const mika = build("Mika", "SymphonistOfScents", mikaRefinement)
      const yaoyao = build("Yaoyao", "SymphonistOfScents", yaoyaoRefinement)
      for (const input of [scenario(mika, "mika.skill.star_frost_swirl.flowfrost_arrow", [yaoyao]),
        scenario(yaoyao, "yaoyao.normal.auto.first_hit", [mika])]) {
        const result = effects(input)
        const sweet = result.appliedEffects.filter((effect) => effect.id.includes("symphonist-of-scents.sweet-echoes"))
        const expectedSweet = Math.max(mikaRefinement, yaoyaoRefinement) === 5 ? 0.64 : 0.32
        const personal = input.primary.weapon.refinement === 5 ? 0.24 : 0.12
        expect(sweet).toHaveLength(1)
        expect(sweet[0]?.value).toBeCloseTo(expectedSweet)
        expect(result.attackPercent).toBeCloseTo(personal + expectedSweet)
        if (mikaRefinement !== yaoyaoRefinement) {
          expect(sweet[0]?.sourceId).toBe(mikaRefinement > yaoyaoRefinement ? mika.buildId : yaoyao.buildId)
        }
      }
    }
  )

  it("feeds Engulfing's post-burst ER into both attack conversion and Emblem exactly once", () => {
    const primary = { ...structuredClone(xianglingNationalBuiltinBuild),
      weapon: { weaponId: "EngulfingLightning", level: 90, ascension: 6, refinement: 1 } }
    const input = scenario(primary, "xiangling.burst.pyronado.reverse_vaporize")
    const result = evaluateScenario(input, db)
    // Pinned Xiangling loadout: 226.928% before the prepared +30%, below Emblem's 300% cap.
    expect(result.stats.energyRecharge).toBeCloseTo(2.56928, 8)
    const emblem = result.appliedEffects.filter((effect) => effect.id === "artifact.emblem-of-severed-fate.4pc.burst-damage-bonus")
    expect(emblem).toHaveLength(1)
    expect(emblem[0]?.value).toBeCloseTo(0.64232, 8)
    expect(result.appliedEffects.find((effect) => effect.id === "weapon.engulfing-lightning.energy-recharge-to-attack")?.value)
      .toBeCloseTo(0.4393984, 8)
    const explicit = evaluateScenario({ ...input, conditions: { ...input.conditions,
      activeEffectIds: ["weapon.engulfing-lightning.post-burst-energy-recharge"] } }, db)
    expect(explicit.stats.energyRecharge).toBeCloseTo(2.56928, 8)
    expect(explicit.actionExpectedDamage).toBeCloseTo(result.actionExpectedDamage, 8)
  })

  it("uses Exaiphanes' resonance-five 90/6/R3 candidate and separates native weapon stats from artifact sources", () => {
    const primary: CharacterBuild = { ...build("Kaeya", "FavoniusSword"), artifacts: [
      { id: "audit.crit-circlet", slot: "circlet", setId: "GladiatorsFinale", rarity: 5, level: 20,
        mainStat: { stat: "crit_rate", value: 0.311 }, substats: [] },
      { id: "audit.crit-flower", slot: "flower", setId: "EmblemOfSeveredFate", rarity: 5, level: 20,
        mainStat: { stat: "hp", value: 4780 }, substats: [{ stat: "crit_rate", value: 0.0311 }] }
    ] }
    const input = scenario(primary, "kaeya.skill.frostgnaw")
    const comparison = analyzeWeaponComparison(input, db, "ExaiphanesBlade", 3).weapon
    expect(comparison).toMatchObject({ level: 90, refinement: 3, legalRefinements: [3] })
    expect(() => analyzeWeaponComparison(input, db, "ExaiphanesBlade", 5)).toThrow()
    const equipped = evaluateScenario({ ...input, primary: { ...primary,
      weapon: { weaponId: "ExaiphanesBlade", level: 90, ascension: 6, refinement: 3 } } }, db)
    expect(comparison.expectedDamage).toBeCloseTo(equipped.actionExpectedDamage, 8)
    expect(equipped.stats.critRate).toBeCloseTo(0.05 + 0.330768 + 0.311 + 0.0311, 8)
    const sources = equipped.stats.statContributions
    expect(sources.find((source) => source.stage === "baseAttack" && source.label === "武器基础攻击 · 星锋剑")?.value)
      .toBeCloseTo(db.getWeaponStat("ExaiphanesBlade", "atk", 90, 6)!, 7)
    expect(sources.filter((source) => source.stage === "critRate")).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "武器副属性 · 暴击率", value: 0.330768 }),
      expect.objectContaining({ label: "理之冠主词条 · 暴击率", value: 0.311 }),
      expect.objectContaining({ label: "生之花副词条 · 暴击率", value: 0.0311 })
    ]))
    expect(equipped.appliedEffects.some((effect) => effect.id.startsWith("weapon.exaiphanes-blade."))).toBe(false)
  })
})
