import type { AnalysisRequest, AnalysisResponse, CoreAnalysisResponse, EvaluationScenario, WeaponComparisonResponse } from "@gscombat/contracts"
import { useCallback, useEffect, useRef, useState } from "react"
import { DEFERRED_EQUIPMENT_ENABLED, useEquipmentComparisons } from "./use-equipment-comparisons"

export interface WeaponRequestState {
  readonly pending?: number
  readonly error?: string
  readonly retryRefinement?: number
  readonly pendingChoices?: Record<string, string>
  readonly retryChoices?: Record<string, string>
}

/** Owns a report's frozen scenario and rejects stale full-report and per-weapon responses. */
export function useIncrementalAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [weaponStates, setWeaponStates] = useState<Record<string, WeaponRequestState>>({})
  const generation = useRef(0)
  const report = useRef<{ scenario: EvaluationScenario; analysis: AnalysisResponse } | null>(null)
  const requests = useRef(new Map<string, AbortController>())
  const equipment = useEquipmentComparisons((weapons) => {
    if (!report.current) return
    const latest = report.current.analysis
    const next = { ...latest, analysis: { ...latest.analysis, weapons } }
    report.current = { ...report.current, analysis: next }
    setAnalysis(next)
  })

  const invalidate = useCallback(() => {
    generation.current++
    equipment.invalidate()
    for (const controller of requests.current.values()) controller.abort()
    requests.current.clear()
    report.current = null
    setWeaponStates({})
    setAnalysis(null)
    return generation.current
  }, [])

  useEffect(() => () => {
    generation.current++
    for (const controller of requests.current.values()) controller.abort()
    requests.current.clear()
    report.current = null
  }, [])

  const isCurrent = (version: number) => generation.current === version
  const complete = (version: number, scenario: AnalysisRequest, result: AnalysisResponse | CoreAnalysisResponse) => {
    if (!isCurrent(version)) return
    report.current = { scenario: structuredClone(scenario), analysis: result }
    setAnalysis(result)
    if (DEFERRED_EQUIPMENT_ENABLED && "computationId" in result) equipment.start(scenario, result.computationId)
  }

  const changeRefinement = async (weaponId: string, refinement: number, overrides?: Record<string, string>) => {
    const current = report.current
    const weapon = current?.analysis.analysis.weapons.find((item) => item.weaponId === weaponId)
    if (!current || !weapon) return
    const choices = overrides ?? weapon.choices
    const version = generation.current
    requests.current.get(weaponId)?.abort()
    requests.current.delete(weaponId)
    if (weapon.refinement === refinement && JSON.stringify(weapon.choices ?? {}) === JSON.stringify(choices ?? {})) {
      setWeaponStates((states) => ({ ...states, [weaponId]: {} }))
      return true
    }
    const controller = new AbortController()
    requests.current.set(weaponId, controller)
    const stillCurrent = () => isCurrent(version) && requests.current.get(weaponId) === controller
    setWeaponStates((states) => ({ ...states, [weaponId]: { pending: refinement, ...(choices ? { pendingChoices: choices } : {}) } }))
    try {
      const response = await fetch("/api/backend/v1/analysis/weapon-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: current.scenario, weaponId, refinement, ...(choices ? { choices } : {}) }),
        signal: controller.signal
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { message?: string }
        throw new Error(body.message ?? `武器比较接口返回 HTTP ${response.status}`)
      }
      const result = await response.json() as WeaponComparisonResponse
      if (!stillCurrent() || !report.current) return
      if (result.engineVersion !== undefined && result.engineVersion !== current.analysis.engineVersion) {
        throw new Error("计算规则已更新，请重新开始完整计算")
      }
      if (result.baselineExpectedDamage !== current.analysis.analysis.baselineExpectedDamage) {
        throw new Error("计算基线已变化，请重新开始完整计算")
      }
      if (result.weapon.weaponId !== weaponId || result.weapon.refinement !== refinement) {
        throw new Error("武器比较响应不匹配，请重试")
      }
      const latest = report.current.analysis
      const next: AnalysisResponse = {
        ...latest,
        analysis: {
          ...latest.analysis,
          weapons: latest.analysis.weapons.map((item) => item.weaponId === weaponId ? result.weapon : item)
            .sort((left, right) => right.expectedDamage - left.expectedDamage)
        }
      }
      report.current = { ...report.current, analysis: next }
      setAnalysis(next)
      setWeaponStates((states) => ({ ...states, [weaponId]: {} }))
      return true
    } catch (caught) {
      if (!stillCurrent()) return
      setWeaponStates((states) => ({ ...states, [weaponId]: {
        error: caught instanceof Error ? caught.message : "武器比较失败",
        retryRefinement: refinement,
        ...(choices ? { retryChoices: choices } : {})
      } }))
    } finally {
      if (stillCurrent()) requests.current.delete(weaponId)
    }
  }

  return { analysis, weaponStates, equipment, invalidate, isCurrent, complete, changeRefinement }
}
