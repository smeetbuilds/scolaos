# TASKLIST.md — Master Execution Backlog

**Baseline:** 13 August 2026  
**Initial overall status:** `NOT STARTED`

Task IDs are stable. Do not renumber completed tasks; add new tasks with new IDs.

---

# Milestone M0 — Product & Architecture Foundation

## Product definition

- [x] **M0-001 [P0]** Approve master PRD boundaries and 1.0 definition.  
  **Depends:** none  
  **Done when:** PRD accepted; non-goals and milestone scope are explicit.

- [x] **M0-002 [P0]** Resolve open-source license ADR. **DONE: AGPL-3.0-only.**  
  **Depends:** M0-001  
  **Done when:** license selected, LICENSE file planned, contribution implications documented.

- [ ] **M0-003 [P1]** Select project name after conflict/domain/repository/trademark screening.  
  **Depends:** none.

- [ ] **M0-004 [P0]** Confirm initial supported server environments and minimum PostgreSQL/Node versions after implementation POC.  
  **Done when:** support matrix documented.

- [ ] **M0-005 [P0]** Create threat model for installer, auth, tenant boundaries, files, payments, updates, and backups.

## Repository/tooling

- [x] **M0-010 [P0]** Initialize monorepo. **DONE: `apps/*`, `packages/*`, `tooling/*`.**
- [x] **M0-011 [P0]** Choose package manager/workspace tooling ADR. **DONE: pnpm workspaces; no Turborepo initially.**
- [x] **M0-012 [P0]** Configure TypeScript strict baseline. **DONE: shared strict `tsconfig.base.json`.**
- [ ] **M0-013 [P0]** Configure linting/formatting/import-boundary rules.
- [ ] **M0-014 [P0]** Configure unit-test framework.
- [ ] **M0-015 [P0]** Configure Playwright E2E harness.
- [ ] **M0-016 [P0]** Configure CI for install/typecheck/lint/test/build.
- [ ] **M0-017 [P1]** Configure dependency update policy.
- [ ] **M0-018 [P0]** Configure secret scanning and dependency vulnerability scanning.
- [ ] **M0-019 [P1]** Add conventional change/release/changelog process.
- [ ] **M0-020 [P1]** Add CODEOWNERS/review rules once maintainers are known.

## Architecture POCs

- [ ] **M0-030 [P0]** Fastify API POC with schema validation, error envelope, request IDs, auth hook stub, and OpenAPI generation.
- [ ] **M0-031 [P0]** Drizzle/PostgreSQL POC with migration generation/application and integration tests.
- [ ] **M0-032 [P0]** Tauri desktop POC using shared React screen.
- [ ] **M0-033 [P0]** Tauri Android POC build.
- [ ] **M0-034 [P0]** Tauri iOS POC build/signing in supported environment.
- [ ] **M0-035 [P0]** Tauri mobile QR/camera POC.
- [ ] **M0-036 [P0]** Native secure-storage POC.
- [ ] **M0-037 [P1]** Push/native notification POC.
- [ ] **M0-038 [P0]** Decide ACCEPT/REJECT for provisional Tauri ADR based on POCs.
- [ ] **M0-039 [P0]** Decide ACCEPT/REJECT Fastify/Drizzle ADRs based on POCs.

## Design-system foundation

- [ ] **M0-050 [P0]** Define visual direction: typography, spacing, color semantics, radius, elevation, density.
- [ ] **M0-051 [P0]** Define responsive layout principles and breakpoint strategy.
- [ ] **M0-052 [P0]** Build Button/IconButton/Link primitives.
- [ ] **M0-053 [P0]** Build form primitives and validation states.
- [ ] **M0-054 [P0]** Build dialog/sheet/popover/tooltip primitives.
- [ ] **M0-055 [P0]** Build navigation primitives.
- [ ] **M0-056 [P0]** Build table/data-list foundation.
- [ ] **M0-057 [P0]** Build empty/loading/error/status primitives.
- [ ] **M0-058 [P1]** Build date/time/calendar primitives.
- [ ] **M0-059 [P1]** Build chart wrapper/metric components.
- [ ] **M0-060 [P0]** Establish component accessibility tests/checklist.
- [ ] **M0-061 [P1]** Create design-system documentation/demo workspace.

