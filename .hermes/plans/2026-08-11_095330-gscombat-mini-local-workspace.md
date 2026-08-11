# GSCombat 小程序本地工作空间迁移实施计划

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 将现有 GSCombat 配置与正式分析能力迁移到微信小程序，同时让用户工作空间只保存在本机，不引入邀请码、登录或云端同步。

**Architecture:** 采用“本地工作空间 + 远程无状态计算”架构。Taro 小程序负责配置管理、队伍编辑、计算交互和结果展示；现有 Fastify API 继续提供目录、展示柜导入、动作选项、伤害分析和辅助指标，Analyzer 与 SQLite 不进入小程序包。Web 与小程序只共享纯业务模型和协议，不共享 DOM/Taro UI。

**Tech Stack:** pnpm workspace、TypeScript 6、Taro 4.2.1、React 18、微信小程序、Fastify、TypeBox、Vitest、现有 GSCombat Analyzer API。

---

## 1. 已确认的方案

### ADR-001：小程序使用本地工作空间和远程正式计算

**状态：** Accepted

**背景：**

- `apps/mini` 当前只有单页占位实现，尚未形成独立计算链路。
- 正式计算依赖 `@gscombat/analyzer`、`@gscombat/game-data` 和 SQLite 快照，不适合直接进入微信小程序运行时。
- `/v1/catalog`、`/v1/presets`、`/v1/showcase/import`、`/v1/action-effect-options`、`/v1/analysis`、`/v1/support-metrics/evaluate` 已经是不依赖邀请码的正式接口。
- 邀请码只服务于 `/v1/session*` 和 `/v1/workspace` 云工作空间接口。

**决策：**

- 小程序在本地保存 `WorkspaceDocument`：全部角色配置和当前四人队伍。
- 小程序不实现邀请码、登录、昵称、Cookie 会话、云端 revision 或跨设备自动同步。
- 目录、默认配置、展示柜导入、动作效果选项和所有计算均调用现有正式 API。
- 小程序保留整个工作空间的 JSON 导入与导出，作为备份和跨设备人工迁移手段。
- 小程序不复制 Analyzer、角色逻辑、武器逻辑、圣遗物逻辑或 SQLite 数据。

**取舍：**

- 优点：只有一套计算真相；小程序包体较小；角色机制修复可随服务端发布立即生效。
- 代价：展示柜和计算必须联网；API 故障时只能继续编辑已经存在的本地配置，不能得出新结果。
- 否决方案：第一阶段不做完整离线计算，也不把完整 `@gscombat/content`、Analyzer 或 SQLite 打进小程序。

## 2. 功能范围

### 2.1 第一轮迁移必须覆盖

- 本地初始化和恢复工作空间。
- 手动初始化角色配置：先选元素，再选角色。
- 展示柜导入、JSON 导入、整个工作空间导出。
- 已配置角色头像列表、同角色多配置、编辑和删除单个配置。
- 1–4 人无顺序语义队伍配置。
- 从队伍成员中选择计算对象和伤害/辅助指标。
- 敌人、Buff、场景参数、装备效果选项。
- 正式伤害和辅助指标计算。
- 指标结果、结算面板、结算轨迹、圣遗物有效词条、圣遗物原始值、边际收益、成长收益和更换武器收益。
- 武器精炼选择和现有所有自动满效果/条件效果语义。

### 2.2 明确不进入本轮

- 邀请码登录和昵称。
- 云端工作空间、冲突解决和跨端自动同步。
- 本地离线 Analyzer。
- 小程序端维护第二份角色、武器或圣遗物机制数据。
- 与网站完全相同的 CSS 或桌面布局；只保证能力和字段语义一致。

## 3. 非功能要求

- **一致性：** 同一个 `AnalysisRequest` 在 Web 和小程序必须得到相同 API 结果。
- **可恢复性：** 本地数据损坏、schema 不兼容或写入失败时必须显示可操作提示，不得静默清空。
- **可迁移性：** JSON 导入导出继续使用 `WorkspaceDocumentSchema`，不得引入小程序专属业务字段。
- **包体控制：** Analyzer、SQLite 和全量高清图标不得进入小程序主包。
- **网络容错：** 配置编辑不依赖网络；目录可使用最近一次成功缓存；计算失败不覆盖上一次成功结果。
- **可维护性：** 共享包不得依赖 `window`、DOM、Next.js、Taro 或微信 API。
- **测试策略：** 以配置到计算结果的集成测试为主；单元测试只覆盖存储迁移、协议校验和请求转换等高风险边界。

## 4. 目标目录模型

