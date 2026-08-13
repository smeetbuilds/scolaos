# Decision Amendments

This file records material decision corrections discovered after the baseline `docs/decision.md` log was committed. These amendments are authoritative where they explicitly supersede an older ADR statement and must be folded back into the main decision log during documentation normalization.

---

## ADR-023 Amendment — Project name/brand

**Effective:** 13 August 2026  
**Status:** REJECTED AS FINAL BRAND / replacement OPEN  
**Supersedes:** the provisional assumption that `ScolaOS` can continue as the eventual public product name.

### Evidence

A current conflict screen found an unrelated, active school-software product already using the exact **ScolaOS** name at `scolaos.com`, including current attendance and student-information product content in the same broad market.

Evidence and scope are recorded in `docs/brand-screening.md`.

### Decision

`ScolaOS` may remain the temporary repository/engineering codename while a replacement is selected, but it is **rejected as the final public product brand**.

The repository must not create additional permanent branding dependencies on this name before replacement-name screening is complete.

### Consequences

- `M0-003` remains IN PROGRESS until a replacement name passes product/domain/namespace screening and appropriate trademark clearance.
- Do not register final domains, publish final package namespaces, create app-store listings, signing identities, launch assets or permanent design-system branding under ScolaOS.
- Do not rename the repository automatically as part of this amendment; coordinate that migration only after a replacement is explicitly selected.
- Engineering identifiers should remain reasonably renameable until the brand decision closes.
- This is a product-conflict decision, not a legal finding of trademark infringement.

---

## Amendment normalization rule

When `docs/decision.md` is next normalized, replace ADR-023 with this decision without changing unrelated accepted ADRs.
