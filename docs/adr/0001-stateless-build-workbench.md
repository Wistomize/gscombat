# ADR-0001: Use a stateless evaluation API and browser-local build library

## Status

Accepted

## Context

The first public release needs manual builds, built-in presets, UID showcase import, reusable teammates, and
authoritative calculations. It does not yet need accounts, cross-device sync, collaboration, or private data.
Static game facts already ship as a versioned SQLite snapshot.

## Decision

Keep the evaluation API stateless. Normalize every configuration source into one immutable `CharacterBuild`.
Store user-edited and imported builds in versioned browser local storage. Proxy UID showcase import through the
API. Continue deploying game facts as a separate read-only SQLite snapshot.

## Consequences

### Positive

- No account or mutable production database is required for the first useful release.
- Manual, builtin, and showcase builds share calculation and validation code.
- A future server-side build repository can persist the same snapshot contract.
- Evaluation remains reproducible and horizontally scalable.

### Negative

- Builds do not initially sync across devices.
- Clearing browser storage removes unsynchronized builds.
- Public share links require a later persistence layer.

### Neutral

- UID import is an optional adapter and does not become a second static game-data source.

## Alternatives Considered

### PostgreSQL and accounts immediately

Rejected for the MVP because it adds authentication, migrations, privacy, and operations before calculation and
configuration quality are proven.

### Run calculation and import entirely in the browser

Rejected because the read-only SQLite repository is Node-based, external showcase APIs may not allow browser
access, and it would duplicate authoritative server behavior.
