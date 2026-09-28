import { useEffect, useRef, useState } from "react"
import type { AnalysisRequest, AnalysisResponse, ArtifactComparisonResponse, DeferredWeaponResponse } from "@gscombat/contracts"

export const DEFERRED_EQUIPMENT_ENABLED = process.env.NEXT_PUBLIC_DEFERRED_EQUIPMENT !== "false"
export interface ComparisonLoadState { readonly loading: boolean; readonly error?: string }

/** Separate regions own cancellation and retries; requests always carry the complete frozen scenario. */
export function useEquipmentComparisons(onWeapons: (weapons: AnalysisResponse["analysis"]["weapons"]) => void) {
  const [weaponLoad, setWeaponLoad] = useState<ComparisonLoadState>({ loading: false })
  const [artifactLoad, setArtifactLoad] = useState<ComparisonLoadState>({ loading: false })
  const [artifacts, setArtifacts] = useState<ArtifactComparisonResponse | null>(null)
  const [updatedArtifact, setUpdatedArtifact] = useState<string | null>(null)
  const [selectedArtifactId, setSelectedArtifactId] = useState("")
  const selection = useRef("")
  const [notice, setNotice] = useState("")
  const context = useRef<{ scenario: AnalysisRequest; computationId: string } | null>(null)
  const controllers = useRef(new Map<string, AbortController>())
  const choices = useRef<Record<string, Record<string, string>>>({})
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cancel = () => { for (const controller of controllers.current.values()) controller.abort(); controllers.current.clear() }
  const invalidate = () => {
    cancel(); context.current = null; choices.current = {}; clearTimeout(timer.current)
    selection.current = ""; setSelectedArtifactId("")
    setArtifacts(null); setUpdatedArtifact(null); setNotice("")
    setWeaponLoad({ loading: false }); setArtifactLoad({ loading: false })
  }
  useEffect(() => () => { cancel(); clearTimeout(timer.current) }, [])

  const load = async (kind: "weapons" | "artifacts", candidateId?: string) => {
    const current = context.current
    if (!current) return
    controllers.current.get(kind)?.abort()
    const controller = new AbortController()
    controllers.current.set(kind, controller)
    const fresh = () => context.current === current && controllers.current.get(kind) === controller && !controller.signal.aborted
    const setLoad = kind === "weapons" ? setWeaponLoad : setArtifactLoad
    setLoad({ loading: true })
    try {
      const path = kind === "weapons" ? "weapons" : `artifact-loadouts${candidateId ? "/candidate" : ""}`
      const response = await fetch(`/api/backend/v1/analysis/${path}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ ...current, ...(kind === "artifacts" ? { choices: choices.current,
          ...(selection.current ? { selectedCandidateId: selection.current } : {}),
          ...(candidateId ? { candidateId } : {}) } : {}) })
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { message?: string }
        throw new Error(body.message ?? `比较接口返回 HTTP ${response.status}`)
      }
      const result = await response.json() as ArtifactComparisonResponse | DeferredWeaponResponse
      if (!fresh()) return
      if (result.computationId !== current.computationId) throw new Error("比较结果已过期，请重新计算")
      if ("weapons" in result) onWeapons(result.weapons)
      else {
        setArtifacts(result)
        setNotice(candidateId && result.changedCandidateVisible === false ? "该候选已移出展示范围，列表已重新排序。" : "")
        setUpdatedArtifact(candidateId ?? (selection.current || null))
        clearTimeout(timer.current)
        timer.current = setTimeout(() => { setUpdatedArtifact(null); setNotice("") }, 3200)
      }
      setLoad({ loading: false })
    } catch (error) {
      if (fresh()) setLoad({ loading: false, error: error instanceof Error ? error.message : "比较失败" })
    } finally { if (fresh()) controllers.current.delete(kind) }
  }

  const start = (scenario: AnalysisRequest, computationId: string) => {
    invalidate()
    context.current = { scenario: structuredClone(scenario), computationId }
    void load("weapons"); void load("artifacts")
  }
  const changeArtifact = (id: string, next: Record<string, string>) => {
    choices.current = { ...choices.current, [id]: next }
    void load("artifacts", id)
  }
  const selectArtifact = (id: string) => {
    selection.current = id; setSelectedArtifactId(id)
    setArtifacts(previous => {
      if (!previous) return previous
      const { selectedCandidate: _selected, ...rest } = previous
      return rest
    })
    setUpdatedArtifact(null); setNotice(""); clearTimeout(timer.current)
    void load("artifacts")
  }
  return { start, invalidate, artifacts, artifactLoad, weaponLoad, updatedArtifact, notice, changeArtifact, selectedArtifactId, selectArtifact,
    retryWeapons: () => { void load("weapons") }, retryArtifacts: () => { void load("artifacts") } }
}

export type EquipmentComparisonState = ReturnType<typeof useEquipmentComparisons>
