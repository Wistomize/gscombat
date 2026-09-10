import { getCombatAction, raidenNationalBuiltinBuild, raidenNationalBuiltinScenario, type CombatActionEffect } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"
import { evaluateScenario } from "../../src/scenario/evaluate.js"
import { resolveCombatActionEffectsForCandidates } from "../../src/effects/action-effects.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => gameData.close())
const weapons: Record<string, string> = {
  Wanderer: "ApprenticesNotes", Escoffier: "BeginnersProtector", YunJin: "BeginnersProtector",
  Shenhe: "BeginnersProtector", KamisatoAyato: "DullBlade", Skirk: "DullBlade", Ifa: "ApprenticesNotes",
  Kinich: "WasterGreatsword", Yoimiya: "HuntersBow", Kachina: "BeginnersProtector", Xilonen: "DullBlade",
  Illuga: "BeginnersProtector"
}
function build(characterId: string, constellation = 6): CharacterBuild {
  return { ...raidenNationalBuiltinBuild, artifacts: [], buildId: `event-audit.${characterId}`, characterId,
    constellation, talents: { normal: 10, skill: 10, burst: 10 },
    weapon: { ascension: 6, level: 90, refinement: 1, weaponId: weapons[characterId]! } }
}
function run(characterId: string, action: string, support?: string, constellation = 6) {
  return evaluateScenario({ ...raidenNationalBuiltinScenario, primary: build(characterId, constellation),
    teammates: support ? [build(support, 0)] : [], targetActionId: action, externalBuffs: [],
    conditions: { activeEffectIds: [], equipmentEffectMode: "maximum_reachable", enemyCount: 1 } }, gameData)
}

