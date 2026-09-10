# 指标正确性扩大审查清单

日期：2026-09-10。下文保留修复前审查基线；实施与验收进度见 [implementation.md](implementation.md)。本轮未提交、推送或部署。

## 1. 基线、范围和结论边界

- 代码基线：`d2b10b7f6253dec7336915c81c8aa80b19bc5451`；重点追溯 `6763db9..ac88676`。此前已经只读核对腾讯云运行镜像中的相关编译文件与此版本一致。
- 数据基线：项目 SQLite 7.0，GO 固定提交 `98aafa1f135f086524b611c7d5b5bfb78d98bb6d`。上游公式是交叉核对资料，不把其自述不确定的机制当作定论。
- 工作区已有木偶与轨迹修复、相应测试调整及一张无关图片；本轮保留。木偶局部结果已不同于线上，因此下述扫描不是线上旧镜像的逐项回放。
- 公开指标入口扫描：**119 个有公开指标的角色、302 个 verified 指标、C0–C6 共 2,114 次调用**；1,734 次返回有限结果，380 次按已有最低命座正确拒绝。最终输入包含久岐忍所需来源生命比例、旅行者元素变体；没有新的未知异常、NaN 或 Infinity。
- 该扫描不证明公式正确，也发现不了“声明本身漏了最低命座”。例如莱欧斯利 C6 指标没有声明门槛，会被当作合法指标返回零。
- 公式类别扫描：505 个底层动作，其中 437 个 verified 伤害动作；发现伊涅芙普通攻击一处类型/求值器冲突。合法混合事件动作不按此粗略规则判错。
- 追加事件审查：全部 29 条角色 additionalDamageEvent 声明、12 个角色，深核其基础区、面板继承与依赖条件。12 角色是爱可菲、伊法、卡齐娜、神里绫人、卡维、基尼奇、尼可、欧洛伦、雷泽、丝柯克、法尔伽、瑶瑶；不是说这 29 条全部有错。
- 内容语义深核：在上一轮已审查的 101 个改动角色文件基础上，继续核对约 30 个高风险新命座声明、特殊反应和治疗护盾消费者。没有逐一证明所有天赋、全部配队、装备及上下场组合正确。

初始清单按修复根因归并为 **24 组确认事项：22 组数值/指标资格问题（含木偶已本地修复的一组），2 组底层声明/证据问题**。实施阶段全测又确认 R25 来源精通回归，累计 25 组。同一根因影响多个指标时不重复计数。另有待核实项，不能混入“已修复”数量。

下面数值全部来自受控配置，不是用户或朋友账号的实际面板：通常为角色 90 级、面板天赋 10、无圣遗物、一星武器 90 级、100 级全抗 10% 木桩。对照只说明列出的差异；“仅纠正某项后的值”不是声称其他未审查机制也都正确。

## 2. 确认问题总览

