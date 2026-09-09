## Why

现有 18 份历史 ADR、ADR-0019 和根目录 `AGENTS.md` 已保存重要行为边界、架构约束与 Agent 工作规则，但这些内容
尚未按 OpenSpec 的职责拆分进入项目上下文、产物规则和当前行为规格。此次迁移建立可追踪的基线，避免后续 Agent
只读取部分文件或把 ADR 的决策原因误当作新的产品需求。

本变更因“迁移会长期约束后续开发的架构边界和重大设计决策”而进入 OpenSpec。它不修改运行时行为，因此设置
`skip_specs: true`。

## What Changes

- 逐份审计 ADR-0001 至 ADR-0019 和 `AGENTS.md`，形成“行为契约、架构约束、Agent 规则、历史原因”分类台账。
- 将仍有效的全局架构约束提炼到 `openspec/config.yaml` 的 context、artifact rules 和 operation guidance。
- 从 ADR 中提取已经由当前代码实现、对用户或调用方可观察的行为，建立初始 `openspec/specs/` 基线；基线描述现状，
  不宣称此次迁移新增了产品能力。
- 保留全部 ADR 原文及编号，把长期决策原因、备选方案和后果继续留在 `docs/adr/`，并让相关 OpenSpec 内容反向引用。
- 保留根 `AGENTS.md` 作为 Agent 入口，只保留与 GSCombat 直接相关的 Git 安全和 OpenSpec 工作流；来自 Python
  Agent 产品的 DeepSeek LLM 测试、Python 风格和 CodeGraph 规则不迁入本项目。
- 增加一致性检查，防止 OpenSpec 基线、ADR 引用和 Agent 门禁出现断链或互相矛盾。

非目标：

- 不删除、合并或重写现有 ADR；
- 不把内部目录结构、具体类名和工具命令复制为行为 requirement；
- 不修改 Calculator、Contracts、Analyzer、Content、API、Web 或 Mini 的运行时实现；
- 不回填所有历史 `docs/plans/`，也不为普通角色、武器、数据刷新或小修复制规格。

## Capabilities

### New Capabilities

无。本变更只迁移和整理现有治理信息，并通过实施任务建立当前行为基线。

### Modified Capabilities

无。没有产品行为或既有 requirement 发生变化。

## Impact

- 直接影响：`AGENTS.md`、`openspec/config.yaml`、`openspec/specs/`、`docs/adr/` 的引用关系和开发文档。
- 受审计范围：`apps/api`、`apps/web`、`apps/mini`、`packages/calculator`、`packages/contracts`、
  `packages/game-data`、`packages/content`、`packages/analyzer` 的现有边界，但不修改这些 workspace 的代码。
- API、TypeBox 契约、工作空间数据、迁移、安全策略和部署行为：无变化。
- 兼容性：保留既有文件路径和 ADR 编号，现有外部链接不失效。
