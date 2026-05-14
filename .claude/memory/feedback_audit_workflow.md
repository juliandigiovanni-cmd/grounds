---
name: feedback-audit-workflow
description: "Established workflow for the city-by-city café audit — how to research, edit, verify, and commit"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 4060012f-0115-4b58-8f46-f1f940e95cd5
---

Read all city entries → identify flags from code review (duplicate addresses, wrong-city addresses, known-closed brands) → web-search suspicious entries in parallel → compile removals/fixes → sequential Edit calls → verify count (`grep -c 'city: "CityName"'`) → `npx tsc --noEmit` → `git add lib/seed-na.ts && git commit` → `git push`.

**Why:** This sequence was validated across LA, Seattle, SF, Chicago sessions without pushback.

**How to apply:** Always follow this exact sequence for each city. Never skip the tsc check. Always `git add` before committing (learned from LA session where first commit failed because file wasn't staged).

## Common fabrication/error patterns caught

- Brand has no location in this city (Madcap Coffee Chicago, GGET Pasadena)
- Duplicate address between two entries (Intelligentsia Monadnock = 53 W Jackson duplicate)
- Wrong-city address tagged as a major city (Narrative Coffee Evanston tagged as Chicago; Equator Coffees Mill Valley tagged as SF)
- Rebranded business still listed under old name (Broadcast Coffee → Fred by Broadcast in Seattle)
- Closed chain still listed (Bow Truss Chicago, Stumptown LA)
- Wrong street number (Intelligentsia Wicker Park 1850 → 1609 W Division; Sparrow Coffee 955 W Monroe → 2040 W Fulton)
- Incomplete/placeholder address (Olympia Coffee "1ST Ave S" placeholder)
