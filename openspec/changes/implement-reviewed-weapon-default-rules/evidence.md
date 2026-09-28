# 实施证据与未决边界

此文件记录本轮参数来源和准备假设；不是部署记录。数据库仍使用仓库固定版本，不追逐上游。

## 星锋剑

- [BWIKI 星锋剑](https://wiki.biligame.com/ys/星锋剑)，2026-09-27 检索到的共鸣四级条目：80级、基础攻击532、暴击率30.2%，攻击增益24%。共鸣五级才提升至90级。
- 用户已确认按当前可解锁元素全部解锁；固定7.0数据已有风岩雷草水火冰七个旅行者变体，因此暴伤为7×6%=42%。不是队伍元素数量，不限制伤害元素。
- 2026-09-28 用户修订：7.1 未新增神像，默认完成 7.0 五座神像强化，即共鸣五级、90级六突破、R3。此前80级/R1占位口径废止；固定24%/42%被动保持不变，不新增进度选择，不静默迁移已有配置。
- 对照 [共鸣强化阶段表](https://allthings.how/genshin-impact-how-to-upgrade-and-refine-the-exaiphanes-blade/) 和 [精炼描述](https://gamesandchill.com/en/weapons/exaiphanes-blade/)，共鸣四/五级均为R3，区别仅为80/90级；共鸣六/七级才为R4/R5。
- 武器等级与上述面板需在集成用例中同时核验，不能只测24%。

## 锁面板与前后台

- [KQM Snapshot & Dynamic](https://library.keqingmains.com/combat-mechanics/snapshot-and-dynamic)、[香菱](https://library.keqingmains.com/characters/pyro/xiangling)：锅巴与旋火轮锁面板。
- [KQM 菲谢尔](https://keqingmains.com/fischl/)：奥兹召出/重置位置时重新取面板。
- 本轮只给已核实动作声明面板取值身份。效果的 `sourceFieldPresenceAt: stat_capture` 不改变实际前台、不把其他队员晋升前台，也不自动替所有辅助Buff建立时间历史。
- 虹蛇不能把第一次后台命中才取得的攻击倒灌进先前快照；重新取值路径仍需单独核对。

## 筑云

- [KQM 武器实测](https://library.keqingmains.com/evidence/equipment/weapons#cloudforged)：新层刷新持续时间。
- 弓角色爆发冷却按固定数据库 burst 参数的明确索引读取；十八秒窗口不包括恰好在第十八秒发生的第二次扣能。
- 赛索斯扣能、追忆四件套扣能与本人Q分别作为合法来源；不使用队友Q，不以特殊资源冒充普通能量。
- 用户批准的准备假设包括初始能量和补能，不代表实战循环覆盖率。

## 机制核实与明确边界

- 宗室边界已获用户裁决：“不列宗室，这武器没什么人用”。五把统一排除于比较，保留已有装备数据；不继续扩展多段清层模型。已有手选初始层数不代表多段状态机已正确实现，不能据此宣称该机制完成。
- 丝柯克雾切采用[玩家亲自测试报告](https://www.reddit.com/r/SkirkMains/comments/1lecyfo/mistsplitter_full_passive_works_on_skirk_even/)支持的非满能量特例，不据0/0推断所有特殊能量角色。普攻准备允许三层；大招动作声明不预存元素普攻条件。该来源是玩家实测，不是官方数值说明。
- 雾切当次爆发取层参考 [KQM Mistsplitter Stacks Upon Burst Usage](https://library.keqingmains.com/evidence/equipment/weapons#mistsplitter-stacks-upon-burst-usage) 及其[测试表](https://docs.google.com/spreadsheets/d/12wOAIniEr5D4MvmMU4MwxTm4LxaNUpFAAl6g1iAaLhY/edit)。阿贝多、班尼特、凯亚、雷主已核验的先取面板例外声明在动作；三项独立准备取层，非无条件三层。新角色或新指标的快照顺序仍须证据。
- 逐事件来源已贯通 Analyzer/契约/API/Web；普通与混合动作按部分/事件资格解析。零命中不消耗；明确时间可核对0.1/0.2秒清除与1.5秒冷却。无时间证据的默认多部分/聚合多击只首击使用准备效果，不虚构同帧或刷新，这是保守的指标边界。
- 旅行剑与异世界行记保留拾球自疗能力，但要求实际前台和已核实产球准备。[KQM产球表](https://library.keqingmains.com/resources/compendiums/elemental-skill-particles)支持本次声明；未知/较新角色未凭经验批量授予资格，不声称产球能力库已覆盖全部7.0角色。
- 星锋剑80/5/R1候选、基础攻击532.2325436、暴击率0.30168及来源条目已用真实SQLite验证；薙草充能2.56928对应绝缘0.64232已用绝对值验证，不只比较总伤害。
- 233行已分别对应[1–80](audit-1-80.md)、[81–160](audit-81-160.md)、[161–233](audit-161-233.md)静态审计，运行时按规则族验证，不宣称233把逐角色实测。
- 审计额外修复：暗巷选项极性、迪希雅苇海固定受伤、硕果钩当前下落准备、香韵同名取高、铁影精炼阈值标签、雾切附魔条件目录/实际/候选一致。完整与增量的公开边界不新增另一条伤害公式。

## 早期回归记录（保留失败溯源，最终验收见后续记录）

- `pnpm typecheck`：13/13工作区任务通过；之后有少量测试文件修改，最终仍须重新执行。
- `pnpm build`：8/8任务通过。
- Content全量：40文件、165/165通过。旧手选断言已按确认规则核对，保留数值和适用范围断言。
- Web全量：8文件、34/34通过。
- Analyzer统一默认/单候选/规则族重点集成：3文件、30/30通过；随后扩展的规则族文件10/10通过（含按实际来源数值去重及消耗间隔）。这些数字相互有重叠，不相加为独立总数。
- Analyzer比较、赦罪、黑岩绯玉、无垠蔚蓝之歌迁移回归：4文件、31/31通过。
- 最近一次完整Analyzer记录为457通过、71失败；完整API为135通过、24失败。此后已修复其中部分旧手选/候选范围断言，但尚未重新全量运行，不能把旧失败数当成当前准确余量，也不能宣称全部通过。仍需逐项区分旧契约变化、真实回归和并发超时。
- Analyzer/API首次误用裸vitest默认超时的结果已弃用；上述完整记录使用包脚本45秒/60秒超时与受限workers。API仍有两项在并发全量中超时，须复核性能，不直接放宽超时掩盖。
- 注册表检查通过；`openspec validate implement-reviewed-weapon-default-rules --strict`通过。静态检查不代表计算语义验收。
- 已清理本轮coverage生成改动的行末空格。
- 全计划尚未完成；宗室的范围阻塞已解除，其余未完成项继续保留。未提交、未推送、未部署。

## 宗室排除专项验证

- 五把实体采用统一的 `comparison.excluded`，未增加前端硬编码名单，目录仍保留数据。
- `pnpm --filter @gscombat/content test`：166/166通过，含五把武器都在目录且全部排除比较的断言。
- 重新构建Content依赖后，`pnpm --filter @gscombat/analyzer test test/integration/analysis/incremental-weapon.test.ts`：5/5通过；完整列表无宗室，单候选拒绝，原来已装备宗室的基准仍可计算且输入不变。
- `pnpm --filter @gscombat/api test test/integration/incremental-weapon.test.ts`：4/4通过，包含宗室猎枪候选HTTP 400。
- 首次跨包运行读取了旧dist而失败，构建后重跑通过；未通过修改数值期望掩盖失败。类型检查另外发现前一批辰砂间隔测试的元组类型及敌人名称缺失，已修正测试构造，不改变计算语义。

## 收尾修复与集成证据

- `reviewed-weapon-audit-fixes.test.ts`：10例。合法角色/武器的暗巷、苇海、双香韵最高精炼、薙草/绝缘、星锋面板、金珀换入换出、圣祭目标数/间隔、来源武器选择去重。
- 来源面板去重的红→绿：闲云90级、R1流浪乐章、无圣遗物、攻击主题，正确来源攻击为 `(334.849732 + 509.605949) × (1 + .288 + .6) = 1594.332325728`；修前2607.679142928是该选择在三个阶段重复计入。现将自身手选ATK/DEF/HP/EM归于一个已有准备阶段，保留团队来源与旧ID，攻击/精通主题均验证。
- `reviewed-weapon-choice-consistency.test.ts` 与附魔/增量相关3文件13例：班尼特C6领域附魔时雾切满能量选择不再丢失；同武器同R实际装备=完整候选=单候选，无领域/C5/异本体元素负例不误开。
- Analyzer收尾一次全量为566通过、7失败；失败4例是旧武器独立proc/薙草准备断言，3例是新事件来源字段使旧“仅时间窗ID”断言失效。逐项保留原数值/时序验证，迁移后3相关文件108/108通过，未删除测试。
- `support-weapon-choices.test.ts`：4例，目录→真实辅助求值，纯伤害选项隐藏，复用damage action的辅助指标，合法前台及误配/非法前台4xx。
- Web辅助选项流程与星锋输入保存均通过：支持真实请求、选择和辅助计算提交；星锋79.9取79、90取80并保存80/5/R1，不依赖HTML max。
- 辰砂进入已实现目录后补齐官方中文名测试与本地2236字节WebP图标；使用已有固定来源资产生成器 `icons:update --resume`，未覆盖原有海渊图标改动。
- API并发全量记录157通过、3超时失败、7因hook超时跳过；四处均为原用例20/30秒显式预算超时，无断言差异。三个目标单worker复测分别12.12/14.14/11.93秒通过；不改预算、不改数值。最终全仓验收按包和worker顺序运行以避免资源争用。
- 完整报告 `scenario-3-reviewed-weapon-rules`，辅助 `support-metric-3-weapon-rules`；单候选响应携带可选版本，新客户端拒绝跨版本混合。报告只在当前页面内存，刷新/场景变化使旧报告失效；不改SQLite或角色配置存储。
- 上述聚焦记录可能重叠，不累加为独立全仓总数；最终命令结果在验收后补齐。性能独立记录见 [performance.md](performance.md)。
- 串行全仓首次到API时暴露此前hook超时遮住的旧断言：流浪乐章默认“无主题”现在会返回唯一零值选择，而不是完全没有同前缀条目。改为精确断言该零值ID与value=0，仍禁止自动选取任意有收益主题。
- 执行器调整仅关闭测试文件并发，不修改任何超时预算：向已有`--maxWorkers=4`脚本再追加`--maxWorkers=1`会被Vitest拒绝（未执行测试），改用官方`--no-file-parallelism`。包间并发也设为1。
- 后续串行运行还发现四处旧响应契约断言：三个辅助指标仍期待旧 `support-metric-2-artifact-lifecycle`，一处完整/单候选一致性断言未包含新增 `engineVersion`。更新为已发布在本次代码中的版本标识/字段；没有更改伤害、治疗或增益数值期望。修改时上一测试进程已加载旧文件，其失败日志保留，最终验收以重新加载后的结果为准。

## 最终本地验收（2026-09-27）

本轮已批准范围实施完成；以下为最后一次成功执行结果，覆盖前文历史失败记录，不删除失败溯源。

| 检查 | 结果 | 本机原始日志 |
| --- | --- | --- |
| `pnpm test --concurrency=1 -- --no-file-parallelism` | 12/12任务成功，1,082/1,082测试通过；最后一轮11任务复用本次成功缓存、API重新执行171例 | `/tmp/gscombat-accept-test-verified.log` |
| `pnpm typecheck` | 13/13任务成功；最后测试修改后的API类型检查重新执行 | `/tmp/gscombat-accept-typecheck-final.log` |
| `pnpm build` | 8/8任务成功 | `/tmp/gscombat-accept-build-final.log` |
| `openspec validate implement-reviewed-weapon-default-rules --strict` | 通过 | CLI输出 |
| `git diff --check` | 通过 | CLI输出 |

测试分布：Calculator 82、Game Data 9、Contracts 43、Content 166、Analyzer 574、Web 37、API 171。串行参数只控制包间及文件间并发，所有原有超时预算保留。Content任务同时校验生成注册表；小程序参与共享类型检查。

233条规则记录对应233个唯一武器ID，结论无空项。明确包括三星候选、宗室五把排除、必要手选、前后台及来源资格、实际装备/完整比较/单候选一致性。逐武器静态审计与代表规则族集成验证不是233把武器逐角色实战穷举。

已知边界按已批准范围保留：宗室已有配置仍可计算但未实现完整多段清层；未证实产球能力的新角色不虚构资格；缺少逐击时间证据的聚合伤害只给首击消耗准备效果。没有扩展循环模拟、7.1数据更新或辅助指标武器排名。

性能代价已明确披露，见 [performance.md](performance.md)：固定场景完整中位数约2.0秒、单项约73毫秒，较HEAD增加23.65%/17.33%；单项仍仅计算基准和目标候选，不全榜重算。这是有界本机测量，不是生产延迟保证。

交付保持本地`main`工作树，HEAD仍为`394fca05eae90353b6e36d5e0ffc447b5c4c158e`。保留原有未提交改动，未提交、推送、部署、迁移SQLite或归档OpenSpec；这些动作等待用户单独授权。
