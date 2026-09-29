import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { DatabaseSync } from "node:sqlite"
import { describe, expect, it } from "vitest"

const path = (version: string) => fileURLToPath(new URL(`../snapshots/${version}/game-data.sqlite`, import.meta.url))

describe("7.1 incremental snapshot", () => {
  it("retains every existing data row including Witch talents and adds only the declared entities", () => {
    using database = new DatabaseSync(path("7.1"), { readOnly: true })
    database.prepare("ATTACH DATABASE ? AS previous").run(path("7.0"))
    const tables = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name!='metadata'").all()
    for (const { name } of tables) {
      expect(database.prepare(`SELECT * FROM previous.${name} EXCEPT SELECT * FROM main.${name}`).all(), String(name)).toEqual([])
    }
    expect(database.prepare("SELECT id FROM characters EXCEPT SELECT id FROM previous.characters").all())
      .toEqual([{ id: "Vesna" }, { id: "Vodyanitsa" }])
    expect(database.prepare("SELECT count(*) AS count FROM weapons").get()?.count).toBe(253)
    expect(database.prepare("SELECT count(*) AS count FROM artifact_sets").get()?.count).toBe(63)
    expect(database.prepare("SELECT count(*) AS count FROM character_skill_parameters WHERE character_id IN ('Vesna','Vodyanitsa') AND skill IN ('auto','skill','burst')").get()?.count).toBe(765)
    expect(database.prepare("PRAGMA integrity_check").get()?.integrity_check).toBe("ok")
    expect(database.prepare("PRAGMA foreign_key_check").all()).toEqual([])
  })

  it("stores R1 through R5, original descriptions, and separately attributable baseline and additions", () => {
    using database = new DatabaseSync(path("7.1"), { readOnly: true })
    expect(database.prepare("SELECT value FROM weapon_refinement_parameters WHERE weapon_id='Silverlight' ORDER BY refinement").all())
      .toEqual([52, 65, 78, 91, 104].map(value => ({ value })))
    const provenance = JSON.parse(String(database.prepare("SELECT value FROM metadata WHERE key='version_provenance'").get()?.value))
    expect(provenance.baseline.source.gameVersion).toBe("7.0")
    expect(provenance.additions.commit).toBe("49a6544a6c6ae36089cb42fa591fc46f01de8bcf")
    expect(provenance).toEqual(JSON.parse(readFileSync(new URL("../snapshots/7.1/provenance.json", import.meta.url), "utf8")))
    expect(database.prepare("SELECT value FROM metadata WHERE key LIKE '%constellations/vesna.json'").get()?.value)
      .toContain("翔风剑")
  })
})
