## 1. 基线与参数契约

- [x] 1.1 实施前以当前工作树记录 API/Web 两份投影和真实 GET `/v1/catalog` 的完整 JSON、顺序、体积及差异，盘点整数参数 Schema 的响应消费者。验证：只确认现有按值命座限制被 HTTP 过滤，不把已发布武器数与 SQLite 全量数的差别视为缺失；临时基线不提交、不包含用户数据。
- [x] 1.2 为既有整数参数 Schema 补可选 `minimumSourceConstellationByValue`，按设计限定列表和值类型；必要时只补覆盖序列化器该字段的嵌套复制。验证：Contracts 既有契约测试及 API 参数集成覆盖存在/不存在、非法字段类型/命座范围和原参数兼容；Content 行秋声明、Analyzer 校验和伤害公式不改。

## 2. Content 单一投影

- [x] 2.1 新增 `catalog/response.ts` 的纯响应工厂与小型嵌套参数复制助手，复用既有展示模型和条件解析。验证：扩展 Content `catalog.test.ts`，从实体声明独立核对完整动作/辅助参数、装备条件、中文名与顺序；修改返回的门槛数组、tracePresentation、辅助条件、食物 Buff 和精炼列表后，源声明及另一调用结果不变，不保留第二份生产映射。
- [x] 2.2 经现有 `catalog.ts` 和 package exports 增加明确 Catalog 子入口，保留根导出与其他子入口兼容。验证：Content 构建后通过包子入口和旧根实际导入，原查询/类型及新工厂可用、值一致；无内部根 barrel 回导、依赖环、新依赖或生成快照，既有 `registries:check` 通过。

## 3. API 与 Web 接入

- [x] 3.1 API `serializeCatalogResponse` 改为薄适配，保留入口签名，扩展既有真实 buildApp 集成。验证：GET `/v1/catalog` 经 Schema 序列化后的 JSON 深等于共享投影；独立断言行秋 5 剑/C6、辅助条件、武器/套装条件和缺省省略；覆盖报告的同字段不丢失；与 1.1 基线相比只允许增加已有按值命座限制，ARCH-013 错误行为保留。
- [x] 3.2 Web `webCatalog` 改用同一工厂，不改变服务端/构建阶段装配与 props。验证：扩展既有 `catalog.test.ts` 深比较 Web 目录与共享投影，复用 `workspace-flow.test.tsx` 确认角色/指标、辅助参数与武器/套装条件可正常使用；不增加 Catalog 启动请求、不跨应用导入 API 源码、不修改玩家配置或数值期望。

## 4. 浏览器边界与构建输出

- [x] 4.1 扩展 Web 既有架构守卫，从客户端模块检查传递运行时导入/重导出，排除纯类型依赖。验证：代表性间接导入能够被检出，Content 根/Catalog、Analyzer/Game-data 不进入客户端图；合法服务端装配及 Contracts/Calculator 不被误封，不建立新架构框架。
- [x] 4.2 构建后检查客户端 JS 与目录预算，记录明确的战斗声明标识检查和数据大小。验证：保持既有 300,000 字节 Catalog 预算、目录条目和完整元数据；Schema 字段或 source map 命中不被误判为角色声明泄漏；不通过删字段、换远程请求或私加快照规避回退。

## 5. 验收与文档

- [x] 5.1 按依赖顺序构建 Contracts/Content 后运行聚焦契约、Content Catalog、API Catalog/覆盖和 Web 流程/边界测试，再执行根 `pnpm typecheck`、`pnpm test`、`pnpm build`。验证：本机 Node 26 的根测试使用 `NODE_OPTIONS=--no-experimental-webstorage pnpm test`，记录真实结果和既有生成注册表检查；不把旧 dist、缓存测试描述或改变数值期望作为通过依据，不新增逐角色错误矩阵。
- [x] 5.2 新增下一个顺序 ADR，更新 ADR 索引、中英文架构/开发说明、ARCH-007 状态和本 change 实施记录，并在设计中链接实际 ADR。验证：只有前述门禁全部通过才标本地修复；清楚说明单一投影归属、构造端/浏览器边界、根导出兼容及可选元数据增量，其他台账项和旧未提交修改保留。
- [x] 5.3 运行 `openspec validate unify-catalog-projection --strict`、相关文档本地链接检查、`git diff --check` 和最终 diff/status 审查。验证：无新增包/依赖、公式/实体规则/数据库/鉴权/部署改动，基线差分符合范围；无另行授权不提交、推送、部署、同步其他主规格或归档。
