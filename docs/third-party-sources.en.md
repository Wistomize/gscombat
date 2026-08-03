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
- **Pinned commit:** `21c98eb60355160274a8c4cecfc5671e2151a073`
- **Upstream license:** [MIT](https://github.com/frzyc/genshin-optimizer/blob/master/LICENSE)
- **Local evidence:** `packages/game-data/sources/current.json`,
  `packages/game-data/sources/semantic-localization-preview.v3.json`, and
  `apps/web/lib/visual-assets.generated.json`

GSCombat uses the generated `allStat_gen.json` dataset for static numeric facts; Chinese localization assets for
official names and reviewed talent labels; and generated character, weapon, artifact, and element assets for compact
web thumbnails. Downloads are pinned and checksum-verified. Converted thumbnails retain the rights of their original
material. We thank the Genshin Optimizer maintainers for organizing reproducible game data and asset mappings.

## 3. Enka.Network

- **API and documentation:** [Enka.Network](https://enka.network/) and
  [EnkaNetwork/API-docs](https://github.com/EnkaNetwork/API-docs)
- **Pinned metadata commit:** `7339dc982937c40b48ef48c569bf6d0a1aa5c851`
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
