# 现有治理无损迁移台账

本台账记录 2026-08-31 对 ADR-0001 至 ADR-0019、Agent 规则和当前实现的迁移复核。迁移原则是保留原 ADR 的路径和正文，把“当前可观察行为”提炼到主规格，把跨变更约束放入 config，并让 Agent 从唯一入口执行规则。

## 复核方法

- 结构事实通过当前实现、共享契约、公开入口、系统测试和集成测试交叉核对。
- ADR 的当前性以当前 TypeBox 契约、公共包入口、API 路由以及系统/集成测试为准；ADR 继续保存当时的背景、备选方案和后果。
- 表中每个 ADR 恰好出现一行且只有一个“主要归属”；其他规格可以引用同一 ADR，但不改变主要归属。
- ADR-0001 至 ADR-0018 的原文件不做正文迁移修改；ADR-0019 是本次经用户批准新增的治理决策。

## ADR 迁移映射

| ADR | 当前性 | 主要归属 | 当前实现复核证据 | 迁移说明 |
|---|---|---|---|---|
| ADR-0001 | 部分当前，被 0013 扩展 | [workspace/build-persistence](specs/workspace/build-persistence/spec.md) | workspace-config.ts、CharacterBuildSchema、Web workspace flow | 无账号、本地优先和无状态分析仍成立；“不做跨设备同步”已被可选邀请码同步替代。 |
| ADR-0002 | 当前 | [analysis/core-action-results](specs/analysis/core-action-results/spec.md) | analyze.ts 的 actionExpectedDamage 基线和同场景重算；分析/API 集成测试 | 当前结果仍是所选核心动作，不是完整队伍循环 DPS。 |
| ADR-0003 | 当前 | [analysis/action-semantics](specs/analysis/action-semantics/spec.md) | CombatActionMetadata、参数引用与 registry integrity 测试 | 固定快照只提供数值，Content 继续显式拥有动作语义。 |
| ADR-0004 | 当前，带兼容边界 | [analysis/action-semantics](specs/analysis/action-semantics/spec.md) | amplifyingReaction、直接结果与事件轨迹反应测试 | 单动作反应仍显式声明；带时间线的动作受更严格的事件级约束。 |
| ADR-0005 | 当前 | [content/authoring-contract](specs/content/authoring-contract/spec.md) | 固定快照、本地化来源说明、authoring audit | 本地化只辅助术语映射，不自动推断缩放或动作逻辑。 |
| ADR-0006 | 当前 | [analysis/action-semantics](specs/analysis/action-semantics/spec.md) | CombatActionTimeline、CombatDamageEventTemplate、时间线完整性测试 | 动作内事件具有时间、稳定标识和显式快照策略。 |
| ADR-0007 | 当前且明确受限 | [analysis/action-semantics](specs/analysis/action-semantics/spec.md) | SustainedAuraWindow、standard/none ICD、反应集成测试 | 只承诺静态单目标持续附着和标准 ICD，不宣称完整元素量表模拟。 |
| ADR-0008 | 当前 | [analysis/action-semantics](specs/analysis/action-semantics/spec.md) | travelerElement、talentParameterOwnerId、Traveler registry 测试 | 规范 Build 与受限元素/性别天赋变体仍分离。 |
| ADR-0009 | 当前 | [analysis/action-semantics](specs/analysis/action-semantics/spec.md) | RotationElementOverrideWindow、命中时覆盖测试 | 附魔改变事件最终元素，不改写统计快照。 |
| ADR-0010 | 当前 | [content/authoring-contract](specs/content/authoring-contract/spec.md) | generated evidence registry、multi-scaling integrity 测试 | verified 多倍率声明仍要求逐项审阅证据和快照检查。 |
| ADR-0011 | 已被 0012 取代 | [analysis/core-action-results](specs/analysis/core-action-results/spec.md) | ADR 状态、evaluateCombatMetric 与显式 recipient 测试 | 仅保留为来源角色自有指标边界的历史；当前行为以 0012 为准。 |
| ADR-0012 | 当前 | [analysis/core-action-results](specs/analysis/core-action-results/spec.md) | support-metrics.ts、metric integration、API support-metrics 测试 | 治疗、增益和标量在显式来源/受益方上下文中返回类型化公式。 |
| ADR-0013 | 当前 | [workspace/build-persistence](specs/workspace/build-persistence/spec.md) | WorkspaceDocumentSchema v1、SQLite store、revision conflict 测试 | 邀请码同步保持可选；Build 与 party 组成版本化聚合。 |
| ADR-0014 | 当前 | [architecture/public-entrypoints](specs/architecture/public-entrypoints/spec.md) | /v1/analysis、/v1/support-metrics/evaluate、Analyzer 包根导出 | 维护中的场景/指标链路是唯一产品计算入口。 |
| ADR-0015 | 当前 | [content/authoring-contract](specs/content/authoring-contract/spec.md) | generate-registries.ts、generated modules、registries:check | 实体目录拥有语义，构建期静态聚合，运行时不扫描。 |
| ADR-0016 | 当前，内部架构 | [openspec/config.yaml](config.yaml) | Analyzer src 分层、包根 index.ts、system/integration test 树 | 不伪造成用户行为；config 保留模块责任和唯一公开包入口，ADR 保留结构原因。 |
| ADR-0017 | 当前，内部架构 | [openspec/config.yaml](config.yaml) | Web features、workspace 与 calculation integration tests | 功能边界属于实现组织；公开工作流由 workspace 和 analysis 规格覆盖。 |
| ADR-0018 | 当前，内部架构兼有公开边界 | [architecture/public-entrypoints](specs/architecture/public-entrypoints/spec.md) | buildApp、四类显式 route modules、API 架构边界测试 | 规格只承诺组合根和公开契约；模块拆分理由继续留在 ADR。 |
| ADR-0019 | 当前 | [openspec/config.yaml](config.yaml) | AGENTS.md、config rules/operations、开发指南 | config 保存跨变更约束；Agent 入口执行分类；ADR 保存采用理由和备选方案。 |

