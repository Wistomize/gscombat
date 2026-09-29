## Why

用户已确认维护自己的 SQLite，每个版本增量添加并记录来源，不再以全库重映射作为升级前提。
7.1 的两名角色和六把武器需要进入现有单指标计算与比较。

## What Changes

- 保留 7.0 全部事实，新增 7.1 角色、武器、原始天赋与来源记录。
- 接入用户已确认的五个指标、六把武器、相关天赋命座。
- 补齐已有生命值向攻击力转换链路漏传的来源面板。
- 治疗指标支持严格低于的生命比例条件及独立本次治疗倍率，准确表达沃雅妮莎 C4。

## Capabilities

### New Capabilities

- `content/versioned-additions`：增量来源、版本一致性与新增内容完整接入。
- `analysis/conditional-healing-multiplier`：条件满足时乘入本次治疗倍率，严格区分边界。

### Modified Capabilities

无。

## Impact

涉及 game-data、content、analyzer、contracts 以及 Web 静态资源；跨三个以上工作区与治疗声明模型扩展触发 OpenSpec。
不改用户 SQLite、不迁移账号、不增加循环模拟、不替换旧版全部参数、不提交或部署。
范围及执行顺序已由用户确认；五个角色指标亦已逐项确认。
