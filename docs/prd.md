# PRD — Open-Source School OS

**Document:** Master Product Requirements Document  
**Status:** Draft baseline for implementation  
**Version:** 0.1  
**Date:** 13 August 2026

---

## 1. Product thesis

Build an open-source, self-hostable school operating system that delivers the functional breadth expected from mature school-management products while materially improving installation, usability, responsiveness, extensibility, security, and long-term maintainability.

The product is not a PHP rewrite and not a clone of an existing school ERP. Existing systems are useful only as domain references for required workflows. The implementation, information architecture, interaction patterns, database model, authorization model, and codebase must be independently designed.

### Product promise

A school should be able to:

1. Deploy the server using a simple package or Docker.
2. Create a PostgreSQL database, or use the bundled PostgreSQL Docker service.
3. Visit `/start/installation`.
4. Complete a polished installation wizard.
5. Create the institution and first administrator.
6. Sign in and complete guided onboarding.
7. Operate the system from browser, desktop, Android, or iOS clients using the same server.

No Supabase, Firebase, Redis, RabbitMQ, Elasticsearch, S3, or proprietary cloud service is required for a default installation.

---

## 2. Goals

### G1 — Best-in-class self-hosted installation

Installation must be understandable by a competent hosting administrator without application-development knowledge.

Target default path:

`Deploy package → create PostgreSQL database → start server → /start/installation → complete wizard → login`

Docker path:

`docker compose up -d → /start/installation → login`

### G2 — High-quality role-specific UX

The interface must not be a generic admin template. Navigation, dashboards, actions, density, terminology, and task priority must adapt by role and device.

### G3 — One product across devices

The project should maximize shared TypeScript/React code while respecting platform-specific interaction needs.

Target platforms:

- Responsive web application.
- Installable PWA.
- Windows.
- macOS.
- Linux.
- Android.
- iOS/iPadOS.

### G4 — Comprehensive school operations

The long-term product scope includes institution management, students, guardians, academics, attendance, exams, fees, accounting, HR/payroll, communication, library, transport, hostel, inventory, documents/certificates, reporting, admissions, LMS/online exams, integrations, and administration.

### G5 — Strong security by default

Authorization must be enforced server-side. The product must support role, permission, and scope controls, secure sessions, audit trails, rate limits, secret handling, secure updates, and hardened installer behavior.

### G6 — Excellent performance at realistic school scale

The system must remain responsive on schools with thousands of active students and large historical datasets. Lists must use server-side pagination/filtering/search rather than downloading full datasets.

### G7 — Sustainable open-source architecture

Core modules must expose stable internal contracts so that contributors can add integrations and optional modules without editing unrelated core code.

---

## 3. Non-goals for initial releases

- No requirement to support every legacy PHP host that cannot run a persistent Node.js process.
- No requirement for 100% offline operation.
- No requirement to share 100% of code across all platforms.
- No requirement to bundle a full accounting ledger in the first usable release.
- No requirement to implement every possible national education board workflow in V1.
- No requirement for Kubernetes in the default deployment.
- No mandatory microservice architecture.
- No mandatory external identity provider.

---

## 4. Personas

### School owner / principal

Needs institution-wide visibility, student/staff trends, fee status, attendance, academic performance, alerts, approvals, and reports.

### Administrator

Needs configuration, admissions, student/staff administration, timetable setup, permissions, communication, reports, and day-to-day operations.

### Teacher

Needs today's classes, attendance, student information within scope, assignments, lesson plans, marks, exams, communication, timetable, and leave.

### Accountant

Needs fee structures, invoices, collection, discounts, refunds, expenses, reconciliation, receipts, exports, and financial reporting.

### HR staff

Needs staff records, attendance, leave, contracts, documents, payroll, and reporting.

### Librarian / transport / hostel / inventory operators

Need narrow operational workspaces with only relevant modules and permissions.

### Student

Needs timetable, attendance, assignments, exams, results, fees, resources, notifications, messages, and profile.

### Parent / guardian

Needs multi-child overview, attendance, fees/payment, assignments, results, transport information, notices, communication, and documents.

### Self-hosting administrator

Needs simple install/upgrade, health diagnostics, backups, logs, mail/storage configuration, and safe recovery tools.

---

## 5. Product principles

