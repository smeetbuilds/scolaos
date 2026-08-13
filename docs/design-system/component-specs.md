# Design System Component Specifications

**Status:** IMPLEMENTATION CONTRACT  
**Supports:** M0-052 through M0-059  
**Effective:** 13 August 2026

This document defines the implementation target for the remaining design-system primitives. It does **not** mark M0-052..059 complete; those tasks require actual components, tests and responsive/accessibility evidence.

## Shared component rules

Every primitive must:

- consume semantic design tokens from M0-050;
- follow responsive behavior from M0-051;
- satisfy the accessibility gate in M0-060;
- expose predictable controlled/uncontrolled behavior only where both modes are justified;
- avoid business-domain assumptions;
- support class/style composition without allowing callers to bypass state semantics casually;
- provide stable ref/focus access where interaction patterns require it;
- avoid platform-specific logic except through M0-073 bridges;
- document keyboard behavior and state model;
- include loading/disabled/error/empty states where applicable.

No component should become a “god component” with dozens of unrelated boolean props. Prefer composable subcomponents/slots with controlled variants.

## M0-052 — Button, IconButton, Link

### Button

Variants:

- `primary` — one dominant action per local context;
- `secondary` — common safe alternate action;
- `outline` — lower-emphasis action;
- `ghost` — low-emphasis toolbar/menu-adjacent action;
- `danger` — destructive action;
- `link` only when semantically still a button action; normal navigation uses Link.

Sizes:

- compact;
- default;
- large/mobile emphasis where justified.

States:

- default;
- hover;
- focus-visible;
- pressed;
- loading;
- disabled.

Rules:

- loading preserves button width where practical;
- loading exposes updated accessible name/state;
- disabled buttons do not show tooltips as the only explanation—reason belongs in surrounding UI where relevant;
- destructive styling is not used for harmless “remove filter”/dismiss actions;
- icons may lead/trail text but do not replace label unless IconButton is used.

### IconButton

Required props/concepts:

- accessible label;
- icon;
- variant;
- size;
- optional tooltip on pointer/focus-capable layouts.

The visible glyph can be 16–20px while the hit target remains touch-comfortable.

Common use:

- row overflow;
- close;
- previous/next;
- toolbar action.

Do not place many unlabeled icon buttons in a row when a menu or labeled action is clearer.

### Link

Variants are semantic emphasis only; it remains navigation.

Rules:

- real `href` where navigation is possible;
- external-link behavior is explicit;
- visited styling may be enabled for content/history contexts, not necessarily app navigation;
- never use a button disguised as a link for mutations;
- focus indicator remains visible.

## M0-053 — Form primitives and validation states

Required primitives:

- Field/FieldLabel/FieldDescription/FieldMessage;
- Input;
- Textarea;
- Select;
- Combobox;
- Checkbox;
- RadioGroup;
- Switch;
- Number/Money input wrapper where domain behavior requires it;
- SearchInput;
- multi-select/chips only where a validated use case exists.

### Field composition

```text
Label                optional indicator
Description/help
Control
Validation/status message
```

Field owns stable IDs/ARIA relationships; form library integration sits above it.

### Input

Supports:

- text/email/tel/url/password/search as semantic HTML input types;
- leading/trailing decorative/interactive slots;
- invalid state;
- read-only state distinct from disabled;
- prefix/suffix units without confusing value semantics.

### Select

Use native select for simple option sets where it provides sufficient UX.

Custom Select is justified for styled/complex contexts but must preserve complete keyboard/screen-reader semantics.

### Combobox

Supports:

- async/local options;
- search term;
- loading;
- empty;
- error;
- optional clear;
- single-selection initially unless multi-select is explicitly required.

Virtualization is optional and must not break keyboard/assistive behavior.

### Checkbox/Radio/Switch

- Checkbox = independent boolean/multi-select choice.
- Radio = one option from mutually exclusive set.
- Switch = immediate on/off setting whose changed state is clear.

Do not substitute Switch for every boolean form field merely for aesthetics.

### Validation

Validation message types:

- error;
- warning;
- success/confirmation only when meaningful;
- helper/neutral.

Server validation always wins for business invariants; client validation improves speed/clarity.

## M0-054 — Dialog, Sheet, Popover, Tooltip

### Dialog

Use for focused modal decisions/edits that fit comfortably without becoming a mini page.

Composition:

- title required except carefully justified accessible alternative;
- optional description;
- content;
- action footer;
- close action where dismissal is allowed.

### AlertDialog

Separate semantic primitive for confirmation of destructive/high-consequence actions.

Rules:

- safe/cancel action normally receives initial focus;
- consequence copy names the affected object/action;
- destructive confirmation cannot be triggered by accidental backdrop click unless explicitly safe.

### Sheet/Drawer

Use for:

- mobile filter/edit/navigation flows;
- contextual detail on larger screens;
- content needing more vertical/structured space than a popover.

Side vs bottom placement is chosen by responsive context rather than component caller guesswork scattered across features.

### Popover

Use for small contextual interactive content anchored to a trigger.

Not for long forms or navigation trees.

### Tooltip

- supplemental label/help only;
- never holds required instructions or error content;
- shows on hover and keyboard focus;
- not required for already clearly labeled buttons;
- delay tuned to avoid flicker while not making icon meaning inaccessible.

## M0-055 — Navigation primitives

Required primitives/specs:

- AppSidebar/NavRail;
- MobileBottomNav;
- NavGroup/NavItem;
- Breadcrumb;
- Tabs;
- Command/Search launcher;
- PageHeader/action region;
- BackNavigation.

