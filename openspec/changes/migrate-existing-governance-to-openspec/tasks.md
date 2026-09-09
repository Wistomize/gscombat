## 1. 建立无损迁移台账

- [x] 1.1 逐份审计 ADR-0001 至 ADR-0019，记录当前性、主要归属、目标 OpenSpec 位置和实时复核证据；通过检查迁移映射中 ADR-0001 至 ADR-0019 各有且只有一个主要归属验证完成。
- [x] 1.2 对照用户确认的项目范围和当前 `AGENTS.md`，保留 Git 与 OpenSpec 规则，并识别、移除来自其他 Python Agent 产品的 DeepSeek LLM 测试、Python 风格和 CodeGraph 规则；通过逐项勾稽确认没有残留不适用约束。
- [x] 1.3 确认所有原 ADR 路径和正文未被迁移修改；通过 `git diff --name-status -- docs/adr` 只允许迁移所需的新索引或显式批准的引用更新。

## 2. 核对当前系统事实

- [x] 2.1 使用当前实现、契约和测试核对核心动作结果、辅助指标、反事实比较和权威求值入口；将可验证路径记入迁移映射，并标记与当前实现不一致的 ADR 条目。
- [x] 2.2 核对语义动作、反应假设、事件时间线、元素附着和可解释轨迹的当前类型与局限；以 Calculator、Content 和 Analyzer 的系统/集成测试作为验证证据。
- [x] 2.3 核对浏览器本地配置、可选邀请码会话、SQLite 工作空间、revision 并发控制与旧版配置兼容性；以 TypeBox 契约、API 路由和 workspace 集成测试验证 ADR-0001/0013 的当前合并语义。
- [x] 2.4 核对固定数据、语义动作证据、实体自有声明和生成注册表守卫；以开发指南、Content 审计与 registry freshness 测试验证当前 authoring contract。

## 3. 迁移全局约束与 Agent 入口

- [x] 3.1 将复核后仍有效的模块责任、权威计算链路、Content 归属、公开边界和验证要求补充到 `openspec/config.yaml`；通过 `openspec doctor --json` 验证配置可读且健康。
- [x] 3.2 将 `AGENTS.md` 收窄为 GSCombat 适用的 Git、OpenSpec 和通用测试边界，移除 DeepSeek LLM、Python 风格与 CodeGraph 章节；通过迁移台账逐项比对验证。
- [x] 3.3 对照 ADR-0019 检查 `AGENTS.md` 与 config 的 OpenSpec 触发、豁免、`skip_specs` 和 ADR 职责；通过迁移映射记录唯一的规则入口及同步子集。

## 4. 建立 OpenSpec 当前行为基线

- [x] 4.1 创建 `analysis/core-action-results` 主规格，覆盖核心动作边界、支持指标分离、公式轨迹和反事实比较；通过 `openspec validate analysis/core-action-results --type spec --strict --no-interactive` 验证。
- [x] 4.2 创建 `analysis/action-semantics` 主规格，覆盖语义映射、事件时间线、反应前提、当前明确局限和可解释结果；通过 `openspec validate analysis/action-semantics --type spec --strict --no-interactive` 验证。
- [x] 4.3 创建 `workspace/build-persistence` 主规格，覆盖本地优先配置、可选邀请码同步、版本和兼容边界；通过 `openspec validate workspace/build-persistence --type spec --strict --no-interactive` 验证。
- [x] 4.4 创建 `content/authoring-contract` 主规格，覆盖固定数据、审阅证据、实体自有声明与生成注册表；通过 `openspec validate content/authoring-contract --type spec --strict --no-interactive` 验证。
- [x] 4.5 在当前公开契约确实形成稳定边界时创建 `architecture/public-entrypoints` 主规格；如只能描述内部文件布局，则在迁移映射中记录不创建的理由。对已创建规格运行严格验证。

## 5. 建立引用和一致性守卫

- [x] 5.1 为每份主规格添加来源 ADR 和当前验证证据，为 ADR 索引添加对应 OpenSpec 链接；通过检查全部相对路径存在验证无断链。
- [x] 5.2 更新中英文开发指南，说明主规格、ADR、Agent 规则和 active change 的职责；通过人工对照中英文章节与链接验证一致。
- [x] 5.3 运行 `openspec validate --specs --strict --no-interactive`、`openspec doctor --json`、`git diff --check` 和 `git status --short`，并确认没有产品代码或用户所有的未跟踪图片被误改。