| ID | 优先级 | 角色/范围 | 问题 | 归因 | 修复批次 |
|---|---|---|---|---|---|
| R01 | P1 | 木偶重击/E、C6 星超导 | 特殊反应误走直伤、存储附着参数漏接 | ac88676；已有本地修复 | B0 |
| R02 | P1 | 流浪者 C0–C5 | 不存在的 C6 零倍率事件吃云堇造成伤害 | ac88676 | B1 |
| R03 | P1 | 绫人、丝柯克、爱可菲、伊法 C6 | 真追加段漏基础区；占位段反而能吃加算 | 旧事件底座、新角色消费者 | B1 |
| R04 | P1 | 丝柯克、基尼奇 C6 | 追加段漏适用的 C2 攻击/C1 暴伤 | ac88676 消费者与公共过滤 | B1 |
| R05 | P1 | 基尼奇 C6 | 无效父效果 ID 激活子伤害，互斥层数重复 | 旧依赖守卫，新消费者 | B2 |
| R06 | P1 | 宵宫 C6 | 50% 概率只折技能倍率、不折云堇加算 | ac88676 | B1 |
| R07 | P1 | 莱欧斯利强化重击/C6 | 错参数、错增伤区、冰锥强化遗漏、漏指标门槛 | ac88676 | B3 |
| R08 | P1 | 希诺宁 C6 | 夜魂普攻用攻击力普通普攻参数，而非防御力夜魂普攻 | ac88676 | B3 |
| R09 | P1 | 希诺宁 C4 辅助 | 团队普重下落加算限制成自身 C6 专属 | ac88676 | B3 |
| R10 | P1 | 玛薇卡 C6 | 四个派生无反应指标漏基础倍率，结果零 | 新指标与旧别名规则冲突 | B3 |
| R11 | P1 | 林尼 C6 | 用猫猫帽生命继承比例计算礼花术弹 | ac88676 | B3 |
| R12 | P1 | 莱依拉 Q，全命座 | 生命倍率写成攻击倍率 | ac88676 | B3 |
| R13 | P1 | 魈高空下落，全命座 | 引用了重击倍率 | 65b1e8d3，原有错误 | B3 |
| R14 | P2 | 魈新 C6 免费 E | 漏必定存在的开 Q A1，连 E A4 仍未接 | 新指标遗漏；A4 底层也旧缺 | B3 |
| R15 | P1 | 迪奥娜 Q 治疗 | 生命倍率写成攻击倍率 | 65b1e8d3，原有错误 | B4 |
| R16 | P1 | 辅助来源面板、迪奥娜 C6 | 角色 automatic 属性效果被跳过，+25% 生命不生效 | 旧过滤，新 C6 消费者 | B4 |
| R17 | P1 | 早柚 C6 治疗 | 有通用底座却仍排除精通治疗项 | 原有遗漏，ac88676 未完成 | B4 |
| R18 | P1 | 梦见月普通扩散 C1 | 漏 1100% 精通固定伤害，只接了星扩散分支 | ac88676 同批指标遗漏 | B5 |
| R19 | P1 | 梦见月给奥黛塔前台动作 | 只约束精通分享，梦浮增伤/减抗/反应双暴仍越界 | ac88676；后续局部修复不全 | B5 |
| R20 | P2 | 梦见月点心治疗 | 自己拾取的治疗翻倍未计算 | 原有遗漏 | B4 |
| R21 | P2 | 莱依拉 C1 盾 | 整盾 +20% 未计算 | 原有遗漏 | B4 |
| R22 | P2 | 迪奥娜 C2 盾 | 整盾 +15% 未计算 | 原有遗漏 | B4 |
| R23 | P2 | 伊涅芙底层普通攻击 | 标为特殊反应，直伤入口报错；非当前 UI 指标 | ac88676 | B0 |
| R24 | P2 | 奥黛塔两种破晓终奏 C1 | 缺两条审阅证据，完整性守卫失败 | 后续 27597a1；未证明数值错误 | B0 |
| R25 | P1 | 辅助来源精通→属性转换 | 漏掉千夜浮梦等团队装备的固定精通，玛海菈/晚星加攻偏低 | 全测追加确认，ac88676 的来源属性拆分 | B6 |

## 3. 逐项证据与建议

### R01 — 木偶特殊反应路由与参数

- 受影响动作包括 `sandrone.normal.charged_attack.condensation_ray.stellar_superconduct` 和先前 E 动作，另有 C6 独立星超导段的存储附着参数。
- `ac88676` 错把旧星超导动作的 `damageKind/evaluator` 改成普通直伤，导致精通、星反应增伤/擢升未按专门公式结算，却出现普通增伤/防御区。定位：`packages/content/src/characters/sandrone/combat.ts`。
- 当前已有本地修复：恢复特殊公式与存储参数；补自身攻转精通、C1 星反应增伤、C2 射线暴伤。后面三项属于原有遗漏，不是该提交删除。
- 保留用户决定：射线单次命中不并入 C4 协同攻击；C2 不误给爆发或无资格的 C6 段。此处先复核已有 dirty diff，不再次重写。
- 轨迹首行“无反应 ×1”的展示问题早于本次批量提交，不和公式错误混为一谈。

### R02 — 流浪者幽灵命中

- 指标 `wanderer.skill.hanega_song_of_the_wind.windfavored.normal.first_hit`；`characters/wanderer/combat.ts:133`。
- C0 加入云堇后主命中 720.483529，不应存在的 C6 事件仍有 208.955730，总值 929.439259；没有云堇时该假事件恰好为零，所以“裸装结果正常”不能证明门槛正确。
- 原因：以系数 0 代替未解锁事件，hitCount 仍为 1。
- 修复：在事件存在性阶段过滤 C6；不能把所有零系数命中统一删掉，因为有些真实命中合法包含固定加算。