1. **Workflow first, module second.** Optimize common jobs, not feature-count screenshots.
2. **Progressive complexity.** New users see the minimum needed; advanced settings remain discoverable.
3. **Role-aware navigation.** Users do not see irrelevant modules by default.
4. **Mobile-native composition.** Mobile is not a scaled desktop sidebar.
5. **Safe defaults.** Destructive actions, permissions, updates, backups, and imports must be conservative.
6. **Fast perceived performance.** Use skeletons, optimistic interaction only where safe, background jobs for expensive work, and responsive transitions.
7. **Accessible interaction.** Keyboard navigation, focus visibility, labels, contrast, reduced motion, and screen-reader semantics are required.
8. **Data integrity over convenience.** Critical academic/financial data must have constraints, idempotency, auditability, and explicit correction flows.
9. **No cloud lock-in.** Default operation requires only the app and PostgreSQL.
10. **Open extension surface.** Integrations and optional modules should not require core forks.

---

## 6. Installation requirements

Detailed requirements are in `prds/001-installer-self-hosting.md`.

Must include:

- Pre-install environment check.
- Database connection test.
- Database privilege verification.
- Schema migration execution.
- Seed data.
- Institution setup.
- First administrator setup.
- Security-secret generation.
- Storage configuration.
- Optional SMTP setup/test.
- Installation transaction/lock semantics.
- Install-state verification.
- Installer lock after successful setup.
- Recovery guidance on partial failure.

---

## 7. Cross-platform requirements

Detailed requirements are in `prds/004-cross-platform-client.md`.

### Web

- Full responsive experience.
- PWA installability where supported.
- Keyboard-first desktop usability.
- Touch-friendly tablet layouts.

### Desktop

- Same server/API.
- Tauri shell.
- Native notifications where supported.
- Deep links.
- Safe file export/import integrations.
- Optional system tray only if it has a real workflow benefit.

### Mobile

- Same server/API.
- Server URL/QR onboarding for self-hosted instance discovery.
- Native camera/file sharing integrations where needed.
- Push-notification adapter architecture.
- Selective offline workflows, beginning with attendance/timetable.

---

## 8. Functional scope — full product

### Foundation

- Installation and onboarding.
- Authentication/session management.
- Users, roles, permissions, scopes.
- Institution/branch management.
- Academic sessions/terms.
- Settings and localization.
- Audit log.
- Notifications.
- Files/storage.
- Jobs/scheduler.
- Updates/backups/health.

### Student lifecycle

- Enquiries and admissions.
- Student records.
- Guardians and relationships.
- Enrollment history.
- Categories/houses.
- Documents.
- Promotion.
- Transfer/withdrawal.
- Alumni.

### Academics

- Classes and sections.
- Subjects.
- Teacher assignments.
- Timetables.
- Curriculum/lesson plans.
- Homework/assignments.
- Resources.

### Attendance

- Student attendance.
- Period attendance.
- Staff attendance.
- Leave.
- Late/early records.
- Future QR/RFID/biometric adapters.

### Examination

- Exam groups/types.
- Schedules.
- Marks.
- Grades/scales.
- Remarks.
- Result publishing.
- Report cards/transcripts.
- Online exams in later release.

### Finance

- Fee types/groups/structures.
- Student fee assignment.
- Invoices.
- Discounts/concessions.
- Fines.
- Collection.
- Receipts.
- Refunds.
- Payment gateway abstraction.
- Expenses/income.
- Reconciliation.
- Financial reports.

### HR

- Staff records.
- Departments/designations.
- Contracts/documents.
- Attendance.
- Leave.
- Payroll.
- Salary slips.

### Communication

- Announcements.
- Internal messages.
- Email.
- SMS adapters.
- WhatsApp adapters.
- Push notifications.
- Templates.
- Delivery/event logs.

### Operations

- Library.
- Transport.
- Hostel.
- Inventory/assets.
- Front office.

### Documents

- Template system.
- IDs.
- Certificates.
- Admit cards.
- Receipts.
- Mark sheets.
- Salary slips.
- QR verification.

### Reporting

- Role-scoped report catalog.
- Filters and saved reports.
- CSV/XLSX/PDF exports.
- Asynchronous heavy reports.
- Audit and operational reports.

---

## 9. Release strategy

### Milestone 0 — Platform foundation

- Monorepo.
- CI.
- API conventions.
- Database migration framework.
- Design system foundations.
- Authentication/security skeleton.
- Installer skeleton.

### Milestone 1 — Installable alpha

