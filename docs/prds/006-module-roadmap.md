# PRD-006 — Complete Module Roadmap

This document defines intended functional coverage, not a promise that every item ships in 1.0.

## Tier A — 1.0 core

### Platform

- Installer.
- Authentication.
- Users/roles/permissions/scopes.
- Institution/branch/session settings.
- Audit logs.
- Storage.
- Jobs/scheduler.
- Email/in-app notification foundation.
- Health diagnostics.
- Backup/restore.
- Import/export foundation.

### People

- Students.
- Guardians.
- Staff/teacher basics.
- Admissions.
- Student documents.
- Enrollment/promotion/withdrawal.

### Academics

- Classes.
- Sections.
- Subjects.
- Teacher assignment.
- Timetable.
- Homework/assignments.

### Attendance

- Student daily attendance.
- Basic staff attendance.
- Leave basics.

### Fees

- Fee types/groups.
- Fee structures.
- Student invoices/dues.
- Discounts/concessions.
- Manual/online payment recording abstraction.
- Receipts.
- Refund/correction controls.
- Core reports.

### Exams

- Exam setup.
- Schedule.
- Marks.
- Grading scale.
- Result publish.
- Report card.

### Portals

- Admin.
- Teacher.
- Student.
- Parent.
- Accountant.

### Reporting

- student roster;
- attendance;
- fees due/collection;
- exam result;
- basic staff;
- audit export.

## Tier B — post-1.0 operational depth

### HR/payroll

- departments/designations;
- contracts;
- staff attendance depth;
- leave workflows;
- payroll;
- salary slips;
- payroll reports.

### Library

- catalog;
- copies;
- issue/return;
- fine;
- reservation;
- member history.

### Transport

- routes;
- stops;
- vehicles;
- drivers;
- student assignments;
- fees;
- tracking adapter architecture.

### Inventory/assets

- products/items;
- categories;
- suppliers;
- stock transactions;
- issue/return;
- assets;
- purchase orders.

### Front office

- enquiry;
- visitor;
- appointments;
- phone/postal logs;
- complaints.

### Documents/certificates

- template designer;
- ID cards;
- certificates;
- admit cards;
- QR verification.

## Tier C — advanced modules

### Hostel

- hostels/buildings;
- rooms/beds;
- allocation;
- visitor/leave workflows;
- fees.

### LMS

- courses;
- lessons;
- resources;
- video/content links;
- quizzes;
- progress.

### Online examinations

- question bank;
- exam delivery;
- timing;
- randomization;
- autosave;
- subjective/objective evaluation.

### Advanced attendance

- period attendance;
- QR;
- RFID;
- biometric adapter;
- device sync.

### Communication ecosystem

- SMS providers;
- WhatsApp providers;
- push notification providers;
- emergency alerts;
- communication campaigns.

### Payments

Adapters for regional/global payment gateways. Payment provider implementation is not hardwired into fee domain.

## Tier D — ecosystem/enterprise

- OIDC/SAML SSO.
- multi-institution control plane.
- custom domains/hosted edition if ever desired.
- advanced analytics/data warehouse export.
- webhooks.
- public integration API.
- module/plugin SDK.
- country/board-specific academic extensions.
- accounting integration adapters.
- Google/Microsoft classroom/calendar integrations.

## Module quality gate

Every new module must define:

- personas;
- workflow map;
- permissions;
- data model;
- audit events;
- API contract;
- responsive UX;
- empty/loading/error states;
- imports/exports if relevant;
- report needs;
- accessibility considerations;
- performance dataset;
- unit/integration/E2E tests;
- migration behavior;
- documentation.
