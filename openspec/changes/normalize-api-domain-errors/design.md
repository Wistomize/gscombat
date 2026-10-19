## Context

动机见 [proposal.md](proposal.md)。当前领域校验直接 throw Error，部分 Analyzer 和 API 又附加 statusCode。
API 普通分析/辅助/异步比较没有一致错误响应声明；套装候选捕获异常后只返回通用 failures，logger 关闭。
Web 的伤害/装备/展示柜已读取 message，辅助指标仍仅显示 HTTP 状态。

沿用 [ADR-0014](../../../docs/adr/0014-use-one-authoritative-scenario-metric-evaluation-path.md) 的正式求值链路，
[ADR-0018](../../../docs/adr/0018-compose-api-from-resource-route-modules.md) 的薄组合根。
长期取舍见 [ADR-0025](../../../docs/adr/0025-separate-domain-input-errors-from-http-failures.md)：领域不携带 HTTP、API 有限映射、候选边界与脱敏诊断。
ARCH-015 已完成的改动保留，不覆盖；未同步旧主规格的其他事项仍属于 ARCH-019。

## Goals / Non-Goals

**Goals:**

- 输入错误、版本冲突、资源限制、上游故障、内部错误分类明确，公开响应统一且可诊断。
- 合法请求继续使用同一公式；现有会话/工作区业务错误和成功响应兼容。
- 不将自动生成候选失败错误归责为用户手填错误。
- 用少量真实包边界集成切片验证，而非逐角色复制测试。

**Non-Goals:**

- 不建立新公共错误包、异常继承体系或通用日志平台，不改保存数据和业务权限。
- 不更改缓存、队列容量、预算、候选选择、完整循环或任何计算公式。
- 不顺带拆 Contracts/Catalog，不重构前端请求层，不新增自动重试。

## Decisions

### 1. 领域错误不再包含 HTTP 状态

在 Analyzer `core/errors.ts` 增加一个小型 `AnalysisInputError`，带有限 code 和既有可读说明，经包根导出。
API 从包根判断该错误，领域层不导入 Fastify、API 或日志；不往 Contracts 放执行逻辑。

错误码以有限分类为准：invalid_build、invalid_metric、invalid_metric_context、invalid_field_presence、
invalid_action_parameters、invalid_effect_selection、invalid_weapon_choice、invalid_artifact_choice，以及
game_data_version_mismatch。前八类映射 400，最后一类映射 409。
保留有价值的既有输入说明，不为换错误类型大规模翻译消息。

按真实来源逐个标记，而非整文件替换：

- Build/旅行者输入合法性、指标身份/命座、实际前台及辅助受益人关系。
- 动作参数输入的值/范围/联动限制；同文件的重复声明、非法默认值、缺少声明绑定仍是内部错误。
- 显式效果 ID、来源选择、互斥组、武器和套装选项；自行派生的内部不变量不能自动变成用户错误。
- 将装备分析中已有 Object.assign(statusCode) 的请求拒绝迁移到类型化错误。

Content 声明校验、数据/倍率缺失、未知求值器等仍 throw 内部 Error，API 按 500 处理。
备选的消息正则或按“所有 throw 都是 400”处理，会隐藏真实引擎缺陷，明确不采用。

### 2. API 只保留一处有限映射

新增 `services/http-errors.ts`，持有 API 自己的有限服务错误、映射和 handler 注册；`app.ts` 只装配。
复用 Contracts 现有 ApiErrorResponseSchema，路由为对应错误状态声明该 Schema，不复制新的响应接口。
校验错误、非法 JSON、媒体类型/大小限制、未注册入口统一返回公开形状，保留框架对应 4xx 状态。
不因未知异常上临时存在 statusCode 就信任其为公开业务错误。

| 情况 | 状态与公开 code |
|---|---|
| 结构/JSON 错误 | 400 / invalid_request |
| 类型化领域输入 | 400 / 对应领域 code |
| 游戏数据版本不符 | 409 / game_data_version_mismatch |
| 计算身份不符 | 409 / computation_conflict |
| 比较容量满 | 429 / comparison_busy |
| 比较预算耗尽 | 503 / comparison_timeout |
| 服务关闭 | 503 / comparison_unavailable |
| 连接仍可写时的取消 | 499 / comparison_cancelled |
| 未知 API 路径 | 404 / not_found |
| 未识别内部错误 | 500 / internal_error |

既有 session_required、invalid_invite、workspace_revision_conflict、invite_rate_limited 等显式响应保持原样。
500 message 只给通用错误及请求编号，不能拼接 error.message。
不复制路由里的指标门槛检查；将可共用的拒绝下沉到领域入口，以旧完整、新核心和辅助路径一致为准。

### 3. 套装部分失败是独立边界

