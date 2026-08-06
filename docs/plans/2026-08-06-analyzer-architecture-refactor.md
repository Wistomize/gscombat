# Analyzer Subsystem Architecture Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve ARCH-004 by separating Analyzer production code by subsystem and moving every Analyzer test into one package-level `test/` tree without changing calculations or public APIs.

**Architecture:** Keep `src/index.ts` as the package's only public facade. Organize production code by dependency direction (`core` first, then `effects` and `scenario`, followed by `evaluators`, `metrics`, and `analysis`) while keeping `audit` outside the runtime calculation path. Organize tests by intent (`system`, `integration`, `unit`, and `fixtures`) instead of mirroring every production file mechanically.

**Tech Stack:** TypeScript 6, ESM, pnpm workspaces, Vitest, CodeGraph, project references through workspace packages.

---

## Constraints

- This is a pure structural refactor: formulas, declarations, identifiers, HTTP contracts, and UI behavior remain unchanged.
- `@gscombat/analyzer` keeps the same root exports. No production consumer may import a private Analyzer path.
- `src` contains production code only; every `*.test.ts` file lives below `packages/analyzer/test`.
- Tests are grouped by intent. Broad registered-content and API-facing flows belong in `test/system` or `test/integration`; only isolated generic algorithms belong in `test/unit`.
- `audit` may depend on declarations and core helpers, but runtime calculation modules may not depend on `audit`.
- `scenario` normalizes and orchestrates inputs. Evaluators do not import the scenario orchestrator; they receive typed, resolved input.
- Do not add compatibility files at old internal paths. The root `index.ts` is the compatibility boundary.

## Target layout

```text
packages/analyzer/
├── src/
│   ├── core/
│   │   ├── artifact-stats.ts
│   │   ├── base-stats.ts
│   │   └── build-variant.ts
│   ├── effects/
│   │   ├── action-effects.ts
│   │   ├── active-element-overrides.ts
│   │   └── effect-selection.ts
│   ├── scenario/
│   │   ├── buffs.ts
│   │   ├── evaluate.ts
│   │   └── team-state.ts
│   ├── evaluators/
│   │   ├── declared-action.ts
│   │   └── declared-scenario.ts
│   ├── metrics/
│   │   └── evaluate.ts
│   ├── analysis/
│   │   └── analyze.ts
│   ├── audit/
│   │   ├── authoring.ts
│   │   ├── coverage.ts
│   │   └── registry-integrity.ts
│   └── index.ts
└── test/
    ├── system/
    ├── integration/
    │   ├── characters/
    │   ├── effects/
    │   ├── metrics/
    │   ├── reactions/
    │   └── scenario/
    ├── unit/
    │   ├── audit/
    │   ├── core/
    │   └── evaluators/
    └── fixtures/
```

The first migration preserves the implementation bodies while establishing these boundaries. Large files are then split only where a responsibility can be extracted without introducing a reverse dependency or changing observable behavior.

### Task 1: Establish the package and test boundaries

**Files:**

- Modify: `packages/analyzer/tsconfig.json`
- Modify: `packages/analyzer/tsconfig.build.json`
- Create: `packages/analyzer/test/system/layer-boundary.test.ts`
- Move: every existing `packages/analyzer/src/*.test.ts` into the appropriate `packages/analyzer/test/**` directory

**Steps:**

1. Include both `src/**/*.ts` and `test/**/*.ts` in package type checking.
2. Override the build include with `src/**/*.ts` so test files never enter `dist`.
3. Move tests by intent and update their imports to explicit `../../src/<subsystem>/...` paths where an internal API is genuinely under test.
4. Prefer `../../src/index.js` for system tests that verify the package-level workflow.
5. Update the layer-boundary test so it scans production code independently of its own location.
6. Run `pnpm --filter @gscombat/analyzer typecheck` and `pnpm --filter @gscombat/analyzer test`.

Expected: 49 test files remain discoverable and all existing assertions pass.

### Task 2: Move production modules behind subsystem boundaries

**Files:**

- Move: `packages/analyzer/src/{artifact-stats,base-stats,build-variant}.ts` to `src/core/`
- Move: `packages/analyzer/src/{action-effects,active-element-overrides,scenario-effect-selection}.ts` to `src/effects/`
- Move: `packages/analyzer/src/{scenario,scenario-buffs,team-state}.ts` to `src/scenario/`
- Move: `packages/analyzer/src/{declared-action,declared-scenario}.ts` to `src/evaluators/`
- Move: `packages/analyzer/src/metric.ts` to `src/metrics/evaluate.ts`
- Move: `packages/analyzer/src/analysis.ts` to `src/analysis/analyze.ts`
- Move: `packages/analyzer/src/{combat-authoring-audit,combat-registry-integrity,coverage}.ts` to `src/audit/`
- Modify: `packages/analyzer/src/index.ts`

**Steps:**

1. Move leaf modules first and update internal ESM import paths.
2. Move orchestrators after their dependencies so compiler failures identify remaining reverse edges.
3. Update `src/index.ts` to re-export exactly the pre-refactor public surface from the new paths.
4. Confirm no production file remains directly below `src` except `index.ts`.
5. Run Analyzer type checking and tests again.

Expected: consumers still import only `@gscombat/analyzer`; no old internal compatibility modules remain.

### Task 3: Establish explicit large-module seams

**Files:**

- Modify or split: `packages/analyzer/src/effects/action-effects.ts`
- Modify or split: `packages/analyzer/src/evaluators/declared-scenario.ts`
- Modify or split: `packages/analyzer/src/metrics/evaluate.ts`
- Modify or split: `packages/analyzer/src/audit/registry-integrity.ts`

**Steps:**

1. Extract public result/input types from the four mixed modules only when doing so removes an actual import cycle or lets another responsibility become a leaf.
2. Keep effect eligibility/source selection separate from numeric effect aggregation.
3. Keep scenario source-stat resolution separate from direct, transformative, and special-reaction evaluation.
4. Keep metric dispatch separate from healing/scalar/source-stat formula helpers.
5. Keep registry orchestration separate from metric, effect, action, and timeline validators.
6. Do not introduce barrel files inside subsystems unless at least two production consumers need the same public subset.
7. Run focused Analyzer tests after each extraction.

Expected: the main modules become coordinators and dependency direction remains acyclic. No formula or assertion meaning changes.

### Task 4: Add structural guards

**Files:**

- Modify: `packages/analyzer/test/system/layer-boundary.test.ts`

**Steps:**

1. Assert that `src` contains no `*.test.ts` files.
2. Assert that only `src/index.ts` exists at the `src` root.
3. Assert runtime code does not import from `audit` or `test`.
4. Assert evaluators do not import the scenario orchestrator and core does not import higher layers.
5. Preserve the existing generic-layer character-ID guard.

Expected: future flat files, colocated tests, and reverse dependencies fail in a system-level architecture test.

### Task 5: Verify the repository and close ARCH-004

**Files:**

- Modify: `docs/plans/2026-08-06-architecture-debt-audit.md`
- Create: `docs/adr/0016-organize-analyzer-by-subsystem-and-separate-tests.md`

**Steps:**

1. Run `pnpm --filter @gscombat/analyzer typecheck`.
2. Run `pnpm --filter @gscombat/analyzer test`.
3. Run representative API integration tests for analysis and support metrics.
4. Run `pnpm typecheck`, `pnpm test`, and `pnpm build`.
5. Run `git diff --check`.
6. Record exact results and the final directory model in the architecture debt audit.

Expected: all public behavior remains green and ARCH-004 is marked complete; ARCH-005 remains untouched.