### R03 — 追加段基础区丢失与代理命中

- 公共定位：`packages/analyzer/src/evaluators/shared.ts:1457–1490`，仅传 `event.flatDamage`，不传事件重解析得到的 `baseDamageFlat`；同段动态项也需逐项确认资格。
- 绫人：`kamisato_ayato.skill.kamisato_art_kyouka.shunsuiken.first_hit`，C6 两个真实追加段加入云堇前后均 967.780111，云堇 425.125513 基础项未进入。
- 丝柯克：`skirk.skill.seven_phase_flash.normal.fifth_hit` 的三个 C6 普攻段漏云堇；`skirk.burst.havoc_ruin.slash` 的三个 C6 爆发段漏申鹤，后者各 4072.970098，缺冰翎 502.268036 基础项。
- 爱可菲 `escoffier.constellation.6.tea_parties_bursting_with_color.special_grade_frosty_parfait.maximum_six_hits`：零倍率代理段在申鹤队产生 274.302741，六个真实段各 1413.288103 却没冰翎。队伍变化也会改变爱可菲减抗，不能仅看总数升降判断冰翎是否生效。
- 伊法：`ifa.skill.airborne_disease_prevention.supporting_fire.held_remedy_bullet`，云堇使主弹 444.711716→635.772932，50% 追加弹仍 94.155415；应多出 95.530608 期望贡献。
- 修复：真实事件统一组装合格基础项，代理不作为命中；保留逐段资格、次数前提及来源，不能给所有武器/角色 proc 无差别补全部加算。

### R04 — 动作绑定增益被追加事件全盘排除

- 公共定位：`packages/analyzer/src/effects/action-effects.ts:662`，带 `targetFilter.actionIds` 的增益统一被拒绝。
- 丝柯克普攻 C6：主段攻击 1112.003214，协同段攻击 741.335476，丢了适用于普攻状态的 C2。不可反向将该 C2 强塞给不适用的爆发分支。
- 基尼奇 `kinich.skill.scalespiker_cannon.single_hit`：主炮暴伤 1.884，C6 弹跳和心得追加只有 0.884，漏 C1 +100%；角色定位 `characters/kinich/combat.ts:167` 及 `:188` 后追加段。
- 修复：Content 声明可审阅的效果继承范围；通用层按资格解析，不简单移除所有 `actionIds` 隔离。

### R05 — 依赖 ID 绕过实际条件

- 单人 C6 基尼奇，请求遗留 `kinich.passive.flame_spirit_pact.hunters_experience.two_stacks.attack_additive_damage`。
- 二层父效果实际不成立，主炮仍一层，但 C6 一层/二层子事件同时存在；6649.331467→8123.847048，多 1474.515581。
- 公共定位 `effects/action-effects.ts:80–97,760–761`；角色 `characters/kinich/combat.ts:209–263`。旧依赖守卫来自 `a0ccb47f`，新 C6 消费者来自 `ac88676`。
- 有效三纳塔队默认二层、显式选一层均正常，不应描述成所有 C6 配队都会重叠。
- 修复：只使用来源/条件/互斥筛选后的有效父效果建立依赖；对应心得属于弹跳同段加算时直接作为该段项，避免伪造额外命中。

### R06 — 宵宫概率只折倍率

- 指标 `yoimiya.constellation.6.naganohara_meteor_swarm.fifth_hit.expected_blazing_arrow.no_reaction` 的时间线，`characters/yoimiya/combat.ts:224–232`：把 `50% × 60%` 写成天赋系数 0.3，云堇仍按完整一次命中加入。
- 当前无云堇 234.537847，有云堇 443.493577，额外贡献是完整 208.955730，未经过 50% 触发概率。
- 修复：区分 C6 对本次箭矢基础倍率的修正与事件触发概率；先求一次触发的完整结果再 ×0.5。不能为了降低结果把所有增益乘区一并乘 0.3。

### R07 — 莱欧斯利强化重击四处相关错误

