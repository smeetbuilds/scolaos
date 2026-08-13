# Pagination, Filtering and Sorting Contract

**Task:** M0-071  
**Status:** ACCEPTED  
**Effective:** 13 August 2026

## Purpose

Define one predictable collection-query contract for admin tables, mobile lists, reports and future external integrations without coupling clients to database pagination details.

## Collection response

Paginated endpoints return a normal success envelope with collection metadata:

```json
{
  "data": [],
  "meta": {
    "requestId": "...",
    "page": {
      "limit": 25,
      "nextCursor": "opaque-or-null",
      "previousCursor": null,
      "hasMore": false
    }
  }
}
```

Rules:

- `data` is always an array for collection endpoints.
- `meta.requestId` follows the request-correlation contract.
- Cursor values are opaque client tokens. Clients must never parse, synthesize or mutate them.
- `nextCursor`/`previousCursor` are `null` when unavailable.
- `hasMore` describes forward availability only; it is not a total-count substitute.
- Exact totals are optional because they can be expensive or misleading on highly mutable datasets.

## Query parameters

Baseline parameters:

- `limit` — requested page size.
- `cursor` — opaque continuation cursor supplied by a previous response.
- `sort` — comma-separated ordered sort fields; prefix a field with `-` for descending order.
- `q` — endpoint-defined free-text search when supported.
- Endpoint-specific filter parameters use explicit documented names such as `status`, `branchId`, `classId`, `fromDate` and `toDate`.

Do not expose arbitrary SQL column names or generic unvalidated `filter[field]=...` access to every table column.

## Page size

- Default page size: `25` unless an endpoint documents a smaller operational default.
- Normal hard maximum: `100`.
- Larger export/report workloads use asynchronous export/report jobs rather than bypassing pagination with huge page sizes.
- Invalid limits return `400 VALIDATION_ERROR` rather than being silently coerced to surprising values.

## Cursor semantics

Cursor pagination is the default for mutable operational lists such as students, payments, attendance records and audit events.

A cursor must bind to enough server-side state to make continuation deterministic, including the effective sort and a unique tie-breaker. The implementation may encode this state, but the token remains opaque to clients.

Rules:

- cursors are scoped to the endpoint/query shape that created them;
- reusing a cursor with different filters/search/sort must fail safely rather than return an undefined page;
- tenant/institution scope must never be weakenable by editing or replaying a cursor;
- cursor contents must not expose secrets or become an authorization mechanism;
- ordering must include a deterministic unique tie-breaker, typically an immutable ID;
- a deleted boundary record must not make the cursor unsafe or broaden authorization scope.

## Offset pagination

Offset/page-number pagination is not the default API contract for mutable core records. It may be used for static snapshots, small reference datasets or explicitly materialized reports where random page access is a real requirement.

Endpoints using offset semantics must document that exception and must not pretend offset pages are stable while records are concurrently inserted/deleted.

## Sorting

Example:

```text
?sort=-createdAt,name
```

means `createdAt DESC`, then `name ASC`.

Rules:

- each endpoint has an allow-list of sortable fields;
- unknown sort fields return `400`;
- server-defined deterministic fallback ordering is mandatory;
- a unique final tie-breaker is appended internally when the public sort is not unique;
- clients must not depend on database default row order;
- locale-sensitive or domain-specific sorting must be documented rather than inferred from raw database collation.

## Filtering

Filters are typed endpoint contracts, not arbitrary query fragments.

Rules:

- every filter is documented in OpenAPI with its type/format;
- unknown filter names should fail instead of being silently ignored when they indicate a client contract mistake;
- date filters use explicit inclusive/exclusive semantics documented per field;
- identifiers are exact-match by default;
- list filters must define OR/AND semantics explicitly;
- authorization scope is applied independently of client filters and cannot be broadened by them;
- empty-string behavior is explicit; it must not accidentally mean “all tenants/all branches.”

## Search

`q` is reserved for endpoint-defined human search. It is not a raw database expression.

Search behavior must document which fields participate and whether matching is prefix, token, normalized or exact. Sensitive fields must not become searchable merely because they exist in the database.

## Totals

When a product workflow genuinely needs an exact total, expose it as `meta.page.total` only after the server has deliberately computed it. Absence of `total` is normal and clients must not infer `0`.

Approximate totals, if introduced later for very large reports, must be labeled as approximate and must not reuse the exact `total` field.

## Error behavior

Invalid cursor, limit, sort or filter syntax uses the M0-070 error envelope, normally with HTTP `400` and a stable machine code such as `INVALID_CURSOR` or `VALIDATION_ERROR`.

A cursor that refers to data the actor can no longer access must not reveal whether restricted records still exist.

## Client behavior

Clients must:

- preserve returned opaque cursors exactly;
- reset pagination when search/filter/sort changes;
- avoid assuming total counts exist;
- merge/invalidate pages deliberately after mutations rather than relying on positional indices;
- treat server ordering as authoritative.

## Exports and bulk operations

Large exports are not “pagination with limit=100000”. They should become jobs that capture the actor, scope, normalized query and export format, then produce an authorized downloadable artifact.

Bulk mutation endpoints should use explicit selection semantics (IDs or a server-side query snapshot) rather than ambiguous “everything currently visible on page N”.

## Compatibility

Adding a new optional filter or sortable field is additive. Removing a published field, changing sort meaning, changing cursor semantics incompatibly, or changing an existing filter type is governed by M0-072.

## Acceptance

M0-071 is complete as a contract task because this document locks the collection-query semantics required by server/client implementations. Endpoint implementations must later prove schema validation, authorization scoping, stable cursor behavior and performance in their module-specific tests.