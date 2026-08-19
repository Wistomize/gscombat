// @vitest-environment jsdom

import { evaluateExpectedDamage } from "@gscombat/calculator"
import { raidenNationalBuiltinScenario } from "@gscombat/content"
import type { AnalysisResponse, CatalogResponse, WorkspaceDocument } from "@gscombat/contracts"
import { act, createElement } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

import { BuildEditor } from "../../features/build-editor/build-editor"
import { TeamCalculationWorkspace } from "../../features/calculation-workspace/calculation-workspace"
import { ConfigurationWorkspace } from "../../features/configuration-workspace/configuration-workspace"
import { webCatalog } from "../../lib/catalog"
import {
  BUILD_LIBRARY_STORAGE_KEY,
  getVolatileWorkspaceStorage,
  saveBuildLibrary,
  saveParty
} from "../../lib/workspace/workspace-config"

const { routerPush } = vi.hoisted(() => ({ routerPush: vi.fn() }))

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: routerPush }) }))

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const traceResult = evaluateExpectedDamage({
  action: {
    canCrit: true,
    multiplier: 2,
    tags: { actionId: "raiden.burst.initial_slash", element: "electro", ownerId: "raiden", talent: "burst" }
  },
  enemy: { defenseReduction: 0, level: 100, resistance: 0.1 },
  modifiers: [],
  stats: {
    attackPercent: 1.471,
    baseAttack: 945.3,
    critDamage: 1.238,
    critRate: 0.625,
    damageBonus: 2.413,
    elementalMastery: 0,
    flatAttack: 1394.5,
    level: 90
  }
})

const analysisResponse: AnalysisResponse = {
  analysis: {
    baselineExpectedDamage: traceResult.expectedDamage,
    effectiveArtifacts: [],
    marginalSubstats: [{
      averageRoll: 0.033,
      deltaDamage: 12.34,
      gainRatio: 0.01234,
      label: "暴击率",
      stat: "crit_rate",
      weight: 1
    }],
    progressionGains: [{
      deltaDamage: 45.67,
      gainRatio: 0.04567,
      id: "talent.burst.10",
      label: "元素爆发提升至 10 级",
      weight: 1
    }],
    totalEffectiveRolls: 0,
    weapons: [{
      expectedDamage: traceResult.expectedDamage,
      gainRatio: 0,
      label: "薙草之稻光",
      rarity: 5,
      refinement: 1,
      weaponId: "EngulfingLightning"
    }]
  },
  engineVersion: "test",
  evaluation: {
    appliedBuffs: [{ label: "万众狂欢 · 满气氛值", sourceId: "test.furina", stat: "damage_bonus", value: 0.75 }],
    appliedEffects: [{
      id: "artifact.test.damage-bonus",
      label: "测试圣遗物增伤",
      sourceId: raidenNationalBuiltinScenario.primary.buildId,
      target: "damageBonus",
      value: 0.15
    }],
    formulaAuthority: "rotation_events",
    result: { ...traceResult, trace: [...traceResult.trace] },
    rotation: {
      dpr: traceResult.expectedDamage,
      dps: traceResult.expectedDamage,
      duration: 1,
      events: [{
        appliedEffectIds: [],
        critDamage: traceResult.critDamage,
        element: "electro",
        expectedDamage: traceResult.expectedDamage,
        hitCount: 1,
        id: "test.raiden.initial-slash",
        nonCritDamage: traceResult.nonCritDamage,
        ownerId: raidenNationalBuiltinScenario.primary.buildId,
        statSnapshotTime: 0,
        time: 0,
        trace: [
          { after: 200, before: 0, coefficient: 2, kind: "scaling", stat: "attack", value: 100 },
          { after: 290, before: 200, bonus: 0.45, kind: "damage_bonus", multiplier: 1.45 },
          {
            after: 403.28125,
            before: 290,
            critDamage: 1.238,
            critRate: 0.625,
            kind: "expected_crit",
            multiplier: 1.390625
          }
        ]
      }]
    },
    teamState: {
      activeResonanceIds: ["resonance.pyro"],
      hexereiSecretRite: false,
      moonsign: {
        characterBuildIds: [raidenNationalBuiltinScenario.primary.buildId],
        characterCount: 2,
        level: "ascendant_gleam"
      },
      nightsoulBurst: {
        characterBuildIds: [],
        characterCount: 0,
        cooldownSeconds: null,
        hasXilonenIndependentTrigger: false
      }
    },
    stats: {
      attackPercent: 1.471,
      baseAttack: 945.3,
      baseDefense: 0,
      baseElementalMastery: 0,
      baseHp: 0,
      critDamage: 1.238,
      critRate: 0.625,
      damageBonus: 2.413,
      defensePercent: 0,
      effectiveAttack: 3729.4,
      effectiveDefense: 0,
      effectiveHp: 0,
      elementalMastery: 0,
      energyRecharge: 3.1,
      flatAttack: 1394.5,
      flatDefense: 0,
      flatElementalMastery: 0,
      flatHp: 0,
      hpPercent: 0,
      resistanceReduction: 0,
      statContributions: [
        { label: "角色基础攻击 · 雷电将军", stage: "baseAttack", value: 337 },
        { label: "武器基础攻击 · 薙草之稻光", stage: "baseAttack", value: 608 },
        { label: "时之沙主词条 · 攻击力%", stage: "attackPercent", value: 0.466 },
        { label: "测试精通来源", stage: "elementalMastery", value: 80 },
        { label: "测试暴击率来源", stage: "critRate", value: 0.2 },
        { label: "测试暴击伤害来源", stage: "critDamage", value: 0.4 },
        { label: "空之杯主词条 · 雷元素伤害加成", stage: "damageBonus", value: 0.466 },
        { label: "固有天赋 · 殊胜之御体", stage: "damageBonus", value: 0.8 }
      ],
      talentMultiplier: 2
    }
  }
}

