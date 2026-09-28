# 武器规则落实 Implementation Plan

> 执行约定：用户已批准逐阶段实施，使用项目的 `openspec-apply-change`。本文保留原阶段规划；实时状态和验证以链接的任务表、审计和证据为准。不使用 Claude、另建工作树或自动提交。

**Goal:** 将已确认的 233 把武器规则落实到实际装备和武器比较，保持自动判定、必要手选、前后台、效果来源及属性联动一致。

**Architecture:** Content 实体声明 → 现有能力与效果生命周期判定 → 单一 Analyzer 场景求值 → API / Web。复用既有抽象，不增加另一套武器引擎。

**Tech Stack:** TypeScript、pnpm、TypeBox、Fastify、Next.js、Vitest、固定只读 SQLite 游戏数据。

## 阅读入口与状态

- [233 把武器确认记录](2026-09-17-weapon-effect-review.md)：已确认规则及原始依据。
- [变更提案](../../openspec/changes/implement-reviewed-weapon-default-rules/proposal.md)：实施范围与非目标。
- [技术设计](../../openspec/changes/implement-reviewed-weapon-default-rules/design.md)：目录落点、共享能力、兼容及回滚。
- [任务清单](../../openspec/changes/implement-reviewed-weapon-default-rules/tasks.md)：后续唯一实施进度来源。
- [行为规格](../../openspec/changes/implement-reviewed-weapon-default-rules/specs/analysis/weapon-effect-defaults/spec.md)：可验收行为。

233 把武器已完成逐项静态审计；实现与验证见[审计](../../openspec/changes/implement-reviewed-weapon-default-rules/audit.md)和[证据](../../openspec/changes/implement-reviewed-weapon-default-rules/evidence.md)。未把所有条目重写，原本正确的声明保留；宗室五把按后续裁决排除比较，旧装备保留。

## 核心问题与路线

现有候选默认解析会为对比武器补效果，但它不是实际装备默认值的统一入口。这是优先处理项。其次，现有有限命中机会查询带有固定 0.3 秒门槛，不能无差别用于不同武器；候选 API 也尚无专属条件覆盖输入。

| 阶段 | 工作 | 完成标志 |
| --- | --- | --- |
| 1. 差异清单 | 233 把逐条对照声明，归类无需改动/迁移/能力缺口/明确排除，记录已有失败 | 每把有唯一 ID、代码落点、目标与所属批次 |
| 2. 统一入口 | 遗祀玉珑、护摩、四风先打通实际装备与候选同规则 | 相同配置结果一致；显式关闭有效；后台不越权 |
| 3. 能力补齐 | 复用并补治疗对象、命中/施放机会、反应资格、团队/个人资格 | 各能力有实际消费者及正反集成例，不扩展轮转模拟 |
| 4. 内容迁移 | 按下列规则族修改实体 effects/coverage，已正确的不动 | 233 行都关联实现或排除依据及验证证据 |
| 5. 接口与页面 | 候选条件覆盖、必要控件、单行请求、旧输入兼容 | 一把一行；改精炼/专属条件不重算全榜、不改基线 |
| 6. 收口 | 删旧候选默认分支、更新缓存语义与说明，集中回归 | 无双系统、覆盖闭环、全仓 gates 完成，另行申请发布 |

每阶段完成后报告实际变化、验证和剩余问题；某把特殊规则缺证据时单列，不阻塞无关武器，也不虚报全量完成。

## 阶段 4 的迁移批次

1. 常驻属性、按伤害类型匹配、独立追加伤害排除。
2. 前后台、退场保留、命中/施放层数与持续准备。
3. 治疗、生命变化、生命之契、受伤、护盾。
4. 队伍人数/元素/能量与生命、精通、充能等属性转换。
5. 团队加成、接力对象、拾取对象及同名来源叠加。
6. 普通反应、月曜、星烁、夜魂、魔导条件与专属乘区。
7. 剩余手选、角色特例、特殊等级武器收口。

这不是重新请用户审 233 把：以已确认记录为准，只在出现影响口径的新歧义时提问。阶段 1 将每把武器归入一个主批次，避免跨批重复记完成。

