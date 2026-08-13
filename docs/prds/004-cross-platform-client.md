# PRD-004 — Web, PWA, Desktop, Android & iOS Client

**Priority:** P1 architecture, P2 packaging until core workflows mature

## Goal

Deliver one coherent product experience across supported devices while maximizing shared React/TypeScript code and preserving native-platform quality.

## Shared client

Shared:

- routes/feature screens where form factor permits;
- domain-aware components;
- design tokens;
- API client;
- validation for user-facing input;
- query caching;
- permissions/navigation model;
- localization;
- formatting;
- business presentation rules.

Platform-specific:

- secure storage;
- push/native notifications;
- file system;
- deep links;
- camera/QR scanning;
- share sheet;
- app lifecycle/background tasks;
- app update channel;
- OS integration.

## Web

- responsive browser app;
- keyboard navigation;
- installable PWA where supported;
- service worker only after explicit caching rules;
- no caching of sensitive APIs by default.

## Desktop

Tauri target:

- Windows;
- macOS;
- Linux.

Initial native features:

- secure server connection profile;
- native notifications;
- file export/save;
- deep links;
- app version/diagnostics.

Do not add tray behavior unless a workflow requires persistent background presence.

## Mobile

Tauri target:

- Android;
- iOS/iPadOS.

Required POC before framework decision is fully locked:

- build/sign app;
- connect to self-hosted HTTPS server;
- QR scan server configuration;
- login + secure credential persistence;
- native camera/file flow;
- notification POC;
- offline attendance POC;
- deep-link handling.

## Server discovery/onboarding

First app run:

- enter server URL OR scan setup QR;
- normalize URL;
- call `/instance/meta` safe endpoint;
- display school name/logo/server identity;
- validate API compatibility;
- warn clearly on invalid TLS/unsupported version;
- proceed to login.

QR must not contain reusable admin secrets.

## Navigation

### Desktop

- left navigation;
- global command/search;
- contextual top actions;
- efficient tables and shortcuts.

### Mobile

Bottom navigation is role-specific and limited to high-frequency destinations.

Example teacher:

- Home;
- Classes;
- Attendance/Create action;
- Messages;
- Me.

Secondary modules are reachable through structured menus, not dozens of bottom tabs.

## Offline attendance

Cache only necessary roster/session metadata.

Local record includes:

- local operation ID;
- target attendance session/date;
- student ID;
- status;
- client timestamp;
- base version/etag if conflict strategy uses it;
- sync state.

On reconnect:

- authenticate;
- submit batched idempotent operations;
- server checks permissions and current state;
- resolve/report conflicts;
- clear successful local queue.

## Accessibility

Shared component system must preserve labels/focus/keyboard semantics on web. Mobile/desktop shells must not remove OS accessibility behavior from the web view.

## Acceptance criteria

- Same user can connect browser + desktop + mobile clients to same self-hosted server.
- UI is responsive rather than simply scaled.
- QR onboarding contains no credential secret.
- Unsupported server/client version gets a clear compatibility message.
- Mobile POC completes attendance offline and syncs correctly after reconnect.
