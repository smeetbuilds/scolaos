# Platform Contracts

This directory contains stable cross-cutting contracts that multiple applications/modules must share.

Completed M0 contracts:

- [`api-errors.md`](api-errors.md) — M0-070 API error envelope, correlation and disclosure rules.
- [`module-boundaries.md`](module-boundaries.md) — M0-077 source/module dependency direction and modular-monolith conventions.

Still open in M0:

- M0-071 pagination/filter/sort contract;
- M0-072 API compatibility/version metadata;
- M0-073 platform-bridge interfaces;
- M0-074 storage-provider interface;
- M0-075 notification event/channel interfaces;
- M0-076 background-job contract;
- M0-078 audit-event contract.

A contract is not complete merely because a document exists. Each task must have sufficient implementation/architecture evidence for the guarantees it makes.
