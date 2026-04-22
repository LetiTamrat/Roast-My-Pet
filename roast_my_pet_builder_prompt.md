# Roast My Pet — Master Build Prompt for AI Builders

> Copy everything below the line into your AI builder of choice (Lovable, Bolt, v0, Cursor, Replit Agent, Windsurf, etc.). It is self-contained and produces a fully working, deployable product.

---

# 🚀 BUILD PROMPT — START HERE

You are an expert full-stack engineer. Build a complete, production-ready, deployable web application called **Roast My Pet** following every specification in this document. Do not skip any section. Do not ask clarifying questions — make sensible decisions where ambiguity exists, prefer the choice that ships fastest with the highest polish. Output all required files. When done, the app must run end-to-end with only environment variables to configure.

---

## 1. PRODUCT SUMMARY

**Roast My Pet** is a viral web app where users upload a photo of their pet, enter the pet's name and optional traits, and receive a hilarious AI-generated roast plus a downloadable, shareable meme image.

**Core flow:** Upload photo → Enter name + traits + roast level → Click "Roast My Pet 🔥" → Wait ~6 seconds → See animated meme result → Share to social media or download.

**Why it matters:** Every output is engineered to be share-worthy. The meme image carries the brand watermark. Every share is free marketing.

---

## 2. TECH STACK (MANDATORY)

Use exactly this stack. Do not substitute.