function createCalculationFetchMock(
  response: AnalysisResponse,
  effectOptions: readonly Record<string, unknown>[] = []
) {
  return vi.fn(async (input: string | URL | Request, _init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
    const body = url.includes("/v1/action-effect-options") ? { options: effectOptions } : response
    return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" }, status: 200 })
  })
}

let root: ReturnType<typeof createRoot> | undefined

afterEach(async () => {
  if (root) await act(async () => root?.unmount())
  root = undefined
  document.body.innerHTML = ""
  window.localStorage.clear()
  window.sessionStorage.clear()
  getVolatileWorkspaceStorage().storage.clear()
  routerPush.mockReset()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function render(component: ReturnType<typeof createElement>) {
  const container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root?.render(component))
}

async function click(button: HTMLElement | null | undefined) {
  if (!button) throw new Error("Missing button")
  await act(async () => button.click())
}

async function changeSelect(select: HTMLSelectElement | null | undefined, value: string) {
  if (!select) throw new Error("Missing select")
  await act(async () => {
    select.value = value
    select.dispatchEvent(new Event("change", { bubbles: true }))
  })
}

async function changeInput(input: HTMLInputElement | null | undefined, value: string) {
  if (!input) throw new Error("Missing input")
  await act(async () => {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
    valueSetter?.call(input, value)
    input.dispatchEvent(new Event("input", { bubbles: true }))
  })
}

async function flushAsyncWork(delay = 0) {
  await act(async () => new Promise((resolve) => setTimeout(resolve, delay)))
}

function findButton(label: string): HTMLButtonElement | undefined {
  return [...document.querySelectorAll<HTMLButtonElement>("button")].find((button) => button.textContent?.includes(label))
}

describe("build editor artifact display", () => {
  it("identifies an imported build without equipped artifacts", async () => {
    await render(createElement(BuildEditor, {
      build: { ...raidenNationalBuiltinScenario.primary, artifacts: [] },
      catalog: webCatalog as CatalogResponse,
      onChange: vi.fn()
    }))

    expect(document.querySelector(".artifactsSection")?.textContent).toContain("未装备圣遗物")
    expect(document.querySelector(".artifactsSection")?.textContent).toContain("当前配置没有已装备的圣遗物")
  })
})

describe("invite workspace integration", () => {
  it("starts in local mode, optionally logs in, and synchronizes party changes", async () => {
    let authenticated = false
    let nickname = "朋友测试"
    let revision = 0
    let cloudDocument: WorkspaceDocument = { builds: [], party: { memberBuildIds: [] }, schemaVersion: 1 }
    const requests: { readonly document?: WorkspaceDocument; readonly method: string; readonly url: string }[] = []
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
      const method = init?.method ?? "GET"
      if (url.endsWith("/v1/session") && method === "GET") {
        if (!authenticated) {
          return new Response(JSON.stringify({ code: "session_required", message: "请先输入邀请码" }), {
            headers: { "Content-Type": "application/json" },
            status: 401
          })
        }
        return new Response(JSON.stringify({ authenticated: true, label: nickname }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      if (url.endsWith("/v1/session/invite") && method === "POST") {
        authenticated = true
        return new Response(JSON.stringify({ authenticated: true, label: nickname }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      if (url.endsWith("/v1/session/label") && method === "PATCH") {
        const payload = JSON.parse(String(init?.body)) as { readonly label: string }
        nickname = payload.label.trim()
        return new Response(JSON.stringify({ authenticated: true, label: nickname }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      if (url.endsWith("/v1/session/logout") && method === "POST") {
        authenticated = false
        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      if (url.endsWith("/v1/workspace") && method === "GET") {
        return new Response(JSON.stringify({ document: cloudDocument, revision }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      if (url.endsWith("/v1/workspace") && method === "PUT") {
        const payload = JSON.parse(String(init?.body)) as {
          readonly document: WorkspaceDocument
          readonly expectedRevision: number
        }
        expect(payload.expectedRevision).toBe(revision)
        cloudDocument = payload.document
        revision += 1
        requests.push({ document: payload.document, method, url })
        return new Response(JSON.stringify({ document: cloudDocument, revision }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      throw new Error(`Unexpected request: ${method} ${url}`)
    })
    vi.stubGlobal("fetch", fetchMock)

    await render(createElement(ConfigurationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      cloudEnabled: true,
      initialScenario: raidenNationalBuiltinScenario
    }))
    await flushAsyncWork()

    expect(document.querySelector(".workspaceLoginCard")).toBeNull()
    expect(document.querySelector(".workspaceLocalSession")?.textContent).toContain("本机模式 · 自动保存")
    expect(document.querySelector(".buildGroups")?.textContent).toContain("雷电将军")
    expect(requests).toHaveLength(0)

    await click(findButton("使用邀请码同步"))
    expect(document.querySelector(".workspaceLoginCard")?.textContent).toContain("使用邀请码同步")
    const loginForm = document.querySelector<HTMLFormElement>(".workspaceLoginCard")
    const credentialUsername = loginForm?.querySelector<HTMLInputElement>('input[name="username"]')
    const inviteInput = loginForm?.querySelector<HTMLInputElement>('input[name="password"]')
    expect(loginForm?.getAttribute("autocomplete")).toBe("on")
    expect(loginForm?.method).toBe("post")
    expect(credentialUsername?.autocomplete).toBe("username")
    expect(credentialUsername?.value).toBe("ysin-workspace")
    expect(inviteInput?.autocomplete).toBe("current-password")
    expect(inviteInput?.type).toBe("password")
    await changeInput(inviteInput, "YSIN-test-invite-code-123456")
    await click(findButton("登录并同步"))
    await flushAsyncWork(25)
    await flushAsyncWork(25)

    expect(document.querySelector(".workspaceMigrationCard")?.textContent).toContain("本机与云端配置不同")
    await click(findButton("使用本机配置覆盖云端"))
    await flushAsyncWork()

    expect(document.querySelector(".workspaceSession")?.textContent).toContain("未设置昵称")
    expect(document.querySelector(".workspaceSession")?.textContent).not.toContain("朋友测试")
    await click(findButton("改名"))
    const nicknameInput = document.querySelector<HTMLInputElement>('input[name="nickname"]')
    expect(nicknameInput?.value).toBe("朋友测试")
    await changeInput(nicknameInput, "派蒙")
    await click(document.querySelector<HTMLButtonElement>('.workspaceSessionRename button[type="submit"]'))
    await flushAsyncWork()
    expect(document.querySelector(".workspaceSession")?.textContent).toContain("派蒙")
    expect(requests[0]?.document?.builds).toHaveLength(4)

    const raidenCard = [...document.querySelectorAll<HTMLElement>(".buildGroup")].find((card) =>
      card.textContent?.includes("雷电将军")
    )
    await click([...raidenCard?.querySelectorAll<HTMLButtonElement>("button") ?? []]
      .find((button) => button.textContent === "加入队伍"))
    await flushAsyncWork(450)

    expect(requests.at(-1)?.document?.party.memberBuildIds).toEqual([
      raidenNationalBuiltinScenario.primary.buildId
    ])

    await click(findButton("退出"))
    await flushAsyncWork()
    expect(document.querySelector(".workspaceLocalSession")?.textContent).toContain("本机模式 · 自动保存")
    expect(document.querySelector(".buildGroups")?.textContent).toContain("雷电将军")
  })

  it("uses same-tab storage and warns the guest when durable browser storage is blocked", async () => {
    const originalSetItem = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
      if (this === window.localStorage) throw new DOMException("local storage blocked", "SecurityError")
      originalSetItem.call(this, key, value)
    })
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      code: "session_required",
      message: "请先输入邀请码"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 401
    })))

    await render(createElement(ConfigurationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      cloudEnabled: true,
      initialScenario: raidenNationalBuiltinScenario
    }))
    await flushAsyncWork()

    expect(document.querySelector(".workspaceLocalSession")?.textContent).toContain("临时模式")
    expect(document.querySelector(".workspaceStorageWarning")?.textContent).toContain("关闭前请导出 JSON")
    expect(window.sessionStorage.getItem(BUILD_LIBRARY_STORAGE_KEY)).not.toBeNull()

    const raidenCard = [...document.querySelectorAll<HTMLElement>(".buildGroup")].find((card) =>
      card.textContent?.includes("雷电将军")
    )
    await click([...raidenCard?.querySelectorAll<HTMLButtonElement>("button") ?? []]
      .find((button) => button.textContent === "加入队伍"))
    await click(findButton("确认队伍并选择指标"))
    expect(routerPush).toHaveBeenCalledWith("/calculate")

    await act(async () => root?.unmount())
    root = undefined
    document.body.innerHTML = ""
    await render(createElement(TeamCalculationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: raidenNationalBuiltinScenario
    }))
    await flushAsyncWork()
    expect(document.querySelector(".calculationParty")?.textContent).toContain("雷电将军")
  })

  it("keeps an in-memory guest workspace usable until the page is refreshed", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("browser storage blocked", "SecurityError")
    })
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      code: "session_required",
      message: "请先输入邀请码"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 401
    })))

    await render(createElement(ConfigurationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      cloudEnabled: true,
      initialScenario: raidenNationalBuiltinScenario
    }))
    await flushAsyncWork()

    expect(document.querySelector(".workspaceLocalSession")?.textContent).toContain("未缓存")
    expect(document.querySelector(".workspaceStorageWarning")?.textContent).toContain("JSON 导入和导出")

    const raidenCard = [...document.querySelectorAll<HTMLElement>(".buildGroup")].find((card) =>
      card.textContent?.includes("雷电将军")
    )
    await click([...raidenCard?.querySelectorAll<HTMLButtonElement>("button") ?? []]
      .find((button) => button.textContent === "加入队伍"))
    await click(findButton("确认队伍并选择指标"))
    expect(routerPush).toHaveBeenCalledWith("/calculate")

    await act(async () => root?.unmount())
    root = undefined
    document.body.innerHTML = ""
    await render(createElement(TeamCalculationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: raidenNationalBuiltinScenario
    }))
    await flushAsyncWork()
    expect(document.querySelector(".calculationParty")?.textContent).toContain("雷电将军")
  })

  it("deletes one selected configuration, clears its party slot, and saves the complete cloud document", async () => {
    const raidenBuild = raidenNationalBuiltinScenario.primary
    const alternateRaidenBuild = {
      ...raidenBuild,
      buildId: "local.test.raiden-to-delete",
      label: "雷电将军 · 待删除配置",
      source: { kind: "local" as const }
    }
    const xianglingBuild = raidenNationalBuiltinScenario.teammates[0]!
    let revision = 4
    let cloudDocument: WorkspaceDocument = {
      builds: [raidenBuild, alternateRaidenBuild, xianglingBuild],
      party: { memberBuildIds: [alternateRaidenBuild.buildId, xianglingBuild.buildId] },
      schemaVersion: 1
    }
    const savedDocuments: WorkspaceDocument[] = []
    vi.stubGlobal("confirm", vi.fn(() => true))
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
      const method = init?.method ?? "GET"
      if (url.endsWith("/v1/session") && method === "GET") {
        return new Response(JSON.stringify({ authenticated: true, label: "派蒙" }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      if (url.endsWith("/v1/workspace") && method === "GET") {
        return new Response(JSON.stringify({ document: cloudDocument, revision }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      if (url.endsWith("/v1/workspace") && method === "PUT") {
        const payload = JSON.parse(String(init?.body)) as { readonly document: WorkspaceDocument }
        cloudDocument = payload.document
        savedDocuments.push(payload.document)
        revision += 1
        return new Response(JSON.stringify({ document: cloudDocument, revision }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      throw new Error(`Unexpected request: ${method} ${url}`)
    }))

    await render(createElement(ConfigurationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      cloudEnabled: true,
      initialScenario: raidenNationalBuiltinScenario
    }))
    await flushAsyncWork()

    const raidenCard = [...document.querySelectorAll<HTMLElement>(".buildGroup")].find((card) =>
      card.textContent?.includes("雷电将军")
    )
    await click([...raidenCard?.querySelectorAll<HTMLButtonElement>("button") ?? []]
      .find((button) => button.textContent === "查看配置"))
    const deleteButton = document.querySelector<HTMLButtonElement>(
      'button[aria-label="删除配置：雷电将军 · 待删除配置"]'
    )
    expect(deleteButton).not.toBeNull()

    await click(deleteButton)
    await flushAsyncWork(500)

    expect(cloudDocument.builds.map((build) => build.buildId)).toEqual([
      raidenBuild.buildId,
      xianglingBuild.buildId
    ])
    expect(cloudDocument.party.memberBuildIds).toEqual([xianglingBuild.buildId])
    expect(savedDocuments.at(-1)).toEqual(cloudDocument)
    expect(document.querySelector(".partySlots")?.textContent).not.toContain("待删除配置")
  })

  it("preserves a queued deletion when an earlier cloud save fails", async () => {
    const raidenBuild = raidenNationalBuiltinScenario.primary
    const alternateRaidenBuild = {
      ...raidenBuild,
      buildId: "local.test.raiden-to-delete-after-failed-save",
      label: "雷电将军 · 待删除失败重试",
      source: { kind: "local" as const }
    }
    const xianglingBuild = raidenNationalBuiltinScenario.teammates[1]!
    let revision = 5
    let cloudDocument: WorkspaceDocument = {
      builds: [raidenBuild, alternateRaidenBuild, xianglingBuild],
      party: { memberBuildIds: [alternateRaidenBuild.buildId] },
      schemaVersion: 1
    }
    const putDocuments: WorkspaceDocument[] = []
    let rejectFirstPut: ((reason?: unknown) => void) | undefined
    vi.stubGlobal("confirm", vi.fn(() => true))
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url
      const method = init?.method ?? "GET"
      if (url.endsWith("/v1/session") && method === "GET") {
        return new Response(JSON.stringify({ authenticated: true, label: "派蒙" }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      if (url.endsWith("/v1/workspace") && method === "GET") {
        return new Response(JSON.stringify({ document: cloudDocument, revision }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      if (url.endsWith("/v1/workspace") && method === "PUT") {
        const payload = JSON.parse(String(init?.body)) as { readonly document: WorkspaceDocument }
        putDocuments.push(payload.document)
        if (putDocuments.length === 1) {
          return new Promise<Response>((_resolve, reject) => {
            rejectFirstPut = reject
          })
        }
        cloudDocument = payload.document
        revision += 1
        return new Response(JSON.stringify({ document: cloudDocument, revision }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      throw new Error(`Unexpected request: ${method} ${url}`)
    }))

    await render(createElement(ConfigurationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      cloudEnabled: true,
      initialScenario: raidenNationalBuiltinScenario
    }))
    await flushAsyncWork()

    const xianglingCard = [...document.querySelectorAll<HTMLElement>(".buildGroup")].find((card) =>
      card.textContent?.includes("香菱")
    )
    await click([...xianglingCard?.querySelectorAll<HTMLButtonElement>("button") ?? []]
      .find((button) => button.textContent === "加入队伍"))
    await flushAsyncWork(450)
    expect(putDocuments).toHaveLength(1)
    expect(putDocuments[0]?.party.memberBuildIds).toEqual([
      alternateRaidenBuild.buildId,
      xianglingBuild.buildId
    ])

    const raidenCard = [...document.querySelectorAll<HTMLElement>(".buildGroup")].find((card) =>
      card.textContent?.includes("雷电将军")
    )
    await click([...raidenCard?.querySelectorAll<HTMLButtonElement>("button") ?? []]
      .find((button) => button.textContent === "查看配置"))
    const deleteButton = document.querySelector<HTMLButtonElement>(
      'button[aria-label="删除配置：雷电将军 · 待删除失败重试"]'
    )
    expect(deleteButton).not.toBeNull()
    await click(deleteButton)
    await flushAsyncWork()

    rejectFirstPut?.(new Error("temporary workspace failure"))
    await flushAsyncWork(450)

    expect(putDocuments).toHaveLength(2)
    expect(putDocuments[1]?.builds.map((build) => build.buildId)).toEqual([
      raidenBuild.buildId,
      xianglingBuild.buildId
    ])
    expect(putDocuments[1]?.party.memberBuildIds).toEqual([xianglingBuild.buildId])
    expect(cloudDocument).toEqual(putDocuments[1])
  })
})

describe("showcase import feedback", () => {
  it("shows the API error message instead of only an HTTP status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      code: "showcase_unavailable",
      message: "该 UID 的角色展示柜暂时不可读取"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    })))

    await render(createElement(ConfigurationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: raidenNationalBuiltinScenario
    }))
    await flushAsyncWork()

    await click(findButton("导入展示柜配置"))
    const showcaseInput = document.querySelector<HTMLInputElement>('input[inputmode="numeric"]')
    await changeInput(showcaseInput, "249548209")
    await click(findButton("确认导入"))
    await flushAsyncWork()

    expect(document.querySelector(".workspaceError")?.textContent).toContain("该 UID 的角色展示柜暂时不可读取")
  })

  it("summarizes all skipped showcase characters after a partial import", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      builds: [raidenNationalBuiltinScenario.primary],
      nickname: "旅行者",
      skipped: [
        { count: 2, reason: "incomplete_equipment" },
        { count: 1, reason: "unsupported_character" }
      ],
      ttl: 60,
      uid: "249548209"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    })))

    await render(createElement(ConfigurationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: raidenNationalBuiltinScenario
    }))
    await flushAsyncWork()

    await click(findButton("导入展示柜配置"))
    const showcaseInput = document.querySelector<HTMLInputElement>('input[inputmode="numeric"]')
    await changeInput(showcaseInput, "249548209")
    await click(findButton("确认导入"))
    await flushAsyncWork()

    expect(document.querySelector(".workspaceHeader")?.textContent)
      .toContain("已导入 旅行者 的 1 份配置，跳过 3 个不完整或暂不支持角色")
  })
})