- `characters/wriothesley/combat.ts:89,119,152,264`，包括 `wriothesley.normal.rebuke_vaulting_fist.c6_maximum_reachable`。
- 参数取 `auto[5]`（普攻第五段），应 `auto[6]`（重击）；有效普攻 13 级 2.173588 vs 3.2504。
- C1 的 +200% 重击伤害加成被写成天赋系数 ×3，应在相应增伤区与其他增伤正确合成。
- C6 冰锥没有获得对应强化，当前裸装重击 2242.606481、冰锥 747.535494，错误成 3:1。
- C6 专属公开指标未设最低命座；C0–C5 能请求并返回零，而不是拒绝。
- 修复四项一起闭环：正确参数、增伤阶段、冰锥继承、指标及事件门槛；正常重击和 C6 专属指标分开保持资格。

### R08/R09 — 希诺宁

- C6 夜魂普攻 `xilonen.constellation.6.evernight_blessing.normal_attack.first_hit`，`characters/xilonen/combat.ts:43`：当前 `auto[0] × ATK + 3 × DEF`，应 `auto[9] × DEF + 3 × DEF`。10 级分别 1.023791 与 1.107414；+100 ATK 错误令 4232.136212→4322.242125。
- C4 `characters/xilonen/combat.ts:318`：队伍普攻/重击/下落基础区加算被限制为 source 且仅匹配希诺宁 C6。宵宫场景显式选择后仍 1172.689237，无该效果。
- 修复 C6 防御缩放；C4 按真实队伍接收者与攻击类型匹配，保留其次数/触发前提，不能改成所有伤害通用加算。

### R10 — 玛薇卡无反应别名

- `characters/mavuika/combat.ts:10` 与 `combat-registry.ts:149`；现有规则不识别新 `.vaporize/.melt/.none` 命名。
- 四个零值 ID：`mavuika.constellation.6.humanitys_name_unfettered.{flamestrider_crash,scorching_ring}.{vaporize,melt}.no_reaction`。
- 明确 `.none` 动作分别能算出 1064.43、2661.08；四个重复别名基础区没有原动作的 2/5 倍攻击项，因此为零。
- 修复：消除重复公开选项，以明确语义关联保留旧请求兼容；同语义无反应入口应返回一致结果。其余旧动作别名的天赋继承仍属需要在 B3 顺带验证的同类范围，未全部量化。

### R11 — 林尼 C6 参数身份错误

- `lyney.constellation.6.guarded_smile.pyrotechnic_strike.reprised`，`characters/lyney/combat.ts:153`。
- `auto[12]` 是猫猫帽生命继承比例；礼花术弹是 `auto[14]`。有效普攻 13 级当前 1.36，应 4.505，再乘 C6 的 0.8。
- 418.287568→仅纠正参数应 1385.577567，少算约 69.8%。快照断言也锁定了错误的生命比例，不能当作独立证据。
- 修复参数引用、语义映射及快照；保留 C3 对普攻等级的累计作用。

### R12 — 莱依拉 Q 属性错误

- `layla.burst.dream_of_the_star_stream_shaker.starlight_slug.single_hit`，`characters/layla/combat.ts:164`；所有命座。
- C6 当前 24.079423，+100 ATK→30.295025，+1000 HP→24.079423。仅替换正确 HP 后应 854.930722。
- 修复 `scalingStat: hp`，不改正确 burst[0]、C5 等级和 C6 增伤；用属性差分而非纯快照验证。

### R13/R14 — 魈

- 高空下落 `xiao.burst.bane_of_all_evil.high_plunge`，`characters/xiao/combat.ts:120`：`auto[8]` 重击应为 `auto[12]` 高空下落；10 级 2.16032 vs 4.040179。1180.681871→仅纠正索引 2208.083109。来源 `65b1e8d3`，不是这批新改坏。
- 新 C6 E `xiao.constellation.6.conqueror_of_evil.guardian_yaksha.free_lemniscatic_wind_cycling`，同文件 `:153`：处于 Q 是前提却完全没有 A1，1372.908387、增伤区 0；仅补最低 5% 应 1441.553806。
- 沿用用户相对状态取满约定时，A1 满25%与连 E A4 满45%可以作为明确最大可达前提（同配置 2333.944258），但 A4 满层不是第一次免费 E 必然拥有；轨迹必须说明状态。不可把 Q 的普重下落专属增伤加给 E。