- **Framework:** Next.js 15 (App Router, TypeScript, strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Animations:** Framer Motion
- **Forms:** react-hook-form + Zod validation
- **Image upload UI:** react-dropzone
- **Client image compression:** browser-image-compression
- **AI:** Google Gemini via `@google/generative-ai` (model: `gemini-2.5-flash`)
- **Database + Storage + Auth:** Supabase (Postgres + Storage buckets)
- **Rate limiting + cache:** Upstash Redis (`@upstash/redis` + `@upstash/ratelimit`)
- **Meme rendering:** `satori` + `@resvg/resvg-js` (server-side React → SVG → PNG)
- **Image optimization:** `sharp`
- **Icons:** lucide-react
- **Toasts:** sonner
- **Analytics:** PostHog (`posthog-js`) + Vercel Analytics
- **Error tracking:** Sentry (`@sentry/nextjs`)
- **Deployment target:** Vercel (Node 20 runtime for `/api/roast`, Edge runtime for read endpoints)

---

## 3. PROJECT STRUCTURE

Create this exact folder structure:

```
roast-my-pet/
├── app/
│   ├── layout.tsx                       # Root layout, fonts, providers
│   ├── page.tsx                         # Landing page
│   ├── globals.css                      # Tailwind + design tokens
│   ├── upload/
│   │   └── page.tsx                     # Upload + form page
│   ├── r/
│   │   └── [shortId]/
│   │       ├── page.tsx                 # Result/share page (ISR)
│   │       └── opengraph-image.tsx      # Dynamic OG image
│   ├── gallery/
│   │   ├── page.tsx                     # Public gallery
│   │   └── top/
│   │       └── page.tsx                 # Top roasts (today/week/all-time)
│   ├── about/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   ├── terms/
│   │   └── page.tsx
│   └── api/
│       ├── upload-url/route.ts          # POST: signed upload URL
│       ├── roast/route.ts               # POST: generate roast
│       ├── roast/[shortId]/route.ts     # GET: fetch roast
│       ├── roast/[shortId]/regenerate/route.ts  # POST
│       ├── roast/[shortId]/share/route.ts       # POST: log share
│       ├── roast/[shortId]/react/route.ts       # POST: emoji reaction
│       ├── roast/[shortId]/flag/route.ts        # POST: report
│       ├── gallery/route.ts             # GET: paginated gallery
│       └── gallery/top/route.ts         # GET: top roasts
├── components/
│   ├── ui/                              # shadcn primitives (button, input, etc.)
│   ├── upload-dropzone.tsx
│   ├── trait-chip.tsx
│   ├── roast-level-slider.tsx
│   ├── meme-card.tsx                    # Renders preview of meme
│   ├── share-sheet.tsx
│   ├── archetype-badge.tsx
│   ├── loading-scene.tsx                # Animated loader
│   ├── reaction-bar.tsx
│   ├── live-roast-wall.tsx              # Marquee on landing
│   ├── header.tsx
│   └── footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Browser client
│   │   ├── server.ts                    # Server client (service role)
│   │   └── types.ts                     # Generated DB types
│   ├── gemini/
│   │   ├── client.ts                    # Gemini SDK init
│   │   ├── moderate.ts                  # Pre-moderation call
│   │   ├── roast.ts                     # Roast generation call
│   │   └── prompts.ts                   # All prompt strings
│   ├── meme/
│   │   ├── render.ts                    # Satori → PNG pipeline
│   │   ├── templates/
│   │   │   ├── classic.tsx              # JSX template
│   │   │   ├── polaroid.tsx
│   │   │   └── tabloid.tsx
│   │   └── fonts.ts                     # Load fonts for satori
│   ├── ratelimit.ts                     # Upstash ratelimit helpers
│   ├── redis.ts                         # Upstash redis client
│   ├── archetypes.ts                    # Archetype library (data)
│   ├── traits.ts                        # Trait list constant
│   ├── short-id.ts                      # nanoid wrapper for /r/:id slugs
│   ├── analytics.ts                     # PostHog wrapper
│   └── utils.ts                         # cn() etc.
├── public/
│   ├── fonts/                           # Inter, a display font, a handwritten font
│   ├── og-default.png
│   ├── examples/                        # Sample meme images for landing
│   └── favicon.ico
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql
├── .env.example
├── .env.local                           # User fills in
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. ENVIRONMENT VARIABLES

Create `.env.example`:

```bash
# Public (browser-safe)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Server-only secrets
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Feature flags
ENABLE_PUBLIC_GALLERY=true
ENABLE_RATE_LIMIT=true
DAILY_GENERATION_CAP=10000   # Hard cap to control costs
```

---

## 5. DESIGN SYSTEM

### 5.1 Brand
- **Name:** Roast My Pet
- **Tagline:** *Every pet is cute. Some just deserve a little roasting.*
- **Tone:** Playful, irreverent, premium-meme energy. Not corporate. Not childish.

### 5.2 Color Palette (Tailwind tokens in `globals.css`)
```css
:root {
  --background: #FFFBF5;          /* warm off-white */
  --foreground: #0F0E13;          /* near-black */
  --primary: #FF5A1F;             /* hot orange (the "fire") */
  --primary-foreground: #FFFFFF;
  --accent: #FFD23F;              /* mustard yellow */
  --muted: #F5EFE6;
  --muted-foreground: #6B6B6B;
  --border: #E8E2D6;
  --card: #FFFFFF;
  --destructive: #E53935;
  --radius: 1rem;
}
.dark {
  --background: #0F0E13;
  --foreground: #FFFBF5;
  --primary: #FF7A3F;
  --muted: #1C1B22;
  --muted-foreground: #A0A0A0;
  --border: #2A2832;
  --card: #1A1820;
}
```

### 5.3 Typography
- **Display:** "Bricolage Grotesque" (Google Fonts) — for headlines and roast text in memes
- **Body:** "Inter" (Google Fonts)
- **Handwritten accent:** "Caveat" (Google Fonts) — for Polaroid template + UI accents
- Load all three from Google Fonts. Self-host via `next/font/google`.

### 5.4 Visual Language
- Big rounded corners (1rem default)
- Soft shadows, never harsh
- Generous whitespace
- Playful microinteractions (Framer Motion) on every CTA
- Confetti burst (canvas-confetti) when roast successfully reveals
- Subtle paper-grain texture on cards (via SVG noise filter in CSS)

---

## 6. PAGE-BY-PAGE SPECIFICATIONS

### 6.1 `/` — Landing Page

**Sections in order:**

1. **Header** — Logo wordmark left ("🔥 Roast My Pet"), nav links right (Gallery · How It Works · About). Sticky, blur backdrop on scroll.

2. **Hero**
   - Headline (display font, ~5rem desktop / 2.5rem mobile):
     > "Your pet has been getting away with too much."
   - Subheadline:
     > "Upload a photo. Get an AI-generated roast and a meme so good your group chat will riot. Free, no signup."
   - Primary CTA: **"Roast My Pet 🔥"** (large pill, primary color, scale-up on hover) → `/upload`
   - To the right (or below on mobile): an animated 3-card stack showing example pets with their roasts, gently rotating/floating via Framer Motion.

3. **How It Works** (3 steps with big numbered circles)
   - 1️⃣ **Upload** any photo of your pet
   - 2️⃣ **Add** name and personality (or skip)
   - 3️⃣ **Get roasted** — share your meme everywhere

4. **Live Roast Wall** — Horizontal auto-scrolling marquee of 12 recent public meme thumbnails. Pulls from `/api/gallery?limit=12`. Pauses on hover. Click → `/r/[shortId]`.

5. **Roast Levels Demo** — Same pet photo, three roast cards side-by-side: Cute / Medium / Savage. Animated tab transitions.

6. **FAQ Accordion** (use shadcn Accordion):
   - Is this free? *Yes, totally free.*
   - Do you store my pet's photo? *Only if you opt in to the gallery. Otherwise it auto-deletes in 30 days.*
   - Will it be mean? *Only as mean as you ask. Pick "Cute" for gentle teasing.*
   - Can I share it? *Built for sharing — one tap to Instagram, TikTok, X, WhatsApp.*
   - Does it work on cats / birds / lizards? *Yes. Anything with a face (and some without).*

7. **Big Final CTA** — Full-width band with primary background, centered "Roast My Pet 🔥" button.

8. **Footer** — Links (Privacy, Terms, About), social icons (X, Instagram, TikTok), © year.

### 6.2 `/upload` — Upload Page

Single-column layout, max-width 720px, vertically centered on tall screens.

**Form fields (in order):**

1. **Photo upload** (UploadDropzone component)
   - Drag-and-drop zone OR tap-to-browse OR webcam button (mobile)
   - Accepts: JPG, PNG, WEBP, HEIC
   - Max 10 MB; auto-compressed client-side to ~2 MB before upload
   - Live preview thumbnail with "Replace" button
   - On select: show small spinner during compression + signed-URL fetch

2. **Pet name** (Input, required, max 30 chars) — placeholder: "Tofu, Bruno, Princess Whiskerton III..."

3. **Pet type** (Select, optional) — Dog / Cat / Bird / Rabbit / Reptile / Exotic / Other / "Let AI guess"

4. **Personality traits** (TraitChip multi-select, max 5, optional)
   - Render all traits from `lib/traits.ts` as toggleable chips
   - Show "X / 5 selected" hint

5. **Roast level** (RoastLevelSlider — segmented control with 3 options)
   - Cute 🍼 · Medium 🌶️ · Savage 🔥🔥🔥
   - Default: Medium
   - Each option shows a 1-line description below on selection

6. **Roast style** (Select, optional) — Default / Standup / Shakespearean / Gen Z / Corporate / Pirate / Rap

7. **Submit button** — Full-width, primary, "Roast My Pet 🔥". Disabled until photo + name present.

**Validation:** Client-side via Zod on submit. Show inline errors. On submit, transition to loading scene (do NOT navigate; replace form area in-place with `<LoadingScene />`).

### 6.3 Loading Scene (no URL change)

- Full-viewport overlay (animated, fades in)
- Animated SVG pet silhouette being "scanned" by an orange laser line (Framer Motion)
- Below: rotating witty copy (change every 2s):
  - *"Consulting the comedy council..."*
  - *"Reviewing your pet's life choices..."*
  - *"Polishing the punchline..."*
  - *"Asking three other pets for opinions..."*
  - *"Deciding which fur to make fun of..."*
- Progress bar (indeterminate)
- ARIA live region announces state changes for screen readers
- On success: route push to `/r/[shortId]`
- On error: dismiss overlay, show toast with error + "Try again" button

### 6.4 `/r/[shortId]` — Result / Share Page

ISR revalidate: 3600 seconds. Generate dynamic OG image via `app/r/[shortId]/opengraph-image.tsx`.

**Layout (mobile-first, single column, max 640px):**

1. **MemeCard** — The square 1080×1080 meme rendered as `<Image />`. Animated entrance (scale + fade via Framer Motion). Tap to expand fullscreen.

2. **Roast text** — Big display font, 1.875rem mobile / 2.5rem desktop, centered.

3. **ArchetypeBadge** — Pill with emoji + archetype name (e.g. "🛋️ Couch Goblin"). Clickable → filters gallery.

4. **Action bar** (sticky bottom on mobile):
   - Share to Instagram Story
   - Share to TikTok (deep link if mobile, else copy-link toast)
   - Share to X (`https://twitter.com/intent/tweet?...`)
   - Share to WhatsApp (`whatsapp://send?text=...`)
   - Copy link
   - Download PNG (square)
   - Download Story (1080×1920)
   - Each share triggers `POST /api/roast/[shortId]/share` with channel name

5. **Secondary actions:**
   - **"Roast Again 🎲"** button (regenerates with same image, shows loader in place, replaces meme + roast on success)
   - **"Roast Another Pet"** → `/upload`

6. **Public toggle:** "Share to public gallery?" (Switch). Default off. Persists via patch endpoint.

7. **Reactions row:** 5 emoji buttons (😂 🔥 💀 😭 👑) with counts. Tap to toggle. POST to react endpoint.

8. **Below the fold:** "More [Archetype] roasts" — grid of 6 related public roasts.

9. **Tiny "Report" link** at bottom for content moderation.

### 6.5 `/gallery` — Public Gallery

- Header with archetype filter chips and roast-level filter
- Masonry grid (3 columns desktop, 2 tablet, 1 mobile)
- Each card: meme thumbnail + pet name + archetype badge + reaction count
- Infinite scroll (TanStack Query + Intersection Observer)
- Tap card → `/r/[shortId]`

### 6.6 `/gallery/top` — Top Roasts

- Tabs: Today · This Week · All-Time
- Top 10 cards per tab with rank numbers (#1, #2...)
- Reaction count drives ranking

### 6.7 `/about`, `/privacy`, `/terms`

Long-form Markdown-rendered pages. Privacy must explain: no raw IP storage, EXIF stripping, 30-day auto-deletion of anonymous roasts, opt-in gallery, GDPR delete instructions.

---

## 7. DATABASE SCHEMA

Place in `supabase/migrations/0001_initial_schema.sql`. Run via Supabase CLI or paste in SQL editor.

```sql
-- USERS (optional, V1 anonymous-first)
create table public.users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique,
  display_name  text,
  created_at    timestamptz not null default now()
);

-- ROASTS
create table public.roasts (
  id                  uuid primary key default gen_random_uuid(),
  short_id            text unique not null,
  user_id             uuid references public.users(id) on delete set null,
  anon_session_id     text,
  pet_name            text not null,
  pet_type            text,
  traits              text[] not null default '{}',
  roast_level         text not null check (roast_level in ('cute','medium','savage')),
  roast_style         text not null default 'default',
  source_image_url    text not null,
  roast_text          text not null,
  archetype           text not null,
  archetype_emoji     text not null,
  vibe_tags           text[] not null default '{}',
  follow_up           text,
  visual_observation  text,
  is_public           boolean not null default false,
  is_flagged          boolean not null default false,
  model_used          text not null,
  generation_ms       int,
  owner_token         text not null,    -- one-time secret for "delete my roast"
  created_at          timestamptz not null default now()
);
create index roasts_short_id_idx on public.roasts (short_id);
create index roasts_public_recent_idx on public.roasts (is_public, created_at desc) where is_flagged = false;
create index roasts_archetype_idx on public.roasts (archetype);

-- MEME ASSETS
create table public.meme_assets (
  id          uuid primary key default gen_random_uuid(),
  roast_id    uuid not null references public.roasts(id) on delete cascade,
  format      text not null check (format in ('square','story','landscape')),
  template    text not null check (template in ('classic','polaroid','tabloid')),
  url         text not null,
  width       int not null,
  height      int not null,
  bytes       int,
  created_at  timestamptz not null default now()
);
create index meme_assets_roast_id_idx on public.meme_assets (roast_id);

-- SHARE EVENTS
create table public.share_events (
  id          bigserial primary key,
  roast_id    uuid not null references public.roasts(id) on delete cascade,
  channel     text not null,
  occurred_at timestamptz not null default now(),
  ip_hash     text,
  user_agent  text
);
create index share_events_roast_id_idx on public.share_events (roast_id);

-- REACTIONS
create table public.reactions (
  id         bigserial primary key,
  roast_id   uuid not null references public.roasts(id) on delete cascade,
  emoji      text not null,
  ip_hash    text not null,
  created_at timestamptz not null default now(),
  unique (roast_id, emoji, ip_hash)
);

-- FLAGS
create table public.flags (
  id               bigserial primary key,
  roast_id         uuid not null references public.roasts(id) on delete cascade,
  reason           text,
  reporter_ip_hash text,
  status           text not null default 'pending' check (status in ('pending','dismissed','removed')),
  created_at       timestamptz not null default now()
);

-- STORAGE BUCKETS (run via Supabase dashboard or SQL):
-- Create bucket 'pet-uploads' (public read = false, signed URLs only)
-- Create bucket 'memes' (public read = true)

-- ROW LEVEL SECURITY
alter table public.roasts enable row level security;
alter table public.meme_assets enable row level security;
alter table public.share_events enable row level security;
alter table public.reactions enable row level security;
alter table public.flags enable row level security;

-- Public can read public, non-flagged roasts
create policy "public reads public roasts" on public.roasts
  for select using (is_public = true and is_flagged = false);

-- Public can read meme assets for public roasts
create policy "public reads memes for public roasts" on public.meme_assets
  for select using (
    exists (select 1 from public.roasts r
            where r.id = meme_assets.roast_id
              and r.is_public = true
              and r.is_flagged = false)
  );

-- All writes go through service role (API routes), no user-facing insert policies needed.
```

---

## 8. SUPABASE STORAGE

Create two buckets via Supabase dashboard or SQL:
- **`pet-uploads`** — Private. Used for source pet photos. Files uploaded with signed URL. Auto-delete via cron after 30 days unless attached to a public roast.
- **`memes`** — Public read. CDN-cached. Stores generated meme PNGs (`{shortId}_square.png`, `{shortId}_story.png`, `{shortId}_landscape.png`).

---

## 9. GEMINI INTEGRATION (CRITICAL)

### 9.1 Client Init — `lib/gemini/client.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const flashModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.9,
    topP: 0.95,
    maxOutputTokens: 400,
    responseMimeType: 'application/json',
  },
});

