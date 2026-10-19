## Why

ARCH-007 中，API 与 Web 分别维护同一份约 105 行的 Catalog 投影，容易漏字段或发生展示规则漂移。
真实 HTTP 核对还发现：行秋已有的“5 剑需要 C6”参数声明在响应序列化时被过滤，单纯合并两份代码无法解决这个遗漏。

## What Changes

- 将既有 Catalog 响应整理收口到 Content 一个纯投影函数，API/Web 使用同一来源；原适配入口和 Content 根导出保持兼容。
- 提供明确的 Content Catalog 子入口；投影在服务端/构建阶段运行，浏览器继续接收可序列化目录，不接收完整战斗声明。
- 在共享动作参数响应契约中补齐可选 `minimumSourceConstellationByValue`，保留已声明的按参数值命座门槛。
  不新增角色规则：行秋 5 剑的 C6 校验已经存在于内核。
- 对真实 HTTP 输出、页面目录和共享投影做一致性验证，覆盖嵌套参数、辅助条件、装备条件与返回对象隔离。
- 增加针对客户端运行时依赖的局部守卫，并核对生产产物；不将仅出现 Schema 字段名误报为完整战斗声明泄漏。
- 仅上述可选元数据是公开响应的增量变化；其余为保持行为的结构收口，不改变计算、筛选、排序或默认值。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `architecture/public-entrypoints`：公开动作参数元数据保留已声明的按值命座限制，并保持未声明该限制时的兼容形状。

## Impact

- OpenSpec 触发：新增架构边界、HTTP/TypeBox 响应契约增量，且跨 `packages/content`、`packages/contracts`、
  `apps/api`、`apps/web` 四个工作区。因此本项不设置 skip_specs；规格仅描述元数据行为变化，不把搬文件写成行为要求。
- Content 增加单一响应投影与子入口，Contracts 补齐已有声明字段，API/Web 的重复投影改为薄适配；详见后续设计。
- 兼容性：保留角色/指标/装备 ID、中文标签、目录顺序、可选字段省略规则、原 Content 根导出与两应用的适配入口。
  旧调用方不必提供新字段；响应只在实际声明门槛时增加该字段。共享 Schema 的其他响应消费者也需核对。
- 不新增依赖、包、数据库、网络请求、持久化格式、生成展示快照或服务端长期缓存；不改变邀请码、鉴权或部署配置。
- 不重写角色/武器/套装声明，不改伤害公式和 Analyzer 门槛，不将 Web 改成启动时请求 Catalog API。
- 不混入 ARCH-008 的 Contracts 拆分、ARCH-010 全仓守卫、ARCH-014 准入/缓存或 ARCH-019 主规格同步；
  保留现有 ARCH-013/015 未提交改动，本项不提交、推送、部署或归档。
