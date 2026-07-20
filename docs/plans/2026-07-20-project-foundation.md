# Project Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a verified TypeScript monorepo foundation for the website-first Ysin-like analyzer.

**Architecture:** Use a pnpm/Turborepo modular monolith with a pure calculator package and separately
deployable Next.js, Fastify, and Taro applications. Prove package boundaries with a minimal typed direct
damage evaluation rather than generating empty folders only.

**Tech Stack:** TypeScript, pnpm, Turborepo, Vitest, Next.js, React, Fastify, TypeBox, Taro

---

### Task 1: Record the architecture

**Files:**
- Create: `docs/plans/2026-07-20-ysin-analyzer-design.md`
- Create: `docs/plans/2026-07-20-project-foundation.md`

**Step 1:** Document application, package, dependency, calculation, and verification boundaries.

**Step 2:** Verify every referenced path belongs to the planned workspace.

### Task 2: Initialize the workspace

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`

**Step 1:** Define workspace scripts for build, test, and type checking.

**Step 2:** Configure strict TypeScript defaults shared by all packages.

**Step 3:** Install dependencies and verify pnpm resolves every workspace package.

### Task 3: Build the calculator package with TDD

**Files:**
- Create: `packages/calculator/src/domain.ts`
- Create: `packages/calculator/src/evaluate.ts`
- Create: `packages/calculator/src/index.ts`
- Create: `packages/calculator/src/evaluate.test.ts`

**Step 1:** Write failing tests for expected crit and direct-damage stage order.

**Step 2:** Run `pnpm --filter @project-b/calculator test` and confirm failure.

**Step 3:** Implement the smallest immutable typed pipeline that passes the tests.

**Step 4:** Run calculator tests and type checking.

### Task 4: Add contracts and Raiden National content

**Files:**
- Create: `packages/contracts/src/index.ts`
- Create: `packages/content/src/characters/raiden/actions.ts`
- Create: `packages/content/src/characters/raiden/effects.ts`
- Create: `packages/content/src/playstyles/raiden-national/preset.ts`
- Create: `packages/content/src/index.ts`
- Create: `packages/content/src/playstyles/raiden-national/preset.test.ts`

**Step 1:** Define versioned evaluation request and response schemas.

**Step 2:** Write a failing test for a developer-maintained Raiden National action fixture.

**Step 3:** Implement the fixture using calculator domain types, then verify the test.

### Task 5: Add the API application

**Files:**
- Create: `apps/api/src/app.ts`
- Create: `apps/api/src/server.ts`
- Create: `apps/api/src/app.test.ts`

**Step 1:** Write a failing injected-request test for health and evaluation routes.

**Step 2:** Implement Fastify routes that call the shared calculator.

**Step 3:** Run API tests and type checking.

### Task 6: Add website and Mini Program shells

**Files:**
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/mini/src/app.ts`
- Create: `apps/mini/src/app.config.ts`
- Create: `apps/mini/src/pages/index/index.tsx`
- Create: `apps/mini/config/index.ts`

**Step 1:** Render the architecture status and first benchmark consistently on both clients.

**Step 2:** Run independent Web and Mini Program builds.

### Task 7: Verify the foundation

**Step 1:** Run `pnpm typecheck`.

**Step 2:** Run `pnpm test`.

**Step 3:** Run `pnpm build`.

**Step 4:** Inspect `git status` and ensure generated output is ignored.
