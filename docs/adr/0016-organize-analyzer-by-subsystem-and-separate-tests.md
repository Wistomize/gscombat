# ADR-0016: Organize Analyzer by subsystem and separate tests from production code

## Status

Accepted

## Context

`packages/analyzer/src` contains production modules and 49 test files in one flat directory. Several production files also combine unrelated responsibilities: scenario source-stat resolution and multiple damage models, effect eligibility and aggregation, four metric kinds, and several declaration-audit families.

This makes ownership unclear, encourages reverse dependencies, and lets role-specific integration tests obscure the package's reusable execution layers. The refactor must preserve the single public `@gscombat/analyzer` entry point and all current calculation behavior.

## Decision

Organize Analyzer production modules below `src` by responsibility:

- `core`: build, artifact, and resolved-stat primitives;
- `effects`: effect eligibility, source selection, resolution, and aggregation;
- `scenario`: party state, Buff resolution, input normalization, and orchestration;
- `evaluators`: declared direct, transformative, Moon, Stellar, and related action evaluation;
- `metrics`: typed damage and support metric dispatch and formulas;
- `analysis`: counterfactual weapon, progression, and artifact analysis;
- `audit`: declaration completeness and registry-integrity validation.

Keep `src/index.ts` as the only supported external entry point. Internal paths remain private.

Move all Analyzer tests into a package-level `test` directory. Group them by intent (`system`, `integration`, `unit`, and `fixtures`), with character-specific behavior under integration tests rather than production-adjacent files. Type checking includes both source and test trees, while the build compiles only `src`.

Enforce the dependency direction with a system-level boundary test. Runtime modules may not depend on `audit`; `core` may not depend on higher layers; evaluators receive resolved inputs and may not import the scenario orchestrator.

## Consequences

### Positive

- Production and test inventories are immediately distinguishable.
- New behavior has a clear subsystem owner instead of defaulting to a package-root file.
- The root public API remains stable while internal files can evolve.
- System and integration tests become the visible primary regression layer.
- Automated boundary checks prevent the directory from becoming flat again.

### Negative

- Internal relative import paths become longer.
- Tests of private algorithms must use explicit private paths and will move when their subsystem moves.
- The initial migration touches many files despite intentionally changing no behavior.

### Neutral

- Directory placement does not by itself solve large mixed-responsibility modules; those modules are decomposed only along verified dependency seams.
- Existing test assertions and fixture data remain unchanged.

## Alternatives Considered

**Keep tests colocated with production files**

- Rejected because the package currently has almost three times as many test files as production files, making the production structure difficult to read.
- Colocation remains useful for small isolated libraries, but these tests are predominantly cross-module and registered-content integration tests.

**Move all tests into one flat `test` directory**

- Rejected because it recreates the same scaling problem one level lower and does not communicate test intent.

**Create one package per damage or metric model**

- Rejected as unnecessary operational and dependency complexity for the current modular monolith.

**Publish Analyzer internal subpath exports**

- Rejected because it would turn structural implementation details into compatibility obligations.

## References

- `docs/plans/2026-08-06-architecture-debt-audit.md`
- `docs/plans/2026-08-06-analyzer-architecture-refactor.md`