请求的候选目录、条件组选项先做显式输入校验；只有这些可识别选择错误向外抛 400。
合法基准的候选在内部生成/求值阶段出错，保持 200/complete=false/failures，不因错误类恰好是输入类就认定用户有错。
提取必要的既有选项校验供入口复用，不复制候选公式，不把反事实变为新引擎。
失败结果不缓存为成功、不进入排名，重试保持现有语义；不改变排行榜筛选与部分失败提示。

### 4. 诊断按允许字段输出，兼顾任务合并

新增 `services/diagnostics.ts`，只输出结构化错误分类、状态、经筛选的代码位置和关联标识。
API 使用服务端生成的 request.id，响应提供 X-Request-Id；不信任客户端带入的请求编号作为诊断身份。
内部失败的请求记录关联 requestId；候选 catch 记录 computationId/candidateId，响应时再关联 requestId。
这样同一个去重任务有多个等待者时，不会误把所有失败只绑定到首个请求。

严禁序列化 request、Error 整体、message/stack 原文、完整任务键、Cookie/Authorization、UID、邀请码和 Build 内容/标识。
代码位置仅保留筛选出的源码文件/行列，不记录异常文本行；记录长度有界，不建立内存日志 Map。
正常 400/401/409 和取消不记录为内部错误，连接已断开时不再 send，也不使其他等待者失败。
不打开全量 Fastify 请求日志；维持只在异常/部分失败处记录必要信息。

### 5. 上游分类局限在真正外部边界

EnkaClient 的 fetch、HTTP 状态及 JSON/基本响应形状检查单独识别为上游错误：404 映射 showcase_not_found；
429/503 映射 503/showcase_unavailable；超时映射 504/showcase_timeout；其他网络、异常 HTTP 或无效响应映射
502/showcase_upstream_error。保持现有 12 秒预算，不在本项增加重试或刷新缓存。
归一化在外部格式验证之后执行，未知内部异常不能在整段 catch 中一律包装为 502。
本地 URL 构造/部署配置错误也不作为上游故障，须留在外部调用 catch 之外。
逐条 ShowcaseAvatarNormalizationError 的正常跳过语义保持不变。

### 6. 文件变化与验证边界

| 主要文件/区域 | 变化 |
|---|---|
| `packages/analyzer/src/core/errors.ts`（新增）、`src/index.ts` | 小型领域错误及包根导出，不带 HTTP |
| Analyzer `core/field-presence.ts`、`core/build-variant.ts`、`scenario/evaluate.ts` | 前台、Build、动作与版本输入分类 |
| Analyzer `metrics/evaluate.ts`、`metrics/runtime.ts`、`evaluators/scenario-parameters.ts` | 辅助上下文及动作输入分类，保留声明故障 |
| Analyzer `effects/action-effects.ts`、`effects/active-element-overrides.ts`、`effects/weapon-state.ts` | 显式效果/来源/武器选择错误，其他内部不变量不变 |
| Analyzer `analysis/analyze.ts`、`equipment-session.ts`、`artifact-comparison.ts` | 去掉 HTTP 耦合、复用选项校验，不改数值 |
| `apps/api/src/services/http-errors.ts`、`services/diagnostics.ts`（新增） | HTTP 映射、统一处理与白名单诊断 |
| `apps/api/src/app.ts`、资源路由 | 薄装配、错误 Schema、请求标识；保留 ARCH-015 清理 |
| API `services/equipment-comparison.ts`、`comparison-scheduler.ts` | 有限服务错误、候选诊断；不调预算/准入策略 |
| API `services/showcase/client.ts` | 只分类真正上游请求/响应故障 |
| Web `features/calculation-workspace/calculation-workspace.tsx` | 辅助失败读取 message，保留非 JSON 回退，不拆组件 |
| API 新集成测试、既有比较/展示柜测试、Web 流程测试 | 跨真实边界分组验证，避免重复角色单测 |
| ADR 索引、新 ADR、架构台账/开发说明 | 记录领域/API 分离与真实交付状态 |

## Risks / Trade-offs

- [把内部错误降成 400] → 逐处按输入来源分类，至少用缺失声明/数据与未知 Error 对照证明仍为 500。
- [候选内部输入类错误被误归责] → 显式选项预校验，内部候选失败保持部分结果；复用现有故障恢复集成测试。
- [日志泄露场景] → 只允许固定字段和筛选代码位置，测试在 body/headers/异常文本放哨兵值验证均不输出。
- [跨包实际仍跑旧 dist] → 先构建 Analyzer，再运行 API 集成；不把源码类型检查当成跨包运行验证。
- [错误行为变化影响客户端] → 成功体和既有会话业务码不变，Web 验证 message 与非 JSON 回退；明确记录错误状态变更。

## Migration Plan

无配置或数据迁移，保留当前部署环境和用户库。新增请求标识是响应头，不加入保存数据或成功 JSON。
先在本地通过错误矩阵及正式数值回归，后按独立授权提交/部署；需回滚时只回退代码，不改数据库或密钥。
已获用户确认并实施；验收见 [implementation-progress.md](implementation-progress.md)，不自动归档主线其他已完成变更。
