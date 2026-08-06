# ADR 0014: Use One Authoritative Scenario Metric Evaluation Path

- Status: Accepted
- Date: 2026-08-06

## Context

The repository retained an early Raiden National Foundation demo beside the maintained scenario analyzer. It built an
illustrative `ExpectedDamageInput` from hard-coded stats and modifiers, exposed it through `/v1/evaluations`, and ran
the same example locally in the Mini Program.

Although the Foundation demo and the maintained analyzer shared the calculator's low-level `evaluateExpectedDamage`
function, they did not share the same source of truth. The demo bypassed configured builds, game data, character-owned
effects, team state, scenario normalization, and the metric registry. Keeping both paths allowed two plausible but
incompatible answers to exist in production code.

## Decision

GSCombat has one authoritative product evaluation model:

- Damage metrics enter through `/v1/analysis` and `evaluateCombatMetric`.
- Non-damage metrics enter through `/v1/support-metrics/evaluate` and the same typed metric registry.
- Both paths resolve a maintained `EvaluationScenario` through Analyzer and Content declarations.
- `evaluateExpectedDamage` remains a Calculator implementation detail used by the formal direct-damage evaluator; it
  is not a public product workflow on its own.
- The legacy `/v1/evaluations` route, illustrative Raiden National fixture, and illustrative content modifiers are
  removed without a compatibility endpoint.
- The paused Mini Program keeps only a shell until it can call the same formal API as the website.

The typed Raiden National scenario returned by `/v1/presets` remains supported because it is a normal
`EvaluationScenario` and is evaluated through the authoritative path.

## Consequences

- Every production result uses configured builds, pinned game data, typed effects, team state, and maintained metrics.
- Content no longer exports illustrative playstyle or modifier helpers.
- Clients of the removed experimental endpoint must migrate to `/v1/analysis`.
- The low-level Calculator remains reusable by Analyzer and tests, but applications must not construct an alternative
  product calculation flow around it.
- Mini Program calculation work remains paused rather than displaying knowingly non-authoritative numbers.