export const moderationModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.1,
    maxOutputTokens: 200,
    responseMimeType: 'application/json',
  },
});
```

### 9.2 Pre-Moderation — `lib/gemini/moderate.ts`

Fetch the uploaded image, base64-encode, send to Gemini with this exact prompt:

```
You are an image moderator for a pet roast app. Look at the attached image
and respond with strictly valid JSON only. No prose.

Schema:
{
  "is_pet": boolean,
  "pet_type": "dog" | "cat" | "bird" | "rabbit" | "reptile" | "exotic" | "other" | null,
  "is_appropriate": boolean,
  "image_quality": "good" | "blurry" | "too_dark" | "too_small",
  "reject_reason": string | null
}

Rules:
- is_pet is true ONLY if a recognizable pet animal is the main subject.
- is_appropriate is false if NSFW, violent, contains identifiable minors as
  the main subject, or shows distress/abuse.
- reject_reason is a one-sentence user-friendly reason, or null if no issue.
```

If `is_pet === false || is_appropriate === false`, throw an error caught by the API route that returns `{ error: "NO_PET_DETECTED" | "INAPPROPRIATE_IMAGE", message }`.

### 9.3 Roast Generation — `lib/gemini/roast.ts`

**System prompt (full):**

```
You are "Roast My Pet" — a comedy writer specializing in short, clever,
shareable roasts of household pets. You are funny, observational, and
warm-hearted: the joke is on the pet's vibe, never the owner.

