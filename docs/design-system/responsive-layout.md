# Responsive Layout Strategy

**Task:** M0-051  
**Status:** ACCEPTED  
**Effective:** 13 August 2026

## Purpose

Define one responsive composition strategy for web, desktop and mobile shells so features are intentionally redesigned across available space rather than simply squeezed from desktop into a narrower viewport.

Breakpoints are implementation tools, not product personas. The product responds to usable layout width, input method and platform capability.

## Responsive principles

1. Preserve task priority, not desktop geometry.
2. Navigation adapts structurally across widths.
3. Dense information is progressively prioritized, not blindly hidden.
4. Mobile actions remain reachable with one-handed use where practical.
5. Touch/keyboard/pointer input are all first-class.
6. Tables have an explicit per-feature narrow-screen strategy.
7. Modals become sheets/full-screen flows when spatial constraints require it.
8. Layout uses fluid min/max constraints before adding breakpoints.
9. No feature is “responsive” merely because it does not overflow horizontally.
10. Zoom/text scaling and localization are treated as real layout stressors.

## Reference layout bands

These are design reference bands, not device-brand names:

| Band | Approx. content width | Typical composition |
|---|---:|---|
| `compact` | `< 480px` | phone portrait / narrow split view |
| `small` | `480–767px` | large phone / small tablet / narrow desktop panel |
| `medium` | `768–1023px` | tablet portrait / compact desktop |
| `large` | `1024–1279px` | laptop / tablet landscape |
| `wide` | `1280–1535px` | desktop |
| `xwide` | `>= 1536px` | large desktop / ultrawide working area |

Actual CSS breakpoints may be adjusted when component evidence proves better thresholds. Feature layouts should prefer container-aware behavior where feasible rather than assuming the whole viewport is available.

## Grid and gutters

Reference page gutters:

- compact: 16px;
- small/medium: 20–24px;
- large: 24–32px;
- wide/xwide: 32px with bounded content where appropriate.

Reference content grids:

- compact/small: 4 conceptual columns;
- medium: 8 columns;
- large/wide: 12 columns.

These are composition guides, not a requirement that every component use CSS grid columns.

## App shell

### Large/wide

Use:

- persistent/collapsible left navigation;
- top command/search/global-action region;
- page-level title/context/actions;
- working content area;
- optional contextual side panel only when it materially improves the workflow.

The sidebar should collapse to a compact rail before content becomes unusably narrow.

### Medium

Use an adaptive navigation rail/sidebar depending on role and feature density.

- persistent full labels are optional;
- contextual panes may become overlays or drill-in pages;
- page actions may collapse into a prioritized action + overflow menu;
- do not shrink all desktop table columns to unreadable widths.

### Compact/small

Use role-specific mobile navigation:

- bottom navigation for the highest-frequency destinations (normally 3–5);
- secondary destinations through a clearly labeled sheet/menu or drill-down screen;
- page context in the top bar/header;
- primary action reachable without precision pointer use;
- avoid a giant desktop sidebar hidden behind one unstructured hamburger.

## Page header

Wide composition may contain:

```text
breadcrumb/context
page title + supporting status
secondary actions              primary action
```

Narrow composition becomes:

```text
back/context
page title/status
primary action + overflow
```

Breadcrumbs are omitted when they add no navigational value. Do not force multi-level breadcrumbs into mobile headers.

## Action priority

Every responsive feature classifies actions:

- primary — always visible when permitted;
- frequent secondary — visible when space permits;
- infrequent — overflow/menu;
- destructive — separated visually/positionally from primary safe actions.

Responsive behavior must not make a required action disappear entirely.

## Forms

### Wide forms

- use 1–2 columns based on semantic grouping, not simply to fill space;
- labels normally remain above controls for consistency and localization resilience;
- related short fields may share rows;
- long descriptions/textareas use full logical width.

### Narrow forms

- one column by default;
- sticky bottom action bar may be used for long transactional flows;
- date/range/selector popovers may become sheets/full-screen pickers;
- helper/error text remains attached to its field;
- keyboard opening must not obscure the active field/action.

Avoid horizontally paired fields on mobile when either label/value can wrap unpredictably.

## Dialogs, sheets and overlays

- desktop confirmation/small edit → centered dialog;
- tablet may use dialog or side sheet based on content;
- mobile complex edit → bottom sheet or full-screen route/sheet;
- destructive confirmation stays short and explicit;
- overlays must remain usable with software keyboard and safe-area insets;
- close/back behavior must be predictable across web/Tauri shells.

A 900px desktop modal should never simply scale down to a 360px viewport.

## Tables and data grids

Every table declares one narrow-screen strategy before implementation.

Allowed strategies:

### 1. Prioritized columns + drill-in

Keep identity/status/high-value columns visible; open a detail page/sheet for remaining fields. Preferred for students, staff and many finance lists.

### 2. Responsive data list/cards

Transform rows into structured labeled blocks when row comparison is less important than per-record actions. Do not turn every table into giant decorative cards.

