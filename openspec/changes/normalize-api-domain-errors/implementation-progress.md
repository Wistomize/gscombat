# ARCH-013 实施与验收记录

日期：2026-10-19。用户批准后实施，保留此前 ARCH-015、架构审查和文档的未提交改动。

## 实际修改

- 按[抛错来源清单](error-inventory.md)逐处迁移明确输入拒绝。Analyzer 包根导出
  `AnalysisInputError`；场景、前台、指标/命座、受益人、参数、效果来源及装备选项使用有限领域 code。
  不含 HTTP；坏声明、缺失固定参数、未知求值器与内部数值不变量仍是 Error。
- 显式状态校验保留三类合法 ID：数值效果、角色 scenarioEffectOptions、requiredActiveEffectIds。
  内置 `raiden.skill.eye` 属于激活状态，不能误认作缺失的数值效果；固定状态索引仅初始化一次。
- API 通过一个注册函数统一错误 Schema/处理，沿用 Contracts 现有 Schema，不改成功 JSON。
  Fastify 结构校验使用明确错误类型，未知异常上临时附加 statusCode 不再获得可信业务语义。
- 有限服务错误保留冲突、容量、预算、取消；关闭为 503。断开连接不再发送错误体，单等待者取消不影响合并任务。
- 每个请求使用服务端 UUID 并返回 X-Request-Id；500 只暴露通用提示及编号。
  stderr 诊断只含有限字段和最多三个截断源码位置；不输出请求、异常原文、完整任务键或用户数据。
- 套装条件复用原校验，显式非法值在候选求值前返回 400；内部候选无论抛普通 Error 还是输入类错误，
  均保留 200/complete=false/failures。失败不进入排名/成功缓存，重试只重算失败项。
  候选异常记录计算/候选编号，响应为每个合并等待者另关联请求编号。
- Enka 仅分类真实外部请求、HTTP、JSON/基本形状错误；12 秒预算、TTL 缓存、空展示柜、正常逐角色跳过不变。
  URL 配置及未知归一化程序错误仍为内部 500。
- Web 仅补齐辅助错误 message 和代理回退，未拆组件或重构其他 fetch。
- [ADR-0025](../../../docs/adr/0025-separate-domain-input-errors-from-http-failures.md)、中英文架构/开发文档与台账同步。

## 验证与过程中发现的问题

1. 新错误矩阵在旧实现的 4 个分组全部失败：非法前台/版本误报 500、框架错误形状不一致、
   任意 statusCode 被信任且可公开异常文本。先构建 Analyzer，再运行 API，确保使用最新 dist。
2. 首轮检查发现激活状态 ID 不等于数值效果 ID；修正合法目录边界，未更改内置场景或公式。
   Fastify 默认 Schema 格式器返回普通 Error，因此明确配置其产生类型化校验错误。
3. 非法 Build 夹具最初使用“低等级、高突破”，但既有 Build 校验并未将其定义为非法；
   改用契约明确拒绝的重复圣遗物部位，不借错误归类扩展等级规则。
4. 测试夹具必须在首次 inject 前注册路由。完整 API 回归还检出效果选项入口的两处旧 statusCode；
   一并迁移，既有前台拒绝恢复 400，不修改其业务期望。
5. 两条 Furina 手填气氛值范围测试原断言 500，按已批准行为改为 400/invalid_action_parameters，
   范围提示及所有合法数值期望保留。未修改伤害数字来掩盖差异。

已通过：

| 命令/范围 | 结果 |
|---|---|
| `pnpm --filter @gscombat/analyzer build` 后 API 聚焦集成 | 通过，未运行旧域包产物 |
| `pnpm --filter @gscombat/analyzer test` | 71 个文件，609 项通过 |
| `pnpm --filter @gscombat/api test` | 22 个文件，192 项通过 |
| `NODE_OPTIONS=--no-experimental-webstorage pnpm --filter @gscombat/web test` | 10 个文件，44 项通过 |
| `pnpm typecheck` | 全仓通过 |
| `pnpm build` | 全仓通过，Content 注册表及 Web 静态页面构建通过 |
| 最后诊断截断微调后的 API 错误/比较切片 | 2 个文件，11 项通过 |
| `openspec validate normalize-api-domain-errors --strict` | 通过 |
| 本次相关文档本地链接、`git diff --check`、diff/status | 25 份文档、213 个本地链接/锚点通过，工作区改动保留 |

新增一个 API 错误矩阵文件；主要扩展既有跨包/HTTP/工作空间集成，不建立逐角色错误矩阵。
验证同时覆盖真实正式 SQLite、上游受控响应、隐私哨兵、失败重试、合并请求与取消隔离。
按已批准任务采用受影响工作区完整测试和根类型检查/构建，没有重复不变 Content/Calculator/Game-data 的根全测。

## 交付边界

全部仍是本地未提交改动，没有推送、部署或归档。未读取/更换生产密钥、修改用户库或更新游戏数据。
ARCH-014 的队列准入/缓存上界、ARCH-019 的主规格同步独立待办；本轮不扩大范围。
保留历史验证记录；845 项通过不等于再次人工核实所有角色机制。
