# GSCombat Repository Consolidation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate the complete Genshin combat-analysis workbench into a maintainable private GitHub repository named `gscombat`, with a generic analyzer boundary, bilingual documentation, complete attribution, and byte-identical deployment provenance.

**Architecture:** Character actions, talents, passives, constellations, and selectable snapshots belong to `packages/content/src/characters/<character>/`. `packages/analyzer` consumes those typed declarations through generic stat, effect, scenario, and metric evaluators; it must not contain character-specific calculation branches. Generated inventories and pinned game-data snapshots remain reproducible inputs and are not split merely to reduce line counts.

**Tech Stack:** TypeScript 6, pnpm workspaces, Turborepo, Fastify, Next.js, Taro, Vitest, SQLite, Docker Compose, Caddy, GitHub CLI.

---

### Task 1: Define repository boundaries

**Files:**
- Modify: `.gitignore`
- Modify: `.dockerignore`
- Verify: `.env.deploy.example`

**Steps:**

1. Ignore dependencies, package/build caches, generated runtime state, local SQLite journals, logs, editor settings, secrets, CodeGraph state, and deployment-local files.
2. Keep source-controlled pinned game-data snapshots, generated source inventories, web assets required for offline builds, lockfiles, container definitions, and environment examples.
3. Run `git check-ignore` against representative tracked and ignored files.

### Task 2: Move character-owned behavior into content

**Files:**
- Modify: `packages/content/src/characters/raiden/combat.ts`
- Modify: `packages/content/src/characters/bennett/combat.ts`
- Modify: `packages/content/src/characters/raiden/index.ts`
- Modify: `packages/content/src/characters/bennett/index.ts`
- Modify: `packages/content/src/index.ts`
- Modify: `packages/analyzer/src/scenario.ts`
- Modify: `packages/analyzer/src/index.ts`
- Delete: `packages/analyzer/src/raiden.ts`
- Replace: `packages/analyzer/src/raiden.test.ts`

**Steps:**

1. Add a content-level Raiden initial-slash declaration with separate base and Resolve scaling terms, bounded Resolve stacks, and a one-event action timeline.
2. Declare Raiden's Electro bonus conversion, Eye burst bonus, and C2 defense ignore as typed character effects.
3. Declare Bennett's field Attack contribution and C1 addition as source-base-Attack effects derived from the field marker.
4. Route Raiden through the same declared direct-action evaluator as every other character.
5. Remove the legacy special evaluator and its public exports.
6. Update integration assertions to prove the generic pipeline preserves expected damage, talent levels, equipment effects, and team buffs.

### Task 3: Split scenario orchestration by responsibility

**Files:**
- Create: `packages/analyzer/src/scenario-buffs.ts`
- Create: `packages/analyzer/src/scenario-effect-selection.ts`
- Modify: `packages/analyzer/src/scenario.ts`
- Test: `packages/analyzer/src/scenario.test.ts`

**Steps:**

1. Extract resonance and Moonsign-derived external buffs into `scenario-buffs.ts`.
2. Extract maximum-reachable equipment selection and source disambiguation into `scenario-effect-selection.ts`.
3. Keep `scenario.ts` as validation and evaluator dispatch only.
4. Run analyzer and API integration tests after each extraction.

### Task 4: Reduce oversized UI source files

**Files:**
- Create: `apps/web/app/workbench/damage-formula.tsx`
- Create: `apps/web/app/workbench/support-formula.tsx`
- Modify: `apps/web/app/workbench.tsx`
- Create: `apps/web/app/workspace.css`
- Create: `apps/web/app/workbench.css`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/layout.tsx`
- Test: `apps/web/app/workspace-flow.test.tsx`

**Steps:**

1. Extract stateless formula rendering and formatting from the stateful workbench.
2. Split configuration/workspace styles from calculation/report styles while preserving cascade order.
3. Keep generated visual-asset metadata unchanged.
4. Run web integration tests, typecheck, and production build.

### Task 5: Publish bilingual project documentation

**Files:**
- Replace: `README.md`
- Create: `README.en.md`
- Create: `docs/architecture.md`
- Create: `docs/architecture.en.md`
- Update: `docs/deployment/tencent-cloud.md`

**Steps:**

1. Document project goals, current scope, non-goals, package dependency direction, calculation pipeline, setup, commands, workspace sync, data refresh, testing, and deployment.
2. Keep Chinese and English navigation symmetric.
3. Name the product `GSCombat（原神战斗分析爽）` and remove remaining `Project B` user-facing metadata.

### Task 6: License and attribute every external source

**Files:**
- Create: `LICENSE`
- Create: `NOTICE.md`
- Create: `docs/third-party-sources.md`
- Create: `docs/third-party-sources.en.md`
- Create: `THIRD_PARTY_LICENSES.md`

**Steps:**

1. Apply AGPL-3.0-only to original project code.
2. Explicitly exclude third-party game names, data, descriptions, and visual assets from that grant.
3. Inventory every referenced external dataset, API, theory source, inspiration project, visual-asset host, and runtime dependency family.
4. Generate dependency-license evidence from the pinned pnpm lockfile and verify no unknown license remains unreviewed.

### Task 7: Validate the consolidated repository

**Files:**
- Test: all workspace test and build targets

**Steps:**

1. Run `pnpm typecheck`.
2. Run `pnpm test` with existing integration-heavy coverage.
3. Run `pnpm build`.
4. Run `git diff --check` and verify no secrets or runtime databases are staged.

### Task 8: Publish and deploy one immutable revision

**Files:**
- GitHub: private repository `Wistomize/gscombat`
- Server: `/home/ubuntu/gscombat`

**Steps:**

1. Create a non-`codex` local release branch and commit the complete reviewed repository.
2. Create the private GitHub repository and push the commit as `main`.
3. Clone or fetch that exact GitHub commit on `tencentyun`, retaining only the server-owned `.env` and writable SQLite volume.
4. Rebuild with Docker Compose and run public login, workspace read/write, and page smoke tests.
5. Compare local `git rev-parse HEAD`, GitHub `refs/heads/main`, and server `git rev-parse HEAD`; all three must match.
