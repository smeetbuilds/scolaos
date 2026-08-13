# Changelog

All notable changes to ScolaOS will be documented in this file.

The project is currently pre-alpha and follows milestone-driven development.

## [Unreleased]

### Changed

- Narrowed the Prettier quality gate to executable source, tests, workspace manifests, and the root package manifest so long-form product/architecture Markdown remains human-maintained while code formatting stays deterministic.
- Continued M0 dependency reproducibility work after the existing CI successfully generated the approved pnpm lockfile artifact.
- Fixed the Playwright CI worker configuration for strict TypeScript with `exactOptionalPropertyTypes` by omitting the optional property outside CI rather than assigning `undefined`.

### Repository

- Bootstrap workflow remains direct-to-`main` only: no feature branches, pull requests, or automated dependency-update PRs.
