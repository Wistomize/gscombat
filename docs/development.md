# GSCombat 开发指南

[返回玩家 README](../README.md) · [English](development.en.md) ·
[架构决策](adr) · [腾讯云部署](deployment/tencent-cloud.md)

本文面向参与 GSCombat 开发和内容维护的贡献者。玩家使用说明、产品能力和计算边界请阅读仓库根目录的
[README](../README.md)。

## 技术栈

- TypeScript 6、pnpm workspace 与 Turborepo；
- Next.js 网站和 Taro 微信小程序；
- Fastify API、TypeBox 领域与 HTTP 契约；
- 固定版本的只读 SQLite 游戏数据；
- SQLite 用户工作空间与可选邀请码同步；
- Vitest 系统、集成与单元测试。

要求 Node.js 22+、pnpm 11.15.1。

## 仓库结构

```text
apps/
├── api/          Fastify API、邀请码会话、SQLite 工作空间、展示柜导入
├── web/          Next.js 网站
└── mini/         Taro 微信小程序
packages/
├── analyzer/     场景编排、效果解析、指标求值与反事实收益分析
├── calculator/   与角色无关的类型化伤害和特殊反应流水线
├── content/      characters / weapons / artifacts / rules 等语义内容
├── contracts/    TypeBox 请求、响应和领域契约
└── game-data/    固定版本、只读的游戏数据 SQLite 快照
docs/
├── adr/          已确认的架构决策
├── deployment/   部署与运维说明
└── plans/        功能设计与实施计划
```

角色动作、固有天赋、命座和辅助指标放在
`packages/content/src/characters/<character>/`。武器与圣遗物效果分别属于 `weapons/` 和 `artifacts/`，队伍规则
属于 `rules/`。`calculator` 不导入任何角色或装备内容；角色和队伍语义由 `content` 声明，`analyzer` 负责把场景、
效果和计算流水线组合起来。

## 本地开发

首次安装并构建：

```bash
pnpm install --frozen-lockfile
pnpm build
```

普通开发分别启动 API 和网站：

```bash
pnpm --filter @gscombat/api dev
pnpm --filter @gscombat/web dev
```

访问 `http://127.0.0.1:3200`。网站通过 `/api/backend/*` 代理到默认的
`http://127.0.0.1:3001`；可用 `API_BASE_URL` 覆盖 API 地址。

## 测试可选的云端工作空间

不配置邀请码时，网站使用浏览器本地存储。测试邀请码同步需要创建本地工作空间：

```bash
mkdir -p runtime/workspace
export WORKSPACE_DATA_PATH="$PWD/runtime/workspace/workspaces.sqlite"
export INVITE_TOKEN_SECRET="replace-with-at-least-32-random-characters"
pnpm --filter @gscombat/api invite -- create local
```

保留这些环境变量后再启动 API。邀请码只显示一次，不应写入源码、日志或提交到仓库。

## Content 声明维护

Content 使用“实体自有声明、构建期静态聚合”模型：

- 角色目录的 `definition.ts` 维护目录中文名、游戏数据 ID、武器类型和特殊动作展示名；
- `combat.ts` 维护动作、指标、固有天赋、命座和角色效果；
- 存在多倍率或易混淆参数时，使用 `evidence.ts` 保存经过审阅的数据映射证据；
- 每个 inventory 中的武器和圣遗物目录包含 `effects.ts`、`coverage.ts` 和 `index.ts`；
- 没有当前核心动作收益的装备导出类型化空效果数组，并在 coverage 条款中说明原因；
- `packages/content/src/registry/*.generated.ts` 由工具生成，禁止手工修改，运行时不扫描文件系统。

新增或移动 Content 实体后运行：

```bash
pnpm --filter @gscombat/content registries:generate
pnpm --filter @gscombat/content registries:check
```

Content 的 `build`、`test` 和 `typecheck` 都会先验证生成注册表的新鲜度。完整决策见
[ADR 0015](adr/0015-generate-content-registries-from-entity-owned-declarations.md)。

## 计算链路约束

- 正式计算只经过一条权威场景指标链路；
- 角色配置、队友、敌人和 Buff 必须显式进入场景；
- 角色和装备只声明向哪个类型化阶段添加什么，通用计算器不写角色特判；
- 武器对比和词条收益使用同一场景的反事实重算，不维护第二套近似公式；
- 辅助指标与伤害指标共享可解释公式结构，但不强行进入伤害专属的武器和词条比较；
- 当前输出是核心动作期望结果，不应包装为完整循环 DPS。

相关架构决策见 [`docs/adr`](adr)，特别是
[ADR 0014](adr/0014-use-one-authoritative-scenario-metric-evaluation-path.md)。

## 验证

提交前至少运行：

```bash
pnpm typecheck
pnpm test
pnpm build
```

项目优先使用跨真实包边界、SQLite、HTTP 路由与完整场景的系统和集成测试。角色内容测试主要验证声明能够通过
通用流水线真实注入，避免在测试中复制一套角色公式。

Content 或数据更新还应运行对应包的完整测试；涉及展示柜时验证真实生成元数据，涉及网站行为时验证完整工作空间流程。

## 更新 README 截图

README 的计算结果与提升对比截图使用干净浏览器上下文和内置雷神国家队生成，不读取开发者的浏览器配置、UID
或邀请码。队伍配置总览图 `docs/images/team-configuration.webp` 单独维护，不会被脚本覆盖。确保本机已经安装
Google Chrome 和 `cwebp`，然后运行：

```bash
pnpm --filter @gscombat/web screenshots:readme
```

默认从 `https://gscombat.online` 截图；需要验证本地界面时可设置 `README_SCREENSHOT_BASE_URL`。生成的两张结果图
写入 `docs/images/`。提交前必须逐张检查裁切、清晰度、演示 Buff 和敏感信息。

## 游戏数据更新

运行时不会向静态游戏数据 API 发请求。`@gscombat/game-data` 使用固定上游提交、SHA-256 校验和只读 SQLite
快照。更新前应确认上游正式数据已经合入，再生成新版本快照、刷新装备清单、展示柜元数据和视觉资源，并运行完整
注册表与集成测试。

详细命令与数据模型见 [`packages/game-data/README.md`](../packages/game-data/README.md)。资料来源和固定版本记录见
[外部资料与致谢](third-party-sources.md)。

## 审计接口

开发环境可以通过下列 API 检查数据与声明覆盖：

- `GET /v1/game-data/status`
- `GET /v1/combat-coverage`
- `GET /v1/combat-authoring/audit`

网站开发服务器使用 `/api/backend/*` 转发这些请求。

## 部署

生产环境使用 Docker Compose 运行 API、Web 与 Caddy。必须配置强随机 `INVITE_TOKEN_SECRET`，并在每次部署前备份
`runtime/workspace/workspaces.sqlite`。部署过程不得覆盖用户工作空间。

域名、HTTPS、构建、健康检查和回滚步骤见[腾讯云部署说明](deployment/tencent-cloud.md)。

## 许可与第三方资料

原创代码按 [GNU Affero General Public License v3.0](../LICENSE) 发布。通过网络向用户提供修改版服务时，
AGPL-3.0 要求向服务用户提供对应源代码。第三方游戏数据、图片、文本、商标和依赖仍遵循各自权利与许可。

在新增数据源、图片来源或外部实现参考时，同步更新
[外部资料与致谢](third-party-sources.md)及其英文版。
