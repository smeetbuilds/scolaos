# Brand and Name Screening

**Task:** M0-003  
**Status:** IN PROGRESS — current working name rejected as final brand  
**Screened:** 13 August 2026

## Finding

The exact name **ScolaOS** is already being used by an unrelated, active school-software product at `https://scolaos.com/`.

Current public pages under that domain use the ScolaOS name for school attendance, student information, fees, examinations, parent communication, multi-branch administration and related education-software workflows. The site identifies its product as ScolaOS and attributes it to Terra System Labs Pvt Ltd.

This is a direct product-category and exact-name conflict, not merely a similar spelling in an unrelated industry.

## Product decision

The existing `smeetbuilds/scolaos` repository may retain its current slug temporarily as an engineering codename, but **ScolaOS must not be treated as the final public product brand**.

Until a replacement name is accepted:

- do not register new product domains under the ScolaOS name;
- do not publish npm/package-registry namespaces intended for the final product under that name;
- do not create app-store listings, desktop signing identities, social handles or public launch assets using ScolaOS as the final brand;
- do not spend design-system effort on a permanent ScolaOS wordmark/logo;
- keep code paths and package names rename-friendly where practical.

## Why this blocks M0-003

Even without making a legal trademark determination, an active exact-name competitor in the same school-software market creates unacceptable risks of user confusion, search/domain collision, contributor confusion and future migration cost.

Therefore the current name fails the product-conflict portion of M0-003.

## Replacement-name gate

A replacement candidate must pass, at minimum:

1. exact and confusingly-similar web/product search;
2. domain availability and obvious domain-conflict review;
3. GitHub/repository namespace search;
4. npm/package namespace search for planned public packages;
5. major app-store/product search;
6. formal trademark screening appropriate to intended launch jurisdictions before public 1.0 branding.

A repository being available is not sufficient evidence by itself.

## Legal scope

This document records a **product/brand conflict screen**, not a legal opinion and not a finding of trademark infringement. Formal trademark clearance for the replacement name remains a separate pre-launch requirement.

## Evidence

Public exact-name product evidence observed on 13 August 2026:

- `https://scolaos.com/blog/school-attendance-management`
- `https://scolaos.com/blog/student-information-system`

Both pages use the ScolaOS product name for school-management software in the same broad market as this project.
