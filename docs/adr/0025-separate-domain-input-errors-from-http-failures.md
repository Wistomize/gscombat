# ADR-0025：领域输入错误与 HTTP 故障分离

- 日期：2026-10-19
- 状态：Accepted；本地实施，未部署
- 变更：[normalize-api-domain-errors](../../openspec/changes/normalize-api-domain-errors/design.md)
- 延续：[ADR-0014](0014-use-one-authoritative-scenario-metric-evaluation-path.md)、[ADR-0018](0018-compose-api-from-resource-route-modules.md)

## 背景

TypeBox 能验证请求形状，不能证明前台是队员、指标属于角色或来源达到命座要求。
这些拒绝此前经普通 Error 混入 500；部分域代码又附加 HTTP statusCode，调用方难以稳定识别。
同时，内部异常可能公开原始消息，套装部分失败缺少可关联诊断。

## 决策

1. Analyzer 包根导出小型 `AnalysisInputError`，只含有限领域 code 和既有说明，不含 HTTP 状态。
   按抛错来源逐处分类，不能用消息正则，也不能将整个文件的 Error 都改为输入错误。
2. API `services/http-errors.ts` 持有有限服务错误和唯一 HTTP 映射。所有路由通过注册钩子补齐现有
   `ApiErrorResponseSchema`，保留各路由显式声明和既有会话/工作区业务响应。
   请求校验器产生类型化 Fastify 错误；任意异常自行携带 statusCode 不构成公开响应授权。
3. 输入为 400，游戏数据/计算身份冲突为 409，容量为 429，预算/关闭为 503，连接可写时取消为 499。
   未识别异常仍为 500。500 仅返回通用提示和服务端 UUID 请求编号，`X-Request-Id` 不接受客户端冒充。
4. 套装显式候选与选项先复用 Analyzer 校验。内部生成候选的求值异常（包括 AnalysisInputError）保留
   200、`complete=false` 和 failures；不进入排名、不伪造零收益、不缓存为成功。
5. 候选诊断关联 computationId/candidateId，响应另关联每个等待者 requestId，兼容合并任务。
   仅记录有限分类、状态、截断的源码位置和关联标识；不输出请求、异常原文、完整任务键、UID、Build 或凭据。
   不新增日志存储、自动重试或全量请求日志。已断开的连接不发送错误体。
6. Enka 仅在 fetch、HTTP、JSON/基本响应形状边界分类：404 不存在、503 限制/不可用、504 超时、
   502 其他外部故障。URL 配置和未知归一化程序错误保留 500；正常条目跳过与 12 秒预算不变。

## 备选方案

- 统一把 Error 返回 400：会隐藏内容声明、固定数据和引擎故障，拒绝。
- 信任任意 statusCode 或按消息判断：缺少稳定来源约束，拒绝。
- 新建公共错误包和日志平台：对当前规模无益，增加依赖与维护负担，拒绝。
- 在候选 catch 内依据错误类决定 400：无法区分用户选择与内部生成输入，拒绝。

## 后果与验证

库调用方按领域类型/code 识别输入拒绝；HTTP 由 API 独占。已有误报 500 的用户输入以及默认 Fastify
错误体发生明确兼容性变化，成功报告、数值公式、存档、鉴权和比较限额不变。
Web 辅助指标补齐 message 展示，代理非 JSON 或无合法 message 时保留 HTTP 状态回退。

验证覆盖真实 buildApp、正式 SQLite、旧/新/辅助入口、候选部分失败和重试、合并等待者、调度取消隔离、
脱敏哨兵、展示柜受控上游及 Web 工作空间；完整命令结果见[实施记录](../../openspec/changes/normalize-api-domain-errors/implementation-progress.md)。
ARCH-014 的准入/缓存问题和 ARCH-019 的主规格同步仍独立待办，不因本决策完成而关闭。