You will receive:
- A photo of a pet
- The pet's name
- Optional: pet type, personality traits, roast level, roast style

You must:
1. Look closely at the photo. Notice posture, expression, fur, accessories,
   background, lighting — anything that adds comedic specificity.
2. Write ONE roast that is highly specific to THIS pet (no generic jokes
   that could apply to any animal).
3. Use the pet's name naturally — at least once, never more than twice.
4. Match the requested ROAST LEVEL strictly:
   - "cute": playful teasing, no edge, kid-safe.
   - "medium": clever internet humor, mild attitude.
   - "savage": brutal, witty, edgy — but never hateful, racist, or sexual.
5. Match the requested ROAST STYLE if provided:
   - default: punchy modern internet voice
   - standup: setup-then-punchline cadence
   - shakespearean: archaic, dramatic, "thou" energy
   - genz: very online, ironic, lowercase
   - corporate: HR-memo tone applied to the pet
   - pirate: arr, ye, scallywag
   - rap: rhyming bars, two lines
6. Keep the roast between 18 and 35 words. Punchy beats long.
7. Assign ONE archetype from the provided list that best matches the pet.
8. Output strictly valid JSON in the schema below. No prose outside JSON.

NEVER:
- Mention the owner's appearance, race, gender, or identity.
- Joke about the pet being abused, sick, dying, or in distress.
- Use slurs, sexual content, or profanity above the requested level.
- Output anything outside the JSON schema.

