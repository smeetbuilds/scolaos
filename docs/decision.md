# DECISIONS.md — Architecture Decision Log

**Format:** Lightweight ADR log  
**Status values:** `ACCEPTED`, `PROVISIONAL`, `OPEN`, `SUPERSEDED`, `REJECTED`

A material implementation change that contradicts an `ACCEPTED` decision must update this document in the same change set.

---

## ADR-001 — Open-source, self-hostable product

**Status:** ACCEPTED

### Decision

The product will be open source and designed for first-class self-hosting rather than being a hosted SaaS product with self-hosting as an afterthought.

### Consequences

- No mandatory proprietary cloud dependency.
- Install, update, backup, restore, diagnostics, and documentation are product features.
- Default deployment must work on ordinary Node-capable VPS/hosting plus PostgreSQL.

---

## ADR-002 — PostgreSQL is the mandatory database

**Status:** ACCEPTED

### Decision

PostgreSQL is the only database supported by core initially.

### Why

Supporting PostgreSQL/MySQL/SQLite simultaneously would multiply migration, indexing, query, data-type, locking, and testing complexity before there is evidence of demand.

### Consequences

- Installer checks PostgreSQL compatibility/privileges.
- Domain design can use PostgreSQL capabilities deliberately.
- Other DB engines require a future ADR.

---

## ADR-003 — No mandatory Supabase/Firebase/backend-as-a-service

**Status:** ACCEPTED

### Decision

Core cannot depend on Supabase, Firebase, or another hosted backend platform.

### Consequences

- First-party auth/session layer.
- Local/S3 storage abstraction.
- Direct PostgreSQL access from server.
- Full self-host operation remains possible.

---

## ADR-004 — API-first client/server separation

**Status:** ACCEPTED

### Decision

The client communicates with a defined server API. Critical business logic and authorization live on the server, not in platform clients.

### Consequences

- Same server can support web, desktop, and mobile.
- Future external integrations can reuse documented API concepts.
- Client and server compatibility/versioning must be managed.

---

## ADR-005 — React + TypeScript shared client

**Status:** ACCEPTED

### Decision

Use React + TypeScript for the primary shared UI/client implementation.

### Consequences

- Central design system/shared feature packages.
- Platform-specific APIs accessed through adapters.
- Native rewrites are not the default approach.

---

## ADR-006 — Vite for the primary web client

**Status:** PROVISIONAL

### Decision

Use Vite as the primary client build tooling rather than Next.js, because the product is primarily an authenticated API-driven application and must be embedded in Tauri with high code reuse.

### Revisit if

- public website/SEO/server rendering becomes a major requirement inside the same application;
- routing/data-loading needs materially favor another framework;
- Tauri/web constraints change.

---

## ADR-007 — Tauri 2 for desktop and mobile shells

**Status:** PROVISIONAL

### Decision

Use Tauri 2 to package the shared frontend for Windows, macOS, Linux, Android and iOS.

### Evidence

Tauri 2 officially supports web frontend frameworks and cross-platform targets including Linux, macOS, Windows, Android and iOS.

Reference: https://v2.tauri.app/

### Risks

- Mobile ecosystem maturity must be validated with a real proof of concept.
- Push notifications, background sync, camera/files, deep links, signing, and store release flows must be tested early.

### Exit criteria before ACCEPTED

A POC must demonstrate:

- login to self-hosted server;
- secure credential/token handling;
- camera/QR scan;
- file export/import;
- notification bridge;
- Android/iOS build pipeline.

---

## ADR-008 — Fastify for the API server

**Status:** PROVISIONAL

### Decision

Use Fastify + TypeScript for the API server.

### Rationale

Schema-oriented request validation/response serialization and a plugin model fit a modular API server.

Reference: https://fastify.io/docs/latest/Reference/Validation-and-Serialization/

### Exit criteria before ACCEPTED

- Representative auth/student/list/report API POC.
- OpenAPI generation strategy proven.
- Error contract and plugin/module boundaries validated.

---

## ADR-009 — Drizzle for schema/query/migrations

**Status:** PROVISIONAL

### Decision

Use Drizzle ORM + Drizzle Kit with committed SQL migrations.

References:

- https://orm.drizzle.team/docs/migrations
- https://orm.drizzle.team/docs/get-started/postgresql-new

### Requirements

- Migration files are source-controlled.
- Released migrations are immutable.
- Upgrade/rollback strategy is tested.
- Raw SQL remains permitted when it improves correctness/performance.

---

## ADR-010 — Web installer at `/start/installation`

**Status:** ACCEPTED

### Decision

The server must be able to boot unconfigured and expose a restricted installer that creates the production configuration and initializes the database.

### Consequences

- Application has explicit boot/install states.
- Installer security is a P0 feature.
- Post-install installer lockout is mandatory.

---

## ADR-011 — Default deployment requires only app + PostgreSQL

**Status:** ACCEPTED

### Decision

Redis, RabbitMQ, S3, Elasticsearch, Kafka, etc. cannot be required for a default installation.

### Consequences

- Local filesystem storage is supported.
- Background jobs initially use PostgreSQL.
- Advanced providers are adapters.

---

## ADR-012 — PostgreSQL-backed jobs initially

**Status:** PROVISIONAL

### Decision

Use a PostgreSQL-backed job/queue implementation to avoid adding Redis to default infrastructure.

### Revisit when

Measured throughput/latency requirements prove it insufficient.

---

## ADR-013 — Local filesystem default + S3-compatible storage adapter

**Status:** ACCEPTED

### Decision

