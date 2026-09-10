## MODIFIED Requirements

### Requirement: 伤害分析只有一个产品入口

HTTP 调用方 MUST 通过 TypeBox 校验的 `POST /v1/analysis` 提交完整伤害分析，或通过其 `POST /v1/analysis/weapon-comparison` 子入口提交单候选武器分析。两个入口 MUST 复用同一维护中的场景求值和候选武器规则；单候选入口不得形成独立计算模型。系统 MUST NOT 重新暴露绕过 Build、固定数据、Content、队伍状态或指标注册表的示例计算端点。

#### Scenario: 调用伤害分析 API

- **WHEN** 客户端向 `/v1/analysis` 提交合法场景
- **THEN** API 返回当前分析响应契约中的 evaluation 和 analysis
- **AND** 二者来自同一维护场景而非平行示例公式，已有请求和响应保持兼容

#### Scenario: 调用单候选武器子入口

- **WHEN** 客户端向 `/v1/analysis/weapon-comparison` 提交合法场景与单个候选
- **THEN** API 按共享请求和响应契约返回服务端基线及该武器的比较结果
- **AND** 数值来自完整分析所用的同一权威场景和候选规则，不依赖客户端提供的基线数值或服务端保存的报告
