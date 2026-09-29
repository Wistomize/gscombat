import { readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { parseArgs } from "node:util"
import { DatabaseSync } from "node:sqlite"
import { PACKAGE_ROOT } from "./evaluate.js"
import { data, hash, loadInputs, object, readJson, refinementNumber, text, type Mappings, type ParameterMapping,
  type SourceLock } from "./input.js"

const groups: Record<string, string> = { auto: "combat1", skill: "combat2", burst: "combat3", sprint: "combatsp" }
const ambiguousRefinementIndex: Record<string, number> = {
  "CashflowSupervision/atk_": 0, "SymphonistOfScents/atk_": 0,
  "UltimateOverlordsMegaMagicSword/atk_": 0, "VividNotions/atk_": 0
}

/** Generates evidence-labelled, pinned parameter mappings without guessing unmatched legacy values. */
export async function mapParameters(sourceRoot: string): Promise<{ mapped: number; blocked: number; sourceOnly: number;
  refinementParameters: number }> {
  const path = join(PACKAGE_ROOT, "sources/genshin-db-evaluation.mappings.json")
  const lock = readJson(join(PACKAGE_ROOT, "sources/genshin-db-evaluation.lock.json")) as SourceLock
  const mappings = readJson(path) as Mappings
  const inputs = await loadInputs(lock, sourceRoot, true)
  const baselinePath = join(PACKAGE_ROOT, "snapshots/7.0/game-data.sqlite")
  if (hash(readFileSync(baselinePath)) !== lock.baselineSha256) throw new Error("Baseline checksum mismatch")
  const talents = data(inputs, "stats/talents")
  const existing = new Map(mappings.talents.filter(m => m.status === "reviewed")
    .map(m => [`${m.owner}/${m.group}`, m]))
  const result: ParameterMapping[] = []
  using baseline = new DatabaseSync(baselinePath, { readOnly: true })
  const rows = baseline.prepare("SELECT character_id, group_id, values_json FROM character_skill_parameter_groups ORDER BY character_id, group_id").all()
  for (const row of rows) {
    const owner = text(row.character_id), group = text(row.group_id), sourceGroup = groups[group]
    if (!sourceGroup) continue
    const key = mappings.talentOwners.find(m => m.id === owner)?.key
    if (!key) throw new Error(`No talent owner: ${owner}`)
    const raw = object(object(talents[key])[sourceGroup])
    const old = JSON.parse(text(row.values_json)) as number[][]
    const sourceEntries = Object.entries(raw)
    if (sourceEntries.length !== old.length) throw new Error(`Changed parameter count: ${owner}/${group}`)
    const cn = object(object(data(inputs, `ChineseSimplified/talents/${key}`)[sourceGroup]).attributes)
    const labels = Array.isArray(cn.labels) ? cn.labels.filter((label): label is string => typeof label === "string") : []
    const parameters = sourceEntries.map(([param, values], index) => ({ index, key: param,
      labels: labels.filter(label => label.includes(`{${param}:`)) }))
    const matches = sourceEntries.map(([, values], index) => JSON.stringify(values) === JSON.stringify(old[index]))
    const allMatch = matches.every(Boolean)
    const manual = existing.get(`${owner}/${group}`)
    if (manual && JSON.stringify(manual.parameters) !== JSON.stringify(parameters)) {
      throw new Error(`Reviewed mapping disagrees with ordered source: ${owner}/${group}`)
    }
    result.push(manual ?? { owner, key, group, sourceGroup, parameters,
      status: allMatch ? "vector-verified" : "blocked-source-mismatch",
      evidence: allMatch
        ? "2026-09-29: complete ordered parameter vectors match the 7.0 snapshot at every available level; missing CN labels are recorded separately."
        : `2026-09-29: ordered vector mismatch at indices ${matches.flatMap((match, index) => match ? [] : [index]).join(",")}; no replacement imported.` })
  }
  for (const { id: owner, key } of mappings.characters) {
    if (rows.some(row => row.character_id === owner)) continue
    const source = talents[key]
    if (!source) continue
    for (const [sourceGroup, raw] of Object.entries(object(source))) {
      const group = Object.entries(groups).find(([, value]) => value === sourceGroup)?.[0]
      if (!group || !Object.keys(object(raw)).length) continue
      const cn = object(object(data(inputs, `ChineseSimplified/talents/${key}`)[sourceGroup]).attributes)
      const labels = Array.isArray(cn.labels) ? cn.labels.filter((label): label is string => typeof label === "string") : []
      result.push({ owner, key, group, sourceGroup, status: "source-only",
        evidence: "2026-09-29: 7.1 source values and CN labels; no 7.0 numeric gold or Content action semantics.",
        parameters: Object.keys(object(raw)).map((param, index) => ({ index, key: param,
          labels: labels.filter(label => label.includes(`{${param}:`)) })) })
    }
  }
  const weaponRows = baseline.prepare("SELECT weapon_id, parameter, refinement, value FROM weapon_refinement_parameters ORDER BY weapon_id, parameter, refinement").all()
  const refinements: Mappings["refinements"] = []
  for (const { id, key } of mappings.weapons) {
    const matched = weaponRows.filter(row => row.weapon_id === id)
    if (!matched.length) continue
    const source = data(inputs, `ChineseSimplified/weapons/${key}`)
    const literals = Array.from({ length: 5 }, (_, i) => object(source[`r${i + 1}`]).values as unknown[])
    const parameters: Mappings["refinements"][number]["parameters"] = []
    for (const name of [...new Set(matched.map(row => text(row.parameter)))]) {
      const old = matched.filter(row => row.parameter === name).map(row => Number(row.value))
      const candidates = Array.from({ length: literals[0]!.length }, (_, index) => index).filter(index => {
        try { return JSON.stringify(literals.map(row => refinementNumber(row[index]))) === JSON.stringify(old) }
        catch { return false }
      })
      const selected = candidates.length === 1 ? candidates[0] : ambiguousRefinementIndex[`${id}/${name}`]
      if (selected === undefined || !candidates.includes(selected)) {
        throw new Error(`Unresolved refinement parameter: ${id}/${name} candidates=${candidates}`)
      }
      parameters.push({ name, index: selected,
        evidence: candidates.length === 1
          ? "R1–R5 full numeric vector uniquely matches the 7.0 canonical parameter."
          : `R1–R5 vector duplicates indices ${candidates.join(",")}; index 0 is the unconditional attack bonus in the Chinese R1–R5 descriptions.` })
    }
    refinements.push({ id, key, parameters })
  }
  const output = { ...mappings, talents: result, refinements }
  writeFileSync(path, JSON.stringify(output, null, 2) + "\n")
  return { mapped: result.filter(m => m.status !== "blocked-source-mismatch").length,
    blocked: result.filter(m => m.status === "blocked-source-mismatch").length,
    sourceOnly: result.filter(m => m.status === "source-only").length,
    refinementParameters: refinements.flatMap(m => m.parameters).length }
}

if (process.argv[1]?.endsWith("map-parameters.ts")) {
  const { values } = parseArgs({ options: { source: { type: "string" } } })
  if (!values.source) throw new Error("Usage: map-parameters.ts --source PINNED_CHECKOUT")
  console.log(await mapParameters(resolve(values.source)))
}