### R15/R16 — 迪奥娜治疗与公共辅助来源面板

- Q 治疗 `diona.burst.signature_mix.heal_tick`，`characters/diona/combat.ts:234,258`：`attack` 应 `hp`。C5 当前 1454.843441，仅修属性 2496.531325；错误来自 `65b1e8d3`。
- C6 +25% HP `characters/diona/combat.ts:162–168` 已声明 automatic；辅助面板 C5/C6 均 HP9569.925259，应为 C6 HP11962.406574。
- 公共根因 `effects/action-effects.ts:487–494,545–554` 只收 automatic 装备和 maximum_reachable 角色；`metrics/runtime.ts:378` 复用该过滤，因此角色 automatic 属性被吞掉。
- 两项修复后 C6、受益者 50% 血线受疗+30% 情况：1891.296473→3598.159216。
- 不能只把迪奥娜声明改成 maximum_reachable 蒙混通过；修公共来源面板口径，继续尊重来源、条件及动作资格。
- 现有 C3 Q+3、C5 E+3 声明正确，旧 detail 将两者说明写反，仅修文案，不反改正确逻辑。

### R17 — 早柚 C6 治疗遗漏

- `sayu.burst.yoohoo_art_mujina_flurry.muji_muji_daruma.heal_tick`，`characters/sayu/combat.ts:233–240`。
- C5/C6 均 2080.508380；EM96 的 C6 应在治疗加成前增加 `min(3×96,6000)=288`，得到 2368.508380。
- detail 错写 `0.003 × EM` 并声称通用底座不支持。实际上 `metrics/runtime.ts:408` 已支持附加治疗项的命座门槛和单项上限。
- 修复直接复用现有 additionalScalingTerms，ratio3、C6、cap6000；不需要另造治疗求值器。

### R18 — 梦见月普通扩散 C1 遗漏

- `yumemizuki_mizuki.skill.aisa_utamakura_pilgrimage.single_pyro_swirl`，`characters/yumemizuki-mizuki/combat.ts:93–100,283–299`。
- 同菲谢尔队 EM236.72，C0/C1 均 5873.158597；只实现星扩散 `5.5×EM`，没有普通扩散的 `11×EM`。
- 修复仅在满足二十三夜待的该次普通扩散加入相应后置固定伤害，命座动态控制；辉映下额外攻击的反应类别必须按实际状态，不能把星扩散 400% 分支复制给所有普通扩散。

### R19 — 梦浮前台互斥未贯穿全部效果

- 奥黛塔前台指标 `odette.skill.adagio_coda_at_dawn.final_hit.stellar_swirl`；瑞希效果定位 `characters/yumemizuki-mizuki/combat.ts:225,320,357,366`。
- 队友瑞希 C6 错误给予 E 星扩散增伤0.116208、C2减抗0.2、C6反应CR0.1/CD0.2，结果11692.115702；C0队友也错误给予 E增伤0.09684。
- 退场结束梦浮；仅将10%精通改成自身接收，其他依赖梦浮效果仍无相同条件。
- 修复最小静态前台资格：来源必须前台的状态与另一角色必须前台的动作互斥。不要一刀切禁用后台队友的受益，也不要建设实时切人模拟系统。

### R20 — 梦见月自身点心治疗翻倍

- `yumemizuki_mizuki.burst.anraku_secret_spring_therapy.mini_baku.snack_heal`，`characters/yumemizuki-mizuki/combat.ts:414–453`。
- 同一 C6 来源给本人/菲谢尔均1184.754880；本人触发时应2369.509760。
- 原有遗漏。修复受益方等于来源时的专属治疗倍率，不当成对所有队员通用治疗加成。

### R21/R22 — 护盾整体系数遗漏

- 莱依拉 `layla.skill.nights_of_formal_focus.curtain_of_slumber.initial_absorption`，`characters/layla/combat.ts:211` 后：C0/C1均4962.081445，C1整盾×1.2应5954.497734。
- 迪奥娜 `diona.skill.icy_paws.press.base_absorption`，`characters/diona/combat.ts` 的盾 scalar/detail：C1/C2均2764.552314，C2整盾×1.15应3179.235161。
- 都是旧声明明确排除、未完成的数值效果；不是“只看基础盾所以可以省略自身命座”。保留当前点按、非冰伤、未计受益者盾强的指标口径。
- 修复包含固定值在内的整个盾值，不能只提高 HP 倍率项；长按75%、联机盾、冰伤250%不自动并入当前点按指标。

