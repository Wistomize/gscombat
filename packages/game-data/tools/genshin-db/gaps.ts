import type { DatabaseSync } from "node:sqlite"
import { data, object, text, type Mappings } from "./input.js"
import type { ImportIssue } from "./normalize.js"
import type { Difference } from "./report.js"

export interface Gap {
  category: "description-backed-unreviewed" | "cross-section-review" | "source-vector-mismatch" | "source-cn-label-absent" |
    "source-only-no-baseline" | "source-only-weapon-refinement" | "unparseable-refinement-literal" |
    "inherent-stat-absent" | "entity-field-changed" | "baseline-entity-absent-upstream" |
    "content-reference-unresolved"
  owner: string
  group?: string
  parameterIndex?: number
  sourcePath: string
  baselineParameterCount?: number
  sourceParameterCount?: number
  affectedContentReferences: string[]
  detail: string
}

export interface BaselineGroupAudit {
  owner: string
  group: string
  status: "empty" | "metadata" | "description-backed-unreviewed" | "cross-section-review"
  baselineParameterCount: number
  sourcePath: string
  literalCoverage?: "all" | "partial" | "none"
  unmatchedValues?: number[]
  relatedSourcePaths?: string[]
}

function numericLeaves(value: unknown): number[] {
  if (typeof value === "number") return [value]
  return Array.isArray(value) ? value.flatMap(numericLeaves) : []
}

function descriptionMatches(value: number, description: string): boolean {
  const literals = [...description.matchAll(/(?<![\d.])\d+(?:\.\d+)?%?/g)].map(match => match[0]!)
  return literals.some(literal => {
    const actual = Number(literal.replace(/%$/, "")) / (literal.endsWith("%") ? 100 : 1)
    return Math.abs(actual - value) < 0.000001
  })
}

/** Classifies unmapped old groups without treating missing combat arrays as missing source descriptions. */
export function auditBaselineGroups(baseline: DatabaseSync, inputs: Map<string, unknown>, mappings: Mappings): BaselineGroupAudit[] {
  return baseline.prepare("SELECT character_id, group_id, values_json FROM character_skill_parameter_groups ORDER BY character_id, group_id")
    .all().flatMap<BaselineGroupAudit>(row => {
      const owner = text(row.character_id), group = text(row.group_id)
      if (mappings.talents.some(mapping => mapping.owner === owner && mapping.group === group)) return []
      const values = JSON.parse(text(row.values_json)) as unknown[]
      const key = mappings.talentOwners.find(item => item.id === owner)?.key ?? owner.toLowerCase()
      const constellation = /^constellation[1-6]$/.test(group)
      const file = constellation ? `ChineseSimplified/constellations/${key}` : `ChineseSimplified/talents/${key}`
      const sourceGroup = constellation ? `c${group.slice(-1)}` : group
      const sourcePath = `src/data/${file}.json#/${sourceGroup}/description`
      const baselineParameterCount = values.length
      if (!values.length) return [{ owner, group, status: "empty" as const, baselineParameterCount, sourcePath }]
      const numbers = numericLeaves(values)
      if (!numbers.length) return [{ owner, group, status: "metadata" as const, baselineParameterCount, sourcePath }]
      const sourceFile = inputs.get(`src/data/${file}.json`)
      const sourceGroupRow = sourceFile && typeof sourceFile === "object" && !Array.isArray(sourceFile)
        ? (sourceFile as Record<string, unknown>)[sourceGroup] : undefined
      const description = sourceGroupRow && typeof sourceGroupRow === "object" && !Array.isArray(sourceGroupRow)
        ? (sourceGroupRow as Record<string, unknown>).description : undefined
      if (typeof description !== "string" || !description.trim()) {
        const candidates = group === "lockedPassive" ? ["talents", "constellations"] : ["talents"]
        const relatedSourcePaths = candidates.flatMap(kind => {
          const candidateFile = `ChineseSimplified/${kind}/${key}`
          const source = inputs.get(`src/data/${candidateFile}.json`)
          if (!source || typeof source !== "object" || Array.isArray(source)) return []
          return Object.entries(source).filter(([section, value]) =>
            (section.startsWith("passive") || /^c[1-6]$/.test(section)) && value && typeof value === "object" &&
            !Array.isArray(value) && typeof (value as Record<string, unknown>).description === "string")
            .map(([section]) => `src/data/${candidateFile}.json#/${section}/description`)
        })
        return [{ owner, group, status: "cross-section-review" as const,
          baselineParameterCount, sourcePath: `src/data/${file}.json`, relatedSourcePaths }]
      }
      const unmatchedValues = numbers.filter(value => !descriptionMatches(value, description))
      const literalCoverage = unmatchedValues.length === 0 ? "all" as const
        : unmatchedValues.length === numbers.length ? "none" as const : "partial" as const
      return [{ owner, group, status: "description-backed-unreviewed" as const,
        baselineParameterCount, sourcePath, literalCoverage, unmatchedValues }]
    })
}

