## Context

动机见 [proposal.md](proposal.md)，行为增量见[公开入口 delta](specs/architecture/public-entrypoints/spec.md)。
本项为 ARCH-007；现有 ARCH-013/015 改动完整保留，不据此同步或归档其他 change。

已核对的边界：

- `packages/content/src/catalog/index.ts` 从实体展示、已验证指标和装备发布清单产生展示模型。
- API `serializers/catalog.ts` 与 Web `lib/catalog.ts` 再分别复制参数、辅助条件、武器策略和环境条件，
  两份约 105 行的投影对象深比较相等。
- 实际 GET `/v1/catalog` 与 JSON 化的 Web 目录只差行秋一个参数的 `minimumSourceConstellationByValue`：
  该字段存在于 Content 类型，但缺于共享参数 Schema，被响应序列化过滤。当前核对的 HTTP 体 149,960 字节，
  Web 目录 150,041 字节；121 个角色、242 把已发布武器、63 套圣遗物、1 组食物预设。
  武器目录是已发布清单，不等于 SQLite 的全部武器计数，不能因数量不同擅自补全。
- 两个 Next 页面在服务端/构建阶段读取目录，再向客户端组件传入 props；不是浏览器启动时请求 Catalog API。
- 现有构建产物抽查未找到选取的角色效果声明标识；`parameterReferences` 命中来自共享 Schema，
  不能仅按该字段名断言完整战斗声明泄漏。抽查不是完整依赖边界证明。

遵循 [ADR-0015](../../../docs/adr/0015-generate-content-registries-from-entity-owned-declarations.md) 的实体自有来源，
保留 [ADR-0018](../../../docs/adr/0018-compose-api-from-resource-route-modules.md) 的 API 薄资源适配。
长期取舍见 [ADR-0026](../../../docs/adr/0026-share-server-side-catalog-projection.md)：共享投影归属、服务端边界和旧入口兼容。

## Goals / Non-Goals

**Goals:**

- 一份纯投影，稳定保留已发布目录及嵌套元数据；补齐已确认的唯一字段遗漏。
- 实际接口输出、Web 目录与共享投影一致，不止比较两个序列化前的对象。
- 防止调用方修改返回值污染 Content 或下一次响应；不引入跨请求可变目录单例。
- 清楚区分“给用户看的数据”与“可以在浏览器执行的模块”。

**Non-Goals:**

- 不重新划分角色/装备目录、Contracts 资源文件或全部 Content exports。
- 不改已验证指标的筛选、标签、顺序、默认 Buff、公式和命座校验，不增加逐角色手工映射。
- 不新建 package、生成展示快照、运行时扫描、HTTP 请求、额外依赖或缓存；不恢复小程序功能。
- 不改图片、静态游戏库、用户库、鉴权、部署配置、队列和性能预算。

## Decisions

### 1. 展示投影归 Content，响应契约归 Contracts

新增 `packages/content/src/catalog/response.ts`，提供 `createCatalogResponse(): CatalogResponse`。
复用既有 `supportedCharacters`、已发布装备/食物清单与声明导出的环境条件，不复制角色语义。
该模块只做确定性的对象映射与复制，无文件系统、HTTP 或 SQLite 依赖。

依赖方向保持 `API/Web → Content → Contracts`：Content 内使用响应类型和既有内部模块，
不从自己的根 barrel 导入，不导入 Analyzer、API、Web 或 Game-data。
不放进 Contracts（否则协议包反向依赖内容），不放进 API（否则 Web 需跨应用导入）。
当前已有的 Catalog 语义投影继续存在；本次收口的是应用层重复的响应整理，不建立第二套角色目录。

### 2. 增量子入口，不破坏旧入口

在 Content package exports 增加 `./catalog`，由现有 `src/catalog.ts` 暴露原 Catalog 查询/类型及新工厂。
其定位明确为服务端/构建时入口：内部生成目录仍会读取完整内容图，不因改名就声称整个模块可在浏览器执行。
原 Content 根导出继续兼容，`authoring-catalog`、`weapon-names` 不改。

API `serializeCatalogResponse` 保持名称和签名，内部调用工厂；Web `webCatalog` 保持原导出，
由工厂初始化，Next 页面和组件 props 无须改接 API。两文件只做薄适配，不保留另一份映射。
不新增运行时只读冻结要求，不迫使现有 UI 消费者更改类型。

### 3. 嵌套复制与契约补齐一次完成

共享投影显式处理响应所需结构，保持既有可选字段省略和数组顺序；提取一个小的参数复制助手，
由伤害动作和辅助指标复用。复制 `allowedValues`、`maximumValueByParameter.values`、
`rangeBySourceConstellation`、`minimumSourceConstellationByValue`，以及 tracePresentation、
辅助条件、武器精炼数组和食物 Buff 对象，不使用不安全类型断言掩盖 readonly/mutable 差异。
每次工厂调用产生与源声明及其他调用不共享可变嵌套对象的结果；Web 的模块级值仅保留既有用法。