### R23 — 伊涅芙底层动作元数据冲突

- `ineffa.normal.auto.first_hit`，`characters/ineffa/combat.ts:9,21`；`damageKind: special_reaction`，求值器 `declared_direct`。
- 正式调用报 `Declared action ineffa.normal.auto.first_hit must be verified direct damage`。
- 该动作不在当前302个 UI 指标内，不能声称伊涅芙已选月感电指标因此失败。恢复普通物理攻击 direct，并补守卫。

### R24 — 奥黛塔审阅证据缺失

- 两种 `odette.skill.adagio_coda_at_dawn.final_hit.{stellar_superconduct,stellar_swirl}` 的 `c1-additional-hit`。
- `validateCombatRegistryIntegrity` 返回两条 `missing-reviewed-multi-scaling-evidence`，`isValid:false`；声明位置 `characters/odette/combat.ts:66` 后。
- 这是后续 `27597a1` 的证据遗漏，本项没有证明对应伤害数值错误。修复审阅映射并跑现有完整性守卫，禁止绕过守卫或降低 verified 标准。

## 4. 待核实项与明确排除的误报

### 实施追加 R25 — 团队装备精通未进入来源转换

- 原有 `declared-scenario.test.ts` 玛海菈/流浪的晚星集成反例未改期望：千夜浮梦的其他队友 +40 EM 应提高转换来源精通，但玛海菈加攻为 11.907648，期望 14.787648，差值恰好 `40 × 24% × 30% = 2.88`。
- `ac88676` 将 `evaluators/source-stats.ts` 的精通采集拆成自身装备、角色效果与后置分享，漏掉 `holder: party_member` 的固定装备精通。
- 修复为互斥的第三组团队装备贡献：复用既有条件/来源解析，先加入分享前精通，再进行后续转换；覆盖千夜浮梦、教官四件和圣显之钥等合格来源，不重复自身装备，不提前递归精通分享。
- 原集成反例原值转绿，完整声明场景文件 59 项通过；最终全仓结果见实施记录。

### 保留待核实

- **神里绫人 C6 是否继承 C1**：公共过滤确实会漏父动作绑定效果，但 GO 自己也标注不确定；用户于2026-09-10明确暂缓，不列为已确认、不自动修改。
- **艾梅莉埃、卡齐娜已结束待核实**：2026-09-10用户授权后以正反例确认并修复，详见 implementation.md 的 B7 后续核实。艾梅莉埃增加显式燃烧目标Buff，按实际攻击算精馏；卡齐娜叶洛亚配队复现代理多算一次加算，并确认真实C6漏C4防御，已分别修复。并非全场景无条件加满，也不是仅凭零倍率判错。
- **其他旧无反应别名**：存在动作 ID 继承风险，B3 要沿相同路径检查；当前只对玛薇卡四个新别名量化。
- 法尔伽单人不满足队伍要求、妮露裸生命未过阈值、砂糖裸精通为零、班尼特 C0 自身半血条件不满足等零值属于合法状态，不算新增错误。
- 无独立事件申明的增幅/激化反应，不因为 `reactionPolicy:none` 就自动补反应；尊重当前选定的无反应指标口径。
- 命座扫描未发现同一合法指标随 C0→C6 数值下降，但这不能证明应增加的命座项已经实现。

## 5. 修复批次与验收