### Sidebar

States:

- expanded;
- collapsed rail;
- responsive overlay where appropriate.

Requirements:

- current item state;
- permission-filtered items;
- grouped hierarchy;
- collapsible groups only when grouping depth warrants it;
- keyboard/focus complete;
- tooltip/accessible names in rail mode.

### Bottom navigation

- normally 3–5 role-specific destinations;
- persistent label + icon preferred;
- selected state visible and programmatic;
- safe-area aware;
- never mirrors the entire desktop sidebar.

### Tabs

Use for peer views within one context, not as a replacement for primary route hierarchy.

### Command launcher

Searches navigation/actions first; global record search integrates later as backend capability matures.

Permission filtering applies before displaying executable actions.

## M0-056 — Table/data-list foundation

Required foundation:

- Table shell;
- column definition;
- cell/header alignment;
- sorting state;
- selection state;
- pagination integration (M0-071);
- loading/empty/error states;
- row/cell actions;
- sticky header/columns where needed;
- responsive strategy declaration;
- optional virtualization hook for large local render sets.

### Column metadata

Conceptually:

```ts
interface ColumnDefinition<Row> {
  id: string;
  header: string;
  cell: (row: Row) => ReactNode;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  hidePriority?: number;
  width?: string | number;
}
```

Do not expose arbitrary server sort/filter fields directly from client column IDs without an allowlisted mapping.

### Row actions

Preferred pattern:

- primary/common row action may be direct;
- secondary actions in overflow menu;
- destructive actions separated;
- click-to-open-row only when it does not conflict with text selection/checkbox/action controls;
- every action remains keyboard/touch accessible.

### Responsive table strategy

Every table opts into one of the M0-051 strategies. There is no global automatic “table becomes cards” behavior.

## M0-057 — Empty, loading, error and status primitives

### EmptyState

Variants:

- first-use/create;
- no search/filter results;
- permission-limited/feature unavailable;
- completed/all clear;
- truly empty informational.

Contains only useful illustration/iconography; copy explains state and next permitted action.

### Skeleton

- matches approximate final geometry;
- no shimmering motion when reduced motion is requested;
- not used for actions whose state is known immediately;
- avoid huge skeleton dashboards when a compact loading region is enough.

### Progress

Determinate progress when reliable percentage exists; indeterminate otherwise.

### ErrorState

Levels:

- inline/field;
- component/panel;
- page;
- fatal/bootstrap.

Retry action is shown only when retry can plausibly succeed.

### StatusBanner

For persistent contextual info/warning/error/success states requiring attention.

### Toast

For transient supplemental confirmation, never the sole representation of a critical failure.

### Badge/Status

- semantic label + restrained color;
- sizes compatible with dense tables;
- avoid turning badges into decorative pills around normal text.

## M0-058 — Date, time and calendar primitives

Required primitives/specs:

- DateInput/DatePicker;
- DateRangePicker;
- TimeInput/TimePicker;
- Calendar;
- Month/Year selection;
- timezone/context label primitive;
- timetable/agenda building blocks later.

Rules:

- domain value type is explicit: date-only vs local time vs absolute timestamp;
- display locale is not the storage format;
- manual entry remains possible where safe;
- disabled/min/max dates expose reason/status;
- keyboard support is mandatory;
- current day, selected day and focused day are visually distinct;
- range selection communicates start/end clearly;
- timezone is shown for ambiguous cross-zone operations.

Do not introduce a heavyweight calendar dependency until these semantics are proven compatible with the product needs.

## M0-059 — Chart wrapper and metric components

### Metric

Supports:

- label;
- value;
- optional delta/trend;
- status/qualifier;
- comparison period/context;
- loading/error.

A large number is not sufficient context by itself.

### ChartFrame

Provides:

- title/description;
- legend region;
- responsive measurement;
- loading/empty/error;
- accessible summary/table/detail link;
- consistent tooltip formatting;
- reduced-motion switch;
- export hook later.

Supported initial chart families should be limited to real school analytics needs:

- line/time series;
- bar/column comparison;
- stacked bar where parts-to-whole comparison is valid;
- simple donut only for a few categorical shares;
- avoid gauge/radar/3D charts unless a concrete decision problem justifies them.

Charts should not encode precise finance/attendance results solely through visual area/angle.

## Shared test expectations

For every implemented primitive:

1. rendering/state unit tests;
2. keyboard/focus interaction tests where applicable;
3. accessibility assertions;
4. long label/content case;
5. compact + narrow responsive case where applicable;
6. reduced-motion case for animated components;
7. disabled/loading/error state tests;
8. integration example in the eventual design-system demo workspace.

## Shared documentation expectations

Every component page/example should document:

- purpose / when to use;
- when not to use;
- variants;
- states;
- accessibility/keyboard behavior;
- responsive behavior;
- usage example;
- anti-patterns;
- relevant design tokens.

## Implementation order

Recommended build order:

1. tokens/reset/focus foundation;
2. Button/IconButton/Link (`M0-052`);
3. Field/Input/Checkbox/Radio/Switch (`M0-053` foundation);
4. Dialog/Sheet/Popover/Tooltip (`M0-054`);
5. navigation primitives (`M0-055`);
6. data table/data list (`M0-056`);
7. state primitives (`M0-057`);
8. date/time/calendar (`M0-058`);
9. chart/metric wrapper (`M0-059`);
10. interactive demo/documentation workspace completion (`M0-061`).

This order minimizes rework because later primitives depend on earlier focus, overlay, form and token behavior.