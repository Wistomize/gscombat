# ADR-0002: Use core-action expected damage as the current analysis metric

## Status

Accepted

## Context

The workbench needs a useful Ysin-style answer before it can simulate a complete combat rotation: under one fixed
build, weapon, teammate condition, enemy, and reaction assumption, how much does a selected core action gain from one
artifact roll or a weapon replacement?

A full team rotation would additionally require sourced action timings, switches, player input cadence, hitlag,
energy and cooldown closure, aura generation and consumption, reaction ownership, target behaviour, and a policy for
player execution. Those are not sufficiently modeled or validated yet. Reporting a rotation DPS now would create a
false sense of precision.

Some individual actions still have more than one damage event. Their within-action timing may matter for a cast
snapshot, a known buff window, or a reviewed elemental application. That is distinct from simulating a full rotation.

## Decision

For the current damage-analysis branch, use **core-action expected damage** as the analysis total:

- It is the sum of all explicitly declared damage events belonging to one selected action execution.
- The build, fixed teammate buffs, enemy, selected conditions, and reaction assumption remain unchanged for every
  counterfactual.
- Weapon comparisons, one-roll marginal gains, and effective artifact rolls compare the change to that same action
  total.
- The formula trace exposes the base scaling, additive or amplifying reaction, damage bonus, expected critical,
  defense, and resistance stages for each included hit.

An action-relative event list remains an internal implementation detail for a multi-hit core action. It may represent
only evidence-backed snapshots or applications within that one action. It must not be interpreted as a team command
sequence, an animation-complete rotation, DPR, or DPS.

Full rotation evaluation is deferred. A later decision may add it only after the necessary timing, state, resource,
and elemental evidence is modeled and validated end to end.

Raw self-owned non-damage outputs, such as a healer's one-tick healing or a buffer's flat stat contribution, are
separate typed metrics. They are outside this action-damage total and must not be converted into a selected main
damage character's gain without a separate, evidence-backed decision.

## Consequences

### Positive

- The current result is explainable and matches the level of mechanics the workbench can actually maintain.
- Marginal stat and weapon analysis remains meaningful without inventing player execution assumptions.
- Characters can be added one core action at a time, with any unsupported state clearly named in the action's scope.

### Negative

- The result does not answer total team damage or DPS, and it must not be presented as either.
- Off-field cadence, full-duration summons, energy loops, and multi-action buff uptime remain future work.

### Neutral

- A multi-hit action can still use an event-level trace when it is necessary to calculate that single action correctly.
- Existing internal event aggregation remains a compatibility mechanism; public labels and analysis semantics use
  core-action expected damage.

## Alternatives Considered

### Full rotation DPR and DPS now

Rejected for the current phase. The required timing and state assumptions are not yet reliable enough to claim that
precision.

### One universal artifact score

Rejected. Stat value is dependent on the selected action, fixed configuration, and enemy conditions.

### One unannotated talent coefficient per character

Rejected. A coefficient without its scaling stat, conditions, reaction assumption, and multiplier trace cannot support
the required build diagnosis.

## References

- ADR-0003: Declare semantic actions against the pinned snapshot
- ADR-0004: Declare amplifying reaction assumptions per action
- ADR-0006: Declare damage as an action-relative event timeline
- ADR-0011: Model character profiles as self-owned typed metrics
