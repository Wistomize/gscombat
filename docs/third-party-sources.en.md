# External sources, assets, and acknowledgements

This document inventories the datasets, APIs, theory references, product inspiration, visual assets, and major
runtime dependencies used by GSCombat. Pinned revisions and checksums support reproducible builds. Third-party
material does not become AGPL-3.0-licensed merely because it is present in this repository.

## 1. Genshin Impact and HoYoverse

- **Rights holder:** [HoYoverse/miHoYo](https://www.hoyoverse.com/)
- **Material:** Genshin Impact names, characters, weapons, artifacts, skill text, statistics, imagery, icons, and
  other game assets.
- **Use:** unofficial community analysis, configuration display, and formula verification. This repository does not
  claim ownership of or relicense that material.

GSCombat is not affiliated with, sponsored by, or endorsed by miHoYo/HoYoverse. All game-related trademarks and
materials belong to their respective rights holders.

## 2. Genshin Optimizer

- **Project:** [frzyc/genshin-optimizer](https://github.com/frzyc/genshin-optimizer)
- **Pinned commit:** `98aafa1f135f086524b611c7d5b5bfb78d98bb6d`
- **Upstream license:** [MIT](https://github.com/frzyc/genshin-optimizer/blob/master/LICENSE)
- **Local evidence:** `packages/game-data/snapshots/7.0/manifest.json`,
  `packages/game-data/sources/semantic-localization-preview.v3.json`, and
  `apps/web/lib/visual-assets.generated.json`

GSCombat uses the generated `allStat_gen.json` dataset for static numeric facts; Chinese localization assets for
official names and reviewed talent labels; and generated character, weapon, artifact, and element assets for compact
web thumbnails. Downloads are pinned and checksum-verified. Converted thumbnails retain the rights of their original
material. We thank the Genshin Optimizer maintainers for organizing reproducible game data and asset mappings.

### genshin-db (7.1 additions and offline evaluation)

- Project: [theBowja/genshin-db](https://github.com/theBowja/genshin-db). Thanks to theBowja and its maintainers.
- Pinned revision: `49a6544a6c6ae36089cb42fa591fc46f01de8bcf` (7.1).
- Usage: append two characters and six weapons to our SQLite, including numeric facts, growth curves, Chinese text
  and icon mappings. Existing 7.0 facts retain their original sources.
- Evidence: `packages/game-data/snapshots/7.1/provenance.json`; earlier evaluation remains in `sources/genshin-db-evaluation.*.json`.
- The repository uses MIT; its notice is retained beside the fixtures. Game content retains its original rights.

### AnimeGameData (7.1 passive supplement)

Thanks to [DimbreathBot/AnimeGameData](https://github.com/DimbreathBot/AnimeGameData) for raw-data organization.
Pinned commit `9587d1afbd9ab0419cdd00dc05ecd114b9e3fe99` supplies ProudSkillExcelConfigData and Chinese TextMap
evidence for the new passives and linked descriptions. Paths, IDs and checksums are in the 7.1 provenance ledger.
Game facts and text retain their original rights; our AGPL and other repositories' MIT notices do not relicense them.
New thumbnails use genshin-db filename mappings and Enka's `/ui` hosting. Source image URLs and checksums are
recorded separately in `visual-assets.generated.json` under `additionalSources`; images remain HoYoverse property.

## 3. Enka.Network

- **API and documentation:** [Enka.Network](https://enka.network/) and
  [EnkaNetwork/API-docs](https://github.com/EnkaNetwork/API-docs)
- **Pinned metadata commit:** `dc86b5dc06ad27d26c9a4df9f0b6ffd0417bf554`
- **Local evidence:** `apps/api/src/showcase-metadata.generated.ts`
- **Use:** showcase requests through `/api/uid/{uid}` and pinned character, weapon, and artifact item-ID mappings.

GSCombat does not enumerate UIDs or bulk-mirror showcase data and sends an explicit User-Agent. GitHub does not detect
a repository license for API-docs at the pinned revision, so GSCombat uses the response shape and metadata only for
the documented API purpose and does not represent Enka documentation or code as AGPL-covered project code. We thank
Enka.Network for providing access to player showcases.

## 4. Combat theory and mechanics cross-checking

- [KQM Theorycrafting Library: Damage Formula](https://library.keqingmains.com/combat-mechanics/damage/damage-formula)
- [KQM Theorycrafting Library: Elemental Reactions](https://library.keqingmains.com/combat-mechanics/elemental-effects)
- [KQM Theorycrafting Library: Internal Cooldown](https://library.keqingmains.com/combat-mechanics/internal-cooldown)

These community references are used to cross-check stat, talent, damage-bonus, critical-hit, defense, resistance,
reaction, and standard-ICD mechanics. GSCombat's implementation, types, tests, and formula traces are independent;
the referenced prose and diagrams remain the property of their authors. We thank KQM researchers and evidence-vault
contributors. New mechanics are marked verified only after pinned data and code review are complete.

## 5. Ysin product direction

- **Reference:** [ysin-book](https://gitee.com/bannite/ysin-book)
- **Reviewed commit:** `19258f36ce43a3e68f409020e778ba5890b6b381`
- **Use:** product-level inspiration for comparing the marginal value of a stat roll or weapon while holding a
  character playstyle and configuration fixed.

No Ysin source code was copied. GSCombat's engine, contracts, and UI are independently implemented. We thank Ysin for
exploring this style of Genshin Impact build analysis.

## 6. Open-source dependencies and containers

Major direct dependencies include TypeScript, React, Next.js, Fastify, TypeBox, Taro, Vitest, Turbo, pnpm, undici,
SQLite, Caddy, and Node.js. Each direct and transitive dependency retains its own license. Exact versions are pinned
in `pnpm-lock.yaml`; complete reports for the installed lockfile can be generated with:

```bash
pnpm licenses list --prod
pnpm licenses list --dev
```

Container builds use the [official Node.js image](https://hub.docker.com/_/node) `node:22-bookworm-slim` and the
[official Caddy image](https://hub.docker.com/_/caddy) `caddy:2.10.2-alpine`. See `Dockerfile` and `compose.yaml`.

## 7. Maintenance rule

Any new external dataset, reference, or asset must pin its repository/revision/path/checksum when applicable, retain
upstream attribution and licensing requirements, update both versions of this inventory, and remain clearly excluded
from the claim that original GSCombat code is AGPL-3.0 licensed.
