# PROJECT_TRACKER.md — Live Execution Board

**Project status:** `IN PROGRESS`  
**Primary milestone:** `M0 — Product & Architecture Foundation`  
**Parallel foundation:** `M1 — dependency-independent installer + authorization foundations`  
**Last updated:** 13 August 2026

## 1. Milestone status

| Milestone | State | Completion | Exit gate |
|---|---|---:|---|
| M0 Product & Architecture Foundation | IN PROGRESS | 57% | Architecture POCs + reproducible quality gates + usable design foundations |
| M1 Installable Platform Alpha | IN PROGRESS (parallel foundation) | 21% | Installer + auth + permissions + health |
| M2 Students & Academic Core | NOT STARTED | 0% | Academic structure + secure student lifecycle |
| M3 Daily Operations | NOT STARTED | 0% | Timetable + attendance + assignments + announcements |
| M4 Fees & Examinations | NOT STARTED | 0% | Financial/exam integrity gates |
| M5 Cross-Platform & Offline Beta | NOT STARTED | 0% | Desktop/mobile + selective offline |
| M6 Production 1.0 Hardening | NOT STARTED | 0% | Security + backup + upgrade + docs + release |

Percentages are task-state progress, not production-feature percentages.

## 2. Active / blocked work

- **M0-003 replacement name:** current codename rejected as final brand; external screening required.
- **M0-031 Drizzle/PostgreSQL POC:** real registry + PostgreSQL execution required; static SQL is not completion evidence.
- **M0-052..059 UI primitives:** blocked by unresolved React/Vite dependency environment; specs are complete.
- **M0-061 design catalog:** docs exist; executable real-component catalog still required.
- **M1-002 / M1-038 installer integration:** REVIEW until committed Fastify/Vitest suites execute with actual dependencies.
- **M1-033 permission seed:** IN PROGRESS / DB blocked; versioned permission catalog is ready as seed source.
- **M1-066 unauthorized API suite:** still requires real protected routes and authoritative actor/scope loading.

## 3. Completed M0 foundation

- Product/security baseline M0-001/M0-002/M0-005.
- Repository/tooling M0-010..021.
- Fastify POC M0-030 PASSED before Actions pause.
- Platform contracts M0-070..078 complete (9/9).
- Design definition M0-050/M0-051/M0-060 complete; M0-052..059 specs ready.

## 4. Completed M1 installer/security foundation

DONE: M1-001, M1-003, M1-004, M1-005, M1-030, M1-036, M1-037 and M1-085.  
Evidence: `apps/server/src/installation/` and `docs/pocs/installer-foundation.md`.

## 5. Completed M1 authorization foundation

Evidence: `apps/server/src/authorization/` and `docs/pocs/authorization-foundation.md`.

- **M1-060 permission registry DONE:** stable versioned namespaced IDs; unknown permissions fail closed.
- **M1-061 default role templates DONE:** 12 PRD templates; runtime never branches on role names; scope strategy is enforced; full-permission template explicitly enumerates the current catalog.
- **M1-062 server authorization service DONE:** explicit grants + trusted target context, disabled-user denial, bulk all-target authorization, generic 403 boundary.
- **M1-063 scope POC DONE:** institution/branch/session/class/subject dimensions plus own-record and linked-child relations; missing/empty dimension context fails closed.

### Authorization trust boundary

Actor relationships and target scope must come from authoritative server-side resolution. Client-supplied IDs are not proof of ownership, school membership, class assignment, or guardian linkage.

### Executed evidence

No GitHub Actions or new dependencies were used. A strict local TypeScript compile and executable Node harness passed catalog consistency, scope-escalation rejection, teacher assignment boundaries, disabled actors, unknown permissions, student self-access, guardian linked-child access, bulk denial, and stable 403 behavior. Permanent Vitest tests encode the same invariants.

## 6. Next long-tranche order

1. M0-031 real Drizzle/PostgreSQL proof.
2. M0-004 Node/PostgreSQL support matrix.
3. Execute M1-002/M1-038 installer Fastify/Vitest verification outside Actions.
4. M1-013 + M1-031..035 DB-backed installer work after M0-031.
5. M1 identity persistence/auth M1-050..059, consuming the completed authorization service.
6. M1-052 persistence + M1-066 protected API attack suite, then M1-064 RLS decision from real DB context evidence.
7. M0-032..038 Tauri POCs then M0-039 architecture lock.
8. M0-052..059 + M0-061 React design system once dependencies resolve normally.
9. M0 gate review.

## 7. Open decisions

ADR-006 Vite, ADR-007 Tauri, ADR-008 Fastify final lock, ADR-009 Drizzle, ADR-012 PostgreSQL jobs, ADR-015 RLS, ADR-020 OpenAPI typed-client evidence, ADR-023 replacement brand, ADR-025 auth transport, ADR-026 finance scope.

## 8. Risk focus

Critical controls now explicitly cover installer lock/CSRF/secrets, no hardcoded role authorization, no silent new-permission escalation, fail-closed missing scope, trusted server-side target resolution, cross-institution leakage prevention, and honest REVIEW state while Actions are paused.

## 9. Repository policy

Direct-to-`main` only; no branches/PRs; no new Actions; existing Actions manual-only; no bot commits; no hand-edited lockfile; one coherent final commit per tranche.

## 10. Resume pointer

> Continue in long tranches. M0-031 remains the primary architecture blocker. Installer core M1-001/003/004/005/030/036/037/085 is DONE; M1-002/M1-038 remain REVIEW. Authorization M1-060..063 is DONE with executable core evidence; M1-033 is seed-ready but DB-blocked and M1-066 still requires protected API integration. Never hardcode role names, trust client scope IDs, hand-edit dependencies, use GitHub Actions while quota is paused, or create permanent branding under the temporary codename.
