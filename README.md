# VC Intelligence Interface

A production-style venture sourcing and intelligence interface for VC workflows, built with Next.js App Router.

## What It Does

- Discover companies with search, facets, sorting, and pagination
- Switch between table and card views
- Open rich company profiles with:
  - Thesis score and rationale
  - Signals timeline
  - Notes
  - List membership
  - Live enrichment panel
- Create/manage lists and export as CSV/JSON
- Save and re-run search presets
- Use keyboard shortcuts for faster navigation/actions

## Stack

- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Zustand (global state + persistence)
- TanStack Query (enrichment mutation state)
- Lucide icons
- Server-side enrichment route:
  - Firecrawl (primary scrape path)
  - Direct fetch fallback (when Firecrawl is unavailable/rate-limited)
  - Gemini extraction (with heuristic fallback if model call fails)

## Routes

- `/companies` - discovery and filtering
- `/companies/[id]` - company profile
- `/lists` - list management
- `/saved` - saved searches
- `/api/enrich` - server enrichment endpoint

## Environment Variables

Create `.env.local` in project root:

```env
FIRECRAWL_API_KEY=fc-your-key-here
GEMINI_API_KEY=your-gemini-api-key
```

Notes:
- `FIRECRAWL_API_KEY` is optional in practice because the API route has direct-fetch fallback.
- `GEMINI_API_KEY` enables model-based extraction; without it, heuristic enrichment still returns structured output.

## Local Development

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Keyboard Shortcuts

- `CMD/CTRL + K` focus global search
- `/` focus global search
- `CMD/CTRL + E` trigger enrichment on profile page
- `CMD/CTRL + S` open save-search flow on discovery page
- `ESC` close shortcut-driven UI actions

## Enrichment Behavior

When you click **Enrich**:
1. The server attempts to scrape homepage/about/careers via Firecrawl.
2. If Firecrawl fails or rate-limits, the route falls back to direct HTML fetch.
3. Content is summarized and structured by Gemini.
4. If Gemini fails/rate-limits, a heuristic extractor still returns:
   - summary
   - what-they-do bullets
   - keywords
   - derived signals
   - sources + timestamps
5. Result is cached client-side and shown with freshness metadata.

## Exports

- CSV export fields:
  - `name`, `domain`, `stage`, `sector`, `thesisScore`, `fundingTotal`, `location`, `foundedYear`
- JSON export includes full company objects

## Data Model

Primary types are in `lib/types.ts`:
- `Company`
- `Signal`
- `EnrichmentResult`
- `DerivedSignal`
- `SavedSearch`
- `UserList`
- `Note`

Seed data is in `lib/mock-data.ts` (30 companies).

## Deployment (Vercel)

1. Push project to GitHub
2. Import into Vercel
3. Set env vars:
   - `FIRECRAWL_API_KEY`
   - `GEMINI_API_KEY`
4. Deploy

## Troubleshooting

### `POST /api/enrich 429`
Provider rate limit. The app now uses cooldown + fallback paths, but strict free-tier limits can still throttle upstream calls.

### `Missing server API keys`
Make sure keys are in `.env.local` (not only `.env.local.example`) and restart dev server.

### `GET /.well-known/appspecific/com.chrome.devtools.json 404`
Harmless Chrome probe; ignore.

### `DEP0040 punycode` warning
Comes from dependencies/toolchain under Node 22. App still works.

