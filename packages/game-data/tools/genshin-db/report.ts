import type { DatabaseSync } from "node:sqlite"
import { data, object, refinementNumber, text, type Mappings } from "./input.js"

export interface Difference {
  table: string
  key: string
  category: "equal" | "added" | "removed" | "changed" | "candidate-not-imported" | "ambiguous" | "inherited"
  before?: unknown
  after?: unknown
}
const tables: Record<string, string[]> = {
  characters: ["id"], character_stat_curves: ["character_id", "stat"],
  character_ascension_bonuses: ["character_id", "stat", "ascension"],
  character_level_curves: ["curve_id", "level"],
  character_skill_parameters: ["character_id", "skill", "parameter_index", "talent_level"],
  character_skill_parameter_groups: ["character_id", "group_id"],
  weapons: ["id"], weapon_stat_curves: ["weapon_id", "stat"],
  weapon_ascension_bonuses: ["weapon_id", "stat", "ascension"],
  weapon_level_curves: ["curve_id", "level"], weapon_refinement_parameters: ["weapon_id", "parameter", "refinement"],
  artifact_sets: ["id"], artifact_main_stats: ["rarity", "stat", "level"],
  artifact_substat_rolls: ["rarity", "stat", "tier"], artifact_roll_metadata: ["key"]
}
const inheritedTables = new Set(["artifact_main_stats", "artifact_substat_rolls", "artifact_roll_metadata"])

/** Compares every baseline and candidate row; missing rows stay in the denominator. */
export function compareDatabases(baseline: DatabaseSync, candidate: DatabaseSync, mappings: Mappings): Difference[] {
  const result: Difference[] = []
  for (const [table, keys] of Object.entries(tables)) {
    const rows = (db: DatabaseSync) => new Map(db.prepare(`SELECT * FROM ${table} ORDER BY ${keys.join(",")}`).all().map(row => {
      const cleaned = Object.fromEntries(Object.entries(row).filter(([k]) => k !== "raw_json"))
      if (table === "artifact_sets") for (const field of ["set_bonuses_json", "rarities_json", "slots_json"]) {
        cleaned[field] = JSON.stringify((JSON.parse(text(row[field])) as unknown[]).sort())
      }
      return [keys.map(k => String(row[k])).join("/"), cleaned] as const
    }))
    const oldRows = rows(baseline), newRows = rows(candidate)
    for (const key of [...new Set([...oldRows.keys(), ...newRows.keys()])].sort()) {
      const before = oldRows.get(key), after = newRows.get(key)
      let category: Difference["category"] = !before ? "added" : !after ? "removed" :
        JSON.stringify(before) === JSON.stringify(after) ? "equal" : "changed"
      if (!after && table.startsWith("character_skill")) {
        const owner = key.split("/")[0]
        if (mappings.talentOwners.some(m => m.id === owner)) category = "candidate-not-imported"
      }
      if (!after && table === "weapon_refinement_parameters") category = "candidate-not-imported"
      if (inheritedTables.has(table) && category === "equal") category = "inherited"
      result.push({ table, key, category, ...(before ? { before } : {}), ...(after ? { after } : {}) })
    }
  }
  return result
}

/** Retains every upstream parameter and label, including groups not yet assigned a canonical meaning. */
export function sourceParameterInventory(inputs: Map<string, unknown>, mappings: Mappings) {
  const talents = data(inputs, "stats/talents")
  return Object.entries(talents).sort(([a], [b]) => a.localeCompare(b)).flatMap(([owner, groups]) =>
    Object.entries(object(groups)).flatMap(([group, parameters]) => Object.entries(object(parameters)).map(([key, values]) => {
      const textGroup = data(inputs, `ChineseSimplified/talents/${owner}`)[group]
      const labels = textGroup ? object(object(textGroup).attributes ?? {}).labels ?? [] : []
      const destinations = mappings.talents.filter(m => m.key === owner && m.sourceGroup === group &&
        m.status !== "blocked-source-mismatch")
        .flatMap(m => m.parameters.filter(p => p.key === key).map(p => `${m.owner}/${m.group}/${p.index}`))
      const blockedDestinations = mappings.talents.filter(m => m.key === owner && m.sourceGroup === group &&
        m.status === "blocked-source-mismatch")
        .flatMap(m => m.parameters.filter(p => p.key === key).map(p => `${m.owner}/${m.group}/${p.index}`))
      const mapping = mappings.talents.find(m => m.key === owner && m.sourceGroup === group)
      return { owner, group, key, labels: (labels as string[]).filter(l => l.includes(`{${key}:`)), values,
        destinations, blockedDestinations, status: destinations.length ? mapping?.status ?? "unreviewed" : "unreviewed" }
    })))
}

/** Inventories every R1–R5 passive value position, including source-only and composite literals. */
export function sourceRefinementInventory(inputs: Map<string, unknown>, mappings: Mappings) {
  return mappings.weapons.flatMap(({ id, key }) => {
    const source = data(inputs, `ChineseSimplified/weapons/${key}`)
    const ranks = Array.from({ length: 5 }, (_, i) => {
      const row = source[`r${i + 1}`]
      return row ? object(row).values as unknown[] : []
    })
    return Array.from({ length: Math.max(0, ...ranks.map(rank => rank.length)) }, (_, index) => {
      const literals = ranks.map(rank => rank[index] ?? null)
      const canonical = mappings.refinements.find(mapping => mapping.id === id)?.parameters
        .filter(parameter => parameter.index === index).map(parameter => parameter.name) ?? []
      const parsed = literals.map(literal => {
        try { return literal === null ? null : refinementNumber(literal) } catch { return null }
      })
      return { owner: id, index, sourcePath: `src/data/ChineseSimplified/weapons/${key}.json#/r1-r5/values/${index}`,
        literals, parsed, canonical,
        status: canonical.length ? "canonical-mapped" : parsed.some((value, rank) => value === null && literals[rank] !== null)
          ? "composite-or-unparsed" : "source-only" }
    })
  })
}

