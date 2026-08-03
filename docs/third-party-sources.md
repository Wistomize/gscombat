# 外部资料、素材与致谢

本文清点 GSCombat 使用或参考的外部数据集、API、理论资料、产品灵感、视觉素材和主要运行时依赖。
固定提交与校验值是可复现构建的一部分；第三方内容不会因 GSCombat 采用 AGPL-3.0 而改变许可。

## 1. 原神与 HoYoverse

- **权利人**：[HoYoverse／米哈游](https://www.hoyoverse.com/)
- **涉及内容**：原神名称、角色、武器、圣遗物、技能文本、数值、图像、图标和其他游戏素材。
- **使用方式**：非官方社区分析、配置展示和公式验证；本仓库不声称拥有或重新许可这些内容。

本项目与米哈游／HoYoverse 无隶属、合作或认可关系。所有游戏相关商标和素材权利归其各自权利人所有。

## 2. Genshin Optimizer

- **项目**：[frzyc/genshin-optimizer](https://github.com/frzyc/genshin-optimizer)
- **固定提交**：`21c98eb60355160274a8c4cecfc5671e2151a073`
- **上游许可证**：[MIT](https://github.com/frzyc/genshin-optimizer/blob/master/LICENSE)
- **本地证据**：`packages/game-data/sources/current.json`、
  `packages/game-data/sources/semantic-localization-preview.v3.json`、
  `apps/web/lib/visual-assets.generated.json`

具体使用内容：

- `libs/gi/stats/src/allStat_gen.json`：角色基础属性、武器数值、天赋参数及其他静态数值，下载后验证
  SHA-256，再生成只读 `game-data.sqlite`；
- `libs/gi/dm-localization/assets/locales/chs/*`：固定版本的官方中文名称和作者审阅用技能参数标签；
- `libs/gi/assets/src/gen/*` 与 `libs/gi/svgicons/*`：角色、武器、圣遗物和元素图标来源。仓库中的 WebP
  是固定提交素材的缩略转换，不代表素材权利发生转移。

感谢 Genshin Optimizer 维护者整理可复现的游戏静态数据、名称和资产映射。

## 3. Enka.Network

- **API 与文档**：[Enka.Network](https://enka.network/)；
  [EnkaNetwork/API-docs](https://github.com/EnkaNetwork/API-docs)
- **元数据固定提交**：`7339dc982937c40b48ef48c569bf6d0a1aa5c851`
- **本地证据**：`apps/api/src/showcase-metadata.generated.ts`
- **使用方式**：`/api/uid/{uid}` 展示柜请求，以及固定角色、武器、圣遗物物品 ID 映射。

GSCombat 不枚举 UID，不批量镜像展示柜数据，并为请求设置明确的 User-Agent。API-docs 在上述固定提交
没有声明可由 GitHub 识别的仓库许可证，因此本项目只按接口用途使用响应结构和元数据，不将其文档或代码
声明为 GSCombat 的 AGPL 内容。感谢 Enka.Network 提供玩家展示柜访问能力。

## 4. 伤害理论与机制校验

- [KeqingMains Theorycrafting Library：Damage Formula](https://library.keqingmains.com/combat-mechanics/damage/damage-formula)
- [KeqingMains Theorycrafting Library：Elemental Reactions](https://library.keqingmains.com/combat-mechanics/elemental-effects)
- [KeqingMains Theorycrafting Library：Internal Cooldown](https://library.keqingmains.com/combat-mechanics/internal-cooldown)

这些资料用于交叉校验攻击／属性／倍率／增伤／暴击／防御／抗性乘区、元素反应和标准 ICD 等社区理论。
GSCombat 的实现、类型、测试和公式轨迹为独立代码；引用页面的文本和图表仍归原作者所有。感谢 KQM
理论研究者及其证据库贡献者。

游戏更新可能使社区资料过时。新机制只有在固定数据和代码审阅完成后才会标记为已验证。

## 5. Ysin 产品思路

- **资料**：[ysin-book](https://gitee.com/bannite/ysin-book)
- **核对提交**：`19258f36ce43a3e68f409020e778ba5890b6b381`
- **使用方式**：产品概念启发，包括固定角色流派／配置后比较单个词条或武器的相对收益。

GSCombat 没有复制 Ysin 的源码；计算引擎、数据契约和界面实现均在本项目独立完成。感谢 Ysin 对原神
角色流派和装备收益分析产品形态的探索。

## 6. 开源依赖与容器

主要直接依赖包括 TypeScript、React、Next.js、Fastify、TypeBox、Taro、Vitest、Turbo、pnpm、undici、
SQLite、Caddy 和 Node.js。各依赖及其传递依赖遵循自己的许可证，精确版本锁定在 `pnpm-lock.yaml`；可用
以下命令从当前锁文件和已安装包生成完整许可证清单：

```bash
pnpm licenses list --prod
pnpm licenses list --dev
```

容器构建使用 [Node.js 官方镜像](https://hub.docker.com/_/node) `node:22-bookworm-slim`，反向代理使用
[Caddy 官方镜像](https://hub.docker.com/_/caddy) `caddy:2.10.2-alpine`。具体镜像版本见 `Dockerfile` 和
`compose.yaml`。

## 7. 维护规则

新增外部资料或素材时必须同时：

1. 在代码或来源清单中固定仓库、提交、路径与校验值（适用时）；
2. 核对并保留上游许可证和署名要求；
3. 更新本文和英文版；
4. 不把第三方游戏素材标记为 AGPL-3.0 原创代码。
