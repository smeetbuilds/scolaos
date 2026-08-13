# Release and Change Process

## Repository flow

During the bootstrap phase, changes are committed directly to `main`. Feature branches, pull requests, and automated dependency-update PRs are not part of the active workflow. Each implementation batch should produce one coherent commit after its applicable checks are reviewed.

This policy can change only through an explicit project decision; tooling must not silently introduce branch/PR-based delivery.

## Commit convention

Use Conventional Commit-style subjects:

- `feat:` user-visible capability;
- `fix:` defect correction;
- `security:` security remediation;
- `perf:` measurable performance improvement;
- `refactor:` behavior-preserving restructuring;
- `test:` test-only change;
- `docs:` documentation-only change;
- `build:` build/package/dependency change;
- `ci:` CI workflow change;
- `chore:` repository maintenance.

Breaking changes must be called out explicitly in the commit/release notes and accompanied by migration guidance when they affect deployers or API/data compatibility.

## Changelog

Every user/deployer-visible change updates the `[Unreleased]` section of `CHANGELOG.md`. Mechanical refactors and test-only changes need not be listed unless they materially affect operators.

## Pre-release gate

Before tagging a release:

1. target milestone gate is complete;
2. CI and security workflows are green or an exception is documented;
3. migrations and upgrade path are validated;
4. changelog is complete;
5. version/compatibility metadata are updated;
6. release artifact/source license obligations are verified;
7. release notes identify breaking changes and operational actions.

## Versioning

ScolaOS uses `0.x` while architecture and compatibility contracts are still evolving. A 1.0 release begins the documented stable compatibility policy. Semantic-versioning details for server API, database schema, native clients, and module SDK will be finalized before 1.0.
