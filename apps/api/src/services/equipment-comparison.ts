import { createHash } from "node:crypto"
import { EquipmentComparisonSession, explainArtifactPreparations, rankArtifactLoadouts,
  type ArtifactLoadoutResult, type WeaponComparisonResult } from "@gscombat/analyzer"
import type { AnalysisRequest, ArtifactComparisonRequest, DeferredComparisonRequest } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import { ANALYSIS_ENGINE_VERSION } from "./analysis-version.js"
import { ComparisonScheduler, comparisonLimits } from "./comparison-scheduler.js"

/** Stable identity includes every input field; object insertion order is not semantic. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`
  if (value !== null && typeof value === "object") return `{${Object.entries(value).filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`
  return JSON.stringify(value) ?? "null"
}

type CoreResult = ReturnType<EquipmentComparisonSession["core"]> & {
  computationId: string
  artifactPreparations: ReturnType<typeof explainArtifactPreparations>
}

interface Entry {
  readonly session: EquipmentComparisonSession
  readonly created: number
  readonly artifacts: Map<string, ArtifactLoadoutResult>
  readonly weapons: Map<string, WeaponComparisonResult>
  core?: CoreResult
  bytes: number
}

/** Owns only bounded, reconstructible calculation state; no workspace writes or identifier-only reads. */
export class EquipmentComparisonService {
  private readonly entries = new Map<string, Entry>()
  private readonly scheduler = new ComparisonScheduler()

  constructor(private readonly gameData: GameDataRepository) {}

  close(): void { this.scheduler.close(); this.entries.clear() }

  core(scenario: AnalysisRequest): CoreResult {
    const { id, entry } = this.entry(scenario)
    if (!entry.core) {
      const { evaluation, analysis } = entry.session.core()
      entry.core = { evaluation, analysis, computationId: id,
        artifactPreparations: explainArtifactPreparations(scenario, this.gameData, evaluation.appliedEffects) }
      this.trim(id, entry)
    }
    return entry.core
  }

  weapons(request: DeferredComparisonRequest, signal?: AbortSignal) {
    const { id, entry } = this.entry(request.scenario, request.computationId)
    const service = this
    return this.scheduler.run(`${id}:weapons:${canonical(request.scenario.weaponComparisonChoices)}:${canonical(request.scenario.weaponComparisonRefinements)}`, function* () {
      const weapons: WeaponComparisonResult[] = []
      for (const candidate of entry.session.weaponCandidates(request.scenario)) {
        weapons.push(service.weaponResult(entry, candidate.weaponId, candidate.refinement,
          request.scenario.weaponComparisonChoices?.[candidate.weaponId]))
        yield
      }
      service.trim(id, entry)
      return { computationId: id, baselineExpectedDamage: entry.session.evaluation.actionExpectedDamage,
        weapons: weapons.sort((a, b) => b.expectedDamage - a.expectedDamage) }
    }, signal)
  }

  weapon(scenario: AnalysisRequest, weaponId: string, refinement: number, choices?: Record<string, string>, signal?: AbortSignal) {
    const { id, entry } = this.entry(scenario)
    const service = this
    return this.scheduler.run(`${id}:weapon:${weaponId}:${refinement}:${canonical(choices)}`, function* () {
      const weapon = service.weaponResult(entry, weaponId, refinement, choices)
      service.trim(id, entry)
      return { engineVersion: ANALYSIS_ENGINE_VERSION, baselineExpectedDamage: entry.session.evaluation.actionExpectedDamage, weapon }
    }, signal)
  }

