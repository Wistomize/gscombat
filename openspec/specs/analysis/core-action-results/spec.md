# 核心动作结果规格

## Purpose

定义 GSCombat 当前可对外承诺的分析结果边界：在一个显式固定场景中计算所选核心动作、解释公式并执行同场景反事实比较，而不把结果包装成完整循环 DPS。

## Requirements

### Requirement: 固定场景中的核心动作结果

系统 MUST 在角色 Build、队伍、敌人、外部 Buff、动作和反应假设全部显式给定的场景中返回所选核心动作的期望结果。该结果可以聚合动作内部的多个已声明事件，但 MUST NOT 被标记或解释为完整队伍循环 DPS。

#### Scenario: 求值一个已维护的伤害动作

- **WHEN** 调用方提交通过当前场景契约验证的伤害分析请求
- **THEN** 系统返回所选动作的期望结果及其动作内事件结果
- **AND** 结果说明保持“核心动作”边界，不声称闭合切人、能量、冷却、敌人行为或玩家操作循环

### Requirement: 同一场景的反事实比较

系统 MUST 通过重算同一权威场景来计算武器、成长项和圣遗物词条收益。每次比较只可替换被声明的干预项，其他 Build、队伍、敌人、动作和条件 MUST 保持不变。

#### Scenario: 比较候选武器

- **WHEN** 系统为当前主角色评估一个兼容候选武器
- **THEN** 系统使用候选武器替换原武器并重新执行同一场景
- **AND** 增益比例以重算结果与基线核心动作结果的差异计算

### Requirement: 辅助指标保持类型和上下文边界

非伤害辅助指标 MUST 通过类型化指标定义在显式来源与受益方上下文中求值。治疗、属性增益和标量结果 MUST 保留各自单位、条件与公式，不得被强制换算为某个主 C 的伤害收益，也不得进入伤害专属的武器和词条比较。

#### Scenario: 求值一个治疗指标

- **WHEN** 调用方选择已维护的治疗指标并提供来源 Build 与受益角色上下文
- **THEN** 系统返回治疗单位的结果、受益角色、条件状态和公式
- **AND** 系统不生成伤害武器排名或虚构的通用评分

### Requirement: 可解释公式轨迹

每个已支持的伤害或辅助指标结果 MUST 返回与最终数值一致的类型化公式轨迹。多事件动作 MUST 可追溯到稳定事件标识；聚合展示可以聚焦代表事件，但不得改变完整动作总值。

#### Scenario: 展示多事件动作

- **WHEN** 所选动作声明了多个伤害事件和展示焦点
- **THEN** 系统返回各事件的稳定标识、数值和公式轨迹
- **AND** 聚合结果与事件求值使用同一权威数据

## References

- [ADR-0002](../../../../docs/adr/0002-use-core-action-expected-damage-as-the-current-analysis-metric.md)
- [ADR-0011](../../../../docs/adr/0011-model-character-profiles-as-self-owned-typed-metrics.md)（历史，已被 ADR-0012 取代）
- [ADR-0012](../../../../docs/adr/0012-evaluate-character-metrics-in-explicit-party-context.md)
- [ADR-0014](../../../../docs/adr/0014-use-one-authoritative-scenario-metric-evaluation-path.md)

## Verification Evidence

- [Analyzer 核心动作与反事实分析](../../../../packages/analyzer/src/analysis/analyze.ts)
- [API 分析与辅助指标路由](../../../../apps/api/src/routes/analysis.ts)
- [分析契约](../../../../packages/contracts/src/analysis.ts)
- [辅助指标契约](../../../../packages/contracts/src/support-metrics.ts)
- [分析集成测试](../../../../packages/analyzer/test/integration/analysis/analysis.test.ts)
- [指标集成测试](../../../../packages/analyzer/test/integration/metrics/metric.test.ts)
