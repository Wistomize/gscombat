## 1. 固化海渊终曲实体语义

- [x] 1.1 先修改海渊终曲的聚焦 Content 测试，使其要求两段效果采用可达满状态、平面攻击力使用最终生命值派生与精炼上限，并确认测试在实现前因旧固定上限语义失败。
- [x] 1.2 在海渊终曲实体目录中声明 25% 生命之契比例、精炼 1～5 清除系数与封顶值，使用现有最终生命值派生效果计算平面攻击力；运行 `pnpm --filter @gscombat/content exec vitest run src/combat-action-effects.test.ts -t "海渊终曲"` 验证 R1/R5 声明。
- [x] 1.3 将任意部分清除标记为当前固定满状态分析边界外，使海渊终曲成为可发布单手剑；运行 `pnpm --filter @gscombat/content exec vitest run src/equipment-coverage-ledger.test.ts -t "Finale of the Deep"` 验证目录包含该武器且未放宽其他装备。
- [x] 1.4 运行 `pnpm --filter @gscombat/content registries:check`，确认实体声明仍由现有生成注册表唯一聚合且无过期产物。

## 2. 验证动态效果与武器反事实比较

- [x] 2.1 增加聚焦 Analyzer 集成回归：精炼 1、最终生命值 20000 时生命之契为 5000、平面攻击力为 120；提高生命值后按 150 封顶，并运行对应单个 Vitest 用例。
- [x] 2.2 增加聚焦武器比较回归，验证兼容单手剑角色的 `maximum_reachable` 分析结果包含海渊终曲，且同时应用施放元素战技后的攻击力百分比和动态平面攻击力；运行 `pnpm --filter @gscombat/analyzer exec vitest run test/integration/analysis/analysis.test.ts -t "Finale of the Deep"`。
- [x] 2.3 通过一个既有 HTTP 分析集成入口验证目录与武器更换收益响应仍符合原契约并包含海渊终曲；运行新增的单个 API 集成用例，不新增或修改 TypeBox 字段。

## 3. 比例化交付检查

- [x] 3.1 分别运行 `pnpm --filter @gscombat/content typecheck`、`pnpm --filter @gscombat/analyzer typecheck`、`pnpm --filter @gscombat/api typecheck` 和 `pnpm --filter @gscombat/web typecheck`，确认受影响依赖链类型正确。
- [x] 3.2 分别构建 Content、Analyzer、API 与 Web，确认生产依赖链可用；依据用户“不要过度测试”的要求，不重复运行与本变更无关的全仓角色逻辑测试。
- [x] 3.3 运行 `git diff --check` 并审阅 `git diff --stat`、`git status --short`，确认只包含本变更规划、海渊终曲实现、聚焦测试以及此前用户已有的未提交改动；不提交、推送或部署。
