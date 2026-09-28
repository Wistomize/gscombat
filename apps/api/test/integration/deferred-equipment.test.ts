import { EquipmentComparisonSession, evaluateScenarioAnalysis } from "@gscombat/analyzer"
import { raidenNationalBuiltinScenario } from "@gscombat/content"
import { DEFAULT_GAME_DATA_PATH, GameDataRepository } from "@gscombat/game-data"
import { afterAll, expect, it, vi } from "vitest"
import { buildApp } from "../../src/app.js"
import { EquipmentComparisonService } from "../../src/services/equipment-comparison.js"
import { ComparisonScheduler, comparisonLimits } from "../../src/services/comparison-scheduler.js"

const app = buildApp()
afterAll(() => app.close())
const scenario = structuredClone(raidenNationalBuiltinScenario)

it("selects supported four-piece results without changing ranks or repeating warm evaluations", async () => {
  const artifactSpy = vi.spyOn(EquipmentComparisonSession.prototype, "artifact")
  const coreSpy = vi.spyOn(EquipmentComparisonSession.prototype, "core")
  const weaponSpy = vi.spyOn(EquipmentComparisonSession.prototype, "weapon")
  const scene = { ...scenario, primary: { ...scenario.primary, label: "explicit artifact selection" } }
  const post = (body: object, single = false) => app.inject({ method: "POST",
    url: `/v1/analysis/artifact-loadouts${single ? "/candidate" : ""}`, body })
  try {
    const initial = await post({ scenario: scene })
    expect(initial.statusCode, initial.body).toBe(200)
    const baseline = initial.json()
    const body = { scenario: scene, computationId: baseline.computationId }
    const count = artifactSpy.mock.calls.length
    expect(count).toBe(baseline.candidateCount)
    expect(baseline.selectedCandidate).toBeUndefined()
    expect(baseline.selectableFourPieceCandidates.every((row: { id: string }) => row.id.startsWith("four:"))).toBe(true)
    const ids = ["four:EmblemOfSeveredFate", "four:Instructor"]
    const responses = await Promise.all(ids.map(selectedCandidateId => post({ ...body, selectedCandidateId })))
    for (const [index, response] of responses.entries()) {
      expect(response.statusCode, response.body).toBe(200)
      expect(response.json().results).toEqual(baseline.results)
      expect(response.json().selectedCandidate.id).toBe(ids[index])
      expect(response.json().candidateCount).toBe(baseline.candidateCount)
    }
    expect(responses[0]!.json().selectedCandidate.gainRatio).toBeCloseTo(0, 10)
    expect(responses[1]!.json().selectedCandidate.fourStarSlots).toHaveLength(4)
    expect(responses[0]!.json().results.some((row: { id: string }) => row.id === ids[0])).toBe(false)
    expect(artifactSpy.mock.calls.length).toBe(count)
    expect(new Set(artifactSpy.mock.contexts).size).toBe(1)
    expect(artifactSpy.mock.contexts[0]).toMatchObject({ counts: { baseline: 1 } })
    const changed = await post({ ...body, selectedCandidateId: "four:BlizzardStrayer", candidateId: "four:BlizzardStrayer",
      choices: { "four:BlizzardStrayer": { targetFrozen: "true" } } }, true)
    expect(changed.statusCode, changed.body).toBe(200)
    expect(changed.json().changedCandidateVisible).toBe(true)
    expect(changed.json().selectedCandidate.choices.targetFrozen).toBe("true")
    expect(artifactSpy.mock.calls.length).toBe(count + 1)
    for (const selectedCandidateId of ["four:Unknown", "four:Adventurer", "two:attack", ""]) {
      expect((await post({ ...body, selectedCandidateId })).statusCode).toBe(400)
    }
    const now = Date.now()
    const clock = vi.spyOn(Date, "now").mockReturnValue(now + comparisonLimits.cacheMs + 1)
    try {
      const rebuilt = await post({ ...body, selectedCandidateId: ids[0] })
      expect(rebuilt.statusCode, rebuilt.body).toBe(200)
      expect(rebuilt.json().selectedCandidate).toEqual(responses[0]!.json().selectedCandidate)
      expect(artifactSpy.mock.calls.length).toBe(count * 2 + 1)
    } finally { clock.mockRestore() }
    expect(coreSpy).not.toHaveBeenCalled()
    expect(weaponSpy).not.toHaveBeenCalled()
  } finally { artifactSpy.mockRestore(); coreSpy.mockRestore(); weaponSpy.mockRestore() }
})

