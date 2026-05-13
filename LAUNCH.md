# Grounds — Launch Checklist

## Status key
- [x] Done
- [ ] You need to do this (no code required)
- [~] Code done, requires external action to activate

---

## 1. Data quality (do first — this affects credibility)

- [ ] Finish removing non-existent / fabricated cafe entries from all 6 regional seed files
  - Regions still to audit: check each seed file for cafes without verifiable addresses
  - Goal: every cafe in the map must be a real, open business

---

## 2. Infrastructure (do before any public link is shared)

### Domain
- [ ] Decide on domain name — top picks in order:
  1. `grounds.coffee` (~$30–50/yr, perfect brand fit)
  2. `knowyourgrounds.com` (~$12/yr, descriptive)
- [ ] Purchase domain (Namecheap or Cloudflare Registrar recommended)
- [ ] Add domain in Vercel dashboard → Settings → Domains
- [ ] Update `BRAND_URL` in `lib/brand.ts` to match new domain
- [ ] Verify `https://[yourdomain]/sitemap.xml` returns valid XML after deploy

### Bluehost
- [ ] Decision: Bluehost is PHP shared hosting — do NOT host this site there
- [ ] If you have a domain at Bluehost: point its nameservers to Vercel, or transfer to Cloudflare Registrar
- [ ] Cancel Bluehost hosting plan (keep domain if you want, but cancel the hosting)
- [ ] Research site: move to GitHub Pages (Jekyll or plain HTML — free, fast, no hosting bill)

### Analytics
- [x] `GoogleAnalytics` component created — loads only after cookie consent
- [x] `CookieConsent` dispatches `grounds:consent-accepted` event to activate GA immediately on accept
- [ ] Create a GA4 property at analytics.google.com if you haven't already
- [ ] Add `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` to Vercel environment variables
- [ ] Verify after deploy: open site in incognito, accept cookies, check GA4 real-time shows a visitor

### SEO / crawling
- [x] `sitemap.ts` — dynamic, covers home / cities / cafes / key pages
- [x] `robots.ts` created — allows all, disallows `/admin` and `/api/`, points to sitemap
- [ ] Submit sitemap URL to Google Search Console after domain is live

---

## 3. Social & branding (do before soft launch)

- [ ] Claim social handles NOW before launch — someone else will take them
  - Instagram: try `@knowyourgrounds` or `@groundscoffee`
  - TikTok: same handle options
  - Twitter/X: optional but grab it while you can
- [ ] Once handles are claimed, update `Footer.tsx` — replace the two `const SOCIAL_*` placeholder `#` values:
  ```ts
  // components/layout/Footer.tsx (top of file)
  const SOCIAL_INSTAGRAM = "https://instagram.com/YOUR_HANDLE";
  const SOCIAL_TIKTOK = "https://tiktok.com/@YOUR_HANDLE";
  ```
- [x] Footer has Instagram + TikTok icons (currently pointing to `#` — safe to deploy, just dead links)

---

## 4. Content & copy

- [x] Advertise pricing set: City Feature $99/mo · Global Feature $299/mo · Roaster Profile $149/mo
- [x] `/for-cafes` page — Grounds Verified waitlist with founding member pricing hook
- [ ] Review `/about` and `/about/score` — make sure copy is accurate and not placeholder
- [ ] Review `/privacy` and `/terms` — make sure they reflect actual data practices

---

## 5. Backend / Supabase (needed for user-facing features to work)

The app currently runs entirely off seed data. These features silently fail until the schema is applied:

| Feature | Route | Status |
|---------|-------|--------|
| Newsletter signups | `/api/newsletter` | Fails — no `subscribers` table |
| Saved cafes | `/saved` | Fails — no `saved_cafes` table |
| Cafe submissions | `/api/submit` | Fails — no `submissions` table |
| Advertiser inquiries | `/api/inquiry` | Fails — no `advertiser_inquiries` table |
| Cafe verification form | `/for-cafes` | Fails — same as above |
| Report button | `/api/report` | Fails — no `reports` table |

- [ ] Apply Supabase schema (write migrations to `supabase/migrations/` and run `supabase db push`)
- [ ] Minimum viable schema for launch: `subscribers`, `advertiser_inquiries` (newsletter + for-cafes are the most important pre-launch flows)
- [ ] Test newsletter signup end-to-end after schema is applied

---

## 6. Soft launch (Week 1 after domain is live)

Goal: catch real bugs before any press or Product Hunt.

