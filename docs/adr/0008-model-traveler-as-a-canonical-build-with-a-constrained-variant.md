# ADR-0008: Model Traveler as a canonical build with a constrained variant

## Status

Accepted

## Context

The pinned snapshot has one static `Traveler` character row for level curves, ascension data, and inherent base
stats. Its talent parameter tables are instead owned by twelve distinct element and avatar IDs such as
`TravelerAnemoF` and `TravelerPyroM`. Treating one of those IDs as a normal character would lose the canonical base
stats; treating every Traveler build as plain `Traveler` cannot resolve a talent coefficient or determine elemental
resonance correctly.

The raw owner ID is an implementation detail. Accepting it from an imported or hand-written build would let a client
combine an arbitrary talent table with an unrelated element or avatar.

## Decision

`CharacterBuild.characterId` remains the canonical `Traveler` for every Traveler build. Such a build must additionally
declare a constrained variant:

- `kind: "traveler"`;
- one of Anemo, Geo, Electro, Dendro, Hydro, or Pyro; and
- female or male avatar gender.

No other canonical character may declare that variant. The analyzer derives the raw talent owner internally from this
pair, unless a content action has an explicit static owner override. Base-stat resolution always uses the canonical
character ID, while team-element resolution uses the Traveler variant. This lets a Pyro Traveler count toward Pyro
resonance without pretending that `TravelerPyroF` has its own static level curve.

The scenario evaluator invokes the cross-field validation, and the public declared-action evaluators also reject an
incompatible variant. There are not yet verified Traveler content actions. Before an
element-specific Traveler skill or burst is authored, its content schema must gain an explicit matching-variant
requirement; a future normal attack that is common to variants can use the derived owner directly.

## Consequences

### Positive

- Static stats, talent coefficients, and team elements each come from their authoritative snapshot owner.
- UI and API clients select human-level element and gender values instead of raw game-data IDs.
- Future Traveler actions can be added per element without duplicating base-stat data or inventing twelve catalog
  characters.

### Negative

- Every stored or imported Traveler configuration needs one additional field.
- Existing showcase import does not yet recover Traveler's element or avatar from upstream display data, so it must not
  fabricate a Traveler variant.
- Traveler Burst energy cost has not yet been semantically authored per variant. A Wavebreaker's Fin comparison with
  such a teammate therefore fails explicitly instead of silently treating that energy cost as zero.
- Content must still author and validate each element's skill, burst, passive, and constellation behavior separately.

## Alternatives Considered

### Store `TravelerAnemoF` as `characterId`

Rejected. It does not own the snapshot's static character row, so base HP, ATK, DEF, level curve, and ascension
resolution become accidental or missing.

### Let clients provide `talentParameterOwnerId`

Rejected. It exposes a low-level ID and permits impossible combinations such as a Pyro UI selection with an Anemo
talent table.

### Bind every Traveler action to one fixed owner

Rejected. It would make a valid action silently use one avatar/element's parameters for all Traveler builds.
