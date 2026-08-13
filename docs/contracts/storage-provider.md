# Storage Provider Contract

**Task:** M0-074  
**Status:** ACCEPTED  
**Effective:** 13 August 2026  
**Related:** ADR-011, ADR-013, M0-070, M0-077

## Purpose

Define one private-file storage abstraction that works with the default local filesystem deployment and optional S3-compatible providers without leaking provider-specific behavior into school modules.

## Ownership model

The application owns authorization, metadata and business relationships. The storage provider owns bytes at an opaque object key.

A database record should retain business metadata such as:

- object ID;
- provider key;
- institution/owner relationship;
- original display filename;
- normalized media type;
- byte size;
- checksum when available;
- created timestamp;
- lifecycle/status metadata.

The provider must never be used as the authoritative index of which files a user is allowed to see.

## Private by default

All uploaded application files are private by default.

- local files live outside a directly web-served public directory;
- S3-compatible buckets/objects are private unless an explicitly reviewed public-asset use case says otherwise;
- normal downloads pass through an authorized application endpoint or a tightly scoped temporary access mechanism;
- possession of an object key is not authorization.

## Provider interface

Conceptual contract:

```ts
interface StorageProvider {
  put(input: PutObjectInput): Promise<StoredObject>;
  stat(key: string): Promise<StoredObjectMetadata | null>;
  openRead(key: string, options?: ReadOptions): Promise<ReadableObject>;
  delete(key: string): Promise<void>;
  healthCheck(): Promise<StorageHealth>;
}
```

Optional capabilities such as ranged reads or temporary signed access are advertised explicitly rather than assumed by all providers.

## Object keys

Object keys are application-generated opaque identifiers.

Rules:

- never derive a provider path directly from an untrusted original filename;
- reject path traversal/separator tricks at application boundaries;
- keys must not contain secrets;
- keys should be stable across metadata display-name changes;
- provider prefixes may encode installation/environment organization but must not become an authorization model.

## Writes

`put` must behave atomically from the application perspective: success means the complete object is available; failure must not expose a partially written object under the final key.

Local implementations should use temporary files plus an atomic finalization strategy where the filesystem permits it. S3-compatible implementations should rely on complete-object/multipart completion semantics.

The caller supplies expected media/size policy; the provider does not trust a filename extension to establish content type.

## Reads

The application authorizes the actor before opening bytes.

`openRead` returns bytes/stream plus safe metadata needed for response headers. It must not return provider credentials or permanent public URLs.

Range reads may be implemented for large media/documents, but unsupported range behavior must be explicit rather than silently returning corrupted partial content.

## Delete

Delete is idempotent: deleting a missing object is considered successfully absent unless a provider-level safety failure prevents determination.

Business deletion policy belongs above the provider. A module may need retention/soft-delete/audit rules before calling physical deletion.

## Temporary access

A provider may offer a temporary signed-read capability, but core modules cannot require it because the default local filesystem provider has no native signed-URL primitive.

When temporary direct access is used:

- authorization happens before URL issuance;
- lifetime is short and purpose-scoped;
- URL/token values are treated as secrets and not written to normal logs;
- response headers/content disposition are constrained;
- revocation limitations are understood by the calling module.

## Integrity

Where practical, persist a cryptographic checksum after upload and verify it during backup/restore or suspicious transfer failures.

Checksums are integrity signals, not malware scanning.

## File validation and malware boundary

Storage accepts bytes; application upload policy validates:

- allowed file type;
- size limits;
- content/header consistency where necessary;
- document/image parsing safety;
- future malware/quarantine policy.

A future scanning service may transition an object through quarantine/ready states. Files must not become user-accessible merely because the provider upload succeeded if policy requires scanning.

## Multi-institution safety

Metadata queries always enforce institution/branch/permission scope. Provider keys should be unguessable enough to reduce accidental collision/enumeration, but authorization must remain independent.

Cross-institution copies/moves are business operations that create new authorized metadata relationships; they are not raw provider renames performed from client input.

## Backups and restore

Default self-host backup includes both PostgreSQL data and local provider bytes.

A restore is complete only when database metadata and referenced storage objects are mutually consistent. Backup/restore tooling must detect missing referenced objects and orphaned bytes rather than silently declaring success.

S3-compatible deployments document whether object backups/versioning are external or managed by the product.

## Provider configuration

Configuration is server-side and secret values are never returned to clients.

Local provider configuration needs a writable private root. S3-compatible configuration includes endpoint/region/bucket and credentials through the secret configuration system.

The installer/health service must test provider reachability and required permissions before declaring configuration healthy.

## Failure semantics

Provider errors are normalized into application errors such as unavailable, not-found, quota/capacity, permission/configuration and integrity failures. Raw SDK errors, credentials, bucket policies or filesystem paths are not exposed to users.

Retry only operations that are safe/idempotent under the specific failure mode.

## Portability

Core module code must not assume:

- POSIX filesystem paths;
- S3 ETags equal content hashes;
- bucket listing is cheap/complete enough to be an application database;
- provider rename/move exists;
- permanent public URLs exist.

## Acceptance

M0-074 is complete as an interface-definition task because private-by-default behavior, object ownership, provider methods, atomicity, portability, authorization separation and backup implications are now explicit. The local and S3-compatible adapters are later implementation tasks and must be tested independently.