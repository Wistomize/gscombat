# ADR-0011: Model character profiles as self-owned typed metrics

## Status

Superseded by ADR-0012

> Historical decision: the source-only metric boundary was intentionally replaced once recipient-side healing and
> field eligibility became first-class requirements. See ADR-0012 for the active model.

## Context

Core damage characters and supports do not have one comparable output. A damage character can expose a selected
core-action expected-damage metric. A support such as Bennett instead needs at least a one-tick healing amount and a
flat attack contribution. Treating Bennett's personal damage as his default metric misrepresents the build.

Converting a support effect into a particular main damage character's damage gain would require an additional fixed
target build, action, reaction, buff timing, snapshot policy, and eligibility assumptions. Those assumptions change
the result materially and are not the support character's own output. A universal score would also incorrectly merge
damage, HP restored, and attack into one unit.

## Decision

Add an optional maintainer-owned `metrics` profile to each character combat coverage declaration. A metric is typed,
has a stable ID and source action, and locks every used talent parameter to the pinned game-data snapshot with
level-one and level-ten checks.

The first metric kinds are deliberately narrow:

- `damage` references one selected action and uses the existing core-action expected-damage evaluator.
- `healing` calculates a character's own outgoing one-target healing from a declared scaling stat, percentage value,
  fixed value, and the healer's own healing bonus.
- `stat_buff` calculates a raw stat contribution from the source character's own build, such as Bennett's base-attack
  scaling flat attack buff.

Metric evaluation keeps output units separate. Healing and stat-buff metrics accept only the source character build
and the local game-data snapshot; they do not receive a teammate, enemy, main damage action, or score accumulator.
Damage metrics may receive an explicit action scenario, but are still reported as that character's selected action
output rather than as a support-effect conversion.

The first verified profiles are Raiden Shogun, Xiangling, and Bennett:

- `raiden.burst.initial_slash`: Raiden's selected initial Musou no Hitotachi damage action.
- `xiangling.burst.pyronado.reverse_vaporize`: one selected Hydro-aura Vaporized Pyronado hit.
- `bennett.burst.field.heal_tick`: one Inspiration Field healing tick.
- `bennett.burst.field.attack_buff`: the field's raw flat attack contribution.

No Bennett damage action is placed in his default metric profile. Existing damage actions remain low-level coverage
declarations and can be selected only when a future maintainer intentionally makes one a damage metric.

New formula kinds are added only when a real character needs them and the source parameters and conditions can be
reviewed. There is no generic callback or expression AST in this phase.

## Consequences

### Positive

- A support is evaluated for what its configured build actually produces, without hidden assumptions about a teammate.
- Each result is traceable to a local snapshot parameter, source stat, talent level, and applicable constellation.
- The registry can hold multiple metrics per character while preserving their different units.
- Content validation catches duplicate metric IDs, invalid source actions, invalid parameter paths, and snapshot drift.

### Negative

- The workbench cannot yet state how much a support improves a specific teammate's selected action.
- Raw values do not decide target-side eligibility, received-healing bonuses, field timing, or a universal utility score.
- Additional strongly typed formula variants will be needed for shields, energy restoration, resistance shred, and
  other support outputs.

### Neutral

- Existing team-scenario damage evaluation remains a separate capability and is not used to rank a support metric.
- Main damage action selection can migrate to explicit `damage` metrics incrementally; existing action declarations
  remain compatible during that migration.

## Alternatives Considered

### Convert every support effect into the current main damage character's gain

Rejected. It hard-codes a target build and timing model into the support's definition, making the result brittle and
misleading for another team or action.

### Use one universal score for damage, healing, and buffs

Rejected. The values have different units and no defensible universal exchange rate in the current product phase.

### Use arbitrary content callbacks or a generic expression AST

Rejected. It would make formulas difficult to validate against the pinned snapshot and would over-generalize before
real shield, energy, or resistance metrics establish the required shapes.

## References

- ADR-0002: Use core-action expected damage as the current analysis metric
- `packages/content/src/combat/types.ts`
- `packages/analyzer/src/metric.ts`
