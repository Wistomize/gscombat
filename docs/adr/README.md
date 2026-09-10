# GSCombat 架构决策索引

docs/adr/ 是长期架构决策档案，继续保留每项决策的背景、备选方案和后果。OpenSpec 不替代 ADR：

- 当前可观察行为位于 [openspec/specs/](../../openspec/specs)；
- 单次变更的 proposal、design 和 tasks 位于 [openspec/changes/](../../openspec/changes)；
- Agent 强制入口位于 [AGENTS.md](../../AGENTS.md)，跨变更约束位于 [openspec/config.yaml](../../openspec/config.yaml)。

## 决策与当前规格

| ADR | 状态 | 当前行为或约束的主要位置 |
|---|---|---|
| [ADR-0001](0001-stateless-build-workbench.md) | 部分当前，被 0013 扩展 | [workspace/build-persistence](../../openspec/specs/workspace/build-persistence/spec.md) |
| [ADR-0002](0002-use-core-action-expected-damage-as-the-current-analysis-metric.md) | Accepted | [analysis/core-action-results](../../openspec/specs/analysis/core-action-results/spec.md) |
| [ADR-0003](0003-declare-semantic-actions-against-the-pinned-snapshot.md) | 已采纳 | [analysis/action-semantics](../../openspec/specs/analysis/action-semantics/spec.md) |
| [ADR-0004](0004-declare-amplifying-reaction-assumptions-per-action.md) | 已采纳 | [analysis/action-semantics](../../openspec/specs/analysis/action-semantics/spec.md) |
| [ADR-0005](0005-use-pinned-localization-assets-for-action-authoring.md) | 已采纳 | [content/authoring-contract](../../openspec/specs/content/authoring-contract/spec.md) |
| [ADR-0006](0006-declare-damage-as-an-action-relative-event-timeline.md) | Accepted | [analysis/action-semantics](../../openspec/specs/analysis/action-semantics/spec.md) |
| [ADR-0007](0007-model-sustained-aura-and-standard-icd-as-an-explicit-limited-event-layer.md) | Accepted，有限模型 | [analysis/action-semantics](../../openspec/specs/analysis/action-semantics/spec.md) |
| [ADR-0008](0008-model-traveler-as-a-canonical-build-with-a-constrained-variant.md) | Accepted | [analysis/action-semantics](../../openspec/specs/analysis/action-semantics/spec.md) |
| [ADR-0009](0009-model-elemental-infusions-as-explicit-event-overrides.md) | Accepted | [analysis/action-semantics](../../openspec/specs/analysis/action-semantics/spec.md) |
| [ADR-0010](0010-require-reviewed-term-evidence-for-multi-scaling-actions.md) | 已采纳 | [content/authoring-contract](../../openspec/specs/content/authoring-contract/spec.md) |
| [ADR-0011](0011-model-character-profiles-as-self-owned-typed-metrics.md) | Superseded by ADR-0012 | [analysis/core-action-results](../../openspec/specs/analysis/core-action-results/spec.md) |
| [ADR-0012](0012-evaluate-character-metrics-in-explicit-party-context.md) | Accepted | [analysis/core-action-results](../../openspec/specs/analysis/core-action-results/spec.md) |
| [ADR-0013](0013-use-invite-scoped-sqlite-workspaces.md) | Accepted | [workspace/build-persistence](../../openspec/specs/workspace/build-persistence/spec.md) |
| [ADR-0014](0014-use-one-authoritative-scenario-metric-evaluation-path.md) | Accepted | [architecture/public-entrypoints](../../openspec/specs/architecture/public-entrypoints/spec.md) |
| [ADR-0015](0015-generate-content-registries-from-entity-owned-declarations.md) | 已采纳 | [content/authoring-contract](../../openspec/specs/content/authoring-contract/spec.md) |
| [ADR-0016](0016-organize-analyzer-by-subsystem-and-separate-tests.md) | Accepted，内部架构 | [OpenSpec 项目约束](../../openspec/config.yaml) |
| [ADR-0017](0017-organize-web-by-feature.md) | 已接受，内部架构 | [OpenSpec 项目约束](../../openspec/config.yaml) |
| [ADR-0018](0018-compose-api-from-resource-route-modules.md) | 已接受 | [architecture/public-entrypoints](../../openspec/specs/architecture/public-entrypoints/spec.md) |
| [ADR-0019](0019-adopt-selective-openspec-change-management.md) | Accepted | [OpenSpec 项目约束](../../openspec/config.yaml) |
| [ADR-0020](0020-preserve-explicit-event-effect-eligibility.md) | Accepted | [显式事件资格修复设计](../../openspec/changes/audit-and-repair-combat-metric-regressions/design.md) |
| [ADR-0021](0021-use-stateless-incremental-weapon-comparison.md) | Accepted | [无状态单武器比较设计](../../openspec/changes/optimize-counterfactual-analysis-performance/design.md) |

更细的当前性、实现证据和 Agent 规则无损核对见
[openspec/governance-migration-map.md](../../openspec/governance-migration-map.md)。新增决策时继续使用顺序编号，
并在本索引中链接相关主规格或说明它只约束内部架构。