```text
packages/workbench/
  src/
    workspace/
      document.ts          # 解析、规范化、合并和迁移
      repository.ts        # 平台无关的工作空间仓库接口
    builds/
      draft.ts             # 平台无关的角色配置草稿逻辑
    calculation/
      selection.ts         # 计算对象、指标和队伍选择规则
      scenario.ts          # 场景表单与 API DTO 转换
    index.ts
  test/
    integration/

apps/web/
  lib/workspace/
    browser-workspace-store.ts
  lib/api/
    analysis-api.ts
  features/                # 保留 Web UI，只逐步改用共享业务层

apps/mini/src/
  pages/
    workspace/             # 配置主页和队伍
    build-editor/          # 手动配置/编辑
    calculate/             # 计算设置和结果
  features/
    build-library/
    party/
    calculation-setup/
    calculation-report/
  components/
  state/
    workspace-store.ts
    calculation-store.ts
  infrastructure/
    api/gscombat-api.ts
    storage/taro-workspace-store.ts
    files/workspace-transfer.ts
  assets/                  # 只放必要的小型固定资源
  test/
    integration/
```

目录名称可在实施前按现有分层规范微调，但必须保持“共享纯逻辑、各端适配器、各端 UI”三层边界。

## 5. 分阶段实施计划

### Phase 0：建立可验证的迁移基线

**目标：** 在修改功能前固定 Web、API 和 mini 的基线，避免迁移过程中误改正式计算。

**检查文件：**

- `apps/mini/package.json`
- `apps/mini/config/index.ts`
- `apps/mini/project.config.json`
- `apps/api/src/routes/analysis.ts`
- `apps/api/src/routes/catalog-audit.ts`
- `apps/api/src/routes/showcase.ts`
- `packages/contracts/src/workspace.ts`

**步骤：**

1. 记录现有公开 API 请求与响应 schema，并确认 mini 不调用 session/workspace 路由。
2. 为 mini 增加测试脚本和测试环境，但暂不增加业务页面。
3. 固定一组现有四人队伍、伤害指标和辅助指标作为跨端基准样例。
4. 运行 `pnpm --filter @gscombat/mini typecheck` 和 `pnpm --filter @gscombat/mini build`，预期均通过。
5. 运行 `pnpm --filter @gscombat/api test`，预期现有 API 集成测试全部通过。

### Phase 1：抽取跨端工作空间核心

**目标：** 将当前 Web 中平台无关的配置逻辑移入共享包，不改变 Web 行为。

**预计文件：**

- Create: `packages/workbench/package.json`
- Create: `packages/workbench/tsconfig.json`
- Create: `packages/workbench/tsconfig.build.json`
- Create: `packages/workbench/src/index.ts`
- Create: `packages/workbench/src/workspace/document.ts`
- Create: `packages/workbench/src/workspace/repository.ts`
- Create: `packages/workbench/src/builds/draft.ts`
- Create: `packages/workbench/src/calculation/scenario.ts`
- Create: `packages/workbench/test/integration/workspace-document.test.ts`
- Modify: `apps/web/lib/workspace/workspace-config.ts`
- Modify: `apps/web/features/build-editor/build-draft.ts`
- Modify: `apps/web/features/calculation-setup/scenario-adapter.ts`
- Modify: `apps/web/package.json`

**步骤：**

1. 先用集成测试固定 JSON 解析、旧本地数据迁移、同 ID 配置合并、删除配置和队伍清理行为。
2. 创建不依赖浏览器或 Taro 的 `@gscombat/workbench`。
3. 将纯函数迁入共享包；浏览器 `Storage` 读写继续留在 Web 适配器。
4. Web 改用共享实现，运行 `pnpm --filter @gscombat/web test` 验证行为未变化。
5. 运行 `pnpm --filter @gscombat/workbench test`、`typecheck` 和 `build`。

### Phase 2：实现小程序本地工作空间仓库

**目标：** 用 Taro Storage 完成可靠的本地加载、自动保存、迁移和恢复。

**预计文件：**

- Create: `apps/mini/src/infrastructure/storage/taro-workspace-store.ts`
- Create: `apps/mini/src/state/workspace-store.ts`
- Create: `apps/mini/src/test/integration/local-workspace.test.tsx`
- Modify: `apps/mini/package.json`

**步骤：**

1. 用集成测试覆盖首次启动、重新启动恢复、删除配置、队伍成员同步移除、损坏 JSON 和存储写入失败。
2. 实现 `WorkspaceRepository` 的 Taro 适配器，并使用带版本号的独立 storage key。
3. 工作空间写入前用 `WorkspaceDocumentSchema` 校验；失败时保留原值并向 UI 返回错误状态。
4. 实现“配置修改即保存”，避免页面退出时才保存。
5. 不创建 session、token、nickname、revision 或云同步字段。

### Phase 3：建立小程序 API 网关和资源策略

**目标：** 让 mini 只通过带类型的网关访问正式服务，并解决头像、武器、圣遗物图片来源。

**预计文件：**

