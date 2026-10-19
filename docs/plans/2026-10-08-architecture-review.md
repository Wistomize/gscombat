# GSCombat 架构复审与当前问题台账

审查日期：2026-10-08。代码基线：`496e16c`，`main`，游戏数据 7.1。
本轮只更新文档，不修改公式、接口、数据或部署。

后续修复状态更新：2026-10-19。原审查证据保留；ARCH-015、ARCH-013、ARCH-007 已在本地实施并验证，尚未提交/部署。

## 1. 结论与证据范围

模块化单体的分工仍成立：Calculator 提供纯公式，Content 声明实体规则，Analyzer 编排求值，
API 提供资源与调度，Web 管理用户交互。没有发现生产包依赖环、跨工作区源码路径导入，或重新出现的
Foundation 示例计算链路。伤害公式分支、辅助公式和兼容 HTTP 入口不能据数量认定为平行计算模型。

风险集中在职责重新聚集、上下文手工传递、入口错误处理、资源预算和文档状态漂移。
其中生产启动保护与 HTTP 错误分类已有最小复现；其他条目区分静态事实与风险，不将架构审查当作
全角色数值正确性认证，也不将存在测试等同于已经覆盖全部机制。

方法：CodeGraph 上下文与源码检查、工作区清单及 TypeScript AST 导入检查、既有包测试和
使用真实 `buildApp` 的内存实例。没有读取线上用户数据或修改生产配置。

## 2. 与旧台账的关系

[2026-08-06 台账](2026-08-06-architecture-debt-audit.md)保留 ARCH-001–010 的历史执行记录。
从本次复审起，本文是当前问题清单；已完成历史重构不因新增长点被整体撤销。
现状总览见[中文架构](../architecture.md)与[英文架构](../architecture.en.md)。

ARCH-001–006、009 的既有收口仍有效。ARCH-007 已本地修复，ARCH-008 继续待处理；ARCH-010 已有局部守卫，
本次补齐架构文档，但仓库级守卫及持续验证仍未闭环。新增问题沿用编号，不改写历史证据。

| ID | 优先级 | 状态 | 当前问题 |
|---|---|---|---|
| ARCH-007 | P1 | 已本地修复，未部署 | 共享 Catalog 投影和子入口、真实响应与客户端边界校验已收口；旧根导出兼容保留 |
| ARCH-008 | P2 | 部分整理 | Contracts 已分资源，但分析、轨迹和覆盖 Schema 仍聚集 |
| ARCH-010 | P1 | 部分完成 | 局部守卫与本次架构文档已有；全仓依赖守卫、CI、生成资产门禁不足 |
| ARCH-011 | P1 | 待处理 | Analyzer 手写热点再次增长，属性准备、事件编译与公式适配耦合 |
| ARCH-012 | P1 | 待处理 | 伤害/辅助/来源/贡献者上下文分散组装，属性转换顺序依赖手工参数 |
| ARCH-013 | P1 | 已本地修复，未部署 | 类型化输入/HTTP 映射、部分失败与脱敏诊断已收口，原始发现保留于下文 |
| ARCH-014 | P1 | 待处理 | 比较预算未覆盖全部工作，缓存内存口径不完整，其他 Map 无总量上限 |
| ARCH-015 | P1 | 已本地修复，未部署 | 生产启动配置和失败清理已收口，原始发现保留于下文 |
| ARCH-016 | P2 | 待处理 | 增量更新依赖旧评估工具，版本发布与校验身份缺少统一描述 |
| ARCH-017 | P2 | 待处理 | Content 作者类型集中、部分合法组合依赖运行时检查；测试布局不统一 |
| ARCH-018 | P2 | 已复现，待明确 | Node 版本范围与 Web 测试环境兼容性没有收口 |
| ARCH-019 | P2 | 待整理 | 规格、ADR、历史计划与实际发布状态不一致 |

P1 表示优先处理的可靠性/维护风险；不代表本次已经证明所有相关场景数值错误。

## 3. 逐项发现与修复建议

