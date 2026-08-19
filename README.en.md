# GSCombat

[中文](README.md) · [Tencent Cloud deployment](docs/deployment/tencent-cloud.en.md) ·
[Sources and acknowledgements](docs/third-party-sources.en.md)

GSCombat is a typed and auditable Genshin Impact character-metric and combat-damage workbench. It normalizes
character builds, a party, a target action, an enemy, and buffs into a reproducible scenario, then reports the
selected metric, resolved stats, a stage-by-stage formula trace, artifact-stat marginal gains, and weapon comparisons.

Damage metrics deliberately target the expected damage of one developer-maintained core action. GSCombat is not yet
a rotation DPS simulator. Supports use separate metrics such as healing, shield strength, Attack buffs, and damage
bonuses; each metric retains its formula tree and applicability conditions.

## Capabilities

- Build an unordered party of one to four configured characters and evaluate any member's available metric.
- Create builds manually, import JSON, and import an in-game showcase through Enka.Network. Builds stay local by
  default, while an optional invite code enables isolated cross-device synchronization.
- Evaluate direct, amplifying, additive, transformative, Lunar, and Astral reactions together with resonances,
  Moonsign, weapon, artifact, constellation, and teammate effects.
- Inspect per-hit and multi-hit traces, resolved stats, effective artifact rolls, single-roll marginal gains, and
  maximum-reachable weapon comparisons.
- Maintain actions, support metrics, passives, and constellations in each character's content directory while keeping
  the calculator character-agnostic.

Results remain community-tool estimates. Newly released mechanics, random action sequences, timing behavior, and
unreviewed data may be incomplete. The API exposes coverage and authoring audits at `/v1/combat-coverage` and
`/v1/combat-authoring/audit`.

## Repository layout

```text
apps/
├── api/          Fastify API, invite sessions, SQLite workspaces, showcase import
├── web/          Next.js website
└── mini/         Paused Taro WeChat Mini Program shell
packages/
├── analyzer/     Scenario orchestration, effect resolution, counterfactual analysis
├── calculator/   Character-independent typed damage pipeline
├── content/      Semantic characters, weapons, artifacts, and rules
├── contracts/    TypeBox domain and HTTP contracts
└── game-data/    Pinned, read-only game-data SQLite snapshots
```

Character actions, passives, constellations, and support metrics live under
`packages/content/src/characters/<character>/`. Weapon and artifact effects belong to their own content directories,
and party rules belong under `rules/`. The calculator imports no character or equipment content. The Mini Program
does not run an independent calculation path while its product work is paused.

## Maintaining Content declarations

Content uses entity-owned declarations with build-time static aggregation:

- A character's `definition.ts` owns catalog identity, official Chinese label, weapon type, and exceptional action
  labels. `combat.ts` owns actions, metrics, and character effects; reviewed multi-scaling mappings use optional
  `evidence.ts`.
- Every inventory weapon and artifact-set directory contains `effects.ts`, `coverage.ts`, and `index.ts`. An item with
  no current core-action effect exports a typed empty effect array and explains its status in coverage clauses.
- `packages/content/src/registry/*.generated.ts` contains tool-generated explicit imports. Do not edit these files or
  scan the filesystem at runtime.

After adding or moving a Content entity, run:

```bash
pnpm --filter @gscombat/content registries:generate
pnpm --filter @gscombat/content registries:check
```

Content `build`, `test`, and `typecheck` all run the freshness check first and fail on missing or stale registries.
See [ADR 0015](docs/adr/0015-generate-content-registries-from-entity-owned-declarations.md) for the decision record.

## Local development

Node.js 22+ and pnpm 11.15.1 are required.

```bash
pnpm install --frozen-lockfile
pnpm build
mkdir -p runtime/workspace
export WORKSPACE_DATA_PATH="$PWD/runtime/workspace/workspaces.sqlite"
export INVITE_TOKEN_SECRET="replace-with-at-least-32-random-characters"
pnpm --filter @gscombat/api invite -- create local
```

Keep those environment variables and start the API and web app in separate terminals:

```bash
pnpm --filter @gscombat/api dev
pnpm --filter @gscombat/web dev
```

Open `http://127.0.0.1:3200` to use a browser-local workspace. Enter the one-time-displayed invite code only when
testing cloud synchronization. The web app proxies `/api/backend/*` to `http://127.0.0.1:3001` by default; set
`API_BASE_URL` to override it.

## Verification

```bash
pnpm typecheck
pnpm test
pnpm build
```

The suite emphasizes integration across real package boundaries, SQLite, HTTP routes, and complete scenarios.

## Data and deployment

Runtime services never query an external static game-data API. `@gscombat/game-data` ships a pinned, SHA-256-verified,
read-only SQLite snapshot. Showcase import remains a separate optional adapter. See the
[game-data guide](packages/game-data/README.md) and [Tencent Cloud deployment guide](docs/deployment/tencent-cloud.en.md).

## License and disclaimer

Original project code is licensed under the [GNU Affero General Public License v3.0](LICENSE). If you provide a
modified version over a network, AGPL-3.0 requires offering the corresponding source to that service's users.
Third-party data, images, game text, trademarks, and dependencies retain their own rights and licenses.

This is an unofficial community project and is not affiliated with or endorsed by miHoYo/HoYoverse. Genshin Impact,
its characters, weapons, artifacts, imagery, and related materials belong to their respective rights holders. See
[Sources and acknowledgements](docs/third-party-sources.en.md) for the complete source inventory and pinned revisions.
