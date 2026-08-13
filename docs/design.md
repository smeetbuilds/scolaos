# DESIGN.md — ScolaOS Architecture and UX Specification

**Status:** Architecture baseline  
**Date:** 13 August 2026

---

## 1. Design objectives

The architecture must optimize simultaneously for:

- easy self-hosting;
- low mandatory infrastructure;
- excellent user experience;
- cross-platform client reuse;
- strong data integrity and authorization;
- predictable upgrades;
- modular contribution;
- operational diagnosability;
- good performance on ordinary VPS hardware.

The design explicitly avoids adopting infrastructure merely because it is common in large SaaS architectures.

---

## 2. System context

```text
                         Browser / PWA
                              │
                  Desktop ─────┼───── Mobile
                    Tauri      │      Tauri
                              │
                              ▼
                       HTTPS REST API
                              │
                    ┌─────────┴─────────┐
                    │  Fastify Server   │
                    │  TypeScript       │
                    └─────────┬─────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
          PostgreSQL       Storage       Job Worker
                           Local/S3       PostgreSQL queue
```

Default mandatory services:

1. Node.js application runtime.
2. PostgreSQL.

Optional services must be introduced through adapters.

---

## 3. Repository architecture

Use a monorepo so contracts, UI primitives, schemas, and domain types remain versioned together.

```text
school-os/
├── apps/
│   ├── web/                 # React/Vite/PWA
│   ├── server/              # Fastify API
│   ├── desktop-mobile/      # Tauri shell
│   └── worker/              # background jobs/scheduler if separated
│
├── packages/
│   ├── ui/                  # design system
│   ├── api-client/          # generated/typed API client
│   ├── contracts/           # transport schemas / shared contract types
│   ├── domain/              # pure domain types/utilities
│   ├── permissions/         # permission identifiers/scopes
│   ├── validation/          # common safe validation where portable
│   ├── i18n/
│   ├── config/
│   └── testing/
│
├── server-modules/
│   ├── identity/
│   ├── institutions/
│   ├── students/
│   ├── academics/
│   ├── attendance/
│   ├── fees/
│   ├── exams/
│   └── ...
│
├── database/
│   ├── schema/
│   ├── migrations/
│   └── seeds/
│
├── installer/
├── docker/
├── docs/
└── tooling/
```

### Dependency rule

Feature modules may depend on shared platform packages. Shared packages may not import feature modules.

Circular module dependencies are prohibited.

---

## 4. Client architecture

### 4.1 React application

The main UX is a React + TypeScript application built using Vite.

It is responsible for:

- routing;
- role-aware navigation;
- query/cache management;
- forms;
- data tables;
- charts;
- responsive composition;
- offline cache for explicitly supported workflows;
- PWA manifest/service-worker behavior;
- desktop/mobile shell integration through adapters.

### 4.2 Platform adapters

Never scatter checks such as `if (isTauri)` through feature code.

Define interfaces:

```ts
interface PlatformBridge {
  notifications: NotificationBridge;
  files: FileBridge;
  camera: CameraBridge;
  deepLinks: DeepLinkBridge;
  secureStorage: SecureStorageBridge;
  connectivity: ConnectivityBridge;
}
```

Implement:

- `WebPlatformBridge`
- `TauriDesktopBridge`
- `TauriMobileBridge`

Feature modules call the interface only.

### 4.3 API client

API interactions go through a generated or strongly typed client package. Components do not construct arbitrary API URLs.

Required behavior:

- common error shape;
- request IDs;
- auth handling;
- cancellation;
- retry policy for safe requests;
- idempotency keys for selected mutations;
- version compatibility metadata.

---

## 5. Server architecture

Use Fastify with modular plugins and route encapsulation.

Suggested internal layering:

```text
HTTP route
   ↓
request schema / authorization
   ↓
application service / use case
   ↓
domain policy
   ↓
repository/query layer
   ↓
PostgreSQL
```

Do not put business rules directly inside route handlers.

### API conventions

- REST-style resource URLs.
- Explicit action endpoints for domain actions that are not CRUD.
- OpenAPI generated from route schemas where practical.
- Version strategy defined before public integrations are supported.
- Pagination mandatory for unbounded collections.
- Filtering/sorting allowlists; never interpolate arbitrary client fields into SQL.
- UTC persistence for timestamps, localized display at client boundary.

### Error envelope

Example:

```json
{
  "error": {
    "code": "STUDENT_ADMISSION_NUMBER_EXISTS",
    "message": "Admission number already exists.",
    "requestId": "...",
    "fields": {
      "admissionNumber": "Already in use"
    }
  }
}
```

Do not expose stack traces to normal clients.

---

## 6. Database architecture

### 6.1 PostgreSQL

PostgreSQL is the system of record.

Use:

- primary/foreign keys;
- unique constraints;
- check constraints;
- partial indexes where justified;
- composite indexes based on real access patterns;
- transactions for multi-record invariants;
- immutable audit/event records for selected critical actions.

### 6.2 Core identity hierarchy

Initial conceptual model:

