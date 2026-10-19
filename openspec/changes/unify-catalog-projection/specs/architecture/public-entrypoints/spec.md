## ADDED Requirements

### Requirement: 公开动作参数保留按值命座门槛

当公开动作参数已声明某个取值所需的来源命座时，系统 MUST 在参数元数据中返回可选的
`minimumSourceConstellationByValue` 列表，每项包含整数 `value` 与 1 至 6 的整数
`minimumSourceConstellation`。通过目录接口获取的元数据 MUST 与网站所使用的同版本目录一致，
不得在对外发送时丢弃该声明。

#### Scenario: 获取行秋雨帘剑数量的命座限制

- **WHEN** 调用方获取包含行秋“古华剑·裁雨留虹 / 一次雨帘剑齐射（手填数量）”的公开目录
- **THEN** `rain-sword-hit-count` 的允许值为 2、3、5，默认值为 3
- **AND** 参数包含 `minimumSourceConstellationByValue: [{ value: 5, minimumSourceConstellation: 6 }]`
- **AND** 真实接口响应与网站目录保留相同的参数元数据

#### Scenario: 未声明按值命座限制的旧参数

- **WHEN** 调用方获取一个没有声明按值命座限制的现有动作参数
- **THEN** 参数不被强制补入 `minimumSourceConstellationByValue`
- **AND** 其已有名称、标识、默认值、允许值和范围保持不变
- **AND** 原有请求不需要增加任何参数，旧调用方仍可按既有字段使用该目录