## Platform contracts

- [ ] **M0-070 [P0]** Define API error contract.
- [ ] **M0-071 [P0]** Define pagination/filter/sort contract.
- [ ] **M0-072 [P0]** Define API compatibility/version metadata.
- [ ] **M0-073 [P0]** Define platform-bridge interfaces.
- [ ] **M0-074 [P0]** Define storage-provider interface.
- [ ] **M0-075 [P0]** Define notification event/channel interfaces.
- [ ] **M0-076 [P0]** Define background-job contract.
- [ ] **M0-077 [P0]** Define module-boundary conventions.
- [ ] **M0-078 [P0]** Define audit-event contract.

### M0 release gate

- [ ] **M0-GATE** Architecture POCs are proven, core ADRs updated, CI green, design primitives usable, and threat model reviewed.

---

# Milestone M1 — Installable Platform Alpha

## Boot/configuration

- [ ] **M1-001 [P0]** Implement explicit unconfigured/configured/installed boot states.
- [ ] **M1-002 [P0]** Restrict unconfigured server to installer-safe routes.
- [ ] **M1-003 [P0]** Implement server config schema and safe persistence.
- [ ] **M1-004 [P0]** Implement generated server security secrets.
- [ ] **M1-005 [P0]** Redact secrets from structured logs/errors.

## Installer UI

- [ ] **M1-010 [P0]** Welcome screen.
- [ ] **M1-011 [P0]** Requirements check screen.
- [ ] **M1-012 [P0]** Database form.
- [ ] **M1-013 [P0]** DB connection/privilege test endpoint.
- [ ] **M1-014 [P0]** Institution setup screen.
- [ ] **M1-015 [P0]** Initial academic-session fields.
- [ ] **M1-016 [P0]** Administrator setup screen.
- [ ] **M1-017 [P1]** Optional SMTP setup/test screen.
- [ ] **M1-018 [P1]** Optional storage setup screen.
- [ ] **M1-019 [P0]** Real installation-progress state UI.
- [ ] **M1-020 [P0]** Success/login redirect.
- [ ] **M1-021 [P0]** Installation-failure recovery UI.

## Installer backend/security

- [ ] **M1-030 [P0]** Installer lock against concurrent execution.
- [ ] **M1-031 [P0]** Migration runner.
- [ ] **M1-032 [P0]** Seed default system data.
- [ ] **M1-033 [P0]** Seed default permission catalog.
- [ ] **M1-034 [P0]** Create institution/branch/session/admin transactionally.
- [ ] **M1-035 [P0]** Post-install verification.
- [ ] **M1-036 [P0]** Permanent installer mutation lock after success.
- [ ] **M1-037 [P0]** Installer CSRF/request-origin strategy.
- [ ] **M1-038 [P0]** Installer security integration tests.
- [ ] **M1-039 [P0]** E2E fresh install test.
- [ ] **M1-040 [P0]** E2E failed DB/retry install tests.

## Identity

- [ ] **M1-050 [P0]** User schema.
- [ ] **M1-051 [P0]** Membership schema.
- [ ] **M1-052 [P0]** Role/permission/assignment schemas.
- [ ] **M1-053 [P0]** Decide auth session transport ADR.
- [ ] **M1-054 [P0]** Password hashing implementation.
- [ ] **M1-055 [P0]** Login endpoint/UI.
- [ ] **M1-056 [P0]** Logout/session revocation.
- [ ] **M1-057 [P0]** Forgot/reset password.
- [ ] **M1-058 [P0]** Login rate limiting/brute-force controls.
- [ ] **M1-059 [P0]** Current-user/permission context endpoint.

## Authorization

- [ ] **M1-060 [P0]** Permission registry.
- [ ] **M1-061 [P0]** Default role templates.
- [ ] **M1-062 [P0]** Server authorization service.
- [ ] **M1-063 [P0]** Scope model POC.
- [ ] **M1-064 [P0]** Decide RLS ADR after POC.
- [ ] **M1-065 [P0]** Permission-aware client navigation.
- [ ] **M1-066 [P0]** Unauthorized API integration suite.