| 批次 | 内容 | 最小验收证据 |
|---|---|---|
| B0 | 复核木偶已有修复；伊涅芙路由；奥黛塔证据 | 星反应轨迹正确，stored-applications有效，registry integrity清零 |
| B1 | 事件存在性、逐段基础区、概率、明确增益继承 | 流浪者低命无假伤害；绫人/丝柯克/爱可菲/伊法合格加算；基尼奇C1；宵宫概率 |
| B2 | 条件/互斥后的依赖激活 | 不合格二层ID不能增加伤害；有效一层/二层仍正常 |
| B3 | 正确参数、属性、乘区、指标门槛/别名 | 参数身份+属性扰动+C0/C6/API资格，既有无反应配置兼容 |
| B4 | 辅助来源属性、治疗项、受益方与整盾倍率 | 迪奥娜/Sayu/Mizuki/Layla公式对照，层数/上限/来源条件 |
| B5 | 普通扩散C1、梦浮前台互斥 | 前台互斥负例+后台受益正例，C0/C1/C6事件范围 |
| B6 | 集成、收益与发布前门禁 | 302指标入口、相关全包测试、typecheck/test/build、diff/status复核 |

先修公共语义再按角色批量迁移；每批保留精确反例，不能最后一起看总伤害是否“像正常值”。同一个修复对未涉及的普通直伤、月反应、武器独立 proc 的影响必须用对照验证。

## 6. 可复现实验

审查附件 `probes/` 使用真实 Content、Analyzer 与 SQLite，没有替代计算器或 fake 服务；从仓库根执行，需先构建依赖以使 dist 与源版本匹配。初始扫描保留在 `scan-results.json`，修复后结果单独记录，不覆盖基线。

```sh
node openspec/changes/audit-and-repair-combat-metric-regressions/probes/sweep.mjs
node openspec/changes/audit-and-repair-combat-metric-regressions/probes/events.mjs
node openspec/changes/audit-and-repair-combat-metric-regressions/probes/scaling.mjs
node openspec/changes/audit-and-repair-combat-metric-regressions/probes/support-checks.mjs
```

- sweep 是入口检查，不是正确性通过证书，完整计数见 `scan-results.json`。
- events 为修复后应通过的三个精确断言；初始三个红灯，实施后三个转绿。
- scaling/support-checks 输出受控差分与轨迹。scaling 已改为输出实际使用的倍率与固定来源参数，不再对已修复结果重复乘一次纠正比例。
- 其他上一轮已查实项在第3节保留参数、代码位置与对照；不声称所有24组都有新建的独立测试文件。

## 7. 固定来源

所有下列路径均固定在上述7.0提交，不随 master 漂移：

- [林尼参数/C6](https://raw.githubusercontent.com/frzyc/genshin-optimizer/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/sheets/src/Characters/Lyney/index.tsx)
- [莱依拉属性/护盾](https://raw.githubusercontent.com/frzyc/genshin-optimizer/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/sheets/src/Characters/Layla/index.tsx)
- [魈参数/天赋](https://raw.githubusercontent.com/frzyc/genshin-optimizer/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/sheets/src/Characters/Xiao/index.tsx)
- [希诺宁夜魂/C4](https://raw.githubusercontent.com/frzyc/genshin-optimizer/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/sheets/src/Characters/Xilonen/index.tsx)
- [莱欧斯利参数/C1/C6](https://raw.githubusercontent.com/frzyc/genshin-optimizer/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/sheets/src/Characters/Wriothesley/index.tsx)
- [基尼奇炮类增益](https://raw.githubusercontent.com/frzyc/genshin-optimizer/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/sheets/src/Characters/Kinich/index.tsx)
- [丝柯克协同](https://raw.githubusercontent.com/frzyc/genshin-optimizer/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/sheets/src/Characters/Skirk/index.tsx)
- [宵宫C6](https://raw.githubusercontent.com/frzyc/genshin-optimizer/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/sheets/src/Characters/Yoimiya/index.tsx)
- [迪奥娜治疗/盾](https://raw.githubusercontent.com/frzyc/genshin-optimizer/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/sheets/src/Characters/Diona/index.tsx)
- [早柚治疗](https://raw.githubusercontent.com/frzyc/genshin-optimizer/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/sheets/src/Characters/Sayu/index.tsx)
- [梦见月文本镜像](https://raw.githubusercontent.com/frzyc/genshin-optimizer/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/dm-localization/assets/locales/chs/char_YumemizukiMizuki_gen.json)

## 8. 实施边界

已按用户批准的 B0–B6 开始批量修复，状态与证据集中在 [实施记录](implementation.md)。未把其他旧 change 宣告完成，也未提交/推送/部署。本轮不是“全角色所有机制排查完毕”的承诺；待核实项保留，新增 R25 已明确追加归因与证据。
