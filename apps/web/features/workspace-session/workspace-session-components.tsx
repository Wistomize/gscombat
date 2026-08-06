"use client"

import { useState } from "react"

import type { PendingWorkspaceMigration } from "./use-workspace-session"

const legacyWorkspaceNicknameLabels = new Set(["个人测试", "朋友测试"])

function getWorkspaceNicknameDisplay(label: string): string {
  return !label || legacyWorkspaceNicknameLabels.has(label) ? "未设置昵称" : label
}

interface WorkspaceLoginProps {
  readonly error: string
  readonly onLogin: (inviteCode: string) => Promise<boolean>
}

/** Renders the invitation-code login gate and owns only its credential draft. */
export function WorkspaceLogin({ error, onLogin }: WorkspaceLoginProps) {
  const [inviteCode, setInviteCode] = useState("")

  const submit = async () => {
    if (await onLogin(inviteCode)) setInviteCode("")
  }

  return (
    <main className="workspaceLoginPage">
      <form
        autoComplete="on"
        className="workspaceLoginCard"
        method="post"
        onSubmit={(event) => { event.preventDefault(); void submit() }}
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

/** Renders the one-time choice between an existing local workspace and an empty cloud workspace. */
export function WorkspaceMigration({ error, migration, onDownload, onResolve }: WorkspaceMigrationProps) {
  return (
    <main className="workspaceLoginPage">
      <section className="workspaceLoginCard workspaceMigrationCard">
        <span>FIRST SYNC</span>
        <h1>发现本机已有配置</h1>
        <p>
          云端工作空间目前为空，本机有 {migration.localDocument.builds.length} 份角色配置。
          请选择首次同步方式。
        </p>
        {error ? <div className="workspaceLoginError" role="alert">{error}</div> : null}
        <div className="workspaceMigrationActions">
          <button className="workspacePrimaryButton" type="button" onClick={() => void onResolve(true)}>
            上传本机配置
          </button>
          <button type="button" onClick={() => void onResolve(false)}>使用云端空配置</button>
          <button type="button" onClick={onDownload}>先导出本机备份</button>
        </div>
      </section>
    </main>
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