OUTPUT SCHEMA:
{
  "roast": "string (18-35 words)",
  "archetype": "string (must match exactly one of the approved archetypes)",
  "archetype_emoji": "string (the matching emoji from the approved list)",
  "vibe_tags": ["string","string","string"],
  "follow_up_zinger": "string (≤15 words)",
  "visual_observation": "string (1 sentence describing what you saw)"
}
```

**User prompt template:**

```
PET NAME: {{name}}
PET TYPE: {{type | "unknown — infer from photo"}}
PERSONALITY TRAITS: {{traits.join(", ") | "none provided"}}
ROAST LEVEL: {{level}}
ROAST STYLE: {{style}}

APPROVED ARCHETYPES (pick exactly one — copy name and emoji exactly):
{{archetype_list}}   // e.g. "🤡 Chaos Gremlin — high-energy, no remorse\n👑 Household Dictator — bossy..."

Now look at the attached photo and roast this pet.
```

The function fetches the image bytes from the signed Supabase URL, base64-encodes, and passes as inline data along with the text prompt. Parse the response as JSON. Validate with Zod. If parsing fails, retry once with temperature 0.7. If still failing, throw `GENERATION_FAILED`.

### 9.4 Archetype Library — `lib/archetypes.ts`

Export this exact array (extend to 30 if time permits, minimum 15):

```typescript
export const ARCHETYPES = [
  { name: 'Chaos Gremlin',       emoji: '🤡', desc: 'High-energy, breaks things, no remorse' },
  { name: 'Household Dictator',  emoji: '👑', desc: 'Bossy, demanding, opinionated' },
  { name: 'Snack Addict',        emoji: '🍔', desc: 'Always begging, food-obsessed' },
  { name: 'Couch Goblin',        emoji: '🛋️', desc: 'Lazy, judgmental from the cushions' },
  { name: 'Suspicious Potato',   emoji: '🥔', desc: 'Round, paranoid, sus' },
  { name: 'Professional Sleeper',emoji: '😴', desc: 'Sleeps 22 hours a day' },
  { name: 'Drama Queen',         emoji: '🎭', desc: 'Theatrical, attention-seeking' },
  { name: 'Tiny Detective',      emoji: '🕵️', desc: 'Sniffs everything, investigates' },
  { name: 'Mastermind',          emoji: '🦹', desc: 'Plotting something, always' },
  { name: 'Walking Disaster',    emoji: '🌪️', desc: 'Chaos incarnate' },
  { name: 'Soft Launch',         emoji: '🥹', desc: 'Acts tough, secretly clingy' },
  { name: 'Vibe Curator',        emoji: '🎧', desc: 'Aesthetic, moody, photogenic' },
  { name: 'Snitch',              emoji: '📣', desc: 'Barks at literally everything' },
  { name: 'Fluff Cloud',         emoji: '☁️', desc: '90% fur, 10% personality' },
  { name: 'Goblin Mode',         emoji: '👹', desc: 'Permanently feral' },
] as const;
```

### 9.5 Trait List — `lib/traits.ts`

```typescript
export const TRAITS = [
  'Lazy', 'Chaotic', 'Dramatic', 'Aggressive', 'Friendly',
  'Suspicious', 'Clingy', 'Greedy', 'Sleepy', 'Goofy',
  'Anxious', 'Royal', 'Diva', 'Derpy', 'Grumpy',
] as const;
```

---

## 10. MEME RENDERING

### 10.1 Pipeline — `lib/meme/render.ts`

```typescript
// Pseudocode for the pipeline
async function renderMeme({
  template, format, petImageUrl, roast, petName, archetype, archetypeEmoji, level
}) {
  const TemplateComponent = templates[template];
  const { width, height } = FORMAT_DIMENSIONS[format]; // square 1080x1080, story 1080x1920, landscape 1200x630

  // 1. Fetch + downscale pet image with sharp
  const petImageBuffer = await downloadAndResize(petImageUrl, width, height);
  const petImageDataUrl = `data:image/jpeg;base64,${petImageBuffer.toString('base64')}`;

  // 2. Use satori to convert React → SVG
  const svg = await satori(
    <TemplateComponent
      petImageDataUrl={petImageDataUrl}
      roast={roast}
      petName={petName}
      archetype={archetype}
      archetypeEmoji={archetypeEmoji}
      level={level}
    />,
    { width, height, fonts: await loadFonts() }
  );

  // 3. Convert SVG → PNG with resvg
  const pngBuffer = new Resvg(svg).render().asPng();

  // 4. Optimize with sharp
  return sharp(pngBuffer).png({ quality: 85, compressionLevel: 9 }).toBuffer();
}
```

### 10.2 Template Specs

**Classic (`templates/classic.tsx`):**
- Pet image full-bleed background, darkened with linear gradient overlay (transparent top → black 70% bottom)
- Roast text bottom 40% area, white display font, dynamic font size (24–60px) auto-fit
- Top-right: archetype emoji + name pill (white bg, black text)
- Bottom-right tiny watermark: `roastmypet.com`

**Polaroid (`templates/polaroid.tsx`):**
- White card with paper texture (use SVG noise filter)
- Pet image as large square photo at top with white border
- Below photo: handwritten font ("Caveat") roast text
- Tiny date stamp + watermark in bottom corner

**Tabloid (`templates/tabloid.tsx`):**
- Yellow header band: "EXCLUSIVE 🚨" in bold
- Pet image left half, big bold serif headline (the roast) right half
- Bottom strip: "ROAST MY PET • DAILY EDITION • roastmypet.com"

**Color tinting per level:**
- Cute: pastel pink overlay accent
- Medium: warm orange (brand primary) accent
- Savage: high-contrast neon red/yellow accent

### 10.3 Fonts — `lib/meme/fonts.ts`

Load Bricolage Grotesque (regular + bold), Inter (regular + bold), and Caveat (regular) from `public/fonts/` as ArrayBuffers. Cache in module scope.

### 10.4 Storage

After rendering all 3 formats, upload to `memes` bucket as `{shortId}_{format}.png`. Get public URLs. Insert rows into `meme_assets`.

---

## 11. API ENDPOINTS — FULL SPEC

All endpoints return JSON. All errors follow `{ error: string, message: string }` shape with appropriate HTTP status. Use Zod for validation. Apply rate limiting via Upstash. Hash IPs with SHA-256 + salt before storing.

### 11.1 `POST /api/upload-url`

**Request:** `{ filename: string, contentType: string }`

**Response:** `{ uploadUrl: string, publicUrl: string, path: string }`

Generates a Supabase Storage signed upload URL for the `pet-uploads` bucket. Path format: `{yyyy}/{mm}/{dd}/{nanoid}.{ext}`. Rate-limited to 5/min/IP.

### 11.2 `POST /api/roast`

**Request:**
```json
{
  "image_url": "string (Supabase signed URL or path)",
  "pet_name": "string (1-30 chars)",
  "pet_type": "dog|cat|bird|rabbit|reptile|exotic|other|null",
  "traits": ["string"],
  "roast_level": "cute|medium|savage",
  "roast_style": "default|standup|shakespearean|genz|corporate|pirate|rap"
}
```

**Pipeline:**
1. Zod validate.
2. Rate limit: 10/hour/IP.
3. Strip query params from `image_url` to get storage path. Verify file exists in bucket.
4. Insert pending row in `roasts` (status not strictly tracked, but with placeholder values).
5. Call `moderate(imageUrl)` → if fails, delete row, return error.
6. Call `roast({ imageUrl, name, type, traits, level, style })` → returns parsed JSON.
7. Render 3 meme formats in parallel via `Promise.all`.
8. Upload memes to `memes` bucket.
9. Update `roasts` row + insert `meme_assets` rows.
10. Generate `owner_token` (nanoid 32) for delete-my-roast.
11. Track event in PostHog (`roast_generated`).
12. Return:
```json
{
  "id": "uuid",
  "short_id": "rAb12X",
  "roast": "...",
  "archetype": "Couch Goblin",
  "archetype_emoji": "🛋️",
  "vibe_tags": ["lazy","judgemental","soft"],
  "follow_up": "...",
  "meme_urls": {
    "square": "https://.../rAb12X_square.png",
    "story":  "https://.../rAb12X_story.png",
    "landscape": "https://.../rAb12X_landscape.png"
  },
  "share_url": "https://roastmypet.com/r/rAb12X",
  "owner_token": "..."  // returned ONCE, client stores in localStorage
}
```

**Errors:** `NO_PET_DETECTED` (400), `INAPPROPRIATE_IMAGE` (400), `RATE_LIMITED` (429), `GENERATION_FAILED` (500), `DAILY_CAP_REACHED` (503).

Runtime: `nodejs` (needs sharp + satori). Max duration: 30s.

### 11.3 `GET /api/roast/[shortId]`

Public read. Returns full roast + meme_urls + reaction counts. Cached in Redis 60s. Edge runtime OK.

### 11.4 `POST /api/roast/[shortId]/regenerate`

Re-runs roast generation with the same image_url and inputs from the existing row. Updates row in place. Limited to 3 regenerations per roast (track in column or Redis).

### 11.5 `POST /api/roast/[shortId]/share`

**Request:** `{ channel: "instagram"|"tiktok"|"x"|"whatsapp"|"facebook"|"copy_link"|"download" }`
Inserts into `share_events`. Rate limit 60/min/IP. Returns `{ ok: true }`.

### 11.6 `POST /api/roast/[shortId]/react`

**Request:** `{ emoji: "😂"|"🔥"|"💀"|"😭"|"👑" }`
Toggles reaction (uses unique constraint). Returns updated counts.

### 11.7 `POST /api/roast/[shortId]/flag`

**Request:** `{ reason: string }`
Inserts into `flags`. Auto-flag (`is_flagged = true`) after 3 unique reports.

### 11.8 `GET /api/gallery`

Query params: `cursor`, `limit` (max 24), `archetype`, `level`.
Returns `{ items: [...], nextCursor: string | null }`.
Edge runtime, Redis-cached 60s per query key.

### 11.9 `GET /api/gallery/top`

Query: `period: "today"|"week"|"all"`. Returns top 10 by reaction count (sum across emojis). Cached 5 min.

---

## 12. RATE LIMITING — `lib/ratelimit.ts`

Use `@upstash/ratelimit` sliding window:
- `uploadLimiter`: 5/min/IP
- `roastLimiter`: 10/hour/IP
- `reactionLimiter`: 60/min/IP
- `shareLimiter`: 60/min/IP

Skip if `ENABLE_RATE_LIMIT=false`. Include `retry_after` seconds in 429 responses.

Also implement **daily global cap**: Redis counter `roasts:count:{yyyy-mm-dd}`, max = `DAILY_GENERATION_CAP` env. If exceeded, return `DAILY_CAP_REACHED`.

---

## 13. CACHING — `lib/redis.ts`

- Cache `/api/roast/:shortId` responses for 60s (key: `roast:{shortId}`)
- Cache `/api/gallery` queries for 60s (key includes filters)
- Cache `/api/gallery/top` for 5min
- Image dedup cache: hash of `(image_sha256 + pet_name + traits + level)` → existing `short_id`. If hit, return cached roast (24h TTL). Saves Gemini cost on duplicate submissions.

---

## 14. CLIENT-SIDE BEHAVIORS

### 14.1 Upload Flow Code Sketch

```typescript
// In /upload page submit handler:
1. Compress image client-side via browser-image-compression (maxSizeMB: 2, maxWidthOrHeight: 1920)
2. Strip EXIF (the lib does this by default)
3. POST /api/upload-url with { filename, contentType } → get { uploadUrl, publicUrl }
4. PUT file to uploadUrl (signed URL, direct to Supabase Storage)
5. POST /api/roast with { image_url: publicUrl, ...formData }
6. On success: store owner_token in localStorage under key `roast:owner:{shortId}`, router.push(share_url)
7. On error: show toast, allow retry
```

### 14.2 Sharing — `components/share-sheet.tsx`

- **Web Share API** if available (`navigator.share`) with image blob
- Fallback per channel:
  - **Instagram Story:** Open `instagram://story-camera` with image (mobile only). Else: download + instructions toast.
  - **TikTok:** Open `snssdk1233://` deep link. Else: download.
  - **X:** `https://twitter.com/intent/tweet?text={encodedRoast}&url={shareUrl}`
  - **WhatsApp:** `https://wa.me/?text={encoded}`
  - **Facebook:** `https://www.facebook.com/sharer/sharer.php?u={shareUrl}`
  - **Copy link:** `navigator.clipboard.writeText(shareUrl)` + toast
  - **Download:** trigger PNG download via temporary `<a download>`
