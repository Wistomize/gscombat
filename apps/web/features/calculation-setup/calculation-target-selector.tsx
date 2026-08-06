import type { CatalogResponse, CharacterBuild } from "@gscombat/contracts"

import { CharacterAvatar } from "../../components/ui/visual-icons"
import { getCalculationSourceLabel, getCharacterLabel } from "../../lib/formatting/builds"
import type { CatalogPrimaryAction, CatalogSupportMetric } from "./model"

type CatalogCharacter = CatalogResponse["characters"][number]

interface CalculationTargetSelectorProps {
  readonly partyBuilds: readonly CharacterBuild[]
  readonly ready: boolean
  readonly supportMetricId: string | null
  readonly targetActionId: string | null
  readonly targetBuildId: string | null
  readonly targetCharacter: CatalogCharacter | undefined
  readonly catalog: CatalogResponse
  readonly onSelectDamageMetric: (action: CatalogPrimaryAction) => void
  readonly onSelectSupportMetric: (metric: CatalogSupportMetric) => void
  readonly onSelectTargetBuild: (buildId: string) => void
}

/** Renders the calculation owner and metric selectors without owning their state. */
export function CalculationTargetSelector({
  catalog,
  partyBuilds,
  ready,
  supportMetricId,
  targetActionId,
  targetBuildId,
  targetCharacter,
  onSelectDamageMetric,
  onSelectSupportMetric,
  onSelectTargetBuild
}: CalculationTargetSelectorProps) {
  return (
    <>
      <div className="calculationBlock">
        <div className="workspaceSectionHeading">
          <div><span>01</span><h2>选择计算对象</h2></div>
          <small>{partyBuilds.length} 名队员</small>
        </div>
        <div className="calculationParty">
          {partyBuilds.map((build) => (
            <button
              aria-pressed={targetBuildId === build.buildId}
              className={targetBuildId === build.buildId ? "active" : ""}
              key={build.buildId}
              type="button"
              onClick={() => onSelectTargetBuild(build.buildId)}
            >
              <CharacterAvatar
                characterId={build.characterId}
                label={getCharacterLabel(catalog, build.characterId)}
              />
              <span>
                <strong>{getCharacterLabel(catalog, build.characterId)}</strong>
                <small>{getCalculationSourceLabel(build)}</small>
              </span>
            </button>
          ))}
        </div>
        {ready && partyBuilds.length === 0 ? (
          <a className="workspaceEmptyLink" href="/">返回配置页添加队伍成员</a>
        ) : null}
      </div>

      <div className="calculationBlock">
        <div className="workspaceSectionHeading"><div><span>02</span><h2>选择计算指标</h2></div></div>
        {!targetCharacter ? <p className="workspaceEmpty">请先选择一名队伍成员。</p> : (
          <div className="metricGroups">
            {targetCharacter.primaryActions.length > 0 ? (
              <div>
                <h3>伤害指标</h3>
                <div>
                  {targetCharacter.primaryActions.map((action) => (
                    <button
                      aria-pressed={targetActionId === action.id}
                      className={targetActionId === action.id ? "active" : ""}
                      key={action.id}
                      type="button"
                      onClick={() => onSelectDamageMetric(action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {targetCharacter.supportMetrics.length > 0 ? (
              <div>
                <h3>辅助指标</h3>
                <div>
                  {targetCharacter.supportMetrics.map((metric) => (
                    <button
                      aria-pressed={supportMetricId === metric.id}
                      className={supportMetricId === metric.id ? "active" : ""}
                      key={metric.id}
                      type="button"
                      onClick={() => onSelectSupportMetric(metric)}
                    >
                      {metric.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </>
  )
}
