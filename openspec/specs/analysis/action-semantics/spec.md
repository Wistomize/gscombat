# 动作语义规格

## Purpose

定义固定游戏数据如何通过可审计的语义动作、动作内事件、反应前提和元素覆盖进入权威求值链路，并明确当前模型不是完整元素量表或队伍循环模拟器。

## Requirements

### Requirement: 固定快照与显式语义动作

可计算动作 MUST 由 Content 声明稳定动作标识、角色、天赋槽、元素、倍率参数引用和覆盖状态。系统 MUST 从固定游戏数据快照读取参数数值，不得仅根据数组位置、长度或数值形状自动推断动作语义。

#### Scenario: 解析一个已声明天赋动作

- **WHEN** 动作引用固定快照中的天赋组、参数下标和天赋等级
- **THEN** 系统从该快照解析倍率并执行已声明的动作语义
- **AND** 未经声明的参数不会自动成为公开可计算动作

### Requirement: 动作相对事件时间线

多事件动作 MUST 以动作施放为零点声明持续时间，并为每个伤害事件声明稳定标识、发生时间、伤害部分和 `cast`、`hit` 或显式时间快照策略。未提供时间线的旧声明 MUST 继续按施放时点编译其已声明伤害部分。

#### Scenario: 求值带延迟命中的动作

- **WHEN** 一个动作声明了施放后发生的多个事件及各自快照策略
- **THEN** 系统按事件时间顺序求值，并在每个事件使用其声明的统计快照
- **AND** 事件轨迹保留稳定标识与命中次数

### Requirement: 显式反应假设

增幅、激化、剧变及独立特殊反应 MUST 通过动作或事件的类型化声明进入对应公式。系统 MUST NOT 从队伍元素、动作名或未声明的触发历史猜测反应；独立特殊反应不得被错误套用普通直伤乘区。

#### Scenario: 求值已声明的蒸发动作

- **WHEN** 目标动作显式声明蒸发方向、反应加成和适用事件
- **THEN** 系统在正确公式阶段应用该增幅反应
- **AND** 直接结果与事件轨迹展示一致的反应前提和乘数

### Requirement: 有界的元素附着与 ICD

事件级元素附着 MUST 明确声明始终尝试或仅在元素覆盖生效时尝试，并选择无 ICD 或标准 ICD 组。当前持续附着模型 SHALL 只支持静态、单目标、非消耗的 `cryo`、`hydro`、`pyro` 或 `quicken` 窗口以及标准 2.5 秒/三击节奏；系统 MUST NOT 声称模拟完整 GU 消耗、共存元素、多目标或敌人生成元素。

#### Scenario: 多次命中共享标准 ICD

- **WHEN** 同一来源组的多个事件在持续附着窗口内尝试附着
- **THEN** 系统按标准时间与命中计数节奏决定每次尝试是否生效
- **AND** 结果只在当前有限单目标模型内解释

### Requirement: 命中时元素覆盖

元素附魔 MUST 作为带时间窗口和目标类型的显式事件元素覆盖处理。覆盖只改变命中时的最终元素、元素增伤、抗性和附着资格，MUST NOT 改写施放时的统计快照。

#### Scenario: 物理普通攻击进入附魔窗口

- **WHEN** 一个普通攻击事件命中时处于匹配的有效元素覆盖窗口
- **THEN** 系统使用覆盖元素选择元素增伤、抗性和附着
- **AND** 事件的攻击力、暴击等统计仍来自其声明的快照时点

### Requirement: 旅行者规范 Build 与受限变体

旅行者 MUST 使用规范角色 Build 保存基础属性，并通过受约束的性别与元素变体选择天赋参数所有者。调用方不得提交任意原始天赋所有者来组合不相关的基础属性和动作。

#### Scenario: 解析元素旅行者动作

- **WHEN** 规范旅行者 Build 选择了受支持的元素与性别，且动作声明匹配的变体
- **THEN** 系统使用规范基础属性和对应变体天赋表
- **AND** 不匹配的动作变体不参与该场景求值

## References

- [ADR-0003](../../../../docs/adr/0003-declare-semantic-actions-against-the-pinned-snapshot.md)
- [ADR-0004](../../../../docs/adr/0004-declare-amplifying-reaction-assumptions-per-action.md)
- [ADR-0006](../../../../docs/adr/0006-declare-damage-as-an-action-relative-event-timeline.md)
- [ADR-0007](../../../../docs/adr/0007-model-sustained-aura-and-standard-icd-as-an-explicit-limited-event-layer.md)
- [ADR-0008](../../../../docs/adr/0008-model-traveler-as-a-canonical-build-with-a-constrained-variant.md)
- [ADR-0009](../../../../docs/adr/0009-model-elemental-infusions-as-explicit-event-overrides.md)

## Verification Evidence

- [Content 战斗类型](../../../../packages/content/src/combat/types.ts)
- [Calculator 事件与反应模型](../../../../packages/calculator/src/rotation.ts)
- [Calculator 反应公式](../../../../packages/calculator/src/reaction.ts)
- [时间线与声明完整性守卫](../../../../packages/analyzer/test/system/combat-registry-integrity.test.ts)
- [同命中多事件回归测试](../../../../packages/analyzer/test/integration/reactions/same-hit-multihit-regression.test.ts)
