// @vitest-environment jsdom
import { createElement, act } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, expect, it, vi } from "vitest"
import { raidenNationalBuiltinScenario } from "@gscombat/content"
import type { AnalysisResponse, ArtifactComparisonResult, CatalogResponse } from "@gscombat/contracts"
import { useIncrementalAnalysis } from "../../features/calculation-workspace/use-incremental-analysis"
import { ArtifactComparisonReport } from "../../features/calculation-report/artifact-comparison-report"

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let current: ReturnType<typeof useIncrementalAnalysis>
let root: ReturnType<typeof createRoot> | undefined
function Harness() { current = useIncrementalAnalysis(); return null }
function ReportHarness() {
  current = useIncrementalAnalysis()
  return createElement(ArtifactComparisonReport, { equipment: current.equipment, catalog: { artifactSets: [] } as unknown as CatalogResponse })
}
const selectedFixture: ArtifactComparisonResult = { id: "four:BlizzardStrayer", label: "冰风迷途的勇士 · 四件套",
  kind: "four_piece", counts: { BlizzardStrayer: 4 }, combinations: [["BlizzardStrayer"]], theoretical: false,
  expectedDamage: 100, deltaDamage: 0, gainRatio: 0, critConversions: [], choices: { targetFrozen: "false" },
  choiceGroups: [{ id: "targetFrozen", label: "目标冻结", options: [{ value: "false", label: "未冻结" }, { value: "true", label: "已冻结" }] }] }
const report = { engineVersion: "test", analysis: { baselineExpectedDamage: 100, weapons: [] },
  evaluation: { marker: "core" } } as unknown as AnalysisResponse
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status })
const artifacts = { computationId: "first", baselineExpectedDamage: 100, candidateCount: 2, complete: true,
  selectableFourPieceCandidates: [], results: [], failures: [], excludedSets: [] }
afterEach(async () => { await act(async () => root?.unmount()); vi.unstubAllGlobals() })

it("shows equal and below-ranking selections, deduplicates ranked selections, and clears only the pinned row", async () => {
  const ranked = { ...selectedFixture, id: "four:EmblemOfSeveredFate", label: "绝缘之旗印 · 四件套", expectedDamage: 120,
    deltaDamage: 20, gainRatio: 0.2, choices: {}, choiceGroups: [] }
  const base = { ...artifacts, results: [ranked], selectableFourPieceCandidates: [selectedFixture, ranked].map(({ id, label }) => ({ id, label })) }
  const improved = { ...selectedFixture, expectedDamage: 130, deltaDamage: 30, gainRatio: 0.3, choices: { targetFrozen: "true" },
    critConversions: [{ eventId: "hit", ownerId: "primary", critRateConverted: 0.1, critDamageAdded: 0.2 }] }
  const lower = { ...selectedFixture, expectedDamage: 80, deltaDamage: -20, gainRatio: -0.2 }
  const fetchMock = vi.fn().mockResolvedValueOnce(reply({ computationId: "first", weapons: [] }))
    .mockResolvedValueOnce(reply(base)).mockResolvedValueOnce(reply({ ...base, selectedCandidate: selectedFixture }))
    .mockResolvedValueOnce(reply({ ...base, results: [improved, ranked], selectedCandidate: improved, changedCandidateVisible: true }))
    .mockResolvedValueOnce(reply({ ...base, selectedCandidate: lower, changedCandidateVisible: true })).mockResolvedValueOnce(reply(base))
  vi.stubGlobal("fetch", fetchMock)
  const container = document.createElement("div")
  root = createRoot(container)
  await act(async () => root!.render(createElement(ReportHarness)))
  await act(async () => current.complete(current.invalidate(), raidenNationalBuiltinScenario, { ...report, computationId: "first" }))
  const select = container.querySelector<HTMLSelectElement>('[aria-label="指定套装"]')!
  await act(async () => { select.value = selectedFixture.id; select.dispatchEvent(new Event("change", { bubbles: true })) })
  expect(container.querySelectorAll(".artifactComparisonRow")).toHaveLength(2)
  expect(container.querySelector('[data-selected="true"]')?.textContent).toContain("100.0")
  expect(container.querySelector('[data-selected="true"]')?.textContent).toContain("已指定")
  expect(container.querySelector('[data-updated="true"]')).not.toBeNull()
  const change = async (value: string) => act(async () => {
    const choice = container.querySelector<HTMLSelectElement>('[data-selected="true"] select')!
    choice.value = value; choice.dispatchEvent(new Event("change", { bubbles: true }))
  })
  await change("true")
  expect(JSON.parse(fetchMock.mock.calls[3]![1].body)).toMatchObject({ selectedCandidateId: selectedFixture.id, candidateId: selectedFixture.id })
  expect(container.querySelectorAll(".artifactComparisonRow")).toHaveLength(2)
  expect(container.querySelector('[data-selected="true"]')?.textContent).toContain("理论调配")
  await change("false")
  expect(container.querySelector('[data-selected="true"]')?.textContent).toContain("80.0")
  expect(current.equipment.notice).toBe("")
  await act(async () => [...container.querySelectorAll("button")].find(button => button.textContent === "清除选择")!.click())
  expect(container.querySelectorAll(".artifactComparisonRow")).toHaveLength(1)
  expect(container.querySelector('[data-selected="true"]')).toBeNull()
  expect(JSON.parse(fetchMock.mock.calls[5]![1].body).selectedCandidateId).toBeUndefined()
  expect(fetchMock.mock.calls.filter(call => call[0].includes("/weapons"))).toHaveLength(1)
  expect(fetchMock.mock.calls.some(call => call[0].includes("/core"))).toBe(false)
  expect(current.analysis?.evaluation).toEqual(report.evaluation)
})

