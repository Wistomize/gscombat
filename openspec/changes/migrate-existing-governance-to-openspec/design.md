## Context

参见 `proposal.md` 的 Why。当前治理信息分布在 19 份 ADR、根 `AGENTS.md`、`openspec/config.yaml` 和开发指南中。
ADR 同时包含现状、决策原因、备选方案、实现约束和用户可观察行为，不能整篇复制成 requirement。部分早期 ADR 已被
后续决策扩展，例如浏览器本地配置在 ADR-0013 后增加了可选的邀请码工作空间同步，因此迁移必须以当前代码和契约为
准，而不是把每份 ADR 都视为独立且同等当前的事实。

本变更不修改运行时，也没有 behavior delta；`.openspec.yaml` 使用 `skip_specs: true`。实施阶段创建的是当前
`openspec/specs/` 基线，而不是本 change 的 delta spec。

## Goals / Non-Goals

**Goals:**

- 让每份 ADR 和 `AGENTS.md` 中与 GSCombat 相关的有效内容都有明确归属，不因迁移而丢失决策历史。
- 建立少量、稳定、面向行为的主规格，使 Agent 能直接读取当前系统承诺。
- 把跨 change 都必须遵守的架构和工作流约束集中到 `openspec/config.yaml`。
- 保持 ADR、OpenSpec、Agent 入口之间的可追踪引用，并能机械检查明显断链。

**Non-Goals:**

- 不把所有 ADR 一比一转换成 19 个 spec，也不把目录结构和类名固化为产品 requirement。
- 不用 OpenSpec 替代 ADR、开发指南、测试或当前代码验证。
- 不判断尚未实施的 ARCH-007、ARCH-008、ARCH-010 已经完成。
- 不修改任何公开 API、计算结果、持久化格式、部署方式或 UI。

## Decisions

### 1. 采用“保留原文、分类提炼、双向引用”的增量迁移

所有 ADR 保持原路径、编号和正文。新增一份迁移映射，逐项记录 ADR 的当前状态、主要归属、目标 OpenSpec 位置和
需要实时复核的内容。一个 ADR 可以支持多个规格或全局约束，但必须有一个主要归属，避免无人维护。

未采用“移动 ADR 到 openspec”或“复制 ADR 全文”。移动会破坏既有链接和历史上下文；全文复制会产生两个互相漂移的
决策源。

### 2. 先按信息类型分类，再选择 OpenSpec 落点

迁移使用四类落点：

| 信息类型 | 主要落点 | 典型来源 |
| --- | --- | --- |
| 用户、调用方或贡献者可验证的当前行为 | `openspec/specs/` | ADR-0002、0003、0004、0006、0007、0009、0011、0012、0013、0014 |
| 跨变更必须维持的架构约束 | `openspec/config.yaml` | ADR-0014 至 ADR-0019 |
| GSCombat Agent 执行规则 | `AGENTS.md`，必要部分同步到 config operations | Git 安全与 OpenSpec 门禁 |
| 决策背景、替代方案和后果 | `docs/adr/` | 全部 ADR |

“可验证行为”包括面向玩家的计算边界，也包括贡献者可通过生成器、审计和测试验证的 Content authoring contract。
内部模块的具体目录和类名只作为 design/ADR 事实，不进入行为 requirement。

### 3. 初始主规格按稳定能力组织，而不是按 ADR 编号组织

计划建立以下基线能力；最终名称可在实时核对当前契约后收窄，但不得按角色或单次实现拆散：

- `analysis/core-action-results`：核心动作期望结果、支持指标分离、公式轨迹和反事实比较边界；
- `analysis/action-semantics`：语义动作、事件时间线、反应假设、显式限制和可解释结果；
- `workspace/build-persistence`：浏览器本地配置、可选邀请码同步、版本和兼容边界；
- `content/authoring-contract`：固定数据、人工审阅语义、证据、实体自有声明和生成注册表守卫；
- `architecture/public-entrypoints`：仅记录调用方可依赖的权威入口和稳定边界，不固化内部文件布局。

