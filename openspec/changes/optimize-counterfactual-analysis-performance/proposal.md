## Why

切换单把候选武器精炼目前会重新计算完整报告，包括所有武器、词条边际收益和成长项；多角色星扩散还反复准备相同来源属性与查询固定 SQLite 数据。需要缩小重算范围并消除重复工作，同时保证刚修正的反应、前后台资格和队伍增益不退化。

## What Changes

- 增加无状态的单候选武器分析接口，复用完整分析的候选构造和权威场景求值，保持原完整分析接口兼容。
- 精炼切换只请求、更新对应武器行并重新排序；保留其余报告，处理行级加载、失败和乱序响应。
- 复用只读游戏数据仓库的预编译查询及有界数据缓存；在单个场景变体内减少重复来源快照准备，并避免完整分析重复计算基线。
- 使用少量真实跨包集成用例及可复现性能探针，验证结果一致、工作量减少和请求隔离。

## Capabilities

### New Capabilities

- `analysis/incremental-weapon-comparison`: 单武器精炼的局部计算、行级更新及过期响应隔离。

### Modified Capabilities

- `architecture/public-entrypoints`: 正式分析资源增加受契约约束的单候选子入口，仍只有一条权威计算链路。

## Impact

触发 OpenSpec：HTTP/TypeBox 契约变化、共享计算准备过程重构，以及跨五个 workspace 实施。涉及 `apps/web`、`apps/api`、`packages/contracts`、`packages/analyzer`、`packages/game-data`。Calculator 公式、Content 机制声明不在修改范围。

兼容性：现有 `/v1/analysis` 请求和响应不变；旧 Web 仍可使用，新 Web 依赖新增子入口。无存储迁移，无新依赖或鉴权规则；不保存用户场景到服务端缓存。后续发布应先更新 API 再更新 Web，部署需另行授权。

非目标：不改伤害公式、60/30/5/5 权重与参与者资格，不简化整队武器效果，不新增 Redis、任务队列或工作线程，不修改邀请码、工作区存储或辅助指标，不承诺未经测量的固定加速倍数。尚未完成的命座工作继续留在原 change，本变更不承接。
