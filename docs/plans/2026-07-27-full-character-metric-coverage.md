# 全角色指标覆盖 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将每个角色目录中的 `combat.ts` 从“存在一个可选动作”补齐为可展示、可计算、可追溯的角色指标定义，为 Ysin 式固定配置边际收益分析提供输入。

**Architecture:** 每个角色只在 `packages/content/src/characters/<slug>/combat.ts` 声明符合定位的自身输出：主、副 C 维护核心伤害与有意义的第二结果，辅助只维护治疗、护盾或增益，绝不以填充伤害凑指标；必要反应变体仍随动作声明。共用的 typed damage pipeline 只承接单次动作计算。层数、弹药等只允许作为用户手填的当前快照参数，绝不引入动作序列、循环或跨动作状态机。

**Tech Stack:** TypeScript、TypeBox、Vitest、pnpm workspace、已有游戏数据快照和 `@gscombat/analyzer` 伤害流水线。

---

### Task 1: 建立逐角色验收清单

**Files:**
- Modify: `packages/content/src/combat-registry.test.ts`
- Modify: `packages/content/src/catalog.test.ts`
- Inspect: `packages/content/src/characters/*/combat.ts`
- Inspect: `packages/contracts/src/combat-coverage.ts`

**Step 1: 定义审计输出而非新的战斗框架**

按元素和角色定位现有 metric、action、反应变体和辅助指标；将“仅有基础普攻/单一占位动作”的角色标为待补齐，不把文件数或 metric 数当作完成数。

**Step 2: 固化通用完整性断言**

只增加能够验证注册表、目录投影、指标引用和公式参数完整性的系统断言；不为每位角色复制同形断言。

**Step 3: 验证**

Run: `pnpm --filter @gscombat/content test`

Expected: 通用注册表与目录测试通过，审计不会漏掉声明了但不可计算的指标。

### Task 2: 删除跨动作状态系统残余

**Files:**
- Rename: `packages/analyzer/src/action-state-expression.test.ts` to `packages/analyzer/src/scenario-parameter-expression.test.ts`
- Modify: `packages/content/src/characters/eula/combat.ts`
- Modify: `packages/content/src/catalog.ts`
- Modify: `packages/content/src/catalog.test.ts`

**Step 1: 保留手填快照参数的系统测试**

将测试和变量命名为 scenario parameter / snapshot，不再使用 state、preparation、transition 等语言；它只验证当前动作的显式输入能进入系数表达式。

**Step 2: 使优菈成为直接快照动作**

光降之剑爆炸以 `基础倍率 + 手填层数 × 每层倍率` 进入物理伤害流水线；不模拟层数来源、动作顺序、持续时间或消耗。

**Step 3: 删除过时目录特例**

目录测试应从注册表推导可选 verified action，而不是把优菈旧动作列表写死。

**Step 4: 验证**

Run: `pnpm --filter @gscombat/analyzer test && pnpm --filter @gscombat/content test`

Expected: 无跨动作 state 运行时代码；快照参数与目录投影仍由系统测试覆盖。

### Task 3: 逐元素补齐角色指标

**Files:**
- Modify: `packages/content/src/characters/<slug>/combat.ts`
- Modify when needed: `packages/content/src/catalog.ts`
- Modify when needed: `packages/content/src/reviewed-multi-scaling-evidence.ts`

**Step 1: 为一个元素批次选择待补角色**

依据审计结果优先处理“已有基础动作但缺少已确认的核心/第二指标或反应结果”的角色；一个角色完成后再进入下一个，避免并发修改同一目录。

**Step 2: 先验证来源数据和公式**

使用固定游戏数据快照和上游实现核对倍率、缩放属性、元素、反应和限制；多缩放或加成反应必须登记复核证据。

**Step 3: 最小实现指标定义**

在该角色的 `combat.ts` 中增加真实 action/metric；主副 C 增加需要展示的蒸发、融化或激化结果，辅助增加自身治疗、护盾或加成指标。只在公式确实需要时暴露手填快照参数。

**Step 4: 验证**

Run: `pnpm --filter @gscombat/content build && pnpm --filter @gscombat/content test && pnpm --filter @gscombat/analyzer test`

Expected: 新指标能从 registry 到 catalog 再到 analyzer 以同一公式计算，不依赖角色专属模拟器。

### Task 4: 端到端场景与回归验证

**Files:**
- Modify when needed: `packages/analyzer/src/metric-system.test.ts`
- Modify when needed: `apps/api/src/app.test.ts`
- Inspect: `apps/api/src/app.ts`

**Step 1: 覆盖所有已注册 metric 的通用执行路径**

使用真实 DeepSeek 配置的端到端 LLM 场景验证输入配置、角色指标选择和公式结果的服务路径；不使用 fake LLM。

**Step 2: 完整验证**

Run: `pnpm typecheck && pnpm test && git diff --check`

Expected: 类型检查、全量测试和差异检查通过；没有新增循环/状态机或与角色指标无关的代码。