Local filesystem is the default storage provider; private files are served through authorized application endpoints. S3-compatible storage is an optional provider.

### Consequences

- Backups must include local storage.
- Storage code cannot assume local filesystem semantics.

---

## ADR-014 — Role + permission + scope authorization

**Status:** ACCEPTED

### Decision

Authorization is not implemented as a small fixed role enum. Use roles composed of permissions plus explicit scopes/context.

Example:

`attendance.student.mark` scoped to Branch A / Class 8A.

### Consequences

- Permission catalog is versioned.
- Default roles are seed data, not hardcoded authorization branches.
- UI checks are convenience only; server enforces all authorization.

---

## ADR-015 — PostgreSQL RLS usage

**Status:** OPEN

### Question

Should application tables use PostgreSQL Row Level Security as a second enforcement layer, and if so, which connection/identity strategy will safely propagate application context?

### Current position

Do not enable broad RLS merely as a checkbox. Build a POC for the highest-risk tenant/student data paths and prove policy correctness/performance first.

Reference: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

---

## ADR-016 — One design system across platforms

**Status:** ACCEPTED

### Decision

Use one token/primitives design system shared across web/Tauri clients, with responsive/platform-specific composition on top.

### Consequences

- No module-local design language.
- Mobile navigation may differ structurally from desktop while preserving components/tokens.

---

## ADR-017 — Do not target 100% code sharing

**Status:** ACCEPTED

### Decision

Maximize shared code, but permit platform-specific code for camera, notifications, filesystem, deep links, secure storage, background behavior, and native conventions.

### Consequence

Architecture uses platform bridges rather than platform checks spread through features.

---

## ADR-018 — Offline capability is selective

**Status:** ACCEPTED

### Decision

Offline support starts with low-risk high-value workflows such as attendance/timetable, not the entire ERP.

### Consequences

- Need durable local action queue and conflict model.
- Financial/admin operations remain online-first until separately designed.

---

## ADR-019 — Modular monolith server first

**Status:** ACCEPTED

### Decision

Use a modular monolith, not microservices, for initial architecture.

### Why

School ERP domains are numerous, but default self-hosting and operational simplicity are primary goals. Microservices would create deployment and reliability overhead without demonstrated need.

### Consequences

- Strong internal module boundaries are still required.
- Modules can be extracted later only with evidence.

---

## ADR-020 — OpenAPI-compatible documented API

**Status:** PROVISIONAL

### Decision

API schemas should be capable of generating OpenAPI documentation and typed clients.

### Why

Supports shared client correctness, future integrations, and contributor clarity.

---

## ADR-021 — UI accessibility target

**Status:** ACCEPTED

### Decision

Core product targets WCAG 2.2 AA behavior for supported workflows.

---

## ADR-022 — License

**Status:** ACCEPTED

### Decision

ScolaOS is licensed under **GNU Affero General Public License v3.0 only (AGPL-3.0-only)**.

### Rationale

ScolaOS is designed as open-source network/server software. AGPL preserves the ability to self-host, modify, redistribute, and commercially support the software while requiring source availability for modified versions offered to users over a network. This aligns with the project goal of preventing core improvements from disappearing into closed hosted forks.

### Consequences

- Core source and modifications remain under AGPL-3.0-only when distributed or operated in circumstances covered by the license.
- Contributors must submit code they have the right to contribute under AGPL-3.0-only.
- Third-party dependencies must be checked for license compatibility before adoption.
- A future dual-license or permissive-license strategy requires a new ADR and contributor-rights review.

## ADR-023 — Project name/brand

**Status:** PROVISIONAL

### Decision

Use **ScolaOS** as the working product and repository name. The canonical repository is `smeetbuilds/scolaos`.

### Remaining gate

Formal trademark/domain/package-namespace screening remains required before a branded 1.0 public launch. Repository creation alone is not treated as trademark clearance.

## ADR-024 — Package manager/monorepo tooling

**Status:** ACCEPTED

### Decision

Use **pnpm workspaces without Turborepo initially**.

### Rationale

- keeps the first self-hosted/open-source contributor setup small;
- pnpm provides workspace linking and recursive scripts without another orchestration layer;
- the project does not yet have enough build volume to justify remote/local task-cache complexity.

### Revisit if

Build graph orchestration or CI caching becomes a measured bottleneck. Turborepo can be added later behind the same workspace boundaries without restructuring application/domain packages.

## ADR-025 — Authentication session transport

**Status:** OPEN

Need to decide between secure cookie-based sessions for web plus device tokens for native shells, or another coherent model.

Requirements:

- secure revocation;
- multiple devices;
- native secure storage;
- CSRF model;
- auditability;
- self-hosted reverse-proxy compatibility.

---

## ADR-026 — Financial ledger scope

**Status:** OPEN

Need to decide whether 1.0 fee/expense functionality includes a true double-entry accounting ledger or a simpler school fee/expense subsystem with a future accounting module.

Recommendation: keep fee collection accurate and auditable first; do not pretend basic income/expense tables are full accounting.

---

## ADR-027 — Multi-institution SaaS-style tenancy

**Status:** PROVISIONAL

Core schema should preserve an institution boundary, but 1.0 does not need a hosted multi-tenant control plane. One deployment may contain one or multiple institutions depending on the finalized domain model.

---

## Decision review cadence

Review `OPEN` and `PROVISIONAL` ADRs at the start/end of each milestone. Convert to `ACCEPTED`, `REJECTED`, or `SUPERSEDED` only with implementation evidence where a proof of concept is required.
