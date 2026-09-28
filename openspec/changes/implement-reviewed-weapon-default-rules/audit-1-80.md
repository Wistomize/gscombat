# 武器规则 #1–80 独立实现审计

审计日期：2026-09-27。范围为原 `audit.md` 的 #1–80，对照
`docs/plans/2026-09-17-weapon-effect-review.md` 的已确认规则及用户原话，读取当前实体效果、coverage 和共享解析。
不沿用原审计表的“待实施”描述。这里的“通过”是静态规则核对未发现缺口，不代表逐武器运行验证，更不代表全仓通过。

## 优先处理的发现

1. **#80 已修复：香韵奏者同名治疗加攻重复。**
   `packages/content/src/weapons/symphonist-of-scents/effects.ts` 中 `sweet-echoes.self.attack-percent`
   与 `sweet-echoes.healed-recipient.attack-percent` 原为两个无共享排他组的 ID，后者仅对自己的 ID
   使用 `resolveOneMatchingPartySource`。`packages/analyzer/src/effects/action-effects.ts` 的自动排他仲裁
   只处理显式 `exclusivity`；单 ID 来源去重不会合并这两个分支。
   前台瑶瑶与米卡都装备香韵时，自身治疗可给瑶瑶 32%，米卡治疗又给 32%，违反同名效果不叠加。
   主代理已给两分支增加同一 `symphonist-sweet-echoes` 排他组并按精炼取高（两支使用同一系数表），
   本次复读代码确认修复存在；同伴测试由主代理汇总，不再列为未修复。
2. **#32 当前通过、保留边界：饰铁之花的首次触发命中。**
   当前可选指标均按准备后的命中计算，没有可选择的“明确首次触发本效果”指标；`first_hit` 仅为动作段名，不证明此前未准备。
   因此不把缺少额外首次触发参数判为当前实现缺陷，不新增参数、不排除普通首段。
   若以后新增明确无预准备且负责首次触发的指标，必须声明该事实并排除倒灌；该未来边界不等于当前比较口径失效。
3. **审计中已获主代理授权修复的三处：**
   #2 苇海把迪希雅 `defaultVariantByCharacter` 改为 `fixedVariantByCharacter`，隐藏受伤选项并阻止手选关闭；
   #39 暗巷恢复“最近 5 秒受到伤害”默认 off，on 失效，保留 legacy ready/disabled ID 各自原有数值意义；
   #42 辰砂 coverage 从“仅阿贝多、其他 E 冷却 unsupported”修正为已有的通用同命中加算及冷却实现。
   三处不是共享解析修改。相关规则族运行断言及 coverage ledger 旧测试由主代理接手。

## 共享解析核对

- `packages/content/src/combat/weapon-preparation.ts`：本人／队友资格、前台准备与退场保留、前台指标不预存、满层自动与旧层数排除分开声明。
- `packages/analyzer/src/scenario/capabilities.ts`：命座、元素、治疗对象、仅自盾、扣血对象、反应触发与直伤、合法附魔分别判定；限时 E 次数读取技能数据；只有零间隔命中查询乘敌人数。
- `packages/analyzer/src/scenario/effect-lifecycle.ts`：资格与当前前后台分别求值；保留效果的准备上下文不改真实受益者前台身份。
- `packages/analyzer/src/effects/weapon-state.ts`：明确底色优先、必要条件选项、固定角色规则、按来源的 legacy 兼容；fixed 规则优先于手选。
- `packages/content/src/combat-action-effects.ts`：动作伤害类型／元素／事件过滤；天赋倍率来源与伤害归类分离（例如玛拉妮鲨咬读取 E 倍率而归类 normal）。
- `packages/analyzer/src/effects/action-effects.ts`：已实现命中消费窗口；无明确时序不假装全部同时命中；来源资格后选取最大有效来源；跨 ID 不会自动认定同名效果，#80 现已补共享排他组。
- `packages/analyzer/src/effects/value-resolution.ts`：最终属性转换及独立准备层；雾切读取 `preparationAtSnapshot`，不能从旧总层数 ID 覆盖自动结果。
- `packages/content/src/characters/burst-energy.ts`：玛薇卡、丝柯克的特殊资源不直接当普通能量上限，有显式数据与说明。
- coverage：逐实体检查状态；移动／攻速／回能“不适用”不是缺实现。盾强与治疗加成另读对应 `support-effects.ts`，没有只看伤害 effects 就判遗漏。

## 逐 ID 结论

位置列相对于 `packages/content/src/weapons/`；未特别注明均同时核对该目录 `coverage.ts`。

