import type { AnalysisResponse, CatalogResponse } from "@gscombat/contracts"
import { getCharacterLabel } from "../../lib/formatting/builds"

/** Shows authoritative baseline qualification separately from whether an effect contributes to this metric. */
export function ArtifactPreparationReport({ analysis, catalog }: {
  readonly analysis: AnalysisResponse
  readonly catalog: CatalogResponse
}) {
  const rows = analysis.artifactPreparations
  if (!rows?.length) return null
  return (
    <details className="reportSection">
      <summary>当前基准 · 圣遗物效果准备依据</summary>
      <p>准备条件满足不代表对本指标有贡献；伤害类型、月兆状态和同名去重仍会筛选。此处不随单个候选武器精炼结果变化。</p>
      {rows.map((row) => (
        <div key={`${row.sourceBuildId}:${row.effectId}`}>
          <strong>{getCharacterLabel(catalog, row.sourceCharacterId)} · {
            { on_field: "前台", off_field: "后台", unknown: "站位未指定" }[row.sourcePresence]
          } · {row.label}</strong>
          <p>{row.applied ? "已应用" : row.qualified ? "准备条件满足" : "准备条件未满足"}：{row.reason}</p>
          {row.capabilitySourceIds.length ? <small>能力来源：{row.capabilitySourceIds.join("、")}</small> : null}
        </div>
      ))}
    </details>
  )
}
