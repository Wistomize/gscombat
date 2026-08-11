import type { AnalysisResponse, CatalogResponse, CharacterBuild } from "@gscombat/contracts"

import { ArtifactIcon, WeaponIcon } from "../../components/ui/visual-icons"
import { artifactSlotLabels as slotLabels, artifactStatLabels as statLabels } from "../../lib/formatting/artifacts"
import {
  formatDamage,
  formatMarginalPercent,
  formatNumber,
  formatPercent,
  numberValue
} from "../../lib/formatting/numbers"
import { toDisplayStatValue } from "../../lib/formatting/stats"
import { TraceFormula } from "./damage-trace-formula"
import { getRotationEventElementSummary, getRotationTraceStage, RotationTraceFormula } from "./rotation-trace-formula"
import {
  actionEffectTargetLabels,
  formatAppliedActionEffect,
  formatAppliedScenarioBuff,
  formatScalingTerms,
  MasteryAndCritSourceBreakdown,
  moonsignLabels,
  resonanceLabels,
  traceStageMeta,
  type CatalogPrimaryAction,
  type PipelineStage
} from "./trace-shared"

function ArtifactRawValueReport({ build, catalog }: { readonly build: CharacterBuild; readonly catalog: CatalogResponse }) {
  const artifactDescription =
    build.artifacts.length === 0
      ? "当前角色未装备圣遗物，不参与圣遗物属性或套装效果计算"
      : `当前 ${build.artifacts.length} 件圣遗物参与计算的主词条与副词条`

  return (
    <article className="wideReport rawArtifactReport">
      <div className="cardTitle">
        <span>ARTIFACT INPUT</span>
        <strong>圣遗物原始值输入</strong>
        <small>{artifactDescription}</small>
      </div>
      <div className="rawArtifactRows">
        {build.artifacts.length === 0 ? (
          <p className="emptyArtifactState">当前配置没有已装备的圣遗物。</p>
        ) : (
          build.artifacts.map((artifact) => (
            <div key={artifact.id}>
              <ArtifactIcon label={catalog.artifactSets.find((set) => set.setId === artifact.setId)?.label ?? artifact.setId} setId={artifact.setId} slot={artifact.slot} />
              <span className="rawArtifactIdentity"><strong>{slotLabels[artifact.slot]}</strong><small>{catalog.artifactSets.find((set) => set.setId === artifact.setId)?.label ?? artifact.setId}</small></span>
              <span>{statLabels[artifact.mainStat.stat]} {toDisplayStatValue(artifact.mainStat.stat, artifact.mainStat.value).toFixed(1)}</span>
              <small>{artifact.substats.map((substat) => `${statLabels[substat.stat]} ${toDisplayStatValue(substat.stat, substat.value).toFixed(1)}`).join(" · ") || "无副词条"}</small>
            </div>
          ))
        )}
      </div>
    </article>
  )
}