- Every click POSTs to `/api/roast/[shortId]/share` with channel name (fire-and-forget)

### 14.3 PostHog Events to Track

`page_viewed`, `upload_started`, `upload_completed`, `roast_generated`, `roast_failed`, `roast_viewed`, `share_clicked` (with channel), `download_clicked`, `regenerate_clicked`, `reaction_added`, `gallery_viewed`, `made_public`.

---

## 15. SECURITY & PRIVACY

- **EXIF stripping** on every upload (client + server validation)
- **IP hashing**: SHA-256 of `IP + DAILY_SALT` (rotated daily, stored in env)
- **CSP headers** in `next.config.ts`: restrict scripts to self + analytics
- **Signed URLs** for source images (1-hour expiry)
- **Owner token system**: enables anonymous "delete my roast" without auth — token stored in localStorage and required to call delete endpoint
- **Auto-deletion cron**: Vercel Cron Job runs daily, deletes anonymous, non-public roasts older than 30 days + their storage objects
- **Content moderation**: Pre-Gemini moderation + auto-flag at 3 reports + manual review queue accessible via simple admin page (`/admin`, gated by `ADMIN_PASSWORD` env)
- **No raw IPs** ever stored
- **No user data sold or shared** — call this out in Privacy page

---

## 16. CRON JOBS (Vercel Cron in `vercel.json`)

