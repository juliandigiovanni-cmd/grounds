Work through this document top to bottom. Start with the 
main scaffold (v3 prompt). Once the map renders with markers 
on both mobile and desktop viewports, move to Supplementary 
Prompt A, then B, C, D, E, F in order. Confirm completion 
of each section before moving to the next.

Build a production-ready web app called "Grounds" (working title) — 
a curated world map of 3rd wave coffee shops built specifically 
for travelers. This is NOT a loyalty card app or local discovery 
tool — it is a globally-minded, editorially-curated, map-first 
travel companion for serious coffee people.

## Core Differentiation (inform every design decision)
- Traveler-first UX: primary question is always "I'm going to X, 
  where should I go?" not "what's near me now"
- Global from day one: seed 15+ cities across 6 continents
- Map as primary interface: spatial discovery before search or lists
- Editorial voice: every cafe has a short "why go" blurb (1-2 sentences), 
  not just metadata
- Proprietary 3rd Wave Score (0-100): our curation signal, not crowd ratings
- Meta-aggregation: pulls from Google, Yelp, Foursquare — surfaced 
  in one place with source attribution
- No merchant payments, no loyalty cards, no subscription boxes — 
  pure discovery product
## Relationship to Sprudge (inform architecture decisions)
Sprudge (sprudge.com) is the leading 3rd wave coffee media outlet.
They produce excellent long-form city guides and journalism but:
- Guides are static article-format, not interactive or filterable
- No live data, no map-first UX, content goes stale
- No cross-platform review aggregation
- No traveler-mode or scoring system
Grounds is NOT a journalism outlet. We do not compete with 
Sprudge editorially. Instead:
- "As seen in Sprudge" is a first-class badge on cafe profiles 
  (displayed prominently, links to the original article)
- Sprudge features are a scoring signal in the 3rd Wave Score 
  (worth 8pts within the featured_in[] category)
- City pages should link out to relevant Sprudge guides 
  under a "Further Reading" section — we are a utility layer, 
  they are the editorial layer
- The featured_in[] field should support: 
  [sprudge | standart | monocle | atlas | guardian | 
  ny_times | infatuation | eater | timeout]
  each with a distinct badge style

## 3rd Wave Scoring Engine (updated)
Build a scoring function (0-100) at /lib/scoring.ts:
- Named single-origin or roaster identity visible (25pts)
- Offers filter/pour-over or alternative brew methods (20pts)
- No chain affiliation (20pts)
- Featured in Sprudge, Standart, Monocle, or equivalent (15pts)
  - Sprudge or Standart feature: 15pts
  - Guardian / NYT / Eater / Infatuation: 10pts
  - Timeout or equivalent: 5pts
- Community upvotes from verified users (10pts)
- Roastery on premises (10pts)

## Stack
- Next.js 14 (App Router)
- TypeScript
- Mapbox GL JS for the map
- Supabase (Postgres DB + auth + storage)
- Tailwind CSS (mobile-first utility classes throughout)
- Vercel for deployment

## Responsive Design Philosophy
This app will be used heavily on phones by travelers in cities.
Every component must be designed mobile-first, then enhanced for 
desktop. Specific requirements:

### Mobile Layout
- Map takes full viewport height on mobile (100dvh, not 100vh, 
  to handle browser chrome correctly)
- Bottom sheet pattern for cafe cards on mobile: card slides up 
  from bottom, not from the side. Draggable handle at top, 
  snaps to 40% and 90% height positions
- Bottom navigation bar on mobile with icons: Map, Search, 
  Saved, Submit
- Traveler Mode search bar is pinned at top of screen on mobile, 
  always accessible
- Filters open as a full-screen modal sheet on mobile, 
  not a sidebar
- Touch-friendly tap targets: minimum 44x44px for all 
  interactive elements
- Swipeable cafe cards in list view on mobile (swipe left to 
  dismiss, swipe right to save)
- "Get Directions" button on cafe cards deep-links to 
  Apple Maps on iOS, Google Maps on Android
- Pinch-to-zoom on map works natively via Mapbox
- No hover-dependent interactions — all UI must work with 
  touch only

### Tablet Layout (768px–1024px)
- Side panel at 40% width, map at 60%
- Bottom nav transitions to left sidebar nav

