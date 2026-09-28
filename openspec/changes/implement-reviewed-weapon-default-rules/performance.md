# 6.3 固定场景性能证据

## Status

2026-09-27：最终构建后，已完成无本仓构建／测试进程并发的 HEAD／当前版本交替三轮采样。当前完整分析中位数增加 23.65%，单项增加 17.33%；存在本机常数开销回退，不宣称性能无退化。单项仍只计算基准与目标候选，未新增跨用户结果缓存。任务 6.3 的测量及调用范围证据已齐备，是否接受该开销由主代理／用户结合整体交付判断，不以本记录替代全仓验收。

## Method

- 机器：Apple M2、arm64；Node.js `v22.22.0`，pnpm `11.15.1`。
- 基线：Git HEAD `394fca05eae90353b6e36d5e0ffc447b5c4c158e`，通过 `git archive` 提取到独立临时目录 `/tmp/gscombat-perf-head.pRAZhA`。未切换共享工作树、提交、部署或修改基线源代码。
- 构建：`pnpm --filter @gscombat/analyzer... install --offline --frozen-lockfile --ignore-scripts`，198 个依赖包全部由本地存储复用，无下载；随后 `pnpm --filter @gscombat/analyzer... --workspace-concurrency=1 build`，Calculator、Contracts、Game Data、Content、Analyzer 五个包均成功。
- 固定输入：`structuredClone(raidenNationalBuiltinScenario)`，雷电将军的 `raiden.burst.initial_slash`，队友班尼特、香菱、行秋，不额外改变武器、条件或 Buff。
- 场景 `JSON.stringify` 的 SHA-256：`7c0cbb04996c82bac9222d031aaea50261797f6a608c85974e3bb5c93fadbbcd`。
- 7.0 SQLite 快照 SHA-256：`d12acc5a2c89a82ac5faa88c6d2b78a6c879f5ec7bc62fe74308385b5bc4d71e`。
- 首轮探索中每个版本使用单独 Node 进程；最终有效对照在同一个进程加载两个目录的独立模块及只读 `GameDataRepository`。两版的完整、单项调用均各预热一次，再按 HEAD→当前、当前→HEAD、HEAD→当前的顺序执行三轮；每版每轮先完整、后单项。计时仅覆盖同步公开函数，不包含进程启动、模块导入、数据库打开、JSON 输出或 HTTP。
- 完整入口：`evaluateScenarioAnalysis(scenario, db)`；单项入口：`analyzeWeaponComparison(scenario, db, "TheCatch", 5)`。
- 样本很少，未隔离系统其他任务、强制 GC 或测量 P95；数据是本机热进程的有界对照，不是生产 SLA 或显著性结论。只读数据仓库已有缓存按正常行为保留，未新增跨用户结果缓存。

## Final Paired Results

开始前确认 `/tmp/gscombat-accept-typecheck.log` 为 13/13 成功、`/tmp/gscombat-accept-build.log` 为 8/8 成功；进程检查无本仓 Vitest、Turbo 构建／测试、tsc 或 Next build 任务。主代理同期仅进行文档与静态检查，最终配对采样结束后才开始顺序全仓测试。“空载”在此只指无上述构建／测试任务，不表示操作系统绝对空闲。

两版本输入及 SQLite 哈希再次校验一致。当前取最终重建的脏工作树产物，而不是声称它有新的提交 SHA；包括雾切选项、逐事件消耗及零命中事件过滤修复。单位：毫秒。

| 版本／入口 | 预热 | 第 1 次 | 第 2 次 | 第 3 次 | 中位数 | 均值 | 最小—最大 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HEAD 完整 | 1713.791292 | 1672.505666 | 1617.182625 | 1579.729583 | 1617.182625 | 1623.139291 | 1579.729583—1672.505666 |
| 当前完整 | 2450.827333 | 1999.661834 | 2066.112500 | 1941.801583 | 1999.661834 | 2002.525306 | 1941.801583—2066.112500 |
| HEAD 单项 | 62.467417 | 62.441833 | 58.313250 | 62.398250 | 62.398250 | 61.051111 | 58.313250—62.441833 |
| 当前单项 | 78.721458 | 72.684958 | 73.211042 | 73.835750 | 73.211042 | 73.243917 | 72.684958—73.835750 |

- 完整中位数增加 `382.479209 ms`（`23.650960%`）；单项增加 `10.812792 ms`（`17.328678%`）。只比较本表配对结果，不跨轮使用更早、更快的 HEAD 样本。
- HEAD 38 候选、当前 40 候选；两版均为 11 个边际副词条、2 个成长收益项。完整场景计算范围由 52 次变为 54 次，单项仍为 2 次。
- 两版基准均为 `163231.10209373906`；完整列表和单项渔获 R5 均为 `145208.47532904326`。两版执行后输入均未改变。
- 当前单项没有因全量列表增长而遍历其余候选；但其自身处理开销有所增加，候选数量变化不足以解释单项回退。测量没有做 CPU profiling，不能据此指定某一个函数为根因。
- 当前单项约 73 ms、完整约 2.0 s 是此机器此固定场景的热进程样本，不包含 HTTP、冷启动或全体角色分布。三次重复不支持 P95／生产延迟保证。