```json
{
  "crons": [
    { "path": "/api/cron/cleanup-anon-roasts", "schedule": "0 4 * * *" },
    { "path": "/api/cron/refresh-top-cache",   "schedule": "*/15 * * * *" }
  ]
}
```

Implement `/api/cron/cleanup-anon-roasts/route.ts`: deletes roasts where `user_id IS NULL AND is_public = false AND created_at < now() - interval '30 days'`. Cascades to memes via FK. Also deletes orphaned files in `pet-uploads` bucket.

---

## 17. PERFORMANCE TARGETS

- Lighthouse Performance ≥ 95 on landing
- LCP < 1.8s
- Time to roast (button click → meme rendered on screen) < 8s p75
- All meme images served through CDN with `Cache-Control: public, max-age=31536000, immutable`
- Use `next/image` everywhere with proper `priority` / `loading` attrs
- Defer PostHog and Sentry until after first interaction

---

## 18. ACCESSIBILITY REQUIREMENTS

- All interactive elements keyboard-navigable
- Focus rings visible on all CTAs (Tailwind `focus-visible:`)
- Form inputs have associated labels
- Loading state has `role="status"` + `aria-live="polite"`
- Color contrast AA minimum
- Honor `prefers-reduced-motion` (skip Framer Motion entrance animations)
- Alt text on every image (use roast text for memes)
- Skip-to-content link at top of every page