### Desktop Layout (1024px+)
- Classic split: full-height left sidebar (380px) + map fills 
  remaining width
- Cafe card slides in from right as an overlay panel
- Hover states and keyboard navigation fully supported
- Filter sidebar always visible, not behind a toggle

### Progressive Web App (PWA)
- Add manifest.json: name, short_name, icons, theme_color, 
  display: standalone
- Service worker for offline support: cache city pages and 
  saved cafes for offline viewing
- "Add to Home Screen" prompt after second visit
- App icon and splash screen assets

### Performance (critical for mobile on cellular)
- Lazy load map markers outside viewport
- Compress and serve WebP images via Supabase storage transforms
- Use next/image throughout with proper sizing
- Keep initial JS bundle under 200kb
- Cafe detail pages statically generated at build time (SSG) 
  where possible

## Project Structure
Scaffold the full project with:
- /app — Next.js app router pages
- /components
  - /map — Map, MarkerCluster, ScoreBadge
  - /cafe — CafeCard, CafeDetailPanel, BottomSheet, DirectionsButton
  - /ui — BottomNav, FilterModal, SearchBar, TravelerMode, 
    EditorialBlurb, SaveButton
  - /city — CityHero, CityTopFive, ItineraryExport
- /lib — Supabase client, Mapbox config, API helpers, scoring engine
- /hooks — useBottomSheet, useMapFly, useSavedCafes, useDeviceType
- /types — TypeScript interfaces for Cafe, Review, User, Score
- supabase/migrations — DB schema

## Database Schema
Design tables for:
- cafes (id, name, slug, lat, lng, city, country, address, roaster, 
  brew_methods[], vibe_tags[], google_place_id, instagram_handle, 
  website, editorial_blurb, featured_in[], verified, submitted_by, 
  created_at)
- reviews (id, cafe_id, source [google|yelp|foursquare|manual], 
  rating, text, author, url, created_at)
- aggregate_scores (cafe_id, third_wave_score, overall_rating, 
  review_count, last_updated)
- cities (id, name, country, lat, lng, cafe_count, hero_image_url, 
  city_blurb)
- saved_cafes (id, user_id, cafe_id, created_at)

## Core Features (v1)

### Map (primary interface)
- Full-screen Mapbox map, loads on homepage
- Clustered markers that expand on zoom
- Marker color/size reflects third_wave_score
- Mobile: tap marker → bottom sheet slides up
- Desktop: click marker → cafe card slides in from right
- City-level zoom shows a curated "Top 5" overlay panel

### Traveler Mode (hero feature)
- Prominent search: "Where are you headed?"
- Enter any city → map flies to it, shows ranked Top 5 
  with editorial blurbs
- Mobile: results appear in bottom sheet with swipeable cards
- "Plan my visit" export: generates a shareable itinerary page 
  at /city/[slug]/itinerary
- Itinerary page is print-friendly and works offline if PWA cached

### Cafe Cards & Detail Pages
- Card: name, score badge, one-line editorial blurb, brew methods, 
  vibe tags, aggregated rating with source breakdown
- Mobile card has prominent "Directions" CTA as first action
- Full page at /cafe/[slug]: all of above plus photos, map embed, 
  "as seen in" badges, all reviews by source, nearby cafes

### City Pages
- /city/[slug]: hero image, city blurb, full ranked list, 
  filterable map, "traveler tips" section

### Filters
- Brew method: espresso / pour-over / aeropress / cold brew / syphon
- Vibe: laptop-friendly, no-laptop, standing bar, outdoor seating, 
  dog-friendly, roastery on-site
- Score: filter by third_wave_score minimum threshold
- Verified only toggle

### Save & Offline List
- Save cafes to a personal list (localStorage for guests, 
  Supabase for logged-in users)
- Saved list accessible from bottom nav, works offline via PWA cache

### Submit a Cafe
- Public submission form, mobile-optimized (large inputs, 
  no hover states)
- Admin review queue in Supabase dashboard

## 3rd Wave Scoring Engine
Build a scoring function (0-100) at /lib/scoring.ts:
- Named single-origin or roaster identity visible (25pts)
- Offers filter/pour-over or alternative brew methods (20pts)
- No chain affiliation (20pts)
- Editorial feature in known publications e.g. Standart, 
  Monocle, Atlas Coffee Club (15pts)
