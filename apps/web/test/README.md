# Web tests

Web tests live at the package root instead of beside production modules.

- `integration/` exercises complete configuration, cloud-sync, party, calculation, and report flows.
- `system/` protects framework configuration, visual assets, and architecture boundaries.
- `unit/` covers small pure transformations that do not require rendering the application.

Production behavior should primarily be protected through integration tests. Add a unit test only when the subject is an independently meaningful pure function.
