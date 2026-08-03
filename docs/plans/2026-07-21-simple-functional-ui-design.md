# Simple functional UI

## Goal

Keep every existing configuration and analysis capability while removing the branded, decorative presentation. The page should read like a conventional engineering tool: white background, black text, visible borders, compact spacing, and predictable controls.

## Structure

- A compact header shows product scope, runtime status, and export.
- A left rail contains configuration source, team selection, enemy settings, effects, and food buffs.
- The main area contains the selected character editor, one explicit calculate action, and the analysis report.
- Desktop uses a two-column layout. Tablet and mobile stack the same sections without changing their order.

## Interaction and data flow

No state or API behavior changes. Built-in, local, showcase, and JSON sources continue to normalize into the same scenario. Character edits remain local until saved, and analysis still posts the complete scenario to the backend. Errors remain inline and do not clear the current form.

## Visual rules

- White surfaces, near-black text, gray borders, and no decorative gradients or ambient shapes.
- System UI fonts for predictable Chinese rendering.
- Black is reserved for the selected source and primary calculate action.
- Result comparisons use green and red only where the sign of a value matters.
- English helper labels remain in markup for semantics but are hidden in the simplified presentation.

## Verification

Run the web unit tests, TypeScript check, and production build. Verify that the server-rendered page includes the editor and calculate action and that the frontend proxy still returns a complete analysis response.