it("ignores obsolete selections after rapid changes, clearing, and a new scene; selection failure retains other results", async () => {
  const pending: { body: Record<string, unknown>; done: (response: Response) => void }[] = []
  vi.stubGlobal("fetch", vi.fn((_url: string, init: RequestInit) => new Promise<Response>(done =>
    pending.push({ body: JSON.parse(String(init.body)), done }))))
  root = createRoot(document.createElement("div"))
  await act(async () => root!.render(createElement(Harness)))
  await act(async () => current.complete(current.invalidate(), raidenNationalBuiltinScenario, { ...report, computationId: "first" }))
  await act(async () => { pending[0]!.done(reply({ computationId: "first", weapons: [] })); pending[1]!.done(reply(artifacts)) })
  await act(async () => current.equipment.selectArtifact(selectedFixture.id))
  await act(async () => current.equipment.selectArtifact("four:MaidenBeloved"))
  await act(async () => pending[2]!.done(reply({ ...artifacts, selectedCandidate: selectedFixture })))
  expect(current.equipment.selectedArtifactId).toBe("four:MaidenBeloved")
  expect(current.equipment.artifacts?.selectedCandidate).toBeUndefined()
  await act(async () => pending[3]!.done(reply({ message: "暂时繁忙" }, 503)))
  expect(current.equipment.artifactLoad.error).toBe("暂时繁忙")
  expect(current.equipment.artifacts?.baselineExpectedDamage).toBe(100)
  await act(async () => current.equipment.retryArtifacts())
  expect(pending[4]!.body.selectedCandidateId).toBe("four:MaidenBeloved")
  await act(async () => current.equipment.selectArtifact(""))
  await act(async () => pending[4]!.done(reply({ ...artifacts, selectedCandidate: { ...selectedFixture, id: "four:MaidenBeloved" } })))
  expect(current.equipment.selectedArtifactId).toBe("")
  expect(current.equipment.artifacts?.selectedCandidate).toBeUndefined()
  await act(async () => pending[5]!.done(reply(artifacts)))
  await act(async () => current.equipment.selectArtifact(selectedFixture.id))
  await act(async () => current.complete(current.invalidate(), raidenNationalBuiltinScenario, { ...report, computationId: "second" }))
  await act(async () => pending[6]!.done(reply({ ...artifacts, selectedCandidate: selectedFixture })))
  expect(current.equipment.selectedArtifactId).toBe("")
  expect(current.equipment.artifacts).toBeNull()
  expect(current.analysis?.evaluation).toEqual(report.evaluation)
})

it("renders the core immediately while independent comparisons load, retries one failure and ignores an obsolete scene", async () => {
  const pending: { url: string; done: (response: Response) => void }[] = []
  vi.stubGlobal("fetch", vi.fn((url: string) => new Promise<Response>(done => pending.push({ url, done }))))
  root = createRoot(document.createElement("div"))
  await act(async () => root!.render(createElement(Harness)))
  await act(async () => current.complete(current.invalidate(), raidenNationalBuiltinScenario, { ...report, computationId: "first" }))
  expect(current.analysis?.evaluation).toEqual(report.evaluation)
  expect(current.equipment.weaponLoad.loading).toBe(true)
  expect(current.equipment.artifactLoad.loading).toBe(true)
  await act(async () => pending[0]!.done(reply({ message: "暂时繁忙" }, 429)))
  expect(current.equipment.weaponLoad.error).toBe("暂时繁忙")
  await act(async () => pending[1]!.done(reply(artifacts)))
  expect(current.equipment.artifacts?.complete).toBe(true)
  await act(async () => current.equipment.retryWeapons())
  expect(pending[2]!.url).toContain("/weapons")
  await act(async () => {
    current.invalidate()
    current.complete(current.invalidate(), raidenNationalBuiltinScenario, { ...report, computationId: "second" })
  })
  await act(async () => pending[2]!.done(reply({ computationId: "first", weapons: [{ weaponId: "stale" }] })))
  expect(current.analysis?.analysis.weapons).toEqual([])
  expect(current.equipment.artifacts).toBeNull()
})

