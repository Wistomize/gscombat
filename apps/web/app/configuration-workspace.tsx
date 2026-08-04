"use client"

import type {
  CatalogResponse,
  CharacterBuild,
  EvaluationScenario,
  ShowcaseImportResponse,
  WorkspaceDocument,
  WorkspaceResponse
} from "@gscombat/contracts"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { createLocalDraftBuild } from "../lib/build-draft"
import {
  createBuildWorkspaceExport,
  hasStoredBuildLibrary,
  loadBuildLibrary,
  loadParty,
  mergeBuilds,
  parseBuildWorkspaceJson,
  saveBuildLibrary,
  saveParty
} from "../lib/workspace-config"
import {
  getWorkspaceSession,
  loadCloudWorkspace,
  loginToWorkspace,
  logoutWorkspace,
  renameWorkspaceNickname,
  saveCloudWorkspace,
  WorkspaceApiError
} from "../lib/workspace-api"
import { CharacterAvatar, ElementIcon, getCharacterElement, type CharacterElement } from "./visual-icons"
import { BuildEditor } from "./workbench"

interface ConfigurationWorkspaceProps {
  readonly catalog: CatalogResponse
  readonly cloudEnabled?: boolean
  readonly initialScenario: EvaluationScenario
}

type ImportPanel = "json" | "manual" | "showcase" | null

interface PartyPickerState {
  readonly characterId: string | null
  readonly slot: number | null
}

interface PendingWorkspaceMigration {
  readonly localDocument: WorkspaceDocument
  readonly remote: WorkspaceResponse
}

type CloudSessionStatus = "anonymous" | "authenticated" | "checking"

const legacyWorkspaceNicknameLabels = new Set(["个人测试", "朋友测试"])

const selectableElements: readonly { readonly id: CharacterElement; readonly label: string }[] = [
  { id: "pyro", label: "火元素" },
  { id: "hydro", label: "水元素" },
  { id: "anemo", label: "风元素" },
  { id: "electro", label: "雷元素" },
  { id: "dendro", label: "草元素" },
  { id: "cryo", label: "冰元素" },
  { id: "geo", label: "岩元素" },
  { id: "traveler", label: "旅行者" }
]

function getCharacterLabel(catalog: CatalogResponse, characterId: string): string {
  return catalog.characters.find((character) => character.characterId === characterId)?.label ?? "未知角色"
}

function getSourceLabel(build: CharacterBuild): string {
  if (build.source.kind === "builtin") return "内设默认配置"
  if (build.source.kind === "showcase") return `展示柜 · UID ${build.source.uid}`
  if (build.source.kind === "json") return "JSON 导入"
  return "手动配置"
}

function getWorkspaceNicknameDisplay(label: string): string {
  return !label || legacyWorkspaceNicknameLabels.has(label) ? "未设置昵称" : label
}

function downloadWorkspace(builds: readonly CharacterBuild[]): void {
  const payload = createBuildWorkspaceExport(builds)
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "gscombat-character-builds.json"
  anchor.click()
  URL.revokeObjectURL(url)
}

async function getShowcaseImportError(response: Response): Promise<string> {
  try {
    const payload = await response.json() as { readonly message?: unknown }
    if (typeof payload.message === "string" && payload.message.trim()) return payload.message
  } catch {
    // Fall back to the HTTP status when an upstream proxy returns a non-JSON error body.
  }
  return `展示柜接口返回 HTTP ${response.status}`
}

