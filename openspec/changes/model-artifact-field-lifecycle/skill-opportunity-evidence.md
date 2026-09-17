# 战技准备能力的参数依据

此表记录本次声明所引用的固定数据库参数，**不是轮转模拟或实战秒数表**。

- 上游固定提交：`98aafa1f135f086524b611c7d5b5bfb78d98bb6d`。
- 索引由 [Genshin Optimizer 角色 sheets](https://github.com/frzyc/genshin-optimizer/tree/98aafa1f135f086524b611c7d5b5bfb78d98bb6d/libs/gi/sheets/src/Characters) 的 `skill.cd` / 点按冷却等声明抽取并对照本地 7.0 数据。运行时数值仍读取 GameData，不复制秒数。
- 迪卢克连续三次、妮露 E 舞步、奥黛塔特殊战技、迪希雅再施放、刻晴再施放作为明确连段；固有充能与对应命座增加次数放角色实体，取合格声明的最大机会数而非相加。
- 祭礼四种武器各自声明一次重置资格；通用查询必须先证明装备者有战技伤害。不会把祭礼武器自身伤害或赌徒击杀重置计入。
- 十秒结束恰好发生的下一次施放不保留第一层；七秒命中窗口只接受至少 0.3 秒分隔的机会。多目标、同帧伤害段数均不乘次数。
- 持续命中声明的 `skillHitOpportunities` 是“七秒内可取得两次分隔命中”的有限证据，不声称每次命中恰好间隔 0.3 秒；真实前后台/反应/命座资格仍先校验。
- 固定次数补充包括蓝砚 C6；菲林斯特殊 E 使用 skill[7] 冷却，C1 为该基础冷却的 2/3，进入模式的初次 E 算施放但不算命中。对应固定提交的角色中文说明与 sheet 已核对。
- 本表证明的是已维护的静态准备能力，不是所有实战操作的最优循环。依赖击杀、随机概率或连续战斗反馈的额外刷新不会凭空添加；持续命中与施放次数分离，数据库参数有效性和能力组合由集成测试检验。

| 角色数据 ID | 角色目录 | 参数索引 |
|---|---|---|
| Aino | `aino/combat.ts` | skill[2] |
| Albedo | `albedo/combat.ts` | skill[3] |
| Alhaitham | `alhaitham/combat.ts` | skill[10] |
| Aloy | `aloy/combat.ts` | skill[9] |
| Amber | `amber/combat.ts` | skill[3] |
| AratakiItto | `arataki-itto/combat.ts` | skill[4] |
| Arlecchino | `arlecchino/combat.ts` | skill[4] |
| Alyosha | `alyosha/combat.ts` | skill[2] |
| Barbara | `barbara/combat.ts` | skill[6] |
| Baizhu | `baizhu/combat.ts` | skill[3] |
| Bennett | `bennett/combat.ts` | skill[6] |
| Beidou | `beidou/combat.ts` | skill[4] |
| Candace | `candace/combat.ts` | skill[4] |
| Charlotte | `charlotte/combat.ts` | skill[8] |
| Chevreuse | `chevreuse/combat.ts` | skill[8] |
| Chasca | `chasca/combat.ts` | skill[5] |
| Chiori | `chiori/combat.ts` | skill[6] |
| Citlali | `citlali/combat.ts` | skill[7] |
| Clorinde | `clorinde/combat.ts` | skill[12] |
| Chongyun | `chongyun/combat.ts` | skill[2] |
| Collei | `collei/combat.ts` | skill[1] |
| Columbina | `columbina/combat.ts` | skill[9] |
| Cyno | `cyno/combat.ts` | skill[3] |
| Dahlia | `dahlia/combat.ts` | skill[1] |
| Dehya | `dehya/combat.ts` | skill[7] |
| Diluc | `diluc/combat.ts` | skill[3] |
| Diona | `diona/combat.ts` | skill[3] |
| Dori | `dori/combat.ts` | skill[2] |
| Emilie | `emilie/combat.ts` | skill[6] |
| Durin | `durin/combat.ts` | skill[5] |
| Escoffier | `escoffier/combat.ts` | skill[5] |
| Eula | `eula/combat.ts` | skill[6] |
| Faruzan | `faruzan/combat.ts` | skill[3] |
| Fischl | `fischl/combat.ts` | skill[3] |
| Freminet | `freminet/combat.ts` | skill[11] |
| Flins | `flins/combat.ts` | skill[9] |
| Furina | `furina/combat.ts` | skill[10] |
| Gaming | `gaming/combat.ts` | skill[2] |
| Gorou | `gorou/combat.ts` | skill[4] |
| Ganyu | `ganyu/combat.ts` | skill[3] |
| HuTao | `hu-tao/combat.ts` | skill[5] |
| Iansan | `iansan/combat.ts` | skill[2] |
| Illuga | `illuga/combat.ts` | skill[4] |
| Ifa | `ifa/combat.ts` | skill[4] |
| Ineffa | `ineffa/combat.ts` | skill[6] |
| Jahoda | `jahoda/combat.ts` | skill[5] |
| Jean | `jean/combat.ts` | skill[3] |
| Kachina | `kachina/combat.ts` | skill[3] |
| KamisatoAyaka | `kamisato-ayaka/combat.ts` | skill[1] |
| Kaeya | `kaeya/combat.ts` | skill[1] |
| KaedeharaKazuha | `kaedehara-kazuha/combat.ts` | skill[1] |
| KamisatoAyato | `kamisato-ayato/combat.ts` | skill[7] |
| Kinich | `kinich/combat.ts` | skill[3] |
| Keqing | `keqing/combat.ts` | skill[3] |
| Kaveh | `kaveh/combat.ts` | skill[1] |
| Kirara | `kirara/combat.ts` | skill[9] |
| KujouSara | `kujou-sara/combat.ts` | skill[3] |
| KukiShinobu | `kuki-shinobu/combat.ts` | skill[6] |
| Klee | `klee/combat.ts` | skill[5] |
| LanYan | `lan-yan/combat.ts` | skill[4] |
| Layla | `layla/combat.ts` | skill[5] |
| Lauma | `lauma/combat.ts` | skill[9] |
| Linnea | `linnea/combat.ts` | skill[4] |
| Lisa | `lisa/combat.ts` | skill[6] |
| Lynette | `lynette/combat.ts` | skill[5] |
| Lohen | `lohen/combat.ts` | skill[18] |
| Lyney | `lyney/combat.ts` | skill[3] |
| Mavuika | `mavuika/combat.ts` | skill[13] |
| Mika | `mika/combat.ts` | skill[5] |
| Mona | `mona/combat.ts` | skill[2] |
| Mualani | `mualani/combat.ts` | skill[5] |
| Nahida | `nahida/combat.ts` | skill[6] |
| Navia | `navia/combat.ts` | skill[3] |
| Nefer | `nefer/combat.ts` | skill[11] |
| Neuvillette | `neuvillette/combat.ts` | skill[3] |
| Nicole | `nicole/combat.ts` | skill[7] |
| Ningguang | `ningguang/combat.ts` | skill[3] |
| Nilou | `nilou/combat.ts` | skill[8] |
| Noelle | `noelle/combat.ts` | skill[4] |
| Odette | `odette/combat.ts` | skill[12] |
| Ororon | `ororon/combat.ts` | skill[1] |
| Prune | `prune/combat.ts` | skill[2] |
| Qiqi | `qiqi/combat.ts` | skill[6] |
| RaidenShogun | `raiden/combat.ts` | skill[4] |
| Rosaria | `rosaria/combat.ts` | skill[2] |
| Razor | `razor/combat.ts` | skill[5] |
| Sandrone | `sandrone/combat.ts` | skill[2] |
| SangonomiyaKokomi | `sangonomiya-kokomi/combat.ts` | skill[4] |
| Sethos | `sethos/combat.ts` | skill[2] |
| Sayu | `sayu/combat.ts` | skill[6] |
| Shenhe | `shenhe/combat.ts` | skill[7] |
| Sigewinne | `sigewinne/combat.ts` | skill[7] |
| ShikanoinHeizou | `shikanoin-heizou/combat.ts` | skill[3] |
| Skirk | `skirk/combat.ts` | skill[14] |
| Tartaglia | `tartaglia/combat.ts` | skill[13] |
| Sucrose | `sucrose/combat.ts` | skill[1] |
| Thoma | `thoma/combat.ts` | skill[6] |
| Tighnari | `tighnari/combat.ts` | skill[3] |
| Varesa | `varesa/combat.ts` | skill[4] |
| Varka | `varka/combat.ts` | skill[19] |
| Wanderer | `wanderer/combat.ts` | skill[4] |
| Venti | `venti/combat.ts` | skill[1] |
| Wriothesley | `wriothesley/combat.ts` | skill[3] |
| Xianyun | `xianyun/combat.ts` | skill[4] |
| Xiangling | `xiangling/combat.ts` | skill[1] |
| Xiao | `xiao/combat.ts` | skill[1] |
| Xilonen | `xilonen/combat.ts` | skill[5] |
| Xingqiu | `xingqiu/combat.ts` | skill[4] |
| YaeMiko | `yae-miko/combat.ts` | skill[5] |
| Xinyan | `xinyan/combat.ts` | skill[9] |
| Yaoyao | `yaoyao/combat.ts` | skill[5] |
| Yanfei | `yanfei/combat.ts` | skill[1] |
| Yelan | `yelan/combat.ts` | skill[3] |
| Yoimiya | `yoimiya/combat.ts` | skill[2] |
| YunJin | `yun-jin/combat.ts` | skill[5] |
| YumemizukiMizuki | `yumemizuki-mizuki/combat.ts` | skill[2] |
| Zhongli | `zhongli/combat.ts` | skill[2] |
| Zibai | `zibai/combat.ts` | skill[4] |

旅行者独立按变体取表：风 4、岩 2、雷 5、草 1、水 7、火 4、冰 3；女性/男性使用各自表。