it("changes only one artifact candidate, sends retained choices, and reports a row leaving the ranking", async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce(reply({ computationId: "first", weapons: [] }))
    .mockResolvedValueOnce(reply(artifacts))
    .mockResolvedValueOnce(reply({ ...artifacts, changedCandidateVisible: false }))
  vi.stubGlobal("fetch", fetchMock)
  root = createRoot(document.createElement("div"))
  await act(async () => root!.render(createElement(Harness)))
  await act(async () => current.complete(current.invalidate(), raidenNationalBuiltinScenario, { ...report, computationId: "first" }))
  await act(async () => current.equipment.changeArtifact("four:BlizzardStrayer", { targetFrozen: "true" }))
  expect(fetchMock).toHaveBeenCalledTimes(3)
  const last = fetchMock.mock.calls[2]!
  expect(last[0]).toContain("/artifact-loadouts/candidate")
  expect(JSON.parse(last[1].body)).toMatchObject({ candidateId: "four:BlizzardStrayer", choices: { "four:BlizzardStrayer": { targetFrozen: "true" } } })
  expect(current.equipment.notice).toContain("移出展示范围")
  expect(current.analysis?.evaluation).toEqual(report.evaluation)
})

it("shows categories, theoretical conversion and only ranked candidates' controls", async () => {
  const changeArtifact = vi.fn()
  const result: ArtifactComparisonResult = { id: "four:BlizzardStrayer", label: "冰风迷途的勇士 · 4件套", kind: "four_piece",
    counts: { BlizzardStrayer: 4 }, combinations: [["BlizzardStrayer"]],
    critConversions: [{ ownerId: "primary", eventId: "hit", critRateConverted: 0.1, critDamageAdded: 0.2 }],
    theoretical: true, fourStarSlots: ["flower", "plume", "sands", "circlet"], expectedDamage: 110, deltaDamage: 10, gainRatio: 0.1,
    choices: { targetFrozen: "false" }, choiceGroups: [{ id: "targetFrozen", label: "目标冻结",
      options: [{ value: "false", label: "未冻结" }, { value: "true", label: "已冻结" }] }] }
  const catalog = { artifactSets: [
    { setId: "GladiatorsFinale", label: "角斗士的终幕礼" }, { setId: "WanderersTroupe", label: "流浪大地的乐团" },
    { setId: "ShimenawasReminiscence", label: "追忆之注连" }
  ] } as CatalogResponse
  const container = document.createElement("div")
  root = createRoot(container)
  const pair: ArtifactComparisonResult = { ...result, id: "two:attack", label: "攻击力＋攻击力 · 2＋2", kind: "two_plus_two",
    counts: { GladiatorsFinale: 2, ShimenawasReminiscence: 2 }, combinations: [["GladiatorsFinale", "ShimenawasReminiscence"]],
    critConversions: [], fourStarSlots: [], choiceGroups: [], choices: {}, theoretical: false }
  await act(async () => root!.render(createElement(ArtifactComparisonReport, { catalog, equipment: {
    artifacts: { ...artifacts, results: [result, pair] }, artifactLoad: { loading: false }, weaponLoad: { loading: false },
    updatedArtifact: result.id, notice: "", changeArtifact, start: vi.fn(), invalidate: vi.fn(),
    retryArtifacts: vi.fn(), retryWeapons: vi.fn(), selectedArtifactId: "", selectArtifact: vi.fn()
  } })))
  expect(container.textContent).not.toContain("等价搭配")
  expect(container.textContent).not.toContain("未纳入")
  expect(container.textContent).toContain("新增溢出暴击率 +10.0% 转换为暴击伤害 +20.0%")
  expect(container.querySelectorAll(".artifactComparisonRow")[1]?.textContent).toContain("攻击力＋攻击力 · 2＋2")
  expect(container.querySelectorAll(".artifactComparisonRow")[1]?.textContent).not.toContain("已将")
  expect(container.querySelector("p strong")?.textContent).toContain("四星部位主词条按四星满级计算")
  expect(container.textContent).toContain("缺件时假设凑齐套装")
  expect(container.textContent).toContain("四星套装：保留当前五星圣遗物副词条，但实际换为四星后会少词条。")
  expect(container.textContent).toContain("四星满级部位：花、羽、沙、冠")
  expect(container.textContent).not.toContain("理论等属性")
  expect(container.querySelectorAll(".weaponChoices select")).toHaveLength(1)
  expect(container.querySelector('[data-updated="true"]')).not.toBeNull()
  const select = container.querySelector<HTMLSelectElement>(".weaponChoices select")!
  await act(async () => { select.value = "true"; select.dispatchEvent(new Event("change", { bubbles: true })) })
  expect(changeArtifact).toHaveBeenCalledWith(result.id, { targetFrozen: "true" })
})