export function OrderedDamageReport({
  analysis,
  build,
  catalog,
  onWeaponRefinementChange,
  targetAction
}: {
  readonly analysis: AnalysisResponse
  readonly build: CharacterBuild
  readonly catalog: CatalogResponse
  readonly onWeaponRefinementChange: (weaponId: string, refinement: number) => void
  readonly targetAction: CatalogPrimaryAction | undefined
}) {
  const rotationTraceEvents = analysis.evaluation.rotation.events.filter((event) => event.trace.length > 0)
  const usesRotationTrace = analysis.evaluation.formulaAuthority === "rotation_events" && rotationTraceEvents.length > 0
  const tracePresentation = targetAction?.tracePresentation
  const focusedTraceEvents = tracePresentation
    ? rotationTraceEvents.filter((event) => event.id.endsWith(`.${tracePresentation.focusEventId}`))
    : rotationTraceEvents
  const displayedRotationTraceEvents = focusedTraceEvents.length > 0 ? focusedTraceEvents : rotationTraceEvents
  const traceLegendStages: readonly PipelineStage[] = usesRotationTrace
    ? [...new Set(displayedRotationTraceEvents.flatMap((event) => event.trace.map(getRotationTraceStage)))]
    : analysis.evaluation.result.trace.map((entry) => entry.stage)

  return (
    <div className="orderedReport">
      <article className="damageHero">
        <div className="metricLabel">指标期望结果</div>
        <div className="teamStateStrip" aria-label="队伍共鸣与月兆状态">
          {analysis.evaluation.teamState.activeResonanceIds.map((id) => <span key={id}>{resonanceLabels[id]}</span>)}
          {analysis.evaluation.teamState.hexereiSecretRite ? <span>魔导秘仪</span> : null}
          <span>{moonsignLabels[analysis.evaluation.teamState.moonsign.level]}</span>
        </div>
        <strong>{formatDamage(analysis.evaluation.rotation.dpr)}</strong>
        <span>{targetAction?.label ?? "目标技能"} · 当前配置 C{build.constellation} · 动作总暴击期望</span>
        <div className="damageSplit">
          <div><small>不暴击</small><b>{formatDamage(analysis.evaluation.rotation.events.reduce((total, event) => total + event.nonCritDamage, 0))}</b></div>
          <div><small>暴击</small><b>{formatDamage(analysis.evaluation.rotation.events.reduce((total, event) => total + event.critDamage, 0))}</b></div>
        </div>
      </article>

      <article className="resolvedStats">
        <div className="cardTitle"><span>RESOLVED</span><strong>结算面板</strong></div>
        <dl>
          <div><dt>基础攻击</dt><dd>{formatNumber(analysis.evaluation.stats.baseAttack)}</dd></div>
          <div><dt>最终攻击</dt><dd>{formatNumber(analysis.evaluation.stats.effectiveAttack)}</dd></div>
          <div><dt>攻击力%</dt><dd>{(analysis.evaluation.stats.attackPercent * 100).toFixed(1)}%</dd></div>
          <div><dt>固定攻击</dt><dd>{formatNumber(analysis.evaluation.stats.flatAttack)}</dd></div>
          <div><dt>暴击率</dt><dd>{(analysis.evaluation.stats.critRate * 100).toFixed(1)}%</dd></div>
          <div><dt>暴击伤害</dt><dd>{(analysis.evaluation.stats.critDamage * 100).toFixed(1)}%</dd></div>
          <div><dt>伤害加成</dt><dd>{(analysis.evaluation.stats.damageBonus * 100).toFixed(1)}%</dd></div>
          <div><dt>元素精通</dt><dd>{formatNumber(analysis.evaluation.stats.elementalMastery)}</dd></div>
          <div><dt>元素充能</dt><dd>{(analysis.evaluation.stats.energyRecharge * 100).toFixed(1)}%</dd></div>
          {analysis.evaluation.stats.resistanceReduction > 0 ? <div><dt>抗性降低</dt><dd>{formatPercent(analysis.evaluation.stats.resistanceReduction)}</dd></div> : null}
          <div><dt>倍率</dt><dd>{analysis.evaluation.stats.talentMultiplier === null ? formatScalingTerms(analysis.evaluation.stats.scalingTerms ?? []) : `${(analysis.evaluation.stats.talentMultiplier * 100).toFixed(1)}%`}</dd></div>
        </dl>
      </article>

      <article className="wideReport traceReport">
        <div className="cardTitle"><span>DAMAGE PIPELINE</span><strong>结算轨迹</strong><small>{tracePresentation ? `总结果：${tracePresentation.totalLabel}；轨迹展示：${tracePresentation.focusLabel}` : "从基础伤害到反应、抗性与命中段数"}</small></div>
        <div className="traceLegend" aria-label="伤害乘区颜色图例">
          {traceLegendStages.map((stage) => <span className={`traceLegendItem traceLegendItem--${stage}`} key={stage}><i aria-hidden="true" />{traceStageMeta[stage].label}</span>)}
        </div>
        <MasteryAndCritSourceBreakdown stats={analysis.evaluation.stats} />
        <div className="traceSteps">
          {usesRotationTrace
            ? displayedRotationTraceEvents.map((event, eventIndex) => (
                <section className="traceEvent" key={event.id}>
                  <div className="traceEventTitle"><strong>{`EVENT ${String(eventIndex + 1).padStart(2, "0")} · ${event.id}`}</strong><small>{`${getRotationEventElementSummary(event)} · ${event.time.toFixed(2)}s · ${event.hitCount} 段`}</small></div>
                  {event.trace.map((entry, index) => {
                    const stage = getRotationTraceStage(entry)
                    const previousStage = getRotationTraceStage(event.trace[index - 1] ?? entry)
                    return <div aria-label={`${event.id} ${traceStageMeta[stage].label}结算公式`} className="traceStep" data-stage={stage} key={`${event.id}-${index}-${entry.kind}`}><div className="traceStage"><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{traceStageMeta[stage].label}</strong><small>{traceStageMeta[stage].hint}</small></div></div><RotationTraceFormula analysis={analysis} entry={entry} previousStage={previousStage} targetAction={targetAction} /></div>
                  })}
                </section>
              ))
            : analysis.evaluation.result.trace.map((entry, index) => <div aria-label={`${traceStageMeta[entry.stage].label}结算公式`} className="traceStep" data-stage={entry.stage} key={`${entry.stage}-${index}`}><div className="traceStage"><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{traceStageMeta[entry.stage].label}</strong><small>{traceStageMeta[entry.stage].hint}</small></div></div><TraceFormula effects={analysis.evaluation.appliedEffects} entry={entry} previousStage={analysis.evaluation.result.trace[index - 1]?.stage ?? entry.stage} stats={analysis.evaluation.stats} /></div>)}
        </div>
        <div className="buffStrip">
          {analysis.evaluation.appliedBuffs.map((buff) => <span key={`${buff.sourceId}-${buff.stat}`}>{buff.label} {formatAppliedScenarioBuff(buff)}</span>)}
          {analysis.evaluation.appliedEffects.map((effect) => <span key={effect.id}>{effect.label} · {actionEffectTargetLabels[effect.target]} {formatAppliedActionEffect(effect)}</span>)}
        </div>
      </article>

      <article className="wideReport effectiveReport">
        <div className="cardTitle"><span>EFFECTIVE ROLLS</span><strong>圣遗物有效词条</strong><small>按当前词条边际收益加权</small></div>
        <div className="effectiveTotal"><strong>{analysis.analysis.totalEffectiveRolls.toFixed(1)}</strong><span>总有效词条</span></div>
        <div className="artifactScores">{analysis.analysis.effectiveArtifacts.map((artifact) => <div key={artifact.artifactId}><span>{slotLabels[artifact.slot]}</span><strong>{formatNumber(artifact.effectiveRolls)}</strong></div>)}</div>
      </article>

      <ArtifactRawValueReport build={build} catalog={catalog} />

      <article className="wideReport substatReport">
        <div className="cardTitle"><span>ONE AVERAGE ROLL</span><strong>词条增加的边际收益</strong><small>副词条增加一个五星平均档 · 对应伤害加成增加 5%</small></div>
        <div className="gainBars">{analysis.analysis.marginalSubstats.map((result) => <div className="gainBar" key={result.stat}><span>{result.label}</span><div><i style={{ width: `${Math.max(result.weight * 100, 1)}%` }} /></div><b>{formatMarginalPercent(result.gainRatio)}</b></div>)}</div>
        {analysis.analysis.progressionGains.length > 0 ? <><div className="gainGroupTitle">角色成长</div><div className="gainBars">{analysis.analysis.progressionGains.map((result) => <div className="gainBar" key={result.id}><span>{result.label}</span><div><i style={{ width: `${Math.max(result.weight * 100, 1)}%` }} /></div><b>{formatMarginalPercent(result.gainRatio)}</b></div>)}</div></> : null}
      </article>

      <article className="wideReport weaponReport">
        <div className="cardTitle"><span>WEAPON SWAP</span><strong>更换武器收益</strong><small>每把武器可独立选择精炼等级，并重新解析装备效果</small></div>
        <div className="weaponRows">{analysis.analysis.weapons.map((weapon, index) => <div className="weaponRow" key={weapon.weaponId}><span className="rankNumber">{String(index + 1).padStart(2, "0")}</span><WeaponIcon label={weapon.label} weaponId={weapon.weaponId} /><div><strong>{weapon.label}</strong><small>{weapon.rarity}★ · R{weapon.refinement}</small></div><label className="weaponRefinement"><span>精炼</span><select aria-label={`${weapon.label}精炼等级`} value={weapon.refinement} onChange={(event) => onWeaponRefinementChange(weapon.weaponId, numberValue(event.target.value, 1))}>{[1, 2, 3, 4, 5].map((refinement) => <option key={refinement} value={refinement}>R{refinement}</option>)}</select></label><span>{formatDamage(weapon.expectedDamage)}</span><b className={weapon.gainRatio >= 0 ? "positive" : "negative"}>{formatPercent(weapon.gainRatio)}</b></div>)}</div>
      </article>
    </div>
  )
}
