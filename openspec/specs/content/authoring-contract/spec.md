# Content 作者契约规格

## Purpose

定义角色、武器、圣遗物和规则内容如何引用固定数据、保存语义证据、归属于实体目录并通过构建期静态注册表进入运行时。

## Requirements

### Requirement: 固定且可追溯的游戏数据

运行时静态游戏事实 MUST 来自版本固定、校验和验证的只读快照。Content 声明 MUST 引用快照中的角色、武器、天赋或原始参数，不得在运行时从外部数据服务补全静态事实。

#### Scenario: 解析天赋倍率

- **WHEN** 已验证动作引用某个天赋参数和等级
- **THEN** Analyzer 从当前固定快照读取该数值
- **AND** 快照来源版本和上游提交可由数据状态信息审计

### Requirement: 语义声明归属于实体

角色动作、指标、固有天赋、命座和角色效果 MUST 与该角色的 Content 目录共同维护；武器和圣遗物效果及覆盖说明 MUST 与对应装备目录共同维护。中央聚合层 MUST NOT 成为这些实体语义的第二份手工来源。

#### Scenario: 新增符合现有模型的角色动作

- **WHEN** 作者在角色目录声明一个使用现有类型和计算阶段的动作
- **THEN** 构建期工具从实体入口聚合该声明
- **AND** 作者无需手工维护第二份中央动作列表

### Requirement: 审阅证据约束歧义映射

多倍率或容易混淆的动作 MUST 提供经过审阅的术语映射证据，包括来源路径、固定上游提交、参数身份和代表性快照检查。系统 MUST 拒绝缺失、重复、漂移或与声明缩放项不一致的证据。

#### Scenario: 验证多倍率伤害部分

- **WHEN** 一个 verified 伤害部分同时使用攻击力和生命值倍率
- **THEN** registry integrity 审计逐项匹配声明与审阅证据
- **AND** 任一参数、属性或快照值不一致都会产生可定位的问题

### Requirement: 构建期生成静态注册表

角色目录、角色战斗、装备效果、装备覆盖和审阅证据注册表 MUST 由确定性的构建期工具生成。运行时 MUST 只导入生成模块，不得扫描文件系统发现 Content；生成文件过期时 build、test 和 typecheck MUST 失败。

#### Scenario: 移动一个实体目录但未刷新注册表

- **WHEN** 源声明清单与已提交的 generated registry 不一致
- **THEN** `registries:check` 返回失败并指出过期产物
- **AND** 运行时不会通过隐式扫描掩盖该问题

### Requirement: 作者审计不推断未知语义

作者审计 MUST 区分可开始语义标注、缺少天赋参数和需要显式变体绑定的角色。审计可以列出候选参数所有者和已声明动作，但 MUST NOT 把结构上存在的参数自动升级为动作语义。

#### Scenario: 旅行者存在多个候选天赋所有者

- **WHEN** 固定快照同时包含规范旅行者和元素变体天赋表
- **THEN** 作者审计标记需要显式变体绑定
- **AND** 不自动选择任一候选作为公开动作

## References

- [ADR-0005](../../../../docs/adr/0005-use-pinned-localization-assets-for-action-authoring.md)
- [ADR-0010](../../../../docs/adr/0010-require-reviewed-term-evidence-for-multi-scaling-actions.md)
- [ADR-0015](../../../../docs/adr/0015-generate-content-registries-from-entity-owned-declarations.md)

## Verification Evidence

- [Content 维护指南](../../../../docs/development.md)
- [角色战斗注册入口](../../../../packages/content/src/combat-registry.ts)
- [生成的角色战斗注册表](../../../../packages/content/src/registry/character-combat.generated.ts)
- [注册表生成工具](../../../../packages/content/tools/generate-registries.ts)
- [Content registry 测试](../../../../packages/content/src/combat-registry.test.ts)
- [注册表完整性系统测试](../../../../packages/analyzer/test/system/combat-registry-integrity.test.ts)
- [作者审计系统测试](../../../../packages/analyzer/test/system/combat-authoring-audit.test.ts)