## Institution/settings

- [ ] **M1-070 [P0]** Institution settings CRUD.
- [ ] **M1-071 [P0]** Branch model/basic management.
- [ ] **M1-072 [P0]** Academic session management.
- [ ] **M1-073 [P1]** Term/semester model.
- [ ] **M1-074 [P1]** Branding/logo.
- [ ] **M1-075 [P0]** Timezone/currency/locale settings.

## Audit/health

- [ ] **M1-080 [P0]** Audit-event persistence.
- [ ] **M1-081 [P0]** Audit helper/service.
- [ ] **M1-082 [P1]** Admin audit-list UX.
- [ ] **M1-083 [P0]** Health-check service.
- [ ] **M1-084 [P0]** Health admin screen.
- [ ] **M1-085 [P1]** Request/log correlation IDs.

### M1 release gate

- [ ] **M1-GATE** Fresh instance installs through UI, admin logs in, permissions are enforced, health page works, installer cannot be rerun, and all P0 tests are green.

---

# Milestone M2 — Students & Academic Core

## Classes/sections/subjects

- [ ] **M2-001 [P0]** Class/grade schema.
- [ ] **M2-002 [P0]** Section schema.
- [ ] **M2-003 [P0]** Class-section/session relationship.
- [ ] **M2-004 [P0]** Subject schema.
- [ ] **M2-005 [P0]** Subject offering/assignment model.
- [ ] **M2-006 [P0]** Teacher subject/class assignment.
- [ ] **M2-007 [P0]** CRUD APIs + authorization.
- [ ] **M2-008 [P0]** Admin responsive UX.

## Students/guardians

- [ ] **M2-020 [P0]** Student schema.
- [ ] **M2-021 [P0]** Admission number uniqueness policy.
- [ ] **M2-022 [P0]** Guardian/person relationship schema.
- [ ] **M2-023 [P0]** Enrollment schema/history.
- [ ] **M2-024 [P1]** Student category/house schema.
- [ ] **M2-025 [P0]** Student create/admit workflow API.
- [ ] **M2-026 [P0]** Student create/admit responsive UX.
- [ ] **M2-027 [P0]** Student list server pagination/filter/search.
- [ ] **M2-028 [P0]** Student profile workspace desktop/tablet.
- [ ] **M2-029 [P0]** Student profile mobile composition.
- [ ] **M2-030 [P0]** Guardian create/link workflow.
- [ ] **M2-031 [P0]** Parent portal account-link foundation.
- [ ] **M2-032 [P1]** Student document upload/private access.
- [ ] **M2-033 [P0]** Promotion workflow design.
- [ ] **M2-034 [P0]** Promotion implementation/history preservation.
- [ ] **M2-035 [P1]** Withdrawal/transfer flow.
- [ ] **M2-036 [P2]** Alumni state/workspace.

## Staff/teacher basic

- [ ] **M2-040 [P0]** Staff profile schema.
- [ ] **M2-041 [P0]** Teacher role/profile linkage.
- [ ] **M2-042 [P0]** Staff list/profile CRUD.
- [ ] **M2-043 [P0]** Teacher scoped class access tests.

## Import

- [ ] **M2-050 [P1]** Generic import job framework.
- [ ] **M2-051 [P1]** CSV student import.
- [ ] **M2-052 [P1]** Column mapping UI.
- [ ] **M2-053 [P1]** Validation preview/error export.
- [ ] **M2-054 [P1]** Idempotent/retry-safe import behavior.

### M2 release gate

- [ ] **M2-GATE** School can configure academic structure, admit/import students, link guardians, assign students to classes, and preserve enrollment history securely.

---

# Milestone M3 — Timetable, Attendance, Assignments, Communication

## Timetable

- [ ] **M3-001 [P0]** Timetable domain model.
- [ ] **M3-002 [P0]** Clash validation rules.
- [ ] **M3-003 [P0]** Timetable admin editor.
- [ ] **M3-004 [P0]** Teacher today/timetable view.
- [ ] **M3-005 [P0]** Student/parent timetable view.

## Student attendance