### 3. Horizontal scroll

Allowed when preserving column comparison is essential (for example marks/period grids). Required safeguards:

- sticky identity column where useful;
- clear horizontal-scroll affordance;
- actions remain reachable;
- no hidden critical column without indication.

### 4. Dedicated mobile workflow

Use when the desktop grid interaction itself is unsuitable, such as bulk attendance or timetable editing.

This is often the highest-quality solution for teacher mobile workflows.

## Bulk selection

On desktop, checkbox/keyboard multi-select may expose bulk action bars.

On mobile:

- enter an explicit selection mode;
- show selected count clearly;
- keep bulk actions in a sticky reachable region;
- provide a clear cancel/exit selection action;
- never rely on hover-only row checkboxes.

## Search and filters

Wide:

- search + common filters visible;
- advanced filters in popover/panel;
- active filter chips/summary;
- saved views later where evidence supports them.

Narrow:

- primary search remains directly available when it is a core workflow;
- filters open a sheet/full-screen panel;
- applied-filter count/status is visible after closing the panel;
- “Clear” and “Apply” semantics are explicit;
- closing the filter sheet must not silently discard or unexpectedly apply changes.

## Cards and dashboards

Metrics respond by priority:

- wide: 3–5 columns depending on metric width;
- medium: 2–3 columns;
- compact: 1–2 columns, but avoid excessively tall stacks of low-value KPIs.

Dashboard modules should reorder by role/task priority, not simply preserve source DOM order because CSS wrapping happens to do so.

## Timetables and calendars

Calendar/timetable layout may switch interaction models:

- wide: week/grid view;
- medium: compressed week/day split;
- compact: day/agenda-first view with explicit date navigation.

Do not force a seven-column desktop timetable into unreadably tiny phone cells.

## Charts

Charts must remain legible at their container size.

Narrow behavior may include:

- fewer labels;
- alternate orientation;
- scrolling for categorical comparison where justified;
- summary metrics + “View details”;
- accessible tabular alternative.

Charts cannot become the only way to access exact critical values.

## Navigation depth

Desktop can reveal hierarchy in the sidebar; mobile should favor drill-down/navigation stacks.

Deep module IA should not produce a bottom navigation item for every module.

Bottom navigation is role-specific and high-frequency only.

## Touch, pointer and hover

Interactive targets aim for at least ~44px touch comfort even where visual controls are smaller.

Hover is enhancement only. Anything exposed only on hover must also be reachable by:

- keyboard focus;
- touch;
- explicit action menu/button.

Right-click/context menus may enhance desktop workflows but cannot be the only path.

## Keyboard and desktop efficiency

Responsive design must not degrade desktop power use.

Large layouts should support:

- logical tab sequence;
- command/search palette;
- predictable shortcuts only where discoverable and conflict-safe;
- table keyboard selection/navigation where appropriate;
- sticky contextual actions for long workflows.

## Height and viewport behavior

Avoid relying on a static “100vh” assumption for mobile browser chrome or Tauri safe areas.

Layouts should:

- use available dynamic viewport/shell height;
- respect top/bottom safe areas;
- keep dialogs/sheets scrollable internally when content exceeds height;
- avoid nested scroll containers unless they have a clear UX purpose;
- ensure fixed/sticky bars do not cover content.

## Text zoom and localization

Layouts must tolerate:

- at least 200% text zoom where applicable;
- longer translated labels;
- names/identifiers that exceed expected English lengths;
- locale-specific date/currency formats;
- browser/user font scaling.

Do not solve overflow by clipping meaningful text without a disclosure path.

## Empty/loading/error states

Responsive behavior is defined for all states, not just populated screens.

- skeletons approximate final layout without excessive motion;
- empty-state CTA remains visible/reachable;
- error/retry state preserves page context;
- mobile loading should not cause bottom navigation/action bars to jump unpredictably.

## Performance

Responsive components must avoid rendering multiple full desktop/mobile versions simultaneously when one can be composed responsively.

Large table virtualization, charts and editors should be loaded only where needed.

Mobile networks/low-powered devices are part of the performance target; reducing viewport width is not sufficient performance optimization.

## Feature responsive checklist

Every feature PR/implementation must answer:

1. What is the wide layout?
2. What changes around medium width?
3. What is the compact/mobile composition?
4. How does navigation change?
5. Which actions remain primary?
6. What is the table/data-list narrow strategy?
7. How do filters/search work on mobile?
8. What happens with keyboard/hover absence?
9. What happens with long labels/text zoom?
10. How do loading/empty/error states respond?

## Definition of done for M0-051

M0-051 is complete because the project now has explicit responsive rules for:

- layout bands/grid/gutters;
- app shell/navigation;
- headers/actions/forms/overlays;
- data tables/bulk actions/search/filters;
- dashboards/calendars/charts;
- touch/pointer/keyboard behavior;
- viewport/safe-area handling;
- localization/text zoom;
- feature-level responsive acceptance criteria.

Individual components/features still implement these rules under M0-052..059 and later milestones.