# ARCH-003 Content Registry Decentralization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 Content 中人工维护的角色、装备、证据和展示中央注册表迁回实体目录，并以可重复生成、可校验新鲜度的静态注册表作为唯一聚合入口。

**Architecture:** 角色、武器和圣遗物目录拥有自身声明；共享模块只定义类型、缺省策略和投影规则；构建期生成器扫描约定文件并输出带显式静态 import 的注册表。运行时不访问文件系统、不使用 glob。旧中央文件仅在需要保持稳定公共 API 时保留为薄门面，不再保存实体清单。

**Tech Stack:** TypeScript 6、Node.js 22、pnpm、Vitest、Turbo、CodeGraph。

---

## 不变量与范围

- 本项是纯结构重构：角色动作、指标、效果、覆盖状态、证据内容、目录中文名和发布筛选结果必须保持不变。
- `characters/`、`weapons/`、`artifacts/` 保持同级；不新建含混的总 `equipment/<entity>` 层。
- 生成文件提交到仓库，但只允许生成器修改；运行时消费显式 import，不做目录扫描。
- 每一阶段结束均执行 Content 类型检查和相关集成测试；最终执行全仓类型检查、测试和构建。
- 不进入 ARCH-004，不整理 Analyzer 内部目录，也不借本次重构修改角色机制。

## 阶段 0：固定迁移基线和架构决策

**Files:**

- Create: `docs/adr/0015-generate-content-registries-from-entity-owned-declarations.md`
- Modify: `docs/plans/2026-08-06-architecture-debt-audit.md`
- Create temporarily outside the repository: `/tmp/gscombat-arch003-baseline.json`

**Steps:**

1. 构建当前 Content 包并从编译产物导出基线：角色覆盖、动作、指标、动作效果、装备覆盖账本、多倍率证据和公开目录。
2. 记录当前规模和职责：117 个角色、234 把武器、61 套圣遗物，以及中央文件的消费者。
3. ADR 固化三项选择：实体自有声明、提交静态生成物、`--check` 新鲜度守卫；同时记录不采用运行时 glob 和手写总清单的原因。

**Verify:**

- Run: `pnpm --filter @gscombat/content build`
- Expected: Content 成功编译，基线 JSON 可由 Node 导入并生成。

## 阶段 1：建立确定性注册表生成协议

**Files:**

- Create: `packages/content/tools/generate-registries.ts`
- Create: `packages/content/src/registry/character-combat.generated.ts`
- Create: `packages/content/src/registry/equipment-action-effects.generated.ts`
- Create: `packages/content/src/registry/equipment-coverage.generated.ts`
- Create: `packages/content/src/registry/reviewed-multi-scaling-evidence.generated.ts`
- Create: `packages/content/src/registry/character-catalog.generated.ts`
- Modify: `packages/content/package.json`

**Generator contract:**

- 按目录名稳定排序，换行和 import 别名完全确定。
- 角色 `combat.ts` 必须且只能导出一个 `*CombatCoverage`。
- 武器和圣遗物 `effects.ts` 必须且只能导出一个 `*CombatActionEffects`。
- 已审计装备目录的 `coverage.ts` 统一导出 `equipmentCoverage`。
- 有多倍率证据的角色目录 `evidence.ts` 统一导出 `reviewedMultiScalingEvidence`。
- 角色 `definition.ts` 必须且只能导出一个 `*Definition`，生成目录展示注册表。
- `--check` 只比较预期内容，不写文件；缺失、重复或过期均以非零状态退出。

**Steps:**

1. 用 TypeScript AST 发现命名导出，禁止依赖正则猜测符号。
2. 生成显式 import 和只读数组；生成文件头标记来源和禁止手改。
3. 添加 `registries:generate`、`registries:check`，并让 `build`、`test`、`typecheck` 在执行前检查新鲜度。
4. 先让生成器仅覆盖已有角色和动作效果，确认结果能替代手工数组。

**Verify:**

- Run: `pnpm --filter @gscombat/content registries:generate`
- Run: `pnpm --filter @gscombat/content registries:check`
- Run: `pnpm --filter @gscombat/content typecheck`
- Expected: 连续生成两次无差异，检查和类型检查通过。

## 阶段 2：替换角色和装备效果中央清单

**Files:**

- Modify: `packages/content/src/combat-registry.ts`
- Modify: `packages/content/src/combat-action-effects.ts`
- Modify: all `packages/content/src/weapons/*/effects.ts` missing the uniform export contract
- Modify: all `packages/content/src/artifacts/*/effects.ts` missing the uniform export contract

**Steps:**

1. `combat-registry.ts` 从生成注册表取得 `characterCombatCoverageRegistry`，保留查询和派生动作逻辑。
2. `combat-action-effects.ts` 从生成注册表取得装备效果数组，保留效果类型、筛选和选项投影逻辑。
3. 对没有当前动作效果的真实装备提供类型化空数组，使目录契约统一；空数组只表达“没有动作效果”，覆盖原因仍由 `coverage.ts` 说明。
4. 删除两个中央文件中的数百条实体 import 和手写展开项。

**Verify:**

