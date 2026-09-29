import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { DatabaseSync } from "node:sqlite"
import { afterEach, describe, expect, it } from "vitest"
import { GameDataRepository } from "../../src/repository.js"
import { createGameDataSnapshot } from "../../src/snapshot.js"
import { PACKAGE_ROOT, outputPath } from "./evaluate.js"
import { COMMIT, hash, loadInputs, readJson, refinementNumber, type Mappings, type SourceLock } from "./input.js"
import { normalize } from "./normalize.js"
import { auditBaselineGroups, buildGapInventory } from "./gaps.js"
import { assertPinnedSemanticInventory, buildSemanticInventory } from "./semantic-inventory.js"
import { checkSemanticMappings, parseSemanticMappings } from "./semantic-mapping.js"
import { withReviewedSemanticGroups } from "./semantic-import.js"
import { buildSemanticDecisionReport, type PendingSemanticDecision } from "./semantic-decisions.js"
import { compareDatabases, mappingSuggestions, sourceParameterInventory, summarize } from "./report.js"

const directory = dirname(fileURLToPath(import.meta.url))
const fixtures = ["numeric", "labels"].map(name => readJson(join(directory, `fixtures/${name}.json`)) as {
  sourceCommit: string; inputs: Record<string, unknown>
})
const inputs = new Map(fixtures.flatMap(f => Object.entries(f.inputs)))
const allMappings = readJson(join(PACKAGE_ROOT, "sources/genshin-db-evaluation.mappings.json")) as Mappings
const mappings: Mappings = { ...allMappings,
  characters: allMappings.characters.filter(m => ["Xiangling", "Clorinde", "Diona", "Vodyanitsa", "Vesna"].includes(m.id)),
  weapons: allMappings.weapons.filter(m => ["Absolution", "BeginnersProtector"].includes(m.id)),
  artifacts: allMappings.artifacts.filter(m => m.id === "EmblemOfSeveredFate"),
  talents: allMappings.talents.filter(m => ["Xiangling", "Clorinde", "Diona"].includes(m.owner) && m.group === "auto"
    || m.owner === "Xiangling" && ["skill", "burst"].includes(m.group)),
  refinements: allMappings.refinements.filter(m => m.id === "Absolution") }
const baselinePath = join(PACKAGE_ROOT, "snapshots/7.0/game-data.sqlite")
const temporary: string[] = []
function temp() {
  const path = mkdtempSync(join(realpathSync(tmpdir()), "genshindb-test-"))
  temporary.push(path)
  return path
}
afterEach(() => temporary.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })))

