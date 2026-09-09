# Build 持久化规格

## Purpose

定义用户 Build 与队伍配置的本地优先持久化、可选邀请码同步、版本兼容和并发冲突边界，确保本地模式不依赖云端，并让多设备写入可以检测冲突而不静默覆盖数据。

## Requirements

### Requirement: 规范化且不可变的 Build 数据

手工编辑、内置预设、展示柜导入和 JSON 导入 MUST 规范化为当前 `CharacterBuild` 契约后再进入配置库。系统 MUST 通过稳定 `buildId` 管理 Build，并在更新时生成替换值而不是依赖共享可变对象。

#### Scenario: 导入一个合法 Build

- **WHEN** 用户导入一个通过当前 Build 契约验证的配置
- **THEN** 系统将其规范化后加入版本化配置库
- **AND** 后续分析与同步读取同一契约形状

### Requirement: 默认使用浏览器本地配置

未登录邀请码会话时，系统 MUST 优先把版本化 Build 库和队伍保存到可写的浏览器本地存储。若持久存储不可写，系统 SHALL 依次退回同标签页会话存储和内存，并向用户区分这些非持久模式。

#### Scenario: 浏览器阻止持久存储

- **WHEN** 本地存储不可访问但会话存储可写
- **THEN** 当前标签页仍可编辑、导入、导出和计算配置
- **AND** 界面提示关闭标签页前需要导出

### Requirement: 兼容受支持的旧版本地数据

系统 MUST 读取当前版本化 Build 库，并兼容迁移旧的本地 Build 数组。JSON 导入 SHALL 接受当前版本化工作区文档、单个合法 Build 以及当前仍受支持的旧场景形状；无法识别或不合法的数据 MUST 被拒绝而不能静默损坏当前配置。

#### Scenario: 首次读取旧本地 Build 数组

- **WHEN** 当前存储键不存在但旧版 Build 数组存在
- **THEN** 系统将合法条目合并为 schema version 1 的 Build 库
- **AND** 重复 Build 按稳定标识进行确定性处理

### Requirement: 邀请码同步是可选能力

云端同步 MUST 只在有效邀请码会话中启用。邀请码会话失效、被撤销或缺失时，工作区读取和写入 MUST 返回明确的未授权错误；本地导入、导出和本地配置能力不得依赖云端会话存在。

#### Scenario: 未登录读取云端工作区

- **WHEN** 调用方没有有效的邀请会话请求云端工作区
- **THEN** API 返回 `session_required` 或等价的明确未授权错误
- **AND** 浏览器本地配置仍可独立使用

### Requirement: 版本化工作区与乐观并发

云端工作区文档 MUST 包含受契约约束的 `schemaVersion`、Build 集合和最多四人的队伍引用。每次写入 MUST 提交 `expectedRevision`；服务器只有在版本匹配时原子替换文档并递增 revision，陈旧写入 MUST 返回冲突而不得覆盖较新的数据。

#### Scenario: 两个设备同时修改

- **WHEN** 第二个设备使用已过期的 `expectedRevision` 提交工作区
- **THEN** API 返回 `workspace_revision_conflict` 和 HTTP 409
- **AND** SQLite 中较新的文档及 revision 保持不变

### Requirement: 邀请凭据不随工作区公开

服务器 MUST 只保存邀请码的不可逆摘要，并通过签名、受期限约束的会话 Cookie 识别当前工作区。工作区响应和邀请列表 MUST NOT 返回原始邀请码或摘要。

#### Scenario: 列出邀请元数据

- **WHEN** 管理流程读取邀请记录
- **THEN** 结果可以包含邀请标识、标签、工作区标识和撤销状态
- **AND** 结果不包含原始邀请码或其摘要

## References

- [ADR-0001](../../../../docs/adr/0001-stateless-build-workbench.md)
- [ADR-0013](../../../../docs/adr/0013-use-invite-scoped-sqlite-workspaces.md)

## Verification Evidence

- [工作区 TypeBox 契约](../../../../packages/contracts/src/workspace.ts)
- [浏览器配置兼容层](../../../../apps/web/lib/workspace/workspace-config.ts)
- [Web 工作区会话](../../../../apps/web/features/workspace-session/use-workspace-session.ts)
- [API 邀请会话与工作区路由](../../../../apps/api/src/routes/session-workspace.ts)
- [SQLite 工作区存储](../../../../apps/api/src/services/workspace/store.ts)
- [API 工作区集成测试](../../../../apps/api/test/integration/workspace-sync.test.ts)
- [Web 工作区流程测试](../../../../apps/web/test/integration/workspace-flow.test.tsx)
