# GSCombat

**Genshin Impact character stats and combat analysis**

[Try it online](https://gscombat.online) · [中文](README.md) ·
[Report an issue](https://github.com/Wistomize/gscombat/issues) ·
[Sources and acknowledgements](docs/third-party-sources.en.md)

GSCombat answers a more useful question than “What is this artifact's score?”

> With this character, weapon, artifact set, and party, how much does the chosen action deal—and how much would one
> more stat roll or a different weapon actually improve it?

Configure a character and party, select a damage or support metric, and GSCombat reports the expected result,
resolved stats, a complete formula trace, artifact-stat marginal gains, and weapon comparisons. Each stage is
explainable, so a result can be traced back to its passive, constellation, item, teammate, or buff instead of ending
as an opaque score.

![Configured characters and team selection](docs/images/team-configuration.webp)

_Create a party of one to four configured characters. Party slots do not imply rotation or field order._

## What GSCombat can do

### Analyze a target action

- Evaluate a Normal Attack, Charged Attack, Elemental Skill, Elemental Burst, or character-specific mechanic.
- Compare no-reaction damage with applicable Amplifying, Additive, Transformative, Lunar, and Astral reactions.
- Resolve Attack, HP, Defense, and Elemental Mastery scaling together with CRIT, damage bonus, resistance, defense,
  reaction, and special-reaction stages.
- Expand multi-hit results and identify contributions from talents, constellations, weapons, artifacts, teammates,
  and buffs.

### Evaluate supports as supports

A support does not need to justify their slot with personal damage. Bennett exposes field Attack and healing metrics;
Zhongli exposes shield strength; other characters can expose healing, shielding, stat bonuses, or damage bonuses.
These metrics retain the same formula detail and activation conditions as damage metrics.

### Find the most effective upgrade

- Measure the marginal gain of each artifact substat for the current target metric.
- Convert those current gains into effective rolls across all five equipped artifacts.
- Compare character levels, talent levels, and elemental damage bonus upgrades.
- Compare compatible weapons under the current build, including effects that can be reached reliably.
- Inspect the raw artifact values used by the calculation and verify them against the equipped build.

## How to use it

1. **Prepare builds:** import an in-game showcase by UID, import a GSCombat JSON file, or create a build manually.
2. **Create a party:** choose one to four configured characters. Party slots have no positional meaning.
3. **Choose a target:** select any party member and one of their damage or support metrics.
4. **Set the scenario:** adjust enemy level, resistances, and buffs. The default target is level 100 with 10%
   resistance to every element.
5. **Calculate:** inspect the metric result, resolved stats, formula trace, effective rolls, marginal gains, and weapon
   comparisons.

[Open GSCombat](https://gscombat.online)

## Reading the report

![Raiden Shogun initial-slash result, resolved stats, and formula trace](docs/images/calculation-report.webp)

_Raiden Shogun's initial slash with Baleful Omen and Bennett's field enabled, including the expected result and
stage-by-stage trace._

### Expected metric result

This is the value being compared. A damage metric is usually one maintained core action, such as one Vaporized hit of
Xiangling's Pyronado, Neuvillette's Equitable Judgment, or a specified special-reaction hit. A support metric may be a
healing tick, shield value, or Attack buff.

### Resolved stats and formula trace

Resolved stats show the Attack, HP, Defense, Elemental Mastery, and CRIT values actually used by the action. The trace
then expands scaling, CRIT, damage bonus, reaction, resistance, defense, and special stages, including sources such as
artifact main stats and set effects, talents, constellations, teammates, and buffs.

### Marginal gains

Marginal gains are not fixed weights. GSCombat holds the character, party, enemy, and buffs constant, adds one stat
roll or replaces one weapon, then recalculates the same metric. CRIT Rate above 100% provides no further expected-damage
gain, and other caps or conditions are resolved against the actual build.

![Artifact marginal gains and weapon swap comparison](docs/images/upgrade-comparison.webp)

_Compare one average artifact roll and compatible weapon swaps while holding the character, party, and target metric constant._

## Why there is no universal artifact score

A stat's value changes with the character, weapon, party, reaction, and current build. Attack may be essential for one
character and nearly irrelevant for an HP scaler. CRIT Rate is valuable below the cap and useless above it.

GSCombat therefore evaluates the current build and target action instead of forcing every character into one CRIT-score
formula:

- **How much now:** the target action or support metric's expected result.
- **How much better:** the relative change from a stat roll, level, talent, or weapon upgrade.
- **Why:** stat sources, activation conditions, and the complete staged formula.

## Storage and cross-device sync

- **Without an invite code:** builds stay in the current browser. Export and import the whole workspace to back up or
  move it.
- **With an invite code:** builds are stored in an isolated SQLite workspace and can sync across browsers or devices.
- **Showcase import:** public third-party showcase data is converted into builds without asking for a game account or
  password.

An invite code is a workspace credential; share it only with people you trust. Without one, export your data regularly
in case browser storage is cleared.

## Current scope and limitations

GSCombat focuses on the **expected result of one core action**. It is not yet a full rotation DPS simulator. Cast timing,
animation time, player execution, random action order, and complete rotation duration are not modeled uniformly.

Weapons, artifacts, constellations, passives, teammate effects, party resonances, and special reactions are maintained
individually. Newly released mechanics or unreviewed interactions may be incomplete. When a result looks wrong, please
include the build, party, target metric, and formula trace in the report.

The current pinned Genshin Impact 7.0 snapshot contains 119 characters, 247 weapons, and 63 artifact sets. Runtime
services do not query an external API for static game data; showcase import is a separate optional feature.

## Feedback, license, and disclaimer

- Report incorrect results or request mechanics: [GitHub Issues](https://github.com/Wistomize/gscombat/issues)
- Original code is licensed under the [GNU Affero General Public License v3.0](LICENSE)
- Game data, imagery, text, and external references: [Sources and acknowledgements](docs/third-party-sources.en.md)

GSCombat is an unofficial community project and is not affiliated with or endorsed by miHoYo/HoYoverse. Genshin Impact,
its characters, weapons, artifacts, imagery, and related materials belong to their respective rights holders. Results
are community-tool estimates, not official game conclusions.

## Development and contributing

Repository layout, local development, Content authoring, data updates, testing, and deployment are documented in the
[GSCombat development guide](docs/development.en.md). Architecture decisions live under [`docs/adr`](docs/adr), and
the production deployment flow is covered by the
[Tencent Cloud deployment guide](docs/deployment/tencent-cloud.en.md).
