"use client"

import type { CharacterBuild, WorkspaceDocument, WorkspaceResponse } from "@gscombat/contracts"
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react"

import {
  getWorkspaceSession,
  loadCloudWorkspace,
  loginToWorkspace,
  logoutWorkspace,
  renameWorkspaceNickname,
  saveCloudWorkspace,
  WorkspaceApiError
} from "../../lib/api/workspace-api"
import {
  hasStoredBuildLibrary,
  loadBuildLibrary,
  loadParty,
  saveBuildLibrary,
  saveParty
} from "../../lib/workspace/workspace-config"

export type CloudSessionStatus = "anonymous" | "authenticated" | "checking"

export interface PendingWorkspaceMigration {
  readonly localDocument: WorkspaceDocument
  readonly remote: WorkspaceResponse
}

export interface WorkspaceSessionController {
  readonly builds: CharacterBuild[]
  readonly cloudSessionStatus: CloudSessionStatus
  readonly error: string
  readonly pendingMigration: PendingWorkspaceMigration | null
  readonly partyBuildIds: string[]
  readonly ready: boolean
  readonly sessionLabel: string
  readonly status: string
  readonly syncStopped: boolean
  readonly clearError: () => void
  readonly loginWithInvite: (inviteCode: string) => Promise<boolean>
  readonly reloadCloudWorkspace: () => Promise<void>
  readonly renameSessionNickname: (label: string) => Promise<boolean>
  readonly resolvePendingMigration: (useLocalDocument: boolean) => Promise<void>
  readonly setBuilds: Dispatch<SetStateAction<CharacterBuild[]>>
  readonly setError: Dispatch<SetStateAction<string>>
  readonly setPartyBuildIds: Dispatch<SetStateAction<string[]>>
  readonly setStatus: Dispatch<SetStateAction<string>>
  readonly signOut: () => Promise<void>
  readonly syncImmediately: (document: WorkspaceDocument) => Promise<boolean>
}

interface UseWorkspaceSessionOptions {
  readonly cloudEnabled: boolean
  readonly fallbackBuilds: readonly CharacterBuild[]
}

/** Owns local persistence, invitation sessions, and the ordered cloud-sync queue for the configuration page. */
export function useWorkspaceSession({ cloudEnabled, fallbackBuilds }: UseWorkspaceSessionOptions): WorkspaceSessionController {
  const [builds, setBuilds] = useState<CharacterBuild[]>([])
  const [partyBuildIds, setPartyBuildIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const [cloudSessionStatus, setCloudSessionStatus] = useState<CloudSessionStatus>(
    cloudEnabled ? "checking" : "authenticated"
  )
  const [bootstrapVersion, setBootstrapVersion] = useState(0)
  const [sessionLabel, setSessionLabel] = useState("")
  const [pendingMigration, setPendingMigration] = useState<PendingWorkspaceMigration | null>(null)
  const [status, setStatus] = useState("正在读取本地配置…")
  const [error, setError] = useState("")
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

  const loginWithInvite = async (inviteCode: string): Promise<boolean> => {
    setError("")
    setStatus("正在验证邀请码…")
    try {
      const session = await loginToWorkspace(inviteCode.trim())
      setSessionLabel(session.label)
      setCloudSessionStatus("checking")
      setBootstrapVersion((current) => current + 1)
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "邀请码登录失败")
      setStatus("邀请码登录失败")
      return false
    }
  }

  const resolvePendingMigration = async (useLocalDocument: boolean): Promise<void> => {
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

  const reloadCloudWorkspace = async (): Promise<void> => {
    setError("")
    setStatus("正在重新载入云端配置…")
    try {
      const remote = await loadCloudWorkspace()
      applyCloudWorkspace(remote, `已重新载入云端版本 ${remote.revision}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "重新载入云端配置失败")
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await logoutWorkspace()
    } finally {
      setReady(false)
      setSessionLabel("")
      setCloudSessionStatus("anonymous")
      setStatus("已退出当前工作空间，本机缓存仍保留")
    }
  }

  const renameSessionNickname = async (label: string): Promise<boolean> => {
    const nickname = label.trim()
    if (!nickname) {
      setError("昵称不能为空")
      return false
    }
    setError("")
    try {
      const session = await renameWorkspaceNickname(nickname)
      setSessionLabel(session.label)
      setStatus("昵称已更新")
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "昵称更新失败")
      return false
    }
  }

  const syncImmediately = async (document: WorkspaceDocument): Promise<boolean> => {
    if (!cloudEnabled) return true
    pendingSyncRef.current = document
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = null
    await flushCloudSync()
    return !syncStoppedRef.current
  }

  return {
    builds,
    clearError: () => setError(""),
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
    syncImmediately,
    syncStopped: syncStoppedRef.current
  }
}