### ARCH-007：Catalog 与公开导出

证据：[API 投影](../../apps/api/src/serializers/catalog.ts)和[Web 投影](../../apps/web/lib/catalog.ts)
分别复制角色参数、辅助条件、武器选项与套装条件，新增字段需要修改两处。
Content 只有根入口、authoring-catalog 与 weapon-names 等有限子入口，根入口同时导出目录和战斗声明。

风险：两端漏字段、默认条件漂移；浏览器消费者更容易误引入完整内容图。
没有仅凭 barrel 导入断言当前浏览器包大小再次异常。

建议：建立一个纯 Catalog 投影来源，提供明确的展示入口，API/Web 复用。
保留已发布字段与根导出兼容性；是否新增生成展示快照应以依赖和构建产物验证决定。
验收：两端 Catalog 深比较一致、条件投影一致，并检查客户端产物不含计算声明。

2026-10-19：按已批准方案完成共享 Content 投影、两端薄适配与参数契约补齐。
真实 HTTP 曾过滤行秋 5 剑所需的 C6 门槛；现与 Web 目录完整一致，内核规则和数值不变。
客户端传递依赖守卫通过，生产 JS 未命中检查的 1,544 个战斗效果 ID。根导出兼容保留，
未引入生成快照、新包或运行时请求。根类型检查、测试、构建通过；详见
[实施记录](../../openspec/changes/unify-catalog-projection/implementation-progress.md)与
[ADR-0026](../adr/0026-share-server-side-catalog-projection.md)。未提交、推送、部署或归档。

### ARCH-008：Contracts 资源边界

证据：已有独立 builds、scenarios、workspace、support-metrics、equipment-comparison 文件；
[analysis.ts](../../packages/contracts/src/analysis.ts)仍为 709 行，[combat-coverage.ts](../../packages/contracts/src/combat-coverage.ts)为 476 行。

建议：按报告结果、公式轨迹、分析请求/响应与覆盖资源拆分内聚单元，原入口继续导出。
不为了缩短文件拆散递归 Schema；保持 Schema ID、可选字段和旧请求兼容。
验收：现有契约测试与 API 序列化结果保持一致。

### ARCH-010：守卫的真实覆盖范围

证据：API、Web、Analyzer 均有 `test/system/layer-boundary.test.ts`，已检查各自局部依赖环、
测试归属、部分导入方向、组合根和组件体积；Analyzer 有具体角色 ID 白名单检查。
Content 构建/测试/类型检查会验证八份生成注册表。

缺口：没有 `.github/` CI；没有统一的全工作区依赖方向守卫；局部守卫多用正则匹配导入，
不能当成完整 AST 语义验证；API 路由清单仍只列较早的 16 个入口。
展示柜元数据和图标的新鲜度没有一个统一版本发布门禁。

建议：复用已有测试，不新增第二套架构框架；集中建立包依赖与公开入口检查，覆盖新增比较路由，
把必需生成资产检查接入实际持续验证。必要时用 TypeScript AST 替换脆弱的正则。
本次文档刷新只完成说明部分，不把上述缺口勾为已修复。

### ARCH-011：Analyzer 热点重新膨胀

证据：`evaluators/shared.ts` 1731 行、`effects/action-effects.ts` 1029 行、`evaluators/direct.ts` 898 行、
`metrics/runtime.ts` 700 行、`evaluators/source-stats.ts` 592 行，均为手写文件。
Web 的计算 Controller 已接近 500 行守卫（493 行）；大生成文件不在此问题范围。

`shared.ts` 同时承担声明校验、倍率与属性准备、来源面板、事件编译和轨迹适配。
现有目录分层有效，但文件职责已经再次聚集；只搬文件不会解决耦合。

建议：先冻结代表场景的完整输出，再按来源属性、动作编译、事件属性和轨迹投影拆分内部职责。
保留 public facade；不同时修改机制。Web 只抽取新增请求与场景协调职责，不另建全局状态系统。
验收：完整报告差分一致，普通/特殊反应、辅助和装备反事实均通过现有集成切片。