/** Lists unmapped parameter domains separately from source mismatches and absent Content semantics. */
export function buildGapInventory(baseline: DatabaseSync, inputs: Map<string, unknown>, mappings: Mappings,
  issues: ImportIssue[], differences: Difference[], content: { references: { location: string; status: string;
    reference: unknown }[]; newUnmodeled: string[] }): Gap[] {
  const gaps: Gap[] = []
  const talents = data(inputs, "stats/talents")
  const baselineAudit = new Map(auditBaselineGroups(baseline, inputs, mappings)
    .map(row => [`${row.owner}/${row.group}`, row] as const))
  const linked = (owner: string, group?: string, index?: number) => content.references.filter(row => {
    const reference = object(row.reference)
    const selectedOwner = String(reference.talentParameterOwnerId ?? row.location.split("/")[0])
    return selectedOwner === owner && (!group || reference.groupId === group) &&
      (index === undefined || reference.parameterIndex === index)
  }).map(row => row.location)
  for (const row of baseline.prepare("SELECT character_id, group_id, values_json FROM character_skill_parameter_groups ORDER BY character_id, group_id").all()) {
    const owner = text(row.character_id), group = text(row.group_id)
    const values = JSON.parse(text(row.values_json)) as unknown[]
    const mapping = mappings.talents.find(item => item.owner === owner && item.group === group)
    if (mapping?.status === "blocked-source-mismatch") {
      const source = object(object(talents[mapping.key])[mapping.sourceGroup])
      const mismatches = mapping.parameters.filter(parameter =>
        JSON.stringify(values[parameter.index]) !== JSON.stringify(source[parameter.key])).map(parameter => ({
          index: parameter.index, key: parameter.key, baseline: values[parameter.index], upstream: source[parameter.key] }))
      gaps.push({ category: "source-vector-mismatch", owner, group,
        sourcePath: `src/data/stats/talents.json#/${mapping.key}/${mapping.sourceGroup}`,
        baselineParameterCount: values.length, sourceParameterCount: Object.keys(source).length,
        affectedContentReferences: linked(owner, group), detail: JSON.stringify({ mismatches, treatment: "entire group excluded" }) })
    } else if (!mapping) {
      const audit = baselineAudit.get(`${owner}/${group}`)!
      if (audit.status === "empty" || audit.status === "metadata") continue
      gaps.push({ category: audit.status, owner, group, sourcePath: audit.sourcePath,
        baselineParameterCount: values.length, affectedContentReferences: linked(owner, group),
        detail: JSON.stringify({ literalCoverage: audit.literalCoverage ?? null,
          unmatchedValues: audit.unmatchedValues ?? [], relatedSourcePaths: audit.relatedSourcePaths ?? [],
          treatment: "description requires semantic review; not imported" }) })
    }
  }
  for (const mapping of mappings.talents.filter(item => item.status === "source-only")) {
    gaps.push({ category: "source-only-no-baseline", owner: mapping.owner, group: mapping.group,
      sourcePath: `src/data/stats/talents.json#/${mapping.key}/${mapping.sourceGroup}`,
      sourceParameterCount: mapping.parameters.length, affectedContentReferences: linked(mapping.owner, mapping.group),
      detail: `No 7.0 gold; Content modeled: ${!content.newUnmodeled.includes(mapping.owner)}.` })
  }
  for (const issue of issues) {
    if (issue.category === "source-label-missing") {
      const [owner, group, index] = issue.entity.split("/")
      const [key, sourceGroup, parameter] = issue.detail.split("/")
      gaps.push({ category: "source-cn-label-absent", owner: owner!, group: group!, parameterIndex: Number(index),
        sourcePath: `src/data/ChineseSimplified/talents/${key}.json#/${sourceGroup}/attributes/labels (${parameter})`,
        affectedContentReferences: linked(owner!, group, Number(index)),
        detail: "Numeric vector mapped, but no Chinese label references this source parameter key." })
    } else if (issue.category === "ambiguous-refinement-literal") {
      const [owner, refinement] = issue.entity.split("/")
      const key = mappings.weapons.find(item => item.id === owner)?.key
      gaps.push({ category: "unparseable-refinement-literal", owner: owner!, group: refinement!,
        sourcePath: `src/data/ChineseSimplified/weapons/${key}.json#/${refinement?.toLowerCase()}/values`,
        affectedContentReferences: [], detail: issue.detail })
    } else if (issue.category === "missing-inherent-stats") {
      gaps.push({ category: "inherent-stat-absent", owner: issue.entity,
        sourcePath: `src/data/stats/characters.json#/${mappings.characters.find(item => item.id === issue.entity)?.key}`,
        affectedContentReferences: [], detail: issue.detail })
    }
  }
  for (const { id, key } of mappings.weapons) {
    if (!data(inputs, `ChineseSimplified/weapons/${key}`).r1) continue
    if (mappings.refinements.some(item => item.id === id)) continue
    const source = data(inputs, `ChineseSimplified/weapons/${key}`)
    const count = Array.from({ length: 5 }, (_, i) => object(source[`r${i + 1}`] ?? {}).values as unknown[] | undefined)
      .reduce((sum, values) => sum + (values?.length ?? 0), 0)
    if (!count) continue
    gaps.push({ category: "source-only-weapon-refinement", owner: id,
      sourcePath: `src/data/ChineseSimplified/weapons/${key}.json#/r1-r5/values`,
      sourceParameterCount: count, affectedContentReferences: [],
      detail: "Source has passive literals but the 7.0 canonical snapshot has no named refinement parameter." })
  }
  for (const difference of differences) {
    if (difference.table === "characters" && difference.category === "changed") {
      const key = mappings.characters.find(item => item.id === difference.key)?.key
      gaps.push({ category: "entity-field-changed", owner: difference.key,
        sourcePath: `src/data/ChineseSimplified/characters/${key}.json`, affectedContentReferences: [],
        detail: JSON.stringify({ before: difference.before, after: difference.after }) })
    } else if (difference.table === "weapons" && difference.category === "removed") {
      gaps.push({ category: "baseline-entity-absent-upstream", owner: difference.key,
        sourcePath: "src/data/stats/weapons.json", affectedContentReferences: [],
        detail: "Old canonical weapon is absent from pinned upstream playable source." })
    }
  }
  const covered = new Set(gaps.flatMap(gap => gap.affectedContentReferences))
  for (const row of content.references.filter(item => item.status !== "present" && !covered.has(item.location))) {
    const reference = object(row.reference)
    gaps.push({ category: "content-reference-unresolved", owner: row.location.split("/")[0]!,
      group: String(reference.groupId), sourcePath: `characterCombatCoverageRegistry#/${row.location}`,
      affectedContentReferences: [row.location],
      detail: "Candidate lookup is absent; owner may be selected by parent registry context, including Traveler variants." })
  }
  return gaps.sort((a, b) => `${a.category}/${a.owner}/${a.group ?? ""}/${a.parameterIndex ?? ""}`
    .localeCompare(`${b.category}/${b.owner}/${b.group ?? ""}/${b.parameterIndex ?? ""}`))
}

