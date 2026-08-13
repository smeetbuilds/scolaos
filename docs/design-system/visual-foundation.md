# Design System Visual Foundation

**Task:** M0-050  
**Status:** ACCEPTED  
**Effective:** 13 August 2026

## Purpose

Define the visual language for a dense, operational school-management product before individual components are implemented. The system should feel calm, trustworthy, fast and deliberately designed for daily use by administrators, teachers, finance teams, students and parents.

This is a product UI system, not a marketing-site style guide. The unresolved public product name must not block functional visual-system work, but permanent wordmark/logo branding remains out of scope until M0-003 closes.

## Design character

The interface is:

- neutral and institutional without feeling bureaucratic;
- contemporary without trend-driven decoration;
- information-dense without becoming cramped;
- quiet by default so status and exceptions are visually meaningful;
- consistent across web, desktop and mobile shells;
- optimized for repeated all-day workflows rather than one-time showcase screens.

Avoid:

- glassmorphism as a structural dependency;
- excessive gradients;
- giant cards around every data point;
- oversized headings that reduce usable information density;
- decorative shadows on ordinary surfaces;
- over-rounded “toy” controls;
- color used as the only hierarchy mechanism;
- motion added only for visual novelty.

## Token architecture

Components consume semantic tokens. They must not hard-code arbitrary colors, spacing, radii, shadows or z-index values unless a documented component exception exists.

Token groups:

```text
color.*
typography.*
space.*
size.*
radius.*
border.*
shadow.*
z.*
motion.*
focus.*
density.*
```

Primitive/base values may exist internally, but application components should prefer semantic aliases such as `color.text.primary`, `color.surface.raised` or `color.status.danger`.

## Color system

The foundation uses semantic roles instead of a fixed public brand palette.

### Neutral roles

- `color.canvas` — application background.
- `color.surface` — normal working surface.
- `color.surface.subtle` — muted grouping/background.
- `color.surface.raised` — popover/dialog/menu surface.
- `color.border` — default separation.
- `color.border.strong` — stronger structural separation.
- `color.text.primary` — highest-emphasis readable text.
- `color.text.secondary` — supporting information.
- `color.text.muted` — tertiary labels/metadata.
- `color.text.disabled` — disabled state only.

### Interaction roles

A restrained interaction accent may be used before final branding. It is a UI semantic, not a permanent brand decision.

- `color.action.primary`
- `color.action.primary.hover`
- `color.action.primary.pressed`
- `color.action.primary.text`
- `color.focus`
- `color.selection`

### Status roles

Every status family defines foreground, subtle background, strong background and border variants:

- neutral;
- info;
- success;
- warning;
- danger.

Status color must always be paired with text/icon/shape semantics where the state matters.

### Data visualization

Charts use a separate categorical/sequential palette from UI action/status colors. A chart must not imply “danger” merely because one series happens to reuse the danger color.

Color sequences must remain distinguishable at common color-vision deficiencies and provide non-color alternatives where values are critical.

## Typography

Typography prioritizes fast scanning and compact operational layouts.

### Font families

Use semantic families:

- `font.sans` — primary UI/content typeface;
- `font.mono` — identifiers, technical metadata, logs/code where needed.

The exact public brand typeface remains replaceable while M0-003 is open. The default UI stack must degrade gracefully to system sans-serif fonts.

### Type scale

Recommended semantic scale:

| Token | Typical use |
|---|---|
| `text.xs` | secondary metadata, dense table support text |
| `text.sm` | labels, compact table cells, helper text |
| `text.md` | default body/control text |
| `text.lg` | emphasized body, section lead |
| `text.xl` | card/panel title |
| `text.2xl` | page title |
| `text.3xl` | exceptional overview/empty-state headline |

Default product body text should remain around the browser-equivalent of 14–16px depending on density/context. Text below 12px-equivalent is prohibited for normal functional content.

### Weight

Use a small controlled set:

- regular — body/data;
- medium — controls/labels;
- semibold — headings/strong emphasis.

Bold is reserved for exceptional emphasis, not used to compensate for weak hierarchy.

### Line height

- dense UI/table text: approximately 1.3–1.4;
- body copy: approximately 1.45–1.6;
- headings: tighter where readability remains strong.

Do not vertically center multi-line content using fixed line-height tricks.

## Spacing

Use a 4px-based rhythm with intentionally available half-step values only where optical alignment requires them.

Core spacing tokens:

