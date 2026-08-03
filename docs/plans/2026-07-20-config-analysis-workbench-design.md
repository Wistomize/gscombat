# Configuration Analysis Workbench Design

## Goal

Deliver a usable web workbench that lets a player choose or import a character build, compose teammates and
a combat scenario, evaluate one target skill, and inspect weapon and artifact-stat improvements. The web UI
must consume the same validated domain model as the API and calculator; it must not duplicate game formulas.

## Product flow

```text
built-in preset ─┐
edited build ────┼─> normalized CharacterBuild ─┐
UID showcase ────┘                              │
                                                 ├─> EvaluationScenario
configured teammates ────────────────────────────┤
enemy + external buffs + target action ──────────┘
                                                         │
                                                         v
                               expected damage + trace + comparisons
```

The initial verified vertical slice is Raiden Shogun's Musou Shinsetsu initial slash. The domain model is not
Raiden-specific: character level and ascension, talents, constellation, weapon level/refinement, and five
fully specified artifact pieces are required for every build.

## Backend boundaries

- `@gscombat/game-data` owns the pinned read-only Genshin Optimizer snapshot and numeric lookups.
- `@gscombat/calculator` owns generic stat aggregation, damage stages, counterfactual evaluation, and traces.
- `@gscombat/content` owns semantic mechanics: action parameter mapping, conditions, filters, and effects.
- `@gscombat/contracts` owns validated build, import, scenario, and evaluation HTTP schemas.
- `apps/api` resolves every build source into the same immutable `CharacterBuild` and performs evaluations.
- `apps/web` owns draft editing and browser-local saved builds. It never becomes a formula authority.

## Configuration sources

The source is provenance, not a separate calculation type:

- `builtin`: a developer-maintained preset.
- `local`: a build edited or saved in the browser.
- `showcase`: a UID showcase payload normalized by the API.

After resolution, all sources produce an immutable build snapshot with a stable ID, source metadata, and game
data version. Teammates use the same snapshots as the primary character. Calculation code cannot branch on
where a build came from.

## Scenario defaults and conditions

The default training target is level 100 with 10% physical and all-element resistance, no defense reduction,
and no defense ignore. Selecting a teammate does not silently activate every effect. Scenario state must say
whether effects such as Bennett's burst field, elemental resonance, food, or a constellation condition are
active. Built-in presets may supply explicit defaults.

## Analysis outputs

1. Target-action non-crit, crit, and expected damage with an ordered trace.
2. Compatible weapon candidates, using refinement 1 for five-star and refinement 5 for four-star weapons.
3. Marginal expected-damage gain for one canonical roll of each supported artifact substat.
4. Effective-roll contribution for every equipped artifact and the build total.

The effective-roll algorithm is a replaceable policy. The initial policy converts exact substat values to
average five-star roll equivalents and weights each roll by its current marginal gain relative to the best
positive substat. Raw roll equivalents and weighted effective rolls are both returned so the UI stays honest.

## Persistence and import

The MVP is stateless on the server. Browser-local builds are versioned JSON in local storage. UID showcase
import is proxied and normalized by the API, then stored locally like an edited build. This avoids account and
database work before it creates user value. A future user repository can persist the same build snapshots.

## Failure modes

- Unknown or unsupported imported IDs are returned as structured warnings, never silently substituted.
- A game-data version mismatch rejects evaluation until the build is migrated.
- Missing mechanics return `unsupported` rather than a plausible but incomplete damage number.
- Upstream showcase failure does not affect manual builds or built-in presets.
- All external payloads are size-limited and schema-validated before normalization.

## Verification

- Domain tests cover valid and invalid complete builds.
- Golden tests cover a fixed Raiden initial-slash scenario from real snapshot values.
- Counterfactual tests cover weapon and every supported substat intervention.
- API tests cover builtin, local, and showcase-shaped imports resolving to the same build contract.
- Browser tests cover edit, save, reuse as teammate, import, evaluate, and responsive layout.
