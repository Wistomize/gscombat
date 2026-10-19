## Why

ARCH-013 已确认：非法前台、错选指标等请求错误混入 500；部分路径临时附加 statusCode，又与共享错误响应不一致。
内部异常和套装候选失败缺少可关联、不会泄露用户配置的诊断，用户和维护者都难以分清输入问题与引擎问题。

## What Changes

- 将明确由调用输入导致的错误标为类型化领域错误；API 映射为 400，场景/计算版本冲突为 409。
- 领域层不再附加 HTTP statusCode；声明错误、固定数据缺失、计算不变量破坏继续作为内部故障，不一律降为 400。
- API 统一异常响应为既有 `{ code, message }`，保留已经发布的会话/工作区错误码及资源限制语义。
- 内部 500 只给通用提示，通过响应请求标识与脱敏日志关联；套装候选失败仍返回不完整结果，而不冒充零收益或吞掉诊断。
- 展示柜网络/HTTP/无效外部响应作为可识别的上游失败，不把正常不支持角色跳过处理改成整批失败。
- Web 仅补齐辅助指标的错误 message 展示，已有伤害、装备与展示柜错误消费不重构。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `architecture/public-entrypoints`：补统一错误响应、请求标识、领域/API 错误边界及脱敏诊断行为。
- `analysis/core-action-results`：明确输入错误、版本冲突、部分候选失败和取消对现有报告的影响。

## Impact

- 触发条件：HTTP 错误行为与兼容承诺变化，涉及 `packages/analyzer`、`apps/api`、`apps/web` 三个工作区。
- 复用 Contracts 现有 ApiErrorResponseSchema，不迁移其文件或修改成功响应/保存配置形状。
- **BREAKING**：过去误报为 500 的非法输入改为 400；请求/计算版本冲突为 409；默认框架错误体统一为 `{ code, message }`。
- **BREAKING**：Analyzer 请求错误不再附带 HTTP statusCode；库调用方按导出的领域错误类型/code 识别，原有可读说明保留。
- 已发布会话/工作区 401/409/429 的 code/message 及成功响应保持兼容；不改变计算结果、候选排名、触发规则或权限。
- 无数据库迁移、密钥变更、新依赖或服务；保留已完成的 ARCH-015 工作区修改。
- 非目标：缓存/准入优化 ARCH-014、全仓错误框架、Catalog/Contracts 结构重构、日志平台、自动重试、线程池及部署。
