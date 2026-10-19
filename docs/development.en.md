# GSCombat Development Guide

[Back to the player README](../README.en.md) · [中文](development.md) ·
[Architecture overview](architecture.en.md) · [Architecture decisions](adr) · [Tencent Cloud deployment](deployment/tencent-cloud.en.md)

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

Production images use Node 22. The 2026-10-08 review reproduced a conflict between Node 26 global Web Storage and the Web
test environment. On that version, temporarily run
`NODE_OPTIONS=--no-experimental-webstorage pnpm --filter @gscombat/web test`.
This is not a browser-side defect. Runtime/test-environment alignment remains
[ARCH-018](plans/2026-10-08-architecture-review.md#arch-018运行版本与验证可复现性).

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
openspec/         Behavioral specs, designs, and tasks for significant changes
```

The Mini Program is currently a shell with calculation paused. See the [architecture overview](architecture.en.md)
and [issue ledger](plans/2026-10-08-architecture-review.md) for implemented responsibilities, evaluation, field presence,
cache boundaries, and remaining risks.

Character actions, passives, constellations, and support metrics live under
`packages/content/src/characters/<character>/`. Weapon and artifact effects belong to their respective content
directories, while party rules live under `rules/`. The calculator imports no character or equipment content.
Content declares game semantics, and the Analyzer composes scenarios, effects, and calculation pipelines.

## OpenSpec change management

The project uses OpenSpec selectively. Create an OpenSpec change before implementing work that changes calculation
semantics, HTTP or TypeBox contracts, workspace compatibility, data migrations, or security rules, or that implements
one feature across three or more `apps/*` / `packages/*` workspaces. Character or equipment content also qualifies when
it introduces a generic multiplier, effect stage, reaction type, or shared rule.

Ordinary character, weapon, and artifact declarations that fit the existing typed model do not require a change by
default. Neither do pinned-data refreshes without schema or semantic changes, generated assets, copy edits, or small
fixes with a clear scope. A pure refactor may still use a proposal, design, and tasks, but must set `skip_specs: true`
instead of inventing behavioral requirements.

After installing the OpenSpec CLI, inspect active changes and configuration with:

```bash
openspec list
openspec context
openspec validate --all
```

See the root [`AGENTS.md`](../AGENTS.md) for mandatory Agent triggers and
[ADR-0019](adr/0019-adopt-selective-openspec-change-management.md) for the full decision. OpenSpec does not replace
`docs/adr/`; durable architecture choices remain separate decisions.

Each governance location has one primary responsibility:

| Location | Responsibility |
|---|---|
| [`AGENTS.md`](../AGENTS.md) | Mandatory Agent entry rules applied before implementation |
| [`openspec/config.yaml`](../openspec/config.yaml) | Shared project context, artifact rules, and apply/archive constraints |
| [`openspec/specs/`](../openspec/specs) | Baseline of current observable behavior |
| [`openspec/changes/`](../openspec/changes) | Proposal, delta, design, tasks, and validation state for one change |
| [`docs/adr/`](adr/README.md) | Context, alternatives, and consequences for durable architecture choices |
| `docs/plans/` | Historical design and execution context, not current change status |

The current baseline covers [core-action results](../openspec/specs/analysis/core-action-results/spec.md),
[action semantics](../openspec/specs/analysis/action-semantics/spec.md),
[build persistence](../openspec/specs/workspace/build-persistence/spec.md),
[the Content authoring contract](../openspec/specs/content/authoring-contract/spec.md), and
[public entrypoints](../openspec/specs/architecture/public-entrypoints/spec.md). See the
[governance migration map](../openspec/governance-migration-map.md) for the current status and live evidence behind
every existing ADR.

## Local development

### Catalog maintenance

Entity declarations own names, indicators and parameters. Content `catalog/index.ts` selects the maintained display
model; `catalog/response.ts` constructs `CatalogResponse`. API `serializers/catalog.ts` and Web `lib/catalog.ts` call
the factory through `@gscombat/content/catalog`, rather than maintaining independent field mappings.
Construction is server/build-side. Client components receive data, not imports of that subpath or the Content root.

When adding display metadata, update its shared response Schema and verify nested/optional fields survive real HTTP
serialization. Preserve declared fields such as `minimumSourceConstellationByValue`; do not duplicate character-ID
gates in UI logic. Check compatibility, omission rules, detached nested data and all three output layers.
Root exports remain compatible. There is no new display snapshot or generation command.
See [ADR-0026](adr/0026-share-server-side-catalog-projection.md) and the
[ARCH-007 record](../openspec/changes/unify-catalog-projection/implementation-progress.md).

### Maintaining weapon rules

Keep automatic preparation, necessary choices, and comparison eligibility in the weapon's Content directory.
`combat/weapon-choices.ts` validates declarations; Analyzer `effects/weapon-state.ts` projects the same rules for
equipped builds, full comparisons, and single-row updates. Effective infused elements and the character's native
element are distinct. Capability evidence must identify both source and recipient: excluding a weapon's healing
amount or independent proc damage does not remove its legitimate trigger capability.

The [review ledger](../openspec/changes/implement-reviewed-weapon-default-rules/audit.md) links decisions and evidence.
Regenerate registries after declaration changes. Prioritize same-configuration zero-gain, full/incremental equivalence,
and source isolation. Consumable hit effects require authored timing for resets; grouped hits without spacing evidence
receive the prepared effect on the first hit only, without inventing frame timing.

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
export INVITE_TOKEN_SECRET="$(openssl rand -base64 48)"
pnpm --filter @gscombat/api invite -- create local
```

Keep these environment variables when starting the API. An invite code is displayed only once and must not be written
to source code, logs, or committed files.

Generate a secret only when first creating the local workspace. Reuse its original secret on later starts; generating
a new one invalidates existing invites and sessions. Development/test API instances can default to a development
secret and an in-memory store, but invite management always requires an explicit valid secret and a file-backed store.
With `NODE_ENV=production`, API startup requires both values and rejects public default/example secrets, empty values,
and memory or URI paths before opening databases. It never substitutes a temporary store. Relative and absolute file
paths are supported; create their parent directory first.

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

### Input errors and diagnostics

Analyzer callers identify input rejections using the root-exported `AnalysisInputError` and its finite code, not an HTTP
status. Broken declarations, pinned-data failures and engine invariants remain internal errors. API reuses
`ApiErrorResponseSchema` (`{ code, message }`): input 400, version conflict 409, comparison capacity 429,
budget/shutdown 503, connected cancellation 499, unknown failure 500. Existing session/workspace business codes
and success bodies remain compatible. See [ADR-0025](adr/0025-separate-domain-input-errors-from-http-failures.md).

Find the server-generated `X-Request-Id` in the response (also included in a 500 message), then locate the matching
stderr JSON diagnostic. Partial artifact responses link each request to computationId/candidateId; coalesced waiters
retain independent request identities. Do not log UIDs, invite codes, cookies, Authorization, Builds, full task keys or
raw exceptions, and do not enable full request logging. Enka missing/unavailable/timeout/other external failures map
to 404/503/504/502; normalization program errors remain 500.

Validate explicit artifact choices before evaluation. Generated candidate failures keep partial results, not user 400
or fabricated zero gains. Support UI displays usable backend messages and falls back to HTTP status for invalid JSON
or missing messages. Verification commands and scope: [implementation record](../openspec/changes/normalize-api-domain-errors/implementation-progress.md).

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

The README calculation and upgrade-comparison screenshots use a clean browser context and the built-in Raiden National
party. The capture does not read a developer's browser builds, UID, or invite code. The team overview at
`docs/images/team-configuration.webp` is maintained separately and is not overwritten by the script. Install Google
Chrome and `cwebp`, then run:

```bash
pnpm --filter @gscombat/web screenshots:readme
```

The default source is `https://gscombat.online`; set `README_SCREENSHOT_BASE_URL` to validate a local instance. The two
generated result images are written to `docs/images/`. Before committing, inspect every image for cropping, legibility,
enabled demo buffs, and sensitive information.

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