it("serves a core report first and reuses baseline and candidate results across independent HTTP requests", async () => {
  const coreSpy = vi.spyOn(EquipmentComparisonSession.prototype, "core")
  const artifactSpy = vi.spyOn(EquipmentComparisonSession.prototype, "artifact")
  const weaponSpy = vi.spyOn(EquipmentComparisonSession.prototype, "weapon")
  try {
    const core = await app.inject({ method: "POST", url: "/v1/analysis/core", body: scenario })
    expect(core.statusCode, core.body).toBe(200)
    expect(core.json().analysis.weapons).toEqual([])
    expect(weaponSpy).not.toHaveBeenCalled()
    const body = { scenario, computationId: core.json().computationId }
    const [weapons, artifacts, duplicate] = await Promise.all([
      app.inject({ method: "POST", url: "/v1/analysis/weapons", body }),
      app.inject({ method: "POST", url: "/v1/analysis/artifact-loadouts", body }),
      app.inject({ method: "POST", url: "/v1/analysis/artifact-loadouts", body })
    ])
    for (const response of [weapons, artifacts, duplicate]) expect(response.statusCode, response.body).toBe(200)
    expect(artifacts.json()).toEqual(duplicate.json())
    expect(artifacts.json().complete).toBe(true)
    expect(artifactSpy).toHaveBeenCalledTimes(artifacts.json().candidateCount)
    expect(coreSpy).toHaveBeenCalledTimes(1)
    const again = await app.inject({ method: "POST", url: "/v1/analysis/core", body: scenario })
    expect(again.json()).toEqual(core.json())
    expect(coreSpy).toHaveBeenCalledTimes(1)
    const old = await app.inject({ method: "POST", url: "/v1/analysis", body: scenario })
    expect(old.statusCode, old.body).toBe(200)
    expect(weapons.json().weapons).toEqual(old.json().analysis.weapons)
    expect(core.json().evaluation).toEqual(old.json().evaluation)
    const before = artifactSpy.mock.calls.length
    const changed = await app.inject({ method: "POST", url: "/v1/analysis/artifact-loadouts/candidate", body: {
      ...body, candidateId: "four:BlizzardStrayer", choices: { "four:BlizzardStrayer": { targetFrozen: "true" } }
    } })
    expect(changed.statusCode, changed.body).toBe(200)
    expect(artifactSpy.mock.calls.length - before).toBe(1)
    expect(changed.json()).toHaveProperty("changedCandidateVisible")
    const invalid = await app.inject({ method: "POST", url: "/v1/analysis/artifact-loadouts", body: {
      ...body, choices: { "four:BlizzardStrayer": { targetFrozen: "illegal" } }
    } })
    expect(invalid.statusCode).toBe(400)
    const stale = await app.inject({ method: "POST", url: "/v1/analysis/weapons", body: { ...body, computationId: "foreign" } })
    expect(stale.statusCode).toBe(409)
  } finally { coreSpy.mockRestore(); artifactSpy.mockRestore(); weaponSpy.mockRestore() }
})

it("rebuilds a trusted baseline on cache loss and never trusts a client damage number", async () => {
  const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH)
  const a = new EquipmentComparisonService(db), b = new EquipmentComparisonService(db)
  try {
    const first = a.core(scenario)
    const rebuilt = await b.weapons({ scenario, computationId: first.computationId })
    expect(rebuilt.baselineExpectedDamage).toBe(first.analysis.baselineExpectedDamage)
    expect(rebuilt.weapons).toEqual(evaluateScenarioAnalysis(scenario, db).analysis.weapons)
  } finally { a.close(); b.close(); db.close() }
})

it("coalesces waiters, cancels one caller safely and bounds queue capacity", async () => {
  const scheduler = new ComparisonScheduler()
  const controller = new AbortController()
  let steps = 0
  const task = function* () { steps++; yield; return 7 }
  const first = scheduler.run("same", task, controller.signal).catch(error => error.statusCode)
  const second = scheduler.run("same", task)
  controller.abort()
  expect(await first).toBe(499)
  expect(await second).toBe(7)
  expect(steps).toBe(1)
  const tasks = Array.from({ length: 16 }, (_, i) => scheduler.run(String(i), task))
  await expect(scheduler.run("overflow", task)).rejects.toMatchObject({ statusCode: 429 })
  await Promise.all(tasks)
  const abandoned = new AbortController()
  const before = steps
  const canceled = scheduler.run("abandoned", task, abandoned.signal).catch(error => error.statusCode)
  abandoned.abort()
  expect(await canceled).toBe(499)
  await new Promise(resolve => setImmediate(resolve))
  expect(steps).toBe(before)
  const clock = vi.spyOn(performance, "now")
  try {
    clock.mockReturnValue(0)
    const expired = scheduler.run("expired", task)
    clock.mockReturnValue(comparisonLimits.taskMs + 1)
    await expect(expired).rejects.toMatchObject({ statusCode: 503 })
    expect(steps).toBe(before)
  } finally { clock.mockRestore() }
  scheduler.close()
})

it("makes partial rankings explicit and retries failed candidates without repeating successful ones", async () => {
  const original = EquipmentComparisonSession.prototype.artifact
  let broken = true
  const spy = vi.spyOn(EquipmentComparisonSession.prototype, "artifact").mockImplementation(function (this: EquipmentComparisonSession, id, choices) {
    if (broken && id === "four:EmblemOfSeveredFate") throw new Error("temporary evaluator failure")
    return original.call(this, id, choices)
  })
  try {
    const request = { scenario: { ...scenario, primary: { ...scenario.primary, label: "partial ranking test" } },
      selectedCandidateId: "four:EmblemOfSeveredFate" }
    const first = await app.inject({ method: "POST", url: "/v1/analysis/artifact-loadouts", body: request })
    expect(first.statusCode, first.body).toBe(200)
    expect(first.json().complete).toBe(false)
    expect(first.json().failures).toHaveLength(1)
    expect(first.json().selectedCandidate).toBeUndefined()
    const calls = spy.mock.calls.length
    broken = false
    const retry = await app.inject({ method: "POST", url: "/v1/analysis/artifact-loadouts", body: request })
    expect(retry.json().complete).toBe(true)
    expect(retry.json().selectedCandidate.id).toBe(request.selectedCandidateId)
    expect(spy.mock.calls.length - calls).toBe(1)
  } finally { spy.mockRestore() }
})
