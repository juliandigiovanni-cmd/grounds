# Grounds — World Specialty Coffee Map

Find great coffee, anywhere. A curated, map-first travel companion for serious coffee people.

## Quick Start

### 1. Clone and install
```bash
git clone <repo>
cd grounds
npm install
```

### 2. Environment variables
```bash
cp .env.local.example .env.local
```
Fill in:
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Get from [mapbox.com](https://mapbox.com) (free tier available)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From Supabase project settings
- `SUPABASE_SERVICE_KEY`: Supabase service role key (server-side only)

### 3. Supabase setup
1. Create project at [supabase.com](https://supabase.com)
2. Run migrations: paste `/supabase/migrations/001_initial_schema.sql` into SQL editor
3. Copy URL and anon key to `.env.local`

### 4. Run dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## The Grounds Score

A 0–100 curation signal at `/lib/scoring.ts`:
- Roaster identity visible: 25pts
- Alternative brew methods: 20pts  
- Independent (no chain): 20pts
- Editorial features (Sprudge/Standart: 15pts, NYT/Guardian: 10pts, Timeout: 5pts)
- Community upvotes: up to 10pts
- Roastery on-site: 10pts

## Blurb Style Guide
- Max 20 words
- Present tense
- Lead with what makes it worth a detour
- Never use the word "cozy"

## Deploy to Vercel
1. Push to GitHub
2. Import to Vercel
3. Add env vars in Vercel dashboard
4. Deploy

## PWA Testing
1. Run `npm run build && npm start`
2. Open in Chrome DevTools > Application > Service Workers
3. Test on actual mobile device for full PWA experience
4. Check "Add to Home Screen" prompt after second visit

## Social Handles to Reserve
- [ ] Instagram: @groundscoffee
- [ ] X/Twitter: @groundscoffee
- [ ] TikTok: @groundscoffee
- [ ] Substack: groundscoffee.substack.com

## Monetization Roadmap
- **Tier 1**: Google AdSense (passive) — scripts in layout.tsx, commented out
- **Tier 2**: Roaster sponsorships — sponsored field in cafes table
- **Tier 3**: Grounds Verified badge program — /for-cafes
- **Tier 4**: Affiliate links — affiliate_links jsonb field reserved
