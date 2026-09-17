# 实施分类对账（2026-09-17）

本表替代初始 audit.md 中与用户后续确认冲突的建议，记录当前 63 个 inventory ID 的三类入口，不是新的游戏机制结论。

- 普通一/二件属性默认常驻，仍按实际装备件数、输出/接受者归属及伤害类型过滤；不将盾强或受治疗效果给错角色。
- 每个已维护四件伤害/受益条款均显式声明生命周期；常驻反应加成/充能换算也显式标记 constant。
- 表中的 on_field/off_field/any 指实际来源站位；retain_on_exit 是准备后保留，clear_on_exit 是用户确认的退场清除；不是从“全队受益”推导后台可触发。
- 历史效果 ID 留作兼容，不会绕过新资格。excluded 条款不产生数值。
- **不在本轮实现**：三套最高三星新增机制，已确认排除的累计治疗、击杀、固定回能/自身抗性，以及磐岩月结晶映射。
- 角色技能窗口依据另见 [skill-opportunity-evidence.md](skill-opportunity-evidence.md)；参数存在性验证不等价于全部特殊技能模式已经验收。
- 清单从当前实体声明/生成注册表与覆盖账本交叉提取；集中回归结果另记 implementation-progress.md。

| # | 套装 / inventory ID | 数值入口 | 四件准备/持续与明确排除 |
|---|---|---|---|
| 1 | 风起之日 / `ADayCarvedFromRisingWinds` | 伤害 | capability准备/any；retain_on_exit；装备者自身普攻、重击、战技或爆发可命中，默认完成准备；前后台均生效 |
| 2 | 冒险家 / `Adventurer` | 伤害 | 4件：开放世界开启宝箱事件不属于当前选定核心动作。 |
| 3 | 悠古的磐岩 / `ArchaicPetra` | 伤害 | none准备/on_field；retain_on_exit；按用户选择的晶片元素准备，来源退场后保留；未拾取默认不计，不映射月结晶增伤 |
| 4 | 晨星与月的晓歌 / `AubadeOfMorningstarAndMoon` | 伤害 | none准备/any；while_applicable；当前后台；前台不计短暂保留 |
| 5 | 战狂 / `Berserker` | 伤害 | none准备/any；while_applicable；仅手选装备者生命低于 70% 且当前前台生效；扣血能力不等于低血状态 |
| 6 | 冰风迷途的勇士 / `BlizzardStrayer` | 伤害 | none准备/any；while_applicable；装备者前台且队伍有冰元素时默认20%暴击；仅本套准备，不改变全局敌人附着<br>none准备/any；while_applicable；外部冻结开关开启时追加20%暴击；开关不能绕过前台与队伍有冰的要求 |
| 7 | 染血的骑士道 / `BloodstainedChivalry` | 伤害 | 不计入：用户确认：四件套击杀准备与免体力均不计入；旧选择不恢复增伤<br>4件：用户确认四件套暂不计入，保留旧效果 ID 仅用于兼容；不默认击杀条件。<br>4件：重击不消耗体力改变后续连续施放能力，不改变当前这一击的期望伤害。 |
| 8 | 勇士之心 / `BraveHeart` | 伤害 | none准备/any；while_applicable；用户确认：四件套前台按平均 15% 增伤折算，不推断敌人生命比例 |
| 9 | 天之美赐 / `CelestialGift` | 伤害 | skill_cast准备/any；retain_on_exit；仅有魔女课业机制的装备者默认完成课业并施放战技；秘仪元素集合固定按来源与真实前台解析 |
| 10 | 炽烈的炎之魔女 / `CrimsonWitchOfFlames` | 伤害 | 常驻/属性或伤害类型筛选<br>capability准备/on_field；retain_on_exit；按装备者十秒内战技冷却、充能/连段及合法祭礼重置推导，最多三层；持续命中不增加施放次数 |
| 11 | 深林的记忆 / `DeepwoodMemories` | 伤害 | capability准备/any；retain_on_exit；装备者具备战技或爆发命中能力，默认已触发；退场保留，不要求持续命中 |
| 12 | 守护之心 / `DefendersWill` | 伤害 | 4件：用户确认本轮不计入此条款。需要队伍元素构成统计与承伤元素抗性指标。 |
| 13 | 沙上楼阁史话 / `DesertPavilionChronicle` | 伤害 | capability准备/on_field；clear_on_exit；前台装备者具备合法重击命中能力，默认已准备四件套；退场清除<br>4件：普通攻击速度改变连续攻击次数，不改变当前单次核心命中的期望伤害。 |
| 14 | 影中沉凝的幻灭 / `DisenchantmentInDeepShadow` | 伤害 | none准备/any；while_applicable；四件套超导增伤仅前台计入<br>none准备/any；while_applicable；四件套星超导增伤仅前台计入<br>capability准备/any；clear_on_exit；前台且队伍具有超导或星超导触发条件时默认目标受影响；不要求装备者本人触发 |
| 15 | 来歆余响 / `EchoesOfAnOffering` | 伤害 | none准备/any；while_applicable；按平均触发率 1 / 1.99188736 折算同击基础区加算；不模拟随机事件或攻击频率 |
| 16 | 绝缘之旗印 / `EmblemOfSeveredFate` | 伤害 | 常驻/属性或伤害类型筛选 |
| 17 | 深廊终曲 / `FinaleOfTheDeepGalleries` | 伤害 | none准备/any；retain_on_exit；非普通元素能量角色默认满足零元素能量，按当前普攻分支准备；后台保留<br>none准备/any；retain_on_exit；非普通元素能量角色默认满足零元素能量，按当前爆发分支准备；后台保留 |
| 18 | 乐园遗落之花 / `FlowerOfParadiseLost` | 伤害 | capability准备/any；retain_on_exit；未证明装备者的绽放系列触发资格，仅保留四件套基础反应增伤<br>不计入：采用无触发资格零层、有资格满层的默认策略；旧中间层仅兼容<br>capability准备/any；retain_on_exit；装备者自身与队伍具备绽放系列反应触发资格，默认满层；单有直伤月绽放指标不构成资格 |
| 19 | 谐律异想断章 / `FragmentOfHarmonicWhimsy` | 伤害 | none准备/on_field；clear_on_exit；前台装备者自身生命之契可持续变化时默认三层；其他情形默认零层，可手选准备层数；后台不计 |
| 20 | 赌徒 / `Gambler` | 伤害 | 4件：击败敌人后清除元素战技冷却仅改变后续施放机会，需要循环、击杀和冷却状态模型。 |
| 21 | 饰金之梦 / `GildedDreams` | 伤害 | capability准备/any；retain_on_exit；装备者自身具备合法反应触发条件，默认准备；仅统计其他实际队员，后台可触发 |
| 22 | 角斗士的终幕礼 / `GladiatorsFinale` | 伤害 | none准备/any；while_applicable；四件套仅当前前台及实际近战武器普攻生效 |
| 23 | 黄金剧团 / `GoldenTroupe` | 伤害 | 常驻/属性或伤害类型筛选<br>none准备/any；while_applicable；装备者在后台；前台不计短暂保留 |
| 24 | 沉沦之心 / `HeartOfDepth` | 伤害 | skill_cast准备/on_field；clear_on_exit；默认已施放元素战技；四件套仅当前前台生效 |
| 25 | 炉火融炼之心 / `HeartOfTheFurnace` | 伤害 | capability准备/any；retain_on_exit；装备者自身具备星烁反应触发资格，默认已触发；前后台均保留；或：capability准备/any；retain_on_exit；装备者自身具有符合当前队伍与站位的星烁伤害能力，默认已造成伤害；不借队友的伤害能力 |
| 26 | 华馆梦醒形骸记 / `HuskOfOpulentDreams` | 伤害 | 不计入：华馆按站位与岩元素攻击能力自动取零层或四层，旧中间层不再计入<br>none准备/any；while_applicable；华馆装备者在后台，默认四层问答；或：capability准备/any；while_applicable；华馆前台装备者自身具备岩元素攻击能力，默认四层问答 |
| 27 | 教官 / `Instructor` | 伤害 | capability准备/on_field；retain_on_exit；装备者自身与队伍具备合法反应条件，默认前台触发后退场保留120全队精通 |
| 28 | 渡过烈火的贤人 / `Lavawalker` | 伤害 | none准备/any；while_applicable；用户确认：前台且队伍有火时默认生效，不改变全局敌人附着<br>2件：本轮不计算装备者承伤元素抗性，不转为敌人减抗或其他增益。 |
| 29 | 长夜之誓 / `LongNightsOath` | 伤害 | 不计入：改为按合法下落能力自动取零层或五层，旧中间层不计入<br>capability准备/any；clear_on_exit；装备者当前在前台且具有自身或队友提供的合法下落条件，默认准备五层；后台仅保留二件套 |
| 30 | 幸运儿 / `LuckyDog` | 伤害 | 4件：开放世界拾取事件不属于当前选定核心动作。 |
| 31 | 被怜爱的少女 / `MaidenBeloved` | 治疗输出、受益者 | skill_cast准备/on_field；retain_on_exit；默认已施放战技或爆发，退场保留全队20%受治疗加成；不要求命中或治疗能力<br>2件治疗输出：常驻/属性或伤害类型筛选 |
| 32 | 逐影猎人 / `MarechausseeHunter` | 伤害 | none准备/on_field；clear_on_exit；前台有有效扣血来源时默认三层；否则零层，允许显式选择层数；后台不计 |
| 33 | 武人 / `MartialArtist` | 伤害 | skill_cast准备/on_field；clear_on_exit；默认已施放元素战技；四件套仅当前前台生效 |
| 34 | 穹境示现之夜 / `NightOfTheSkysUnveiling` | 伤害 | capability准备/any；while_applicable；装备者当前在前台，队伍具有月曜转换及合法元素触发条件；后台不保留暴击与蓄念 |
| 35 | 回声之林夜话 / `NighttimeWhispersInTheEchoingWoods` | 伤害 | skill_cast准备/on_field；clear_on_exit；前台默认施放战技，保留基础岩伤20%；后台不计<br>capability准备/any；clear_on_exit；前台且队伍具有岩与可结晶元素攻击条件，默认结晶护盾或月笼，追加30%岩伤；不借普通护盾开关 |
| 36 | 昔日宗室之仪 / `NoblesseOblige` | 伤害 | burst_cast准备/on_field；retain_on_exit；默认已施放元素爆发；来源退场后保留，同名全队增益不叠加 |
| 37 | 水仙之梦 / `NymphsDream` | 伤害 | capability准备/any；clear_on_exit；按装备者合法命中类型去重自动取层数，三类即满档；前台准备，后台四件套不计 |
| 38 | 黑曜秘典 / `ObsidianCodex` | 伤害 | none准备/any；while_applicable；当前前台且来源具有夜魂资格 |
| 39 | 海染砗磲 / `OceanHuedClam` | 治疗输出 | 2件治疗输出：常驻/属性或伤害类型筛选<br>4件：用户确认本轮不计入此条款。需要治疗累计、溢出治疗、延迟独立伤害事件、上限与专属结算规则。原机制允许后台治疗记录，但本工具不默认累计满额。 |
| 40 | 苍白之火 / `PaleFlame` | 伤害 | capability准备/on_field；clear_on_exit；前台七秒内合法战技命中机会，间隔至少0.3秒；多目标同击只算一次，后台不保留四件套 |
| 41 | 祭水之人 / `PrayersForDestiny` | 无数值入口 | 1件：用户确认本轮不计入此条款。当前模型将元素状态作为已选快照，不追踪元素附着时长或循环时间线。 |
| 42 | 祭火之人 / `PrayersForIllumination` | 无数值入口 | 1件：用户确认本轮不计入此条款。当前模型将元素状态作为已选快照，不追踪元素附着时长或循环时间线。 |
| 43 | 祭雷之人 / `PrayersForWisdom` | 无数值入口 | 1件：用户确认本轮不计入此条款。当前模型将元素状态作为已选快照，不追踪元素附着时长或循环时间线。 |
| 44 | 祭冰之人 / `PrayersToSpringtime` | 无数值入口 | 1件：用户确认本轮不计入此条款。当前模型将元素状态作为已选快照，不追踪元素附着时长或循环时间线。 |
| 45 | 行者之心 / `ResolutionOfSojourner` | 伤害 | none准备/any；while_applicable；四件套仅当前前台重击事件生效，不改变通用面板 |
| 46 | 逆飞的流星 / `RetracingBolide` | 伤害、受益者 | capability准备/any；clear_on_exit；当前前台装备者有有效护盾来源保护，默认四件套生效；不借队友自盾；或：capability准备/any；clear_on_exit；当前前台且队伍具有普通结晶护盾条件，默认四件套生效；月结晶不视作护盾<br>2件受益者：常驻/属性或伤害类型筛选 |
| 47 | 血红之证 / `ScarletProof` | 伤害 | capability准备/any；clear_on_exit；前台装备者所在队伍具有星扩散触发条件，默认四件套生效；后台不计 |
| 48 | 学士 / `Scholar` | 伤害 | 4件：获得元素微粒或晶球后的队伍能量恢复属于后续循环资源，不改变当前核心动作的一次期望伤害。 |
| 49 | 烬城勇者绘卷 / `ScrollOfTheHeroOfCinderCity` | 伤害 | capability准备/any；retain_on_exit；由装备者自身合法反应确定关联元素，夜魂资格仅取装备者；默认准备、前后台均保留<br>2件：元素能量恢复只改变后续循环资源，不改变当前核心动作的一次期望伤害。 |
| 50 | 追忆之注连 / `ShimenawasReminiscence` | 伤害 | skill_cast准备/on_field；clear_on_exit；普通元素能量角色默认已施放战技并支付15能量；退场不计，特殊资源不替代元素能量<br>4件：消耗元素能量影响后续元素爆发可用性，不改变当前已选核心动作的一次期望伤害。 |
| 51 | 纺月的夜歌 / `SilkenMoonsSerenade` | 伤害 | capability准备/any；retain_on_exit；装备者自身可造成元素伤害，默认取得崇信；前后台均生效，同种月辉去重 |
| 52 | 昔时之歌 / `SongOfDaysPast` | 治疗输出 | 2件治疗输出：常驻/属性或伤害类型筛选<br>4件：用户确认本轮不计入此条款。需要全队治疗记录、溢出治疗、上限、命中次数消耗与受益角色状态。原机制允许后台来源记录，伤害加算只作用于前台受益者；本工具暂不计算。 |
| 53 | 千岩牢固 / `TenacityOfTheMillelith` | 伤害、受益者 | capability准备/any；retain_on_exit；实际站位下具备持续战技命中能力时默认生效；仅单次命中需显式选择，队友不能代为触发 |
| 54 | 流放者 / `TheExile` | 伤害 | 4件：施放元素爆发后的队伍能量恢复属于后续循环资源，不改变当前核心动作的一次期望伤害。 |
| 55 | 如雷的盛怒 / `ThunderingFury` | 伤害 | none准备/any；while_applicable；用户确认：四件套反应增伤仅前台生效<br>none准备/any；while_applicable；用户确认：四件套超激化加算增伤仅前台生效<br>none准备/any；while_applicable；用户确认：四件套特殊反应增伤仅前台生效<br>4件：元素战技冷却缩减只影响后续循环可施放次数，不改变当前核心动作的一次期望伤害。 |
| 56 | 平息鸣雷的尊者 / `Thundersoother` | 伤害 | none准备/any；while_applicable；用户确认：前台且队伍有雷时默认生效，不改变全局敌人附着<br>2件：本轮不计算装备者承伤元素抗性，不转为敌人减抗或其他增益。 |
| 57 | 奇迹 / `TinyMiracle` | 无数值入口 | 2件：用户确认本轮不计入此条款。当前指标流水线未建模承伤元素抗性或防御指标。<br>4件：用户确认本轮不计入此条款。需要承伤元素抗性指标、受击元素和冷却窗口状态。 |
| 58 | 游医 / `TravelingDoctor` | 受益者 | 2件受益者：常驻/属性或伤害类型筛选<br>4件：游医最高稀有度为3星，按当前范围不维护其四件套独立辅助指标。 |
| 59 | 未竟的遐思 / `UnfinishedReverie` | 伤害 | 不计入：旧脱战/衰减档位仅兼容解析；现按队伍火草资格自动判定<br>none准备/any；while_applicable；用户确认：队伍同时有火、草时默认满额；前后台均生效，不推断敌人燃烧状态 |
| 60 | 辰砂往生录 / `VermillionHereafter` | 伤害 | burst_cast准备/on_field；clear_on_exit；默认已施放爆发；无有效主动扣血来源，仅计基础8%攻击<br>不计入：旧手选层数兼容保留；由实际扣血资格自动决定零层或满层<br>burst_cast准备/on_field；clear_on_exit；默认已施放爆发；有效主动扣血来源按已确认策略准备满层 |
| 61 | 翠绿之影 / `ViridescentVenerer` | 伤害 | 常驻/属性或伤害类型筛选<br>capability准备/on_field；retain_on_exit；装备者具备对应元素扩散资格，默认前台触发后退场保留；同元素减抗不叠加<br>capability准备/on_field；retain_on_exit；装备者具备星扩散反应触发资格，默认前台触发后退场保留40%冰减抗；与冰扩散减抗同名不叠加；或：capability准备/on_field；retain_on_exit；装备者具备对应元素扩散资格，默认前台触发后退场保留；同元素减抗不叠加 |
| 62 | 花海甘露之光 / `VourukashasGlow` | 伤害 | 常驻/属性或伤害类型筛选<br>none准备/any；while_applicable；自身持续承伤机制默认五层；其他默认零层，显式层数优先，前后台均保留 |
| 63 | 流浪大地的乐团 / `WanderersTroupe` | 伤害 | none准备/any；while_applicable；四件套仅当前前台及实际弓、法器重击生效 |