export function ConfigurationWorkspace({ catalog, cloudEnabled = false, initialScenario }: ConfigurationWorkspaceProps) {
  const router = useRouter()
  const fallbackBuilds = useMemo(
    () => [initialScenario.primary, ...initialScenario.teammates],
    [initialScenario]
  )
  const [builds, setBuilds] = useState<CharacterBuild[]>([])
  const [partyBuildIds, setPartyBuildIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const [cloudSessionStatus, setCloudSessionStatus] = useState<CloudSessionStatus>(
    cloudEnabled ? "checking" : "authenticated"
  )
  const [bootstrapVersion, setBootstrapVersion] = useState(0)
  const [inviteCode, setInviteCode] = useState("")
  const [sessionLabel, setSessionLabel] = useState("")
  const [sessionNicknameDraft, setSessionNicknameDraft] = useState("")
  const [renamingSessionNickname, setRenamingSessionNickname] = useState(false)
  const [savingSessionNickname, setSavingSessionNickname] = useState(false)
  const [pendingMigration, setPendingMigration] = useState<PendingWorkspaceMigration | null>(null)
  const [importPanel, setImportPanel] = useState<ImportPanel>(null)
  const [showcaseUid, setShowcaseUid] = useState("")
  const [jsonSource, setJsonSource] = useState("")
  const [manualElement, setManualElement] = useState<CharacterElement | null>(null)
  const [manualCharacterId, setManualCharacterId] = useState("")
  const [editingBuild, setEditingBuild] = useState<CharacterBuild | null>(null)
  const [managedCharacterId, setManagedCharacterId] = useState<string | null>(null)
  const [partyPicker, setPartyPicker] = useState<PartyPickerState | null>(null)
  const [replacementBuild, setReplacementBuild] = useState<CharacterBuild | null>(null)
  const [status, setStatus] = useState("正在读取本地配置…")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cloudRevisionRef = useRef(0)
  const lastSyncedDocumentRef = useRef("")
  const pendingSyncRef = useRef<WorkspaceDocument | null>(null)
  const syncPromiseRef = useRef<Promise<void> | null>(null)
  const syncStoppedRef = useRef(false)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const applyCloudWorkspace = (workspace: WorkspaceResponse, message: string) => {
    const document = workspace.document
    cloudRevisionRef.current = workspace.revision
    lastSyncedDocumentRef.current = JSON.stringify(document)
    pendingSyncRef.current = null
    syncStoppedRef.current = false
    setBuilds([...document.builds])
    setPartyBuildIds([...document.party.memberBuildIds])
    saveBuildLibrary(window.localStorage, document.builds)
    saveParty(window.localStorage, document.party)
    setPendingMigration(null)
    setReady(true)
    setStatus(message)
  }

  const flushCloudSync = async (): Promise<void> => {
    if (!cloudEnabled || syncStoppedRef.current) return
    if (syncPromiseRef.current) {
      await syncPromiseRef.current
      if (pendingSyncRef.current && !syncStoppedRef.current) await flushCloudSync()
      return
    }

    const syncPromise = (async () => {
      while (pendingSyncRef.current && !syncStoppedRef.current) {
        const document = pendingSyncRef.current
        pendingSyncRef.current = null
        const serialized = JSON.stringify(document)
        if (serialized === lastSyncedDocumentRef.current) continue
        setStatus("正在同步配置…")
        try {
          const updated = await saveCloudWorkspace(document, cloudRevisionRef.current)
          cloudRevisionRef.current = updated.revision
          lastSyncedDocumentRef.current = serialized
          setStatus(`云端配置已同步 · 版本 ${updated.revision}`)
        } catch (caught) {
          if (caught instanceof WorkspaceApiError && caught.status === 409) {
            syncStoppedRef.current = true
            setError("云端配置已被其他设备更新。请先导出当前配置，再重新载入云端。")
            setStatus("配置同步冲突")
            return
          }
          if (caught instanceof WorkspaceApiError && caught.status === 401) {
            syncStoppedRef.current = true
            setReady(false)
            setCloudSessionStatus("anonymous")
            setError("邀请码会话已失效，请重新登录")
            return
          }
          if (!pendingSyncRef.current) pendingSyncRef.current = document
          setError(caught instanceof Error ? caught.message : "云端配置同步失败")
          setStatus("云端同步失败，本机配置已保留")
          return
        }
      }
    })()
    syncPromiseRef.current = syncPromise
    try {
      await syncPromise
    } finally {
      if (syncPromiseRef.current === syncPromise) syncPromiseRef.current = null
    }
  }

  const scheduleCloudSync = (document: WorkspaceDocument) => {
    if (!cloudEnabled || syncStoppedRef.current) return
    pendingSyncRef.current = document
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null
      void flushCloudSync()
    }, 400)
  }

  useEffect(() => {
    let cancelled = false

    const loadLocalWorkspace = () => {
      const library = loadBuildLibrary(window.localStorage, fallbackBuilds)
      const party = { memberBuildIds: [...loadParty(window.localStorage, library.builds).memberBuildIds] }
      return {
        document: { builds: [...library.builds], party, schemaVersion: 1 } satisfies WorkspaceDocument,
        stored: hasStoredBuildLibrary(window.localStorage)
      }
    }

    const bootstrap = async () => {
      try {
        const local = loadLocalWorkspace()
        if (!cloudEnabled) {
          if (cancelled) return
          setBuilds([...local.document.builds])
          setPartyBuildIds([...local.document.party.memberBuildIds])
          setStatus(`已读取 ${local.document.builds.length} 份角色配置`)
          setReady(true)
          return
        }

        const session = await getWorkspaceSession()
        if (cancelled) return
        if (!session) {
          setCloudSessionStatus("anonymous")
          setStatus("请输入邀请码")
          return
        }

        setSessionLabel(session.label)
        setCloudSessionStatus("authenticated")
        const remote = await loadCloudWorkspace()
        if (cancelled) return
        if (remote.document.builds.length === 0 && local.stored) {
          setPendingMigration({ localDocument: local.document, remote })
          setStatus("请选择首次同步方式")
          return
        }
        if (remote.document.builds.length === 0) {
          const seeded = await saveCloudWorkspace(local.document, remote.revision)
          if (!cancelled) applyCloudWorkspace(seeded, `已初始化 ${seeded.document.builds.length} 份云端配置`)
          return
        }
        applyCloudWorkspace(remote, `已读取 ${remote.document.builds.length} 份云端配置`)
      } catch (caught) {
        if (cancelled) return
        setCloudSessionStatus(cloudEnabled ? "anonymous" : "authenticated")
        setError(caught instanceof Error ? caught.message : "配置读取失败")
        setStatus(cloudEnabled ? "云端连接失败" : "本地配置读取失败")
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [bootstrapVersion, cloudEnabled, fallbackBuilds])

  useEffect(() => {
    if (!ready) return
    saveBuildLibrary(window.localStorage, builds)
    const validParty = partyBuildIds.filter((buildId) => builds.some((build) => build.buildId === buildId))
    if (validParty.length !== partyBuildIds.length) setPartyBuildIds(validParty)
  }, [builds, partyBuildIds, ready])

  useEffect(() => {
    if (!ready) return
    const party = { memberBuildIds: partyBuildIds }
    saveParty(window.localStorage, party)
    scheduleCloudSync({ builds, party, schemaVersion: 1 })
  }, [builds, partyBuildIds, ready])

  const groupedBuilds = useMemo(() => {
    const groups = new Map<string, CharacterBuild[]>()
    for (const build of builds) {
      const group = groups.get(build.characterId) ?? []
      group.push(build)
      groups.set(build.characterId, group)
    }
    return [...groups.entries()].sort(([left], [right]) =>
      getCharacterLabel(catalog, left).localeCompare(getCharacterLabel(catalog, right), "zh-CN")
    )
  }, [builds, catalog])

  const partyBuilds = partyBuildIds.flatMap((buildId) => {
    const build = builds.find((candidate) => candidate.buildId === buildId)
    return build ? [build] : []
  })
  const manualCharacters = manualElement
    ? catalog.characters.filter((character) => getCharacterElement(character.characterId) === manualElement)
    : []
  const pickerBuilds = partyPicker?.characterId
    ? builds.filter((build) => build.characterId === partyPicker.characterId)
    : []
  const pickerSlotCharacterId = partyPicker?.slot !== null && partyPicker?.slot !== undefined
    ? partyBuilds[partyPicker.slot]?.characterId
    : null
  const pickerCharacterGroups = groupedBuilds.filter(([characterId]) =>
    !partyBuilds.some((build) => build.characterId === characterId) || characterId === pickerSlotCharacterId
  )
  const managedBuilds = managedCharacterId
    ? builds.filter((build) => build.characterId === managedCharacterId)
    : []

  const loginWithInvite = async () => {
    setError("")
    setStatus("正在验证邀请码…")
    try {
      const session = await loginToWorkspace(inviteCode.trim())
      setSessionLabel(session.label)
      setCloudSessionStatus("checking")
      setInviteCode("")
      setBootstrapVersion((current) => current + 1)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "邀请码登录失败")
      setStatus("邀请码登录失败")
    }
  }

  const resolvePendingMigration = async (useLocalDocument: boolean) => {
    if (!pendingMigration) return
    setError("")
    try {
      const selected = useLocalDocument
        ? await saveCloudWorkspace(pendingMigration.localDocument, pendingMigration.remote.revision)
        : pendingMigration.remote
      applyCloudWorkspace(
        selected,
        useLocalDocument ? `已上传 ${selected.document.builds.length} 份本机配置` : "已使用云端空工作空间"
      )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "首次同步失败")
    }
  }

  const reloadCloudWorkspace = async () => {
    setError("")
    setStatus("正在重新载入云端配置…")
    try {
      const remote = await loadCloudWorkspace()
      applyCloudWorkspace(remote, `已重新载入云端版本 ${remote.revision}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "重新载入云端配置失败")
    }
  }

  const signOut = async () => {
    try {
      await logoutWorkspace()
    } finally {
      setReady(false)
      setSessionLabel("")
      setSessionNicknameDraft("")
      setRenamingSessionNickname(false)
      setCloudSessionStatus("anonymous")
      setStatus("已退出当前工作空间，本机缓存仍保留")
    }
  }

  const startRenamingSessionNickname = () => {
    setError("")
    setSessionNicknameDraft(sessionLabel)
    setRenamingSessionNickname(true)
  }

  const cancelRenamingSessionNickname = () => {
    setSessionNicknameDraft(sessionLabel)
    setRenamingSessionNickname(false)
  }

  const saveSessionNickname = async () => {
    const nickname = sessionNicknameDraft.trim()
    if (!nickname) {
      setError("昵称不能为空")
      return
    }

    setError("")
    setSavingSessionNickname(true)
    try {
      const session = await renameWorkspaceNickname(nickname)
      setSessionLabel(session.label)
      setSessionNicknameDraft(session.label)
      setRenamingSessionNickname(false)
      setStatus("昵称已更新")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "昵称更新失败")
    } finally {
      setSavingSessionNickname(false)
    }
  }

  const assignBuild = (build: CharacterBuild, slot: number | null = null) => {
    setError("")
    const sameCharacterIndex = partyBuildIds.findIndex((buildId) => {
      const candidate = builds.find((item) => item.buildId === buildId)
      return candidate?.characterId === build.characterId
    })
    if (sameCharacterIndex >= 0) {
      setPartyBuildIds((current) =>
        current.map((buildId, index) => (index === sameCharacterIndex ? build.buildId : buildId))
      )
    } else if (slot !== null) {
      setPartyBuildIds((current) => {
        const next = [...current]
        if (slot < next.length) next[slot] = build.buildId
        else next.push(build.buildId)
        return next.slice(0, 4)
      })
    } else if (partyBuildIds.length < 4) {
      setPartyBuildIds((current) => [...current, build.buildId])
    } else {
      setReplacementBuild(build)
    }
    setPartyPicker(null)
    setStatus(`已选择 ${getCharacterLabel(catalog, build.characterId)} 的配置`)
  }

  const addConfiguredCharacter = (characterId: string, characterBuilds: readonly CharacterBuild[]) => {
    const inParty = partyBuilds.find((build) => build.characterId === characterId)
    if (inParty) {
      removeBuildFromParty(inParty.buildId)
      return
    }
    if (characterBuilds.length === 1) {
      assignBuild(characterBuilds[0]!)
      return
    }
    setPartyPicker({ characterId, slot: null })
  }

  const choosePartyCharacter = (characterId: string) => {
    const characterBuilds = builds.filter((build) => build.characterId === characterId)
    if (characterBuilds.length === 1 && partyPicker && partyPicker.slot !== null) {
      assignBuild(characterBuilds[0]!, partyPicker.slot)
      return
    }
    setPartyPicker((current) => current ? { ...current, characterId } : null)
  }

  const importBuilds = (incoming: readonly CharacterBuild[], message: string) => {
    setBuilds((current) => mergeBuilds(current, incoming))
    setImportPanel(null)
    setError("")
    setStatus(message)
  }

  const importShowcase = async () => {
    setError("")
    setStatus("正在读取角色展示柜…")
    try {
      const response = await fetch("/api/backend/v1/showcase/import", {
        body: JSON.stringify({ uid: showcaseUid }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      })
      if (!response.ok) throw new Error(await getShowcaseImportError(response))
      const imported = (await response.json()) as ShowcaseImportResponse
      if (imported.builds.length === 0) throw new Error("展示柜中没有可识别且完整的角色配置")
      const skippedCount = imported.skipped?.reduce((total, entry) => total + entry.count, 0) ?? 0
      const skippedSummary = skippedCount ? `，跳过 ${skippedCount} 个不完整或暂不支持角色` : ""
      importBuilds(
        imported.builds,
        `已导入 ${imported.nickname ?? showcaseUid} 的 ${imported.builds.length} 份配置${skippedSummary}`
      )
    } catch (caught) {
      setStatus("展示柜导入失败")
      setError(caught instanceof Error ? caught.message : "展示柜导入失败")
    }
  }

  const importJson = () => {
    try {
      const imported = parseBuildWorkspaceJson(jsonSource).map((build) => ({
        ...build,
        source: { importedAt: new Date().toISOString(), kind: "json" as const }
      }))
      importBuilds(imported, `已导入 ${imported.length} 份角色配置`)
      setJsonSource("")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "JSON 配置导入失败")
    }
  }

  const importJsonFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const imported = parseBuildWorkspaceJson(await file.text()).map((build) => ({
        ...build,
        source: { importedAt: new Date().toISOString(), kind: "json" as const }
      }))
      importBuilds(imported, `已从 ${file.name} 导入 ${imported.length} 份角色配置`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "JSON 文件导入失败")
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const createManualBuild = () => {
    const character = catalog.characters.find((candidate) => candidate.characterId === manualCharacterId)
    if (!character) return
    try {
      const template = builds.find((build) => build.characterId === character.characterId) ?? fallbackBuilds.at(0)
      if (!template) throw new Error("缺少可用于初始化配置的模板")
      const build = createLocalDraftBuild(template, catalog, character)
      importBuilds([build], `已初始化 ${character.label} 配置`)
      setEditingBuild(build)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "无法初始化角色配置")
    }
  }

  const saveEditingBuild = () => {
    if (!editingBuild) return
    const isEditableSource = editingBuild.source.kind === "local"
    const saved: CharacterBuild = isEditableSource
      ? editingBuild
      : {
          ...editingBuild,
          buildId: `local.${Date.now()}.${editingBuild.characterId}`,
          label: `${getCharacterLabel(catalog, editingBuild.characterId)} · 手动配置`,
          source: { kind: "local" }
        }
    setBuilds((current) => mergeBuilds(current, [saved]))
    setEditingBuild(null)
    setStatus(`已保存 ${getCharacterLabel(catalog, saved.characterId)} 配置`)
  }

  const deleteConfiguredBuild = (build: CharacterBuild) => {
    const confirmed = window.confirm(`确定删除“${build.label}”吗？它也会从当前队伍中移除。`)
    if (!confirmed) return

    const hasRemainingBuildForCharacter = builds.some((candidate) =>
      candidate.characterId === build.characterId && candidate.buildId !== build.buildId
    )
    setBuilds((current) => current.filter((candidate) => candidate.buildId !== build.buildId))
    setPartyBuildIds((current) => current.filter((candidate) => candidate !== build.buildId))
    if (!hasRemainingBuildForCharacter) setManagedCharacterId(null)
    if (editingBuild?.buildId === build.buildId) setEditingBuild(null)
    setStatus(`已删除 ${getCharacterLabel(catalog, build.characterId)} 的一份配置`)
  }

  const removeBuildFromParty = (buildId: string) => {
    setPartyBuildIds((current) => current.filter((candidate) => candidate !== buildId))
    setStatus("已移出队伍")
  }

  const confirmParty = async () => {
    if (partyBuildIds.length < 1) {
      setError("请至少选择一名队伍成员")
      return
    }
    saveParty(window.localStorage, { memberBuildIds: partyBuildIds })
    if (cloudEnabled) {
      pendingSyncRef.current = { builds, party: { memberBuildIds: partyBuildIds }, schemaVersion: 1 }
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
      syncTimerRef.current = null
      await flushCloudSync()
      if (syncStoppedRef.current) return
    }
    router.push("/calculate")
  }

  if (cloudEnabled && cloudSessionStatus === "checking") {
    return (
      <main className="workspaceLoginPage">
        <section className="workspaceLoginCard">
          <span>WORKSPACE</span>
          <h1>正在连接工作空间</h1>
          <p>正在验证邀请码会话并读取云端配置。</p>
        </section>
      </main>
    )
  }

  if (cloudEnabled && cloudSessionStatus === "anonymous") {
    return (
      <main className="workspaceLoginPage">
        <form
          autoComplete="on"
          className="workspaceLoginCard"
          method="post"
          onSubmit={(event) => { event.preventDefault(); void loginWithInvite() }}
        >
          <span>INVITE WORKSPACE</span>
          <h1>输入邀请码</h1>
          <p>不同邀请码对应独立工作空间；同一个邀请码可以在多台设备继续使用。</p>
          <input
            aria-hidden="true"
            autoComplete="username"
            className="workspaceCredentialUsername"
            name="username"
            readOnly
            tabIndex={-1}
            type="text"
            value="ysin-workspace"
          />
          <label>
            <span>邀请码</span>
            <input
              autoCapitalize="none"
              autoComplete="current-password"
              autoFocus
              maxLength={128}
              name="password"
              placeholder="YSIN-…"
              spellCheck={false}
              type="password"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
            />
          </label>
          {error ? <div className="workspaceLoginError" role="alert">{error}</div> : null}
          <button className="workspacePrimaryButton" disabled={inviteCode.trim().length < 16} type="submit">
            进入工作空间
          </button>
        </form>
      </main>
    )
  }

  if (cloudEnabled && pendingMigration) {
    return (
      <main className="workspaceLoginPage">
        <section className="workspaceLoginCard workspaceMigrationCard">
          <span>FIRST SYNC</span>
          <h1>发现本机已有配置</h1>
          <p>
            云端工作空间目前为空，本机有 {pendingMigration.localDocument.builds.length} 份角色配置。
            请选择首次同步方式。
          </p>
          {error ? <div className="workspaceLoginError" role="alert">{error}</div> : null}
          <div className="workspaceMigrationActions">
            <button className="workspacePrimaryButton" type="button" onClick={() => void resolvePendingMigration(true)}>
              上传本机配置
            </button>
            <button type="button" onClick={() => void resolvePendingMigration(false)}>使用云端空配置</button>
            <button type="button" onClick={() => downloadWorkspace(pendingMigration.localDocument.builds)}>
              先导出本机备份
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="workspacePage">
      <header className="workspaceHeader">
        <div>
          <strong>原神指标分析</strong>
          <span>{status}</span>
        </div>
        {cloudEnabled ? (
          <div className="workspaceSession">
            {renamingSessionNickname ? (
              <form
                className="workspaceSessionRename"
                onSubmit={(event) => { event.preventDefault(); void saveSessionNickname() }}
              >
                <input
                  aria-label="昵称"
                  autoFocus
                  maxLength={80}
                  name="nickname"
                  value={sessionNicknameDraft}
                  onChange={(event) => setSessionNicknameDraft(event.target.value)}
                />
                <button disabled={savingSessionNickname} type="submit">保存</button>
                <button disabled={savingSessionNickname} type="button" onClick={cancelRenamingSessionNickname}>取消</button>
              </form>
            ) : (
              <>
                <span className="workspaceNickname">{getWorkspaceNicknameDisplay(sessionLabel)}</span>
                <button type="button" onClick={startRenamingSessionNickname}>改名</button>
              </>
            )}
            <button type="button" onClick={() => void signOut()}>退出</button>
          </div>
        ) : null}
      </header>

      <section className="workspaceIntro">
        <span>CONFIGURATION</span>
        <h1>角色配置与队伍</h1>
        <p>先维护角色配置，再组成一支 1–4 人队伍。计算时可以任选其中一名成员和指标。</p>
      </section>

      {error ? (
        <div className="workspaceError" role="alert">
          <span>{error}</span>
          <div>
            {syncStoppedRef.current ? (
              <button type="button" onClick={() => void reloadCloudWorkspace()}>重新载入云端</button>
            ) : null}
            <button type="button" onClick={() => setError("")}>×</button>
          </div>
        </div>
      ) : null}

      <section className="workspaceSection">
        <div className="workspaceSectionHeading">
          <div><span>01</span><h2>配置操作</h2></div>
        </div>
        <div className="workspaceActions">
          <button type="button" onClick={() => setImportPanel("showcase")}>导入展示柜配置</button>
          <button type="button" onClick={() => setImportPanel("json")}>导入 JSON 配置</button>
          <button type="button" onClick={() => { setImportPanel("manual"); setManualElement(null); setManualCharacterId("") }}>手动初始化角色配置</button>
          <button disabled={!ready || builds.length === 0} type="button" onClick={() => downloadWorkspace(builds)}>
            导出配置
          </button>
        </div>

        {importPanel === "showcase" ? (
          <div className="workspaceInlinePanel">
            <label><span>原神 UID</span><input inputMode="numeric" maxLength={10} value={showcaseUid} onChange={(event) => setShowcaseUid(event.target.value.replace(/\D/g, ""))} /></label>
            <button disabled={!/^\d{9,10}$/.test(showcaseUid)} type="button" onClick={importShowcase}>确认导入</button>
            <button type="button" onClick={() => setImportPanel(null)}>取消</button>
          </div>
        ) : null}
        {importPanel === "json" ? (
          <div className="workspaceInlinePanel workspaceJsonPanel">
            <textarea aria-label="JSON 配置" placeholder="粘贴角色配置、旧场景或工作空间 JSON" rows={6} value={jsonSource} onChange={(event) => setJsonSource(event.target.value)} />
            <input ref={fileInputRef} accept="application/json,.json" aria-label="选择 JSON 文件" type="file" onChange={(event) => void importJsonFile(event.target.files?.[0])} />
            <button disabled={!jsonSource.trim()} type="button" onClick={importJson}>导入粘贴内容</button>
            <button type="button" onClick={() => setImportPanel(null)}>取消</button>
          </div>
        ) : null}
        {importPanel === "manual" ? (
          <div className="workspaceManualPanel">
            <div className="manualPickerHeading"><strong>先选择元素，再选择角色</strong><button type="button" onClick={() => setImportPanel(null)}>取消</button></div>
            <div aria-label="选择元素" className="elementPicker">
              {selectableElements.map((element) => <button aria-pressed={manualElement === element.id} className={`elementChoice elementChoice--${element.id}${manualElement === element.id ? " active" : ""}`} key={element.id} type="button" onClick={() => { setManualElement(element.id); setManualCharacterId("") }}><ElementIcon element={element.id} /><span>{element.label}</span></button>)}
            </div>
            {manualElement ? <div aria-label="选择角色" className="manualCharacterGrid">{manualCharacters.map((character) => <button aria-pressed={manualCharacterId === character.characterId} className={manualCharacterId === character.characterId ? "active" : ""} key={character.characterId} type="button" onClick={() => setManualCharacterId(character.characterId)}><CharacterAvatar characterId={character.characterId} label={character.label} /><span>{character.label}</span></button>)}</div> : <p className="manualPickerHint">请选择一个元素。</p>}
            <div className="manualPickerActions"><span>{manualCharacterId ? `已选择 ${getCharacterLabel(catalog, manualCharacterId)}` : "尚未选择角色"}</span><button className="workspacePrimaryButton" disabled={!manualCharacterId} type="button" onClick={createManualBuild}>初始化配置</button></div>
          </div>
        ) : null}
      </section>

      <section className="workspaceSection">
        <div className="workspaceSectionHeading">
          <div><span>02</span><h2>已配置角色</h2></div>
          <small>{builds.length} 份配置</small>
        </div>
        {!ready ? <p className="workspaceEmpty">正在读取配置…</p> : null}
        {ready && groupedBuilds.length === 0 ? <p className="workspaceEmpty">还没有角色配置，请先从上方导入或初始化。</p> : null}
        <div className="buildGroups">
          {groupedBuilds.map(([characterId, characterBuilds]) => (
            <article className="buildGroup" key={characterId}>
              <div className="configuredCharacterVisual">
                <CharacterAvatar characterId={characterId} label={getCharacterLabel(catalog, characterId)} size="large" />
                <span>{characterBuilds.length}</span>
              </div>
              <div className="configuredCharacterMeta"><h3>{getCharacterLabel(catalog, characterId)}</h3><small>{characterBuilds.length} 套配置</small></div>
              <div className="buildCardActions"><button type="button" onClick={() => setManagedCharacterId(characterId)}>查看配置</button><button className={partyBuilds.some((build) => build.characterId === characterId) ? "active" : ""} type="button" onClick={() => addConfiguredCharacter(characterId, characterBuilds)}>{partyBuilds.some((build) => build.characterId === characterId) ? "移出队伍" : "加入队伍"}</button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="workspaceSection partySection">
        <div className="workspaceSectionHeading">
          <div><span>03</span><h2>队伍配置</h2></div>
          <small>{partyBuilds.length}/4</small>
        </div>
        <div className="partySlots">
          {[0, 1, 2, 3].map((slot) => {
            const build = partyBuilds[slot]
            return build ? (
              <div className="partySlot partySlot--filled" key={build.buildId}>
                <button aria-label={`更换${getCharacterLabel(catalog, build.characterId)}配置`} className="partyMemberButton" type="button" onClick={() => setPartyPicker({ characterId: build.characterId, slot })}><CharacterAvatar characterId={build.characterId} label={getCharacterLabel(catalog, build.characterId)} size="large" /><strong>{getCharacterLabel(catalog, build.characterId)}</strong><small>{getSourceLabel(build)}</small></button>
                <button className="partyRemoveButton" type="button" onClick={() => removeBuildFromParty(build.buildId)}>移出</button>
              </div>
            ) : (
              <button className="partySlot partySlot--empty" key={slot} type="button" onClick={() => setPartyPicker({ characterId: null, slot })}>
                <b>＋</b><span>添加队伍成员</span>
              </button>
            )
          })}
        </div>
        <div className="partyConfirmBar">
          <p>坑位只用于展示，不代表队长、前台或出场顺序。</p>
          <button className="workspacePrimaryButton" disabled={partyBuilds.length === 0} type="button" onClick={() => void confirmParty()}>确认队伍并选择指标 →</button>
        </div>
      </section>

      {partyPicker ? (
        <div className="workspaceDialogBackdrop" role="presentation">
          <section aria-modal="true" className="workspaceDialog" role="dialog">
            <div className="workspaceDialogHeading"><div>{partyPicker.characterId ? <button className="dialogBackButton" type="button" onClick={() => setPartyPicker((current) => current ? { ...current, characterId: null } : null)}>← 角色</button> : null}<h2>{partyPicker.characterId ? `选择${getCharacterLabel(catalog, partyPicker.characterId)}的配置` : "选择队伍角色"}</h2></div><button type="button" onClick={() => setPartyPicker(null)}>×</button></div>
            {partyPicker.characterId ? <div className="configurationChoiceList">{pickerBuilds.map((build) => <button className={partyBuildIds.includes(build.buildId) ? "active" : ""} key={build.buildId} type="button" onClick={() => assignBuild(build, partyPicker.slot)}><CharacterAvatar characterId={build.characterId} label={getCharacterLabel(catalog, build.characterId)} size="small" /><span><strong>{getSourceLabel(build)}</strong><small>{build.label}</small></span></button>)}</div> : <div className="characterPickerGrid">{pickerCharacterGroups.map(([characterId, characterBuilds]) => <button key={characterId} type="button" onClick={() => choosePartyCharacter(characterId)}><CharacterAvatar characterId={characterId} label={getCharacterLabel(catalog, characterId)} /><strong>{getCharacterLabel(catalog, characterId)}</strong><small>{characterBuilds.length} 套</small></button>)}</div>}
          </section>
        </div>
      ) : null}

      {managedCharacterId ? (
        <div className="workspaceDialogBackdrop" role="presentation">
          <section aria-modal="true" className="workspaceDialog" role="dialog">
            <div className="workspaceDialogHeading"><div><CharacterAvatar characterId={managedCharacterId} label={getCharacterLabel(catalog, managedCharacterId)} size="small" /><h2>{getCharacterLabel(catalog, managedCharacterId)}的配置</h2></div><button type="button" onClick={() => setManagedCharacterId(null)}>×</button></div>
            <div className="configurationChoiceList">
              {managedBuilds.map((build) => (
                <div className="configurationManagedBuild" key={build.buildId}>
                  <button
                    className="configurationEditButton"
                    type="button"
                    onClick={() => {
                      setEditingBuild(build)
                      setManagedCharacterId(null)
                    }}
                  >
                    <CharacterAvatar
                      characterId={build.characterId}
                      label={getCharacterLabel(catalog, build.characterId)}
                      size="small"
                    />
                    <span><strong>{getSourceLabel(build)}</strong><small>{build.label}</small></span>
                    <b>编辑</b>
                  </button>
                  <button
                    aria-label={`删除配置：${build.label}`}
                    className="configurationDeleteButton"
                    type="button"
                    onClick={() => deleteConfiguredBuild(build)}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {replacementBuild ? (
        <div className="workspaceDialogBackdrop" role="presentation">
          <section aria-modal="true" className="workspaceDialog" role="dialog">
            <div className="workspaceDialogHeading"><h2>选择要替换的成员</h2><button type="button" onClick={() => setReplacementBuild(null)}>×</button></div>
            <div className="workspacePickerList">
              {partyBuilds.map((build, index) => <button key={build.buildId} type="button" onClick={() => { assignBuild(replacementBuild, index); setReplacementBuild(null) }}><CharacterAvatar characterId={build.characterId} label={getCharacterLabel(catalog, build.characterId)} size="small" /><strong>{getCharacterLabel(catalog, build.characterId)}</strong><span>{getSourceLabel(build)}</span></button>)}
            </div>
          </section>
        </div>
      ) : null}

      {editingBuild ? (
        <div className="workspaceEditor">
          <div className="workspaceEditorHeading">
            <div><span>编辑角色配置</span><h2>{getCharacterLabel(catalog, editingBuild.characterId)}</h2></div>
            <div><button type="button" onClick={() => setEditingBuild(null)}>取消</button><button className="workspacePrimaryButton" type="button" onClick={saveEditingBuild}>保存配置</button></div>
          </div>
          <BuildEditor build={editingBuild} catalog={catalog} onChange={setEditingBuild} />
        </div>
      ) : null}
    </main>
  )
}
