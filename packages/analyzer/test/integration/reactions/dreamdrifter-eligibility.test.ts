import { raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, describe, expect, it } from "vitest"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"
import { resolveCoreCombatStats } from "../../../src/core/base-stats.js"

const gameData = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => gameData.close())
function build(characterId: string, constellation: number): CharacterBuild {
  return { ...raidenNationalBuiltinBuild, buildId: `dream.${characterId}`, characterId, constellation, artifacts: [],
    talents: { normal: 10, skill: 10, burst: 10 }, weapon: { ascension: 6, level: 90, refinement: 1,
      weaponId: ["Fischl", "Diona"].includes(characterId) ? "HuntersBow" : characterId === "Odette" ? "DullBlade" : "ApprenticesNotes" } }
}
function run(primary: CharacterBuild, targetActionId: string, teammates: CharacterBuild[], actionParameters: Record<string, number> = {}) {
  return evaluateScenario({ ...raidenNationalBuiltinScenario, primary, targetActionId, teammates,
    externalBuffs: [], conditions: { activeEffectIds: [], actionParameters, equipmentEffectMode: "maximum_reachable", enemyCount: 1 } }, gameData)
}
describe("Dreamdrifter fixed-scene eligibility", () => {
  it("evaluates manually selected Cryo Vortex levels without C1 trigger damage or unrelated contributors", () => {
    const primary = build("YumemizukiMizuki", 6)
    const teammates = [build("Diona", 0), build("Fischl", 0), build("Sucrose", 0)]
    const id = "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl_vortex"
    const results = [1, 2, 3, 4, 5, 6].map((level) => run(primary, id, teammates, { vortex_level: level }))
    expect(results.map((result) => result.rotation.events.length)).toEqual([1, 1, 1, 1, 1, 1])
    for (const [index, result] of results.entries()) {
      const event = result.rotation.events[0]!
      expect(event.element).toBe("cryo")
      const trace = event.trace.find((entry) => entry.kind === "stellar_swirl_participant_aggregation")
      if (!trace || trace.kind !== "stellar_swirl_participant_aggregation") throw new Error("Missing Vortex trace")
      expect(trace.vortexLevel).toBe(index + 1)
      expect(trace.reactionCoefficient).toBe(index < 2 ? 2 : 3)
      expect(trace.participants.map((participant) => participant.participantId)).toEqual([primary.buildId, "dream.Diona", "dream.Sucrose"])
      expect(result.appliedEffects.some((effect) => effect.id.includes("awaiting_stellar_swirl"))).toBe(false)
      for (const participant of trace.participants) {
        expect(participant.trace.find((entry) => entry.stage === "flat_damage_addition"))
          .toMatchObject({ formula: { flatDamageAddition: 0 } })
      }
      const ice = trace.participants.find((participant) => participant.participantId === "dream.Diona")!
      expect(ice.expectedContribution).toBeCloseTo(ice.expectedDamage * 0.6)
    }
    expect(results[1]!.result.expectedDamage).toBeCloseTo(results[0]!.result.expectedDamage)
    expect(results[2]!.result.expectedDamage / results[1]!.result.expectedDamage).toBeCloseTo(1.5)
    expect(run(primary, id, teammates).result.expectedDamage).toBeCloseTo(results[5]!.result.expectedDamage)
    for (const level of [0, 7, 2.5]) expect(() => run(primary, id, teammates, { vortex_level: level })).toThrow()
  })
  it.each([0, 1, 6])("separates direct hits and actual reaction contributions at C%s", (constellation) => {
    const primary = build("YumemizukiMizuki", constellation)
    const teammates = [build("Diona", 0), build("Fischl", 0), build("Sucrose", 0)]
    const directId = "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.radiance_stellar_swirl_combo"
    const reactionId = "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl"
    const direct = run(primary, directId, teammates)
    const reaction = run(primary, reactionId, teammates)
    expect(direct.rotation.events).toHaveLength(constellation >= 1 ? 2 : 1)
    for (const event of direct.rotation.events) {
      expect(event.trace.some((entry) => entry.kind === "stellar_swirl_participant_aggregation")).toBe(false)
      expect(event.trace.find((entry) => entry.kind === "special_reaction" && entry.stage === "flat_damage_addition"))
        .toMatchObject({ formula: { flatDamageAddition: 0 } })
    }
    if (constellation >= 1) {
      expect(direct.rotation.events[1]!.expectedDamage / direct.rotation.events[0]!.expectedDamage).toBeCloseTo(0.4)
    }
    expect(direct.result.expectedDamage).toBeCloseTo(direct.rotation.events.reduce((sum, event) => sum + event.expectedDamage, 0))
    expect(reaction.rotation.events).toHaveLength(1)
    const aggregate = reaction.rotation.events[0]!.trace.find((entry) => entry.kind === "stellar_swirl_participant_aggregation")
    if (!aggregate || aggregate.kind !== "stellar_swirl_participant_aggregation") throw new Error("Missing reaction aggregation")
    expect(aggregate.reactionCoefficient).toBe(0.75)
    expect(aggregate.participants.map((participant) => participant.participantId)).toEqual([primary.buildId, "dream.Diona"])
    for (const participant of aggregate.participants) {
      const isOwner = participant.participantId === primary.buildId
      expect(participant.trace.find((entry) => entry.stage === "flat_damage_addition"))
        .toMatchObject({ formula: { flatDamageAddition: isOwner && constellation >= 1 ? reaction.stats.elementalMastery * 5.5 : 0 } })
      expect(participant.appliedEffectIds).toContain("yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.dreamdrifter.party_stellar_swirl.damage_bonus")
      expect(participant.appliedEffectIds).toContain("yumemizuki_mizuki.locked_passive.revelation.dreamdrifter.party_elemental_mastery")
      if (constellation === 6) {
        expect(participant.appliedEffectIds).toContain("yumemizuki_mizuki.constellation.6.dreamdrifter.party_stellar_swirl.crit_rate")
      }
    }
    expect(reaction.stats.critRate).toBeCloseTo(direct.stats.critRate)
    expect(reaction.stats.critDamage).toBeCloseTo(direct.stats.critDamage)
  })
  it.each([0, 1, 6])("adds C1 to the ordinary reaction post-flat stage at C%s", (constellation) => {
    const result = run(build("YumemizukiMizuki", constellation),
      "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_pyro_swirl", [build("Fischl", 0)])
    const reaction = result.rotation.events[0]!.trace.find((entry) => entry.kind === "transformative_reaction")
    expect(reaction).toMatchObject({ flatDamageAddition: constellation >= 1 ? result.stats.elementalMastery * 11 : 0 })
    expect(result.rotation.events).toHaveLength(1)
  })
  it("blocks mutually exclusive on-field Coda, but retains Dreamdrifter buffs on background coordinated damage", () => {
    const mizuki = build("YumemizukiMizuki", 6), odette = build("Odette", 6)
    const front = run(odette, "odette.skill.adagio_coda_at_dawn.final_hit.stellar_swirl", [mizuki])
    const back = run(odette, "odette.constellation.4.snow_swan_dream.coordinated_attack.stellar_swirl", [mizuki])
    const related = (result: typeof front) => result.appliedEffects.filter((effect) => effect.id.startsWith("yumemizuki_mizuki."))
    expect(related(front)).toEqual([])
    expect(related(back).map((effect) => effect.target)).toEqual(expect.arrayContaining([
      "elementalMastery", "specialReactionDamageBonus", "enemyResistanceReduction", "critRate", "critDamage"
    ]))
  })
  it("does not assume unreviewed actions can overlap a teammate's required on-field state", () => {
    const result = run(build("Wriothesley", 6), "wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable", [build("YumemizukiMizuki", 6)])
    expect(result.appliedEffects.filter((effect) => effect.id.startsWith("yumemizuki_mizuki."))).toEqual([])
  })
  it("does not leak Dreamdrifter through an off-field source's mastery-to-attack weapon conversion", () => {
    const mizuki: CharacterBuild = { ...build("YumemizukiMizuki", 6),
      weapon: { weaponId: "WanderingEvenstar", level: 90, ascension: 6, refinement: 1 } }
    const odette: CharacterBuild = { ...build("Odette", 6),
      weapon: { weaponId: "DullBlade", level: 90, ascension: 6, refinement: 1 } }
    const result = run(odette, "odette.skill.adagio_coda_at_dawn.final_hit.stellar_swirl", [mizuki])
    const share = result.appliedEffects.find((effect) => effect.id === "weapon.wandering-evenstar.after-10s.other-party.source-em-to-flat-attack")
    expect(share).toBeDefined()
    expect(share!.value).toBeCloseTo(resolveCoreCombatStats(mizuki, gameData).elementalMastery * 0.24 * 0.3)
  })
})
