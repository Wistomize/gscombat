import { afterAll, expect, it } from "vitest"
import { artifactComparisonGroups, raidenNationalBuiltinScenario } from "@gscombat/content"
import { artifactCritConversion, criticalSampleKey } from "../../../src/analysis/artifact-crit-conversion.js"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { withArtifactSetCounts, countArtifactSet } from "../../../src/core/artifact-stats.js"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"
import { EquipmentComparisonSession } from "../../../src/analysis/equipment-session.js"
import { rankArtifactLoadouts } from "../../../src/analysis/artifact-comparison.js"
import { AnalysisPreparation } from "../../../src/core/analysis-preparation.js"
import { resolveBaseCombatStats } from "../../../src/core/base-stats.js"
import { prepareArtifactLoadout, evaluateArtifactLoadout } from "../../../src/analysis/artifact-comparison.js"
import { artifactMainStatVariants } from "../../../src/analysis/artifact-main-stat-variants.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())

it("selects the maximum of all four-star main-stat assignments and reuses raw variants without mutating substats", () => {
  const scene = structuredClone(raidenNationalBuiltinScenario)
  const before = JSON.stringify(scene)
  const session = new EquipmentComparisonSession(scene, db)
  const manualValues: Record<string, number> = { hp: 3571, atk: 232, energy_recharge: 0.387,
    electro_damage_bonus: 0.348, crit_rate: 0.232 }
  for (const [id, count, expectedVariants] of [["four:Instructor", 4, 5], ["two:defense", 2, 10]] as const) {
    const candidate = session.artifactCandidates.find(row => row.id === id)!
    const variants = artifactMainStatVariants(scene.primary, candidate.counts, db, session.preparation)
    expect(variants).toHaveLength(expectedVariants)
    expect(artifactMainStatVariants(scene.primary, candidate.counts, db, session.preparation)).toBe(variants)
    const references = []
    for (let mask = 0; mask < 32; mask++) {
      if (mask.toString(2).replaceAll("0", "").length !== count) continue
      const artifacts = scene.primary.artifacts.map((piece, i) => mask & (1 << i)
        ? { ...piece, mainStat: { ...piece.mainStat, value: manualValues[piece.mainStat.stat]! } } : piece)
      expect(artifacts.every(piece => Number.isFinite(piece.mainStat.value))).toBe(true)
      references.push(evaluateScenario(prepareArtifactLoadout({ ...scene, primary: { ...scene.primary, artifacts } }, candidate), db).actionExpectedDamage)
    }
    const result = session.artifact(id)
    expect(result.expectedDamage).toBeCloseTo(Math.max(...references), 8)
    expect(result.fourStarSlots).toHaveLength(count)
    const winner = variants.find(variant => variant.fourStarSlots.join() === result.fourStarSlots.join())!
    expect(evaluateScenario(prepareArtifactLoadout({ ...scene, primary: winner.build }, candidate), db).actionExpectedDamage)
      .toBeCloseTo(result.expectedDamage, 8)
    for (const variant of variants) {
      variant.build.artifacts.forEach((piece, i) => expect(piece.substats).toBe(scene.primary.artifacts[i]!.substats))
    }
  }
  const allFour = artifactMainStatVariants(scene.primary, { Instructor: 2, TheExile: 2 }, db, session.preparation)
  expect(allFour).toBe(artifactMainStatVariants(scene.primary, { Instructor: 4 }, db, session.preparation))
  const empty = { ...scene.primary, artifacts: [] }
  expect(artifactMainStatVariants(empty, { Instructor: 4 }, db, session.preparation)).toHaveLength(1)
  expect(artifactMainStatVariants(empty, { Instructor: 4 }, db, session.preparation)[0]!.build.artifacts).toEqual([])
  expect(session.artifact("four:EmblemOfSeveredFate").fourStarSlots).toEqual([])
  expect(session.counts.baseline).toBe(1)
  expect(JSON.stringify(scene)).toBe(before)
})

