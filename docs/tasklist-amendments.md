# Tasklist Amendments — M0

This file records task-state changes and new stable IDs discovered after the original master backlog was committed. `docs/project-tracker.md` is authoritative for current status. These amendments must be folded into `docs/tasklist.md` during backlog normalization without renumbering existing IDs.

## Completed repository/tooling tasks

- [x] **M0-005 [P0]** Initial threat model. Evidence: `docs/threat-model.md`.
- [x] **M0-013 [P0]** Linting/formatting/import-boundary rules. Evidence: `eslint.config.mjs`, `prettier.config.mjs`, `.prettierignore`.
- [x] **M0-014 [P0]** Unit-test framework. Evidence: `vitest.config.ts`, `tooling/tests/harness.test.ts`.
- [x] **M0-015 [P0]** Playwright E2E harness. Evidence: `playwright.config.ts`, `tests/e2e/harness.spec.ts`.
- [x] **M0-016 [P0]** Existing CI configured for install/format/lint/typecheck/test/build/E2E on direct `main` pushes.
- [x] **M0-017 [P1]** Dependency update policy: manual review/direct-to-`main`; automated dependency PR creation disabled.
- [x] **M0-018 [P0]** Existing dependency-audit workflow and secret-scanning baseline.
- [x] **M0-019 [P1]** Conventional change/release/changelog process.
- [x] **M0-020 [P1]** CODEOWNERS and maintainer review rules.

## Active reproducibility task

- [ ] **M0-021 [P0]** Commit generated pnpm lockfile and freeze existing CI installs.  
  **Depends:** M0-016  
  **Evidence so far:** the existing main-branch CI successfully generated a real `pnpm-lock.yaml` with Node 24 and pnpm 11.18.0 after the invalid `@eslint/js` pin was corrected; dependency installation succeeds; the Security workflow dependency audit succeeds.  
  **Current subtask:** correct the formatting gate so it checks executable source/tests/package manifests rather than long-form planning Markdown, then expose the next real CI gate.  
  **Done when:** the generated lockfile is committed verbatim; existing CI/security use `pnpm install --frozen-lockfile`; formatting, lint, typecheck, unit, build, and E2E harness complete successfully.  
  **Integrity rule:** do not hand-reconstruct or manually simplify the generated lockfile to close this task.

## Main-only workflow policy

- Direct-to-`main` only during bootstrap.
- No feature branches or pull requests.
- No automated dependency branches/PRs.
- Existing CI/security workflows remain the only active quality workflows unless an explicit project decision changes that.
- One coherent commit per implementation batch.

## Open-source packaging note

`M6-091 LICENSE` remains open for production-release readiness. The repository declares AGPL-3.0-only, but release packaging must include the canonical license text verbatim from an authoritative distribution.
