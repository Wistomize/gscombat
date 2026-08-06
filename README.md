# GSCombat（原神战斗分析爽）

[English](README.en.md) · [腾讯云部署](docs/deployment/tencent-cloud.md) · [外部资料与致谢](docs/third-party-sources.md)

GSCombat 是一个类型安全、可审计的原神角色指标与战斗伤害分析工作台。它把角色配置、队伍、目标动作、
敌人与 Buff 统一为可复现的场景，并输出目标指标、结算面板、逐乘区公式轨迹、圣遗物词条边际收益和武器
更换收益。

当前伤害指标刻意聚焦于开发者维护的“单个核心动作期望伤害”，不是循环 DPS 模拟器。辅助角色使用独立
指标，例如治疗量、护盾量、加攻值与增伤值；每个指标都保留公式树和适用条件。

## 现有能力

- 选择 1–4 个已配置角色组成无顺序语义的队伍，再自由选择其中任意成员和目标指标；
- 手动配置角色、导入 JSON、通过 Enka.Network 导入游戏展示柜，并用邀请码隔离和同步个人工作空间；
- 计算直伤、增幅、激化、剧变及月曜／星烁反应，应用队伍共鸣、月兆、武器、圣遗物、命座和队友效果；
- 展示单段与多段公式轨迹、实际结算属性、有效词条、单词条边际收益以及适用武器的满可达效果比较；
- 角色动作、辅助指标和角色专属效果按角色目录维护，通用计算器只处理类型化的结算阶段。

计算结果仍应视为社区工具推导值。新版本机制、随机动作、时序和未审阅数据可能暂未覆盖；覆盖状态可从
`GET /v1/combat-coverage` 与 `GET /v1/combat-authoring/audit` 查询。

## 仓库结构

```text
apps/
├── api/          Fastify API、邀请码会话、SQLite 工作空间、展示柜导入
├── web/          Next.js 网站
└── mini/         暂停独立功能的 Taro 微信小程序壳
packages/
├── analyzer/     场景编排、效果解析、反事实收益分析
├── calculator/   与角色无关的类型化伤害流水线
├── content/      characters / weapons / artifacts / rules 等语义内容
├── contracts/    TypeBox 请求、响应和领域契约
└── game-data/    固定版本、只读的游戏数据 SQLite 快照
```

角色的动作、固有天赋、命座和辅助指标放在
`packages/content/src/characters/<character>/`。武器与圣遗物效果分别属于 `weapons/` 和 `artifacts/`，队伍规则
属于 `rules/`。`calculator` 不导入任何角色或装备内容。小程序恢复开发前不运行独立计算逻辑。

## Content 声明维护

Content 采用“实体自有声明、构建期静态聚合”：

- 角色目录的 `definition.ts` 维护目录中文名、游戏数据 ID、武器类型和特殊动作展示名，`combat.ts` 维护动作、
  指标和角色效果，有多倍率审阅记录时增加 `evidence.ts`；
- 每个 inventory 中的武器和圣遗物目录都包含 `effects.ts`、`coverage.ts` 和 `index.ts`；没有当前核心动作收益时，
  `effects.ts` 明确导出类型化空数组，原因写在 coverage 条款中；
- `packages/content/src/registry/*.generated.ts` 由工具生成，禁止手工编辑，运行时只使用这些静态 import，不扫描目录。

新增或移动 Content 实体后运行：

```bash
pnpm --filter @gscombat/content registries:generate
pnpm --filter @gscombat/content registries:check
```

Content 的 `build`、`test` 和 `typecheck` 都会先执行新鲜度检查，陈旧或缺失的生成注册表会直接失败。完整决策见
[ADR 0015](docs/adr/0015-generate-content-registries-from-entity-owned-declarations.md)。

## 本地开发

要求 Node.js 22+、pnpm 11.15.1。首次安装：

```bash
pnpm install --frozen-lockfile
pnpm build
```

创建本地持久化工作空间和测试邀请码：

```bash
mkdir -p runtime/workspace
export WORKSPACE_DATA_PATH="$PWD/runtime/workspace/workspaces.sqlite"
export INVITE_TOKEN_SECRET="replace-with-at-least-32-random-characters"
pnpm --filter @gscombat/api invite -- create local
```

保留上述环境变量，在两个终端分别启动 API 与网站：

```bash
pnpm --filter @gscombat/api dev
pnpm --filter @gscombat/web dev
```

访问 `http://127.0.0.1:3200`，使用上一步只显示一次的邀请码登录。网站通过
`/api/backend/*` 代理到默认的 `http://127.0.0.1:3001`；可用 `API_BASE_URL` 覆盖。

## 验证

```bash
pnpm typecheck
pnpm test
pnpm build
```

项目重点使用真实包边界、SQLite、HTTP 路由与完整场景的集成测试。针对角色内容的测试主要验证它能通过
通用流水线真实注入，而不是复制一份角色公式实现。

## 数据更新

运行时不向静态游戏数据 API 发请求。`@gscombat/game-data` 使用固定上游提交、SHA-256 校验和只读 SQLite
快照；展示柜导入是独立的可选适配器。更新流程见 [game-data 说明](packages/game-data/README.md)。

## 部署

IP 直连的 Docker Compose 流程见 [腾讯云部署说明](docs/deployment/tencent-cloud.md)。生产环境必须自行配置
强随机 `INVITE_TOKEN_SECRET`，并备份 `runtime/workspace/workspaces.sqlite`。当前邀请码既是登录凭据，也是
工作空间隔离标识，不应在正式环境公开。

## 许可证与声明

本项目原创代码按 [GNU Affero General Public License v3.0](LICENSE) 发布。通过网络向用户提供修改版服务时，
AGPL-3.0 要求向该服务用户提供对应源代码。第三方数据、图片、游戏文本、商标和依赖仍遵循各自权利与许可，
不因本仓库许可证而重新授权。

本项目是非官方社区项目，与米哈游／HoYoverse 无隶属或认可关系。“原神”、角色、武器、圣遗物、图像和
相关素材的权利归其各自权利人所有。完整资料来源、固定版本、使用方式和致谢见
[外部资料与致谢](docs/third-party-sources.md)。