  artifacts(request: ArtifactComparisonRequest, signal?: AbortSignal) {
    const { id, entry } = this.entry(request.scenario, request.computationId)
    const ids = new Set(entry.session.artifactCandidates.map(candidate => candidate.id))
    const selectableFourPieceCandidates = entry.session.artifactCandidates
      .filter(candidate => candidate.kind === "four_piece").map(({ id, label }) => ({ id, label }))
    if (request.selectedCandidateId !== undefined && !selectableFourPieceCandidates.some(candidate => candidate.id === request.selectedCandidateId)) {
      throw Object.assign(new Error("指定套装必须是已支持的四件套"), { statusCode: 400 })
    }
    if ((request.candidateId && !ids.has(request.candidateId)) || Object.keys(request.choices ?? {}).some(key => !ids.has(key))) {
      throw Object.assign(new Error("未知套装候选"), { statusCode: 400 })
    }
    const service = this
    return this.scheduler.run(`${id}:artifacts:${canonical(request.choices)}:${request.candidateId ?? ""}:${request.selectedCandidateId ?? ""}`, function* () {
      const results: ArtifactLoadoutResult[] = []
      const failures: { candidateId: string; message: string }[] = []
      for (const candidate of entry.session.artifactCandidates) {
        const choices = request.choices?.[candidate.id]
        const key = `${candidate.id}:${canonical(choices)}`
        try {
          let result = entry.artifacts.get(key)
          if (!result) { result = entry.session.artifact(candidate.id, choices); entry.artifacts.set(key, result) }
          results.push(result)
        } catch (error) {
          if ((error as { statusCode?: number }).statusCode === 400) throw error
          failures.push({ candidateId: candidate.id, message: "该候选计算失败，可重试；排名暂不完整" })
        }
        yield
      }
      service.trim(id, entry)
      const baselineExpectedDamage = entry.session.evaluation.actionExpectedDamage
      const ranked = rankArtifactLoadouts(results, baselineExpectedDamage)
      const selectedCandidate = results.find(row => row.id === request.selectedCandidateId)
      return { computationId: id, baselineExpectedDamage, candidateCount: ids.size, complete: failures.length === 0,
        selectableFourPieceCandidates, ...(selectedCandidate ? { selectedCandidate } : {}),
        results: ranked, failures, excludedSets: entry.session.excludedArtifactSets(),
        ...(request.candidateId ? { changedCandidateVisible: ranked.some(row => row.id === request.candidateId) ||
          selectedCandidate?.id === request.candidateId } : {}) }
    }, signal)
  }

  private weaponResult(entry: Entry, weaponId: string, refinement: number, choices?: Readonly<Record<string, string>>) {
    const key = `${weaponId}:${refinement}:${canonical(choices)}`
    let result = entry.weapons.get(key)
    if (!result) { result = entry.session.weapon(weaponId, refinement, choices); entry.weapons.set(key, result) }
    return result
  }

  private entry(request: AnalysisRequest, expectedId?: string): { id: string; entry: Entry } {
    const { weaponComparisonChoices: _choices, weaponComparisonRefinements: _refinements, ...scenario } = request
    const id = createHash("sha256").update(canonical([ANALYSIS_ENGINE_VERSION, "artifact-comparison-v4-four-star-main-stats",
      this.gameData.getManifest(), scenario])).digest("hex")
    if (expectedId && expectedId !== id) throw Object.assign(new Error("场景或计算版本已变化，请重新计算"), { statusCode: 409 })
    this.prune()
    let entry = this.entries.get(id)
    if (!entry) {
      entry = { session: new EquipmentComparisonSession(structuredClone(scenario), this.gameData), created: Date.now(),
        artifacts: new Map(), weapons: new Map(), bytes: Buffer.byteLength(canonical(scenario)) }
      this.entries.set(id, entry)
      this.trim(id, entry)
    }
    return { id, entry }
  }

  private prune(): void {
    for (const [id, entry] of this.entries) if (Date.now() - entry.created >= comparisonLimits.cacheMs) this.entries.delete(id)
  }

  private trim(id: string, entry: Entry): void {
    // Bound option-history growth even while a caller still holds this entry outside the cache.
    if (entry.artifacts.size) {
      while (entry.artifacts.size > entry.session.artifactCandidates.length * 2) entry.artifacts.delete(entry.artifacts.keys().next().value!)
    }
    while (entry.weapons.size > 600) entry.weapons.delete(entry.weapons.keys().next().value!)
    entry.bytes = Buffer.byteLength(JSON.stringify([entry.session.scenario, entry.session.evaluation, entry.core,
      [...entry.artifacts.values()], [...entry.weapons.values()]])) * 2
    if (entry.bytes > comparisonLimits.cacheBytes) this.entries.delete(id)
    while (this.entries.size > comparisonLimits.cacheScenarios ||
      [...this.entries.values()].reduce((sum, value) => sum + value.bytes, 0) > comparisonLimits.cacheBytes) {
      this.entries.delete(this.entries.keys().next().value!)
    }
  }
}
