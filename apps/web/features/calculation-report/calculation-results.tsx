import type { AnalysisResponse, CatalogResponse, CharacterBuild, SupportMetricEvaluationResponse } from "@gscombat/contracts"

import type { CatalogPrimaryAction, CatalogSupportMetric } from "../calculation-setup/model"
import { OrderedDamageReport } from "./damage-report"
import { SupportMetricReport } from "./support-metric-report"

interface CalculationResultsProps {
  readonly analysis: AnalysisResponse | null
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
          build={targetBuild}
          catalog={catalog}
          onWeaponRefinementChange={onWeaponRefinementChange}
          targetAction={targetAction}
        />
      ) : (
        <div className="emptyResult"><span>Σ</span><strong>等待计算</strong><p>选择队伍成员和指标后开始计算。</p></div>
      )}
    </section>
  )
}
