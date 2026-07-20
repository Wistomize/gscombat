# Project B

Project B is a typed Genshin Impact damage analysis workbench. The first benchmark is an illustrative
Raiden National initial-slash evaluation; its numbers prove the architecture and are not authoritative
game data yet.

## Workspace

- `apps/web`: Next.js public website.
- `apps/mini`: Taro WeChat Mini Program.
- `apps/api`: Fastify evaluation API.
- `packages/calculator`: platform-neutral typed damage pipeline.
- `packages/content`: reusable game entities and developer-maintained playstyles.
- `packages/contracts`: runtime API schemas and TypeScript types.

Content modules are organized by entity. Playstyles compose them without creating reverse dependencies:

```text
packages/content/src/
├── characters/
├── artifacts/
├── rules/
└── playstyles/
```

## Development

Use Node.js 22 or newer and pnpm through Corepack.

```bash
corepack enable
pnpm install
pnpm dev
```

Run applications independently when needed:

```bash
pnpm --filter @project-b/web dev
pnpm --filter @project-b/api dev
pnpm --filter @project-b/mini dev
```

## Verification

```bash
pnpm typecheck
pnpm test
pnpm build
```

The API listens on port `3001` by default. Its current foundation endpoints are:

```text
GET  /health
POST /v1/evaluations
```

The website development and production-start scripts use port `3100`.

See `docs/plans/2026-07-20-ysin-analyzer-design.md` for the architecture and content boundaries.
