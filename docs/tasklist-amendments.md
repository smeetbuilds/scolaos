# Tasklist Amendments — M0

This file records task-state changes and new stable IDs discovered after the original master backlog was committed. `docs/project-tracker.md` is authoritative for current status. These amendments must be folded into `docs/tasklist.md` during the next backlog normalization without renumbering any existing ID.

## Completed in repository-tooling batch

- [x] **M0-005 [P0]** Create initial threat model.  
  **Evidence:** `docs/threat-model.md`.

- [x] **M0-013 [P0]** Configure linting/formatting/import-boundary rules.  
  **Evidence:** `eslint.config.mjs`, `prettier.config.mjs`, `.prettierignore`.

- [x] **M0-014 [P0]** Configure unit-test framework.  
  **Evidence:** `vitest.config.ts`, `tooling/tests/harness.test.ts`.

- [x] **M0-015 [P0]** Configure Playwright E2E harness.  
  **Evidence:** `playwright.config.ts`, `tests/e2e/harness.spec.ts`.

- [x] **M0-016 [P0]** Configure CI for install/typecheck/lint/test/build.  
  **Evidence:** `.github/workflows/ci.yml`. CI evidence is still required for the M0 quality gate.

- [x] **M0-017 [P1]** Configure dependency update policy.  
  **Evidence:** `docs/dependency-policy.md`; dependency discovery/review is manual and direct-to-`main`, with automated PR creation disabled.

- [x] **M0-018 [P0]** Configure secret/dependency security controls.  
  **Evidence:** `.github/workflows/security.yml`, `SECURITY.md`, `docs/dependency-policy.md`. Repository-level GitHub secret-scanning settings remain an external platform control.

- [x] **M0-019 [P1]** Add conventional change/release/changelog process.  
  **Evidence:** `CHANGELOG.md`, `docs/releasing.md`.

- [x] **M0-020 [P1]** Add CODEOWNERS/review rules for current maintainer.  
  **Evidence:** `.github/CODEOWNERS`, `CONTRIBUTING.md`. Enforced branch-protection policy is intentionally deferred while direct-to-main bootstrap work is active.

## New task discovered during implementation

- [ ] **M0-021 [P0]** Commit generated pnpm lockfile and freeze CI installs.  
  **Depends:** M0-016  
  **Why added:** the execution container cannot access npm, so it cannot safely generate a real dependency-resolution lockfile. The existing CI is temporarily configured to generate `pnpm-lock.yaml` using the approved Node/pnpm versions and upload it as an artifact.  
  **Done when:** generated lockfile is reviewed and committed; existing CI/security workflows use `pnpm install --frozen-lockfile`; lockfile generation is reproducible.

## Main-only workflow correction

- Automated Dependabot branch/PR creation is disabled because the active repository policy is direct-to-`main` only.
- Existing CI/security workflows trigger on `main` pushes (security also retains its scheduled audit); no PR trigger is required during bootstrap.
- Dependency upgrades are reviewed manually and committed as normal main-branch maintenance batches.

## Half-done/open-source packaging note

`M6-091 LICENSE` remains open for production-release readiness. The repository already declares AGPL-3.0-only, but the canonical license text must be copied verbatim from the authoritative license distribution before release. Do not hand-reconstruct or paraphrase license terms.