```text
users
  │
  ├── memberships ── institutions
  │                    │
  │                    └── branches
  │
  ├── role_assignments
  └── user_profiles

institutions
  └── academic_sessions
       └── enrollments
            ├── students
            └── class_sections
```

A single person may carry multiple memberships/roles depending on future multi-school use cases.

### 6.3 Tenant boundary

Even when most deployments contain one institution, core tables should carry an institution/tenant boundary where appropriate so the model can support branches and future multi-institution deployments without destructive redesign.

Authorization must not rely only on tenant IDs supplied by clients.

### 6.4 ORM and migrations

Use Drizzle for typed queries/schema and versioned migrations.

Migration rules:

- every production schema change is a committed migration;
- never edit an already released migration;
- migrations must be resumable or fail safely;
- destructive migrations require explicit compatibility strategy;
- update process creates/verifies backup before dangerous migrations;
- application compatibility version is stored in DB metadata.

---

## 7. Authentication and authorization

Detailed PRD: `prds/002-identity-access.md`.

### Authentication

Initial supported methods:

- email/username + password;
- administrator-created/invited accounts;
- password reset;
- optional TOTP MFA after foundation release;
- future OIDC/SAML adapter.

Passwords must use a modern password-hashing algorithm supported by the chosen Node stack, configured using current security recommendations at implementation time.

### Authorization

Model:

```text
User
 + Membership
 + Role assignments
 + Permission grants
 + Scope
 + Context
 = Decision
```

Example permission:

`attendance.student.mark`

Example scope:

- institution A;
- branch B;
- class section 8A;
- academic session 2026-27.

Authorization is checked in application services/routes. UI permission checks exist only for user experience, never as the enforcement boundary.

PostgreSQL row-level security is available as an additional defense for selected tables/contexts but must be adopted only with a clear connection-role/context design. It should not be superficially enabled without proving policy correctness.

---

## 8. Installer architecture

Detailed PRD: `prds/001-installer-self-hosting.md`.

### Boot states

```text
UNCONFIGURED
    ↓
CONFIG_WRITTEN
    ↓
DB_CONNECTED
    ↓
MIGRATING
    ↓
SEEDING
    ↓
VERIFYING
    ↓
INSTALLED
```

The server must boot in `UNCONFIGURED` state and expose only safe installation/status routes.

### Security requirements

- Installation endpoint becomes inaccessible after success.
- Installer uses CSRF protection where applicable.
- Secrets never echoed back in responses/logs.
- Installation lock prevents parallel installers.
- Database credentials stored only in server-side config with restricted filesystem permissions.
- Installation state cannot be changed solely by a browser parameter.
- Partial failure does not create a false `INSTALLED` marker.

---

## 9. Storage architecture

Define a storage provider interface.

```text
StorageProvider
├── LocalStorageProvider       # default
├── S3StorageProvider
└── future adapters
```

Storage classes:

- public assets;
- private student/staff documents;
- generated reports;
- temporary files;
- backups.

Private documents must not be reachable through predictable public file URLs.

Local storage default must work without an object-storage service.

---

## 10. Job/scheduler architecture

Default should use PostgreSQL-backed jobs to avoid a Redis dependency.

Jobs include:

- email delivery;
- notification fan-out;
- report generation;
- bulk imports;
- scheduled reminders;
- housekeeping;
- backup execution;
- queued exports.

Requirements:

- retry policy;
- dead-letter/failed-job state;
- idempotency for retried jobs;
- concurrency controls;
- job observability in admin health UI;
- scheduled jobs use explicit timezone behavior.

---

## 11. UX information architecture

Do not present all modules in one undifferentiated sidebar.

### Admin high-level IA

```text
Overview

People
  Students
  Guardians
  Staff
  Admissions

Academics
  Classes & Sections
  Subjects
  Timetable
  Attendance
  Assignments
  Exams

Finance
  Fees
  Invoices
  Payments
  Expenses
  Reconciliation

Operations
  Library
  Transport
  Hostel
  Inventory

Engagement
  Announcements
  Messages
  Notifications

Insights
  Reports
  Analytics

Administration
  Institution
  Users & Access
  Integrations
  System
```

Items not granted by permissions are omitted.

### Navigation behavior

Desktop:

- collapsible left navigation;
- command/search palette;
- breadcrumbs only where hierarchy is meaningful;
- persistent contextual actions.

Mobile:

- role-specific bottom navigation for highest-frequency areas;
- secondary navigation through sheets/drill-down pages;
- avoid giant hamburger menus.

---

## 12. Design system

### Principles

- neutral, institutional, contemporary;
- excellent readability and information density;
- quiet surfaces rather than decorative dashboards;
- strong hierarchy;
- restrained color;
- predictable interaction;
- motion only when it explains change.

### Required primitive inventory

- Button.
- IconButton.
- Link.
- Input/Textarea.
- Select/Combobox.
- Checkbox/Radio/Switch.
- Date/DateRange/Time pickers.
- Form field/message.
- Dialog/AlertDialog.
- Sheet/Drawer.
- Popover/Tooltip.
- Command palette.
- Tabs.
- Breadcrumb.
- Pagination.
- Data table/data grid.
- Empty state.
- Loading skeleton.
- Toast/status banner.
- Badge/status.
- Avatar.
- Card.
- Metric.
- Chart wrapper.
- File uploader.
- Stepper.
- Calendar/timetable.

