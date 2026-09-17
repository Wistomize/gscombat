## 1. 默认声明与同组选择

- [x] 1.1 扩展受益者范围以支持明确的全持有者声明，保留已有数组语义；更新遗祀玉珑两项效果及 coverage 说明，通过 Content 注册表校验和类型检查。
- [x] 1.2 修复比较默认按组选择、同状态多贡献共存及来源映射清理；以真实场景验证不改动输入、基线或队友效果。
- [x] 1.3 在现有作者校验中拒绝受益者范围重叠的同组不同默认状态；用聚焦校验确认合法多属性同状态不误报。
- [x] 1.4 按确认范围维护纯水流华完整清契、浪影阔剑和其他表格武器的默认声明/条件，通过实际 HP 未达上限和已达上限、反应/无反应、适配/非适配场景验证；静谧之曲与后台标记按本轮用户明确答复处理。

## 2. 聚焦集成验收

- [x] 2.1 在 Analyzer 集成测试中验证遗祀玉珑 R1/R5 比较等于同武器显式开启生命和精通的权威场景，未开启基线保持原值，重复选择不重复加成。
- [x] 2.2 复用现有赦罪/赤月之形回归，验证角色限定默认、其他可选武器状态不变；不为每把审计武器新增大量单元测试。
- [x] 2.3 通过真实 Fastify/SQLite 集成验证完整列表和单武器精炼接口返回一致，无契约变更；运行现有 Web 增量状态测试保证无需重新计算全列表。

## 3. 验证与交付

- [x] 3.1 运行 Content 完整测试、Analyzer 完整测试、相关 API 和 Web 测试、`pnpm typecheck`、`pnpm build`、Content `registries:check`；本次批准此任务即采用该比例门禁，不重复跑未修改的 mini/鉴权/导入全量套件。
- [x] 3.2 核对 `audit.md` 与实际注册声明一致，记录真实验证结果，运行 `openspec validate fix-weapon-comparison-default-states --strict` 和 `git diff --check`，检查 Git 状态保留无关图片；未经另行授权不提交、推送、部署或归档。

## 验证记录（2026-09-10）

- Content 完整套件：40 文件 / 164 测试通过（包含声明冲突与纯水流华 coverage）。
- Analyzer 完整套件：61 文件 / 487 测试通过；新增真实 SQLite 场景覆盖遗祀玉珑多贡献、纯水流华连续值与封顶、受疗默认、后台弓、反应门槛和专武角色限定。
- API 聚焦集成：2 文件 / 5 测试通过；真实 Fastify 完整列表和单武器接口的遗祀玉珑 R2 结果一致。
- Web 增量状态：1 文件 / 3 测试通过；Analyzer 原有增量回归确认精炼重算仍只有基线 + 单候选两次权威求值。
- pnpm typecheck、pnpm build 通过；Content build/test/typecheck 内的 registries:check 均通过（5 个注册表）。
- openspec validate fix-weapon-comparison-default-states --strict、git diff --check 通过。
- 修正了一处新增 HTTP 测试的请求包装错误：完整 /v1/analysis 直接收场景，单武器接口才使用 scenario 字段。未改变 API 契约。
- 原有无关图片 docs/images/github-social-preview-1280x640.png 保留不动；未提交、推送、部署或归档。