it("evaluates four-piece and 2+2 overrides exactly like actual gear while leaving raw gear and caller untouched", () => {
  const scenario = structuredClone(raidenNationalBuiltinScenario)
  const before = JSON.stringify(scenario)
  const session = new EquipmentComparisonSession(scenario, db)
  for (const counts of [{ NoblesseOblige: 4 }, { GladiatorsFinale: 2, ShimenawasReminiscence: 2 }]) {
    const override = withArtifactSetCounts(scenario.primary, counts)
    const ids = Object.entries(counts).flatMap(([id, count]) => Array.from({ length: count }, () => id))
    const actual = { ...scenario.primary, artifacts: scenario.primary.artifacts.map((piece, i) => ({ ...piece, setId: ids[i] ?? "none" })) }
    expect(evaluateScenario({ ...scenario, primary: override }, db).actionExpectedDamage)
      .toBeCloseTo(evaluateScenario({ ...scenario, primary: actual }, db).actionExpectedDamage, 8)
    expect(override.artifacts).toBe(scenario.primary.artifacts)
    expect(JSON.stringify(override)).toBe(JSON.stringify(scenario.primary))
    expect(countArtifactSet({ ...override }, "EmblemOfSeveredFate")).toBe(0)
  }
  const same = session.artifact("four:EmblemOfSeveredFate")
  expect(same.gainRatio).toBeCloseTo(0, 10)
  expect(session.counts.baseline).toBe(1)
  expect(session.counts.artifacts).toBe(1)
  expect(JSON.stringify(scenario)).toBe(before)
  const attackPair = session.artifactCandidates.filter(row => row.kind === "two_plus_two" && row.combinations.some(pair =>
    pair.includes("GladiatorsFinale") && pair.includes("ShimenawasReminiscence")))
  expect(attackPair).toHaveLength(1)
  expect(attackPair[0]!.combinations.every(pair => pair[0] !== pair[1])).toBe(true)
  expect(session.artifactCandidates.filter(row => row.kind === "two_plus_two").map(row => row.id))
    .toEqual(artifactComparisonGroups.map(group => `two:${group.id}`))
  expect(session.artifactCandidates.filter(row => row.kind === "two_plus_two").every(row => row.combinations.length === 1)).toBe(true)
})

it("converts only new event-local overflow and leaves other owners unchanged", () => {
  for (const [before, after, expected] of [[1.05, 1.15, 0.1], [0.9, 1.1, 0.1], [1.15, 1.1, 0]]) {
    const sample = { eventId: "hit", ownerId: "primary", critRate: before!, critDamage: 2,
      appliedEffectIds: ["artifact.blizzard-strayer.4pc.cryo-aura.crit-rate"] }
    const conversions: Parameters<typeof artifactCritConversion>[3] = []
    const transform = artifactCritConversion("primary", "BlizzardStrayer", new Map([[criticalSampleKey(sample), sample]]), conversions)
    expect(transform({ ...sample, critRate: after! }).critDamage).toBeCloseTo(2 + expected! * 2, 10)
    expect(transform({ ...sample, ownerId: "teammate", critRate: after! }).critDamage).toBe(2)
    expect(transform({ ...sample, appliedEffectIds: [], critRate: after! }).critDamage).toBe(2)
    expect(conversions).toHaveLength(expected! > 0 ? 1 : 0)
  }
})

