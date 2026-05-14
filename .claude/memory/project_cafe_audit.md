---
name: project-cafe-audit
description: City-by-city audit of café seed data in the Grounds coffee discovery app — removing fabricated/closed entries and fixing wrong addresses
metadata: 
  node_type: memory
  type: project
  originSessionId: 4060012f-0115-4b58-8f46-f1f940e95cd5
---

Systematic audit of `lib/seed-na.ts` (and `lib/seed-intl.ts`). Goal: remove entries that are fabricated, permanently closed, or have completely wrong addresses; fix correctable address/name errors; commit city by city.

**Why:** Data quality — every bad pin on the map erodes user trust.

**How to apply:** Continue city-by-city through all NA cities in order. Audit = read all entries → flag suspicious ones from code review → web-search flagged entries → remove/fix → verify count with grep → tsc → commit → push.

## Completed cities (as of 2026-05-14)

| City | Entries before | Entries after | Commit |
|------|---------------|--------------|--------|
| Los Angeles | 34 | ~28 | fc5a92a area |
| Seattle | audited | audited | earlier session |
| San Francisco | audited | audited | earlier session |
| Chicago | 29 | 17 | 15830a8 |
| Toronto | audited | audited | cf5a84b area |
| Vancouver | audited | audited | cf5a84b area |
| Miami | audited | audited | cf5a84b area |
| Austin | 15 | 14 | a06409a |
| Denver | 12 | 9 | a323a86 |
| Boston | 5 | 3 | 35d2fa5 |
| Philadelphia | 5 | 5 | (no changes) |
| Washington DC | 4 | 3 | 105639d |
| Nashville | 3 | 3 | bd7cf65 |
| New Orleans | 4 | 3 | 13b3fdb |
| Minneapolis | 4 | 3 | 4be2413 |
| Montreal (re-audit) | 19 | 18 | dca5885 |
| Toronto (re-audit) | 23 | 22 | 1d43cb8 |
| Vancouver (re-audit) | 22 | 21 | fb8deae |

**All NA cities in seed-na.ts completed as of 2026-05-14. Canadian cities re-audited 2026-05-14.**

## Remaining NA cities (in seed order)

None — all cities audited.

## Key file

`lib/seed-na.ts` — all North American café entries, ~4700+ lines. Three sections per city: original block, `(additional cafes)`, `(additional — targeting N total)`.
