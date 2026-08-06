# Analyzer tests

Analyzer tests live outside `src` so the production subsystem layout remains visible.

- `system/` verifies package-wide registry, coverage, public-flow, and architecture invariants.
- `integration/` verifies calculations across Content, GameData, Calculator, and Analyzer boundaries. Character-specific cases belong in `integration/characters/`.
- `unit/` is reserved for isolated generic algorithms that do not need registered content or the pinned database.
- `fixtures/` is reserved for shared test-only builders and data.

Most current tests are intentionally system or integration tests. Do not create a role-level unit test when the same regression can be demonstrated through the registered metric or scenario path.

Production imports must never reference this directory. System tests should prefer `src/index.ts`; tests of intentionally private algorithms may import the owning subsystem explicitly.
