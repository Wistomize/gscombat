# Project Instructions

## Git

- Branch names must not contain `codex`.
- Preserve unrelated user changes in the worktree.
- Do not commit, push, deploy, or rewrite Git history unless the user explicitly requests it.

## OpenSpec Change Workflow

Before implementation, classify whether the requested work requires OpenSpec. If any trigger below applies, read
`openspec/config.yaml`, inspect `openspec/specs/` and active changes, and use the generated OpenSpec skills under
`.agents/skills/` before editing implementation code.

An OpenSpec change is mandatory when the work does any of the following:

- changes calculation semantics, a generic multiplier, effect stage, reaction type, or shared domain model;
- changes an HTTP API, TypeBox contract, public data shape, or compatibility promise;
- introduces workspace compatibility behavior, a data migration, or a security or authorization rule;
- implements one feature across three or more `apps/*` or `packages/*` workspaces;
- introduces an architectural boundary or major design decision that constrains future work;
- adds character, weapon, or artifact content that requires a new reusable calculation capability.

Write delta specs only when observable system behavior changes. Pure refactors, tooling changes, and documentation
work may still require `proposal.md`, `design.md`, and `tasks.md`, but must set `skip_specs: true` instead of inventing
behavioral requirements.

The following work does not require an OpenSpec change by default:

- ordinary character, weapon, or artifact declarations that fit the existing typed model;
- pinned-data refreshes that do not change schemas or behavior semantics;
- generated registries, metadata, screenshots, or static assets;
- copy edits and small fixes with a clear, locally testable scope.

For a qualifying change:

1. Use `openspec-propose` to create the proposal, delta specs when applicable, design, and tasks.
2. Keep specs behavior-focused; put implementation choices in `design.md` and executable verification in `tasks.md`.
3. Do not implement until the planning artifacts are coherent and the user has approved the scope.
4. Use `openspec-apply-change` for implementation and keep task checkboxes current.
5. Validate relevant focused tests and repository gates before requesting archive.
6. Use `openspec-archive-change` only after implementation is complete and the user explicitly requests finalization.

OpenSpec does not replace ADRs. Durable architecture decisions, alternatives, and consequences remain in `docs/adr/`;
the related OpenSpec `design.md` must link to the ADR when one exists.

Keep the governance roles distinct: `AGENTS.md` is the Agent entry point, `openspec/config.yaml` holds cross-change
constraints, `openspec/specs/` describes current observable behavior, and `docs/adr/` preserves durable rationale and
alternatives. Link between them instead of copying whole documents.

## Testing

- Follow the focused and full verification requirements in `docs/development.md` and the active OpenSpec tasks.
- Do not change expected values merely to make a regression test pass; investigate the semantic difference first.
