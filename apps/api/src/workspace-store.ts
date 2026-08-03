import { createHmac, randomBytes, randomUUID } from "node:crypto"
import { DatabaseSync } from "node:sqlite"

import type { WorkspaceDocument, WorkspaceResponse } from "@gscombat/contracts"

interface InviteRow {
  readonly id: string
  readonly label: string
  readonly workspace_id: string
}

interface WorkspaceRow {
  readonly document_json: string
  readonly revision: number
}

export interface CreatedWorkspaceInvite {
  readonly code: string
  readonly inviteId: string
  readonly label: string
  readonly workspaceId: string
}

export interface WorkspaceInviteSession {
  readonly inviteId: string
  readonly label: string
  readonly workspaceId: string
}

export interface WorkspaceInviteSummary {
  readonly inviteId: string
  readonly label: string
  readonly revoked: boolean
  readonly workspaceId: string
}

const emptyWorkspaceDocument: WorkspaceDocument = {
  builds: [],
  party: { memberBuildIds: [] },
  schemaVersion: 1
}

/** Persists invite-scoped workspace documents in one writable SQLite database. */
export class WorkspaceStore {
  readonly #database: DatabaseSync
  readonly #tokenSecret: string

  public constructor(databasePath: string, tokenSecret: string) {
    this.#database = new DatabaseSync(databasePath)
    this.#tokenSecret = tokenSecret
    this.#database.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;")
    this.#database.exec(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        schema_version INTEGER NOT NULL,
        document_json TEXT NOT NULL,
        revision INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS invite_codes (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        code_hash TEXT NOT NULL UNIQUE,
        label TEXT NOT NULL,
        created_at TEXT NOT NULL,
        revoked_at TEXT,
        last_used_at TEXT
      );
      CREATE INDEX IF NOT EXISTS invite_codes_workspace_id_idx ON invite_codes(workspace_id);
    `)
  }

  public [Symbol.dispose](): void {
    this.close()
  }

  /** Creates an empty workspace and returns its invitation code exactly once. */
  public createInvite(label: string): CreatedWorkspaceInvite {
    const normalizedLabel = label.trim()
    if (!normalizedLabel || normalizedLabel.length > 80) throw new Error("Invite label must contain 1 to 80 characters")

    const workspaceId = randomUUID()
    const inviteId = randomUUID()
    const code = `YSIN-${randomBytes(20).toString("base64url")}`
    const now = new Date().toISOString()

    this.#database.exec("BEGIN IMMEDIATE")
    try {
      this.#database.prepare(`
        INSERT INTO workspaces (id, schema_version, document_json, revision, created_at, updated_at)
        VALUES (?, 1, ?, 0, ?, ?)
      `).run(workspaceId, JSON.stringify(emptyWorkspaceDocument), now, now)
      this.#database.prepare(`
        INSERT INTO invite_codes (id, workspace_id, code_hash, label, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(inviteId, workspaceId, this.#hashCode(code), normalizedLabel, now)
      this.#database.exec("COMMIT")
    } catch (error) {
      this.#database.exec("ROLLBACK")
      throw error
    }

    return { code, inviteId, label: normalizedLabel, workspaceId }
  }

  /** Authenticates one invitation code and records its most recent use. */
  public authenticateInvite(code: string): WorkspaceInviteSession | undefined {
    const row = this.#database.prepare(`
      SELECT id, label, workspace_id
      FROM invite_codes
      WHERE code_hash = ? AND revoked_at IS NULL
    `).get(this.#hashCode(code.trim())) as unknown as InviteRow | undefined
    if (!row) return undefined

    this.#database.prepare("UPDATE invite_codes SET last_used_at = ? WHERE id = ?")
      .run(new Date().toISOString(), row.id)
    return { inviteId: row.id, label: row.label, workspaceId: row.workspace_id }
  }

  /** Resolves a signed session claim only while its invitation remains active. */
  public getActiveInvite(inviteId: string, workspaceId: string): WorkspaceInviteSession | undefined {
    const row = this.#database.prepare(`
      SELECT id, label, workspace_id
      FROM invite_codes
      WHERE id = ? AND workspace_id = ? AND revoked_at IS NULL
    `).get(inviteId, workspaceId) as unknown as InviteRow | undefined
    return row ? { inviteId: row.id, label: row.label, workspaceId: row.workspace_id } : undefined
  }

  /** Returns one workspace aggregate and its optimistic-concurrency revision. */
  public getWorkspace(workspaceId: string): WorkspaceResponse | undefined {
    const row = this.#database.prepare(`
      SELECT document_json, revision
      FROM workspaces
      WHERE id = ?
    `).get(workspaceId) as unknown as WorkspaceRow | undefined
    if (!row) return undefined
    return { document: JSON.parse(row.document_json) as WorkspaceDocument, revision: row.revision }
  }

  /** Replaces one workspace only when the caller still owns the expected revision. */
  public updateWorkspace(
    workspaceId: string,
    expectedRevision: number,
    document: WorkspaceDocument
  ): WorkspaceResponse | undefined {
    const now = new Date().toISOString()
    const result = this.#database.prepare(`
      UPDATE workspaces
      SET document_json = ?, schema_version = ?, revision = revision + 1, updated_at = ?
      WHERE id = ? AND revision = ?
    `).run(JSON.stringify(document), document.schemaVersion, now, workspaceId, expectedRevision)
    if (result.changes !== 1) return undefined
    return { document, revision: expectedRevision + 1 }
  }

  /** Lists invite metadata without ever revealing invitation codes or their digests. */
  public listInvites(): readonly WorkspaceInviteSummary[] {
    const rows = this.#database.prepare(`
      SELECT id, label, workspace_id, revoked_at
      FROM invite_codes
      ORDER BY created_at ASC
    `).all() as unknown as readonly (InviteRow & { readonly revoked_at: string | null })[]
    return rows.map((row) => ({
      inviteId: row.id,
      label: row.label,
      revoked: row.revoked_at !== null,
      workspaceId: row.workspace_id
    }))
  }

  /** Revokes one invitation and all future sessions derived from it. */
  public revokeInvite(inviteId: string): boolean {
    const result = this.#database.prepare(`
      UPDATE invite_codes
      SET revoked_at = ?
      WHERE id = ? AND revoked_at IS NULL
    `).run(new Date().toISOString(), inviteId)
    return result.changes === 1
  }

  /** Closes the writable SQLite connection. */
  public close(): void {
    this.#database.close()
  }

  #hashCode(code: string): string {
    return createHmac("sha256", this.#tokenSecret).update(code).digest("hex")
  }
}
