# 公开入口规格

## Purpose

定义应用与包调用方可以依赖的权威计算、工作区和组合根入口，让 HTTP Schema、服务资源生命周期和 Analyzer 包导出形成稳定边界，并防止内部重组重新产生第二套产品计算路径。

## Requirements

### Requirement: 伤害分析只有一个产品入口

HTTP 调用方 MUST 通过 TypeBox 校验的 `POST /v1/analysis` 提交伤害场景；该入口 MUST 使用维护中的场景求值和反事实分析。系统 MUST NOT 重新暴露绕过 Build、固定数据、Content、队伍状态或指标注册表的示例计算端点。

#### Scenario: 调用伤害分析 API

- **WHEN** 客户端向 `/v1/analysis` 提交合法场景
- **THEN** API 返回当前分析响应契约中的 evaluation 和 analysis
- **AND** 二者来自同一维护场景而非平行示例公式

### Requirement: 辅助指标使用独立受约束入口

HTTP 调用方 MUST 通过 `POST /v1/support-metrics/evaluate` 求值非伤害指标。该入口 MUST 拒绝 damage 类型指标，并通过同一 Content 指标注册表和 Analyzer 指标求值器返回类型化响应。

#### Scenario: 把伤害指标提交到辅助入口

- **WHEN** 调用方把已注册 damage 指标提交给辅助指标入口
- **THEN** 入口拒绝该请求而不把伤害结果伪装成辅助结果

### Requirement: HTTP 契约由共享 TypeBox Schema 定义

公开请求、成功响应和已声明错误响应 MUST 绑定 `@gscombat/contracts` 的 TypeBox Schema。Web 和其他客户端 MUST 复用共享契约类型，不得维护形状相似但独立演化的接口定义。

#### Scenario: 工作区写入契约不合法

- **WHEN** 请求缺失 `expectedRevision` 或提交了不受支持的工作区 schema version
- **THEN** API 在进入持久化逻辑前拒绝请求

### Requirement: 应用组合根保持唯一

服务嵌入、测试和部署调用方 MUST 通过 `buildApp` 创建完整 Fastify 应用。组合根 SHALL 显式装配会话工作区、Catalog 审计、分析和展示柜资源，并统一管理共享 SQLite 与游戏数据资源生命周期。

#### Scenario: 集成测试创建 API

- **WHEN** 测试以临时游戏数据、工作区路径或展示柜客户端调用 `buildApp`
- **THEN** 获得与部署相同资源边界的完整应用而无需打开网络端口
- **AND** 关闭应用会释放共享资源

### Requirement: Analyzer 只承诺包根导出

包调用方 MUST 从 `@gscombat/analyzer` 包根使用受支持的场景、指标、分析和审计 API。`src` 内部子系统路径 SHALL 视为私有实现细节，不形成兼容性承诺。

#### Scenario: 内部模块重组

- **WHEN** Analyzer 在保持包根导出与可观察计算行为不变的前提下移动内部文件
- **THEN** 合法包调用方无需修改

## References

- [ADR-0014](../../../../docs/adr/0014-use-one-authoritative-scenario-metric-evaluation-path.md)
- [ADR-0016](../../../../docs/adr/0016-organize-analyzer-by-subsystem-and-separate-tests.md)
- [ADR-0018](../../../../docs/adr/0018-compose-api-from-resource-route-modules.md)

## Verification Evidence

- [API 组合根](../../../../apps/api/src/app.ts)
- [分析资源路由](../../../../apps/api/src/routes/analysis.ts)
- [会话工作区资源路由](../../../../apps/api/src/routes/session-workspace.ts)
- [共享契约包入口](../../../../packages/contracts/src/index.ts)
- [Analyzer 包入口](../../../../packages/analyzer/src/index.ts)
- [API 集成测试](../../../../apps/api/test/integration/app.test.ts)
- [API 架构边界测试](../../../../apps/api/test/system/layer-boundary.test.ts)
