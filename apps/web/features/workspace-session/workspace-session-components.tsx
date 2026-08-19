"use client"

import { useState } from "react"

import type { BrowserWorkspaceStorageMode } from "../../lib/workspace/workspace-config"
import type { PendingWorkspaceMigration } from "./use-workspace-session"

const legacyWorkspaceNicknameLabels = new Set(["个人测试", "朋友测试"])

function getWorkspaceNicknameDisplay(label: string): string {
  return !label || legacyWorkspaceNicknameLabels.has(label) ? "未设置昵称" : label
}

interface WorkspaceLoginProps {
  readonly error: string
  readonly onClose: () => void
  readonly onLogin: (inviteCode: string) => Promise<boolean>
}

/** Renders optional invitation login without blocking the local workspace. */
export function WorkspaceLogin({ error, onClose, onLogin }: WorkspaceLoginProps) {
  const [inviteCode, setInviteCode] = useState("")

  const submit = async () => {
    if (await onLogin(inviteCode)) {
      setInviteCode("")
      onClose()
    }
  }

  return (
    <div className="workspaceDialogBackdrop" role="presentation">
      <form
        aria-modal="true"
        autoComplete="on"
        className="workspaceLoginCard workspaceLoginDialog"
        method="post"
        role="dialog"
        onSubmit={(event) => { event.preventDefault(); void submit() }}
      >
        <div className="workspaceLoginHeading">
          <div>
            <span>INVITE WORKSPACE</span>
            <h1>使用邀请码同步</h1>
          </div>
          <button aria-label="关闭邀请码登录" type="button" onClick={onClose}>×</button>
        </div>
        <p>
          邀请码可以同步数据并在多端通用；无邀请码时仅使用浏览器缓存，请及时导出个人数据，需要时再通过 JSON 导入恢复。
        </p>
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
        <div className="workspaceMigrationActions">
          <button className="workspacePrimaryButton" disabled={inviteCode.trim().length < 16} type="submit">
            登录并同步
          </button>
          <button type="button" onClick={onClose}>继续使用本机模式</button>
        </div>
      </form>
    </div>
  )
}

/** Renders the non-interactive cloud bootstrap gate. */
export function WorkspaceConnecting() {
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

interface WorkspaceMigrationProps {
  readonly error: string
  readonly migration: PendingWorkspaceMigration
  readonly onDownload: () => void
  readonly onResolve: (useLocalDocument: boolean) => Promise<void>
}

/** Protects divergent local and cloud documents by requiring an explicit source choice. */
export function WorkspaceMigration({ error, migration, onDownload, onResolve }: WorkspaceMigrationProps) {
  const remoteCount = migration.remote.document.builds.length
  return (
    <main className="workspaceLoginPage">
      <section className="workspaceLoginCard workspaceMigrationCard">
        <span>SYNC CHOICE</span>
        <h1>本机与云端配置不同</h1>
        <p>
          本机有 {migration.localDocument.builds.length} 份角色配置，云端有 {remoteCount} 份。
          请选择保留哪一份；覆盖前可以先导出本机备份。
        </p>
        {error ? <div className="workspaceLoginError" role="alert">{error}</div> : null}
        <div className="workspaceMigrationActions">
          <button className="workspacePrimaryButton" type="button" onClick={() => void onResolve(true)}>
            使用本机配置覆盖云端
          </button>
          <button type="button" onClick={() => void onResolve(false)}>使用云端配置</button>
          <button type="button" onClick={onDownload}>先导出本机备份</button>
        </div>
      </section>
    </main>
  )
}

interface WorkspaceLocalSessionHeaderProps {
  readonly onLogin: () => void
  readonly storageMode: BrowserWorkspaceStorageMode
}

/** Shows local persistence status and the optional cloud-login entry point. */
export function WorkspaceLocalSessionHeader({ onLogin, storageMode }: WorkspaceLocalSessionHeaderProps) {
  const label = storageMode === "local"
    ? "本机模式 · 自动保存"
    : storageMode === "session" ? "临时模式 · 关闭标签页前请导出" : "未缓存 · 请使用导入导出"
  return (
    <div className="workspaceSession workspaceLocalSession">
      <span className="workspaceNickname">{label}</span>
      <button type="button" onClick={onLogin}>使用邀请码同步</button>
    </div>
  )
}

interface WorkspaceSessionHeaderProps {
  readonly label: string
  readonly onRename: (label: string) => Promise<boolean>
  readonly onSignOut: () => Promise<void>
}

/** Renders nickname editing and sign-out controls for an authenticated workspace. */
export function WorkspaceSessionHeader({ label, onRename, onSignOut }: WorkspaceSessionHeaderProps) {
  const [draft, setDraft] = useState("")
  const [renaming, setRenaming] = useState(false)
  const [saving, setSaving] = useState(false)

  const startRenaming = () => {
    setDraft(label)
    setRenaming(true)
  }
  const cancelRenaming = () => {
    setDraft(label)
    setRenaming(false)
  }
  const save = async () => {
    setSaving(true)
    try {
      if (await onRename(draft)) setRenaming(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="workspaceSession">
      {renaming ? (
        <form className="workspaceSessionRename" onSubmit={(event) => { event.preventDefault(); void save() }}>
          <input
            aria-label="昵称"
            autoFocus
            maxLength={80}
            name="nickname"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button disabled={saving} type="submit">保存</button>
          <button disabled={saving} type="button" onClick={cancelRenaming}>取消</button>
        </form>
      ) : (
        <>
          <span className="workspaceNickname">{getWorkspaceNicknameDisplay(label)}</span>
          <button type="button" onClick={startRenaming}>改名</button>
        </>
      )}
      <button type="button" onClick={() => void onSignOut()}>退出</button>
    </div>
  )
}