- Community upvotes from verified users (10pts)
- Roastery on premises (10pts)

## Ad Infrastructure (set up but inactive)
- Add Google AdSense script to layout.tsx (commented out, 
  ready to activate)
- Mobile ad slots sized for 320x50 banner (bottom of cafe cards) 
  and 300x250 interstitial (between list items)
- Desktop ad slots in sidebar and cafe detail pages
- /advertise page: clean pitch for roasters and specialty importers, 
  with a contact form
- "Featured" cafe placement slot architecturally reserved in 
  city Top 5 lists

## SEO
- Dynamic OG images per cafe and city page (1200x630 for 
  social, 600x314 for mobile share sheets)
- Sitemap generation covering /cafe/[slug] and /city/[slug]
- Structured data (LocalBusiness schema) on cafe pages
- robots.txt
- Page titles: "Best 3rd Wave Coffee in [City] | Grounds"
- Meta viewport tag correctly set (already default in Next.js 
  but confirm)

## Environment Variables
Create .env.local.example with placeholders for:
NEXT_PUBLIC_MAPBOX_TOKEN, NEXT_PUBLIC_SUPABASE_URL, 
SUPABASE_SERVICE_KEY, GOOGLE_PLACES_API_KEY, YELP_API_KEY,
FOURSQUARE_API_KEY, NEXT_PUBLIC_GA_MEASUREMENT_ID

## Seed Data
Populate with 30 real 3rd wave cafes across at minimum:
Tokyo, Copenhagen, Melbourne, NYC, London, Montreal, Berlin, 
Mexico City, Seoul, Cape Town, Buenos Aires, Portland OR.
Include realistic coordinates, brew methods, roaster names, 
vibe tags, editorial blurbs, and third_wave_scores for each.
Seed data should make traveler mode feel immediately useful 
and the map feel alive on first load.

## Deployment Config
- vercel.json with proper config
- README with full setup instructions: Supabase setup, 
  API key acquisition, Mapbox token, Vercel deploy steps, 
  notes on the scoring engine, and PWA testing instructions

Start with the scaffold and seed data. Confirm the map renders 
with clustered markers on both mobile viewport (375px) and 
desktop (1280px) before moving on. Use browser devtools 
device simulation to verify the bottom sheet pattern works 
on mobile before building cafe detail pages.

## Supplementary Prompts

## Legal & Data Compliance Setup

Implement the following compliance infrastructure before 
any external API integration:

### API Data Usage
- Google Places: fetch-and-display only, do NOT cache 
  place reviews locally. Cache coordinates, names, and 
  hours only (permitted). Add a comment in /lib/google.ts 
  explaining this constraint.
- Yelp Fusion: reviews must not be stored in Supabase. 
  Fetch at request time and display with Yelp branding 
  and a link back to the Yelp listing (required by ToS). 
  Add a /lib/yelp.ts wrapper that enforces this with a 
  clear comment.
- Foursquare: attribution required on all displayed data. 
  Add FSQ logo/link component that appears wherever 
  Foursquare data is shown.
- Build a /lib/attribution.ts file that exports branded 
  attribution components for each source: Google, Yelp, 
  Foursquare. These must render wherever their data appears.

### GDPR & Privacy
- Add a cookie consent banner component that fires on 
  first visit for all users. Use a lightweight library 
  (cookie-consent or similar). Banner must appear before 
  any analytics or ad scripts initialize.
- Google Analytics and AdSense scripts in layout.tsx must 
  be gated behind cookie consent — do not load unless 
  user accepts.
- Create /app/privacy/page.tsx — a real privacy policy page 
  covering: data collected, cookies used, third-party APIs, 
  user submissions, and GDPR rights (access, deletion).
- Create /app/terms/page.tsx — terms of use covering: 
  user-submitted content license, no warranty on cafe data 
  accuracy, DMCA contact.
- Add footer links to both pages site-wide.
- For EU detection, use the request headers (CF-IPCountry 
  via Vercel) to show stricter consent UI to EU visitors.

### Content Moderation
- Add a `flagged` boolean and `flag_reason` text field 
  to the cafes table in Supabase.
