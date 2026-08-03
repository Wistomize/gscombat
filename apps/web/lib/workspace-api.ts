import type {
  ApiErrorResponse,
  SessionResponse,
  WorkspaceDocument,
  WorkspaceResponse
} from "@gscombat/contracts"

export class WorkspaceApiError extends Error {
  readonly code: string
  readonly status: number

  public constructor(status: number, code: string, message: string) {
    super(message)
    this.name = "WorkspaceApiError"
    this.code = code
    this.status = status
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json() as T | ApiErrorResponse
  if (!response.ok) {
    const error = payload as ApiErrorResponse
    throw new WorkspaceApiError(response.status, error.code ?? "workspace_request_failed", error.message)
  }
  return payload as T
}

/** Returns the current invitation session or undefined when this browser is signed out. */
export async function getWorkspaceSession(): Promise<SessionResponse | undefined> {
  const response = await fetch("/api/backend/v1/session", { cache: "no-store" })
  if (response.status === 401) return undefined
  return parseResponse<SessionResponse>(response)
}

/** Exchanges an invitation code for an HTTP-only workspace session. */
export async function loginToWorkspace(code: string): Promise<SessionResponse> {
  const response = await fetch("/api/backend/v1/session/invite", {
    body: JSON.stringify({ code }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  })
  return parseResponse<SessionResponse>(response)
}

/** Clears the current invitation session. */
export async function logoutWorkspace(): Promise<void> {
  const response = await fetch("/api/backend/v1/session/logout", { method: "POST" })
  await parseResponse(response)
}

/** Loads the server-owned workspace aggregate. */
export async function loadCloudWorkspace(): Promise<WorkspaceResponse> {
  const response = await fetch("/api/backend/v1/workspace", { cache: "no-store" })
  return parseResponse<WorkspaceResponse>(response)
}

/** Optimistically saves one complete workspace aggregate. */
export async function saveCloudWorkspace(
  document: WorkspaceDocument,
  expectedRevision: number
): Promise<WorkspaceResponse> {
  const response = await fetch("/api/backend/v1/workspace", {
    body: JSON.stringify({ document, expectedRevision }),
    headers: { "Content-Type": "application/json" },
    method: "PUT"
  })
  return parseResponse<WorkspaceResponse>(response)
}
