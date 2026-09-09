# ADR-0019：选择性采用 OpenSpec 管理重大变更

- Status: Accepted
- Date: 2026-08-31

## Context

GSCombat 已经通过 `docs/plans/` 记录功能设计和实施步骤，并通过 `docs/adr/` 保留重要架构决策。现有文档能够
支持单次开发，但不同计划的格式、状态和归档方式并不统一，也没有一个稳定位置描述系统当前承诺的行为。

仓库中的重大功能通常横跨 Calculator、Contracts、Analyzer、Content、API 和 Web。使用 AI Agent 实施这类变更
时，如果需求、行为差量、设计约束和验证步骤只存在于对话或分散文档中，容易出现范围漂移、遗漏兼容性或产生第二套
实现路径。

另一方面，普通角色、武器和圣遗物声明数量多、模式稳定。要求每项内容维护都建立完整规格会产生高于收益的流程成本。

## Decision

GSCombat 选择性采用 OpenSpec。满足以下任一条件的工作必须建立 OpenSpec change：

- 修改计算语义、通用乘区、效果阶段、反应类型或共享领域模型；
- 修改 HTTP API、TypeBox 契约、公开数据结构或兼容性承诺；
- 涉及工作空间兼容、数据迁移、安全或权限规则；
- 一个功能同时影响三个及以上 `apps/*` 或 `packages/*` workspace；
- 引入会约束后续开发的架构边界或重大设计决策；
- 角色、武器或圣遗物内容需要新增可复用的通用计算能力。

只有可观察行为发生变化时才编写 delta spec。纯重构、工具和文档变更可以保留 proposal、design 和 tasks，同时通过
`skip_specs: true` 明确没有行为规格变化。

以下工作默认不建立 OpenSpec change：

- 符合现有类型化模型的普通角色、武器和圣遗物声明；
- 不改变 Schema 或行为语义的固定数据刷新；
- 生成注册表、元数据、截图和静态资源；
- 文案调整和范围明确、可由局部测试完整覆盖的小修复。

根目录 `AGENTS.md` 负责让 Agent 在实现前执行上述分类。`openspec/config.yaml` 保存项目背景、产物规则和应用、归档
约束。`openspec/specs/` 只描述当前系统行为，不记录内部文件或类级实现细节。

OpenSpec 不替代 ADR。一次 change 的 `design.md` 记录该次实现选择；会长期约束后续工作的决策仍进入
`docs/adr/`，并由相关 design 引用。

## Consequences

### Positive

- 跨层变更在编码前形成可审阅的范围、行为差量、设计和验证清单。
- Agent 可以从仓库恢复当前变更状态，不依赖单次对话历史。
- delta spec 在归档后维护系统当前行为，ADR 继续保留决策原因和备选方案。
- 日常内容维护保持轻量，不必为重复声明生成低价值文档。

### Negative

- 重大变更需要额外维护 planning artifacts，并在实现变化时同步更新。
- OpenSpec design 与 ADR 存在重复风险，需要通过明确的文档职责控制。
- 如果未在完成验证后及时归档，active change 和主规格可能暂时不一致。

## Alternatives Considered

### 所有变更都使用 OpenSpec

拒绝。普通内容声明、数据刷新和小修复数量多且模式稳定，全量规格化会显著增加维护成本。

### 继续只使用 docs/plans 和 ADR

拒绝。现有文档缺少统一的 active/archive 生命周期和行为 delta 合并机制，无法稳定承担跨 Agent 的变更状态恢复。

### 使用 OpenSpec 替代 ADR

拒绝。行为规格和单次变更设计不能完整替代长期架构决策中的背景、备选方案和后果记录。