- Add a "Report this listing" button on every cafe card 
  and detail page. Clicking opens a small modal with 
  reasons: [Permanently closed | Wrong location | 
  Not specialty coffee | Inappropriate content | Other]
- Flagged cafes with 3+ reports should automatically 
  set verified=false and notify admin via a Supabase 
  edge function that sends an email.
- Build a simple /admin/flags page (auth-protected) 
  showing all flagged cafes with approve/dismiss actions.
  
  ## Competitive Awareness — Inform UI Decisions

Before building the filter and cafe card components, 
review the following competitors and ensure Grounds 
is meaningfully differentiated from each:

### Known Competitors
- Beanhunter (beanhunter.com): cafe directory, user reviews, 
  basic map. Weakness: outdated UI, no scoring, sparse 
  outside Australia.
- Cafe Guru: app-based, broad coverage, no 3rd wave filter. 
  Weakness: no editorial voice, treats Starbucks same as 
  specialty.
- Coffee Map apps: generally sparse data, poor UX.
- The Infatuation / Eater city guides: editorial but 
  static, not interactive.

### Differentiation to encode in UI
- Grounds score badge must be visually prominent and 
  explained — add a "What is the Grounds Score?" tooltip 
  or modal accessible from every score badge
- Filter panel must include a "Specialty only" quick toggle 
  that competitors lack — this is our one-tap value prop
- Cafe cards should show a "last verified" date so users 
  know data is fresher than competitors
- Add a subtle "Not on Google Maps" tag for cafes that 
  exist only in the Grounds database — signals exclusivity 
  of curation

### Partnership signals (not competition)
- Sprudge, Standart, Monocle features appear as badges 
  (already in schema) — make these visually distinct 
  and prestigious-looking, not generic tags
- City pages include a "Further Reading" section linking 
  to relevant Sprudge city guides and Standart features 
  — position Grounds as the utility layer above editorial
  
  ## Brand Name Validation & Identity Setup

### Name candidates to evaluate (in order of preference)
Before hardcoding any brand name, check availability of 
the following across: .com domain, .io domain, Instagram 
handle, and trademark (USPTO TESS search):
1. Grounds
2. Terroir Coffee
3. The Filter
4. Cupped
5. Origin Map
6. Steeps (stretch — more tea-adjacent)

### Once a name is selected:
- Set it as a constant in /lib/brand.ts: 
  export const BRAND_NAME, BRAND_TAGLINE, BRAND_URL
- Use this constant everywhere — never hardcode the 
  brand name in components directly
- Generate a placeholder SVG wordmark logo for the navbar 
  using the selected name — clean, minimal, works on both 
  light and dark backgrounds
- Create /public/og-default.png (1200x630) — a branded 
  default OG image used when no cafe/city-specific image 
  is available
- Reserve social handle setup as a checklist item in README:
  [ ] Instagram
  [ ] X/Twitter  
  [ ] TikTok (coffee content performs well here)
  [ ] Substack (for a future city guide newsletter)

### Tagline options to implement in hero/metadata:
- "Find great coffee, anywhere."
- "The world's specialty coffee map."
- "Curated coffee for curious travelers."
Pick one and use it consistently in OG tags, 
the hero section, and the PWA manifest.

## Data Quality & Freshness Infrastructure

The hardest long-term problem for a cafe directory is 
stale data. Build the following systems from day one:

### Freshness fields (add to cafes table)
- last_verified_at: timestamp
- verification_source: enum [admin | community | 
  google_places_api | automated]
- permanently_closed: boolean (default false)
- closure_reported_at: timestamp

### Google Places closure detection
- Build a Supabase edge function at 
  /supabase/functions/check-closures/index.ts
- Runs on a cron schedule (weekly)
- For each cafe with a google_place_id, calls Google 
  Places API and checks business_status field
- If business_status === 'CLOSED_PERMANENTLY', sets 
  permanently_closed=true and sends admin email alert
- If business_status === 'CLOSED_TEMPORARILY', adds 
  a "temporarily closed" badge to the cafe card

### Community verification
- Add an "Is this still open?" prompt on cafe cards 
  for listings not verified in 6+ months