- [ ] **M3-020 [P0]** Attendance schema/session semantics.
- [ ] **M3-021 [P0]** Attendance statuses/settings.
- [ ] **M3-022 [P0]** Bulk mark attendance API.
- [ ] **M3-023 [P0]** Idempotency/concurrent edit strategy.
- [ ] **M3-024 [P0]** Teacher desktop attendance UX.
- [ ] **M3-025 [P0]** Teacher mobile attendance UX.
- [ ] **M3-026 [P0]** Attendance correction/audit flow.
- [ ] **M3-027 [P0]** Student/parent attendance summary.
- [ ] **M3-028 [P1]** Attendance reports.
- [ ] **M3-029 [P1]** Staff attendance basics.

## Assignments/homework

- [ ] **M3-040 [P1]** Assignment schema.
- [ ] **M3-041 [P1]** Teacher create/edit/publish.
- [ ] **M3-042 [P1]** Attachments.
- [ ] **M3-043 [P1]** Student/parent views.
- [ ] **M3-044 [P2]** Submission flow if included in 1.0 scope.

## Announcements/in-app notifications

- [ ] **M3-050 [P1]** Notification event model.
- [ ] **M3-051 [P1]** Recipient resolution.
- [ ] **M3-052 [P1]** In-app notification inbox.
- [ ] **M3-053 [P1]** Announcement compose/publish.
- [ ] **M3-054 [P1]** Role/class-targeted announcements.
- [ ] **M3-055 [P1]** Read/unread state.

### M3 release gate

- [ ] **M3-GATE** Teacher can operate a normal school day from timetable through attendance/assignments; student/parent can see appropriate updates.

---

# Milestone M4 — Fees & Examinations

## Finance domain decision

- [ ] **M4-001 [P0]** Resolve ADR-026: fee subsystem vs full ledger scope for 1.0.

## Fees

- [ ] **M4-010 [P0]** Fee type/group model.
- [ ] **M4-011 [P0]** Fee structure/assignment model.
- [ ] **M4-012 [P0]** Invoice/charge model.
- [ ] **M4-013 [P0]** Discounts/concessions model.
- [ ] **M4-014 [P0]** Fine model.
- [ ] **M4-015 [P0]** Payment transaction model.
- [ ] **M4-016 [P0]** Receipt numbering/immutability rules.
- [ ] **M4-017 [P0]** Collect payment workflow.
- [ ] **M4-018 [P0]** Refund/correction workflow.
- [ ] **M4-019 [P0]** Finance audit events.
- [ ] **M4-020 [P0]** Accountant dashboard.
- [ ] **M4-021 [P0]** Parent/student dues view.
- [ ] **M4-022 [P1]** PDF/print receipt.
- [ ] **M4-023 [P1]** Collection/dues reports.
- [ ] **M4-024 [P1]** Payment gateway adapter interface.
- [ ] **M4-025 [P2]** First gateway implementation selected by target market.

## Exams

- [ ] **M4-040 [P0]** Exam/group/type schema.
- [ ] **M4-041 [P0]** Exam schedule model.
- [ ] **M4-042 [P0]** Grading scale.
- [ ] **M4-043 [P0]** Marks schema with uniqueness/integrity constraints.
- [ ] **M4-044 [P0]** Marks entry teacher UX.
- [ ] **M4-045 [P0]** Marks edit/audit policy.
- [ ] **M4-046 [P0]** Result calculation service.
- [ ] **M4-047 [P0]** Publish/unpublish result workflow.
- [ ] **M4-048 [P0]** Student/parent result UI.
- [ ] **M4-049 [P1]** Report card document generation.
- [ ] **M4-050 [P1]** Exam/result reports.

### M4 release gate

- [ ] **M4-GATE** Fee and exam critical paths pass integrity, permission, concurrency, audit, and E2E tests.

---

# Milestone M5 — Cross-Platform & Offline Beta

## PWA

- [ ] **M5-001 [P1]** PWA manifest/icons/installability.
- [ ] **M5-002 [P0]** Define safe caching policy.
- [ ] **M5-003 [P1]** App shell/offline fallback.
- [ ] **M5-004 [P0]** Verify sensitive API responses are not unintentionally cached.

## Tauri desktop