- `/start/installation` complete.
- Login/session.
- Institution/branch/session setup.
- Roles/permissions/scopes foundation.
- Audit foundation.
- Health page.

### Milestone 2 — School core alpha

- Students.
- Guardians.
- Classes.
- Sections.
- Subjects.
- Staff/teacher basics.
- Enrollments.

### Milestone 3 — Daily operations beta

- Timetable.
- Attendance.
- Homework/assignments.
- Announcements.
- Basic reporting.

### Milestone 4 — Finance + exams beta

- Fees/invoices/collection/receipts.
- Exams/marks/grades/results.
- Parent/student portal maturity.

### Milestone 5 — Cross-platform beta

- PWA quality gate.
- Desktop Tauri builds.
- Android/iOS builds.
- QR server onboarding.
- Selective offline attendance.

### Milestone 6 — Production 1.0

- Backup/restore.
- Safe updater/migration workflow.
- SMTP and notification framework.
- Import/export.
- Security review.
- Performance testing.
- Accessibility review.
- Documentation.

Later releases add HR/payroll, library, transport, hostel, inventory, LMS, online exams, advanced integrations, and country-specific extensions.

---

## 10. Success metrics

### Installation

- Clean default installation completes without manual SQL execution.
- Failed installation explains the exact failure and remains recoverable.
- Existing successful installations cannot re-run privileged installer actions.

### UX

- Common teacher workflow: open app → find class → take attendance in minimal interaction steps.
- Parent can identify outstanding fees and pay/view invoice without navigating through admin terminology.
- Role navigation contains no unauthorized modules.

### Reliability

- Financial and marks mutations use idempotency/transaction semantics where applicable.
- Database migrations are versioned and repeatable.
- Backup restore is tested against supported releases.

### Performance budgets

Initial engineering targets, to be validated with realistic infrastructure:

- Normal list/filter API p95 target under 300 ms on reference deployment.
- Perceived route transitions under 200 ms for cached/reference-data navigation.
- No unbounded list endpoints.
- No core screen requires loading all historical school data.

### Quality

- P0 security issues: zero at release.
- Critical core E2E paths covered.
- Mobile/tablet/desktop layouts reviewed for every core module before release.

---

## 11. Accessibility baseline

Target WCAG 2.2 AA for core workflows.

Required patterns include:

- Visible focus.
- Keyboard navigation.
- Correct semantic controls.
- Accessible form errors.
- Meaningful labels.
- Color not used as the only status indicator.
- Touch target sizing.
- Reduced motion handling.
- Screen reader announcements for asynchronous validation/status where needed.

---

## 12. Localization and regionalization

Architecture must support:

- Multiple languages.
- RTL readiness.
- Date/time/timezone configuration.
- Currency and number formatting.
- Academic-year configuration.
- Country-specific address fields.
- Pluggable payment and communication providers.

Do not embed India-specific assumptions in core domain logic even if India is an early target market.

---

## 13. Data ownership and privacy

- Self-hosting institution owns its data.
- Export mechanisms must exist for core records.
- Logs should avoid leaking secrets or unnecessary sensitive values.
- User-facing privacy controls and retention rules will be configurable in later milestones.
- Sensitive fields must be explicitly classified before implementation.

---

## 14. Open-source expectations

Repository should contain at minimum:

- README.md
- LICENSE
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SECURITY.md
- CHANGELOG.md
- ROADMAP.md
- ARCHITECTURE.md
- local-development documentation
- deployment documentation
- migration/upgrade documentation
- API documentation

License choice remains an explicit decision in `decision.md`.

---

## 15. Definition of 1.0

Version 1.0 is not "all conceivable school modules." It is the first version that is safe and complete enough to run core school operations without developer intervention.

1.0 requires:

- Stable installer.
- Stable upgrade path.
- Authentication and scoped permissions.
- Institution/academic configuration.
- Student/guardian management.
- Staff/teacher basics.
- Classes/sections/subjects/timetable.
- Attendance.
- Homework/assignments.
- Fees/invoicing/receipts.
- Exams/marks/results.
- Parent/student/teacher/admin experiences.
- Notifications foundation.
- Reports/export foundation.
- Backup/restore.
- Health diagnostics.
- Responsive web/PWA.
- Production-grade documentation.

Desktop/mobile packaged apps may be released as 1.0 if stable; otherwise the API and shared client must already be designed so they can follow without a rewrite.