export function summarize(differences: Difference[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const item of differences) result[item.category] = (result[item.category] ?? 0) + 1
  return result
}

/** Numerical suggestions aid review only; even a unique equal vector is not an approved semantic mapping. */
export function mappingSuggestions(baseline: DatabaseSync, inputs: Map<string, unknown>, mappings: Mappings) {
  const talents = data(inputs, "stats/talents")
  const groups: Record<string, string> = { auto: "combat1", skill: "combat2", burst: "combat3", sprint: "combatsp" }
  return baseline.prepare("SELECT * FROM character_skill_parameter_groups WHERE group_id IN ('auto','skill','burst','sprint') ORDER BY character_id, group_id").all().map(row => {
    const owner = text(row.character_id), group = text(row.group_id)
    const key = mappings.talentOwners.find(m => m.id === owner)?.key
    const sourceGroup = groups[group]
    const source = key && sourceGroup && talents[key] ? object(talents[key])[sourceGroup] : undefined
    const values: unknown = JSON.parse(text(row.values_json))
    const parameters = Array.isArray(values) && values.every(Array.isArray) && source
      ? values.map((vector, index) => ({ index, candidates: Object.entries(object(source))
        .filter(([, candidate]) => JSON.stringify(candidate) === JSON.stringify(vector)).map(([param]) => param),
      status: mappings.talents.find(m => m.owner === owner && m.group === group)?.status ?? "requires-semantic-review" })) : []
    return { owner, group, sourceKey: key ?? null, sourceGroup: sourceGroup ?? null,
      status: source ? "upstream-group-present" : "no-reviewed-source-group", parameters }
  })
}

export function markdownReport(report: {
  summary: Record<string, number>; differences: Difference[]; sourceParameterCount: number;
  reviewedParameterCount: number; sourceMappedParameterCount: number; sourceRefinementParameterCount: number;
  gapSummary: Record<string, number>; baselineGroupSummary: Record<string, number>;
  baselineGroups: { literalCoverage?: "all" | "partial" | "none" }[];
  issues: unknown[]; digest: string; integration: unknown;
}): string {
  return ["# genshin-db 7.1 离线评估", "", "**结论：研究候选，尚不可切换生产。正式快照仍为 7.0。**", "",
    "这是映射验证工具的报告，不是游戏数据正确性或新角色机制完整性的认证。", "",
    `稳定报告摘要：\`${report.digest}\``, "", "## 表记录差异（所有记录，不仅成功匹配项）", "",
    "| 类别 | 数量 |", "| --- | ---: |", ...Object.entries(report.summary).map(([k, v]) => `| ${k} | ${v} |`), "",
    `上游天赋参数组内条目：${report.sourceParameterCount}；显式映射 ${report.sourceMappedParameterCount}（其中人工逐项审阅 ${report.reviewedParameterCount}）。`, "",
    `上游武器精炼文本位置：${report.sourceRefinementParameterCount} 个；旧规范具名字段仅覆盖其中一部分，其余保留原始 R1–R5。`, "",
    "## 旧库未映射组分类", "", "空组只保留身份，元数据组不含数值；两者都不是上游数值缺失。", "",
    "| 类别 | 组数 |", "| --- | ---: |",
    ...Object.entries(report.baselineGroupSummary).map(([k, v]) => `| ${k} | ${v} |`), "",
    `直接描述旧值字面覆盖：全部 ${report.baselineGroups.filter(row => row.literalCoverage === "all").length} 组，部分 ${report.baselineGroups.filter(row => row.literalCoverage === "partial").length} 组，无匹配 ${report.baselineGroups.filter(row => row.literalCoverage === "none").length} 组；仅供人工审阅，不是已确认映射。`, "",
    "完整逐条明细、等级参数和未映射标签见 report.json；逐实体缺口与受影响引用见 gaps.json / gaps.md。", "",
    "## 缺口分类", "", "| 类别 | 数量 |", "| --- | ---: |",
    ...Object.entries(report.gapSummary).map(([k, v]) => `| ${k} | ${v} |`), "",
    "## 已知阻塞", "", "- 被动与命座存在中文描述，但其数值尚未逐项完成语义映射；部分固有属性也尚未核实。不自动继承旧值。",
    "- 数值向量验证不等于角色效果语义已审阅；7 个旅行者冲突组不写入候选库。",
    "- 圣遗物主副词条沿用固定 7.0 表，并未验证这些表在 7.1 是否变化。",
    "- 新增角色和武器仅有静态资料，尚未新增指标或机制。",
    `- 归一化问题 ${report.issues.length} 条；详细来源、单位及 Content 审计见 report.json。`, "",
    "## 既有计算链路验证", "", "```json", JSON.stringify(report.integration, null, 2), "```", ""
  ].join("\n")
}
