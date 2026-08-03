import { createHash } from "node:crypto"
import { setTimeout } from "node:timers/promises"

import { type Dispatcher, EnvHttpProxyAgent, fetch, type Response as UndiciResponse } from "undici"

import type { GameDataSourceManifest, GiStatsDocument } from "./types.js"

export interface DownloadedGameDataSource {
  readonly document: GiStatsDocument
  readonly manifest: GameDataSourceManifest
}

function calculateSha256(data: Uint8Array): string {
  return createHash("sha256").update(data).digest("hex")
}

async function fetchWithRetry(url: string, dispatcher: Dispatcher): Promise<UndiciResponse> {
  let lastError: unknown

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await fetch(url, { dispatcher, signal: AbortSignal.timeout(30_000) })
    } catch (error) {
      lastError = error
      if (attempt < 3) await setTimeout(attempt * 500)
    }
  }

  throw new Error("Unable to connect to the pinned gi-stats source after 3 attempts", { cause: lastError })
}

/** Downloads and verifies the single pinned gi-stats source used to build a local snapshot. */
export async function downloadGameDataSource(manifest: GameDataSourceManifest): Promise<DownloadedGameDataSource> {
  const dispatcher = new EnvHttpProxyAgent()
  try {
    const response = await fetchWithRetry(manifest.dataUrl, dispatcher)
    if (!response.ok) throw new Error(`Unable to download gi-stats: HTTP ${response.status}`)

    const data = new Uint8Array(await response.arrayBuffer())
    const actualSha256 = calculateSha256(data)
    if (actualSha256 !== manifest.dataSha256) {
      throw new Error(`gi-stats checksum mismatch: expected ${manifest.dataSha256}, received ${actualSha256}`)
    }

    return {
      document: JSON.parse(new TextDecoder().decode(data)) as GiStatsDocument,
      manifest
    }
  } finally {
    await dispatcher.close()
  }
}