- Run: `pnpm --filter @gscombat/content test -- combat-action-effects.test.ts combat-registry.test.ts`
- Run: `pnpm --filter @gscombat/analyzer test -- equipment-current-action-effects.test.ts constellation-current-action-effects.test.ts`
- Expected: 效果 ID、角色覆盖和动作选择行为与迁移前一致。

## 阶段 3：把装备覆盖账本迁回实体目录

**Files:**

- Create: `packages/content/src/equipment-coverage.ts`
- Create: `packages/content/src/weapons/<id>/coverage.ts` for all 234 inventory weapons
- Create: `packages/content/src/artifacts/<id>/coverage.ts` for all 61 inventory artifact sets
- Create or modify: corresponding `effects.ts` and `index.ts`
- Modify: `packages/content/src/equipment-coverage-ledger.ts`
- Move: `packages/content/src/artifacts/healing-bonus/*` to `packages/content/src/rules/equipment/healing/*`
- Move: `packages/content/src/artifacts/recipient-bonus/*` to `packages/content/src/rules/equipment/recipient/*`

**Steps:**

1. 把覆盖类型、来源构造器、缺省未审计策略和发布判定移到共享 `equipment-coverage.ts`。
2. 使用 AST 一次性提取现有 295 个 Map 条目；每个实体文件保留原始 clause、状态、原因和 effect ID，不人工重写语义。
3. 生成注册表聚合实体 `coverage.ts`；薄账本仅负责与完整 inventory 对齐和发布投影。
4. 将并非圣遗物套装实体的治疗/受益者通用规则移出 `artifacts/`，保留根公共导出兼容。
5. 增加目录完整性校验：inventory 的每个 ID 恰好对应一个目录、一个 coverage 声明和统一入口。

**Verify:**

- Run: `pnpm --filter @gscombat/content test -- equipment-coverage-ledger.test.ts combat-action-effects.test.ts`
- Expected: 234 把武器和 61 套圣遗物全部有且只有一个覆盖记录；发布目录和迁移前一致。

## 阶段 4：把多倍率证据和目录展示元数据迁回角色

**Files:**

- Create: `packages/content/src/characters/evidence.ts`
- Create: `packages/content/src/characters/<id>/evidence.ts` for the 24 characters with reviewed records
- Modify: `packages/content/src/reviewed-multi-scaling-evidence.ts`
- Modify: `packages/content/src/types.ts`
- Modify: all `packages/content/src/characters/<id>/definition.ts`
- Modify: `packages/content/src/catalog-presentation.ts`
- Modify: `packages/content/src/catalog.ts`

**Steps:**

1. 把证据接口移到共享角色证据模块；按动作所属角色拆分现有 37 条记录。
2. 生成证据总表；旧文件只保留稳定查询 API 和兼容导出。
3. 扩展角色 definition，使官方中文名、游戏数据 ID、武器类型和可选动作展示覆盖由角色目录拥有。
4. 生成浏览器安全的角色展示注册表，删除 `catalog-presentation.ts` 的手写 117 项数组。
5. 将 `friendlyPrimaryActionLabels` 的条目迁入对应角色 definition；`catalog.ts` 只保留通用标签回退规则。

**Verify:**

- Run: `pnpm --filter @gscombat/content test -- character-name-audit.test.ts catalog.test.ts`
- Run: `pnpm --filter @gscombat/analyzer test -- combat-registry-integrity.test.ts`
- Expected: 官方中文名、武器类型、动作标签和 37 条证据与迁移前完全一致。

## 阶段 5：收紧 Content 根入口

**Files:**

- Modify: `packages/content/src/index.ts`
- Modify: internal consumers reported by TypeScript after removing entity wildcard exports
- Modify: `packages/content/package.json` only if an intentional stable subpath is required

**Steps:**

1. 删除根入口对每把武器、每套圣遗物和个别角色目录的通配导出。
2. 仅导出稳定能力：目录投影、查询函数、领域类型、规则、正式内置配置和确有跨包消费者的常量。
3. 内部实现使用相对路径或生成注册表，不把实体模块重新暴露为公共 API。
4. 添加架构测试，禁止根入口重新出现 `weapons/*`、`artifacts/*` 和无说明的 `characters/*` 通配导出。

**Verify:**

- Run: `pnpm typecheck`
- Expected: 全仓消费者只依赖稳定公共能力，根入口不再随实体数量线性增长。

## 阶段 6：全量等价校验和文档收口

**Files:**

- Create: `packages/content/src/content-structure.test.ts`
- Modify: `docs/plans/2026-08-06-architecture-debt-audit.md`
- Modify: `README.md`
- Modify: `README.en.md`

**Steps:**

1. 将重构后的完整投影与阶段 0 基线逐项比较；任何 ID、顺序、标签、状态、原因或数值差异均先定位后处理。
2. 运行生成器新鲜度检查、Content 系统测试和跨包集成测试。
3. 运行全仓类型检查、测试和生产构建。
4. 在 ARCH-003 记录中写明最终目录契约、生成命令、验证数量和遗留项；README 增加维护者操作说明。

**Verify:**

- Run: `pnpm --filter @gscombat/content registries:check`
- Run: `pnpm test`
- Run: `pnpm typecheck`
- Run: `pnpm build`
- Expected: 全部通过；`git diff --check` 无格式错误；ARCH-003 满足全部完成条件，且不包含 ARCH-004 改动。
