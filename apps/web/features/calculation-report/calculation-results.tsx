import type { AnalysisResponse, CatalogResponse, CharacterBuild, SupportMetricEvaluationResponse } from "@gscombat/contracts"

import type { CatalogPrimaryAction, CatalogSupportMetric } from "../calculation-setup/model"
import { OrderedDamageReport } from "./damage-report"
import { SupportMetricReport } from "./support-metric-report"
import { ArtifactPreparationReport } from "./artifact-preparation-report"
import type { WeaponRequestState } from "../calculation-workspace/use-incremental-analysis"

interface CalculationResultsProps {
  readonly analysis: AnalysisResponse | null
  readonly weaponStates?: Readonly<Record<string, WeaponRequestState>>
  readonly catalog: CatalogResponse
  readonly selectedSupportMetric: CatalogSupportMetric | undefined
  readonly supportMetricResponse: SupportMetricEvaluationResponse | null
  readonly targetAction: CatalogPrimaryAction | undefined
  readonly targetBuild: CharacterBuild | undefined
  readonly onWeaponRefinementChange: (weaponId: string, refinement: number) => void
}

/** Selects the authoritative support or damage report for the latest completed calculation. */
export function CalculationResults({
  analysis,
  weaponStates,
  catalog,
  selectedSupportMetric,
  supportMetricResponse,
  targetAction,
  targetBuild,
  onWeaponRefinementChange
}: CalculationResultsProps) {
  return (
    <section className="resultsSection calculationResults" id="results">
      <div className="resultsHeading">
        <div><span className="kicker">METRIC REPORT</span><h2>计算结果</h2></div>
        <span className="targetBadge">{selectedSupportMetric?.label ?? targetAction?.label ?? "尚未选择指标"}</span>
      </div>
      {supportMetricResponse ? (
        <SupportMetricReport catalog={catalog} response={supportMetricResponse} />
      ) : analysis && targetBuild ? (
        <OrderedDamageReport
          analysis={analysis}
          weaponStates={weaponStates}
          build={targetBuild}
          catalog={catalog}
          onWeaponRefinementChange={onWeaponRefinementChange}
          targetAction={targetAction}
        />
      ) : (
        <div className="emptyResult"><span>Σ</span><strong>等待计算</strong><p>选择队伍成员和指标后开始计算。</p></div>
      )}
      {analysis && !supportMetricResponse ? <ArtifactPreparationReport analysis={analysis} catalog={catalog} /> : null}
    </section>
  )
}