### ARCH-012：上下文与属性依赖需要明确契约

证据：[FieldContext](../../packages/analyzer/src/core/field-presence.ts)已经区分实际前台、动作来源、
取面板站位和未知状态；[resolveScenarioActionEffectContext](../../packages/analyzer/src/evaluators/shared.ts)
按明确顺序求来源生命、攻击、分享前/后精通和防御。
伤害入口、辅助入口与来源快照仍分别组装部分敌人状态、选择和来源 Map。

风险：新增字段传递遗漏，贡献者被错误提升为前台，读取转换前后错误快照，或把已经分享的精通再次分享。
7.1 曾需要补传来源生命 Map，说明依赖并不自动由类型保证；本次没有再宣称发现某个具体角色遗漏。

建议：收口一个不可变的求值上下文构造入口，区分固定场景事实、来源、受益者和准备状态。
为属性阶段使用明确快照名称/类型与统一顺序；保留现有有限步骤，不引入通用实时状态机。
伤害与辅助可以使用不同公式，但事实与效果资格必须经同一组受控适配器传递。
验收：前后台互斥、未知前台、多人贡献、冻结、来源生命转攻击和精通分享各一组真实集成正反例。

### ARCH-013：领域输入错误和诊断

复现：把内置场景 `onFieldBuildId` 改为非队员，`/v1/analysis` 与 `/v1/analysis/core` 均返回
`500: 前台角色必须是当前队伍成员`。TypeBox 只能证明结构合法，不能证明队伍/指标/条件关系合法。
多个领域检查直接抛 `Error`，部分路由另用带 `statusCode` 的对象；默认错误与 `ApiErrorResponseSchema`
也不是同一形状。`buildApp` 关闭 logger，套装候选失败又只返回通用提示，诊断信息难以关联。

建议：定义有限的输入、冲突、上游、预算和内部错误类别，由 API 统一映射状态码与公开响应。
先覆盖现有入口，不把内部异常全部改成 400；给内部失败增加请求/候选关联日志，避免记录邀请码与整份用户配置。
验收：结构错误、非法前台、低命座指标、过期 computationId、候选失败和取消各有明确预期。

2026-10-19：已核对真实抛错与路由，方案见
[normalize-api-domain-errors](../../openspec/changes/normalize-api-domain-errors/proposal.md)，
具体边界及文件变化见[设计](../../openspec/changes/normalize-api-domain-errors/design.md)。
已完成本地实现与验收，详见[实施记录](../../openspec/changes/normalize-api-domain-errors/implementation-progress.md)及
[ADR-0025](../adr/0025-separate-domain-input-errors-from-http-failures.md)。Analyzer/API/Web 共 845 项测试及根类型检查/构建通过。
错误输入不再混为 500，内部错误仍为 500；未改伤害公式、用户库、成功响应或比较限额。未提交或部署，ARCH-014 仍待处理。

### ARCH-014：有界调度不能等同于全服务资源有界

证据：[比较服务](../../apps/api/src/services/equipment-comparison.ts)在入队前创建
`EquipmentComparisonSession` 并同步算基准；队列预算不覆盖这一步。核心分析与兼容完整分析也同步执行。
[调度器](../../apps/api/src/services/comparison-scheduler.ts)每批最多四个 yield、约 20ms，
单候选不可抢占，任务总预算 60s、最多 16 个不同任务。

缓存估算只序列化场景、结果、核心报告和候选结果，再乘二；不涵盖全部 preparation/WeakMap 状态、
索引与队列引用。被缓存淘汰的 Entry 仍可能被活跃任务持有，因此 32MiB 是估算目标，不是进程硬上限。
[Enka 缓存](../../apps/api/src/services/showcase/client.ts)按 UID 保存 TTL，但无总量上限或全量过期清理；
登录失败 Map 也只在再次访问同一个 key 时清理。

