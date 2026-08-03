import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import {
  assertSemanticLocalizationPreviewManifest,
  calculateSemanticLocalizationAggregateSha256,
  createAndWriteSemanticLocalizationPreview,
  createSemanticLocalizationPreview
} from "./semantic-localization.js"
import type { SemanticLocalizationPreviewSourceManifest } from "./semantic-localization.js"
import type { GameDataSourceManifest, GiStatsDocument } from "./types.js"

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

const numericManifest: GameDataSourceManifest = {
  dataSha256: "numeric-fixture-sha256",
  dataUrl: "https://example.test/allStat_gen.json",
  gameVersion: "6.7",
  schemaVersion: 2,
  upstreamCommit: "fixture-commit",
  upstreamCommittedAt: "2026-07-09T13:05:30Z",
  upstreamLicense: "MIT",
  upstreamRepository: "https://github.com/example/fixture"
}

const numericDocument: GiStatsDocument = {
  art: { data: {}, main: {}, sub: {}, subRoll: {}, subRollCorrection: {} },
  char: {
    data: {
      Xiangling: { rarity: 4, weaponType: "polearm" }
    },
    expCurve: {},
    skillParam: {
      Xiangling: {
        burst: [
          [1.1, 1.2],
          [2.1, 2.2],
          [3.1, 3.2],
          [1.12, 2.016],
          [5.1, 5.2],
          [6.1, 6.2],
          [7.1, 7.2]
        ]
      }
    }
  },
  weapon: { data: {}, expCurve: {} }
}

function createManifest(
  overrides: Partial<SemanticLocalizationPreviewSourceManifest> = {}
): SemanticLocalizationPreviewSourceManifest {
  const assets = [
    {
      assetId: "Xiangling",
      relativePath: "libs/gi/dm-localization/assets/locales/chs/char_Xiangling_gen.json",
      sha256: "a".repeat(64),
      talentParameterOwnerId: "Xiangling"
    }
  ] as const
  return {
    assets,
    assetsAggregateSha256: calculateSemanticLocalizationAggregateSha256(assets),
    formatVersion: 3,
    gameVersion: "6.7",
    locale: "chs",
    upstreamCommit: "fixture-commit",
    upstreamRepository: "https://github.com/example/fixture",
    ...overrides
  }
}

describe("semantic localization preview", () => {
  it("preserves Xiangling's string index and ignores empty fixed slots", () => {
    const manifest = createManifest()
    const preview = createSemanticLocalizationPreview({
      documents: [
        {
          document: {
            burst: {
              name: "旋火轮",
              skillParams: {
                "3": "旋火轮伤害",
                "7": "",
                "19": " "
              }
            }
          },
          source: manifest.assets[0]!
        }
      ],
      manifest,
      numericDocument,
      numericManifest
    })

    expect(preview.labels).toEqual([
      {
        characterId: "Xiangling",
        groupId: "burst",
        label: "旋火轮伤害",
        locale: "chs",
        parameterIndex: 3
      }
    ])
    expect(preview.groups).toEqual([
      { characterId: "Xiangling", displayName: "旋火轮", groupId: "burst", locale: "chs" }
    ])
    expect(preview.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "numeric_parameter_without_label", parameterIndex: 0 }),
        expect.objectContaining({ code: "numeric_parameter_without_label", parameterIndex: 6 })
      ])
    )
    expect(preview.diagnostics).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "label_without_numeric_parameter" })])
    )
  })

  it("reports a non-empty label that does not align to a numeric parameter", () => {
    const manifest = createManifest()
    const preview = createSemanticLocalizationPreview({
      documents: [
        {
          document: { burst: { skillParams: { "7": "不存在的倍率" } } },
          source: manifest.assets[0]!
        }
      ],
      manifest,
      numericDocument,
      numericManifest
    })

    expect(preview.labels).toEqual([])
    expect(preview.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "label_without_numeric_parameter",
          groupId: "burst",
          parameterIndex: 7
        })
      ])
    )
  })

  it("requires an explicit, aggregate-locked source manifest before a preview can be built", () => {
    const manifest = createManifest({ assetsAggregateSha256: "b".repeat(64) })

    expect(() => assertSemanticLocalizationPreviewManifest(manifest, numericManifest)).toThrow(
      "semantic localization aggregate checksum mismatch"
    )
  })

  it("fails before replacing a sidecar or touching an existing numeric snapshot when its manifest is invalid", () => {
    const directory = mkdtempSync(join(tmpdir(), "project-b-semantic-preview-"))
    temporaryDirectories.push(directory)
    const numericSnapshotPath = join(directory, "game-data.sqlite")
    const sidecarPath = join(directory, "semantic-localization-preview.v3.json")
    writeFileSync(numericSnapshotPath, "numeric-snapshot")
    writeFileSync(sidecarPath, "existing-sidecar")
    const before = readFileSync(numericSnapshotPath)

    expect(() =>
      createAndWriteSemanticLocalizationPreview({
        documents: [],
        manifest: createManifest({ gameVersion: "6.8" }),
        numericDocument,
        numericManifest,
        outputPath: sidecarPath
      })
    ).toThrow("semantic localization game version")
    expect(readFileSync(numericSnapshotPath)).toEqual(before)
    expect(readFileSync(sidecarPath, "utf8")).toBe("existing-sidecar")
    expect(() => readFileSync(`${sidecarPath}.tmp`)).toThrow()
  })
})
