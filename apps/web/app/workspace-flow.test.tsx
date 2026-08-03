// @vitest-environment jsdom

import { evaluateExpectedDamage } from "@gscombat/calculator"
import { raidenNationalBuiltinScenario } from "@gscombat/content"
import type { AnalysisResponse, CatalogResponse, WorkspaceDocument } from "@gscombat/contracts"
import { act, createElement } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

import { webCatalog } from "../lib/catalog"
import { saveBuildLibrary, saveParty } from "../lib/workspace-config"
import { ConfigurationWorkspace } from "./configuration-workspace"
import { TeamCalculationWorkspace } from "./workbench"

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
    marginalSubstats: [],
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
          { after: 290, before: 200, bonus: 0.45, kind: "damage_bonus", multiplier: 1.45 }
        ]
      }]
    },
    teamState: {
      activeResonanceIds: ["resonance.pyro"],
      moonsign: {
        characterBuildIds: [raidenNationalBuiltinScenario.primary.buildId],
        characterCount: 2,
        level: "ascendant_gleam"
      }
    },
    stats: {
      attackPercent: 1.471,
      baseAttack: 945.3,
      critDamage: 1.238,
      critRate: 0.625,
      damageBonus: 2.413,
      effectiveAttack: 3729.4,
      elementalMastery: 0,
      energyRecharge: 3.1,
      flatAttack: 1394.5,
      resistanceReduction: 0,
      talentMultiplier: 2
    }
  }
}

let root: ReturnType<typeof createRoot> | undefined

afterEach(async () => {
  if (root) await act(async () => root?.unmount())
  root = undefined
  document.body.innerHTML = ""
  window.localStorage.clear()
  routerPush.mockReset()
  vi.unstubAllGlobals()
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

describe("invite workspace integration", () => {
  it("logs in, initializes an empty cloud workspace, and synchronizes party changes", async () => {
    let authenticated = false
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
        return new Response(JSON.stringify({ authenticated: true, label: "测试朋友" }), {
          headers: { "Content-Type": "application/json" },
          status: 200
        })
      }
      if (url.endsWith("/v1/session/invite") && method === "POST") {
        authenticated = true
        return new Response(JSON.stringify({ authenticated: true, label: "测试朋友" }), {
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

    expect(document.querySelector(".workspaceLoginCard")?.textContent).toContain("输入邀请码")
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
    await click(findButton("进入工作空间"))
    await flushAsyncWork(25)
    await flushAsyncWork(25)

    expect(document.querySelector(".workspaceSession")?.textContent).toContain("测试朋友")
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

    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(analysisResponse), {
      headers: { "Content-Type": "application/json" },
      status: 200
    }))
    vi.stubGlobal("fetch", fetchMock)
    await render(createElement(TeamCalculationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: raidenNationalBuiltinScenario
    }))

    expect(document.querySelector('.calculationParty img[alt="雷电将军头像"]')).not.toBeNull()
    await click(document.querySelector<HTMLButtonElement>(".calculationParty button"))
    await click(document.querySelector<HTMLButtonElement>(".metricGroups button"))
    const shieldToggle = [...document.querySelectorAll<HTMLLabelElement>("label")]
      .find((label) => label.textContent?.includes("角色处于护盾保护"))?.querySelector<HTMLInputElement>("input")
    const frozenToggle = [...document.querySelectorAll<HTMLLabelElement>("label")]
      .find((label) => label.textContent?.includes("目标处于冻结状态"))?.querySelector<HTMLInputElement>("input")
    await click(shieldToggle)
    await click(frozenToggle)
    await click(findButton("开始计算"))

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const scenario = JSON.parse(String(request?.body)) as {
      conditions: { primaryShielded?: boolean; targetFrozen?: boolean }
      primary: { buildId: string }
      teammates: unknown[]
    }
    expect(scenario.primary.buildId).toBe(raidenNationalBuiltinScenario.primary.buildId)
    expect(scenario.teammates).toHaveLength(0)
    expect(scenario.conditions).toMatchObject({ primaryShielded: true, targetFrozen: true })

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
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(analysisResponse), {
      headers: { "Content-Type": "application/json" },
      status: 200
    }))
    vi.stubGlobal("fetch", fetchMock)

    await render(createElement(TeamCalculationWorkspace, {
      catalog: webCatalog as CatalogResponse,
      initialScenario: scenario
    }))

    await click(document.querySelector<HTMLButtonElement>(".calculationParty button"))
    await click(findButton("如水从平 / 衡平推裁单次命中"))
    const themeSelect = document.querySelector<HTMLSelectElement>('select[aria-label="流浪乐章 · 登场主题"]')
    expect(themeSelect?.querySelectorAll("option")).toHaveLength(4)
    await changeSelect(themeSelect, "weapon.the-widsith.aria.all-element-damage-bonus")
    await click(findButton("开始计算"))

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const payload = JSON.parse(String(request?.body)) as { conditions: { activeEffectIds: string[] } }
    expect(payload.conditions.activeEffectIds).toContain("weapon.the-widsith.aria.all-element-damage-bonus")
    expect(payload.conditions.activeEffectIds.filter((effectId) => effectId.startsWith("weapon.the-widsith."))).toHaveLength(1)
  })
})