### Design tokens

Centralize:

- typography;
- spacing;
- breakpoints;
- radii;
- shadows/elevation;
- layer/z-index scale;
- colors and semantic roles;
- motion duration/easing;
- component density;
- focus ring.

No arbitrary one-off component values unless documented.

---

## 13. Responsive strategy

Breakpoints should be driven by layout needs, not device marketing names.

Every feature defines:

- wide desktop behavior;
- compact desktop/tablet landscape behavior;
- tablet portrait behavior;
- mobile behavior.

Tables must define a mobile strategy explicitly:

- card transformation;
- horizontal scroll;
- column prioritization;
- drill-in detail;

Choosing one is part of feature design, not a global CSS accident.

---

## 14. Offline strategy

Offline is selective.

Initial candidates:

- today's timetable;
- class roster;
- attendance marking;
- limited reference data.

Offline mutation pattern:

```text
local action
 → durable local queue
 → UI indicates unsynced state
 → reconnect
 → authenticated sync
 → server validates authorization/version
 → conflict resolution if required
 → confirmed state
```

Financial transactions and sensitive administrative configuration must not receive simplistic optimistic offline writes.

---

## 15. Search

Search is a product capability, not merely a table filter.

Phases:

1. Module-local indexed search using PostgreSQL.
2. Global command/search experience for students, staff, actions, and navigation.
3. Optional advanced search extensions only if PostgreSQL becomes insufficient.

No Elasticsearch requirement in default architecture.

---

## 16. Observability and diagnostics

Every request receives a request/correlation ID.

Structured logs include:

- timestamp;
- level;
- component;
- request/job ID;
- user ID when safe;
- institution ID when safe;
- operation/event type.

Never log:

- passwords;
- session tokens;
- database credentials;
- raw payment secrets;
- unnecessary sensitive student data.

Admin health page should expose safe operational state without exposing secrets.

---

## 17. Update architecture

The updater must distinguish:

- application binary/files;
- database migrations;
- compatibility version;
- optional modules.

Safe sequence:

```text
preflight
 → maintenance mode
 → backup/backup verification
 → signed release verification
 → application update
 → DB migrations
 → smoke/health check
 → leave maintenance mode
```

A failed health check must produce actionable rollback/recovery instructions.

Automatic update capability may be delayed; the compatibility/migration model cannot be delayed.

---

## 18. Backup architecture

Backup manifest should include:

- app version;
- database version;
- timestamp/timezone;
- database dump metadata;
- file archive metadata;
- checksums;
- encryption metadata if enabled.

Restore must verify compatibility before destructive action.

---

## 19. Performance design

### Database

- query budgets for high-traffic screens;
- indexed foreign keys and common filters;
- avoid N+1 queries;
- explain/analyze critical reports;
- bounded pagination;
- pre-computed summaries only when measurement proves need.

### Client

- route/module code splitting;
- window/virtualize very large tables when necessary;
- avoid rerendering whole dashboards for local changes;
- cache stable lookup data;
- lazy load charts/editors/export tooling;
- compressed assets;
- responsive image handling.

### API

- schema-based serialization;
- payload projection;
- compression at reverse proxy/server where appropriate;
- avoid returning fields not used by the screen.

---

## 20. Security architecture checklist

- Secure HTTP headers.
- CSRF strategy based on auth transport.
- SameSite/HttpOnly/Secure cookies if cookie sessions are used.
- Brute-force/rate limits.
- Password-reset token expiry/single use.
- Session revocation.
- Permission checks on every protected server operation.
- File upload MIME/size/extension/content validation.
- Private-file authorization.
- SQL parameterization.
- Output escaping.
- CSP strategy.
- Dependency scanning.
- Secret scanning.
- Audit events for critical mutations.
- Installer/update signing strategy.
- Security contact and disclosure process.

---

## 21. Test architecture

### Unit

Pure domain policies, permission calculations, validators, formatters.

### Integration

Database repositories, service transactions, authorization boundaries, migration tests, job behavior.

### API

Route schemas, permissions, error contract, pagination, idempotency.

### E2E

Critical journeys:

- fresh installation;
- first login/onboarding;
- create academic structure;
- admit student;
- assign class/section;
- take attendance;
- create fee invoice/collect payment;
- create exam/enter marks/publish result;
- parent/student read flows;
- backup/restore smoke path.

### Visual/responsive

Design-system stories/screenshots or an equivalent deterministic review method for supported viewport classes.

---

## 22. Official references supporting baseline technology choices

- Tauri supports web frontend frameworks and cross-platform builds for Linux, macOS, Windows, Android and iOS: https://v2.tauri.app/
- Fastify uses schema-based validation/serialization: https://fastify.io/docs/latest/Reference/Validation-and-Serialization/
- Drizzle migration workflows: https://orm.drizzle.team/docs/migrations
- Drizzle PostgreSQL drivers: https://orm.drizzle.team/docs/get-started/postgresql-new
- PostgreSQL row-security policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