it("applies theoretical conversion through actual damage calculation without changing baseline, weapons or 2+2", () => {
  for (const desiredRate of [0.9, 1.05]) {
    const scene = structuredClone(raidenNationalBuiltinScenario)
    scene.teammates = [{ ...scene.teammates[0]!, buildId: "cryo", characterId: "Diona",
      weapon: { weaponId: "FavoniusWarbow", level: 90, ascension: 6, refinement: 1 } }]
    scene.conditions = { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" }
    let actualRate = 0
    evaluateScenario(scene, db, { transformCriticalStats: sample => { actualRate = sample.critRate; return sample } })
    scene.primary.artifacts[0]!.substats.find(stat => stat.stat === "crit_rate")!.value += desiredRate - actualRate
    const before = JSON.stringify(scene)
    const session = new EquipmentComparisonSession(scene, db)
    const candidate = session.artifactCandidates.find(row => row.id === "four:BlizzardStrayer")!
    const result = session.artifact(candidate.id)
    const delta = Math.max(0, desiredRate + 0.2 - 1) - Math.max(0, desiredRate - 1)
    expect(result.critConversions[0]?.critRateConverted).toBeCloseTo(delta, 10)
    const reference = evaluateScenario(prepareArtifactLoadout(scene, candidate), db,
      { artifactStatDeltas: { crit_rate: -delta, crit_damage: 2 * delta } })
    expect(result.expectedDamage).toBeCloseTo(reference.actionExpectedDamage, 8)
    expect(session.evaluation.actionExpectedDamage).toBe(evaluateScenario(scene, db).actionExpectedDamage)
    expect(session.artifact("two:attack").critConversions).toEqual([])
    const same = new EquipmentComparisonSession(prepareArtifactLoadout(scene, candidate), db)
    expect(same.artifact(candidate.id).critConversions).toEqual([])
    expect(same.artifact(candidate.id).gainRatio).toBeCloseTo(0, 10)
    const inactive = new EquipmentComparisonSession({ ...scene, teammates: [] }, db)
    expect(inactive.artifact(candidate.id).critConversions).toEqual([])
    expect(JSON.stringify(scene)).toBe(before)
  }
})

it("retains every improvement and exactly two lower tiers including all ties", () => {
  expect(rankArtifactLoadouts([120, 110, 100, 99, 99, 98, 97].map(expectedDamage => ({ expectedDamage })), 100)
    .map(row => row.expectedDamage)).toEqual([120, 110, 99, 99, 98])
  expect(rankArtifactLoadouts([{ expectedDamage: 0 }, { expectedDamage: 1 }], 0)).toEqual([{ expectedDamage: 1 }])
  expect(rankArtifactLoadouts([{ expectedDamage: 100 + 1e-10 }, { expectedDamage: 99 }], 100)).toEqual([{ expectedDamage: 99 }])
})

it("shares raw stats but invalidates set-derived healing and handles missing pieces without adding stats", () => {
  const build = { ...raidenNationalBuiltinScenario.primary, artifacts: [] }
  const preparation = new AnalysisPreparation(db)
  const base = preparation.baseStats(build, "electro", db)
  const candidate = withArtifactSetCounts(build, { MaidenBeloved: 2, OceanHuedClam: 2 })
  const warm = preparation.baseStats(candidate, "electro", db)
  expect(warm).toEqual(resolveBaseCombatStats(candidate, db, "electro"))
  expect(warm.healingBonus - base.healingBonus).toBeCloseTo(0.3, 8)
  expect(warm.attack).toBe(base.attack)
  expect(candidate.artifacts).toEqual([])
})

it("retains a teammate Noblesse source after primary swaps away", () => {
  const scene = structuredClone(raidenNationalBuiltinScenario)
  scene.primary.artifacts = scene.primary.artifacts.map(piece => ({ ...piece, setId: "NoblesseOblige" }))
  const teammate = scene.teammates[0]!
  teammate.artifacts = teammate.artifacts.map(piece => ({ ...piece, setId: "NoblesseOblige" }))
  const id = "artifact.noblesse-oblige.4pc-attack"
  scene.conditions.activeEffectIds = [...scene.conditions.activeEffectIds.filter(value => value !== id), id]
  scene.conditions.activeEffectSourceBuildIds = { [id]: scene.primary.buildId }
  const session = new EquipmentComparisonSession(scene, db)
  const candidate = session.artifactCandidates.find(row => row.id === "four:EmblemOfSeveredFate")!
  const swapped = prepareArtifactLoadout(scene, candidate)
  expect(swapped.conditions.activeEffectSourceBuildIds?.[id]).toBe(teammate.buildId)
  expect(evaluateScenario(swapped, db).appliedEffects.filter(effect => effect.id === id)).toHaveLength(1)
})

it("matches isolated and prepared evaluation for lunar and all-member stellar contributions", () => {
  const build = (characterId: string, weaponId: string) => ({ ...structuredClone(raidenNationalBuiltinScenario.primary),
    buildId: `comparison.${characterId}`, characterId, constellation: 6,
    weapon: { weaponId, level: 90, ascension: 6, refinement: 1 } })
  const scenes = [
    { ...structuredClone(raidenNationalBuiltinScenario), primary: build("Flins", "FavoniusLance"),
      teammates: [build("Xingqiu", "FavoniusSword")], externalBuffs: [],
      conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" as const },
      targetActionId: "flins.burst.thunder_symphony.lunar_charged" },
    { ...structuredClone(raidenNationalBuiltinScenario), primary: build("YumemizukiMizuki", "FavoniusCodex"),
      teammates: [build("Odette", "FavoniusSword"), build("Faruzan", "FavoniusWarbow"), build("Diona", "FavoniusWarbow")], externalBuffs: [],
      conditions: { activeEffectIds: [], enemyCount: 1, equipmentEffectMode: "maximum_reachable" as const },
      targetActionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl" }
  ]
  for (const scene of scenes) {
    const session = new EquipmentComparisonSession(scene, db)
    for (const id of ["four:Instructor", "four:GildedDreams", "four:ViridescentVenerer"]) {
      const candidate = session.artifactCandidates.find(row => row.id === id)!
      expect(session.artifact(id)).toEqual(evaluateArtifactLoadout(scene, db, candidate, session.evaluation.actionExpectedDamage))
      const reference = artifactMainStatVariants(scene.primary, candidate.counts, db, new AnalysisPreparation(db))
        .map(variant => evaluateScenario(prepareArtifactLoadout({ ...scene, primary: variant.build }, candidate), db).actionExpectedDamage)
      expect(session.artifact(id).expectedDamage).toBe(Math.max(...reference))
    }
    if (scene.primary.characterId === "YumemizukiMizuki") {
      scene.primary.artifacts[0]!.substats.find(stat => stat.stat === "crit_rate")!.value += 1
      const highCrit = new EquipmentComparisonSession(scene, db)
      const candidate = highCrit.artifactCandidates.find(row => row.id === "four:BlizzardStrayer")!
      const changed = highCrit.artifact(candidate.id)
      const owners = new Set<string>()
      const reference = evaluateScenario(prepareArtifactLoadout(scene, candidate), db, {
        transformCriticalStats: sample => {
          owners.add(sample.ownerId)
          return sample.ownerId === scene.primary.buildId
            ? { critRate: sample.critRate - 0.2, critDamage: sample.critDamage + 0.4 } : sample
        }
      })
      expect(owners.size).toBe(4)
      expect(changed.critConversions.length).toBeGreaterThan(0)
      expect(changed.critConversions.every(row => row.ownerId === scene.primary.buildId)).toBe(true)
      expect(changed.expectedDamage).toBeCloseTo(reference.actionExpectedDamage, 8)
    }
  }
})

it("runs the maintained candidate pool without hidden unsupported results", () => {
  const session = new EquipmentComparisonSession(structuredClone(raidenNationalBuiltinScenario), db)
  const failures: string[] = []
  for (const candidate of session.artifactCandidates) {
    try { expect(Number.isFinite(session.artifact(candidate.id).expectedDamage)).toBe(true) }
    catch (error) { failures.push(`${candidate.id}: ${String(error)}`) }
  }
  expect(failures).toEqual([])
  expect(session.counts.artifacts).toBe(session.artifactCandidates.length)
}, 60000)
