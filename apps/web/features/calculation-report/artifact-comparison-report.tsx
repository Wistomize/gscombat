"use client"

import type { CatalogResponse } from "@gscombat/contracts"
import { ArtifactIcon } from "../../components/ui/visual-icons"
import { formatDamage, formatPercent } from "../../lib/formatting/numbers"
import type { ComparisonLoadState, EquipmentComparisonState } from "../calculation-workspace/use-equipment-comparisons"

export function ComparisonLoading({ state, retry }: { readonly state: ComparisonLoadState; readonly retry: () => void }) {
  return <>
    {state.loading ? <p role="status"><span className="comparisonSpinner" aria-hidden="true" />正在计算比较结果…</p> : null}
    {state.error ? <p role="alert">{state.error} <button type="button" onClick={retry}>重试</button></p> : null}
  </>
}

const slotLabels = { flower: "花", plume: "羽", sands: "沙", goblet: "杯", circlet: "冠" } as const

/** Comparison projections never edit or apply a saved character build. */
export function ArtifactComparisonReport({ equipment, catalog }: {
  readonly equipment: EquipmentComparisonState; readonly catalog: CatalogResponse
}) {
  const report = equipment.artifacts
  const selected = report?.selectedCandidate?.id === equipment.selectedArtifactId ? report.selectedCandidate : undefined
  const rows = report ? selected && !report.results.some(row => row.id === selected.id)
    ? [selected, ...report.results] : report.results : []
  const label = (id: string) => catalog.artifactSets.find(set => set.setId === id)?.label ?? id
  return <article className="wideReport artifactComparisonReport">
    <div className="cardTitle"><span>ARTIFACT SET SWAP</span><strong>更换圣遗物套装收益</strong></div>
    <p><strong>保留现有副词条；五星部位主词条不变，四星部位主词条按四星满级计算。</strong>四件套包含完整二件套＋四件套效果；2＋2 只比较同类二件效果叠加。四星部位自动选取指标最高的分配。</p>
    <p>显示所有提升方案，以及下方最接近的两个伤害档位。暴击率四件套额外进行理论调配：仅将换套后新增的溢出暴击率按 1∶2 转为暴伤，原配置已有溢出不转换。</p>
    <small>缺件时假设凑齐套装，但不补任何主副属性。</small>
    <ComparisonLoading state={equipment.artifactLoad} retry={equipment.retryArtifacts} />
    {equipment.notice ? <p role="status">{equipment.notice}</p> : null}
    {report ? <>
      <p>当前实际配置：{formatDamage(report.baselineExpectedDamage)} · 已比较 {report.candidateCount} 个方案</p>
      <div className="artifactSelection">
        <label>指定套装 <select aria-label="指定套装" value={equipment.selectedArtifactId}
          onChange={event => equipment.selectArtifact(event.target.value)}>
          <option value="">不指定（默认榜单）</option>
          {report.selectableFourPieceCandidates.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.label}</option>)}
        </select></label>
        {equipment.selectedArtifactId ? <button type="button" onClick={() => equipment.selectArtifact("")}>清除选择</button> : null}
        <small>指定套装无论收益高低都会显示，不改变默认榜单。</small>
      </div>
      {equipment.selectedArtifactId && report.failures.some(failure => failure.candidateId === equipment.selectedArtifactId) ?
        <p role="alert">指定套装计算失败，未显示其收益。<button type="button" onClick={equipment.retryArtifacts}>重试</button></p> : null}
      {!report.complete ? <p role="alert">{report.failures.length} 个候选失败，排名暂不完整。<button type="button" onClick={equipment.retryArtifacts}>重试失败项</button></p> : null}
      <div className="artifactComparisonRows" aria-busy={equipment.artifactLoad.loading}>
        {rows.map(result => <div className="artifactComparisonRow" key={result.id}
          data-selected={equipment.selectedArtifactId === result.id ? "true" : undefined}
          data-updated={equipment.updatedArtifact === result.id ? "true" : undefined}>
          <div className="artifactComparisonIdentity">
            {Object.keys(result.counts).map(id => <ArtifactIcon key={id} setId={id} slot="flower" label={label(id)} />)}
            <div><strong>{result.label}</strong>{equipment.selectedArtifactId === result.id ? <small>已指定</small> : null}
              {result.theoretical ? <small><strong>四星套装：保留当前五星圣遗物副词条，但实际换为四星后会少词条。</strong></small> : null}
              {result.fourStarSlots?.length ? <small>四星满级部位：{result.fourStarSlots.map(slot => slotLabels[slot]).join("、")}（缺件不补属性）</small> : null}
              {result.critConversions.map((conversion, index) => <small key={`${conversion.ownerId}:${conversion.eventId}`}>
                {result.critConversions.length > 1 ? `伤害段 ${index + 1}：` : ""}已将换套后新增溢出暴击率 {formatPercent(conversion.critRateConverted)} 转换为暴击伤害 {formatPercent(conversion.critDamageAdded)}（理论调配）
              </small>)}</div>
          </div>
          <div className="weaponChoices">{result.choiceGroups.map(group => <label className="weaponChoice" key={group.id}>
            <select aria-label={`${result.label}：${group.label}`} value={result.choices[group.id]}
              disabled={equipment.artifactLoad.loading}
              onChange={event => equipment.changeArtifact(result.id, { ...result.choices, [group.id]: event.target.value })}>
              {group.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select></label>)}</div>
          <span>{formatDamage(result.expectedDamage)}<small>变化 {result.deltaDamage >= 0 ? "+" : ""}{formatDamage(result.deltaDamage)}</small></span>
          <b className={result.deltaDamage >= 0 ? "positive" : "negative"}>{result.gainRatio === null ? "—" : formatPercent(result.gainRatio)}</b>
        </div>)}
      </div>
      {report.results.length === 0 && report.complete ? <p>没有高于或低于当前基准的候选。</p> : null}
    </> : null}
  </article>
}
