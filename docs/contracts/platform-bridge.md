# Platform Bridge Contract

**Task:** M0-073  
**Status:** ACCEPTED  
**Effective:** 13 August 2026  
**Related:** ADR-007, ADR-016, ADR-017, ADR-018

## Purpose

Give shared React/TypeScript features one stable way to access platform capabilities without scattering browser/Tauri/native conditionals throughout the product.

This contract does not assert that Tauri POCs have passed. It defines the seam those POCs and the web implementation must satisfy.

## Core principle

Feature code depends on a `PlatformBridge` capability surface. Platform implementations depend on browser/Tauri/native APIs.

```text
feature UI/domain
      |
      v
PlatformBridge
  |          |
  v          v
web       native shell
```

No feature module should import a native plugin merely because it needs a file, camera or notification action.

## Capability discovery

The bridge exposes explicit capability discovery rather than relying on user-agent/platform-name checks.

Conceptual shape:

```ts
interface PlatformCapabilities {
  secureStorage: boolean;
  camera: boolean;
  qrScan: boolean;
  fileOpen: boolean;
  fileSave: boolean;
  notifications: boolean;
  deepLinks: boolean;
  share: boolean;
  connectivity: boolean;
}
```

A feature must handle an unsupported capability as a normal product state.

## Bridge surface

The initial bridge is composed of focused services, conceptually:

```ts
interface PlatformBridge {
  readonly capabilities: PlatformCapabilities;
  readonly secureStorage: SecureStorageBridge;
  readonly camera: CameraBridge;
  readonly files: FileBridge;
  readonly notifications: NotificationBridge;
  readonly deepLinks: DeepLinkBridge;
  readonly connectivity: ConnectivityBridge;
  readonly share: ShareBridge;
}
```

Implementations may use separate modules internally; the shared application sees a coherent injected bridge.

## Common result/error model

Platform failures must be normalized into stable machine outcomes rather than leaking plugin/library exceptions.

Baseline categories:

- `UNSUPPORTED`
- `PERMISSION_DENIED`
- `CANCELLED`
- `UNAVAILABLE`
- `INVALID_INPUT`
- `IO_ERROR`
- `SECURITY_ERROR`
- `UNKNOWN`

User cancellation is not treated as an application crash.

Errors must not contain secrets, private filesystem paths, tokens or raw provider payloads in user-facing messages.

## Secure storage

Native secure storage is intended for device credentials/session secrets that genuinely require OS-backed protection.

Rules:

- web must not emulate native secure storage with localStorage;
- browser authentication should use the web session transport selected by ADR-025;
- native implementation must use the approved OS/Tauri secure-storage mechanism after M0-036 proves it;
- keys are application-defined opaque identifiers;
- values are never logged;
- delete is idempotent;
- unavailable/locked device storage returns a normalized error.

## Camera / QR

Camera access is permission-aware and user initiated.

Rules:

- capability checks happen before presenting required workflows;
- permission prompts occur only in context of an understandable user action;
- denied permission produces a recoverable state with settings guidance where the platform supports it;
- QR results are untrusted input and require normal application validation;
- feature code consumes decoded payloads, not native camera objects.

## Files

File operations distinguish user-selected imports from application-generated exports.

Bridge concepts:

- open/select file with accepted types and size guidance;
- save/export bytes or a stream with suggested filename/type;
- optional temporary-file handling internal to the implementation.

Rules:

- user filenames never become trusted server storage paths;
- file handles/native paths are not persisted as portable identifiers;
- imported content is validated after selection;
- exported sensitive data must use explicit user action and product authorization before the bridge is called.

## Notifications

The platform notification bridge controls device-level notification permission/token plumbing. It does not decide business recipients or render arbitrary server content directly.

Business notification semantics live in M0-075.

Rules:

- permission requests are contextual;
- native push tokens are treated as sensitive device identifiers;
- token refresh/invalidations must be surfaced to the application registration layer;
- clicking a notification resolves through the deep-link/navigation contract rather than arbitrary code execution.

## Deep links

Deep links are parsed into a small allow-listed application navigation model.

- unknown routes fail safely;
- authentication/authorization is re-evaluated after navigation;
- links never grant access by possession alone;
- external URL opening is explicit and separated from internal app navigation.

## Connectivity

Connectivity is advisory, not proof that the server is reachable.

The bridge can expose current network state and change subscriptions, but business requests still handle real HTTP failures.

Offline workflows must not mark writes synchronized merely because the device reports “online.”

## Share

Share/export uses the platform-native share sheet when supported and a web fallback otherwise.

Sensitive report/document sharing still requires application-layer authorization and deliberate user action.

## Lifecycle and subscriptions

Subscriptions such as connectivity/deep-link listeners must return an unsubscribe/dispose handle. Feature teardown must not leave duplicate native listeners running.

## Dependency injection

The bridge should be created at application bootstrap and injected through a narrow application context/provider. Tests can supply deterministic fakes.

Do not introduce a global mutable singleton that makes capability behavior impossible to isolate in tests.

## Platform-specific code

Platform-specific implementation is allowed and expected under ADR-017. The goal is not 100% shared code; the goal is to keep platform differences behind intentional interfaces.

## Security boundary

The bridge is not an authorization service. A successful file/camera/storage/native call does not prove the current user is allowed to perform the corresponding school operation.

Server authorization remains authoritative.

## Change discipline

Adding an optional capability is additive. Renaming/removing a capability or changing normalized error meaning requires coordinated client compatibility handling.

## Acceptance

M0-073 is complete as an interface-definition task because the shared capability model, normalized failures, ownership boundaries and security rules are now locked. Tauri desktop/mobile, camera, secure-storage and notification POCs remain separate executable gates and must prove concrete implementations against this contract.