describe("offline genshin-db evaluation with pinned real-data extracts", () => {
  it("enumerates every unmapped numeric leaf with stable ten-owner batches", () => {
    using baseline = new DatabaseSync(baselinePath, { readOnly: true })
    const inventory = buildSemanticInventory(baseline, allMappings)
    expect(() => assertPinnedSemanticInventory(inventory)).not.toThrow()
    expect(inventory.counts).toEqual({ owners: 130, groups: 732, fields: 1893, emptyGroups: 620, metadataGroups: 14 })
    expect(inventory.batches.map(batch => batch.owners.length)).toEqual(Array(13).fill(10))
    expect(new Set(inventory.fields.map(field => field.target)).size).toBe(1893)
    expect(inventory.fields.find(field => field.target === "Xiangling/constellation1/0")?.baselineValue).toBe(0.15)
    expect(inventory.fields.some(field => field.target.startsWith("Albedo/lockedPassive/0/"))).toBe(true)
  })

  it("recomputes reviewed description and energy-conversion fields from locked source evidence", () => {
    using baseline = new DatabaseSync(baselinePath, { readOnly: true })
    const inventory = buildSemanticInventory(baseline, allMappings)
    const lock = readJson(join(PACKAGE_ROOT, "sources/genshin-db-evaluation.lock.json")) as SourceLock
    const reviewed = parseSemanticMappings(readJson(join(PACKAGE_ROOT,
      "sources/genshin-db-evaluation.semantic-mappings.json")))
    const source = new Map(inputs)
    source.set("src/data/ChineseSimplified/talents/aino.json", { passive2: {
      description: "爱诺元素爆发造成的伤害提升，提升值基于爱诺的元素精通的50%。" } })
    source.set("src/data/ChineseSimplified/talents/alhaitham.json", { passive2: { description:
      "艾尔海森的每点元素精通，都会使光幕伤害与殊境·显象缚结造成的伤害提升0.1%。\n" +
      "通过这种方式，至多使光幕伤害与殊境·显象缚结造成的伤害提升100%。" } })
    source.set("src/data/ChineseSimplified/talents/alyosha.json", { passive1: { description:
      "**图加林**进行攻击时，还会为队伍中附近的当前场上角色恢复生命值，回复量相当于阿罗夏攻击力的120%。" } })
    source.set("src/data/ChineseSimplified/talents/aratakiitto.json", { passive2: {
      description: "「荒泷逆袈裟」造成的伤害提高，伤害提高值基于荒泷一斗防御力的35%。" } })
    source.set("src/data/ChineseSimplified/constellations/xiangling.json", {
      c1: { description: "受到锅巴攻击的敌人，火元素抗性降低15%，持续6秒。" } })
    source.set("src/data/ChineseSimplified/talents/jean.json", {
      passive2: { description: "使用蒲公英之风后，恢复20%元素能量。" } })
    const talents = structuredClone(source.get("src/data/stats/talents.json")) as Record<string, unknown>
    talents.jean = { combat3: { param8: [80] } }
    source.set("src/data/stats/talents.json", talents)
    const check = checkSemanticMappings(inventory, reviewed, source, lock)
    expect(check.resolved.map(row => [row.target, row.value])).toEqual([
      ["Aino/passive2/0/0", 0.5], ["Alhaitham/passive2/0/0", 0.001],
      ["Alhaitham/passive2/1/0", 1], ["Alyosha/passive1/0/0", 1.2],
      ["AratakiItto/passive2/0/0", 0.35], ["Xiangling/constellation1/0", 0.15],
      ["Xiangling/constellation1/1", 6], ["Jean/passive2/0/0", 16] ])
    expect(check.missing).toHaveLength(1885)
    expect(() => checkSemanticMappings(inventory, [...reviewed, reviewed[0]!], source, lock))
      .toThrow("Duplicate semantic target")
    expect(() => checkSemanticMappings(inventory, [{ ...reviewed[0]!, terms: [{ ...reviewed[0]!.terms[0]!,
      sourceSha256: "wrong" }] }], source, lock)).toThrow("Unlocked or changed source")
    expect(() => checkSemanticMappings(inventory, [{ ...reviewed[0]!, terms: [{ ...reviewed[0]!.terms[0]!,
      quote: "不在来源中的文字" }] }], source, lock)).toThrow("Ambiguous description evidence")
    expect(() => checkSemanticMappings(inventory, [{ ...reviewed[0]!, canonicalUnit: "seconds" }], source, lock))
      .toThrow("Unsupported semantic unit conversion")
    expect(() => checkSemanticMappings(inventory, [{ ...reviewed[2]!, target: "Jean/passive2/0" }], source, lock))
      .toThrow("Unknown semantic target")
    const { document } = normalize(inputs, mappings, baseline)
    const sampleCheck = { ...check, resolved: check.resolved.filter(row =>
      row.target.startsWith("Xiangling/") || row.target.startsWith("Jean/")) }
    const candidateDocument = withReviewedSemanticGroups({ ...document, char: { ...document.char,
      data: { ...document.char.data, Jean: { ...document.char.data.Xiangling!, key: "Jean" } } } }, inventory, sampleCheck)
    expect(candidateDocument.char.skillParam.Jean?.passive2).toEqual([[16]])
    expect(candidateDocument.char.skillParam.Xiangling?.constellation1).toEqual([0.15, 6])
    expect(candidateDocument.char.skillParam.Xiangling?.constellation2).toBeUndefined()
    const candidatePath = join(temp(), "reviewed.sqlite")
    createGameDataSnapshot({ databasePath: candidatePath, document: candidateDocument, manifest: {
      schemaVersion: 2, dataSha256: "reviewed", dataUrl: "reviewed", gameVersion: "7.1-evaluation",
      upstreamCommit: COMMIT, upstreamCommittedAt: "2026-09-21T20:39:46Z", upstreamLicense: "MIT",
      upstreamRepository: "fixture" } })
    using candidate = new GameDataRepository(candidatePath)
    expect(candidate.getCharacterSkillParameterValue("Xiangling", "constellation1", [0])).toBe(0.15)
    expect(candidate.getCharacterSkillParameterValue("Xiangling", "constellation1", [1])).toBe(6)
    expect(candidate.getCharacterSkillParameterValue("Jean", "passive2", [0, 0])).toBe(16)
    expect(candidate.getCharacterSkillParameterGroup("Xiangling", "constellation2")).toBeUndefined()
    const pending = readJson(join(PACKAGE_ROOT, "sources/genshin-db-evaluation.semantic-decisions.json")) as
      PendingSemanticDecision[]
    source.set("src/data/ChineseSimplified/talents/albedo.json", { passive1: {
      description: "创生法·拟造阳华的刹那之花对生命值低于50%的敌人造成的伤害提高25%。" } })
    const decisions = buildSemanticDecisionReport(inventory, check, pending, [{
      location: "Albedo/passive/reference", reference: { groupId: "lockedPassive", path: [0, 0] } }], source, lock)
    expect(decisions[0]).toMatchObject({ target: "Albedo/lockedPassive/0/0", status: "needs-user-decision",
      baselineValue: 0.04, affectedContentReferences: ["Albedo/passive/reference"] })
    expect(() => buildSemanticDecisionReport(inventory, check, [{ ...pending[0]!, target: reviewed[0]!.target }],
      [], source, lock)).toThrow("Invalid pending decision")
  })

  it("does not call empty groups, metadata, or described constellations upstream-missing", () => {
    using baseline = new DatabaseSync(baselinePath, { readOnly: true })
    const descriptions = new Map(inputs)
    descriptions.set("src/data/ChineseSimplified/constellations/xiangling.json", {
      c1: { description: "受到锅巴攻击的敌人，火元素抗性降低15%，持续6秒。" } })
    const audit = auditBaselineGroups(baseline, descriptions, allMappings)
    const find = (owner: string, group: string) => audit.find(row => row.owner === owner && row.group === group)
    expect(find("Xiangling", "constellation3")?.status).toBe("empty")
    expect(find("Albedo", "upgradeableSkills")?.status).toBe("metadata")
    expect(find("Xiangling", "constellation1")?.status).toBe("description-backed-unreviewed")
    expect(find("Xiangling", "constellation1")?.literalCoverage).toBe("all")
    const gaps = buildGapInventory(baseline, descriptions, mappings, [], [], { references: [], newUnmodeled: [] })
    expect(gaps.find(gap => gap.owner === "Xiangling" && gap.group === "constellation1")?.category)
      .toBe("description-backed-unreviewed")
    expect(gaps.some(gap => gap.owner === "Xiangling" && gap.group === "constellation3")).toBe(false)
    expect(gaps.some(gap => gap.owner === "Albedo" && gap.group === "upgradeableSkills")).toBe(false)
  })

  it("covers every baseline combat group and named weapon refinement without treating conflicts as verified", () => {
    using baseline = new DatabaseSync(baselinePath, { readOnly: true })
    const groups = baseline.prepare("SELECT character_id, group_id FROM character_skill_parameter_groups WHERE group_id IN ('auto','skill','burst','sprint')").all()
    expect(groups).toHaveLength(398)
    for (const row of groups) {
      expect(allMappings.talents.filter(mapping => mapping.owner === row.character_id && mapping.group === row.group_id))
        .toHaveLength(1)
    }
    expect(allMappings.talents.filter(mapping => mapping.status === "blocked-source-mismatch")).toHaveLength(7)
    expect(allMappings.talents.filter(mapping => mapping.status === "source-only")).toHaveLength(6)
    const refinements = baseline.prepare("SELECT DISTINCT weapon_id, parameter FROM weapon_refinement_parameters").all()
    expect(refinements).toHaveLength(37)
    for (const row of refinements) {
      expect(allMappings.refinements.find(mapping => mapping.id === row.weapon_id)?.parameters
        .some(parameter => parameter.name === row.parameter)).toBe(true)
    }
  })

  it("imports reviewed skip-index mappings and preserves the baseline byte-for-byte", () => {
    const before = hash(readFileSync(baselinePath))
    using baseline = new DatabaseSync(baselinePath, { readOnly: true })
    const { document, issues, refinements } = normalize(inputs, mappings, baseline)
    const databasePath = join(temp(), "candidate.sqlite")
    const manifest = { schemaVersion: 2, dataSha256: "fixture", dataUrl: "fixture", gameVersion: "7.1-evaluation",
      upstreamCommit: COMMIT, upstreamCommittedAt: "2026-09-21T20:39:46Z", upstreamLicense: "MIT", upstreamRepository: "fixture" }
    createGameDataSnapshot({ databasePath, document, manifest })
    using candidate = new GameDataRepository(databasePath)
    using old = new GameDataRepository(baselinePath)
    for (const [owner, index] of [["Xiangling", 0], ["Clorinde", 7], ["Diona", 5]] as const) {
      for (const level of [1, 10, 13, 15]) {
        expect(candidate.getCharacterSkillParameter(owner, "auto", index, level))
          .toBe(old.getCharacterSkillParameter(owner, "auto", index, level))
      }
    }
    expect(candidate.getCharacterSkillParameter("Clorinde", "auto", 7, 1)).toBe(0.900102)
    expect(candidate.getCharacterSkillParameter("Diona", "auto", 5, 1)).toBe(0.4386)
    expect(candidate.getCharacterSkillParameterGroup("Xiangling", "passive2")).toBeUndefined()
    expect(issues.some(i => i.entity === "Lauma" && i.category === "missing-inherent-stats")).toBe(true)
    expect(refinements.filter(r => r.weapon === "Absolution").map(r => r.values[0])).toEqual([0.2, 0.25, 0.3, 0.35, 0.4])
    using sql = new DatabaseSync(databasePath, { readOnly: true })
    const differences = compareDatabases(baseline, sql, mappings)
    expect(differences.filter(d => d.table === "artifact_main_stats").every(d => d.category === "inherited")).toBe(true)
    expect(differences.some(d => d.category === "candidate-not-imported")).toBe(true)
    expect(Object.values(summarize(differences)).reduce((sum, n) => sum + n, 0)).toBe(differences.length)
    expect(hash(JSON.stringify(differences))).toBe(hash(JSON.stringify(compareDatabases(baseline, sql, mappings))))
    expect(hash(readFileSync(baselinePath))).toBe(before)
  })

  it("rejects corrupt offline input and accepts repeat reads without any network access", async () => {
    const root = temp(), path = "src/data/stats/characters.json"
    mkdirSync(join(root, "src/data/stats"), { recursive: true })
    const bytes = JSON.stringify(inputs.get(path))
    writeFileSync(join(root, path), bytes)
    const lock: SourceLock = { commit: COMMIT, committedAt: "fixture", version: "7.1",
      baselineSha256: hash("fixture"), files: { [path]: hash(bytes) } }
    expect(await loadInputs(lock, root, true)).toEqual(await loadInputs(lock, root, true))
    writeFileSync(join(root, path), "{}")
    await expect(loadInputs(lock, root, true)).rejects.toThrow("Checksum mismatch")
    await expect(loadInputs({ ...lock, files: { "../escape.json": hash(bytes) } }, root, true)).rejects.toThrow("Invalid locked path")
  })

  it("rejects traversal, existing run folders, and symlink output paths", () => {
    const root = temp()
    for (const run of ["../snapshots/7.0", "/data/workspace.sqlite", "../../sources/current.json", ""]) {
      expect(() => outputPath(root, run)).toThrow("Invalid run name")
    }
    symlinkSync(temp(), join(root, ".cache"))
    expect(() => outputPath(root, "run")).toThrow("Symlink forbidden")
    const otherRoot = temp()
    const target = outputPath(otherRoot, "run")
    mkdirSync(target, { recursive: true })
    expect(() => outputPath(otherRoot, "run")).toThrow("already exists")
  })

  it("does not turn numerical suggestions or composite refinement text into verified mappings", () => {
    using baseline = new DatabaseSync(baselinePath, { readOnly: true })
    const inventory = sourceParameterInventory(inputs, mappings)
    expect(inventory.some(p => p.owner === "vesna" && p.status === "unreviewed")).toBe(true)
    expect(inventory.filter(p => p.status === "reviewed")).toHaveLength(42)
    const suggestions = mappingSuggestions(baseline, inputs, mappings)
    expect(suggestions.find(s => s.owner === "Clorinde" && s.group === "auto")?.parameters[7]?.candidates).toEqual(["param10"])
    expect(refinementNumber("28%")).toBe(0.28)
    expect(refinementNumber("52")).toBe(52)
    expect(() => refinementNumber("20%/48%")).toThrow("Unsupported")
  })
})
