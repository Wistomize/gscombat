## 1. 领域输入分类

- [x] 1.1 实施前列出涉及输入的现有 throw 与故障对照，新增小型 AnalysisInputError 并经包根导出。验证：清单区分用户输入、内部声明/数据不变量、反事实生成错误，不按文字或整文件机械替换。
- [x] 1.2 迁移场景/Build/前台、指标归属/命座、辅助受益人、动作参数及显式效果/装备选择的输入检查，去掉这些领域拒绝上的 HTTP statusCode。验证：复用 Analyzer 既有集成切片，确认领域错误类型/code；同文件坏默认值、缺失声明/参数仍是内部 Error，不改合法场景数值和原提示。

## 2. API 统一响应与诊断

- [x] 2.1 新增 http-errors 有限映射及统一 handler，组合根薄装配，绑定现有 ApiErrorResponseSchema 和对应错误状态。验证：真实 buildApp 注入结构错误、非法 JSON、未知路径、非法前台、错属指标/低命座及游戏版本冲突；旧完整与新核心、辅助入口状态和 code 一致，未知内部异常仍 500。
- [x] 2.2 将比较服务/调度器的临时 statusCode 迁移到 API 自有服务错误，保留 409/429/503/499 语义、关闭明确为 503，已断开连接不再发错误体。验证：复用 deferred-equipment 的冲突、限额、预算、取消隔离及服务关闭测试，不调整限额/缓存或候选算法。
- [x] 2.3 新增允许字段的脱敏诊断和服务端请求标识；内部错误公开提示含可关联编号。验证：真实 HTTP 500 的响应头、提示与诊断一致；在 body、headers、异常文本放置 UID/邀请码/密钥/Cookie/Build 哨兵，均不出现在公开内部错误和日志；伪造请求标识不替代服务端身份，不新增日志 Map 或全量请求日志。

## 3. 部分失败与外部边界

- [x] 3.1 复用套装条件校验，在候选求值之前拒绝非法显式选项；内部候选失败保留 complete=false/failures，并关联 computationId/candidateId 和各请求标识。验证：扩展现有候选失败/重试集成，覆盖内部生成的输入类错误与普通 Error 都不是用户 400；并发去重等待者能各自关联，失败项不伪造零收益。
- [x] 3.2 在 Enka 实际外部请求/解析边界分类 404、429/503、超时及其余网络/异常响应，归一化程序错误保留内部 500。验证：复用 showcase 集成的受控上游，覆盖 404/503/504/502、合法空数据和跳过条目；不依赖在线 Enka 可用性，不改 12 秒预算、合法导入内容或缓存策略。
- [x] 3.3 辅助指标前端读取可用 message，非 JSON 或无合法 message 时退回 HTTP 提示。验证：扩展 workspace-flow 集成，确认后端提示、代理回退、用户配置及既有请求失效/取消行为；不重构其他 fetch 消费者。

## 4. 集成与交付

- [x] 4.1 新增一个 API 错误矩阵集成文件，配合现有 app、support-metrics、deferred-equipment、showcase、workspace-sync 与 startup 切片验证；先构建 Analyzer 再跑 API，证明 API 未执行旧 dist。验证：`pnpm --filter @gscombat/analyzer build`，随后 API 聚焦集成和现有架构守卫通过；不为每个角色建立重复用例。
- [x] 4.2 运行根 `pnpm typecheck`、`pnpm build`（含已有生成资产检查），Analyzer/API 全包测试，以及 `NODE_OPTIONS=--no-experimental-webstorage pnpm --filter @gscombat/web test`。批准本任务集即采用这一按受影响工作区的完整测试门禁，不另重复根 `pnpm test` 的不变 Content/Calculator/Game-data 测试；若实施修改这些包或生成数据，先更新方案并恢复根全测。记录合法报告回归、状态变化与真实命令结果，不改数值期望掩盖差异。
- [x] 4.3 新增顺序 ADR 并更新 ADR 索引、架构说明、开发指南、台账及实现记录。验证：清楚区分领域错误和 HTTP 映射、部分失败与隐私边界；ARCH-013 仅在所有验收通过后标完成，ARCH-015 原修复和工作区改动完整保留。
- [x] 4.4 运行 `openspec validate normalize-api-domain-errors --strict`、文档链接检查、`git diff --check` 及 diff/status 审查。验证：成功协议、配置、Schema/凭据算法和计算逻辑无未经确认变化；无另行授权不提交、推送、部署或归档。