### 唯一归属检查

连续编号 ADR-0001 至 ADR-0019 在上表各出现一次，共 19 行；每行“主要归属”只有一个链接。ADR-0011 的 superseded 状态没有被改写为当前行为，ADR-0001/0013 则按合并后的本地优先语义迁移。

## 当前系统事实摘要

### 权威结果链路

- registerAnalysisRoutes 只通过 evaluateScenario、analyzeScenario 和 evaluateCombatMetric 产生正式结果。
- analyzeScenario 的基线、候选武器、成长项和边际词条都读取同一 actionExpectedDamage，没有第二套近似公式。
- 辅助指标使用独立 HTTP 入口，但与伤害指标共享 Content registry、Analyzer 入口和类型化公式节点。

### 动作与 Content 边界

- CombatActionMetadata 拥有动作、倍率引用、反应、时间线、变体与展示语义；Calculator 只拥有角色无关公式。
- 时间线支持事件时间、cast/hit/显式时间快照、命中数、元素附着和有限元素覆盖。
- 持续附着模型只覆盖四类静态 aura、单目标、非消耗窗口和 standard/none ICD，仍不具备完整 GU 与循环闭合能力。
- generated registry 由实体入口生成，build、test、typecheck 都先执行 freshness check；系统审计验证动作、证据、快照和注册完整性。

### Build 与工作区边界

- 浏览器依次选择 local、session、memory 存储；旧 Build 数组和受支持的导入形状由兼容层归一化为 schema version 1。
- 云端能力只在邀请码会话中启用。SQLite 使用 WAL，工作区写入携带 expectedRevision，陈旧写入返回 409。
- 邀请码以 HMAC 摘要存储，原始值只在创建时返回；撤销邀请会令后续会话失效。

## GSCombat Agent 规则清单

| 类别 | 项目规则 | 当前入口 | 结果 |
|---|---|---|---|
| Git | 分支名不得包含 codex | AGENTS.md → Git | 原义保留，并增加不提交、推送、部署或覆盖用户改动的安全边界。 |
| OpenSpec | 重大语义、契约、兼容、迁移、安全、跨三个 workspace 或新通用能力必须建 change | AGENTS.md → OpenSpec Change Workflow | 新增且与 ADR-0019、config 一致；普通内容、固定数据、生成资产、文案和小修复豁免。 |
| OpenSpec | 只有可观察行为变化才写 delta spec；纯重构/工具/文档使用 skip_specs: true | AGENTS.md 与 openspec/config.yaml | 原义一致，active change 以 skip_specs 执行本次文档迁移。 |

范围更正：仓库所有者确认，DeepSeek LLM 测试、Python 风格和 CodeGraph 工具路由来自另一个 Python Agent
产品，不属于 GSCombat。它们已从 `AGENTS.md` 删除，也不进入 OpenSpec config 或产品规格。

## 治理职责

| 位置 | 唯一职责 | 不承担的职责 |
|---|---|---|
| AGENTS.md | Agent 在动手前必须执行的 Git 安全和 OpenSpec 入口规则 | 不复制完整行为规格或 ADR 背景 |
| openspec/config.yaml | 跨 change 的项目背景、产物规则和 apply/archive 约束 | 不记录单次 change 状态 |
| openspec/specs/ | 已归档变更合并后的当前可观察行为 | 不记录内部文件拆分理由 |
| openspec/changes/ | 单次 change 的范围、delta、设计、任务与验证状态 | 不永久替代主规格 |
| docs/adr/ | 长期架构选择、背景、备选方案和后果 | 不承担 active task 勾选与当前行为汇总 |
| docs/development*.md | 面向贡献者的导航、命令和日常维护说明 | 不成为强制规则的唯一来源 |
