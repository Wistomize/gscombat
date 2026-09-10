// @vitest-environment jsdom
import { raidenNationalBuiltinScenario } from "@gscombat/content"
import type { AnalysisResponse, WeaponComparisonResponse } from "@gscombat/contracts"
import { act, createElement } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, expect, it, vi } from "vitest"
import { useIncrementalAnalysis } from "../../features/calculation-workspace/use-incremental-analysis"

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true
let root: ReturnType<typeof createRoot> | undefined
let current: ReturnType<typeof useIncrementalAnalysis>
const fixture = {
  analysis: { baselineExpectedDamage: 100, weapons: ["first", "second"].map((weaponId) => ({
    weaponId, refinement: 1, expectedDamage: 100, gainRatio: 0, rarity: 5, label: weaponId
  })), marginalSubstats: [], effectiveArtifacts: [], progressionGains: [], totalEffectiveRolls: 0 },
  evaluation: { marker: "preserved" }, engineVersion: "test"
} as unknown as AnalysisResponse
function Harness() { current = useIncrementalAnalysis(); return null }
async function mount() {
  root = createRoot(document.createElement("div"))
  await act(async () => root!.render(createElement(Harness)))
  await act(async () => current.complete(current.invalidate(), raidenNationalBuiltinScenario, structuredClone(fixture)))
}
const result = (weaponId: string, refinement: number): WeaponComparisonResponse => ({
  baselineExpectedDamage: 100,
  weapon: { weaponId, refinement, expectedDamage: 100 + refinement, gainRatio: refinement / 100, rarity: 5, label: weaponId }
})
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
afterEach(async () => { await act(async () => root?.unmount()); vi.unstubAllGlobals() })

it("merges independent rows and rejects superseded responses even when transport ignores abort", async () => {
  const pending: ((value: Response) => void)[] = []
  const fetchMock = vi.fn(() => new Promise<Response>((resolve) => pending.push(resolve)))
  vi.stubGlobal("fetch", fetchMock)
  await mount()
  await act(async () => { void current.changeRefinement("first", 2) })
  await act(async () => { void current.changeRefinement("first", 3); void current.changeRefinement("second", 4) })
  await act(async () => pending[2]!(reply(result("second", 4))))
  await act(async () => pending[1]!(reply(result("first", 3))))
  await act(async () => pending[0]!(reply(result("first", 2))))
  expect(current.analysis?.analysis.weapons.map((weapon) => [weapon.weaponId, weapon.refinement])).toEqual([["second", 4], ["first", 3]])
  expect(current.analysis?.evaluation).toEqual(fixture.evaluation)
  expect(fetchMock.mock.calls).toHaveLength(3)
  await act(async () => { await current.changeRefinement("first", 3) })
  expect(fetchMock.mock.calls).toHaveLength(3)
})

it("invalidates pending rows and full reports when the scenario changes", async () => {
  let resolve!: (value: Response) => void
  vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>((done) => { resolve = done })))
  await mount()
  let oldVersion = 0
  await act(async () => { oldVersion = current.invalidate(); current.complete(oldVersion, raidenNationalBuiltinScenario, fixture) })
  await act(async () => { void current.changeRefinement("first", 2) })
  await act(async () => { current.invalidate(); current.complete(oldVersion, raidenNationalBuiltinScenario, fixture) })
  await act(async () => resolve(reply(result("first", 2))))
  expect(current.analysis).toBeNull()
  expect(current.weaponStates).toEqual({})
})

it("preserves successful precision on failure and supports retry without full analysis", async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce(reply({ message: "temporary failure" }, 500))
    .mockResolvedValueOnce(reply(result("first", 2)))
  vi.stubGlobal("fetch", fetchMock)
  await mount()
  await act(async () => current.changeRefinement("first", 2))
  expect(current.weaponStates.first).toEqual({ error: "temporary failure", retryRefinement: 2 })
  expect(current.analysis?.analysis.weapons[0]?.refinement).toBe(1)
  await act(async () => current.changeRefinement("first", 2))
  expect(current.analysis?.analysis.weapons[0]?.refinement).toBe(2)
  expect(current.weaponStates.first).toEqual({})
  expect(fetchMock.mock.calls.every(([url]) => url.endsWith("/weapon-comparison"))).toBe(true)
})
