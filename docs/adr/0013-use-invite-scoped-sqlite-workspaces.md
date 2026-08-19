# ADR-0013: Use invite-scoped SQLite workspaces for cross-device configuration sync

## Status

Accepted

## Context

ADR-0001 deliberately kept evaluation stateless and stored character builds in browser local storage. The first
friends-only deployment now needs independent users and cross-device continuity without introducing account names,
passwords, email verification, or a public registration flow. Portable JSON import and export must remain available.

The existing mutable state is already a versioned build library plus an unordered party. Calculation, catalog, and
showcase-import APIs remain authoritative but do not need to persist user state. Static game facts already live in a
separate read-only SQLite snapshot.

## Decision

Visitors enter a browser-local workspace without authentication. Durable local storage is preferred; when it is
blocked, the client falls back to same-tab session storage and tells the user to export JSON before closing the tab.
If neither browser store is available, the UI remains usable in memory and prominently requires manual import/export.

Cloud synchronization is opt-in. Each high-entropy invitation code maps to one private workspace. Entering the code
establishes a signed, HTTP-only cookie session; the browser never needs to retain the raw code after login. The
database stores only an HMAC digest of each invitation code, supports revocation, and never returns a stored code.

Persist one versioned workspace JSON document and an integer revision in a writable SQLite database. The document
contains the complete character build library and current party. Continue exporting only character builds so the
portable JSON contract remains compatible with the existing product decision.

Updates use optimistic concurrency: a client submits its expected revision, and a stale update receives HTTP 409
instead of silently overwriting a newer device. Browser local storage remains a cache and offline safety copy.

Keep mutable workspaces behind a `WorkspaceStore` boundary. Run one API writer with SQLite WAL mode in the first
deployment. Keep the writable workspace database on a persistent volume and separate from the immutable game-data
snapshot. A later PostgreSQL migration replaces the store without changing calculation or workspace HTTP contracts.

## Consequences

### Positive

- Different invitation codes cannot read or overwrite each other's workspace through supported APIs.
- One code provides automatic continuity across multiple devices without a full account system.
- Visitors without a code can use the complete local workflow without creating server-side state.
- Existing JSON import/export and all stateless evaluation endpoints remain compatible.
- Revision conflicts are explicit and recoverable.

### Negative

- Anyone who possesses an invitation code can access that workspace until the code is revoked.
- The initial SQLite deployment must remain single-writer and cannot be horizontally scaled as-is.
- Losing an invitation code requires an operator to issue a new workspace rather than an email recovery flow.
- Browser-only visitors must export JSON themselves when persistent browser storage is unavailable.

## Alternatives Considered

### Require manual JSON transfer for every user

Rejected because it isolates browsers but does not provide automatic multi-device continuity.

### Add full user accounts immediately

Rejected because account recovery and identity management are unnecessary for the friends-only release.

### Normalize every build field into relational tables

Rejected for now because the versioned build contract is still evolving and the application loads and saves one
small workspace aggregate. A JSON document avoids premature migration coupling.

## References

- ADR-0001: Use a stateless evaluation API and browser-local build library
- `apps/web/lib/workspace-config.ts`
- `packages/contracts/src/builds.ts`
