import { artifactComparisonGroups, getArtifactConditionRequirements, getCombatActionEffectDefinition, listArtifactComparisonSets, listCombatActionEffects } from "@gscombat/content"
import type { ArtifactSlot, EvaluationScenario } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import { AnalysisPreparation } from "../core/analysis-preparation.js"
import { countArtifactSet, withArtifactSetCounts } from "../core/artifact-stats.js"
import { evaluatePreparedScenario } from "../scenario/evaluate.js"
import type { CriticalStatsSample } from "@gscombat/calculator"
import { artifactCritConversion, criticalSampleKey, type ArtifactCritConversion, type CriticalSamples } from "./artifact-crit-conversion.js"
import { artifactMainStatVariants } from "./artifact-main-stat-variants.js"

export interface ArtifactLoadoutCandidate {
  readonly id: string
  readonly label: string
  readonly kind: "four_piece" | "two_plus_two"
  readonly counts: Readonly<Record<string, number>>
  readonly combinations: readonly (readonly string[])[]
  readonly theoretical: boolean
}

export interface ArtifactLoadoutResult extends ArtifactLoadoutCandidate {
  readonly fourStarSlots: readonly ArtifactSlot[]
  readonly critConversions: readonly ArtifactCritConversion[]
  readonly choices: Readonly<Record<string, string>>
  readonly choiceGroups: readonly ArtifactChoiceGroup[]
  readonly expectedDamage: number
  readonly deltaDamage: number
  readonly gainRatio: number | null
}

export interface ArtifactChoiceGroup {
  readonly id: string
  readonly label: string
  readonly options: readonly { readonly value: string; readonly label: string }[]
}

/** Projects only maintained manual conditions; automatic preparation remains in the effect resolver. */
export function describeArtifactLoadoutChoices(candidate: ArtifactLoadoutCandidate): ArtifactChoiceGroup[] {
  const groups = new Map<string, ArtifactChoiceGroup>()
  for (const effect of listCombatActionEffects()) {
    if (effect.source.kind !== "artifact_set" || !effect.selectionMode ||
      (candidate.counts[effect.source.setId] ?? 0) < effect.source.minimumPieces) continue
    const id = effect.exclusivity?.group ?? effect.id
    const group = groups.get(id) ?? { id, label: effect.exclusivity ? "套装条件" : effect.label,
      options: [{ value: "none", label: "不启用" }] }
    groups.set(id, { ...group, options: [...group.options, { value: effect.id, label: effect.label }] })
  }
  if (Object.entries(candidate.counts).some(([id, count]) => getArtifactConditionRequirements(id).some(r => count >= r.minimumPieces))) {
    groups.set("targetFrozen", { id: "targetFrozen", label: "目标冻结", options: [
      { value: "false", label: "未冻结" }, { value: "true", label: "已冻结" }
    ] })
  }
  return [...groups.values()]
}

function applyArtifactChoices(scenario: EvaluationScenario, candidate: ArtifactLoadoutCandidate,
  supplied: Readonly<Record<string, string>> = {}) {
  // Existing party-owned exclusive selections remain fixed; swapping primary gear cannot reassign them.
  const choiceGroups = describeArtifactLoadoutChoices(candidate).filter(group => !group.options.some(option =>
    scenario.conditions.activeEffectIds.includes(option.value) &&
    scenario.conditions.activeEffectSourceBuildIds?.[option.value] !== undefined &&
    scenario.conditions.activeEffectSourceBuildIds[option.value] !== scenario.primary.buildId))
  if (Object.keys(supplied).some(id => !choiceGroups.some(group => group.id === id))) {
    throw Object.assign(new Error("未知套装条件"), { statusCode: 400 })
  }
  const ids = new Set(scenario.conditions.activeEffectIds)
  const sources = { ...scenario.conditions.activeEffectSourceBuildIds }
  const choices: Record<string, string> = {}
  let targetFrozen = scenario.conditions.targetFrozen ?? false
  for (const group of choiceGroups) {
    const inherited = group.id === "targetFrozen" ? String(targetFrozen) : group.options.find(option => ids.has(option.value))?.value ?? "none"
    const value = supplied[group.id] ?? inherited
    if (!group.options.some(option => option.value === value)) throw Object.assign(new Error(`非法套装条件：${group.id}`), { statusCode: 400 })
    choices[group.id] = value
    if (group.id === "targetFrozen") { targetFrozen = value === "true"; continue }
    for (const option of group.options) { ids.delete(option.value); delete sources[option.value] }
    if (value !== "none") { ids.add(value); sources[value] = scenario.primary.buildId }
  }
  return { choices, choiceGroups, scenario: { ...scenario, conditions: {
    ...scenario.conditions, targetFrozen, activeEffectIds: [...ids], activeEffectSourceBuildIds: sources
  } } }
}

/** Builds bounded, deterministic candidates from maintained coverage and the pinned snapshot. */
const candidateCatalogs = new WeakMap<GameDataRepository, readonly ArtifactLoadoutCandidate[]>()