- Yes/No buttons — 3 "Yes" votes updates 
  last_verified_at; 3 "No" votes triggers admin review
- Show "Community verified [date]" or "Unverified 
  since [date]" on every cafe card

### Annual cafe outreach (manual process — document in README)
- Build an /admin/outreach page listing all cafes 
  where last_verified_at > 12 months ago
- One-click sends a templated email to the cafe's 
  contact asking them to confirm details are correct
- Email template stored in /lib/emails/verification.ts

### Closed cafe handling
- Permanently closed cafes should NOT be deleted — 
  archive them at /cafe/[slug] with a "Permanently Closed" 
  banner and the closure date
- This preserves SEO value and gives travelers 
  historical context
- Filter out closed cafes from map and search by default, 
  with an "Include closed" toggle for researchers/historians
  
## Monetization Infrastructure (build now, activate later)

### Tier 1: Google AdSense (passive)
- AdSense script in layout.tsx, gated behind cookie consent, 
  commented out with activation instructions
- Mobile ad slots: 320x50 at bottom of cafe list items
- Desktop ad slots: 300x250 in sidebar below top 5 list
- Cafe detail page: 728x90 leaderboard below the fold

### Tier 2: Roaster Sponsorships (semi-active)
- Add a sponsored boolean and sponsor_roaster_id 
  foreign key to cafes table
- Sponsored cafes get a "Featured Roaster" badge 
  (tasteful, not garish) and appear at the top of 
  city lists with a subtle background treatment
- Build /advertise page with:
  - Clean pitch: traffic stats placeholder, 
    audience description (specialty coffee travelers), 
    placement options
  - Three tiers: City Feature ($X/mo), 
    Global Feature ($X/mo), Roaster Profile ($X/mo)
    (leave pricing as TBD placeholders)
  - Contact form that emails you directly via 
    a Supabase edge function

### Tier 3: Grounds Verified Badge Program
- Add a verified_paid boolean to cafes table 
  (separate from verified)
- Verified cafes get: priority placement, ability to 
  edit their own profile via a cafe owner portal, 
  "Grounds Verified" badge, analytics dashboard 
  showing profile views
- Build /for-cafes page explaining the program 
  with a waitlist signup form (Supabase waitlist table)
- Build /admin/verified page to manage verified cafes

### Tier 4: Affiliate Revenue
- Add an affiliate_links jsonb field to cafes table 
  for future use: {beans_url, gear_url}
- Create /lib/affiliate.ts with helper to append 
  affiliate params to outbound links
- On cafe detail pages, reserve a "Buy their beans" 
  section below the main info panel (empty for now, 
  structured for future activation)

### Revenue tracking
- Add a simple /admin/revenue page stub with 
  placeholders for monthly AdSense revenue, 
  sponsorship deals, and verified cafe count
- This is a manual dashboard for now — 
  just static inputs, no live API needed yet

  ## Strategic Moat — Protecting Against Google Maps

Google Maps is improving specialty coffee filtering.
Our moat must be curation quality and community trust,
not just data coverage. Build the following to protect 
long-term differentiation:

### The Grounds Score as public-facing IP
- The scoring methodology should be fully transparent — 
  build a /about/score page explaining exactly how 
  the score is calculated, with examples
- This builds trust and is something Google will never do
- Add a "Disagree with this score? Tell us why" 
  feedback link on every score badge

### Community as moat
- Verified user reviews (logged-in only) should be 
  weighted higher than anonymous signals in the score
- Build a simple points/reputation system for users 
  who submit cafes and leave reviews — show a 
  "Top Contributors" section on the /about page
- Community data that users contribute is yours — 
  Google can't replicate it

### Editorial voice as moat
- The one-line editorial blurb on every cafe card 
  is the product's soul — protect it
- Build an /admin/blurbs page where you can edit 
  all blurbs from one interface
- Style guide for blurbs should be in README: 
  max 20 words, present tense, lead with what makes 
  it worth a detour, never use the word "cozy"

### Data exclusivity signals
- Track and display how many Grounds-only cafes 
  exist (not on Google Maps or Yelp)
- Show this count on the homepage: 
  "X cafes you won't find anywhere else"
- These are your highest-value listings — 
  prioritize sourcing them via community submission
  