## 代码落点

| 层 | 文件/目录 | 职责 |
| --- | --- | --- |
| Content | `packages/content/src/weapons/<slug>/effects.ts`、`coverage.ts` | 该武器默认、条件、数值、特例和覆盖事实 |
| Content 共享 | `packages/content/src/combat/types.ts`、`capabilities.ts`、`combat-action-effects.ts` | 小型类型、能力查询要求及选项投影；不存第二份全武器规则表 |
| Analyzer | `packages/analyzer/src/effects/effect-selection.ts`，必要时新增 `weapon-state.ts` | 统一来源作用域、旧选择兼容和默认状态 |
| Analyzer | `packages/analyzer/src/scenario/capabilities.ts`、`effect-lifecycle.ts` | 来源、对象、触发、保持和实际前后台 |
| Analyzer | `packages/analyzer/src/analysis/analyze.ts` | 候选构造与重算，移除候选专用补效果逻辑 |
| Contracts/API | `packages/contracts/src/analysis.ts`、`catalog.ts`；`apps/api/src/routes/analysis.ts` | 可选候选条件及合法性校验，复用原端点 |
| Web | `apps/web/features/calculation-report/`、`calculation-setup/`、`calculation-workspace/use-incremental-analysis.ts` | 一行必要控件、单候选更新及过期请求保护 |

不改 Calculator 公式来容纳武器特判，不把来源状态存进角色基础配置，不修改游戏快照。圣遗物相关现有未提交改动、海渊图标等全部保留。

## 测试与验收

只增少量规则族集成用例，使用真实声明、固定数据库、分析/API 链路；声明完整性用参数表审计，不逐角色复制公式。下列为实施阶段验证命令；实际执行结果见 [验收记录](../../openspec/changes/implement-reviewed-weapon-default-rules/evidence.md)。

```bash
# 统一默认与候选一致性
pnpm --filter @gscombat/analyzer test test/integration/analysis/weapon-defaults.test.ts test/integration/analysis/incremental-weapon.test.ts

# 来源、前后台、基础加值与特殊反应（按当前批次选跑，非每批全跑）
pnpm --filter @gscombat/analyzer test test/integration/effects/team-field-context.test.ts test/integration/effects/same-hit-weapon-effects.test.ts test/integration/effects/special-weapon-effects-scenario.test.ts test/integration/effects/version-seven-equipment-effects.test.ts

# 新增候选条件、页面单行交互
pnpm --filter @gscombat/api test test/integration/incremental-weapon.test.ts
pnpm --filter @gscombat/web test test/integration/incremental-analysis.test.tsx test/integration/workspace-flow.test.tsx

# 新增/改动导出后生成并校验；非手改生成文件
pnpm --filter @gscombat/content registries:generate
pnpm --filter @gscombat/content registries:check

# 全部收口后集中执行
pnpm typecheck
pnpm test
pnpm build
openspec validate implement-reviewed-weapon-default-rules --strict
git diff --check
git status --short
```

性能只做固定场景的少量前后对照，不搭新 benchmark 平台。重点确认单候选没有调用全量榜单、多人贡献不重新构建所有人的完整分析。

## 范围边界与实施前注意项

- 按用户修正，比较池由四/五星扩展为已支持且类型匹配的三/四/五星；三星与四星默认精炼 5、五星默认精炼 1，保留合法精炼选择。完整榜单与单候选入口同步支持三星，一/二星和既有排除项不纳入。
- 星锋剑按已确认“旅行者默认共鸣四级、已开放元素全解锁”，不再询问账号进度；等级上限与元素集合要核实后绑定，不臆造参数。
- 旧场景自动化开关不再强制开效果，但有效手选要保留，不迁移/清空 SQLite 或角色库。
- 不更新 7.1 数据，不启动小程序页面开发，不顺带修未完成的全角色命座工作。
- 本计划已获用户批准并进入实施，完成状态以 [任务清单](../../openspec/changes/implement-reviewed-weapon-default-rules/tasks.md) 为准；提交、推送、腾讯云部署仍需明确授权。