/** Summarizes full, per-entity gap records without hiding individual source paths in gaps.json. */
export function gapMarkdown(gaps: Gap[]): string {
  const counts: Record<string, number> = {}
  for (const gap of gaps) counts[gap.category] = (counts[gap.category] ?? 0) + 1
  const owners = new Set(gaps.map(gap => gap.owner))
  const affected = gaps.reduce((sum, gap) => sum + gap.affectedContentReferences.length, 0)
  return ["# genshin-db 7.1 待核实参数清单", "", "这是固定提交与 7.0 快照的离线对照，未切换生产来源。", "",
    `共 ${gaps.length} 条缺口记录，涉及 ${owners.size} 个实体，关联 ${affected} 处 Content 参数引用（同一引用可能出现多次）。`, "",
    "| 类型 | 条目 |", "| --- | ---: |", ...Object.entries(counts).map(([kind, count]) => `| ${kind} | ${count} |`), "",
    "每条缺口的实体、技能组、原始路径、参数数目与受影响引用见同目录 gaps.json。", "",
    "**注意**：旧库空数组与非数值元数据不计为数值缺口；`description-backed-unreviewed` 表示中文描述存在，但并未完成语义映射，数字字面重合也不是验证结论。`cross-section-review` 表示旧组与来源描述章节不直接同名，需按记录的相关章节核对，不代表上游资料缺失。", "",
    "`source-cn-label-absent` 表示数值已校验而中文标签缺位；`source-only-weapon-refinement` 表示上游文本有数值，但旧规范库没有对应具名参数，并不表示当前 Content 效果未实现。", ""].join("\n")
}