- [ ] **M5-010 [P1]** Desktop shell production configuration.
- [ ] **M5-011 [P1]** Instance/server onboarding.
- [ ] **M5-012 [P1]** Native secure storage.
- [ ] **M5-013 [P2]** Native notifications.
- [ ] **M5-014 [P1]** File export/import.
- [ ] **M5-015 [P1]** Deep links.
- [ ] **M5-016 [P1]** Windows build/sign pipeline.
- [ ] **M5-017 [P1]** macOS build/sign/notarization pipeline.
- [ ] **M5-018 [P1]** Linux packages.

## Tauri mobile

- [ ] **M5-030 [P1]** Android production shell.
- [ ] **M5-031 [P1]** iOS production shell.
- [ ] **M5-032 [P1]** QR server onboarding.
- [ ] **M5-033 [P1]** Native secure session persistence.
- [ ] **M5-034 [P2]** Push notification adapter.
- [ ] **M5-035 [P1]** Camera/file/share flows.
- [ ] **M5-036 [P1]** Mobile navigation polish for teacher/student/parent.

## Offline attendance

- [ ] **M5-050 [P1]** Local cache schema.
- [ ] **M5-051 [P1]** Durable offline action queue.
- [ ] **M5-052 [P1]** Connectivity state UI.
- [ ] **M5-053 [P1]** Idempotent sync endpoint.
- [ ] **M5-054 [P1]** Conflict detection/resolution UI.
- [ ] **M5-055 [P1]** Offline E2E scenarios.

### M5 release gate

- [ ] **M5-GATE** Supported desktop/mobile builds connect safely to self-hosted server; key UX is native-quality; offline attendance is reliable.

---

# Milestone M6 — Production 1.0 Hardening

## Storage/files

- [ ] **M6-001 [P0]** Local storage provider production hardening.
- [ ] **M6-002 [P0]** Private authorized file downloads.
- [ ] **M6-003 [P0]** Upload validation/quota foundation.
- [ ] **M6-004 [P1]** S3-compatible storage provider.
- [ ] **M6-005 [P1]** Storage migration/documentation.

## Jobs/scheduler

- [ ] **M6-010 [P0]** PostgreSQL job queue implementation.
- [ ] **M6-011 [P0]** Worker heartbeat/health.
- [ ] **M6-012 [P0]** Retry/dead-job behavior.
- [ ] **M6-013 [P1]** Admin failed-job view/retry.
- [ ] **M6-014 [P0]** Scheduler implementation.
- [ ] **M6-015 [P0]** Idempotency guidance for job handlers.

## Email/templates

- [ ] **M6-020 [P0]** SMTP provider.
- [ ] **M6-021 [P0]** SMTP settings/test.
- [ ] **M6-022 [P1]** Notification template model.
- [ ] **M6-023 [P1]** Template preview.
- [ ] **M6-024 [P1]** Email delivery log.

## Backup/restore

- [ ] **M6-030 [P0]** DB backup implementation.
- [ ] **M6-031 [P0]** Local-file backup implementation.
- [ ] **M6-032 [P0]** Backup manifest/checksums.
- [ ] **M6-033 [P0]** Restore preflight.
- [ ] **M6-034 [P0]** Restore implementation.
- [ ] **M6-035 [P0]** Backup/restore E2E integration tests.
- [ ] **M6-036 [P1]** Scheduled backups.

## Upgrade compatibility

- [ ] **M6-040 [P0]** Application/DB compatibility metadata.
- [ ] **M6-041 [P0]** Pending-migration health status.
- [ ] **M6-042 [P0]** Document safe upgrade procedure.
- [ ] **M6-043 [P0]** Test N-1 → current upgrade.
- [ ] **M6-044 [P1]** Admin update-status UX.
- [ ] **M6-045 [P2]** Signed one-click updater only if security/recovery design passes review.

## Reports/export

- [ ] **M6-050 [P1]** Report execution abstraction.
- [ ] **M6-051 [P1]** Async heavy report job.
- [ ] **M6-052 [P1]** CSV export.
- [ ] **M6-053 [P1]** XLSX export.
- [ ] **M6-054 [P1]** PDF document/report pipeline.