describe("team-first workspace integration", () => {
  it("groups multiple configurations under one character avatar and chooses the configuration in the party picker", async () => {
    const raidenBuild = raidenNationalBuiltinScenario.primary
    const localRaidenBuild = {
      ...raidenBuild,
      buildId: "local.test.raiden",
      label: "雷电将军 · 手动配置",
      source: { kind: "local" as const }
    }
    saveBuildLibrary(window.localStorage, [raidenBuild, localRaidenBuild])

    await render(createElement(ConfigurationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: raidenNationalBuiltinScenario
    }))

    const characterCards = document.querySelectorAll<HTMLElement>(".buildGroup")
    expect(characterCards).toHaveLength(1)
    expect(characterCards[0]?.textContent).toContain("2 套配置")
    await click(characterCards[0]?.querySelector<HTMLButtonElement>(".buildCardActions button:last-child"))

    const choices = document.querySelectorAll<HTMLButtonElement>(".configurationChoiceList button")
    expect(choices).toHaveLength(2)
    expect(document.querySelectorAll('.configurationChoiceList img[alt="雷电将军头像"]')).toHaveLength(2)
    await click(choices[1])

    expect(document.querySelector(".partySlot--filled")?.textContent).toContain("手动配置")
    expect(document.querySelector('.partySlot--filled img[alt="雷电将军头像"]')).not.toBeNull()
  })

  it("persists a configured party, selects one member as metric owner, and renders reports in product order", async () => {
    await render(createElement(ConfigurationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: raidenNationalBuiltinScenario
    }))

    await click(findButton("手动初始化角色配置"))
    await click(findButton("雷元素"))
    expect(document.querySelector<HTMLImageElement>('img[alt="雷电将军头像"]')).not.toBeNull()
    await click(findButton("取消"))

    const raidenCard = [...document.querySelectorAll<HTMLElement>(".buildGroup")].find((card) =>
      card.textContent?.includes("雷电将军")
    )
    await click([...raidenCard?.querySelectorAll<HTMLButtonElement>("button") ?? []].find((button) => button.textContent === "加入队伍"))
    expect(document.querySelector(".partySlot--filled")?.textContent).toContain("雷电将军")
    expect(document.querySelector('.partySlot--filled img[alt="雷电将军头像"]')).not.toBeNull()
    await click(findButton("确认队伍并选择指标"))
    expect(routerPush).toHaveBeenCalledWith("/calculate")

    await act(async () => root?.unmount())
    root = undefined
    document.body.innerHTML = ""

    const fetchMock = createCalculationFetchMock(analysisResponse)
    vi.stubGlobal("fetch", fetchMock)
    await render(createElement(TeamCalculationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: raidenNationalBuiltinScenario
    }))

    expect(document.querySelector('.calculationParty img[alt="雷电将军头像"]')).not.toBeNull()
    await click(document.querySelector<HTMLButtonElement>(".calculationParty button"))
    await click(document.querySelector<HTMLButtonElement>(".metricGroups button"))
    await flushAsyncWork()
    const shieldToggle = [...document.querySelectorAll<HTMLLabelElement>("label")]
      .find((label) => label.textContent?.includes("角色处于护盾保护"))?.querySelector<HTMLInputElement>("input")
    const frozenToggle = [...document.querySelectorAll<HTMLLabelElement>("label")]
      .find((label) => label.textContent?.includes("目标处于冻结状态"))?.querySelector<HTMLInputElement>("input")
    expect(shieldToggle).toBeUndefined()
    expect(frozenToggle).toBeUndefined()
    await click(findButton("开始计算"))

    const effectRequest = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const effectPayload = JSON.parse(String(effectRequest?.body)) as { actionId: string; primary: { buildId: string } }
    expect(effectPayload.actionId).toBe("raiden.burst.initial_slash")
    expect(effectPayload.primary.buildId).toBe(raidenNationalBuiltinScenario.primary.buildId)
    const request = fetchMock.mock.calls.at(-1)?.[1] as RequestInit | undefined
    const scenario = JSON.parse(String(request?.body)) as {
      conditions: { primaryShielded?: boolean; targetFrozen?: boolean }
      primary: { buildId: string }
      teammates: unknown[]
    }
    expect(scenario.primary.buildId).toBe(raidenNationalBuiltinScenario.primary.buildId)
    expect(scenario.teammates).toHaveLength(0)
    expect(scenario.conditions).not.toHaveProperty("primaryShielded", true)
    expect(scenario.conditions).not.toHaveProperty("targetFrozen", true)

    const reportOrder = [...document.querySelectorAll<HTMLElement>(".orderedReport > article")].map((article) => article.textContent ?? "")
    expect(reportOrder[0]).toContain("指标期望结果")
    expect(reportOrder[1]).toContain("结算面板")
    expect(reportOrder[2]).toContain("结算轨迹")
    expect(reportOrder[3]).toContain("圣遗物有效词条")
    expect(reportOrder[4]).toContain("圣遗物原始值输入")
    expect(reportOrder[5]).toContain("词条增加的边际收益")
    expect(reportOrder[6]).toContain("更换武器收益")
    expect(document.querySelector(".teamStateStrip")?.textContent).toContain("热诚之火")
    expect(document.querySelector(".teamStateStrip")?.textContent).toContain("月兆·满辉")
    expect(document.querySelector('.rawArtifactRows img[alt*="绝缘之旗印"]')).not.toBeNull()
    expect(document.querySelector('.weaponRows img[alt="薙草之稻光图标"]')).not.toBeNull()
    const disclosures = [...document.querySelectorAll<HTMLElement>(".traceContributionDetails summary")]
      .map((summary) => summary.textContent)
    expect(disclosures).toContain("展开属性倍率")
    expect(disclosures).toContain("展开增伤来源")
    expect(disclosures).toContain("展开元素精通来源")
    expect(disclosures).toContain("展开双暴来源")
    expect(document.querySelector(".substatReport")?.textContent).toContain("+1.23%")
    expect(document.querySelector(".substatReport")?.textContent).toContain("元素爆发提升至 10 级")
    expect(document.querySelector(".substatReport")?.textContent).toContain("+4.57%")
    expect(document.querySelector(".traceReport")?.textContent).toContain("时之沙主词条 · 攻击力%")
    expect(document.querySelector(".traceReport")?.textContent).toContain("空之杯主词条 · 雷元素伤害加成")
    expect(document.querySelector('.traceStep[data-stage="neutral_reaction"]')?.textContent).toContain("无反应倍率")
    expect(document.querySelector('.traceStep[data-stage="neutral_reaction"]')?.textContent).toContain("测试精通来源")
    expect(document.querySelector('.traceStep[data-stage="crit"]')?.textContent).toContain("测试暴击率来源")
    expect(document.querySelector('.traceStep[data-stage="crit"]')?.textContent).toContain("测试暴击伤害来源")
    const refinementSelect = document.querySelector<HTMLSelectElement>('select[aria-label="薙草之稻光精炼等级"]')
    expect(refinementSelect?.querySelectorAll("option")).toHaveLength(5)
    await changeSelect(refinementSelect, "5")
    await flushAsyncWork()
    const refinedRequest = fetchMock.mock.calls[2]?.[1] as RequestInit | undefined
    const refinedPayload = JSON.parse(String(refinedRequest?.body)) as {
      weaponComparisonRefinements: Record<string, number>
    }
    expect(refinedPayload.weaponComparisonRefinements).toEqual({ EngulfingLightning: 5 })
  })

  it("uses action-owned trace presentation to show Nefer's final phantom hit while preserving the five-hit total", async () => {
    const nefer = {
      ...raidenNationalBuiltinScenario.primary,
      buildId: "test.nefer.trace-presentation",
      characterId: "Nefer",
      label: "奈芙尔 · 轨迹展示",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "FavoniusCodex" }
    }
    const eventTemplate = analysisResponse.evaluation.rotation.events[0]
    if (!eventTemplate) throw new Error("Expected one reusable rotation event")
    const eventIds = [
      "phantom-performance-self-first-hit",
      "phantom-performance-self-second-hit",
      "phantom-performance-shade-first-hit",
      "phantom-performance-shade-second-hit",
      "phantom-performance-shade-third-hit"
    ]
    const neferAnalysis: AnalysisResponse = {
      ...analysisResponse,
      evaluation: {
        ...analysisResponse.evaluation,
        rotation: {
          ...analysisResponse.evaluation.rotation,
          events: eventIds.map((eventId) => ({
            ...eventTemplate,
            id: `nefer.skill.senet_strategy.phantom_performance.second_hit.${eventId}`
          }))
        }
      }
    }
    saveBuildLibrary(window.localStorage, [nefer])
    saveParty(window.localStorage, { memberBuildIds: [nefer.buildId] })
    vi.stubGlobal("fetch", createCalculationFetchMock(neferAnalysis))

    await render(createElement(TeamCalculationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: { ...raidenNationalBuiltinScenario, primary: nefer, teammates: [] }
    }))

    await click(document.querySelector<HTMLButtonElement>(".calculationParty button"))
    await click(findButton("弈术·千夜一舞 / 自身两段 + 幻影三次命中期望伤害"))
    await flushAsyncWork()
    await click(findButton("开始计算"))

    const traceEvents = document.querySelectorAll<HTMLElement>(".traceReport .traceEvent")
    expect(traceEvents).toHaveLength(1)
    expect(traceEvents[0]?.textContent).toContain("phantom-performance-shade-third-hit")
    expect(traceEvents[0]?.textContent).not.toContain("phantom-performance-self-first-hit")
    expect(document.querySelector(".traceReport")?.textContent).toContain("自身两段伤害 + 幻影三次月绽放伤害")
    expect(document.querySelector(".damageHero")?.textContent).toContain("自身两段 + 幻影三次命中期望伤害")
  })

  it("offers mutually exclusive Widsith themes and sends only the selected theme", async () => {
    const widsithBuild = {
      ...raidenNationalBuiltinScenario.primary,
      buildId: "test.neuvillette.widsith",
      characterId: "Neuvillette",
      label: "那维莱特 · 流浪乐章",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "TheWidsith" }
    }
    const scenario = { ...raidenNationalBuiltinScenario, primary: widsithBuild, teammates: [] }
    saveBuildLibrary(window.localStorage, [widsithBuild])
    saveParty(window.localStorage, { memberBuildIds: [widsithBuild.buildId] })
    const fetchMock = createCalculationFetchMock(analysisResponse, [
      {
        exclusiveGroup: "weapon.the-widsith.theme",
        id: "weapon.the-widsith.recitative.attack-percent",
        label: "流浪乐章 · 登场主题：宣叙调",
        selectionMode: "optional",
        source: { kind: "weapon", weaponId: "TheWidsith" }
      },
      {
        exclusiveGroup: "weapon.the-widsith.theme",
        id: "weapon.the-widsith.aria.all-element-damage-bonus",
        label: "流浪乐章 · 登场主题：咏叹调",
        selectionMode: "optional",
        source: { kind: "weapon", weaponId: "TheWidsith" }
      },
      {
        exclusiveGroup: "weapon.the-widsith.theme",
        id: "weapon.the-widsith.interlude.elemental-mastery",
        label: "流浪乐章 · 登场主题：间奏曲",
        selectionMode: "optional",
        source: { kind: "weapon", weaponId: "TheWidsith" }
      }
    ])
    vi.stubGlobal("fetch", fetchMock)

    await render(createElement(TeamCalculationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: scenario
    }))

    await click(document.querySelector<HTMLButtonElement>(".calculationParty button"))
    await click(findButton("如水从平 / 衡平推裁单次命中"))
    await flushAsyncWork()
    const themeSelect = document.querySelector<HTMLSelectElement>('select[aria-label="流浪乐章"]')
    expect(themeSelect?.querySelectorAll("option")).toHaveLength(4)
    await changeSelect(themeSelect, "weapon.the-widsith.aria.all-element-damage-bonus")
    await click(findButton("开始计算"))

    const request = fetchMock.mock.calls.at(-1)?.[1] as RequestInit | undefined
    const payload = JSON.parse(String(request?.body)) as { conditions: { activeEffectIds: string[] } }
    expect(payload.conditions.activeEffectIds).toContain("weapon.the-widsith.aria.all-element-damage-bonus")
    expect(payload.conditions.activeEffectIds.filter((effectId) => effectId.startsWith("weapon.the-widsith."))).toHaveLength(1)
  })

  it("selects every stat contribution belonging to one weapon Buff variant", async () => {
    const cashflowBuild = {
      ...raidenNationalBuiltinScenario.primary,
      buildId: "test.neuvillette.cashflow",
      characterId: "Neuvillette",
      label: "那维莱特 · 金流监督",
      weapon: { ascension: 6, level: 90, refinement: 1, weaponId: "CashflowSupervision" }
    }
    const scenario = { ...raidenNationalBuiltinScenario, primary: cashflowBuild, teammates: [] }
    saveBuildLibrary(window.localStorage, [cashflowBuild])
    saveParty(window.localStorage, { memberBuildIds: [cashflowBuild.buildId] })
    const twoStackId = "weapon.cashflow-supervision.hp-change.2-stack.charged-damage-bonus"
    const threeStackChargedId = "weapon.cashflow-supervision.hp-change.3-stack.charged-damage-bonus"
    const threeStackStellarId = "weapon.cashflow-supervision.hp-change.3-stack.star-superconduct-damage-bonus"
    const fetchMock = createCalculationFetchMock(analysisResponse, [
      {
        exclusiveGroup: "cashflow-supervision-hp-change",
        exclusiveVariant: "2-stack",
        id: twoStackId,
        label: "金流监督：生命值变化后的2层收益",
        selectionMode: "optional",
        source: { kind: "weapon", weaponId: "CashflowSupervision" }
      },
      {
        exclusiveGroup: "cashflow-supervision-hp-change",
        exclusiveVariant: "3-stack",
        id: threeStackChargedId,
        label: "金流监督：生命值变化后的3层收益",
        selectionMode: "optional",
        source: { kind: "weapon", weaponId: "CashflowSupervision" }
      },
      {
        exclusiveGroup: "cashflow-supervision-hp-change",
        exclusiveVariant: "3-stack",
        id: threeStackStellarId,
        label: "金流监督：生命值变化后的3层星超导收益",
        selectionMode: "optional",
        source: { kind: "weapon", weaponId: "CashflowSupervision" }
      }
    ])
    vi.stubGlobal("fetch", fetchMock)

    await render(createElement(TeamCalculationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: scenario
    }))

    await click(document.querySelector<HTMLButtonElement>(".calculationParty button"))
    await click(findButton("如水从平 / 衡平推裁单次命中"))
    await flushAsyncWork()
    const stackSelect = document.querySelector<HTMLSelectElement>('select[aria-label="金流监督"]')
    expect(stackSelect?.querySelectorAll("option")).toHaveLength(3)
    await changeSelect(stackSelect, threeStackChargedId)
    await flushAsyncWork()
    expect(stackSelect?.value).toBe(threeStackChargedId)
    await click(findButton("开始计算"))

    const request = fetchMock.mock.calls.at(-1)?.[1] as RequestInit | undefined
    const payload = JSON.parse(String(request?.body)) as { conditions: { activeEffectIds: string[] } }
    expect(payload.conditions.activeEffectIds).toEqual(expect.arrayContaining([
      threeStackChargedId,
      threeStackStellarId
    ]))
    expect(payload.conditions.activeEffectIds).not.toContain(twoStackId)
  })

  it("requires a Slingshot holder to choose the arrow flight-time Buff before calculation", async () => {
    const tighnariBuild = {
      ...raidenNationalBuiltinScenario.primary,
      buildId: "test.tighnari.slingshot",
      characterId: "Tighnari",
      label: "提纳里 · 弹弓",
      weapon: { ascension: 6, level: 90, refinement: 5, weaponId: "Slingshot" }
    }
    const scenario = { ...raidenNationalBuiltinScenario, primary: tighnariBuild, teammates: [] }
    saveBuildLibrary(window.localStorage, [tighnariBuild])
    saveParty(window.localStorage, { memberBuildIds: [tighnariBuild.buildId] })
    const fetchMock = createCalculationFetchMock(analysisResponse, [
      {
        exclusiveGroup: "slingshot-flight-time",
        id: "weapon.slingshot.flight-time.within-0.3-seconds.damage-bonus",
        label: "弹弓 · 箭矢命中时机：发射后0.3秒内命中（伤害提高）",
        selectionMode: "required",
        source: { kind: "weapon", weaponId: "Slingshot" }
      },
      {
        exclusiveGroup: "slingshot-flight-time",
        id: "weapon.slingshot.flight-time.after-0.3-seconds.damage-penalty",
        label: "弹弓 · 箭矢命中时机：发射后超过0.3秒命中（伤害降低）",
        selectionMode: "required",
        source: { kind: "weapon", weaponId: "Slingshot" }
      }
    ])
    vi.stubGlobal("fetch", fetchMock)

    await render(createElement(TeamCalculationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: scenario
    }))

    await click(document.querySelector<HTMLButtonElement>(".calculationParty button"))
    await click(findButton("藏蕴破障 / 藏蕴花矢单次命中 · 蔓激化"))
    await flushAsyncWork()
    const flightTimeSelect = document.querySelector<HTMLSelectElement>(
      'select[aria-label="弹弓"]'
    )
    const calculateButton = document.querySelector<HTMLButtonElement>(".calculateButton")
    expect(flightTimeSelect).not.toBeNull()
    expect(flightTimeSelect?.textContent).not.toContain("不触发")
    expect(calculateButton?.disabled).toBe(true)
    expect(calculateButton?.textContent).toBe("请先完成必选 Buff")

    await changeSelect(flightTimeSelect, "weapon.slingshot.flight-time.within-0.3-seconds.damage-bonus")
    expect(calculateButton?.disabled).toBe(false)
    expect(calculateButton?.textContent).toBe("开始计算")
    await click(calculateButton)

    const request = fetchMock.mock.calls[1]?.[1] as RequestInit | undefined
    const payload = JSON.parse(String(request?.body)) as { conditions: { activeEffectIds: string[] } }
    expect(payload.conditions.activeEffectIds).toContain(
      "weapon.slingshot.flight-time.within-0.3-seconds.damage-bonus"
    )
    expect(payload.conditions.activeEffectIds).not.toContain(
      "weapon.slingshot.flight-time.after-0.3-seconds.damage-penalty"
    )
  })
})