| ID | 武器 | 结论及核验要点 | 具体位置 |
| --- | --- | --- | --- |
| 1 | 护摩之杖 | 通过：自身 HP、最终 HP 转攻；半血可选默认关，不因主动扣血自动开 | `staff-of-homa/effects.ts` |
| 2 | 苇海信标 | 已修控件缺口：迪希雅固定受伤；其他角色默认关；E 命中资格与武器专属无盾 HP 独立 | `beacon-of-the-reed-sea/effects.ts` |
| 3 | 四风原典 | 通过：前台 0–4 默认 2，后台不残留；仅元素增伤 | `lost-prayer-to-the-sacred-winds/effects.ts` |
| 4 | 阿莫斯之弓 | 通过：基础 NA/CA；甘雨固定五层，其他默认零，目标伤害类型过滤 | `amos-bow/effects.ts` |
| 5 | 息灾 | 通过：预 E 六层；翻倍使用 stat_capture 前后台，不直接按伤害发生时翻倍 | `calamity-queller/effects.ts` |
| 6 | 狼的末路 | 通过：常驻与团队开关分开；全队加攻默认关，团队来源不依附当前武器 | `wolfs-gravestone/effects.ts` |
| 7 | 螭骨剑 | 通过：0–5 默认五，后台保留，不模拟受击掉层 | `serpent-spine/effects.ts` |
| 8 | 决斗之枪 | 通过：场景敌人数分支；双敌 DEF 与 ATK，单敌较高 ATK | `deathmatch/effects.ts` |
| 9 | 匣里灭辰 | 通过：水／火底优先；无明确底色时按队伍资格显示默认开关 | `dragons-bane/effects.ts` |
| 10 | 和璞鸢 | 通过：前台有本人命中准备七层及满层增伤；后台零 | `primordial-jade-winged-spear/effects.ts` |
| 11 | 贯虹之槊 | 通过：前台五层；适用盾来源才翻倍；装备者盾强单列 | `vortex-vanquisher/effects.ts`, `support-effects.ts` |
| 12 | 试作澹月 | 通过：已提前命中要害默认关；攻击不局限当前重击 | `prototype-crescent/effects.ts` |
| 13 | 斫峰之刃 | 通过：同贯虹；仅自身盾强不冒充队伍盾量 | `summit-shaper/effects.ts`, `support-effects.ts` |
| 14 | 无工之剑 | 通过：同贯虹；队友仅自盾不算装备者盾 | `the-unforged/effects.ts`, `support-effects.ts` |
| 15 | 尘世之锁 | 通过：同贯虹；真实配置命座决定造盾资格 | `memory-of-dust/effects.ts`, `support-effects.ts` |
| 16 | 匣里龙吟 | 通过：火／雷条件，明确水／冰底不能被队伍元素覆盖 | `lions-roar/effects.ts` |
| 17 | 雨裁 | 通过：水／雷条件，明确冲突底色优先 | `rainslasher/effects.ts` |
| 18 | 黑岩斩刀 | 通过：零至三层默认零，不从敌人数推击杀 | `blackcliff-slasher/effects.ts` |
| 19 | 黑岩长剑 | 通过：同黑岩斩刀，各自武器选择来源隔离 | `blackcliff-longsword/effects.ts` |
| 20 | 黑岩刺枪 | 通过：同黑岩斩刀 | `blackcliff-pole/effects.ts` |
| 21 | 黑岩战弓 | 通过：同黑岩斩刀 | `blackcliff-warbow/effects.ts` |
| 22 | 黑岩绯玉 | 通过：同黑岩斩刀 | `blackcliff-agate/effects.ts` |
| 23 | 千岩长枪 | 通过：实际璃月人数，含本人，ATK/CR 分别计算 | `lithic-spear/effects.ts` |
| 24 | 千岩古剑 | 通过：同千岩长枪，无空位补满 | `lithic-blade/effects.ts` |
| 25 | 恶王丸 | 通过：实际全队普通能量上限求和及精炼封顶，仅爆发归类 | `akuoumaru/effects.ts` |
| 26 | 断浪长鳍 | 通过：同恶王丸 | `wavebreakers-fin/effects.ts` |
| 27 | 曚云之月 | 通过：同恶王丸 | `mouuns-moon/effects.ts` |
| 28 | 柔灯挽歌 | 通过：团队燃烧条件加本人燃烧／草伤资格；常驻独立 | `lumidouce-elegy/effects.ts` |
| 29 | 撼地者 | 通过：队伍真实火相关反应资格，仅 E 增伤 | `earth-shaker/effects.ts` |
| 30 | 拾慧铸熔 | 通过：普通三类及月三类；本人触发，不以特殊直伤冒充 | `flame-forged-insight/effects.ts` |
| 31 | 风信之锋 | 通过：本人反应资格；后台保留；ATK 与 EM 同时加入 | `missive-windspear/effects.ts` |
| 32 | 饰铁之花 | 通过（边界见上文）：当前指标按准备后命中，无明确首次触发指标；不以 first_hit 名称推断无准备 | `mailed-flower/effects.ts` |
| 33 | 万国诸海图谱 | 通过：本人反应自动两层、退场保留；仅元素普通增伤 | `mappa-mare/effects.ts` |
| 34 | 白辰之环 | 通过：本人雷相关反应；反应元素与受益者本元素双过滤，同类排他 | `hakushin-ring/effects.ts` |
| 35 | 盈满之实 | 通过：本人反应五层；EM 与 -25% ATK 同时计入 | `fruit-of-fulfillment/effects.ts` |
| 36 | 匣里日月 | 通过：NA 和 E/Q 互相准备；仅前台；两支按伤害类型过滤 | `solar-pearl/effects.ts` |
| 37 | 试作斩岩 | 通过：前台四层 ATK/DEF，后台不预存；不改变基础攻击 | `prototype-rancour/effects.ts` |
| 38 | 铁蜂刺 | 通过：前台自身元素命中而非反应资格，两层普通增伤 | `iron-sting/effects.ts` |
| 39 | 暗巷闪光 | 已修控件极性：最近五秒受伤默认 off；on 无增伤；legacy ID 数值语义不变 | `the-alley-flash/effects.ts` |
| 40 | 白影剑 | 通过：前台四层 ATK/DEF，进入防御转攻前计算，后台不预存 | `whiteblind/effects.ts` |
| 41 | 赤角石溃杵 | 通过：常驻 DEF；NA/CA 最终 DEF 同命中加算，不生成独立 proc | `redhorn-stonethresher/effects.ts` |
| 42 | 辰砂之纺锤 | 实现通过、已修 coverage：通用 E 同命中加算，1.5 秒重触发／0.1 秒清除 | `cinnabar-spindle/effects.ts`, `coverage.ts` |
| 43 | 磐岩结绿 | 通过：HP 常驻先算，最终 HP 转固定 ATK | `primordial-jade-cutter/effects.ts` |
| 44 | 不灭月华 | 通过：常驻治疗与 NA 最终 HP 加算；只排除回能的单次伤害意义 | `everlasting-moonglow/effects.ts`, `support-effects.ts` |
| 45 | 碧落之珑 | 通过：预 Q 有效期；自身对应元素、实际最终 HP 与封顶 | `jadefalls-splendor/effects.ts` |
| 46 | 西福斯的月光 | 通过：自身／其他队友份额分开、多来源可叠、保留转换来源限制 | `xiphos-moonlight/effects.ts` |
| 47 | 玛海菈的水色 | 通过：装备者合法 EM 转固定 ATK，自身不重复获队友份额 | `makhaira-aquamarine/effects.ts` |
| 48 | 流浪的晚星 | 通过：同玛海菈；多来源分别计算，替换当前武器不移除队友来源 | `wandering-evenstar/effects.ts` |
| 49 | 苍古自由之誓 | 通过：本人反应资格；常驻独立，大乐章 ATK 跨武器同类取高 | `freedom-sworn/effects.ts` |
| 50 | 终末嗟叹之诗 | 通过：E/Q 命中能力预积符；符记无独立到期，常驻／团队 EM 独立 | `elegy-for-the-end/effects.ts` |
| 51 | 松籁响起之时 | 通过：本人 NA/CA 预积符，退场保留；攻速不加单次伤害 | `song-of-broken-pines/effects.ts` |
| 52 | 圣显之钥 | 通过：20 秒内有效 E 命中，0.3 秒间隔，可达层与三层团队效果分开 | `key-of-khaj-nisut/effects.ts` |
| 53 | 千夜浮梦 | 通过：实际同／异元素队友数；自身排除团队份额，多持有者叠加 | `a-thousand-floating-dreams/effects.ts` |
| 54 | 赤沙之杖 | 通过：常驻保留；前台 E 合法命中与敌人数决定可达层，后台不预存 | `staff-of-the-scarlet-sands/effects.ts` |
| 55 | 雾切之回光 | 通过：已改独立条件自动层数，本元素过滤、能量控件及快照扣层；旧总层数排除 | `mistsplitter-reforged/effects.ts`；`effects/value-resolution.ts` |
| 56 | 波乱月白经津 | 通过：至少一位其他成员有 E，本人 E 消耗两层，仅 NA 增伤 | `haran-geppaku-futsu/effects.ts` |
| 57 | 飞雷之弦振 | 通过：NA/E 两层与能量未满第三层分开，非 NA 不展示能量项 | `thundering-pulse/effects.ts` |
| 58 | 冬极白星 | 通过：按用户原话“只要有命中能力”四层；已修确认文档派生段的逐类型矛盾 | `polar-star/effects.ts` |
| 59 | 若水 | 通过：默认附近敌人满效果；HP 与普通伤害分开 | `aqua-simulacra/effects.ts` |
| 60 | 猎人之径 | 通过：所有适用 CA 自动同命中 EM 加算，不再排首次触发段 | `hunters-path/effects.ts` |
| 61 | 最初的大魔术 | 通过：同元素含本人，三人封顶；CA 常驻，移速不折伤害 | `the-first-great-magic/effects.ts` |
| 62 | 白雨心弦 | 通过：E、自身进行治疗、作用于本人契分别资格；三层才有 Q CR | `silvershower-heartstrings/effects.ts` |
| 63 | 图莱杜拉的回忆 | 通过：前台预 E 满额 NA，后台清除；攻速不折伤害 | `tulaytullahs-remembrance/effects.ts` |
| 64 | 万世流涌大典 | 通过：可靠自身扣血自动三层，否则必要手选零默认；仅前台 CA | `tome-of-the-eternal-flow/effects.ts` |
| 65 | 金流监督 | 通过：同万世资格；NA/CA 与星超导目标乘区分别声明 | `cashflow-supervision/effects.ts` |
| 66 | 鹤鸣余音 | 通过：装备者合法下落能力、团队下落增伤及退场保留 | `cranes-echoing-call/effects.ts` |
| 67 | 神乐之真意 | 通过：E 施放续层，24 秒刷新可达三层；满层元素与星超导分区 | `kaguras-verity/effects.ts` |
| 68 | 冲浪时光 | 通过：仅 NA 的零至四层、默认四；初始层不依赖蒸发 | `surfs-up/effects.ts` |
| 69 | 寝正月初晴 | 通过：本人扩散／星扩散、E 命中、Q 命中三项独立，不用直伤冒充反应 | `sunny-morning-sleep-in/effects.ts` |
| 70 | 裁叶萃光 | 通过：元素 NA／合法附魔资格；NA、E 同命中加值，E 元素伤害本身不能解锁 | `light-of-foliar-incision/effects.ts` |
| 71 | 有乐御簾切 | 通过：真实岩伤命中触发额外 NA/E，不仅检查岩元素／盾；DEF 不翻倍 | `uraku-misugiri/effects.ts` |
| 72 | 岩峰巡歌 | 通过：NA／下落预两层，先 DEF 再来源 DEF 转团队元素增伤，实际值封顶取高 | `peak-patrol-song/effects.ts` |
| 73 | 静水流涌之辉 | 通过：自己／其他队员扣血独立；单人无队友分支，无可靠来源才手选 | `splendor-of-tranquil-waters/effects.ts` |
| 74 | 赦罪 | 通过：克洛琳德固定三层、其他零；常驻 CD 保留 | `absolution/effects.ts` |
| 75 | 苍耀 | 通过：本人 E 资格；丝柯克专属零能量额外项不扩展特殊资源标签 | `azurelight/effects.ts` |
| 76 | 薙草之稻光 | 通过：预 Q ER 先算；合法 ER 转 ATK、封顶与绝缘分别计算 | `engulfing-lightning/effects.ts` |
| 77 | 赤月之形 | 通过现有比较口径：本人 CA 获 25% 契低档，仆人自动高档，不将 25% 当 30% | `crimson-moons-semblance/effects.ts` |
| 78 | 支离轮光 | 通过：本人 E 预触发；本人盾而非队友盾解锁团队月感电乘区 | `fractured-halo/effects.ts` |
| 79 | 血染荒城 | 通过：预 Q 月感电加成；本人实际月感电触发另给通用 CD | `bloodsoaked-ruins/effects.ts` |
| 80 | 香韵奏者 | 已修复：自身与他源甘美回奏共享排他组取高；范围／前后台资格保留 | `symphonist-of-scents/effects.ts` |

## 已运行证据与限制

- 本审计前四个 owned Analyzer 场景文件复核：87 通过（60 + 20 + 5 + 2），只说明该聚焦范围。
- 随后的尘光 fixture 审阅修复：改合法弓及温迪后台风眼持续伤害，半额 baseline 走完整 `evaluateScenario`；聚焦 `-t 'Angelos Heptades'` 为 3 通过、57 跳过。
- 三实体声明修订后 `pnpm --filter @gscombat/content typecheck` 通过，含 8 个生成注册表一致性检查；相关变更 `git diff --check` 通过。
- 本文件不把上述结果扩展为 80 把武器的逐项运行证明。三实体规则族新断言、辰砂发布 ledger 迁移及 #80 已修复后的运行证据由主代理汇总核验。
