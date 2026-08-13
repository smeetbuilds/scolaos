# Accessibility Quality Gate

**Task:** M0-060  
**Status:** ACCEPTED  
**Target:** WCAG 2.2 AA for supported core workflows  
**Effective:** 13 August 2026

## Purpose

Define a non-optional accessibility acceptance gate for the design system and product modules. Accessibility is part of component correctness, not a final pre-release visual audit.

The product must remain usable with keyboard-only input, screen readers, text zoom, reduced motion, high-contrast/forced-color environments where practical, and touch without precision pointing.

## Component definition of done

A design-system component is not DONE until all applicable checks below are satisfied and documented/tested at the appropriate implementation layer.

Every component review considers:

- semantic role/name/state;
- keyboard operation;
- focus order/visibility/return behavior;
- pointer/touch target behavior;
- contrast and non-color cues;
- text zoom/reflow;
- screen-reader announcements;
- disabled/read-only/loading/error states;
- reduced motion;
- localization/long content;
- mobile assistive technology behavior where relevant.

## Semantic HTML first

Prefer native elements when they already expose the correct behavior:

- `<button>` for actions;
- `<a href>` for navigation;
- `<input>`, `<select>`, `<textarea>` for form controls where native behavior is sufficient;
- `<table>` for genuinely tabular relationships;
- headings in logical order;
- lists for list semantics.

ARIA supplements missing semantics; it must not be used to rebuild native controls unnecessarily.

Do not place click handlers on generic `<div>`/`span` elements and then attempt to recreate keyboard/role/focus behavior piecemeal.

## Accessible names

Every interactive control has an accessible name.

Rules:

- visible text normally provides the name;
- icon-only controls need an explicit accessible label;
- repeated actions include enough context for assistive technology when needed;
- decorative icons/images are hidden from accessibility APIs;
- meaningful images have concise useful alternatives;
- status icons are not the only source of status meaning.

Tooltips do not substitute for accessible names.

## Keyboard interaction

All core functionality must be operable without a pointer.

Minimum expectations:

- logical tab order follows visual/task order;
- no positive `tabindex` ordering hacks;
- Enter/Space semantics match control type;
- Escape closes dismissible overlays where expected;
- arrow-key behavior follows the pattern of complex widgets (tabs, menus, listboxes, grids) when such widgets are implemented;
- keyboard users can reach row actions/bulk actions that appear visually on hover;
- drag-and-drop operations expose an alternate keyboard/action-menu mechanism when they affect required workflows.

Keyboard shortcuts must be discoverable, avoid browser/platform conflicts and never be required for basic operation.

## Focus visibility

A visible focus indicator is mandatory for keyboard focus.

- do not globally remove outlines;
- use `:focus-visible` or equivalent progressive behavior without hiding required focus;
- focus must remain visible against neutral, selected, danger and action surfaces;
- sticky headers/overlays must not cover the focused element;
- after navigation/mutation, focus moves only when doing so improves task continuity and remains predictable.

## Focus management

Dialogs/sheets/menus/popovers must manage focus deliberately.

### Modal dialogs/alert dialogs

- initial focus lands on the safest logical control/content, not automatically on a destructive action;
- focus is contained while the modal is active;
- Escape dismisses when dismissal is allowed;
- closing returns focus to the invoking control or a sensible surviving target;
- background content is not exposed as interactive to assistive technology while modal.

### Sheets/full-screen mobile overlays

Follow the same logical focus containment/restore behavior as dialogs even when the visual treatment differs.

### Deleted/removed triggers

If the invoking control no longer exists after success, focus moves to the nearest meaningful context such as page heading, next row or success region rather than disappearing to document start unpredictably.

## Contrast

Target WCAG 2.2 AA contrast:

- normal text: at least 4.5:1;
- large text: at least 3:1;
- meaningful non-text UI boundaries/indicators: at least 3:1 where required;
- focus indicators must remain distinguishable from adjacent colors.

Disabled controls are not an excuse to make required explanatory text unreadable.

Status and validation cannot rely only on red/green/color differences.

## Touch targets

