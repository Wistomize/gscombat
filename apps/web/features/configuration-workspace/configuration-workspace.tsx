"use client"

import type { CatalogResponse, CharacterBuild, EvaluationScenario, ShowcaseImportResponse } from "@gscombat/contracts"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"

import type { CharacterElement } from "../../components/ui/visual-icons"
import { getCharacterLabel } from "../../lib/formatting/builds"
import {
  createBuildWorkspaceExport,
  mergeBuilds,
  parseBuildWorkspaceJson
} from "../../lib/workspace/workspace-config"
import { BuildEditorDialog } from "../build-editor/build-editor-dialog"
import { createLocalDraftBuild } from "../build-editor/build-draft"
import { BuildImportSection, type ImportPanel } from "../build-library/build-import-section"
import { BuildLibrary } from "../build-library/build-library"
import { PartyEditor, type PartyPickerState } from "../party/party-editor"
import {
  WorkspaceConnecting,
  WorkspaceLocalSessionHeader,
  WorkspaceLogin,
  WorkspaceMigration,
  WorkspaceSessionHeader
} from "../workspace-session/workspace-session-components"
import { useWorkspaceSession } from "../workspace-session/use-workspace-session"

interface ConfigurationWorkspaceProps {
  readonly catalog: CatalogResponse
  readonly cloudEnabled?: boolean
  readonly initialScenario: EvaluationScenario
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
  const workspace = useWorkspaceSession({ cloudEnabled, fallbackBuilds })
  const {
    builds,
    clearError,
    cloudSessionStatus,
    error,
    loginWithInvite,
    pendingMigration,
    partyBuildIds,
    ready,
    reloadCloudWorkspace,
    renameSessionNickname,
    resolvePendingMigration,
    sessionLabel,
    setBuilds,
    setError,
    setPartyBuildIds,
    setStatus,
    signOut,
    status,
    storageMode,
    syncImmediately,
    syncStopped
  } = workspace
  const [importPanel, setImportPanel] = useState<ImportPanel>(null)
  const [showcaseUid, setShowcaseUid] = useState("")
  const [jsonSource, setJsonSource] = useState("")
  const [manualElement, setManualElement] = useState<CharacterElement | null>(null)
  const [manualCharacterId, setManualCharacterId] = useState("")
  const [editingBuild, setEditingBuild] = useState<CharacterBuild | null>(null)
  const [managedCharacterId, setManagedCharacterId] = useState<string | null>(null)
  const [partyPicker, setPartyPicker] = useState<PartyPickerState | null>(null)
  const [replacementBuild, setReplacementBuild] = useState<CharacterBuild | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const managedBuilds = managedCharacterId
    ? builds.filter((build) => build.characterId === managedCharacterId)
    : []


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
    const synced = await syncImmediately({ builds, party: { memberBuildIds: partyBuildIds }, schemaVersion: 1 })
    if (!synced) return
    router.push("/calculate")
  }

  if (cloudEnabled && cloudSessionStatus === "checking") {
    return <WorkspaceConnecting />
  }

  if (cloudEnabled && pendingMigration) {
    return (
      <WorkspaceMigration
        error={error}
        migration={pendingMigration}
        onDownload={() => downloadWorkspace(pendingMigration.localDocument.builds)}
        onResolve={resolvePendingMigration}
      />
    )
  }

  return (
    <main className="workspacePage">
      <header className="workspaceHeader">
        <div>
          <strong>原神战斗分析</strong>
          <span>{status}</span>
        </div>
        {cloudEnabled && cloudSessionStatus === "authenticated" ? (
          <WorkspaceSessionHeader label={sessionLabel} onRename={renameSessionNickname} onSignOut={signOut} />
        ) : cloudEnabled ? (
          <WorkspaceLocalSessionHeader storageMode={storageMode} onLogin={() => setLoginOpen(true)} />
        ) : null}
      </header>

      <section className="workspaceIntro">
        <span>CONFIGURATION</span>
        <h1>角色配置与队伍</h1>
        <p>先维护角色配置，再组成一支 1–4 人队伍。计算时可以任选其中一名成员和指标。</p>
      </section>

      {storageMode !== "local" ? (
        <div className="workspaceStorageWarning" role="status">
          {storageMode === "session"
            ? "浏览器不允许长期缓存：配置仅保留在当前标签页，关闭前请导出 JSON。"
            : "浏览器无法缓存配置：数据可能随刷新丢失，请使用 JSON 导入和导出。"}
        </div>
      ) : null}

      {error ? (
        <div className="workspaceError" role="alert">
          <span>{error}</span>
          <div>
            {syncStopped ? (
              <button type="button" onClick={() => void reloadCloudWorkspace()}>重新载入云端</button>
            ) : null}
            <button type="button" onClick={clearError}>×</button>
          </div>
        </div>
      ) : null}

      <BuildImportSection
        buildCount={builds.length}
        catalog={catalog}
        fileInputRef={fileInputRef}
        importPanel={importPanel}
        jsonSource={jsonSource}
        manualCharacterId={manualCharacterId}
        manualElement={manualElement}
        ready={ready}
        showcaseUid={showcaseUid}
        onCreateManualBuild={createManualBuild}
        onDownload={() => downloadWorkspace(builds)}
        onImportJson={importJson}
        onImportJsonFile={importJsonFile}
        onImportPanelChange={setImportPanel}
        onImportShowcase={importShowcase}
        onJsonSourceChange={setJsonSource}
        onManualCharacterChange={setManualCharacterId}
        onManualElementChange={setManualElement}
        onShowcaseUidChange={setShowcaseUid}
      />

      <BuildLibrary
        catalog={catalog}
        groupedBuilds={groupedBuilds}
        managedBuilds={managedBuilds}
        managedCharacterId={managedCharacterId}
        partyBuilds={partyBuilds}
        ready={ready}
        onAddConfiguredCharacter={addConfiguredCharacter}
        onCloseManager={() => setManagedCharacterId(null)}
        onDeleteBuild={deleteConfiguredBuild}
        onEditBuild={(build) => {
          setEditingBuild(build)
          setManagedCharacterId(null)
        }}
        onManageCharacter={setManagedCharacterId}
      />

      <PartyEditor
        builds={builds}
        catalog={catalog}
        groupedBuilds={groupedBuilds}
        partyBuildIds={partyBuildIds}
        partyBuilds={partyBuilds}
        partyPicker={partyPicker}
        replacementBuild={replacementBuild}
        onAssignBuild={assignBuild}
        onChoosePartyCharacter={choosePartyCharacter}
        onCloseReplacement={() => setReplacementBuild(null)}
        onConfirmParty={confirmParty}
        onRemoveBuild={removeBuildFromParty}
        onReplaceBuild={(build, slot) => {
          assignBuild(build, slot)
          setReplacementBuild(null)
        }}
        onSetPartyPicker={setPartyPicker}
      />

      {editingBuild ? (
        <BuildEditorDialog
          build={editingBuild}
          catalog={catalog}
          onCancel={() => setEditingBuild(null)}
          onChange={setEditingBuild}
          onSave={saveEditingBuild}
        />
      ) : null}

      {cloudEnabled && cloudSessionStatus === "anonymous" && loginOpen ? (
        <WorkspaceLogin error={error} onClose={() => setLoginOpen(false)} onLogin={loginWithInvite} />
      ) : null}
    </main>
  )
}
