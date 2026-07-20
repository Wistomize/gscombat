# Ysin-like Analyzer Architecture Design

## Product goal

Build a public Genshin Impact damage analyzer that starts with Raiden National and evaluates Raiden's
Musou Shinsetsu initial slash by expected damage. The first release is a Next.js website. A Taro WeChat
Mini Program follows after the calculation model and API contract are stable.

## Architecture

The product is a TypeScript modular monolith in a pnpm workspace. The calculation engine is a pure,
platform-independent package. Character, weapon, artifact, and team definitions provide typed modifiers;
they never implement the final damage formula. The website, Mini Program, and API consume the same domain
contracts and content versions.

```text
UID or manual build
        |
        v
external adapter -> normalized Build
                         |
developer preset -> Scenario + Action
                         |
                         v
                   calculator pipeline
                         |
                         v
               expected damage + trace
                         |
                         v
               counterfactual comparison
```

## Applications

- `apps/web`: Next.js App Router website, released first.
- `apps/mini`: Taro React WeChat Mini Program, released second.
- `apps/api`: Fastify service for UID adapters, canonical evaluation, caching, and versioned responses.

## Shared packages

- `packages/calculator`: domain types, typed modifiers, damage stages, trace, and counterfactual analysis.
- `packages/content`: developer-maintained characters, equipment, effects, and team presets.
- `packages/game-data`: versioned static game data and generated lookup tables.
- `packages/contracts`: runtime schemas and shared API request/response types.
- `packages/api-client`: platform-neutral API client for Web and Mini Program.
- `packages/design-tokens`: colors, spacing, and typography tokens; UI components are not shared.

Content is organized by reusable game entities and separately composed playstyles:

```text
packages/content/src/
├── characters/
├── weapons/
├── artifacts/
├── rules/
└── playstyles/
```

A playstyle imports characters, equipment, and global rules. Character modules never import a playstyle,
which keeps game mechanics reusable and prevents circular dependencies.

## Dependency rules

The calculator cannot import content, applications, HTTP clients, databases, Node.js APIs, DOM APIs, or
WeChat APIs. Content may import calculator types. Adapters only normalize external data into domain objects.
Applications compose packages but cannot duplicate damage formulas.

## Typed damage pipeline

Modifier type determines its stage; content cannot select an arbitrary stage string. Initial direct damage
flows through stat resolution, talent multiplier, additive base damage, damage bonus, expected crit,
defense, and resistance. Later reaction branches reuse the appropriate stages without forcing
transformative reaction damage through direct-damage rules.

Each stage returns an immutable value and trace entries. Evaluation results include engine, content, and
preset versions so a shared result remains reproducible after game updates.

## First vertical slice

The first slice provides a manually constructed Raiden National scenario, evaluates one Electro burst
action, reports every multiplier, and compares a typed artifact-stat intervention. UID ingestion and full
game values are separate follow-up slices; scaffolded APIs must not pretend that placeholder data is live
game data.

## Verification

- Unit tests cover stat aggregation, expected crit clamping, defense, resistance, and trace ordering.
- Golden tests cover fixed Raiden National fixtures once authoritative game values are added.
- Counterfactual tests prove unrelated modifiers do not change the action and relevant modifiers do.
- Type checks run across every workspace package and application.
- Web, API, and Mini Program builds are independent release gates.
