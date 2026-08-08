"use client"

import type {
  ActionEffectOptionsRequest,
  ActionEffectOptionsResponse,
  AnalysisResponse,
  CatalogResponse,
  CharacterBuild,
  EvaluationScenario,
  SupportMetricEvaluationResponse
} from "@gscombat/contracts"
import { useEffect, useMemo, useState } from "react"

import { getCharacterElement } from "../../components/ui/visual-icons"
import { loadBuildLibrary, loadParty } from "../../lib/workspace/workspace-config"
import { CalculationResults } from "../calculation-report/calculation-results"
import { CalculationScenario } from "../calculation-setup/calculation-scenario"
import { CalculationTargetSelector } from "../calculation-setup/calculation-target-selector"
import {
  createSupportMetricContextDraft,
  createSupportMetricEvaluationContext,
  getDefaultActionParameters,
  getMaximumReachableConditions,
  reconcileScenarioEffectIds,
  removeUnavailableResonanceConditions,
  validateSupportMetricContext,
  type CatalogPrimaryAction,
  type CatalogSupportMetric,
  type ScenarioEffectOption,
  type SupportMetricContextDraft
} from "../calculation-setup/model"
import { assembleEvaluationScenario } from "../calculation-setup/scenario-adapter"

interface TeamCalculationWorkspaceProps {
  readonly catalog: CatalogResponse
  readonly initialScenario: EvaluationScenario
}