- Create: `apps/mini/src/infrastructure/api/gscombat-api.ts`
- Create: `apps/mini/src/infrastructure/api/config.ts`
- Create: `apps/mini/src/infrastructure/api/errors.ts`
- Create: `apps/mini/src/state/catalog-store.ts`
- Modify: `apps/mini/config/index.ts`
- Modify if needed: `packages/contracts/src/catalog.ts`
- Modify if needed: `apps/api/src/serializers/catalog.ts`
- Modify if needed: `apps/api/src/routes/catalog-audit.ts`
- Test: `apps/api/test/integration/app.test.ts`
- Test: `apps/mini/src/test/integration/api-gateway.test.ts`

**步骤：**

1. 使用 `Taro.request` 实现目录、默认配置、展示柜、动作选项、伤害和辅助指标方法。
2. 使用构建时配置提供 API base URL；业务组件不得硬编码域名。
3. 对超时、无网络、4xx、5xx 和协议校验失败统一建模。
4. 缓存最近一次成功目录；接口失败时允许继续编辑已有配置。
5. 盘点现有图标映射，确定 catalog 返回稳定相对资源路径还是独立资源 manifest；mini 使用 HTTPS 绝对地址加载大部分图标。
6. 主包只内置元素图标、占位图和必要 UI 资源。
7. API 集成测试验证小程序所需路由不要求邀请码或会话 Cookie。

### Phase 4：迁移配置主页和角色编辑

**目标：** 完成小程序端全部角色配置管理能力。

**预计文件：**

- Replace: `apps/mini/src/pages/index/index.tsx`
- Create: `apps/mini/src/pages/workspace/index.tsx`
- Create: `apps/mini/src/pages/build-editor/index.tsx`
- Create: `apps/mini/src/features/build-library/*`
- Create: `apps/mini/src/features/party/*`
- Create: `apps/mini/src/components/*`
- Modify: `apps/mini/src/app.config.ts`
- Test: `apps/mini/src/test/integration/configuration-flow.test.tsx`

**步骤：**

1. 先写一条完整集成流程：初始化角色、编辑装备、加入队伍、重启页面、配置仍然存在。
2. 实现导入入口、已配置角色头像列表和同角色多配置选择。
3. 实现先选元素再选角色的手动初始化流程。
4. 实现角色等级、命座、天赋、武器和五件圣遗物编辑。
5. 实现删除单个配置，并同步处理引用该配置的队伍坑位。
6. 实现四人队伍配置，不赋予坑位顺序特殊语义。

### Phase 5：迁移工作空间导入导出和展示柜

**目标：** 在没有云端账户的前提下提供完整的数据备份与恢复能力。

**预计文件：**

- Create: `apps/mini/src/infrastructure/files/workspace-transfer.ts`
- Create: `apps/mini/src/features/build-library/workspace-import.tsx`
- Create: `apps/mini/src/features/build-library/showcase-import.tsx`
- Test: `apps/mini/src/test/integration/workspace-transfer.test.tsx`

**步骤：**

1. JSON 导入先解析为临时工作空间，展示摘要并由用户确认后再合并。
2. 导出始终导出全部角色配置和当前队伍，不提供单配置或单队伍导出。
3. 支持复制 JSON；文件导入导出能力按微信真机支持情况实现为补充入口。
4. 展示柜导入允许角色无圣遗物或缺少部件，不得过滤合法空配置。
5. 所有导入结果经共享 schema 校验并给出逐项错误反馈。

### Phase 6：迁移计算设置和正式请求链路

**目标：** 从当前四人队伍灵活选择任意成员及其指标，并构造与 Web 等价的正式请求。

**预计文件：**

- Create: `apps/mini/src/pages/calculate/index.tsx`
- Create: `apps/mini/src/features/calculation-setup/*`
- Create: `apps/mini/src/state/calculation-store.ts`
- Test: `apps/mini/src/test/integration/calculation-flow.test.tsx`

**步骤：**

1. 用基准队伍固定小程序最终发出的 `AnalysisRequest` 和 `SupportMetricEvaluateRequest`。
2. 实现计算对象、目标指标、敌人、Buff、月兆和场景参数选择。
3. 根据当前队伍、装备和目标动作请求 `/v1/action-effect-options`。
4. 保持武器和圣遗物默认满效果、角色条件自动适配以及可选 Buff 的现有语义。
5. 实现伤害和辅助指标请求，加载期间禁止重复提交。
6. 请求失败时保留编辑状态和上一次成功结果。

### Phase 7：迁移完整结果展示

**目标：** 在移动端呈现 Web 已有的全部计算结果，不复制计算逻辑。

**预计文件：**