在 `packages/contracts/src/combat-coverage.ts` 的既有整数动作参数 Schema 增加可选
`minimumSourceConstellationByValue`，列表非空、value 为整数、命座为 1–6。
不收紧其他既有字段，不重复定义新的参数 Schema；Catalog 与覆盖报告等复用者统一获得这个字段。
API `serializers/combat-coverage.ts` 已通过 rest 保留该字段，但新增 Schema 后需核对其 readonly/mutable
类型边界；如需调整，仅补这一数组的逐项复制，不趁机统一整个覆盖报告序列化器。
不以响应元数据替代 Analyzer 的权威检查，也不在 UI 再写行秋专属判断。

### 4. 按三层输出验证，而非相同函数互相证明

实施前记录当前工作树的两份目录、真实 HTTP 目录及差异，而不是用未含 ARCH-013/015 的旧 HEAD 作基线。
临时基线不进入 Git、不含用户配置，不保留第二份生产投影或大型目录副本。

- Content：当前实体声明与共享投影的 ID/顺序/完整参数一致，嵌套修改不会污染源或其他调用。
- API：真实 buildApp 的 GET JSON 深等于共享投影的 JSON；同时独立断言行秋限制、辅助条件、
  武器/套装条件和缺省省略，防止“工厂同错、测试同错”。覆盖报告的同类字段也验证无二次过滤。
- Web：`webCatalog` 深等于共享投影；沿用完整配置/计算工作空间测试，不从 Web 测试跨应用导入 API 源码。

上述两条等式共同证明 API/Web 一致；不需要新增跨应用生产依赖。
全目录差分仅允许 HTTP/覆盖响应补入已存在的命座门槛；不改数值期望来接受无关变化。

### 5. 用客户端实际依赖图约束入口，不盲目生成快照

扩展既有 Web `test/system/layer-boundary.test.ts`，从 `use client` 模块出发检查传递的本地运行时依赖，
区分 type-only import/export，覆盖现有导入和重导出方式；必要时使用已安装 TypeScript 的 AST，
不引入新架构框架。禁止该图引入 Content 根/Catalog 运行时入口、Analyzer 或 Game-data。
不禁止服务端页面和工具使用 Content，不把合法 Contracts/Calculator 或真正窄的展示子模块一概封禁。

生产构建后核对客户端 JS：使用实际战斗声明的明确标识，并分辨 Schema/普通文案命中，
不能以字段字符串或 source map 命中作为唯一结论。继续保持已有 Catalog 300,000 字节预算，
不通过删除目录或参数缩减体积。若出现实质包体回退，先定位依赖，不能擅自改用生成快照或远程拉取。

### 6. 文件和阶段

| 阶段 | 主要文件 | 完成条件 |
|---|---|---|
| 基线与契约 | Contracts `combat-coverage.ts`、必要的 API `serializers/combat-coverage.ts` 参数复制、契约/API 用例 | 可选字段不丢失，旧参数形状兼容 |
| 单一投影 | Content `catalog/response.ts`、`catalog.ts`、package exports、相关测试 | 完整投影、根入口兼容、嵌套数据隔离 |
| 双端接入 | API `serializers/catalog.ts`、Web `lib/catalog.ts` 及既有测试 | 重复映射消失，真实三层输出一致 |
| 边界与交付 | Web 现有架构守卫、顺序 ADR、中英架构/开发说明、ARCH-007 台账 | 客户端不引入战斗声明，完整门禁和差分通过 |

## Risks / Trade-offs

- [以为两个对象相等就等于接口相等] → 必须经过真实响应 Schema 序列化再比较。
- [元数据新增字段意外扩散到其他响应] → 盘点同一参数 Schema 消费者，区分预期补齐与无关变化。
- [嵌套数组浅复制导致污染] → 修改代表性嵌套字段后验证源声明和下一份结果不变；不增加新缓存。
- [专用入口被误称浏览器安全] → 文档标明构造端边界，检查传递客户端依赖及生产产物。
- [守卫误封类型导入或把 Schema 当效果] → 明确区分类型/运行时依赖和声明标识，不全局禁止 Content 工具导入。
- [保留根导出意味着导出面仍大] → 本项提供窄入口并迁移 Catalog 消费者，不以破坏兼容强制收缩所有调用方。

## Migration Plan

先冻结当前输出及唯一已知差异，再补 Schema、实现共享投影、接入两端、加边界验收，最后更新状态。
不需数据库、用户配置、会话或部署迁移。回滚仅涉及代码和可选响应字段，不撤回其他已完成修复。
用户已明确批准实施，验收见 [implementation-progress.md](implementation-progress.md)；未授权不提交、推送、部署或归档。
