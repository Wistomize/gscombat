import { existsSync } from "node:fs"
import { DatabaseSync } from "node:sqlite"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"
import { supportedWeapons } from "@gscombat/content"

import generatedVisualAssets from "../../lib/visual-assets.generated.json"

interface ArtifactSetRow {
  readonly id: string
}

const artifactVisuals = generatedVisualAssets.artifacts as Readonly<Record<string, Readonly<Record<string, string>>>>
const weaponVisuals = generatedVisualAssets.weapons as Readonly<Record<string, string>>
const gameDataPath = fileURLToPath(new URL("../../../../packages/game-data/snapshots/7.0/game-data.sqlite", import.meta.url))
const publicPath = fileURLToPath(new URL("../../public", import.meta.url))

function listArtifactSetIds(): readonly string[] {
  const database = new DatabaseSync(gameDataPath, { readOnly: true })
  try {
    const rows = database.prepare("SELECT id FROM artifact_sets ORDER BY id").all() as unknown as ArtifactSetRow[]
    return rows.map((row) => row.id)
  } finally {
    database.close()
  }
}

describe("equipment visual assets", () => {
  it("covers every supported weapon with a local icon", () => {
    const missingIcons = supportedWeapons.filter(({ weaponId }) => {
      const icon = weaponVisuals[weaponId]
      return !icon || !existsSync(`${publicPath}${icon}`)
    }).map(({ weaponId }) => weaponId)
    expect(missingIcons).toEqual([])
  })

  it("covers every artifact set in the active game-data snapshot", () => {
    const missingMappings = listArtifactSetIds().filter((setId) => Object.keys(artifactVisuals[setId] ?? {}).length === 0)
    const missingFiles = Object.values(artifactVisuals)
      .flatMap((slotIcons) => Object.values(slotIcons))
      .filter((iconPath) => !existsSync(`${publicPath}${iconPath}`))

    expect(missingMappings).toEqual([])
    expect(missingFiles).toEqual([])
  })
})
