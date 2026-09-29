# Game data

This package owns the immutable SQLite game-data snapshots used by GSCombat. The default is **7.1**: the existing
7.0 Genshin Optimizer facts are preserved and new entities are appended from pinned sources. Runtime services never
call an external game-data API. Source changes do not require replacing our database or remapping all old parameters.

## Reproduce the 7.1 increment

Run `pnpm --filter @gscombat/game-data snapshot:update:7.1` (or `snapshot:update` with the current manifest).
Use `snapshot:update:7.1 --offline` after the cache is populated. The command downloads only the selected pinned
inputs when missing, verifies checksums, copies the checked 7.0 baseline and appends two characters and six weapons
in a transaction. Old entity collisions or changed overlapping curves are errors. User workspace databases are untouched.

`snapshots/7.1/provenance.json` records the original baseline, genshin-db inputs/mappings and raw passive supplement.
The manifest's `dataSha256` hashes the compact JSON provenance, not one upstream allStat file. The generic updater
routes 7.1 to its incremental importer; it must not parse this ledger as a Genshin Optimizer dataset.
The earlier full-source evaluator below is research tooling, **not a prerequisite** for later incremental releases.

Related assets: `node --experimental-strip-types apps/web/tools/update-visual-assets-7.1.ts` from the repository root
(requires curl and cwebp). Showcase mappings: `pnpm --filter @gscombat/api exec tsx tools/generate-showcase-metadata.ts`.
These keep new source attribution separate from baseline assets.

## Reproduce an older Genshin Optimizer snapshot

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

## Offline genshin-db evaluation (not a production migration)

The evaluator pins genshin-db 7.1 commit `49a6544a6c6ae36089cb42fa591fc46f01de8bcf`.
`sources/genshin-db-evaluation.lock.json` verifies 704 upstream files and the exact baseline SQLite hash.
`sources/genshin-db-evaluation.mappings.json` keeps canonical IDs, original parameter keys, labels, and evidence states.
The full mapping covers all 2,942 parameter keys in the pinned numeric talent source: 42 manually reviewed entries,
2,849 ordered-vector-verified entries, and 51 source-only entries for the two new 7.1 characters. Seven male Traveler
normal-attack groups have one conflicting value each and are deliberately excluded from the candidate database. The
existing 37 named weapon refinement parameters are matched against complete R1–R5 numeric vectors. The report also
inventories all 470 upstream weapon passive value positions and their original R1–R5 literals. This mapping is a
source-alignment audit, **not** a review of all character/weapon effect semantics.

```sh
pnpm --filter @gscombat/analyzer... build
pnpm --filter @gscombat/game-data genshin-db:evaluate --run review-7-1
```

To regenerate the pinned mapping asset after an explicit data review, run
`pnpm --filter @gscombat/game-data exec tsx tools/genshin-db/map-parameters.ts --source /absolute/pinned/checkout`.
The generator checks the 7.0 baseline hash and locked upstream checksums; exact vectors are marked separately from
source-only entries and blocked mismatches. It does not invent passive or constellation numeric groups.

The first run downloads checksummed inputs to `.cache/genshin-db-input`. Repeat with a new run name and `--offline`
to avoid network access. A checkout can be supplied with `--source /absolute/real/path`; symlink components are
rejected (on macOS use `/private/tmp`, not `/tmp`). Build public exports first, as shown above.

Outputs live only in `.cache/genshin-db-evaluation/<run>`: `candidate.sqlite`, `provenance.json`, `report.json`,
`report.md`, `gaps.json`, `gaps.md`, and `COMPLETE`. Existing runs cannot be overwritten. A failed run may leave a `.pending` directory
without a completion marker; it is not a successful evaluation. Use another run name.
Exit **2** means evaluation completed but migration is not approved; exit **1** means execution failed.
No changes are made to `sources/current.json`, production snapshots, the default version, or user data.

The full report includes row differences, all source parameters, numerical mapping suggestions, refinement units,
Content registry issues and evidence requiring review, and two real Analyzer evaluations. `candidate-not-imported` means
the candidate row was not imported; it is **not** evidence that upstream lacks the mechanic. `baselineGroups` in
`report.json` separates empty old groups, nonnumeric metadata, Chinese-description-backed groups pending semantic
review, and groups that require cross-section description review. A literal number match in a description is only a review
hint, not an approved mapping. `gaps.json` excludes empty and metadata groups; it distinguishes description review,
vector conflict, missing CN labels, no 7.0 gold, source-only refinement
literals, and unresolved Content references, each with provenance paths and affected references. Artifact main/substat tables retain
their 7.0 provenance. Missing passive/innate stats are not filled from old values. Static data availability does not
mean new character mechanics are implemented. Compare report `digest` values for repeatability on identical inputs
and built code. A candidate always requires explicit review before production adoption.

`tools/genshin-db/prepare-lock.ts CHECKOUT BASELINE [PART]` prints 200-file chunks of a proposed lock after checking
the pinned clean checkout; it never updates a lock automatically. Do not generate reviewed parameter mappings by
sorting keys or matching numbers alone. Fixtures contain real pinned-data extracts and retain upstream attribution.
See [third-party sources](../../docs/third-party-sources.md).
