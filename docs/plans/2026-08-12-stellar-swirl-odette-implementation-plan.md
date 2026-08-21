# Stellar Swirl and Odette Metrics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a reusable Stellar-Swirl calculation family and expose only Odette's C2 ATK bonus and Solo Dance Double off-field hit metrics.

**Architecture:** Extend the typed special-reaction domain instead of branching in Odette content. Reuse participant aggregation for actual Stellar-Swirl reaction and Vortex events, while keeping direct Stellar-Swirl actions in the existing direct special-reaction pipeline. Add the shared base-damage-multiplier stage used by effects such as Neuvillette's Past Draconic Glories so Odette's A4 is not conflated with C6 Elevation.

**Tech Stack:** TypeScript, Vitest, pnpm workspaces, calculator/contracts/analyzer/content packages.

---

### Task 1: Extend the special-reaction calculator

**Files:**
- Modify: `packages/calculator/src/domain.ts`
- Modify: `packages/calculator/src/special-reaction.ts`
- Test: `packages/calculator/src/special-reaction.test.ts`

**Steps:**

1. Add failing calculator tests for direct Stellar-Swirl coefficient 1, 0.75 Anemo trigger damage, level-1/level-2 Cryo Vortex coefficients, contribution aggregation, and the shared base-damage multiplier.
2. Run `pnpm --filter @gscombat/calculator test -- special-reaction.test.ts` and verify the new cases fail.
3. Add `stellar_swirl` to the special-reaction kind union, generalize participant aggregation, and implement the three Stellar-Swirl event kinds without changing existing Moon or Stellar-Conduct results.
4. Add a traceable base-damage-multiplier stage separate from Elevation.
5. Re-run the focused calculator test and verify it passes.

### Task 2: Carry the new types through contracts and Analyzer

**Files:**
- Modify: `packages/contracts/src/analysis.ts`
- Modify: `packages/contracts/src/combat-coverage.ts`
- Modify: `packages/analyzer/src/effects/types.ts`
- Modify: `packages/analyzer/src/effects/action-effects.ts`
- Modify: `packages/analyzer/src/evaluators/shared.ts`
- Test: `packages/analyzer/test/integration/reactions/special-reaction-scenario.test.ts`
- Test: `packages/contracts/src/combat-coverage.test.ts`

**Steps:**

1. Add failing contract and Analyzer integration cases for a declared direct Stellar-Swirl action.
2. Run the focused contract and Analyzer tests and verify the missing union members/stages fail.
3. Extend schemas, effect totals, special-reaction input resolution, and trace serialization.
4. Ensure Stellar-Swirl direct damage does not read Stellar-Conduct stored-application parameters.
5. Re-run the focused tests and verify they pass.

### Task 3: Add typed effect support for the shared base-damage multiplier

**Files:**
- Modify: `packages/content/src/combat/types.ts`
- Modify: `packages/analyzer/src/effects/value-resolution.ts`
- Modify: `packages/analyzer/src/effects/action-effects.ts`
- Modify: `packages/analyzer/src/evaluators/shared.ts`
- Test: `packages/analyzer/test/integration/reactions/special-reaction-scenario.test.ts`

**Steps:**

1. Add a failing integration case proving `specialReactionBaseDamageMultiplier` multiplies separately from Elevation.
2. Run the case and confirm failure.
3. Add the typed effect target, dynamic final-ATK value resolution, trace source, and evaluator plumbing.
4. Re-run the focused test and confirm the two stages remain distinct.

### Task 4: Add Odette combat content

**Files:**
- Create: `packages/content/src/characters/odette/definition.ts`
- Create: `packages/content/src/characters/odette/combat.ts`
- Create: `packages/content/src/characters/odette/index.ts`
- Create: `packages/content/src/characters/odette/combat.test.ts`
- Modify generated registries with: `pnpm --filter @gscombat/content registries:generate`

**Steps:**

1. Add failing content tests for the two Dance Double hit families, C2 ATK percentage metric, A1 base-damage bonus, A4 base-damage multiplier, Burst reaction bonus, Splendor stacks, C2 resistance reduction, and cumulative C6 Elevation.
2. Run `pnpm --filter @gscombat/content test -- src/characters/odette/combat.test.ts` and verify the character is absent.
3. Add the definition and combat coverage. Keep C1 finale, C4 coordinated attack, Skill finale, and Burst direct damage as non-metric or deferred actions.
4. Generate registries and re-run the focused content test.

### Task 5: Verify system integration

**Files:**
- Test: `packages/analyzer/test/system/combat-registry-integrity.test.ts`
- Test: `packages/analyzer/test/system/combat-authoring-audit.test.ts`
- Test: `packages/analyzer/test/integration/reactions/special-reaction-scenario.test.ts`

**Steps:**

1. Run focused calculator, contracts, content, and Analyzer integration tests.
2. Run `pnpm --filter @gscombat/calculator typecheck`, `pnpm --filter @gscombat/contracts typecheck`, `pnpm --filter @gscombat/analyzer typecheck`, and `pnpm --filter @gscombat/content typecheck`.
3. Run the two Analyzer system tests to catch registry and authoring boundary regressions.
4. Run `pnpm build` only after focused verification is green.
5. Review `git diff --check` and `git status --short`; do not commit, push, or deploy unless explicitly requested.