export function listArtifactLoadoutCandidates(gameData: GameDataRepository): readonly ArtifactLoadoutCandidate[] {
  const cached = candidateCatalogs.get(gameData)
  if (cached) return cached
  const sets = listArtifactComparisonSets().filter(set =>
    set.twoPieceSupported && (gameData.getArtifactSet(set.setId)?.rarities.some(rarity => rarity >= 4) ?? false))
  const theoretical = (ids: readonly string[]) => ids.some(id => !gameData.getArtifactSet(id)?.rarities.includes(5))
  const candidates: ArtifactLoadoutCandidate[] = sets.filter(set => set.fourPieceSupported).map(set => ({
    id: `four:${set.setId}`, label: `${set.label} · 四件套`, kind: "four_piece", counts: { [set.setId]: 4 },
    combinations: [[set.setId]], theoretical: theoretical([set.setId])
  }))
  for (const group of artifactComparisonGroups) {
    const [leftId, rightId] = group.sets
    const left = sets.find(set => set.setId === leftId), right = sets.find(set => set.setId === rightId)
    if (!left || !right) continue
    if (left.twoPieceKey.startsWith("set:") || left.twoPieceKey !== right.twoPieceKey) {
      throw new Error(`二件套分类效果不等价：${group.id}`)
    }
    candidates.push({ id: `two:${group.id}`, kind: "two_plus_two", label: `${group.label} · 2＋2`,
      counts: { [leftId]: 2, [rightId]: 2 }, combinations: [[leftId, rightId]], theoretical: theoretical(group.sets) })
  }
  for (const candidate of candidates) {
    Object.freeze(candidate.counts)
    for (const pair of candidate.combinations) Object.freeze(pair)
    Object.freeze(candidate.combinations)
    Object.freeze(candidate)
  }
  const result = Object.freeze(candidates)
  candidateCatalogs.set(gameData, result)
  return result
}

/** Replaces only the current character's set sources, preserving valid teammate selections. */
export function prepareArtifactLoadout(scenario: EvaluationScenario, candidate: ArtifactLoadoutCandidate): EvaluationScenario {
  const primary = withArtifactSetCounts(scenario.primary, candidate.counts)
  const sources = { ...scenario.conditions.activeEffectSourceBuildIds }
  const activeEffectIds = scenario.conditions.activeEffectIds.filter(id => {
    const effect = getCombatActionEffectDefinition(id)
    if (effect?.source.kind !== "artifact_set") return true
    const source = effect.source
    if (sources[id] && sources[id] !== primary.buildId) return true
    if (countArtifactSet(primary, source.setId) >= source.minimumPieces) return true
    delete sources[id]
    const teammate = scenario.teammates.find(build => countArtifactSet(build, source.setId) >= source.minimumPieces)
    if (teammate && source.holder === "party_member") { sources[id] = teammate.buildId; return true }
    return false
  })
  // Only remove obsolete primary-set ownership; dependent character/weapon selections are unrelated.
  for (const [id, buildId] of Object.entries(sources)) {
    const effect = getCombatActionEffectDefinition(id)
    if (buildId === primary.buildId && effect?.source.kind === "artifact_set" &&
      countArtifactSet(primary, effect.source.setId) < effect.source.minimumPieces) delete sources[id]
  }
  return { ...scenario, primary, conditions: { ...scenario.conditions, activeEffectIds, activeEffectSourceBuildIds: sources } }
}

/** Evaluates a candidate using the same authoritative path as the actual build. */
export function evaluateArtifactLoadout(
  scenario: EvaluationScenario, gameData: GameDataRepository, candidate: ArtifactLoadoutCandidate,
  baseline: number, preparation = new AnalysisPreparation(gameData), choices?: Readonly<Record<string, string>>,
  baselineSamples?: CriticalSamples
): ArtifactLoadoutResult {
  const setId = candidate.kind === "four_piece" ? Object.keys(candidate.counts)[0] : undefined
  const canConvert = setId && listCombatActionEffects().some(effect => effect.source.kind === "artifact_set" &&
    effect.source.setId === setId && effect.source.minimumPieces === 4 && "target" in effect && effect.target === "critRate")
  if (canConvert && !baselineSamples) {
    const samples = new Map<string, CriticalStatsSample>()
    evaluatePreparedScenario(scenario, gameData, { transformCriticalStats: sample => {
      samples.set(criticalSampleKey(sample), sample); return sample
    } }, preparation)
    baselineSamples = samples
  }
  let best: ArtifactLoadoutResult | undefined
  for (const variant of artifactMainStatVariants(scenario.primary, candidate.counts, gameData, preparation)) {
    const prepared = applyArtifactChoices(prepareArtifactLoadout({ ...scenario, primary: variant.build }, candidate), candidate, choices)
    const critConversions: ArtifactCritConversion[] = []
    const intervention = canConvert && baselineSamples ? {
      transformCriticalStats: artifactCritConversion(scenario.primary.buildId, setId, baselineSamples, critConversions)
    } : {}
    const expectedDamage = evaluatePreparedScenario(prepared.scenario, gameData, intervention, preparation).actionExpectedDamage
    if (!Number.isFinite(expectedDamage)) throw new Error(`套装计算结果非有限数值：${candidate.id}`)
    if (!best || expectedDamage > best.expectedDamage) best = {
      ...candidate, fourStarSlots: variant.fourStarSlots, critConversions, choices: prepared.choices,
      choiceGroups: prepared.choiceGroups, expectedDamage, deltaDamage: expectedDamage - baseline,
      gainRatio: baseline === 0 ? null : expectedDamage / baseline - 1
    }
  }
  if (!best) throw new Error(`套装没有可用的主词条分配：${candidate.id}`)
  return best
}

/** Ranks all improvements and the nearest two lower tiers; never groups by rounded display values. */
export function rankArtifactLoadouts<T extends { readonly expectedDamage: number }>(results: readonly T[], baseline: number): T[] {
  const equal = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))
  const sorted = [...results].sort((a, b) => b.expectedDamage - a.expectedDamage)
  const lowerAnchors: number[] = []
  return sorted.filter(result => {
    const damage = result.expectedDamage
    if (equal(damage, baseline)) return false
    if (damage > baseline) return true
    if (lowerAnchors.some(anchor => equal(damage, anchor))) return true
    if (lowerAnchors.length === 2) return false
    lowerAnchors.push(damage)
    return true
  })
}