The product targets approximately 44×44 CSS-pixel comfortable interaction areas for normal touch actions where layout permits, even when the visible icon/control is smaller.

Dense desktop tables may use visually compact controls while retaining adequate hit area or an alternate row action mechanism.

Closely packed tiny icon buttons without separation are prohibited for mobile primary workflows.

## Text resize and reflow

Supported pages/components must remain usable under significant browser text zoom and larger OS text settings.

Expectations:

- normal text can reach at least 200% without loss of information/function;
- controls expand/wrap rather than clip important labels;
- fixed heights do not truncate multi-line translated/zoomed content;
- horizontal page-level scrolling is avoided for ordinary reading/forms at narrow reflow widths except for inherently two-dimensional content such as selected data grids/timetables;
- tooltips/popovers remain reachable and legible when zoomed.

## Forms

Every field has:

- persistent label;
- association between label and control;
- optional help/description linked programmatically where useful;
- clear required/optional convention;
- error message linked to the field;
- invalid state exposed programmatically;
- error text that explains correction, not only “invalid”.

Placeholder is never the only label.

On submit failure:

- show an error summary for long/complex forms where useful;
- focus/announce the summary or first invalid field predictably;
- preserve user-entered values unless security requires clearing them;
- do not identify invalid state only by color.

## Validation and live regions

Use live announcements sparingly.

Suitable cases:

- async validation result relevant to current field;
- save success/failure after an action;
- background upload/import state when the user needs immediate awareness;
- dynamic result count after a deliberate search/filter action where useful.

Do not mark large constantly changing page regions as assertive live regions.

## Loading

Loading behavior must expose meaningful state:

- controls set disabled/busy state where repeated activation would be unsafe;
- `aria-busy` or equivalent may describe updating regions;
- spinner-only controls retain an accessible label such as “Saving…”;
- skeletons are decorative and do not create dozens of meaningless screen-reader nodes;
- long operations provide progress/state text when practical.

## Toasts and status banners

Toasts are supplemental, not the only place critical information exists.

- important errors persist in context until resolved/dismissed;
- success toast announcements are polite;
- critical errors may use stronger announcement semantics carefully;
- toast auto-dismiss duration must not make required information inaccessible;
- users can reach actions inside interactive toasts without focus chaos.

## Navigation

- current page/section state is conveyed programmatically;
- skip-to-content or equivalent fast navigation exists for desktop/web shells when repeated global navigation precedes content;
- headings reflect page hierarchy;
- bottom navigation labels remain visible or otherwise unambiguously named;
- collapsed sidebar icons keep accessible labels/tooltips;
- permission-hidden navigation must not leave inaccessible ghost focus targets.

## Tables/data grids

Use a native semantic `<table>` for read-oriented tabular data whenever complex grid interaction is not required.

Requirements:

- headers associated correctly with cells;
- sortable headers announce sort state;
- selection controls have row context;
- row actions have names including object context where ambiguity exists;
- pagination/status changes are understandable without visual-only cues;
- mobile transformed list/card views preserve labels for values;
- horizontally scrollable tables expose a usable keyboard/touch path.

If a true interactive ARIA grid is introduced, it must implement the complete keyboard/focus model; do not add `role="grid"` merely for styling.

## Comboboxes/selectors

Custom comboboxes must correctly implement:

- input/trigger accessible name;
- expanded/collapsed state;
- listbox relationship;
- active option state;
- keyboard navigation;
- selection announcement;
- Escape/cancel semantics;
- clear action;
- loading/empty/error options.

Prefer native select where advanced search/multi-select behavior is not needed.

## Tabs

Tabs must:

- expose tablist/tab/tabpanel relationships;
- indicate selected tab;
- support expected arrow-key movement where the component follows the tabs pattern;
- have unique stable panel relationships;
- not use tabs merely as visual buttons for unrelated navigation without correct semantics.

## Date/time/calendar controls

Date/time primitives must not be mouse-only.