建议：明确预算覆盖范围，先做准入再建立昂贵会话，限制选项历史和非比较缓存总量。
补充任务数、活跃会话数、候选耗时及事件循环延迟观测；容量验证应包含多人同时提交不同场景。
继续保留单线程协作式批次；是否需要线程池须由单候选阻塞实测决定，不能自动进入本次整改。
验收：超载拒绝不先执行基准、断连后无无主任务、活跃/缓存引用有可解释上界，健康接口延迟可测。

### ARCH-015：生产启动必须明确持久化与密钥来源

复现：[buildApp](../../apps/api/src/app.ts)在 `NODE_ENV=production`、没有 `INVITE_TOKEN_SECRET`、
没有 `WORKSPACE_DATA_PATH` 的内存测试进程中仍能 ready。
开发默认密钥超过长度检查阈值，因此当前长度检查无法阻止回退；工作区路径回退为 `:memory:`。

这是错误部署配置下的保护缺口，不是已证明当前腾讯云使用开发密钥；Compose 已显式要求密钥并挂载持久库。

建议：生产必须提供显式密钥和持久工作区路径，缺失时在打开服务前拒绝启动；
开发/测试的默认行为继续明确保留。核对资源初始化失败时的关闭顺序。
验收：生产缺密钥、短密钥、缺持久路径均拒绝，完整生产配置可以 ready，关闭释放资源。
此项改变安全/启动规则，实施前需单独 OpenSpec，不混入纯目录重构。

2026-10-19：复核后按
[harden-production-api-startup](../../openspec/changes/harden-production-api-startup/proposal.md)，
经用户确认实施，主要文件与取舍见[设计](../../openspec/changes/harden-production-api-startup/design.md)。
已前置校验生产显式配置，API/管理命令共用规则，补齐构造/监听失败清理；不改变有效密钥、凭据算法或用户库。
API 185 项测试、类型检查与构建通过，具体证据见
[实施记录](../../openspec/changes/harden-production-api-startup/implementation-progress.md)。未提交、推送、部署或归档。

### ARCH-016：版本增量维护与发布身份

证据：7.1 更新器保留自己的 SQLite 并增量加行，符合用户已定方向；
[update-7.1.ts](../../packages/game-data/tools/update-7.1.ts)却依赖 `tools/genshin-db/input.ts`、`normalize.ts`
以及带 evaluation 名称的全库评估资产。`update-snapshot.ts` 用版本分支分派。

默认版本、Content 展示版本、内置场景、生成清单和图标/展示柜来源分别维护。
7.1 manifest 的 `dataSha256` 是 provenance 对象的紧凑 JSON 哈希，既不是 SQLite 文件哈希，
也不是格式化 provenance 文件的字节哈希；Repository 启动只打开只读库，没有校验三者一致。

建议：把增量导入需要的共用输入工具从评估试验职责中收口，保持逐版本清单与来源证据。
明确 provenance、源文件和发布 SQLite 摘要各自的名称、生成方式及验证时机，建立一个版本一致性检查。
不继续全库重映射，不静默改历史参数；是否补 artifact hash 属于后续数据契约设计。
验收：离线复建增量、旧行保留、来源校验和一处版本发布检查；失败不替换正式快照。

### ARCH-017：作者模型和测试归属

证据：`content/src/combat/types.ts` 1296 行；大量能力、倍率、事件与激活类型集中。
`CombatActionMetadata` 的 evaluator、damageParts、timeline 与 reaction 字段有可选组合，
不少非法组合靠 registry integrity 和运行时检查拒绝，尚非由类型穷尽表达。
Content、Calculator、Contracts、Game-data 仍有 `src` 内测试；API/Web/Analyzer 为包根 `test`。

建议：按动作、指标、效果值、资格和事件分组类型，继续由原作者入口导出；
对于高风险公式分支，逐步提升判别联合约束，保留跨引用的运行时守卫。
统一测试目录是可选的结构工作，不以搬测试替代语义覆盖，不在同批顺带重写实体规则。

### ARCH-018：运行版本与验证可复现性