- [ ] Share URL with personal network (email / iMessage)
- [ ] Post in 1–2 subreddits with "looking for feedback" framing:
  - `r/specialtycoffee` — your core audience, they'll spot bad data fast
  - `r/digitalnomad` — high-value early adopters
- [ ] Monitor Vercel function logs for errors
- [ ] Watch for any bad cafe data reports via the Report button

---

## 7. Public launch (Week 2–3)

### Product Hunt
- [ ] Create a "coming soon" page at producthunt.com/upcoming now to collect followers
- [ ] Prepare assets: 3–5 screenshots + a short GIF/video of globe → city → cafe card flow
- [ ] Schedule launch for a Tuesday, Wednesday, or Thursday
- [ ] Line up your network to upvote on launch day (not before — PH penalizes pre-seeding)
- [ ] Tagline idea: "The curated coffee map for serious travelers"

### Hacker News
- [ ] Post "Show HN: Grounds – a curated specialty coffee map for travelers (38 cities)"
- [ ] Post Tuesday morning ET; be in comments for first 2 hours

### Reddit (tailor copy to each community)
| Subreddit | Angle |
|-----------|-------|
| `r/Coffee` (2.4M) | "I built a travel map for specialty coffee" |
| `r/specialtycoffee` (220k) | Scoring methodology, invite feedback on their city |
| `r/digitalnomad` (700k) | "Never hunt for good coffee in a new city again" |
| `r/travel` | City-specific: "I mapped the best cafes in Tokyo / Copenhagen / etc." |

**Reddit rule:** lead with 2–3 genuinely interesting specific cafes from a city, then link the map. Do not open with a self-promo headline.

### Press
- [ ] Email Sprudge editors (sprudge.com) — the #1 specialty coffee publication, they cover tools like this
- [ ] Pitch Standart Magazine — slower cycle, premium audience
- [ ] Find 3–5 coffee travel bloggers on Instagram (`#specialtycoffee` + `#coffeeshop`, 10k–100k followers) — offer Grounds Verified for free in exchange for a post

---

## 8. Monetization sequence

### Month 1–2: Build audience first
- [ ] Newsletter is the most important metric — every page should funnel to it
- [ ] Do NOT turn on AdSense yet (pennies at low traffic, degrades UX)
- [ ] Goal: 500 newsletter subscribers before monetizing

### Month 2–3: Grounds Verified launch
- [ ] Apply Supabase schema so `/api/inquiry` actually saves to DB
- [ ] Email cafes already in the map: "Your cafe has a [score] on Grounds — claim your Verified badge"
- [ ] Founding member pricing: $49/mo locked for first 20 cafes (future price $99/mo)
- [ ] Announce via newsletter first

### Month 3–6: Sponsorships
- [ ] Target specialty roasters (Blue Bottle, Onyx, Intelligentsia, Counter Culture, etc.)
- [ ] City Feature sponsorships are the easiest sell: a roaster sponsors one city where they operate or ship
- [ ] Use `/advertise` as your pitch deck URL

### Month 6+: AdSense or direct ads
- [ ] Only activate AdSense once you have 10k+ monthly visitors
- [ ] Direct ad sales preferred over AdSense (same slots, 3–5x revenue)
- [ ] AdSense script is in `app/layout.tsx` as a comment — ready to uncomment when needed

---

## Quick reference: what's already built

| Feature | File(s) |
|---------|---------|
| Map view (globe, filters, score legend) | `components/map/MapView.tsx` |
| Cafe detail (card, bottom sheet, side panel) | `components/cafe/` |
| Search (cities + individual cafes) | `components/search/TravelerModeSearch.tsx` |
| Scoring engine | `lib/scoring.ts` |
| Grounds Verified badge | `components/cafe/GroundsExclusiveBadge.tsx` |
| Sponsored badge | `components/cafe/SponsoredBadge.tsx` |
| Newsletter signup | `components/ui/NewsletterSignup.tsx` |
| Cookie consent + GA activation | `components/ui/CookieConsent.tsx`, `components/ui/GoogleAnalytics.tsx` |
| robots.txt | `app/robots.ts` |
| Sitemap | `app/sitemap.ts` |
| OG image API | `app/api/og/route.ts` |
| Admin dashboard | `app/admin/` |
| Advertise page | `app/advertise/page.tsx` |
| For cafes / Verified waitlist | `app/for-cafes/page.tsx` |
| PWA manifest + icons | `public/manifest.json`, `public/icons/` |