- Create: `apps/mini/src/features/calculation-report/result-summary.tsx`
- Create: `apps/mini/src/features/calculation-report/resolved-panel.tsx`
- Create: `apps/mini/src/features/calculation-report/damage-trace.tsx`
- Create: `apps/mini/src/features/calculation-report/support-metric-report.tsx`
- Create: `apps/mini/src/features/calculation-report/artifact-rolls.tsx`
- Create: `apps/mini/src/features/calculation-report/marginal-gains.tsx`
- Create: `apps/mini/src/features/calculation-report/progression-gains.tsx`
- Create: `apps/mini/src/features/calculation-report/weapon-comparisons.tsx`
- Test: `apps/mini/src/test/integration/calculation-report.test.tsx`

**步骤：**

1. 按既定顺序展示结果：指标期望结果、结算面板、结算轨迹、有效词条、原始值、词条收益、成长收益、武器收益。
2. 在小屏使用可折叠区块展示属性区和增伤区明细，保留服务端提供的来源标签。
3. 武器对比使用图标并支持每把武器单独选择精炼等级。
4. 边际词条收益保留两位小数，其他数值沿用现有格式。
5. 不在小程序重新计算或修正 API 返回值；发现差异时修正式 Analyzer/API。

### Phase 8：跨端集成验证和发布准备

**目标：** 验证小程序与 Web 使用同一计算真相，并完成真机发布前置条件。

**步骤：**

1. 用至少一组普通伤害、元素反应、月反应和辅助指标场景比较 Web 与 mini 请求及结果。
2. 真机验证展示柜导入、长配置列表、五件圣遗物编辑、结果轨迹展开和 JSON 备份恢复。
3. 验证弱网、断网、API 500、图片失败、缓存损坏和本地存储不足的提示与恢复路径。
4. 运行以下质量门：

   ```bash
   pnpm --filter @gscombat/workbench test
   pnpm --filter @gscombat/mini test
   pnpm --filter @gscombat/mini typecheck
   pnpm --filter @gscombat/mini build
   pnpm --filter @gscombat/web test
   pnpm --filter @gscombat/api test
   pnpm typecheck
   ```

5. 将 `touristappid` 替换为真实 AppID，并配置正式 HTTPS API/静态资源域名和微信后台服务器域名。
6. 更新中英文 README，写明小程序数据只保存在本地、卸载或清缓存前应导出备份。

## 6. 主要风险与应对

| 风险 | 影响 | 应对 |
|---|---|---|
| 小程序与 Web 分别复制请求拼装逻辑 | 同一队伍得到不同结果 | 抽取共享场景/请求转换，增加跨端请求快照集成测试 |
| 本地数据被清除 | 用户配置丢失 | 明确提示本地存储语义，提供整工作空间 JSON 导出/导入 |
| 全量图标导致包体膨胀 | 无法发布或首屏过慢 | 大图走 HTTPS 静态资源，只内置必要固定资源和占位图 |
| API 或网络不可用 | 无法导入展示柜和计算 | 本地编辑可继续，目录缓存，保留上次结果，提供重试 |
| catalog 与前端静态名称映射漂移 | 新角色显示未知或无图 | catalog/资源 manifest 由服务端统一发布，客户端使用稳定 ID |
| Web 抽取共享逻辑时产生回归 | 现有网站受损 | 先用 Web 集成测试固定行为，再迁移纯逻辑，不搬 UI |
| 小程序页面承载完整轨迹过长 | 移动端难用、渲染慢 | 分区折叠、按需渲染长内容，不删计算字段 |

## 7. 后续需要用户拍板的决策

以下决策不阻塞架构，可以在进入对应 Phase 前逐项确认：

1. **首版交付边界：** 一次迁移全部结果区，还是先交付“配置 + 队伍 + 基础结果”后继续补完整轨迹。建议分阶段交付，但最终全部覆盖。
2. **页面导航：** 推荐“配置主页 → 角色编辑页 → 计算页”，计算结果留在计算页下方；是否需要底部 TabBar 可在首个原型后确认。
3. **JSON 文件交互：** 推荐同时提供复制/粘贴和微信文件选择/分享，真机验证后确认主入口。
4. **图标托管：** 推荐复用 `gscombat.online` 的 HTTPS 静态资源；是否单独建立资源子域名可以等域名备案和部署配置稳定后决定。
5. **公开 API 防滥用：** 小程序不鉴权，但上线前仍建议增加按 IP/路由的限流和请求体上限；具体阈值在真机压测后确定。

## 8. 完成标准

- 小程序完全不存在邀请码或云工作空间入口。
- 退出并重新进入小程序后，角色配置和队伍仍能恢复。
- JSON 可完整导出并在另一台设备导入恢复。
- 小程序可以计算当前队伍任意成员的伤害指标或辅助指标。
- Web 与小程序对相同请求展示相同核心结果。
- Analyzer、SQLite 和角色机制代码没有被复制进 `apps/mini`。
- 小程序类型检查、构建、集成测试以及现有 Web/API 回归测试全部通过。
