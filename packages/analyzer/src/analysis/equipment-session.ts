import { getCombatActionDefinition, listArtifactComparisonSets, supportedWeapons } from "@gscombat/content"
import { getWeaponComparisonRefinement, type EvaluationScenario } from "@gscombat/contracts"
import type { GameDataRepository } from "@gscombat/game-data"
import { AnalysisPreparation } from "../core/analysis-preparation.js"
import type { CriticalStatsSample } from "@gscombat/calculator"
import { criticalSampleKey } from "./artifact-crit-conversion.js"
import { evaluatePreparedScenario } from "../scenario/evaluate.js"
import { analyzeWithBaseline, evaluateWeaponCandidate, prepareWeaponCandidate, type AnalyzeScenarioOptions } from "./analyze.js"
import { evaluateArtifactLoadout, listArtifactLoadoutCandidates } from "./artifact-comparison.js"

/** One immutable scenario's trusted baseline and pure preparation, with no HTTP or scheduling dependency. */
export class EquipmentComparisonSession {
  readonly preparation: AnalysisPreparation
  readonly evaluation: ReturnType<typeof evaluatePreparedScenario>
  readonly counts = { baseline: 0, weapons: 0, artifacts: 0 }
  private readonly criticalSamples = new Map<string, CriticalStatsSample>()

  constructor(readonly scenario: EvaluationScenario, private readonly gameData: GameDataRepository) {
    const action = getCombatActionDefinition(scenario.targetActionId)
    if (!action || action.kind !== "damage" || action.status !== "verified" || action.characterId !== scenario.primary.characterId) {
      throw Object.assign(new Error("套装和武器比较只支持当前角色的伤害指标"), { statusCode: 400 })
    }
    this.preparation = new AnalysisPreparation(gameData)
    this.evaluation = evaluatePreparedScenario(scenario, gameData, { transformCriticalStats: sample => {
      this.criticalSamples.set(criticalSampleKey(sample), sample)
      return sample
    } }, this.preparation)
    this.counts.baseline++
  }

  get artifactCandidates(): ReturnType<typeof listArtifactLoadoutCandidates> {
    return listArtifactLoadoutCandidates(this.gameData)
  }

  excludedArtifactSets() {
    return listArtifactComparisonSets().flatMap(set => {
      const record = this.gameData.getArtifactSet(set.setId)
      const reason = !record ? "固定数据中不可用" : !record.rarities.some(rarity => rarity >= 4)
        ? "仅有三星及以下版本，不在本次比较范围" : !set.fourPieceSupported
          ? set.excludedReasons.join("；") || "四件套尚未声明支持" : undefined
      return reason ? [{ setId: set.setId, label: set.label, reason }] : []
    })
  }

  core() {
    return { evaluation: this.evaluation, analysis: analyzeWithBaseline(this.scenario, this.gameData, this.evaluation,
      { deferEquipmentComparisons: true }, this.preparation) }
  }

  weaponCandidates(options: AnalyzeScenarioOptions = {}) {
    return supportedWeapons.flatMap(weapon => {
      const refinement = options.weaponComparisonRefinements?.[weapon.weaponId] ?? weapon.comparison?.refinements?.[0] ??
        getWeaponComparisonRefinement(weapon.rarity)
      const candidate = prepareWeaponCandidate(this.scenario, this.gameData, weapon.weaponId, refinement,
        options.weaponComparisonChoices?.[weapon.weaponId])
      return candidate ? [{ weaponId: weapon.weaponId, refinement }] : []
    })
  }

  weapon(weaponId: string, refinement: number, choices?: Readonly<Record<string, string>>) {
    const candidate = prepareWeaponCandidate(this.scenario, this.gameData, weaponId, refinement, choices)
    if (!candidate) throw Object.assign(new Error(`当前场景无法比较武器：${weaponId}`), { statusCode: 400 })
    this.counts.weapons++
    return evaluateWeaponCandidate(candidate, this.gameData, this.evaluation.actionExpectedDamage, this.preparation)
  }

  artifact(candidateId: string, choices?: Readonly<Record<string, string>>) {
    const candidate = this.artifactCandidates.find(row => row.id === candidateId)
    if (!candidate) throw Object.assign(new Error(`未知套装组合：${candidateId}`), { statusCode: 400 })
    this.counts.artifacts++
    return evaluateArtifactLoadout(this.scenario, this.gameData, candidate, this.evaluation.actionExpectedDamage,
      this.preparation, choices, this.criticalSamples)
  }
}
