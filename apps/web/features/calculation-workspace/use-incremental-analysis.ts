import type { AnalysisResponse, EvaluationScenario, WeaponComparisonResponse } from "@gscombat/contracts"
import { useCallback, useEffect, useRef, useState } from "react"

export interface WeaponRequestState {
  readonly pending?: number
  readonly error?: string
  readonly retryRefinement?: number
}

/** Owns a report's frozen scenario and rejects stale full-report and per-weapon responses. */
export function useIncrementalAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [weaponStates, setWeaponStates] = useState<Record<string, WeaponRequestState>>({})
  const generation = useRef(0)
  const report = useRef<{ scenario: EvaluationScenario; analysis: AnalysisResponse } | null>(null)
  const requests = useRef(new Map<string, AbortController>())

  const invalidate = useCallback(() => {
    generation.current++
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
  const complete = (version: number, scenario: EvaluationScenario, result: AnalysisResponse) => {
    if (!isCurrent(version)) return
    report.current = { scenario: structuredClone(scenario), analysis: result }
    setAnalysis(result)
  }

  const changeRefinement = async (weaponId: string, refinement: number) => {
    const current = report.current
    const weapon = current?.analysis.analysis.weapons.find((item) => item.weaponId === weaponId)
    if (!current || !weapon) return
    const version = generation.current
    requests.current.get(weaponId)?.abort()
    requests.current.delete(weaponId)
    if (weapon.refinement === refinement) {
      setWeaponStates((states) => ({ ...states, [weaponId]: {} }))
      return true
    }
    const controller = new AbortController()
    requests.current.set(weaponId, controller)
    const stillCurrent = () => isCurrent(version) && requests.current.get(weaponId) === controller
    setWeaponStates((states) => ({ ...states, [weaponId]: { pending: refinement } }))
    try {
      const response = await fetch("/api/backend/v1/analysis/weapon-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: current.scenario, weaponId, refinement }),
        signal: controller.signal
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { message?: string }
        throw new Error(body.message ?? `武器比较接口返回 HTTP ${response.status}`)
      }
      const result = await response.json() as WeaponComparisonResponse
      if (!stillCurrent() || !report.current) return
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
        retryRefinement: refinement
      } }))
    } finally {
      if (stillCurrent()) requests.current.delete(weaponId)
    }
  }

  return { analysis, weaponStates, invalidate, isCurrent, complete, changeRefinement }
}
