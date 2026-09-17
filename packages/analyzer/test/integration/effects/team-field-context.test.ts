import { getCombatActionDefinition, raidenNationalBuiltinBuild, raidenNationalBuiltinScenario } from "@gscombat/content"
import type { CharacterBuild, EvaluationScenario } from "@gscombat/contracts"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, expect, it } from "vitest"
import { evaluateScenario } from "../../../src/scenario/evaluate.js"
import { resolveScenarioActionEffectContext } from "../../../src/evaluators/shared.js"
import { resolveFieldContext } from "../../../src/core/field-presence.js"

const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
afterAll(() => db.close())
const build = (characterId: string, weaponId: string): CharacterBuild => ({
  ...structuredClone(raidenNationalBuiltinBuild), characterId, buildId: `team-field.${characterId}`,
  constellation: 6, artifacts: [], talents: { normal: 10, skill: 10, burst: 10 },
  weapon: { weaponId, refinement: 1, level: 90, ascension: 6 }
})
const dionaEm = "diona.constellation.6.cat_tail_closing_time.high_hp.elemental_mastery"
const mizukiShare = "yumemizuki_mizuki.locked_passive.revelation.dreamdrifter.party_elemental_mastery"
const primary = build("YumemizukiMizuki", "FavoniusCodex")
const teammates = [build("Odette", "FavoniusSword"), build("Faruzan", "FavoniusWarbow"), build("Diona", "FavoniusWarbow")]
const scenario: EvaluationScenario = {
  ...raidenNationalBuiltinScenario, primary, teammates, externalBuffs: [],
  targetActionId: "yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_stellar_swirl",
  conditions: { enemyCount: 1, equipmentEffectMode: "maximum_reachable", activeEffectIds: [dionaEm] }
}

it("keeps all four contributors but only grants Diona EM directly to the actual on-field Mizuki", () => {
  const original = structuredClone(scenario)
  const baseline = evaluateScenario({ ...scenario, conditions: { ...scenario.conditions, activeEffectIds: [] } }, db)
  const result = evaluateScenario(scenario, db)
  const trace = result.rotation.events[0]!.trace.find((entry) => entry.kind === "stellar_swirl_participant_aggregation")!
  if (trace.kind !== "stellar_swirl_participant_aggregation") throw new Error("Missing reaction trace")
  expect(trace.participants.map((participant) => participant.participantId)).toEqual([primary, ...teammates].map((b) => b.buildId))
  expect(result.stats.elementalMastery - baseline.stats.elementalMastery).toBeCloseTo(220)
  const share = result.appliedEffects.find((effect) => effect.id === mizukiShare)!.value
  for (const participant of trace.participants) {
    expect(participant.appliedEffectIds.includes(dionaEm)).toBe(participant.participantId === primary.buildId)
    expect(participant.appliedEffectIds).toContain(mizukiShare)
    const masteryStage = participant.trace.find((entry) => entry.stage === "reaction_damage_bonus")!
    if (!("elementalMastery" in masteryStage.formula)) throw new Error("Missing mastery formula")
    if (participant.participantId !== primary.buildId) expect(masteryStage.formula.elementalMastery).toBeCloseTo(share)
  }
  expect(trace.participants.reduce((sum, participant) => sum + participant.expectedContribution, 0)).toBeCloseTo(result.actionExpectedDamage)
  expect(evaluateScenario({ ...scenario, conditions: { ...scenario.conditions, onFieldBuildId: primary.buildId } }, db).actionExpectedDamage)
    .toBe(result.actionExpectedDamage)
  expect(scenario).toEqual(original)
})

it("keeps front identity through source snapshots, including an explicitly selected active teammate", () => {
  const owner = teammates[0]!
  const action = getCombatActionDefinition("odette.constellation.4.snow_swan_dream.coordinated_attack.stellar_swirl")!
  const others = [primary, ...teammates.slice(1)]
  const resolve = (onFieldBuildId?: string) => resolveScenarioActionEffectContext({
    action, build: owner, teammates: others, fieldContext: resolveFieldContext(action, owner, others, onFieldBuildId),
    activeEffectIds: [dionaEm, mizukiShare], buffs: [], enemyCount: 1, gameData: db,
    moonsignLevel: "none", resolvedActionParameters: new Map()
  })
  const unknown = resolve()
  const active = resolve(primary.buildId)
  expect(unknown.sourceFinalElementalMasteryByBuildId.get(owner.buildId)).toBe(0)
  const shared = active.sourceElementalMasteryBeforeShareByBuildId.get(primary.buildId)! * 0.1
  for (const recipient of teammates) {
    expect(active.sourceFinalElementalMasteryByBuildId.get(recipient.buildId)).toBeCloseTo(shared)
  }
  const result = evaluateScenario({ ...scenario, primary: owner, teammates: others, targetActionId: action.id,
    conditions: { ...scenario.conditions, onFieldBuildId: primary.buildId } }, db)
  expect(result.appliedEffects.map((effect) => effect.id)).not.toContain(dionaEm)
  expect(result.appliedEffects.find((effect) => effect.id === mizukiShare)?.value).toBeCloseTo(shared)
})

it("rejects unknown party IDs and field/action conflicts without inventing a foreground teammate", () => {
  for (const onFieldBuildId of ["missing", teammates[0]!.buildId]) {
    expect(() => evaluateScenario({ ...scenario, conditions: { ...scenario.conditions, onFieldBuildId } }, db)).toThrow(/前台角色/)
  }
  const background = "odette.constellation.4.snow_swan_dream.coordinated_attack.stellar_swirl"
  const owner = teammates[0]!
  expect(() => evaluateScenario({ ...scenario, primary: owner, teammates: [primary], targetActionId: background,
    conditions: { activeEffectIds: [], enemyCount: 1, onFieldBuildId: owner.buildId } }, db)).toThrow(/冲突/)
})
