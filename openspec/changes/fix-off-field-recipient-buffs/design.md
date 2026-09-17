## Context

见 [proposal.md](proposal.md)。2026-09-10 本地真实 SQLite 最小复现：无圣遗物、C0、E10 莉奈娅与 C0、E10 五郎组队，两个重锤动作的 fieldPresence 均缺失，均得到旗帜固定防御 371.088 和队伍防御 25%。这是诊断配置，不是用户截图的 412.3 配置。

CombatActionEffectActivation 目前仅有 requiresSourceOnField；resolveEligibleActionEffect 用它排除提供者与另一个前台动作冲突。这个方向不能用于“五郎可后台，但受益者必须在前台”。

## Goals / Non-Goals

**Goals:** 在既有 Content 声明 → Analyzer 资格筛选 → 权威求值链路中补足受益者方向，修复当前莉奈娅/五郎实例。

**Non-Goals:** 不写角色 ID 特判，不新增用户站位选择器，不推断未知动作，不模拟离场残留或施放后动态换人快照。

## Decisions

1. 为效果增加独立的 requiresRecipientOnField 元数据，和已有 requiresSourceOnField 分离。在统一资格层按受益者对应动作站位排除明确后台。优于莉奈娅专用排除表，也不能复用来源须前台的反向语义。
2. 莉奈娅 enhancedHammer 为 off_field，millionTonHammer 为 on_field；保留现有 action/metric ID、天赋参数、独立月结晶公式和两个治疗指标，仅增加站位与名称后缀。后台单跳不包含前台施放时快照收益，连续点按不累计后续岩伤。
3. 五郎 defense_buff 和 geo_damage_bonus 声明受益者前台限定；defense_percent_buff 和 C6 不加该限制。后续其他角色可使用相同模型，但本次不扩大声明修复范围。
4. 来源属性换算路径可能将受益 Build 暂时设为 primary，必须保留原动作所有者与真实受益者上下文；不能因构造中性动作而给后台莉奈娅重新加回旗帜防御，也不能把其他队友一律视作当前后台角色。实现时用真实天赋派生精通/防御轨迹验收。
5. 对历史未知站位保持原先行为。只限制明确声明的后台指标；旧配置手选不强制覆盖资格。完整和增量比较继续通过同一权威场景，不加新求值回合。
6. 复用 [ADR-0014](../../../docs/adr/0014-use-one-authoritative-scenario-metric-evaluation-path.md) 的单一链路及 [ADR-0015](../../../docs/adr/0015-generate-content-registries-from-entity-owned-declarations.md) 的声明归属；这是已有资格模型的双向补全，没有新增架构边界，不另建 ADR。

## Risks / Trade-offs

- [只改名称或动作标签仍漏算] → 通用受益限制与五郎声明一起验收。
- [误删全队防御或 C6] → 分开断言固定值排除、25% 与 C6 保留，不仅断言总伤害降低。
- [来源属性间接泄漏] → 检查莉奈娅实际防御及派生精通，不能只看 appliedEffects 是否删除。
- [旧角色受影响] → 未标记站位的历史行为不变；不把“后台指标”推广成全库任意 E/Q。
- [与上轮武器默认冲突] → 在现有工作树上追加最小改动并回归完整/增量一致性，保留上轮内容。

## Migration Plan

无配置或数据库迁移；无 HTTP Schema 变化。代码和目录名兼容，指标标签更新由既有目录接口提供。用户明确要求后才提交部署；回退本变更即可恢复原行为。
