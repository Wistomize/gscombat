# ADR-0006: Declare damage as an action-relative event timeline

## Status

Accepted

## Context

The first content declarations represented an action as a set of damage parts. That was sufficient to bind a talent
coefficient to one expected-damage calculation, but every part was compiled at time zero. It could not distinguish
the cast snapshot from a later hit, represent repeated hits, or protect authors from accidentally omitting one part
when an action becomes a timed sequence.

Full rotation DPR and DPS require every damage instance to have a stable identity, timing, and snapshot policy. Those
properties must be content data rather than character-specific evaluator branches.

## Decision

`CombatActionMetadata` may declare an action-relative timeline with:

- a positive action duration;
- one or more named damage events;
- the referenced damage-part ID for each event;
- the event time relative to the action cast; and
- a stat snapshot policy: `cast`, `hit`, or `time` with an explicit action-relative `snapshotAt`.

The analyzer compiles each event into one rotation event. A `cast` event reads its resolved stats at relative time zero;
a `hit` event reads them at its own relative time; a `time` event reads them at its separately declared `snapshotAt`.
That time must be finite, within the action duration, and no later than the event hit. The surrounding rotation compiler
will later add the action's global start time. Rotation-event ownership uses the configured `buildId`, while
`characterId` remains content catalog identity; this prevents future team effects from confusing an authored character
definition with a scenario actor.

Action totals, counterfactual weapon comparisons, and substat gains use rotation DPR. The legacy direct-result trace
remains as a one-hit formula compatibility view; it is not the primary total once an explicit timeline can repeat or
otherwise vary events. The API returns a rotation summary so consumers do not infer an action total from that legacy
formula aggregate.

Existing declarations remain valid: an action without a timeline compiles each declared damage part as a hit-time
event at time zero with duration one. This is a compatibility fallback, not a claim about the action's real animation
length.

The registry rejects duplicate event IDs, non-finite or out-of-duration times, references to missing parts, and
declared parts that no event maps. It also rejects invalid explicit snapshot times, timelines on unsupported evaluators,
invalid snapshot policies, and an action-level reaction assumption: a timed action must wait for per-event reactions
before it can claim reaction fidelity. Element application, ICD, state mutations, and dynamic modifier snapshots are
subsequent schema additions.

## Consequences

### Positive

- Multi-hit actions can acquire timing and snapshot fidelity without inventing a dedicated evaluator.
- Rotation traces now have a stable action event identity suitable for future aura, ICD, and effect-state traces.
- Authoring validation prevents a timing declaration from silently losing a damage part.
- Legacy actions continue to produce their existing results while content is migrated incrementally.
- A time-bounded effect window can now make `cast`, `hit`, and an independently timed snapshot yield different event
  damage without a character-specific evaluator.

### Negative

- The legacy single-action expected-damage aggregate remains separate during migration and is not authoritative for
  future heterogeneous event reactions.
- Action-relative timing alone does not model state, player commands, cooldowns, energy, enemy aura, or hitlag.
- Authors must cite and maintain timing sources before marking a production action timeline as verified.

## Alternatives Considered

### Store time directly on each damage part

Rejected. A part is a coefficient group and can legitimately be used by more than one event; separating events lets
repeated ticks reference one reviewed coefficient without duplicating data.

### Require every existing action to migrate atomically

Rejected. It would turn a correctness improvement into a large speculative timing-data migration and block valid
coefficient-only coverage.

### Keep timing inside special evaluators

Rejected. It repeats the current central-branch problem and makes cross-character auditing impossible.