---

## 19. SEO & META

- `metadata` exports on every page with title, description, OG image
- `app/r/[shortId]/opengraph-image.tsx` generates a 1200×630 image dynamically using satori (reuse landscape meme template)
- Twitter `summary_large_image` cards
- Sitemap auto-generated at `/sitemap.xml`
- `robots.txt` allowing all
- Schema.org JSON-LD: `WebApplication` on landing, `CreativeWork` on share pages
- Programmatic SEO pages: pre-build `/roast-my-[breed]` for top 50 dog breeds + top 30 cat breeds (static landing pages with breed-specific examples and CTAs)

---

## 20. README CONTENT

Write a concise README.md with:
1. One-line product summary + screenshot
2. Tech stack list
3. Local setup:
   ```bash
   git clone ...
   cd roast-my-pet
   pnpm install
   cp .env.example .env.local
   # Fill in env vars (see below)
   pnpm dev
   ```
4. Environment variables table with where to get each one
5. Supabase setup steps (run migration, create buckets)
6. Deploying to Vercel (link envs, set runtime to Node 20 for /api/roast)
7. How to run tests: `pnpm test` (vitest) + `pnpm test:e2e` (playwright)

---

## 21. ACCEPTANCE CRITERIA — DEFINITION OF DONE

Mark complete only when ALL of these are true:

- [ ] `pnpm dev` starts and landing page renders with all sections
- [ ] User can upload a pet photo, fill the form, and receive a roast in under 10 seconds
- [ ] Result page renders with meme image, roast text, archetype badge, working share buttons
- [ ] Share to X opens prefilled tweet with link and roast
- [ ] Download button saves a PNG of the meme
- [ ] "Roast Again" generates a new roast for the same pet without re-uploading
- [ ] Toggling "make public" causes the roast to appear in `/gallery`
- [ ] Gallery loads with infinite scroll
- [ ] Top roasts page shows ranked list across 3 time periods
- [ ] Direct link to `/r/[shortId]` works (ISR), shows correct OG card preview when shared
- [ ] Rate limiting blocks excessive requests with 429 + retry_after
- [ ] Bad image (no pet) is rejected with friendly error
- [ ] NSFW image is rejected
- [ ] Mobile responsive — works perfectly at 375×667 (iPhone SE) and up
- [ ] Lighthouse score ≥ 95 perf / ≥ 95 a11y / ≥ 95 SEO on landing page
- [ ] Dark mode works across all pages
- [ ] All env vars documented in README + `.env.example`
- [ ] Deployable to Vercel with no code changes — just env vars
- [ ] No secrets committed; `.env.local` in `.gitignore`
- [ ] Sentry catches and reports a thrown error in dev
- [ ] PostHog receives `roast_generated` event after a roast

---

## 22. EXAMPLE OUTPUTS (FOR QA REFERENCE)

When testing with a sleepy cat photo named "Mochi", traits=["sleepy"], level="cute", a good output looks like:

```json
{
  "roast": "Mochi has spent so long in loaf form that the bakery union is asking questions. She wakes up only to confirm that yes, the floor is still down there, then commits to another nap.",
  "archetype": "Professional Sleeper",
  "archetype_emoji": "😴",
  "vibe_tags": ["sleepy","loaf","unbothered"],
  "follow_up_zinger": "Her LinkedIn just says 'horizontal'.",
  "visual_observation": "A small cream-colored cat curled into a tight loaf shape on a beige rug, eyes barely open."
}
```

When testing with a dramatic golden retriever named "Bruno", traits=["dramatic","clingy"], level="medium":

```json
{
  "roast": "Bruno doesn't have separation anxiety — you have separation anxiety. He's just exploiting it. The Oscar for 'Most Heartbreaking Sigh by a Golden Retriever' goes to: Bruno.",
  "archetype": "Drama Queen",
  "archetype_emoji": "🎭",
  "vibe_tags": ["dramatic","manipulative","golden"],
  "follow_up_zinger": "He sighs in three different keys depending on what he wants.",
  "visual_observation": "A golden retriever lying on a hardwood floor giving the camera a deeply wounded expression."
}
```

---

## 23. FINAL INSTRUCTIONS TO YOU (THE BUILDER)

1. **Build the entire project** as specified. Do not stub. Do not leave TODO comments for core features.
2. **Implement real Gemini integration** — the prompts and JSON schemas above are exact.
3. **Implement real meme rendering** with satori — at minimum the Classic template; Polaroid and Tabloid can be V1.5 if time pressure exists, but Classic must be production-quality.
4. **Real Supabase integration** — write the migration file, write storage upload code, write the typed client.
5. **Mobile-first responsive** at every step.
6. **No mock data in production code paths** — gallery and top pages query the real DB. If empty, show beautiful empty states with CTAs to upload.
7. **Polish matters**: animations, transitions, loading states, empty states, error states, success toasts. This product wins or loses on feel.
8. **Deliverable**: a runnable repo where after `pnpm install`, filling `.env.local`, and running the SQL migration, the app works end-to-end.

When you finish, output:
- A tree of all files created
- The contents of `package.json`
- A summary of any decisions you made where the spec was ambiguous
- Setup commands the user must run before `pnpm dev`

Now build it. Ship it. Make it funny.