```text
0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

Guidelines:

- 4–8: icon/text/control internal relationships;
- 8–12: dense row/field relationships;
- 16–24: component/group spacing;
- 24–40: section spacing;
- 48+: page-level separation only.

Avoid arbitrary values such as 13px/19px/27px unless documented as optical fixes.

## Density

The product supports two semantic density modes where useful:

- `comfortable` — default for general forms/content/mobile;
- `compact` — high-density desktop tables/admin operations.

Density changes spacing/row height, not information hierarchy or accessible target behavior.

Recommended row targets:

- compact data row: ~40px visual row height;
- comfortable data row: ~48px;
- interactive touch target remains large enough even when the visual glyph/control is smaller.

Do not expose a density switch globally until real workflows prove it useful; components should simply support both token sets.

## Radii

Radii are restrained:

- small: 4–6px;
- control: 6–8px;
- panel/card: 8–12px;
- dialog/sheet: 12–16px;
- pill: only for badges/tags/chips that are semantically pill-shaped.

Avoid applying maximum pill radius to ordinary buttons, inputs, cards and tables.

## Borders and separators

Prefer subtle borders and spacing over shadows for hierarchy.

- 1px-equivalent default border;
- stronger divider only for major structure;
- table row separators may be lighter than component boundaries;
- selected/focused state uses semantic focus/selection treatment rather than thicker random borders.

## Elevation and shadows

Normal pages/cards are essentially flat.

Use elevation only when one surface genuinely floats over another:

1. base/canvas;
2. sticky header/sidebar separation;
3. popover/menu;
4. dialog/sheet;
5. critical modal/toast layer.

Shadows are soft and low-opacity. Multiple heavy box shadows are prohibited.

## Iconography

Icons should share one consistent family/style:

- 16px class for dense supporting actions;
- 20px class for normal controls/navigation;
- 24px class for large mobile/empty-state actions;
- consistent stroke weight and optical alignment.

Do not mix filled, outlined and illustration-style icons arbitrarily.

Icon-only actions require accessible names and normally a tooltip on pointer-capable layouts.

## Focus

Focus is a first-class token, not browser-default cleanup work.

The system uses:

- clearly visible focus indicator;
- minimum two-pixel-equivalent focus treatment where practical;
- offset or dual-color treatment so focus remains visible on both light and colored surfaces;
- `:focus-visible` behavior where supported without removing keyboard visibility.

A focused destructive control still shows both focus and destructive semantics.

## Motion

Motion communicates state transition only.

Semantic durations:

- instant/feedback: ~100–120ms;
- normal UI transition: ~160–200ms;
- large overlay/layout transition: ~220–280ms.

Avoid long easing on frequent workflows.

All non-essential motion respects reduced-motion preferences; structural state changes remain understandable without animation.

## Layout surfaces

Default page composition:

```text
App shell
  ├─ global navigation
  └─ content frame
      ├─ page header / context / actions
      ├─ optional filters/summary
      └─ working surface
```

Do not wrap the page header, filters, table and every metric in unrelated card boxes merely to create separation.

Cards are used for true grouped objects/metrics, not as the default container for every section.

## Data presentation

Operational data is primary content.

Tables/lists should:

- align numeric values consistently;
- use tabular numerals where useful;
- keep identifiers visually quieter than names/statuses;
- avoid center-aligning normal text columns;
- use right alignment for numeric/money columns;
- expose status through text + semantic badge/icon;
- provide hover only as enhancement, not the only action discoverability mechanism.

## Forms

Form hierarchy:

- persistent visible label;
- optional concise description/help;
- control;
- validation/status message.

Placeholder text is not a substitute for a label.

Required/optional semantics should be consistent across the product rather than decided per form.

## Content tone

Functional copy is concise, neutral and action-oriented.

- buttons use verbs when performing actions;
- destructive actions state the object/action clearly;
- errors explain what happened and what the user can do next;
- empty states explain why a space is empty and expose the next permitted action;
- avoid playful copy in sensitive finance/student/security contexts.

## Theming

Light mode is the initial reference implementation because most school administrative use happens in bright office/classroom environments and printable/data-dense layouts benefit from it.

Tokens must remain semantic enough to permit a later dark theme without rewriting component structure. Dark mode is not a reason to duplicate component CSS per feature.

## Naming guard

No design token, package API or component primitive should require the final public product name. Temporary repository identifiers may remain until coordinated rename, but visual tokens should use semantic names rather than `scola-blue`, `scola-card`, etc.

## Definition of done for M0-050

M0-050 is complete because the product now has documented, coherent rules for:

- visual character;
- semantic color architecture;
- typography;
- spacing/density;
- radii/borders/elevation;
- iconography;
- focus;
- motion;
- working surfaces/data/forms;
- theming and naming independence.

Concrete token files/components are implemented under M0-052..059 and must conform to this foundation.