describe("real event base-damage eligibility", () => {
  it("applies Illuga's Geo base addition once to Kachina's actual C6 hit, never to its proxy", () => {
    const action = "kachina.constellation.6.this_time_ive_gotta_win.shield_destroyed.geo_damage"
    const s = { ...raidenNationalBuiltinScenario, primary: build("Kachina"),
      teammates: [{ ...build("Illuga", 0), weapon: {
        weaponId: "DragonsBane", level: 90, ascension: 6, refinement: 1
      } }], targetActionId: action, externalBuffs: [],
      conditions: { activeEffectIds: [], equipmentEffectMode: "maximum_reachable" as const, enemyCount: 1 } }
    const result = evaluateScenario(s, gameData)
    expect(result.rotation.events.map((event) => ({ id: event.id, damage: event.expectedDamage }))).toHaveLength(1)
    const hit = result.rotation.events[0]!
    const base = hit.trace.find((entry) => entry.kind === "scaling")
    expect(base).toMatchObject({ kind: "scaling", coefficient: 2 })
    expect(base && "flatDamage" in base ? base.flatDamage : 0).toBeGreaterThan(0)
    const baseDefense = gameData.getCharacterStat("Kachina", "def", 90, 6)!
    expect(base?.kind === "scaling" ? base.value : undefined).toBeCloseTo(baseDefense * 1.2)
    expect(hit.appliedEffectIds).toContain("kachina.constellation.4.more_foes_more_caution.four_enemies.defense_percent")
    expect(result.actionExpectedDamage).toBeCloseTo(hit.expectedDamage)
    expect(() => evaluateScenario({ ...s, primary: build("Kachina", 5) }, gameData)).toThrow(/requires source constellation 6/)
  })

  it.each([[false, false, 3.2], [true, false, 6.4], [true, true, 3.2]] as const)(
    "keeps one real Kinich bounce and the qualified stack: triple=%s manualOne=%s", (triple, manualOne, coefficient) => {
      const result = evaluateScenario({ ...raidenNationalBuiltinScenario, primary: build("Kinich"),
        teammates: triple ? [build("Kachina", 0), build("Xilonen", 0)] : [],
        targetActionId: "kinich.skill.scalespiker_cannon.single_hit", externalBuffs: [],
        conditions: { equipmentEffectMode: "maximum_reachable", enemyCount: 1, activeEffectIds: [
          `kinich.passive.flame_spirit_pact.hunters_experience.${manualOne ? "one_stack" : "two_stacks"}.attack_additive_damage`
        ] } }, gameData)
      expect(result.rotation.events).toHaveLength(2)
      const crit = result.rotation.events.map((event) => event.trace.find((entry) => entry.kind === "expected_crit"))
      expect(crit[1]).toMatchObject({ critDamage: crit[0]?.kind === "expected_crit" ? crit[0].critDamage : NaN })
      for (const event of result.rotation.events) {
        const scaling = event.trace.find((entry) => entry.kind === "scaling_terms")
        expect(scaling?.kind === "scaling_terms" ? scaling.terms.at(-1)?.coefficient : undefined).toBe(coefficient)
      }
    })

  it.each(["valid", "condition", "constellation", "source", "cycle"])("checks dependency qualification: %s", (mode) => {
    const primary = build("Kinich", 0)
    const parent: CombatActionEffect = {
      activation: "active", id: "test.parent", label: "parent", target: "attackPercent", value: { kind: "fixed", value: 0.1 },
      source: { kind: "character", characterId: mode === "source" ? "Skirk" : "Kinich",
        ...(mode === "constellation" ? { minimumSourceConstellation: 6 } : {}) },
      ...(mode === "condition" ? { condition: { kind: "team_element_count", elements: ["pyro"], minimum: 2 } } : {}),
      ...(mode === "cycle" ? { requiredActiveEffectIds: ["test.child"] } : {})
    }
    const child: CombatActionEffect = { activation: "active", id: "test.child", label: "child", target: "damageBonus",
      source: { kind: "character", characterId: "Kinich" }, requiredActiveEffectIds: [parent.id], value: { kind: "fixed", value: 0.5 } }
    const evaluate = () => resolveCombatActionEffectsForCandidates({ action: getCombatAction("kinich.skill.scalespiker_cannon.single_hit")!,
      activeEffectIds: [parent.id, child.id], baseEnergyRecharge: 1, primary, teammates: [], teamElements: ["dendro"] }, [parent, child])
    if (mode === "source" || mode === "constellation") expect(evaluate).toThrow()
    else expect(evaluate().damageBonus).toBe(mode === "valid" ? 0.5 : 0)
  })

  it("inherits only reviewed parent-state effects for character additions", () => {
    const result = run("Skirk", "skirk.skill.seven_phase_flash.normal.fifth_hit")
    const attacks = result.rotation.events.map((event) => {
      const scaling = event.trace.find((entry) => entry.kind === "scaling")
      return scaling?.kind === "scaling" ? scaling.value : undefined
    })
    expect(attacks).toHaveLength(4)
    expect(attacks.slice(1)).toEqual([attacks[0], attacks[0], attacks[0]])
  })

  it("weights Ifa and Yoimiya per-hit additions by their 50% trigger probability", () => {
    const ifaAction = "ifa.skill.airborne_disease_prevention.supporting_fire.held_remedy_bullet"
    const plain = run("Ifa", ifaAction), buffed = run("Ifa", ifaAction, "YunJin")
    const mainDelta = buffed.rotation.events[0]!.expectedDamage - plain.rotation.events[0]!.expectedDamage
    const extraDelta = buffed.rotation.events[1]!.expectedDamage - plain.rotation.events[1]!.expectedDamage
    expect(extraDelta).toBeCloseTo(mainDelta * 0.5, 8)
    const yoimiya = run("Yoimiya", "yoimiya.constellation.6.naganohara_meteor_swarm.fifth_hit.expected_blazing_arrow.no_reaction", "YunJin")
    expect(yoimiya.rotation.events[0]!.trace.at(-1)).toMatchObject({ kind: "trigger_probability", probability: 0.5 })
  })

  it("does not manufacture a C6 hit for a low-constellation Wanderer with Yun Jin", () => {
    const result = run("Wanderer", "wanderer.skill.hanega_song_of_the_wind.windfavored.normal.first_hit", "YunJin", 0)
    expect(result.rotation.events).toHaveLength(1)
    expect(result.rotation.events[0]!.expectedDamage).toBeGreaterThan(0)
  })

  it.each([
    ["KamisatoAyato", "kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit", "YunJin", 3],
    ["Skirk", "skirk.skill.seven_phase_flash.normal.fifth_hit", "YunJin", 4],
    ["Skirk", "skirk.burst.havoc_ruin.slash", "Shenhe", 4],
    ["Escoffier", "escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits", "Shenhe", 6],
    ["Ifa", "ifa.skill.airborne_disease_prevention.supporting_fire.held_remedy_bullet", "YunJin", 2]
  ] as const)("assembles qualified per-hit flat additions for %s %s", (character, action, support, eventCount) => {
    const result = run(character, action, support)
    expect(result.rotation.events).toHaveLength(eventCount)
    for (const event of result.rotation.events) {
      const flat = event.trace.find((entry) => entry.kind === "scaling" || entry.kind === "scaling_terms")
      expect(flat, event.id).toBeDefined()
      expect(flat && "flatDamage" in flat ? flat.flatDamage : 0, event.id).toBeGreaterThan(0)
    }
    expect(result.rotation.dpr).toBeCloseTo(
      result.rotation.events.reduce((sum, event) => sum + event.expectedDamage, 0), 8)
  })
})
