# Contributing to ScolaOS

ScolaOS is early-stage. Contributions are welcome, but the architecture and execution order are intentionally controlled while the foundation is being proven.

## Before changing code

1. Read `docs/prd.md`, `docs/design.md`, and `docs/decision.md`.
2. Check `docs/project-tracker.md` for the current milestone and resume pointer.
3. Find the relevant stable task ID in `docs/tasklist.md`.
4. If your change contradicts an accepted ADR, update the ADR explicitly in the same change rather than silently diverging.

## Engineering definition of done

A feature is not done because its happy path renders. Apply the relevant gates for authorization, validation, database integrity, auditing, tests, accessibility, responsive behavior, empty/loading/error states, performance, and documentation.

## Change discipline

- Keep commits focused and descriptive.
- Do not edit already-released database migrations; add a new migration.
- Do not place critical authorization or financial rules only in client code.
- Do not introduce a mandatory hosted/proprietary service without an ADR.
- New dependencies require a maintenance, security, and license-compatibility check.
- Avoid country-specific assumptions in core academic/domain models unless implemented as configuration or an adapter.

## License of contributions

By contributing, you represent that you have the right to submit the contribution and agree that it is provided under the repository's AGPL-3.0-only license.