## Historical Baseline Results

单位：毫秒。预热不计入统计。

| 入口 | 预热 | 第 1 次 | 第 2 次 | 第 3 次 | 中位数 | 均值 | 最小—最大 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HEAD 完整分析 | 1105.712084 | 983.274459 | 947.039250 | 942.236167 | 947.039250 | 957.516625 | 942.236167—983.274459 |
| HEAD 渔获 R5 单项 | 38.165458 | 36.596541 | 36.291834 | 36.759542 | 36.596541 | 36.549306 | 36.291834—36.759542 |

结果校验：

- 完整分析返回 38 个武器候选、11 个边际副词条、2 个成长收益项。
- 基准期望伤害 `163231.10209373906`。
- 完整列表中渔获 R5 与单项渔获 R5 的期望伤害均为 `145208.47532904326`。
- 预热及三轮执行后，场景序列化内容保持不变。

## Historical Contaminated Current Results

当前五个依赖包已通过同一构建命令；此轮包含雾切附魔选项一致性修复和逐事件武器消耗处理。场景及 SQLite 哈希均与 HEAD 完全相同，输入执行后不变。

以下仅保留原始观测，**不得用于前后性能结论**：主代理确认采样期间全仓测试及多个 Node 进程仍在并发执行，负载条件与较早 HEAD 采样不一致。

| 入口（受并发负载污染） | 预热 | 第 1 次 | 第 2 次 | 第 3 次 | 中位数 | 均值 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 当前完整分析 | 1430.982375 | 1503.336625 | 1664.651375 | 2042.262041 | 1664.651375 | 1736.750014 |
| 当前渔获 R5 单项 | 52.129042 | 59.364291 | 66.434041 | 84.186125 | 66.434041 | 69.994819 |

- 当前完整分析返回 40 个候选（HEAD 为 38）、11 个边际副词条、2 个成长收益项；完整场景计算范围对应 54 次，单项仍为 2 次。
- 当前基准仍为 `163231.10209373906`；完整与单项渔获均为 `145208.47532904326`，与 HEAD 相同。
- 比较池及规则已改变，后续即使空载对照也必须列明候选数差异，不能把完整列表耗时变化全部归因为单候选处理开销。

## Call Scope

现有 [incremental-weapon 集成测试](../../../packages/analyzer/test/integration/analysis/incremental-weapon.test.ts) 明确断言：

- 完整分析调用 `evaluateScenario` 的次数为 `1 + 武器候选数 + 边际副词条数 + 成长收益项数`；HEAD 本场景据返回规模对应 52 次。
- 单项比较只调用两次：基准一次、目标候选一次，不遍历其他候选，不计算副词条或成长收益。

这是调用范围的代码／测试证据，不是由三次耗时样本推出的复杂度结论。2026-09-27 已执行该文件，以及 `reviewed-weapon-choice-consistency.test.ts`、`active-element-overrides.test.ts`，三文件 13/13 通过；Analyzer 类型检查及五包构建通过。此性能采样没有重跑全套测试，全仓状态由主验证记录汇总。

## Historical Single-Version Reproduction

在已按上述命令构建的仓库根目录，以 `node --input-type=module` 运行下列脚本（基线与当前使用同一脚本）：