证据：根 `engines.node` 为 `>=22.0.0`，Docker 使用 Node 22；本机已为 Node 26.10.0。
普通 Web 测试在 Node 26 的全局 Web Storage 下失败 20 项，错误为缺失 `localStorage`；
设置 `NODE_OPTIONS=--no-experimental-webstorage` 后完整 44 项通过。

建议：明确用于开发、门禁和发布的 Node 主版本，测试环境独立安装浏览器存储，或采用已验证的启动选项。
本次只记录复现及临时命令，不擅自提高生产 Node 版本，不把测试环境错误当作线上浏览器故障。
验收：声明支持的环境中，相同命令稳定通过；CI 与镜像主版本一致。

### ARCH-019：状态与规格漂移

证据：不少已发布变更仍保留“未实施/未部署”阶段记录；审查基线的 ADR-0024 仍写实施中，本次已纠正已核实的实现状态。
主规格 `architecture/public-entrypoints` 仍将 `/v1/analysis` 写为唯一 HTTP 伤害入口，
实际已有复用正式引擎的 core、weapons、artifact-loadouts；这些新入口不是示例模型回流。
旧全库候选映射项目仍处于进行中，而 7.1 已采用增量方案；C6 旧项目也未整体验收。

建议：阶段记录保留日期及阶段身份，补独立交付记录；核对后同步必要 delta specs，
被增量策略取代的计划明确停止方向。不要根据一次全测通过批量勾完命座任务，也不自动归档所有 changes。
本次只刷新架构文档、历史台账导航与已能核实的 ADR 状态；规格同步/计划收口另行完成。

## 4. 建议实施顺序

1. 先处理 ARCH-015 生产启动保护、ARCH-013 错误契约；分别是行为变更，需明确方案与 OpenSpec。
2. 再处理 ARCH-007 Catalog 收口，并补对应版本/投影一致性守卫（ARCH-010）。
3. 单独处理 ARCH-014 准入与缓存上界，不与公式或线程池改造混合。
4. 用完整输出差分保障 ARCH-011/012 的属性上下文收口和内部拆分；优先现有集成场景。
5. 整理 ARCH-016/017/008 的数据工具与作者类型，最后补齐 ARCH-018/019 的持续验证和文档状态。

每项修复均需保留用户配置、效果 ID、反事实与基准一致性。小程序暂无实现消费者，不为了它提前增加多余包。
本顺序为审查建议；ARCH-015、ARCH-013、ARCH-007 已完成本地修复，其余项尚未实施。

## 5. 本轮验证

- TypeScript AST 扫描当前生产文件：未发现跨工作区 `src` 路径导入；包 manifest 依赖方向无环。
- API：20 个文件、176 项通过，包括现有架构守卫。
- Analyzer：71 个文件、608 项通过，包括现有架构守卫。
- Web：在 `NODE_OPTIONS=--no-experimental-webstorage` 下 10 个文件、44 项通过；普通 Node 26 环境失败原因单列于 ARCH-018。
- 真实 Fastify 内存注入确认 ARCH-013；生产环境变量隔离的内存实例确认 ARCH-015。
- 本次未改代码，仅文档，因此没有重复全仓构建、数据生成或大规模角色数值测试；通过测试不构成全角色机制完备性证明。
- 文档链接与 Git 空白检查在交付前核验。没有提交、推送或部署。

包测试复验命令（不修改数据或用户工作区）：

```sh
pnpm --filter @gscombat/api test
pnpm --filter @gscombat/analyzer test
NODE_OPTIONS=--no-experimental-webstorage pnpm --filter @gscombat/web test
git diff --check
```

这些命令对应测试范围；ARCH-013/015 的最小注入复现另外使用真实 `buildApp` 与内存工作区，
不连接生产服务器。此次额外核对正式 7.1 SQLite 计数为 121 名角色、253 把武器、63 套圣遗物，
纠正 README 中残留的 7.0 展示信息。上述为最初只刷新文档时的验证；后续 ARCH-015/013 的运行代码修复与验收
分别记录于对应实施记录，不能将最初的文档范围描述当作当前全部改动。
