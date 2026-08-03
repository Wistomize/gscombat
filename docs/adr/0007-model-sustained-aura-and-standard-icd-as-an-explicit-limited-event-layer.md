# ADR-0007: Model sustained aura and standard ICD as a limited event layer

## Status

Accepted

## Context

ADR-0006 gives every declared damage event an identity, time, and stat-snapshot policy. It does not establish whether
that event applies an element, whether an ICD suppresses the application, or whether an enemy aura creates a reaction.
The older action-level reaction fields remain useful for isolated one-hit compatibility, but they cannot accurately
describe a timed multi-hit action such as Pyronado.

A complete elemental-gauge simulator would additionally need GU values, aura consumption and refresh, enemy-generated
elements, coexisting auras, target selection, reaction-specific ICDs, and multi-target state. That is not sufficiently
well sourced or implemented to claim today.

## Decision

The rotation calculator supports a deliberately narrow, explicit event layer:

- A `SustainedAuraWindow` represents exactly one non-consuming elemental aura on the single analyzed target during a
  half-open interval `[start, end)`. Aura windows must be finite, within the declared rotation duration, non-empty, and
  non-overlapping.
- A `RotationElementalApplication` belongs to one damage event. It either declares no ICD or a standard ICD group. An
  application event must represent exactly one hit; authors must split multi-hit damage into individual timeline events.
  It may carry a finite `reactionBonus` for that event's derived reaction.
- Standard ICD state is scoped to `ownerId + groupId`: the first event applies, then two application attempts are
  suppressed, and the next attempt applies. A 2.5-second elapsed interval resets that sequence. Events at the same
  timestamp are resolved in their declared timeline order, which is the deterministic tie-breaker for their shared ICD.
- A legacy explicit `reaction` and an event-level elemental application are mutually exclusive. Legacy reactions remain
  valid for pre-timeline compatibility actions.
- At this stage the calculator derives only these maintained pairings from a sustained aura: Pyro on Hydro produces
  reverse Vaporize, Hydro on Pyro produces forward Vaporize, Pyro on Cryo produces forward Melt, Cryo on Pyro produces
  reverse Melt, Dendro on Quicken produces Spread, and Electro on Quicken produces Aggravate. A reactive pairing not in
  this set throws an author-facing error instead of silently being treated as a normal hit.
- Every resolved rotation event exposes whether its application succeeded, the active aura identity and element, and
  any derived reaction. This makes a non-reacting damage segment explainable in the API and future UI.

## Consequences

### Positive

- Timed actions can distinguish a successful Vaporize or Catalyze event from a normal hit without character-specific
  evaluator branches.
- ICD state is attached to a configured build instance rather than a static character definition, which remains correct
  for future teams containing multiple configurations of the same character.
- The result trace identifies why a particular event did not react: no active aura, no applicable pairing, or ICD
  suppression.
- The model can be adopted one verified action at a time while existing single-hit declarations keep their behavior.

### Negative

- The model does not consume, generate, refresh, or coexist elemental auras, and it does not model GU or enemy state.
- It does not yet cover Swirl, Electro-Charged, Bloom-family reactions, reaction-specific gauges, multi-target effects,
  hitlag, or arbitrary reaction ordering.
- A sustained aura is an explicit scenario assumption, not evidence that a real team can maintain that aura.

## Alternatives Considered

### Continue storing Vaporize or Spread directly on the whole action

Rejected for timed actions. It makes every hit react and hides ICD failures, so it cannot support rotation DPR or a
useful reaction trace.

### Implement a complete elemental-gauge simulator first

Rejected for now. It would require a large quantity of character- and target-specific evidence before even a single
well-understood multi-hit action could use the timeline layer.

### Infer aura from team elements

Rejected. Team composition alone does not prove aura uptime, trigger order, or ownership. Auras must be declared as a
scenario assumption until the engine models their production and consumption.