```js
import { performance } from "node:perf_hooks";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { evaluateScenarioAnalysis, analyzeWeaponComparison } from "./packages/analyzer/dist/index.js";
import { raidenNationalBuiltinScenario } from "./packages/content/dist/index.js";
import { GameDataRepository, DEFAULT_GAME_DATA_PATH } from "./packages/game-data/dist/index.js";

const scenario = structuredClone(raidenNationalBuiltinScenario);
const serialized = JSON.stringify(scenario);
const hash = (input) => createHash("sha256").update(input).digest("hex");
const db = new GameDataRepository(DEFAULT_GAME_DATA_PATH);
const calls = {
  full: () => evaluateScenarioAnalysis(scenario, db),
  single: () => analyzeWeaponComparison(scenario, db, "TheCatch", 5)
};
const result = {
  environment: { node: process.version, arch: process.arch },
  scenarioSha256: hash(serialized),
  snapshotSha256: hash(readFileSync(DEFAULT_GAME_DATA_PATH)),
  targetActionId: scenario.targetActionId,
  primary: scenario.primary.characterId,
  teammates: scenario.teammates.map((build) => build.characterId),
  warmupMs: {}, samples: { full: [], single: [] }, resultSummary: {}
};
for (const [kind, call] of Object.entries(calls)) {
  const start = performance.now();
  call();
  result.warmupMs[kind] = performance.now() - start;
}
for (let i = 0; i < 3; i++) {
  for (const [kind, call] of Object.entries(calls)) {
    const start = performance.now();
    const value = call();
    result.samples[kind].push(performance.now() - start);
    result.resultSummary[kind] = kind === "full"
      ? {
          baselineExpectedDamage: value.analysis.baselineExpectedDamage,
          candidateCount: value.analysis.weapons.length,
          marginalSubstatCount: value.analysis.marginalSubstats.length,
          progressionGainCount: value.analysis.progressionGains.length,
          theCatch: value.analysis.weapons.find((weapon) => weapon.weaponId === "TheCatch")?.expectedDamage
        }
      : { baselineExpectedDamage: value.baselineExpectedDamage, expectedDamage: value.weapon.expectedDamage };
  }
}
result.statistics = Object.fromEntries(Object.entries(result.samples).map(([kind, samples]) => [kind, {
  min: Math.min(...samples), median: [...samples].sort((a, b) => a - b)[1],
  max: Math.max(...samples), mean: samples.reduce((a, b) => a + b, 0) / samples.length
}]));
result.inputUnchanged = serialized === JSON.stringify(scenario);
console.log(JSON.stringify(result, null, 2));
db.close();
```

## Final Paired Reproduction

按上述方式构建两目录后，以 `node --input-type=module` 运行；临时目录变化时仅替换 `roots.head`。最终有效表使用的脚本如下：

```js
import { performance } from "node:perf_hooks";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const hash = (input) => createHash("sha256").update(input).digest("hex");
const roots = { head: "/tmp/gscombat-perf-head.pRAZhA", current: "/Users/wistomize/project-b" };
const states = {};
const output = { node: process.version, arch: process.arch, order: [], versions: {} };
for (const [name, root] of Object.entries(roots)) {
  const analyzer = await import(pathToFileURL(root + "/packages/analyzer/dist/index.js"));
  const content = await import(pathToFileURL(root + "/packages/content/dist/index.js"));
  const data = await import(pathToFileURL(root + "/packages/game-data/dist/index.js"));
  const scenario = structuredClone(content.raidenNationalBuiltinScenario);
  const serialized = JSON.stringify(scenario);
  const db = new data.GameDataRepository(data.DEFAULT_GAME_DATA_PATH);
  states[name] = { scenario, serialized, db, calls: {
    full: () => analyzer.evaluateScenarioAnalysis(scenario, db),
    single: () => analyzer.analyzeWeaponComparison(scenario, db, "TheCatch", 5)
  } };
  output.versions[name] = {
    root, scenarioSha256: hash(serialized), snapshotSha256: hash(readFileSync(data.DEFAULT_GAME_DATA_PATH)),
    warmupMs: {}, samples: { full: [], single: [] }, summary: {}
  };
}
if (output.versions.head.scenarioSha256 !== output.versions.current.scenarioSha256 ||
    output.versions.head.snapshotSha256 !== output.versions.current.snapshotSha256) throw new Error("Input mismatch");
for (const name of Object.keys(roots)) {
  for (const [kind, call] of Object.entries(states[name].calls)) {
    const start = performance.now(); call();
    output.versions[name].warmupMs[kind] = performance.now() - start;
  }
}
for (let round = 0; round < 3; round++) {
  const order = round % 2 === 0 ? ["head", "current"] : ["current", "head"];
  output.order.push(order);
  for (const name of order) {
    for (const [kind, call] of Object.entries(states[name].calls)) {
      const start = performance.now(); const result = call();
      output.versions[name].samples[kind].push(performance.now() - start);
      output.versions[name].summary[kind] = kind === "full" ? {
        baseline: result.analysis.baselineExpectedDamage, candidates: result.analysis.weapons.length,
        marginal: result.analysis.marginalSubstats.length, progression: result.analysis.progressionGains.length,
        theCatch: result.analysis.weapons.find((weapon) => weapon.weaponId === "TheCatch").expectedDamage
      } : { baseline: result.baselineExpectedDamage, expectedDamage: result.weapon.expectedDamage };
    }
  }
}
for (const name of Object.keys(roots)) {
  const result = output.versions[name];
  result.statistics = Object.fromEntries(Object.entries(result.samples).map(([kind, samples]) => [kind, {
    min: Math.min(...samples), median: [...samples].sort((a, b) => a - b)[1],
    max: Math.max(...samples), mean: samples.reduce((a, b) => a + b, 0) / samples.length
  }]));
  result.inputUnchanged = states[name].serialized === JSON.stringify(states[name].scenario);
  states[name].db.close();
}
console.log(JSON.stringify(output, null, 2));
```