- typed/manual entry path should exist where domain policy permits;
- calendar grid has keyboard navigation and announced dates;
- selected/current/today states are distinct semantically;
- invalid/unavailable dates are conveyed beyond color;
- locale/date format is clear;
- time-zone-sensitive values communicate the relevant zone/context.

## Timetable

Timetables are complex two-dimensional content.

Requirements:

- mobile agenda/day alternative;
- keyboard-accessible entries/actions;
- textual representation of period/time/class/room/teacher;
- color-coded subjects include labels/text, not color alone;
- screen-reader users can navigate a meaningful linear representation even if the visual grid is complex.

## Charts and metrics

Charts are never the only representation of critical operational values.

Provide:

- accessible title/summary;
- exact values through table/list/detail where needed;
- non-color series identification;
- focusable interactive points only if they provide meaningful actions/details;
- reduced-motion behavior;
- textual explanation for trends/alerts that matter operationally.

Decorative sparkline paths should normally be hidden from accessibility APIs while the metric value remains readable.

## Drag/reorder

Any required drag operation needs a non-pointer alternative:

- Move up/down actions;
- keyboard reorder mode;
- explicit position selector;
- equivalent edit dialog.

Announce reordered state where appropriate.

## Reduced motion

Respect the user's reduced-motion preference.

- remove non-essential transforms/parallax;
- reduce large sliding transitions;
- avoid flashing/pulsing decorative effects;
- retain immediate state change so the UI remains understandable;
- never require animation perception to know what changed.

## High contrast / forced colors

Where supported by target platforms, controls should remain identifiable in forced-color/high-contrast modes.

Avoid relying on background images/box shadows alone for:

- focus;
- borders;
- selected state;
- check/radio state;
- error state.

Implementation testing should include a Windows/high-contrast or equivalent environment before 1.0 hardening.

## Screen-reader test matrix

Before M0-GATE/design-system acceptance, representative primitives should be manually smoke-tested on at least:

- browser + keyboard without screen reader;
- one desktop screen-reader/browser combination;
- one mobile screen-reader path when the mobile shell/webview is available.

Exact supported combinations are finalized with the platform support matrix.

## Automated testing

Automation supplements manual testing.

Recommended checks once the UI stack exists:

- static lint rules for obvious ARIA/HTML errors;
- component accessibility assertions;
- automated browser accessibility scans for representative states;
- Playwright keyboard/focus tests for critical primitives;
- contrast/token tests where practical.

A passing automated scan does not mean the interaction is accessible.

## Required component-state matrix

Every primitive implementation should demonstrate applicable states:

```text
default
hover
focus-visible
active/pressed
selected/checked
loading/busy
disabled
read-only
invalid/error
success/warning where meaningful
empty
long text / zoom
reduced motion
```

## Destructive actions

- name the exact destructive result;
- confirmation dialog heading/body explain consequence;
- safe action receives initial focus unless context requires otherwise;
- destructive primary button is visually and semantically distinct;
- irreversible operations are not triggered by accidental single-key shortcuts;
- focus returns predictably after cancel/success.

## Accessibility review checklist

For each component/feature:

- [ ] correct native/ARIA semantics;
- [ ] accessible name/description;
- [ ] keyboard complete;
- [ ] visible focus;
- [ ] logical focus order;
- [ ] modal focus containment/restore where applicable;
- [ ] contrast passes target;
- [ ] status not color-only;
- [ ] touch target appropriate;
- [ ] text zoom/reflow checked;
- [ ] loading/error/disabled states exposed;
- [ ] reduced motion respected;
- [ ] long/localized content tested;
- [ ] screen-reader behavior smoke-tested for complex widgets;
- [ ] responsive/mobile alternative preserves semantics;
- [ ] automated checks added where implementation supports them.

## Definition of done for M0-060

M0-060 is complete as the design-system accessibility gate because the project now has a concrete WCAG 2.2 AA-oriented acceptance matrix covering semantics, keyboard, focus, forms, overlays, tables, custom widgets, date/calendar, charts, motion, contrast, zoom, touch and assistive-technology testing.

Actual components still have to prove conformance when M0-052..059 are implemented; this document prevents “accessibility later” from being accepted as component completion.