# ADR-0009: Model elemental infusions as explicit event overrides

## Status

Accepted

## Context

Many character states and team effects turn an otherwise Physical melee normal attack into an elemental hit. An
infusion is not a normal stat buff: it is decided at the damage event's hit time, changes the applicable elemental
damage bonus and enemy resistance, and determines whether the hit applies an element or reacts. It must not rewrite
the action's cast-time stat snapshot.

Putting this behavior in individual character evaluators would duplicate timing, ownership, reaction, and ICD logic.
Treating it as an ordinary `RotationEffectWindow` would be wrong because effect windows select stats at
`statSnapshotTime`, while an infusion selects the hit's final element at event time.

## Decision

The rotation calculator has a separate, explicit elemental-override layer:

- A content timeline event may be tagged as `normal_attack` only when it is a Physical, melee, normal-attack event.
  The registry rejects bow, catalyst, non-normal, and non-Physical declarations.
- A `RotationElementOverrideWindow` selects a non-Physical element for matching owner and target during the half-open
  interval `[start, end)`. Overlapping windows that could affect the same owner/target are invalid; the model has no
  implicit priority order.
- The final element is resolved before elemental application, reaction derivation, resistance, and trace output. The
  rotation event records the override ID and both the base and final elements.
- Resolved damage stats separate universal `damageBonus` from `damageBonusByElement`. The calculator combines the
  universal value with the final element's specific value, so a Pyro override uses a Pyro goblet instead of the
  original Physical bonus. Stat effect windows still apply at `statSnapshotTime`.
- An elemental application may be `always` or `while_element_overridden`. The latter does not apply or advance ICD
  outside an active override window.
- Public scenarios select only named active effects. Combat content owns each effect's source character, eligible
  weapon families, constellation gate, duration parameter, and element; the analyzer validates the source build and
  materializes an action-relative window for the configured primary build. Clients cannot inject an arbitrary
  element, source, or timing window.

## Consequences

### Positive

- Characters can share one event-level model for self-infusions, teammate infusions, resistance, reaction, and ICD.
- A hit can keep a prior stat snapshot while becoming elemental later, which matches the distinct timing semantics.
- The source of an elemental result is visible in the rotation response instead of hidden in a special evaluator.
- Chongyun's Frost Field is the first end-to-end source-locked effect: it can turn his explicitly tagged first melee
  normal hit into Cryo and enable that hit's elemental application. Existing untagged actions, including Xiangling's
  legacy one-hit Pyronado compatibility action, preserve their prior result.

### Negative

- The first version supports only explicitly tagged Physical melee normal attacks; charged, plunge, weapon-specific,
  and non-overridable states require later declared targets.
- It does not choose among competing real-game infusions or model all override-immunity rules. Such cases must remain
  unsupported until a sourced priority rule is added.
- The action-relative current evaluator treats a selected active effect as available at action start. Full rotations
  still need source-cast time, remaining duration, target position, and override-priority evidence before they can
  model a field continuously.

## Alternatives Considered

### Change an action's static element

Rejected. One action may have uninfused and infused hits in a single timeline, and a static element cannot select the
correct hit-time resistance or damage bonus.

### Reuse stat effect windows

Rejected. Effects are resolved at snapshot time, while an infusion is resolved at hit time; combining them would
miscalculate delayed hits.

### Add a per-character special evaluator for every infusion

Rejected. It repeats common timeline and ICD logic and prevents registry-level auditing of the event contract.
