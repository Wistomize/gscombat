# ADR-0026：共享服务端 Catalog 投影

- 日期：2026-10-19
- 状态：Accepted；本地实施，未部署
- 变更：[unify-catalog-projection](../../openspec/changes/unify-catalog-projection/design.md)
- 延续：[ADR-0015](0015-generate-content-registries-from-entity-owned-declarations.md)、[ADR-0018](0018-compose-api-from-resource-route-modules.md)

## 背景

Catalog 是可选角色、指标、装备、参数与条件的展示目录，不是游戏数据库、玩家配置或第二套计算逻辑。
Content 已有实体语义到展示模型的转换，但 API/Web 又各自维护约 105 行相同的响应整理。
真实 HTTP 仍会经过响应 Schema，两个投影对象相等不能证明公开结果相等。

## 决策

- Content `catalog/response.ts` 独占 Catalog 响应投影，通过 `@gscombat/content/catalog` 暴露工厂。
  API 的序列化函数和 Web 的目录常量保留为薄适配。原根导出与其他子入口继续兼容。
- 工厂只整理既有展示模型及条件声明，响应类型归 Contracts；不把 Content 查询放入 Contracts，
  不让 Web 依赖 API 源码，不新建共享包或复制实体规则。
- 工厂在服务端/构建阶段执行。新子入口的公开符号较窄，但构造目录仍读取完整 Content 图，
  不宣称其模块可在浏览器运行。Next 继续传递序列化 props，不增加目录网络请求或生成快照。
- 复制所有可变嵌套对象；一次调用的修改不能污染源声明或后续调用。不引入目录缓存和新的冻结协议。
- 既有整数参数 Schema 补齐可选 `minimumSourceConstellationByValue`，保留已声明的按值命座门槛。
  未声明时不补默认值；计算内核的命座检查不变。目录及覆盖报告获得相同的增量字段。
- Content 对照维护声明，API 对照真实序列化响应，Web 对照页面使用的数据，三层共同验证一致性；
  不只测试两个调用同一工厂的函数。全量差分只接受已批准的元数据增量。
- 现有 Web 守卫增加客户端传递运行时依赖检查，排除整句 type-only 导入/导出，识别重导出和字面量动态导入。
  在 verbatimModuleSyntax 下，`import { type X }` 可保留空导入并求值模块，不能当作整句类型导入忽略。
  生产客户端产物另查实际效果标识，不将共享 Schema 字段名或 source map 命中当成完整声明。

## 备选方案

- 继续同步两份映射：没有消除漏字段和维护漂移，拒绝。
- 把映射放进 Contracts 或 API：分别导致底层反向依赖或跨应用耦合，拒绝。
- 让浏览器直接导入 Content 根/Catalog：引入完整声明与启动副作用风险，拒绝。
- 新建生成 JSON 快照或启动时拉取 API：增加发布/新鲜度或网络依赖，当前服务端 props 路径无需这些机制。
- 删除旧根导出：会破坏既有调用方，不在本项实施。

## 后果与验证

目录排序、标签、选择规则与数值公式不变；HTTP/覆盖报告只补回已有门槛，不迁移存档或数据库。
静态依赖守卫不能证明任意运行时拼接路径；本项按当前导入方式检查，并用真实构建产物补充验证。
根导出宽度为兼容保留，不代表所有 Content 消费者均已迁移到窄入口。
具体验收与限制见[实施记录](../../openspec/changes/unify-catalog-projection/implementation-progress.md)。
