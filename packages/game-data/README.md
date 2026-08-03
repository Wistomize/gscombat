# Game data

This package owns the immutable game-data snapshots used by GSCombat. Its only upstream is the generated
`gi-stats` dataset in Genshin Optimizer. Runtime services never call an external game-data API.

## Update a snapshot

1. Update `sources/current.json` with a pinned Genshin Optimizer commit, game version, data URL, and SHA-256.
2. Run `pnpm --filter @gscombat/game-data snapshot:update`.
3. Run the package tests and inspect the generated manifest before release.

The command downloads the pinned source once, verifies its checksum, and atomically creates
`snapshots/<game-version>/game-data.sqlite`. The SQLite file is deployed read-only with the API service.

## Preview localization labels for authors

`pnpm --filter @gscombat/game-data semantic-preview:import` reads the separate
`sources/semantic-localization-preview.v3.json` lock. It verifies each listed Chinese localization asset from the
same pinned Genshin Optimizer commit, then atomically writes
`snapshots/<game-version>/semantic-localization-preview.v3.json`.

This is an optional authoring sidecar, not a migration of the default v2 SQLite snapshot. Labels preserve a reviewed
parameter index and report alignment gaps, but never infer damage type, scaling, reactions, timing, or character logic.
The initial lock intentionally contains only Xiangling as an end-to-end reviewed sample; additional characters must be
added with explicit owner mappings and checksums.

## Data boundary

The snapshot stores numeric facts and raw upstream records. Character, weapon, and artifact mechanics remain
in `@gscombat/content`; generic damage evaluation remains in `@gscombat/calculator`.

The upstream generated dataset currently includes `Somnia`, a non-playable OC/easter-egg record. Snapshot import
explicitly excludes that record and its talent parameters, so it is never exposed as a public playable static character.
