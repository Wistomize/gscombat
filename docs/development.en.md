# GSCombat Development Guide

[Back to the player README](../README.en.md) · [中文](development.md) ·
[Architecture decisions](adr) · [Tencent Cloud deployment](deployment/tencent-cloud.en.md)

This guide is for contributors working on GSCombat code and maintained combat content. See the repository
[README](../README.en.md) for player-facing capabilities, usage, and calculation boundaries.

## Technology stack

- TypeScript 6, pnpm workspaces, and Turborepo
- Next.js website and Taro WeChat Mini Program
- Fastify API and TypeBox domain/HTTP contracts
- Pinned, read-only SQLite game-data snapshots
- SQLite user workspaces with optional invite-code synchronization
- Vitest system, integration, and unit tests

Node.js 22+ and pnpm 11.15.1 are required.

## Repository layout

```text
apps/
├── api/          Fastify API, invite sessions, SQLite workspaces, showcase import
├── web/          Next.js website
└── mini/         Taro WeChat Mini Program
packages/
├── analyzer/     Scenario orchestration, effect resolution, metric evaluation, counterfactual analysis
├── calculator/   Character-independent typed damage and special-reaction pipelines
├── content/      Semantic characters, weapons, artifacts, and party rules
├── contracts/    TypeBox domain and HTTP contracts
└── game-data/    Pinned, read-only game-data SQLite snapshots
docs/
├── adr/          Accepted architecture decisions
├── deployment/   Deployment and operations guides
└── plans/        Feature designs and implementation plans
```

Character actions, passives, constellations, and support metrics live under
`packages/content/src/characters/<character>/`. Weapon and artifact effects belong to their respective content
directories, while party rules live under `rules/`. The calculator imports no character or equipment content.
Content declares game semantics, and the Analyzer composes scenarios, effects, and calculation pipelines.

## Local development

Install and build the workspace:

```bash
pnpm install --frozen-lockfile
pnpm build
```

Start the API and web app in separate terminals:

```bash
pnpm --filter @gscombat/api dev
pnpm --filter @gscombat/web dev
```

Open `http://127.0.0.1:3200`. The website proxies `/api/backend/*` to
`http://127.0.0.1:3001` by default; set `API_BASE_URL` to override the API origin.

## Testing the optional cloud workspace

Without an invite code, the website uses browser-local storage. To test invite-code synchronization, create a local
workspace:

```bash
mkdir -p runtime/workspace
export WORKSPACE_DATA_PATH="$PWD/runtime/workspace/workspaces.sqlite"
export INVITE_TOKEN_SECRET="replace-with-at-least-32-random-characters"
pnpm --filter @gscombat/api invite -- create local
```

Keep these environment variables when starting the API. An invite code is displayed only once and must not be written
to source code, logs, or committed files.

## Maintaining Content declarations

Content follows an entity-owned declaration model with build-time static aggregation:

- A character's `definition.ts` owns catalog identity, official Chinese label, game-data ID, weapon type, and
  exceptional action labels.
- `combat.ts` owns actions, metrics, passives, constellations, and character effects.
- Use `evidence.ts` to record reviewed parameter mappings for multi-scaling or easily confused actions.
- Every inventory weapon and artifact-set directory contains `effects.ts`, `coverage.ts`, and `index.ts`.
- Items with no current core-action gain export a typed empty effect array and explain why in coverage clauses.
- `packages/content/src/registry/*.generated.ts` is generated. Do not edit it or scan the filesystem at runtime.

After adding or moving a Content entity, run:

```bash
pnpm --filter @gscombat/content registries:generate
pnpm --filter @gscombat/content registries:check
```

Content `build`, `test`, and `typecheck` all verify registry freshness. See
[ADR 0015](adr/0015-generate-content-registries-from-entity-owned-declarations.md) for the complete decision.

## Calculation-path constraints

- Production calculations use one authoritative scenario-metric path.
- Builds, teammates, enemies, and buffs enter the scenario explicitly.
- Characters and equipment declare contributions to typed stages; the calculator contains no character-specific cases.
- Weapon comparison and marginal gains rerun the same scenario instead of maintaining approximate formulas.
- Support and damage metrics share explainable formula structures, but support metrics are not forced into damage-only
  weapon and stat comparisons.
- Current output is a core-action expected result and must not be presented as full rotation DPS.

See [`docs/adr`](adr), especially
[ADR 0014](adr/0014-use-one-authoritative-scenario-metric-evaluation-path.md).

## Verification

Run at least the following before delivery:

```bash
pnpm typecheck
pnpm test
pnpm build
```

The project favors system and integration tests across real package boundaries, SQLite, HTTP routes, and complete
scenarios. Character-content tests should prove that declarations enter the shared pipeline instead of duplicating a
second implementation of the character formula.

Content or data updates also require the affected package's complete suite. Showcase changes should verify generated
metadata, and website behavior should be exercised through complete workspace flows.

## Updating README screenshots

README screenshots use a clean browser context and the built-in Raiden National party. The capture does not read a
developer's browser builds, UID, or invite code. Install Google Chrome and `cwebp`, then run:

```bash
pnpm --filter @gscombat/web screenshots:readme
```

The default source is `https://gscombat.online`; set `README_SCREENSHOT_BASE_URL` to validate a local instance. Output
is written to `docs/images/`. Before committing, inspect every image for cropping, legibility, enabled demo buffs, and
sensitive information.

## Game-data updates

Runtime services never query an external API for static game data. `@gscombat/game-data` ships pinned, SHA-256-verified,
read-only SQLite snapshots. Before updating, verify that formal upstream data is available, then generate the new
snapshot, refresh equipment inventories, showcase metadata, and visual assets, and run the complete registry and
integration suites.

See [`packages/game-data/README.md`](../packages/game-data/README.md) for commands and schema details. Pinned revisions
and usage notes live in [Sources and acknowledgements](third-party-sources.en.md).

## Audit endpoints

Development environments expose data and declaration coverage through:

- `GET /v1/game-data/status`
- `GET /v1/combat-coverage`
- `GET /v1/combat-authoring/audit`

The website development server forwards these routes through `/api/backend/*`.

## Deployment

Production uses Docker Compose for the API, Web, and Caddy services. Configure a strong random `INVITE_TOKEN_SECRET`
and back up `runtime/workspace/workspaces.sqlite` before every deployment. Deployment must not replace the user
workspace.

See the [Tencent Cloud deployment guide](deployment/tencent-cloud.en.md) for domain, HTTPS, build, health-check, and
rollback procedures.

## License and third-party material

Original code is licensed under the [GNU Affero General Public License v3.0](../LICENSE). Providing a modified version
over a network requires offering the corresponding source to service users under AGPL-3.0. Third-party game data,
imagery, text, trademarks, and dependencies retain their own rights and licenses.

When adding a data source, image source, or external implementation reference, update both
[Sources and acknowledgements](third-party-sources.en.md) and its Chinese counterpart.
