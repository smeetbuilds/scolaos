# Design System Workspace

This directory is the architecture/documentation workspace for the shared design system in `packages/ui`.

## Current M0 status

Completed definition tasks:

- **M0-050 — Visual direction:** DONE — [`visual-foundation.md`](visual-foundation.md)
- **M0-051 — Responsive layout principles:** DONE — [`responsive-layout.md`](responsive-layout.md)
- **M0-060 — Accessibility quality gate:** DONE — [`accessibility.md`](accessibility.md)

Implementation specifications prepared:

- **M0-052..059** — [`component-specs.md`](component-specs.md)

Still open:

- M0-052 Button/IconButton/Link implementation.
- M0-053 Form primitives/validation implementation.
- M0-054 Dialog/Sheet/Popover/Tooltip implementation.
- M0-055 Navigation primitives implementation.
- M0-056 Table/data-list foundation implementation.
- M0-057 Empty/loading/error/status implementation.
- M0-058 Date/time/calendar implementation.
- M0-059 Chart wrapper/metric implementation.
- M0-061 interactive component documentation/demo workspace completion.

## M0-061 state

**IN PROGRESS — documentation architecture created; executable demo workspace not yet built.**

This directory satisfies the documentation-structure half of M0-061. The task is not DONE until actual implemented primitives can be rendered and interacted with in a dedicated demo/catalog environment using the real `packages/ui` components.

The demo workspace should eventually provide:

- component examples for every variant/state;
- light/default theme reference;
- compact/comfortable density examples;
- narrow/medium/wide responsive examples;
- keyboard interaction examples;
- accessibility notes;
- long/localized content examples;
- reduced-motion examples;
- implementation anti-patterns;
- token inspection/reference;
- no dependency on production school data.

Do not mark M0-061 complete from static Markdown alone.

## Design-system principles

The shared UI layer must remain:

- domain-neutral;
- platform-neutral unless capability adaptation is intentional;
- semantic-token driven;
- accessible by default;
- responsive by composition rather than CSS afterthought;
- consistent enough for dense school operations;
- composable rather than configured through huge prop matrices;
- independently testable from business modules.

## Architecture relationship

```text
M0-050 visual tokens/direction
          +
M0-051 responsive composition
          +
M0-060 accessibility gate
          ↓
packages/ui primitives (M0-052..059)
          ↓
shared screens/features
          ↓
web + Tauri shells
```

`docs/contracts/platform-bridge.md` governs native/browser capability seams. The UI package must not import server code or platform-specific implementation internals.

## Component quality gate

A primitive is only complete when it has:

1. semantic tokens;
2. documented purpose/anti-patterns;
3. all required visual/interactive states;
4. keyboard/focus behavior;
5. accessibility evidence;
6. responsive behavior;
7. tests appropriate to the behavior;
8. a demo/example using the actual component;
9. no unexplained one-off styling values;
10. no permanent product-name branding dependency while M0-003 remains open.

## Naming/branding constraint

The current repository name is a temporary codename. The design system should therefore implement product-agnostic tokens and components first.

Do not create:

- permanent branded color-token names;
- final wordmark/logo components;
- app-store icon systems;
- fixed public-product typography tied to the ScolaOS name.

A future rename should primarily affect display-brand assets/configuration, not require a component-library rewrite.

## Implementation sequence

Once an executable client/UI environment is available without violating the current Actions constraint:

1. create semantic token files and base/reset/focus layer;
2. implement M0-052;
3. implement core M0-053 form controls;
4. implement overlay primitives M0-054;
5. implement navigation M0-055;
6. implement data table/list M0-056;
7. implement state primitives M0-057;
8. implement date/time/calendar M0-058;
9. implement charts/metrics M0-059;
10. finish M0-061 interactive demo/catalog;
11. run the M0-060 accessibility matrix across representative components.

This directory is authoritative for design-system definition until the actual demo/catalog becomes the richer interactive reference.