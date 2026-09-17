## 1. 受益者站位与内容声明

- [x] 1.1 将已复现的莉奈娅/五郎真实 SQLite 场景固化为聚焦集成测试，先观察后台错误获得旗帜固定防御的失败，再补充通用受益者前台条件及莉奈娅两个 E 的站位、五郎领域限制；验证后台排除、前台保留、25% 队伍防御保留及原指标 ID 不变。
- [x] 1.2 检查来源属性换算路径是否保持真实受益站位，必要时传递现有动作上下文；通过同一集成文件验证最终防御、派生精通和 statContributions 一致，显式选择不绕过条件，来源须前台的既有行为不回退。

## 2. 展示与比较验证

- [x] 2.1 将两个指标名称分别添加（后台）与（前台），保留两个治疗指标和原单事件范围；用 Content 目录与 API 聚焦集成检查返回名称、后台公式来源没有旗帜固定防御，连续点按不合并后续岩伤。
- [x] 2.2 复用既有完整列表/单武器增量集成测试，验证新站位过滤经过同一权威路径且不增加求值次数；保留上轮武器默认状态回归。

## 3. 比例门禁与交付

- [x] 3.1 运行 Content 和 Analyzer 完整测试、相关 API 集成、pnpm typecheck、pnpm build 和 Content registries:check；批准本任务即采用此比例门禁，不为本次非持久化改动重复 mini、鉴权及导入的全量测试。
- [x] 3.2 运行 openspec validate fix-off-field-recipient-buffs --strict 与 git diff --check，审阅 Git 状态确认无关图片和上一轮修改保留；记录实际结果，不经明确授权提交、推送、部署或归档。

## 验证记录（2026-09-10）

- 首个真实 SQLite 集成复现先失败于后台结果包含 gorou.skill.field.defense_buff；补齐通用资格、动作标记和五郎声明后通过。
- 聚焦验证包含前后台差异、全队 25% 与 C6 保留、实际防御转精通、显式选择不绕过、来源属性保留动作所有者上下文，以及既有梦见月来源站场互斥。
- Content 完整测试：40 文件 / 164 测试通过；Analyzer 完整测试：62 文件 / 491 测试通过。
- API 真实 Fastify 集成：moon-and-stellar-team-effects 与 incremental-weapon 两文件 / 18 测试通过，包含两个名称、原指标 ID 和两个治疗指标保留、前后台单事件与轨迹来源。
- 已将莉奈娅/五郎后台场景加入既有增量武器集成：完整列表与单武器结果一致，单武器仍仅两次权威求值。
- pnpm typecheck、pnpm build 通过；Content 构建及测试均验证五个生成注册表。新测试的只读字面量推断曾引发类型错误，已通过显式 EvaluationScenario 变量修正，未改 API 契约。
- openspec validate fix-off-field-recipient-buffs --strict、git diff --check 通过；Git 状态已核对，上一轮武器改动及无关图片保留。未提交、推送、部署或归档。
