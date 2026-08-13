# PRD-003 — Institution, Student Lifecycle & Academic Core

**Priority:** P1

## Goal

Deliver the minimum coherent academic data model on which attendance, fees, exams, reporting, parent/student portals, and later modules can safely depend.

## Institution

Entities:

- institution;
- branch/campus;
- academic session/year;
- term/semester;
- holiday/calendar;
- department optional in core;
- room/building later unless timetable requires it.

Requirements:

- exactly one active/default session per configured policy;
- historic sessions remain queryable;
- operations that depend on academic session always record it explicitly.

## Student

Core fields must be extensible and avoid embedding a single country's assumptions.

Core concepts:

- student person/profile;
- admission record;
- admission number;
- enrollment;
- guardian relationships;
- address/contact;
- documents;
- status;
- house/category optional;
- previous school/history optional;
- medical/sensitive fields separately permissioned.

## Guardian relationships

Support:

- multiple guardians per student;
- one guardian linked to multiple children;
- relationship type;
- primary contact flags;
- portal access flags;
- custody/access restrictions as a later carefully designed capability.

## Academic structure

- class/grade;
- section;
- class-section instance;
- subject;
- subject offering for session/class;
- teacher assignment;
- enrollment into class-section;
- optional elective subject assignment.

## Student lifecycle

Flows:

### Admission

- capture applicant/student info;
- assign admission number;
- create guardian links;
- create enrollment;
- upload documents;
- audit creation.

### Promotion

- preview target session/class;
- validate duplicates/conflicts;
- batch promote;
- preserve historical enrollment;
- produce outcome report.

### Transfer/withdrawal

- explicit effective date;
- reason;
- status change;
- preserve historic attendance/fees/results;
- optionally produce transfer documents later.

### Alumni

Graduated students retain historical records with reduced active operational visibility.

## Search/list UX

Student list must support server-side:

- search by name/admission number/guardian contact as allowed;
- branch/session/class/section/status filters;
- sorting on allowlisted fields;
- pagination;
- saved views later.

## Student profile UX

Profile is an operational workspace, not a single giant form.

Suggested sections:

- Overview;
- Enrollment;
- Guardians;
- Attendance;
- Fees;
- Academics/results;
- Documents;
- Notes/history (permissioned);
- audit/history where appropriate.

## Acceptance criteria

- Historical enrollment remains intact after promotion.
- Duplicate admission number rules are enforced at DB layer according to institution policy.
- Guardian can link to multiple children without duplicate user identities.
- Lists perform server-side pagination/search.
- Out-of-scope users cannot retrieve student profile by guessing ID.
- Mobile student profile has usable prioritized content rather than desktop tabs overflowing horizontally.