每项 requirement 都必须引用来源 ADR，并至少包含一个可由当前测试、契约或审计命令验证的 scenario。

未采用“一份 ADR 一个 capability”。ADR 是决策记录，capability 是当前行为集合，两者生命周期不同。

### 4. 迁移前必须用当前代码和契约复核 ADR

实施时先建立 ADR 清单，再通过当前实现、TypeBox schema、公开路由、系统测试和开发指南核对易漂移内容。发现以下
情况时不得直接写入主规格：

- 后续 ADR 已扩展或替代早期决策；
- ADR 描述的是当时计划而非当前实现；
- 行为只在历史测试或旧入口中存在；
- 内部结构已经变化，但 ADR 仍有历史解释价值。

此类条目在迁移映射中标记为 `superseded`、`partially-current` 或 `historical-only`，ADR 原文不修改。需要正式
废弃决策时另建 ADR，而不是在本次文档迁移中暗改历史。

### 5. `AGENTS.md` 只保留本项目适用的入口规则

根 `AGENTS.md` 保存 GSCombat 开发所需的 Git 安全和 OpenSpec 工作流。OpenSpec config 同步跨 change 必须遵守的
项目背景、架构不变量、产物要求与 apply/archive guidance。

DeepSeek 真实 LLM 测试、Python 排序与风格、CodeGraph 工具路由来自另一个 Python Agent 产品，不适用于 GSCombat，
不得为了“无损迁移”而复制到本项目。迁移审计应区分“规则原文存在”与“规则对当前项目有效”，避免把跨项目说明升级成
仓库约束。

### 6. 用引用和严格校验控制漂移

迁移完成至少执行：

- `openspec validate --specs --strict --no-interactive`；
- 检查 ADR-0001 至 ADR-0019 在迁移映射中各出现一次主要归属；
- 检查所有主规格引用的 ADR 路径存在；
- 检查 `AGENTS.md`、config 和 ADR-0019 的 OpenSpec 触发条件一致；
- `git diff --check` 和 `git status --short`。

这是纯文档和配置迁移，不运行完整产品测试；若实时核对发现需要改代码，停止迁移并另建带行为 delta 的 change。

## Risks / Trade-offs

- [ADR 可能已经过时] → 以当前代码、契约和测试复核，映射中显式记录当前性，不直接复制。
- [OpenSpec 与 ADR 重复] → spec 只保存当前行为，ADR 只保存决策历史和原因，并通过引用连接。
- [规格过细导致维护成本上升] → 按稳定能力聚合，不为角色、武器、文件或单次修复建基线规格。
- [内部约束被误写成用户行为] → 架构不变量进入 config/design，只有可验证契约进入 specs。
- [迁移时把尚未实现的设计写成现状] → 每条 requirement 必须能指向当前验证证据，否则只留在 ADR 或迁移映射。
- [Agent 规则被多处复制后漂移] → `AGENTS.md` 保持入口，config 只同步跨 change 的必要子集。

## Migration Plan

1. 建立完整迁移映射并核对 19 份 ADR 与 GSCombat 适用的 Agent 规则范围。
2. 用当前代码、契约、测试和文档验证候选行为与架构约束。
3. 更新 `openspec/config.yaml` 和 `AGENTS.md`，只补缺失或不一致内容。
4. 创建并严格验证少量主规格，加入来源 ADR 和验证证据。
5. 更新开发指南与 ADR 索引引用，不移动或删除原文件。
6. 完成一致性检查后归档本 change；因为 `skip_specs: true`，归档不执行 delta 合并。

回滚只需删除本次新增的迁移映射和主规格，并回退 config、Agent 入口和开发文档中的增量内容。所有原 ADR 保持不动，
因此不存在决策历史恢复问题。
