# 🔥 Roast My Pet

A viral web app that roasts your pet with AI and produces a shareable meme in about 6 seconds. Free, no signup, mobile-first.

> *Every pet is cute. Some just deserve a little roasting.*

## Tech stack
- Leti is a bitch
- Next.js 15 (App Router, TypeScript strict)
- Tailwind CSS v4 + shadcn-style primitives
- Framer Motion, react-hook-form + Zod, react-dropzone, browser-image-compression
- Google Gemini 2.5 Flash (`@google/generative-ai`) — image moderation + roast generation
- Supabase (Postgres + Storage) — schema, buckets, RLS
- Upstash Redis (`@upstash/redis` + `@upstash/ratelimit`) — caching + rate limiting
- Satori + `@resvg/resvg-js` + `sharp` — server-side meme rendering (classic / polaroid / tabloid templates, square / story / landscape formats)
- PostHog + Vercel Analytics, Sentry

## Local setup

```bash
# 1. install deps
pnpm install   # or npm install / yarn

# 2. environment
cp .env.example .env.local
# fill in every value in .env.local (see table below)

# 3. database
# - Create a Supabase project.
# - Run supabase/migrations/0001_initial_schema.sql in the Supabase SQL editor.
#   (Also creates the `pet-uploads` and `memes` storage buckets.)

# 4. dev
pnpm dev
# open http://localhost:3000
```

## Environment variables

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (server-only) |
| `NEXT_PUBLIC_SITE_URL` | Your canonical public URL (e.g. `https://roastmypet.com`) |
| `GEMINI_API_KEY` | Google AI Studio → API keys |
| `UPSTASH_REDIS_REST_URL` | Upstash → your Redis DB → REST |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash → your Redis DB → REST |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog → Project settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | Usually `https://us.i.posthog.com` |
| `SENTRY_DSN` | Sentry → Project settings |
| `SENTRY_AUTH_TOKEN` | Sentry → Settings → Developer Settings → Auth Tokens |
| `DAILY_IP_SALT` | Random string, rotated daily via your secret manager |
| `ADMIN_PASSWORD` | Any strong password — used to gate `/admin` |
| `CRON_SECRET` | Shared secret sent as `Authorization: Bearer ...` by Vercel Cron |
| `ENABLE_PUBLIC_GALLERY` | `true` / `false` |
| `ENABLE_RATE_LIMIT` | `true` / `false` (set `false` to disable in dev) |
| `DAILY_GENERATION_CAP` | Integer — global per-day roast cap (default `10000`) |

The Upstash, Sentry and PostHog env vars are optional locally — the app gracefully degrades (no rate limiting, no analytics, no error tracking) when they're missing.

## Supabase setup

1. Create a new Supabase project.
2. In the SQL editor, run [`supabase/migrations/0001_initial_schema.sql`](./supabase/migrations/0001_initial_schema.sql). This creates the `users`, `roasts`, `meme_assets`, `share_events`, `reactions`, `flags` tables, indexes, RLS policies, and both storage buckets.
3. Verify that the `pet-uploads` (private) and `memes` (public) buckets now exist under Storage.
4. Copy the project URL and the `anon` + `service_role` keys into `.env.local`.

## Deploying to Vercel

1. Import this repository in Vercel.
2. Set every env var from `.env.example` in Project → Settings → Environment Variables.
3. Confirm that `/api/roast` uses the Node 20 runtime (it's set via `export const runtime = "nodejs"` in the route — no config change needed).
4. Deploy. The cron jobs in `vercel.json` will start running automatically once `CRON_SECRET` is set.
5. Update `NEXT_PUBLIC_SITE_URL` to your production domain.

## Tests

Add Vitest + Playwright when you're ready:

```bash
pnpm test       # once configured
pnpm test:e2e   # once configured
```

The project scaffolding leaves hooks for both but ships without tests wired up — the acceptance criteria are mostly UI/smoke tests best verified in a browser.

## Architecture notes

- `POST /api/upload-url` → issues a signed URL to PUT the photo directly into the `pet-uploads` bucket. Rate-limited per IP hash.
- `POST /api/roast` → downloads the photo, moderates via Gemini, generates a roast via Gemini, renders 3 meme formats with satori + resvg-js + sharp, uploads them to `memes`, writes the `roasts` + `meme_assets` rows, and returns a share URL + one-time owner token.
- `/r/[shortId]` → ISR page (1-hour revalidate), dynamic `opengraph-image.tsx`, Redis-cached fetch helper.
- Reactions, shares, flags → separate endpoints, rate-limited, auto-flagging triggers at 3 unique reports.
- `/api/cron/*` → Vercel Cron targets. 30-day cleanup of anonymous roasts + storage objects; 15-minute cache bust of `gallery:top:*`.

## License

MIT — do whatever, just don't be weird about it.