export function TeamCalculationWorkspace({ catalog, initialScenario }: TeamCalculationWorkspaceProps) {
  const fallbackBuilds = useMemo(() => [initialScenario.primary, ...initialScenario.teammates], [initialScenario])
  const [builds, setBuilds] = useState<CharacterBuild[]>([])
  const [partyBuildIds, setPartyBuildIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const [targetBuildId, setTargetBuildId] = useState<string | null>(null)
  const [targetActionId, setTargetActionId] = useState<string | null>(null)
  const [supportMetricId, setSupportMetricId] = useState<string | null>(null)
  const [supportMetricContext, setSupportMetricContext] = useState<SupportMetricContextDraft>({})
  const [conditions, setConditions] = useState<EvaluationScenario["conditions"]>(() => {
    const { activeEffectSourceBuildIds: _activeEffectSourceBuildIds, ...initialConditions } = initialScenario.conditions
    return { ...initialConditions, activeEffectIds: [], equipmentEffectMode: "maximum_reachable" }
  })
  const [enemy, setEnemy] = useState(initialScenario.enemy)
  const [buffs, setBuffs] = useState([...initialScenario.externalBuffs])
  const [selectedCharacterEffectIds, setSelectedCharacterEffectIds] = useState<string[]>([])
  const [scenarioEffectOptions, setScenarioEffectOptions] = useState<ScenarioEffectOption[]>([])
  const [scenarioEffectOptionsStatus, setScenarioEffectOptionsStatus] = useState<"error" | "idle" | "loading" | "ready">("idle")
  const [scenarioEffectOptionsError, setScenarioEffectOptionsError] = useState("")
  const [scenarioEffectReloadVersion, setScenarioEffectReloadVersion] = useState(0)
  const [weaponComparisonRefinements, setWeaponComparisonRefinements] = useState<Record<string, number>>({})
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [supportMetricResponse, setSupportMetricResponse] = useState<SupportMetricEvaluationResponse | null>(null)
  const [status, setStatus] = useState("请选择计算对象和指标")
  const [error, setError] = useState("")

  useEffect(() => {
    try {
      const library = loadBuildLibrary(window.localStorage, fallbackBuilds)
      const party = loadParty(window.localStorage, library.builds)
      setBuilds([...library.builds])
      setPartyBuildIds([...party.memberBuildIds])
      if (party.memberBuildIds.length === 0) setError("当前队伍为空，请返回配置页选择队伍成员")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "无法读取队伍配置")
    } finally {
      setReady(true)
    }
  }, [fallbackBuilds])

  const partyBuilds = partyBuildIds.flatMap((buildId) => {
    const build = builds.find((candidate) => candidate.buildId === buildId)
    return build ? [build] : []
  })
  const partyElementCounts = partyBuilds.reduce(
    (counts, build) => {
      const element = getCharacterElement(build.characterId)
      if (element !== "traveler") counts.set(element, (counts.get(element) ?? 0) + 1)
      return counts
    },
    new Map<string, number>()
  )
  const hasCryoResonance = (partyElementCounts.get("cryo") ?? 0) >= 2
  const hasGeoResonance = (partyElementCounts.get("geo") ?? 0) >= 2
  const targetBuild = partyBuilds.find((build) => build.buildId === targetBuildId)
  const targetCharacter = catalog.characters.find((character) => character.characterId === targetBuild?.characterId)
  const targetAction = targetCharacter?.primaryActions.find((action) => action.id === targetActionId)
  const selectedSupportMetric = targetCharacter?.supportMetrics.find((metric) => metric.id === supportMetricId)
  const teammates = targetBuild ? partyBuilds.filter((build) => build.buildId !== targetBuild.buildId) : []
  const actionEffectRequest = useMemo<ActionEffectOptionsRequest | null>(() => {
    if (!targetActionId || !targetBuildId) return null
    const requestParty = partyBuildIds.flatMap((buildId) => {
      const build = builds.find((candidate) => candidate.buildId === buildId)
      return build ? [build] : []
    })
    const primary = requestParty.find((build) => build.buildId === targetBuildId)
    if (!primary) return null
    return {
      actionId: targetActionId,
      primary,
      teammates: requestParty.filter((build) => build.buildId !== primary.buildId)
    }
  }, [builds, partyBuildIds, targetActionId, targetBuildId])
  const characterEffectOptions = targetBuild
    ? scenarioEffectOptions.filter(
        (effect) => effect.source.kind === "character" && effect.requiredActiveEffectIds === undefined
      )
    : []
  const selectableEffectGroups = targetBuild
    ? [...scenarioEffectOptions
        .filter((effect) => effect.selectionMode !== undefined)
        .reduce((groups, effect) => {
          const group = effect.exclusiveGroup ?? effect.id
          groups.set(group, [...(groups.get(group) ?? []), effect])
          return groups
        }, new Map<string, ScenarioEffectOption[]>())]
    : []
  const hasUnselectedRequiredEffect = selectableEffectGroups.some(([, effects]) =>
    effects[0]?.selectionMode === "required" &&
    !effects.some((effect) => selectedCharacterEffectIds.includes(effect.id))
  )

  useEffect(() => {
    if (!actionEffectRequest) {
      setScenarioEffectOptions([])
      setScenarioEffectOptionsError("")
      setScenarioEffectOptionsStatus("idle")
      return
    }

    const controller = new AbortController()
    setScenarioEffectOptions([])
    setScenarioEffectOptionsError("")
    setScenarioEffectOptionsStatus("loading")
    void (async () => {
      try {
        const response = await fetch("/api/backend/v1/action-effect-options", {
          body: JSON.stringify(actionEffectRequest),
          headers: { "Content-Type": "application/json" },
          method: "POST",
          signal: controller.signal
        })
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { message?: string }
          throw new Error(body.message ?? `动作效果接口返回 HTTP ${response.status}`)
        }
        const body = (await response.json()) as ActionEffectOptionsResponse
        if (!Array.isArray(body.options)) throw new Error("动作效果接口返回格式无效")
        setScenarioEffectOptions([...body.options])
        setSelectedCharacterEffectIds((current) => reconcileScenarioEffectIds(current, body.options))
        setScenarioEffectOptionsStatus("ready")
      } catch (caught) {
        if (controller.signal.aborted) return
        setScenarioEffectOptionsError(caught instanceof Error ? caught.message : "动作效果加载失败")
        setScenarioEffectOptionsStatus("error")
      }
    })()
    return () => controller.abort()
  }, [actionEffectRequest, scenarioEffectReloadVersion])

  useEffect(() => {
    setConditions((current) => {
      const shouldClearShield = !hasGeoResonance && current.primaryShielded !== undefined
      const shouldClearFrozen = !hasCryoResonance && current.targetFrozen !== undefined
      if (!shouldClearShield && !shouldClearFrozen) return current

      const next = { ...current }
      if (shouldClearShield) delete next.primaryShielded
      if (shouldClearFrozen) delete next.targetFrozen
      return next
    })
  }, [hasCryoResonance, hasGeoResonance])

  const clearResults = () => {
    setAnalysis(null)
    setSupportMetricResponse(null)
  }

  const selectTargetBuild = (buildId: string) => {
    setTargetBuildId(buildId)
    setTargetActionId(null)
    setSupportMetricId(null)
    setSupportMetricContext({})
    setSelectedCharacterEffectIds([])
    clearResults()
    setStatus("请选择该角色的计算指标")
  }

  const selectDamageMetric = (action: CatalogPrimaryAction) => {
    setTargetActionId(action.id)
    setSupportMetricId(null)
    setSupportMetricContext({})
    setSelectedCharacterEffectIds([])
    setConditions((current) => {
      const {
        actionParameters: _actionParameters,
        activeEffectSourceBuildIds: _activeEffectSourceBuildIds,
        ...retainedConditions
      } = current
      const actionParameters = getDefaultActionParameters(action)
      return {
        ...retainedConditions,
        activeEffectIds: [],
        ...(actionParameters ? { actionParameters } : {})
      }
    })
    clearResults()
    setStatus(`已选择指标：${action.label}`)
  }

  const selectSupportMetric = (metric: CatalogSupportMetric) => {
    setSupportMetricId(metric.id)
    setTargetActionId(null)
    setSupportMetricContext(createSupportMetricContextDraft())
    setSelectedCharacterEffectIds([])
    clearResults()
    setStatus(`已选择指标：${metric.label}`)
  }

  const runAnalysis = async (refinementOverrides: Readonly<Record<string, number>> = weaponComparisonRefinements) => {
    if (!targetBuild) {
      setError("请选择计算对象")
      return
    }
    setError("")
    if (selectedSupportMetric) {
      const contextError = validateSupportMetricContext(selectedSupportMetric, targetBuild, supportMetricContext)
      if (contextError) {
        setError(contextError)
        return
      }
      setStatus("正在计算辅助指标…")
      try {
        const response = await fetch("/api/backend/v1/support-metrics/evaluate", {
          body: JSON.stringify({
            build: targetBuild,
            context: createSupportMetricEvaluationContext(supportMetricContext, teammates),
            metricId: selectedSupportMetric.id
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        })
        if (!response.ok) throw new Error(`辅助指标接口返回 HTTP ${response.status}`)
        setAnalysis(null)
        setSupportMetricResponse((await response.json()) as SupportMetricEvaluationResponse)
        setStatus("辅助指标计算完成")
      } catch (caught) {
        setStatus("计算失败")
        setError(caught instanceof Error ? caught.message : "辅助指标计算失败")
      }
      return
    }
    if (!targetAction) {
      setError("请选择目标指标")
      return
    }
    if (scenarioEffectOptionsStatus !== "ready") {
      setError("当前指标的可用效果尚未加载完成")
      return
    }
    if (hasUnselectedRequiredEffect) {
      setError("请先选择所有必选 Buff")
      return
    }

    setStatus("正在计算指标与边际收益…")
    try {
      const effectiveConditions = getMaximumReachableConditions(
        removeUnavailableResonanceConditions(conditions, hasCryoResonance, hasGeoResonance),
        scenarioEffectOptions,
        targetBuild,
        teammates,
        selectedCharacterEffectIds
      )
      const scenario = assembleEvaluationScenario({
        baseScenario: initialScenario,
        buffs,
        conditions: effectiveConditions,
        enemy,
        metricOwnerBuildId: targetBuild.buildId,
        partyBuilds,
        targetActionId: targetAction.id
      })
      const response = await fetch("/api/backend/v1/analysis", {
        body: JSON.stringify({ ...scenario, weaponComparisonRefinements: refinementOverrides }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(body.message ?? `分析接口返回 HTTP ${response.status}`)
      }
      setSupportMetricResponse(null)
      setAnalysis((await response.json()) as AnalysisResponse)
      setStatus("计算完成")
    } catch (caught) {
      setStatus("计算失败")
      setError(caught instanceof Error ? caught.message : "指标计算失败")
    }
  }

  const changeWeaponComparisonRefinement = (weaponId: string, refinement: number) => {
    const nextRefinements = { ...weaponComparisonRefinements, [weaponId]: refinement }
    setWeaponComparisonRefinements(nextRefinements)
    void runAnalysis(nextRefinements)
  }

  const toggleBuffPreset = (presetId: string) => {
    const preset = catalog.buffPresets.find((candidate) => candidate.id === presetId)
    if (!preset) return
    clearResults()
    setBuffs((current) => current.some((buff) => buff.sourceId === presetId)
      ? current.filter((buff) => buff.sourceId !== presetId)
      : [...current, ...preset.buffs])
  }

  const toggleCharacterEffect = (effectId: string) => {
    clearResults()
    setSelectedCharacterEffectIds((current) => current.includes(effectId)
      ? current.filter((candidate) => candidate !== effectId)
      : [...current, effectId])
  }

  const selectScenarioEffect = (groupEffects: readonly ScenarioEffectOption[], effectId: string) => {
    clearResults()
    const groupIds = new Set(groupEffects.map((effect) => effect.id))
    const selectedEffect = groupEffects.find((effect) => effect.id === effectId)
    const selectedVariantIds = selectedEffect
      ? groupEffects
          .filter((effect) => (effect.exclusiveVariant ?? effect.id) ===
            (selectedEffect.exclusiveVariant ?? selectedEffect.id))
          .map((effect) => effect.id)
      : []
    setSelectedCharacterEffectIds((current) => [
      ...current.filter((candidate) => !groupIds.has(candidate)),
      ...selectedVariantIds
    ])
  }

  return (
    <main className="workspacePage calculationPage">
      <header className="workspaceHeader">
        <div><strong>原神指标分析</strong><span>{status}</span></div>
        <a className="workspaceBackLink" href="/">← 返回配置</a>
      </header>

      <section className="workspaceIntro">
        <span>CALCULATION</span><h1>选择成员与指标</h1><p>队伍保持不变；切换计算对象只改变本次请求的指标来源。</p>
      </section>

      {error ? <div className="workspaceError" role="alert"><span>{error}</span><button type="button" onClick={() => setError("")}>×</button></div> : null}

      <section className="calculationSetup">
        <CalculationTargetSelector
          catalog={catalog}
          partyBuilds={partyBuilds}
          ready={ready}
          supportMetricId={supportMetricId}
          targetActionId={targetActionId}
          targetBuildId={targetBuildId}
          targetCharacter={targetCharacter}
          onSelectDamageMetric={selectDamageMetric}
          onSelectSupportMetric={selectSupportMetric}
          onSelectTargetBuild={selectTargetBuild}
        />

        {(targetAction || selectedSupportMetric) && targetBuild ? (
          <CalculationScenario
            buffs={buffs}
            catalog={catalog}
            characterEffectOptions={characterEffectOptions}
            conditions={conditions}
            enemy={enemy}
            hasCryoResonance={hasCryoResonance}
            hasGeoResonance={hasGeoResonance}
            hasUnselectedRequiredEffect={hasUnselectedRequiredEffect}
            partyBuilds={partyBuilds}
            scenarioEffectOptionsError={scenarioEffectOptionsError}
            scenarioEffectOptionsStatus={scenarioEffectOptionsStatus}
            selectedCharacterEffectIds={selectedCharacterEffectIds}
            selectedSupportMetric={selectedSupportMetric}
            supportMetricContext={supportMetricContext}
            targetAction={targetAction}
            targetBuild={targetBuild}
            onBuffPresetToggle={toggleBuffPreset}
            onCharacterEffectToggle={toggleCharacterEffect}
            onConditionsChange={(update) => {
              clearResults()
              setConditions(update)
            }}
            onEnemyChange={(update) => {
              clearResults()
              setEnemy(update)
            }}
            selectableEffectGroups={selectableEffectGroups}
            onScenarioEffectSelect={selectScenarioEffect}
            onReloadEffects={() => setScenarioEffectReloadVersion((current) => current + 1)}
            onRunAnalysis={() => runAnalysis()}
            onSupportMetricContextChange={setSupportMetricContext}
          />
        ) : null}
      </section>

      <CalculationResults
        analysis={analysis}
        catalog={catalog}
        selectedSupportMetric={selectedSupportMetric}
        supportMetricResponse={supportMetricResponse}
        targetAction={targetAction}
        targetBuild={targetBuild}
        onWeaponRefinementChange={changeWeaponComparisonRefinement}
      />
    </main>
  )
}