## Security hardening

- [ ] **M6-060 [P0]** Full authorization matrix test suite.
- [ ] **M6-061 [P0]** File security review.
- [ ] **M6-062 [P0]** Session/cookie/token security review.
- [ ] **M6-063 [P0]** Installer/update/restore security review.
- [ ] **M6-064 [P0]** Rate-limit/abuse review.
- [ ] **M6-065 [P0]** CSP/security headers.
- [ ] **M6-066 [P0]** Dependency/security scan clean or accepted with documented risk.
- [ ] **M6-067 [P0]** Security disclosure documentation.

## Performance

- [ ] **M6-070 [P0]** Generate realistic large reference dataset.
- [ ] **M6-071 [P0]** Benchmark student list/search.
- [ ] **M6-072 [P0]** Benchmark attendance bulk writes.
- [ ] **M6-073 [P0]** Benchmark fee/report queries.
- [ ] **M6-074 [P0]** Index/query optimization pass.
- [ ] **M6-075 [P1]** Client bundle/module loading audit.
- [ ] **M6-076 [P1]** Low-powered device/mobile performance review.

## UX/accessibility

- [ ] **M6-080 [P0]** Core workflow responsive audit.
- [ ] **M6-081 [P0]** Keyboard/focus audit.
- [ ] **M6-082 [P0]** Screen-reader semantics review for core flows.
- [ ] **M6-083 [P0]** Empty/loading/error state audit.
- [ ] **M6-084 [P0]** Destructive action confirmation/recovery audit.
- [ ] **M6-085 [P1]** Reduced-motion/contrast review.

## Documentation/open-source readiness

- [ ] **M6-090 [P0]** README.
- [ ] **M6-091 [P0]** LICENSE.
- [ ] **M6-092 [P0]** CONTRIBUTING.
- [ ] **M6-093 [P0]** SECURITY.
- [ ] **M6-094 [P1]** CODE_OF_CONDUCT.
- [ ] **M6-095 [P0]** Installation docs.
- [ ] **M6-096 [P0]** Docker docs.
- [ ] **M6-097 [P0]** Upgrade/backup/restore docs.
- [ ] **M6-098 [P0]** Development environment docs.
- [ ] **M6-099 [P1]** Architecture/module contribution docs.
- [ ] **M6-100 [P1]** API docs.

### M6 / 1.0 release gate

- [ ] **M6-GATE** All P0 tasks complete; security/performance/accessibility gates pass; clean install and N-1 upgrade pass; backup restore verified; core workflows documented; no known critical data-integrity defect.

---

# Post-1.0 Epics

## M7 — HR & Payroll

- [ ] Staff departments/designations/contracts.
- [ ] Leave workflow.
- [ ] Payroll configuration/calculation.
- [ ] Salary slips.
- [ ] Payroll reporting/audit.

## M8 — Library

- [ ] Catalog/copies.
- [ ] Issues/returns.
- [ ] Fines/reservations.
- [ ] Student/staff history.

## M9 — Transport

- [ ] Vehicles/drivers.
- [ ] Routes/stops.
- [ ] Student assignments.
- [ ] Transport fee integration.
- [ ] GPS/provider adapter.

## M10 — Inventory & Front Office

- [ ] Inventory/stock/assets.
- [ ] Suppliers/purchasing.
- [ ] Enquiries/visitors/appointments/complaints.

## M11 — Certificates/Documents

- [ ] Template designer.
- [ ] ID cards.
- [ ] Certificates.
- [ ] Admit cards.
- [ ] QR verification.

## M12 — Hostel

- [ ] Hostel/room/bed model.
- [ ] Allocation.
- [ ] Fees.
- [ ] Operational workflows.

## M13 — LMS & Online Exams

- [ ] Courses/lessons/resources.
- [ ] Quiz/question bank.
- [ ] Online exam runtime.
- [ ] Progress/reporting.

## M14 — Integrations/Ecosystem

- [ ] Webhooks.
- [ ] Public API versioning.
- [ ] Plugin/module SDK.
- [ ] Payment adapters.
- [ ] SMS/WhatsApp adapters.
- [ ] SSO.
- [ ] Education ecosystem integrations.
