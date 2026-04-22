# Roast My Pet 🐾🔥

> A web app that turns your pet's photo into a savage, share-worthy roast — powered by Google Gemini.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Target Audience](#2-target-audience)
3. [Core Value Proposition](#3-core-value-proposition)
4. [User Flow](#4-user-flow)
5. [Feature Breakdown](#5-feature-breakdown)
6. [AI Workflow (Gemini)](#6-ai-workflow-gemini)
7. [Prompt Design](#7-prompt-design)
8. [Meme Generation System](#8-meme-generation-system)
9. [Technical Architecture](#9-technical-architecture)
10. [Tech Stack](#10-tech-stack)
11. [Database Structure](#11-database-structure)
12. [API Flow](#12-api-flow)
13. [Frontend Page Structure](#13-frontend-page-structure)
14. [Scalability Considerations](#14-scalability-considerations)
15. [Viral Growth Ideas](#15-viral-growth-ideas)
16. [Monetization](#16-monetization)
17. [Roadmap](#17-roadmap)
18. [Appendix](#18-appendix)

---

## 1. Product Vision

**Roast My Pet** is a viral-first, AI-powered humor app that transforms ordinary pet photos into hilarious, share-ready roasts and memes.

### Vision Statement

> *To become the internet's favorite way to celebrate the chaotic, weird, lovable absurdity of pets — one roast at a time.*

### Mission

Make every pet owner laugh out loud within 15 seconds of uploading a photo, and give them content so funny they can't help but share it.

### Guiding Principles

- **Funny first.** If it's not laugh-out-loud, it failed.
- **Frictionless.** Upload → Roast → Share in under 30 seconds.
- **Wholesome roasting.** Punch *up* at the pet's vibe, never *down* at the owner.
- **Shareability is the product.** Every output is designed to land on Instagram, TikTok, X, or a group chat.
- **Visually delightful.** Outputs should look like premium meme content, not generic AI cards.

---

## 2. Target Audience

| Segment | Description | Why They'll Use It |
|---|---|---|
| **Pet owners (18–45)** | Dog, cat, exotic pet owners who post about their pets | Want shareable content that shows off their pet's personality |
| **Gen Z humor crowd** | TikTok/Instagram Reels natives | Loves AI novelty + meme content |
| **Pet content creators** | Influencer pet accounts | Need fresh content angles for engagement |
| **Gift-givers** | Friends/family of pet owners | Want a fun, free, personalized gift |

**Primary persona:** *"Maya, 27, owns a chihuahua named Tofu, posts him on her finsta, would 100% share an AI roast in her group chat first, then her story."*

---

## 3. Core Value Proposition

**For** pet owners who love sharing their pet online
**Who** want fresh, funny content beyond a normal photo
**Roast My Pet** is an AI-powered humor generator
**That** turns any pet photo into a custom roast and shareable meme in under 30 seconds
**Unlike** generic meme templates or filters
**Our product** uses multimodal AI to riff on the pet's *actual* appearance and vibe.

---

## 4. User Flow

### Happy Path (No Login Required)

```
┌────────────┐     ┌────────────┐     ┌─────────────┐     ┌──────────────┐
│  Landing   │ →   │   Upload   │ →   │  Generating │ →   │    Result    │
│    Page    │     │  + Inputs  │     │  (loader)   │     │  + Share     │
└────────────┘     └────────────┘     └─────────────┘     └──────────────┘
                                                                  │
                                                                  ▼
                                                          ┌──────────────┐
                                                          │ Download /   │
                                                          │ Share / Roast│
                                                          │   Again      │
                                                          └──────────────┘
```

### Step-by-Step Journey

1. **Discover** — User lands on homepage (referral link, social share, or direct).
2. **Hook** — Hero section with rotating example roasts + "Roast My Pet 🔥" CTA.
3. **Upload** — Single-page form: photo, name, type, traits, roast level.
4. **Validate** — Client-side: file size, format, face/pet detection preview.
5. **Submit** — Async POST to `/api/roast`. Show animated loader (~5–10s).
6. **Generate** — Backend orchestrates: image upload → Gemini analysis → roast generation → meme rendering.
7. **Reveal** — Result page animates in: meme card, roast text, archetype badge.
8. **Share** — One-tap share to Instagram Story, TikTok, X, WhatsApp, copy link, download PNG.
9. **Re-engage** — "Roast Again" (regenerates with same photo, different angle), "Roast Another Pet," "See Today's Top Roasts."

### Edge Cases

- **No pet detected** → "We couldn't find a pet in this photo — try another?"
- **Inappropriate content** → Hard block via safety filter, friendly error.
- **Generation fails** → Auto-retry once, then fallback to a "safe" roast template.
- **Slow network** → Progressive upload + optimistic UI.

---

## 5. Feature Breakdown

### 5.1 Pet Photo Upload

- Drag-and-drop + tap-to-upload + paste from clipboard
- Formats: JPG, PNG, WEBP, HEIC (auto-converted)
- Max size: 10 MB (auto-compressed to ≤2 MB before upload)
- Client-side EXIF stripping (privacy)
- Optional: webcam capture for live shots

### 5.2 Pet Information Form

**Required:**
- Pet name (max 30 chars)
- Photo

**Optional:**
- Pet type (Dog / Cat / Bird / Rabbit / Reptile / Exotic / Other)
- Personality traits (multi-select, max 5):
  - Lazy, Chaotic, Dramatic, Aggressive, Friendly, Suspicious, Clingy, Greedy, Sleepy, Goofy, Anxious, Royal, Diva, Derpy, Grumpy
- Roast level (Cute / Medium / Savage)
- Roast style (Standup / Shakespearean / Gen Z / Corporate / Pirate / Rap)

### 5.3 Gemini-Powered Roast Generation

- Multimodal analysis (image + text inputs)
- Returns: roast text, archetype, "vibe" tag, optional follow-up zinger
- Safety-filtered for content appropriateness

### 5.4 Roast Levels

| Level | Tone | Example |
|---|---|---|
| **Cute 🍼** | Playful, gentle teasing | *"Mochi looks like she invented the concept of nap o'clock."* |
| **Medium 🌶️** | Solid joke, internet humor | *"Bruno isn't a guard dog. He's a carpet decoration that occasionally sighs."* |
| **Savage 🔥🔥🔥** | Brutal, edgy, no mercy | *"Luna doesn't live in your house. She runs a dictatorship and you're the unpaid staff."* |

### 5.5 Pet Archetype System

Every roast assigns a pet to one of ~30 archetypes with a custom badge:

- 🤡 Chaos Gremlin
- 👑 Household Dictator
- 🍔 Snack Addict
- 🛋️ Couch Goblin
- 🥔 Suspicious Potato
- 😴 Professional Sleeper
- 🎭 Drama Queen
- 🕵️ Tiny Detective
- 🦹 Mastermind
- 🌪️ Walking Disaster
- *(see [Appendix A](#appendix-a-archetype-library))*

### 5.6 Meme & Share Card Generation

- Auto-rendered 1080×1080 (square) and 1080×1920 (story) PNG
- Pet photo + roast text + archetype badge + branded watermark
- Three template styles: **Classic**, **Polaroid**, **Tabloid**

### 5.7 Sharing

- One-tap to: Instagram Story, Instagram Feed, TikTok, X, Facebook, WhatsApp, iMessage
- Copy shareable URL (`roastmypet.com/r/abc123`)
- Download PNG (square + story formats)
- Generated OG/Twitter card meta tags for rich previews

### 5.8 Roast Gallery (Optional/Public)

- Opt-in public gallery of submitted roasts
- Daily Top 10
- Hall of Fame
- Emoji-react (no comments to avoid moderation cost in V1)

### 5.9 Account-less by Default

- No signup required for V1
- Optional email capture on result page ("Save your pet's roast collection")

---

## 6. AI Workflow (Gemini)

### 6.1 Why Gemini

- Native multimodal (image + text in one call)
- Strong instruction-following for tone/format
- Built-in safety filters
- Cost-effective at scale via Gemini Flash for the bulk of traffic
- JSON-mode output for structured roast + archetype + tags

### 6.2 Model Selection Strategy

| Use Case | Model | Why |
|---|---|---|
| **Standard roast (95% of traffic)** | `gemini-2.5-flash` | Fast, cheap, multimodal |
| **Savage / premium tier** | `gemini-2.5-pro` | Better humor, sharper writing |
| **Image moderation pre-check** | `gemini-2.5-flash` (vision-only) | Fast safety scan |
| **Meme caption polish (optional)** | `gemini-2.5-flash` | Rewrite for visual layout |

### 6.3 End-to-End AI Pipeline

```
[Photo Upload]
      │
      ▼
[1. Pre-Moderation]
   - Gemini vision: is it a pet? appropriate? clear enough?
   - Reject early if not
      │
      ▼
[2. Image Analysis + Roast Generation] (single Gemini call)
   - Input: image + name + type + traits + level + style
   - Output: JSON { roast, archetype, vibe_tags, follow_up }
      │
      ▼
[3. Post-Processing]
   - Profanity filter (configurable per level)
   - Length check (target: 12–35 words for shareability)
      │
      ▼
[4. Meme Rendering]
   - Composite pet photo + roast text + archetype badge
   - Output: 1080x1080 + 1080x1920 PNG
      │
      ▼
[5. Persist + Return]
   - Store in DB + CDN
   - Return result + share URL
```

### 6.4 Latency Budget

| Step | Target | Notes |
|---|---|---|
| Upload + compress | < 1s | Client-side |
| Pre-moderation | < 1s | Fast Gemini vision call |
| Roast generation | 3–6s | Main Gemini call |
| Meme rendering | < 1s | Server-side canvas |
| Total perceived | **< 8s** | Loader fills the gap |

---

## 7. Prompt Design

### 7.1 System Prompt (Standard Roast)

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
3. Use the pet's name naturally.
4. Match the requested ROAST LEVEL:
   - "cute": playful teasing, no edge, kid-safe.
   - "medium": clever internet humor, mild attitude.
   - "savage": brutal, witty, edgy — but never hateful, racist, or sexual.
5. Match the requested ROAST STYLE if provided.
6. Keep the roast between 15 and 35 words. Punchy is better than long.
7. Assign ONE archetype from the provided list that best matches the pet.
8. Output strictly valid JSON in the schema below. No prose outside JSON.

NEVER:
- Mention the owner's appearance, race, gender, or identity.
- Joke about the pet being abused, sick, dying, or in distress.
- Use slurs, sexual content, or profanity above the requested level.
- Output anything outside the JSON schema.

OUTPUT SCHEMA:
{
  "roast": "string (15–35 words)",
  "archetype": "string (from approved list)",
  "vibe_tags": ["string", "string", "string"],
  "follow_up_zinger": "string (≤15 words, optional second jab)",
  "visual_observation": "string (1 sentence, what you noticed in the photo)"
}
```

### 7.2 User Prompt Template

```
PET NAME: {{name}}
PET TYPE: {{type | "unknown — infer from photo"}}
PERSONALITY TRAITS: {{traits | "none provided"}}
ROAST LEVEL: {{level}}
ROAST STYLE: {{style | "default"}}

APPROVED ARCHETYPES:
{{archetype_list_with_descriptions}}

Now look at the attached photo and roast this pet.
```

### 7.3 Pre-Moderation Prompt

```
You are an image moderator. Look at the attached image and respond with
strictly valid JSON:

{
  "is_pet": boolean,
  "pet_type": "dog" | "cat" | "bird" | "rabbit" | "reptile" | "exotic" | "other" | null,
  "is_appropriate": boolean (false if NSFW, violent, contains identifiable
                              minors as the main subject, or is distressing),
  "image_quality": "good" | "blurry" | "too_dark" | "too_small",
  "reject_reason": "string or null"
}
```

### 7.4 Prompt Engineering Notes

- **Few-shot examples** in production prompt for each roast level (not shown above for brevity).
- **Temperature**: 0.9 for roast generation (creativity), 0.1 for moderation (determinism).
- **Top-p**: 0.95.
- **Max output tokens**: 300.
- **Response MIME type**: `application/json` (Gemini's structured output mode).
- **A/B test prompts** continuously — log roast → engagement (shares, regenerates) → tune.

---

## 8. Meme Generation System

### 8.1 Goals

- Look like premium meme content, not generic AI output
- Renderable server-side in < 1s
- Three formats: Square (IG feed), Story (IG/TikTok), Landscape (X)

### 8.2 Rendering Approach

**Server-side canvas rendering** using `@napi-rs/canvas` or `satori` + `resvg` (React → SVG → PNG):

- **Pros of Satori**: write templates as React/JSX, easy to iterate, used by Vercel OG.
- Auto-fit text with dynamic font sizing
- Smart text wrapping with hyphenation
- Drop shadows, gradients, badges baked in

### 8.3 Template System

| Template | Style | Layout |
|---|---|---|
| **Classic** | Bold sans-serif on darkened photo | Photo full-bleed, text overlay bottom |
| **Polaroid** | Photo in white frame, handwritten font | Photo top, roast in caption area |
| **Tabloid** | Newspaper headline style, "EXCLUSIVE" tag | Photo left, big bold headline right |

### 8.4 Branding Elements

- Subtle watermark: `roastmypet.com` bottom-right
- Archetype badge with emoji
- Color palette per roast level (Cute = pastel, Medium = warm, Savage = high-contrast neon)

### 8.5 Output Spec

```
- Square: 1080 × 1080 PNG (~150–300 KB after optimization)
- Story:  1080 × 1920 PNG
- Landscape: 1200 × 630 PNG (also used as OG image)
- All optimized via sharp (mozjpeg / oxipng)
- Stored on Supabase Storage + served via CDN
```

---

## 9. Technical Architecture

### 9.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                        │
│  Next.js App Router · React · Tailwind · Framer Motion          │
└──────────────┬──────────────────────────────────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EDGE / CDN (Vercel)                         │
│   - Static assets, OG images, ISR for /r/[id] pages              │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES (Node)                     │
│  /api/roast  /api/upload  /api/share/[id]  /api/gallery         │
│  - Rate limiting · Auth (optional) · Orchestration              │
└──┬───────────┬──────────────┬─────────────────┬─────────────────┘
   │           │              │                 │
   ▼           ▼              ▼                 ▼
┌──────┐  ┌─────────┐   ┌──────────┐   ┌─────────────────┐
│Supa- │  │ Gemini  │   │  Meme    │   │   Upstash       │
│base  │  │  API    │   │ Renderer │   │   Redis         │
│(DB + │  │(Google) │   │ (Satori) │   │ (rate limit,    │
│Auth +│  │         │   │          │   │  cache, queue)  │
│Storage)│ └─────────┘   └──────────┘   └─────────────────┘
└──────┘
```

### 9.2 Key Architectural Decisions

| Decision | Choice | Reason |
|---|---|---|
| Hosting | Vercel | Best Next.js DX, edge functions, ISR |
| DB + Auth + Storage | Supabase | Single integrated platform, generous free tier, Postgres |
| Caching / Queue | Upstash Redis | Serverless-friendly, pay-per-request |
| AI provider | Google Gemini | Multimodal, fast, JSON output, cost |
| Meme render | Satori + resvg | Lightweight, runs in serverless |
| Image processing | Sharp | Industry standard, fast |
| Observability | Vercel Analytics + Sentry | Out-of-the-box |

### 9.3 Request Flow Example: `POST /api/roast`

1. Client uploads compressed image → Supabase Storage signed URL → returns `image_url`.
2. Client POSTs `{ image_url, name, type, traits, level, style }` to `/api/roast`.
3. API: Rate-limit check (Upstash Redis, 10/min/IP).
4. API: Insert pending row in `roasts` table.
5. API: Call Gemini pre-moderation → if reject, return error.
6. API: Call Gemini roast generation (multimodal).
7. API: Render meme images via Satori → upload to Supabase Storage.
8. API: Update row with results, return `{ id, roast, archetype, meme_urls, share_url }`.
9. Client: Animates result, prefetches share URL.

---

## 10. Tech Stack

### Frontend
- **Next.js 15+** (App Router, Server Components)
- **React 19**
- **Tailwind CSS 4** + **shadcn/ui** for components
- **Framer Motion** for animations
- **react-dropzone** for uploads
- **browser-image-compression** for client-side compression
- **TanStack Query** for client state

### Backend
- **Next.js API Routes** (Node 20 runtime for Sharp/Satori, Edge runtime for read endpoints)
- **Zod** for input validation
- **@google/generative-ai** SDK for Gemini
- **Satori + @resvg/resvg-js** for meme rendering
- **Sharp** for image optimization

### Data & Infra
- **Supabase**: Postgres + Auth + Storage + Realtime (for live gallery)
- **Upstash Redis**: rate limiting, hot caches, share counters
- **Vercel**: hosting, edge, ISR, cron
- **Cloudflare** (optional V2): CDN in front of Supabase Storage for global pet pics

### Observability & Ops
- **Sentry** — error tracking
- **PostHog** — product analytics + funnels + session replay
- **Vercel Analytics** — web vitals
- **Better Stack / Logtail** — log aggregation

### Dev Tooling
- **TypeScript** strict mode
- **Biome** (lint + format)
- **Vitest** + **Playwright** for tests
- **GitHub Actions** for CI

---

## 11. Database Structure

PostgreSQL (via Supabase). Schema below.

### 11.1 ER Diagram

```
users (optional)
   │
   │ 1
   │
   │ *
roasts ─────── meme_assets
   │
   │ 1
   │
   │ *
share_events
```

### 11.2 Tables

#### `users` (optional — V1 supports anonymous)
```sql
create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique,
  display_name  text,
  created_at    timestamptz default now()
);
```

#### `roasts`
```sql
create table roasts (
  id                uuid primary key default gen_random_uuid(),
  short_id          text unique not null,             -- URL slug e.g. "abc123"
  user_id           uuid references users(id) on delete set null,
  anon_session_id   text,                              -- for anonymous users
  pet_name          text not null,
  pet_type          text,
  traits            text[] default '{}',
  roast_level       text not null check (roast_level in ('cute','medium','savage')),
  roast_style       text default 'default',
  source_image_url  text not null,
  roast_text        text not null,
  archetype         text not null,
  vibe_tags         text[] default '{}',
  follow_up         text,
  visual_observation text,
  is_public         boolean default false,
  is_flagged        boolean default false,
  model_used        text not null,
  generation_ms     int,
  created_at        timestamptz default now()
);

create index roasts_short_id_idx     on roasts (short_id);
create index roasts_public_recent_idx on roasts (is_public, created_at desc) where is_flagged = false;
create index roasts_archetype_idx    on roasts (archetype);
```

#### `meme_assets`
```sql
create table meme_assets (
  id          uuid primary key default gen_random_uuid(),
  roast_id    uuid not null references roasts(id) on delete cascade,
  format      text not null check (format in ('square','story','landscape')),
  template    text not null check (template in ('classic','polaroid','tabloid')),
  url         text not null,
  width       int not null,
  height      int not null,
  bytes       int,
  created_at  timestamptz default now()
);

create index meme_assets_roast_id_idx on meme_assets (roast_id);
```

#### `share_events`
```sql
create table share_events (
  id         bigserial primary key,
  roast_id   uuid not null references roasts(id) on delete cascade,
  channel    text not null,             -- instagram, tiktok, x, copy_link, etc.
  occurred_at timestamptz default now(),
  ip_hash    text,                       -- for de-dup, never raw IP
  user_agent text
);

create index share_events_roast_id_idx on share_events (roast_id);
```

#### `reactions` (for gallery)
```sql
create table reactions (
  id         bigserial primary key,
  roast_id   uuid not null references roasts(id) on delete cascade,
  emoji      text not null,
  ip_hash    text not null,
  created_at timestamptz default now(),
  unique (roast_id, emoji, ip_hash)
);
```

#### `flags` (moderation)
```sql
create table flags (
  id         bigserial primary key,
  roast_id   uuid not null references roasts(id) on delete cascade,
  reason     text,
  reporter_ip_hash text,
  status     text default 'pending' check (status in ('pending','dismissed','removed')),
  created_at timestamptz default now()
);
```

### 11.3 Row Level Security (Supabase)

- `roasts`: SELECT public allowed when `is_public = true AND is_flagged = false`. INSERT via service role only (API routes).
- `meme_assets`: SELECT public via signed URLs.
- `share_events`, `reactions`, `flags`: INSERT via API only.

---

## 12. API Flow

### 12.1 Endpoints

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/upload-url` | Get signed upload URL for Supabase Storage | None (rate-limited) |
| `POST` | `/api/roast` | Generate roast from uploaded image | None (rate-limited) |
| `GET`  | `/api/roast/:shortId` | Fetch a roast by ID (for share page) | None |
| `POST` | `/api/roast/:shortId/regenerate` | Re-roast with same image, new output | None (rate-limited) |
| `POST` | `/api/roast/:shortId/share` | Log a share event | None |
| `POST` | `/api/roast/:shortId/react` | Add an emoji reaction | None |
| `POST` | `/api/roast/:shortId/flag` | Report a roast | None |
| `GET`  | `/api/gallery` | Public gallery (paginated) | None |
| `GET`  | `/api/gallery/top` | Top roasts (today, week, all-time) | None |

### 12.2 `POST /api/roast` — Request / Response

**Request**
```json
{
  "image_url": "https://...supabase.co/storage/...abc.jpg",
  "pet_name": "Bruno",
  "pet_type": "dog",
  "traits": ["lazy", "dramatic"],
  "roast_level": "medium",
  "roast_style": "standup"
}
```

**Response (200)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "short_id": "rAb12X",
  "roast": "Bruno isn't a guard dog. He's a carpet decoration that occasionally sighs at the door, then files a formal complaint with HR — which is also Bruno.",
  "archetype": "Couch Goblin",
  "archetype_emoji": "🛋️",
  "vibe_tags": ["lazy", "judgemental", "soft"],
  "follow_up": "His resume just says 'horizontal'.",
  "meme_urls": {
    "square":    "https://cdn.../rAb12X_square.png",
    "story":     "https://cdn.../rAb12X_story.png",
    "landscape": "https://cdn.../rAb12X_landscape.png"
  },
  "share_url": "https://roastmypet.com/r/rAb12X"
}
```

**Errors**
```json
{ "error": "NO_PET_DETECTED", "message": "We couldn't find a pet in this photo." }
{ "error": "INAPPROPRIATE_IMAGE", "message": "This image can't be used." }
{ "error": "RATE_LIMITED", "retry_after": 42 }
{ "error": "GENERATION_FAILED", "message": "Try again in a moment." }
```

### 12.3 Rate Limiting

- **Upload**: 5 / min / IP
- **Generate**: 10 / hour / IP (anonymous), 50 / hour / user (logged in)
- **Regenerate**: 3 / roast (lifetime)
- **Reactions / shares**: 60 / min / IP

Implemented via Upstash Redis with sliding-window counters.

### 12.4 Caching

- `/api/roast/:shortId` and `/r/[shortId]` pages use **ISR** with `revalidate: 3600`.
- Top gallery cached for 60s in Redis.
- Meme images served from CDN, immutable, 1-year cache headers.

---

## 13. Frontend Page Structure

### 13.1 Site Map

```
/                       → Landing
/upload                 → Upload + form (or modal on landing)
/roasting               → Loading state (route, not URL)
/r/[shortId]            → Public result + share page (ISR)
/gallery                → Public gallery
/gallery/top            → Top roasts
/about                  → About + how it works
/privacy, /terms        → Legal
```

### 13.2 Page-by-Page

#### `/` Landing
- **Hero**: Headline, subheadline, "Roast My Pet 🔥" CTA, animated rotating example memes.
- **How It Works**: 3 steps with icons.
- **Live Roast Wall**: Auto-scrolling marquee of recent public roasts.
- **Roast Levels Demo**: Same pet, three levels side-by-side.
- **FAQ + Privacy reassurance**: "Your pet's photo isn't shared unless you choose to make it public."
- **Footer** with social links.

#### `/upload` (or modal)
- Big drag-and-drop zone (or webcam button on mobile)
- Live preview of compressed image
- Form: name, type, traits chips, roast level slider, style dropdown
- Sticky bottom CTA on mobile
- Inline validation, no page reloads

#### Generating State
- Full-screen animated loader: pet silhouette being "scanned"
- Witty rotating loader copy ("Consulting the comedy council...", "Reviewing your pet's vibe...")
- Skeleton of result card behind blur

#### `/r/[shortId]` Result
- Hero meme card (large, downloadable, animated entrance)
- Roast text below in big typography
- Archetype badge with emoji
- Action bar: Share to IG / TikTok / X / WhatsApp / Copy / Download
- "Roast Again" button (regenerate with same photo)
- "Roast Another Pet" CTA
- "Make it public for the gallery" toggle
- Below the fold: similar archetype roasts ("More Couch Goblins")

#### `/gallery`
- Masonry grid of public memes
- Filter: by archetype, by level, by recency
- Infinite scroll
- Tap → opens result page

#### `/gallery/top`
- Today / This Week / All-Time tabs
- Top 10 cards with emoji react counts

### 13.3 Component Library

- `<UploadDropzone />`
- `<TraitChip />`
- `<RoastLevelSlider />`
- `<MemeCard />` (variants: classic / polaroid / tabloid)
- `<ShareSheet />`
- `<ArchetypeBadge />`
- `<LoadingScene />`
- `<ReactionBar />`

### 13.4 Performance & Accessibility

- Lighthouse score targets: Perf 95+, A11y 100, SEO 100
- Lazy-load gallery images, `loading="lazy"`, `fetchpriority="high"` for hero
- Full keyboard navigation on upload form
- `aria-live` on generating + result states
- Reduced-motion variants for all animations
- Color contrast AA minimum

---

## 14. Scalability Considerations

### 14.1 Traffic Patterns

Viral apps have **spiky** traffic. Plan for: 100 RPS sustained, 1000 RPS spikes during a TikTok feature.

### 14.2 Bottlenecks & Mitigations

| Bottleneck | Mitigation |
|---|---|
| **Gemini API quotas** | Multiple API keys + project rotation; fall back to gemini-flash from pro; queue + backoff on 429 |
| **Image upload size** | Client-side compression to ≤2 MB before upload; reject > 10 MB at edge |
| **Meme rendering CPU** | Run on dedicated Node runtime; queue if > N concurrent; consider moving to background worker (e.g. Inngest, Trigger.dev) for V2 |
| **DB writes** | Insert is light; batch share_events via buffered writer (Redis → flush every 5s) |
| **Storage egress** | Cloudflare CDN in front of Supabase Storage; immutable cache headers |
| **Gallery reads** | ISR + Redis cache for top lists |
| **Cold starts** | Vercel Pro with always-warm functions for `/api/roast` |

### 14.3 Cost Control

- Gemini Flash for default tier (~$0.001 per roast estimated)
- Premium tier (Savage / Pro model) gated behind paywall or daily limit
- Dedup: hash of (image_hash + name + traits + level) → return cached roast for 24h
- Set hard daily spend cap with PostHog alert + auto-switch to maintenance mode
- Compress all stored images aggressively

### 14.4 Reliability

- **SLO**: 99.5% successful generations
- **Retry**: one auto-retry on Gemini 5xx
- **Fallback**: pre-written roast templates per archetype + traits if Gemini fully down (clearly labeled as "lite mode")
- **Health check**: synthetic roast every 5 min
- **Backup**: nightly Postgres backup (Supabase built-in) + storage replication

### 14.5 Data Retention & Privacy

- Anonymous roasts auto-expire after 30 days unless made public or saved by a logged-in user
- "Delete my roast" button on every result page (no login required, uses one-time owner token in URL)
- EXIF stripped on upload
- No raw IPs stored — only hashed
- GDPR-compliant data export + delete endpoint

---

## 15. Viral Growth Ideas

### 15.1 Built-In Virality

- **Watermarked meme** with `roastmypet.com` ensures every share is an ad
- **Open Graph cards** auto-generated per roast → rich previews on every share
- **Short shareable URLs** (`/r/abc123`) — designed for screenshots
- **"Roast My Friend's Pet"** — paste a friend's pet IG link → AI scrapes a public photo (with consent prompt) → generates roast → DM-able link
- **Compare Mode**: Upload two pets → "Whose roast is harsher?" head-to-head card
- **Series**: "Roast my whole household" — bundle multiple pet roasts into a single story-format image

### 15.2 Content Loops

- **Daily Top Roast** posted to the brand IG/TikTok account
- **Weekly Archetype Spotlight** ("Best Chaos Gremlins of the Week")
- **Hashtag campaign**: #RoastMyPet
- **Embed widget**: pet creators can embed their roast on linktree / blog

### 15.3 Launch Channels

- **Product Hunt** launch with "Roast My Cofounder's Pet" demo
- **Reddit**: r/aww, r/petsroastingpets, r/dogs, r/cats — soft launches, not spam
- **TikTok**: hire 3–5 pet creators to do reaction videos
- **Twitter/X**: drop a thread of insanely good roasts to seed the format
- **Instagram Reels**: stitching real pet videos with the roast text

### 15.4 Engagement Hooks

- **"Roast Streak"**: roast a different pet 7 days in a row → unlock secret archetype
- **Roast Battles**: weekly bracket where users vote on funniest pet roast
- **Halloween / Christmas / Valentine's** themed roast packs
- **AR filter** (Instagram/Snap): pet face → roast pops up
- **Voice roast**: AI TTS narration of the roast in a comedian voice (Gen Z, British, Sports Announcer)

### 15.5 Referral Mechanic

- "Get 5 Savage roasts free when 3 friends try Roast My Pet"
- Unique referral URL with attribution

### 15.6 SEO Long-Tail

- Programmatic landing pages: `/roast-my-[breed]` (e.g. `/roast-my-corgi`, `/roast-my-bengal-cat`) with breed-specific examples and SEO copy
- Blog: "The 50 Funniest Pet Archetypes Ranked", "Why Cats Are Universally Couch Goblins"

---

## 16. Monetization

V1 stays **free + ad-free** to maximize virality. Monetization layers in V2:

| Tier | Price | Features |
|---|---|---|
| **Free** | $0 | 5 roasts/day, watermarked meme, basic templates |
| **Pro** | $4.99/mo or $29/yr | Unlimited roasts, no watermark, Gemini Pro tier, premium templates, voice roast, save library |
| **Gift Pack** | $7.99 one-time | Custom physical postcard with roast + meme mailed to friend |
| **Merch** | $20–35 | Mug / shirt with their pet's roast and archetype |
| **API** | $$$ | Pet brands embedding "Roast My Pet" widget |

Affiliate revenue: pet supply brands (Chewy, etc.) on result page — *"Bruno's a Couch Goblin? Get him a better couch."*

---

## 17. Roadmap

### V1 — MVP (Weeks 1–6)
- Upload + form + Gemini roast + meme render + share + result page
- Anonymous use, no account
- 1 template (Classic), 3 levels, 1 style
- Basic public gallery (opt-in)
- Launch on Product Hunt + TikTok seeding

### V1.5 — Polish (Weeks 7–10)
- 3 meme templates, 6 styles
- Roast level A/B testing
- Programmatic SEO breed pages
- Email capture

### V2 — Engagement (Months 3–4)
- Accounts + saved roast library
- Roast Battles
- Voice roast TTS
- Pro tier launch

### V3 — Expansion (Months 5+)
- Mobile app (React Native)
- AR filters
- Merch / postcards
- Brand partnerships

---

## 18. Appendix

### Appendix A: Archetype Library (sample)

| Archetype | Emoji | Vibe |
|---|---|---|
| Chaos Gremlin | 🤡 | High-energy, breaks things, no remorse |
| Household Dictator | 👑 | Bossy, demanding, opinionated |
| Snack Addict | 🍔 | Always begging, food-obsessed |
| Couch Goblin | 🛋️ | Lazy, sedentary, judgmental from the cushions |
| Suspicious Potato | 🥔 | Round, paranoid, sus |
| Professional Sleeper | 😴 | Sleeps 22 hrs/day, expert level |
| Drama Queen | 🎭 | Theatrical, attention-seeking |
| Tiny Detective | 🕵️ | Sniffs everything, investigates |
| Mastermind | 🦹 | Plotting something, always |
| Walking Disaster | 🌪️ | Trips, knocks, chaos incarnate |
| Soft Launch | 🥹 | Acts tough, secretly clingy |
| Vibe Curator | 🎧 | Aesthetic, moody, photogenic |
| Snitch | 📣 | Barks at literally everything |
| Fluff Cloud | ☁️ | 90% fur, 10% personality |
| Goblin Mode | 👹 | Permanently feral |
| *(extend to ~30 for variety)* | | |

### Appendix B: Example Roasts (for design / QA reference)

**Cute, Cat, traits = sleepy**
> Mochi has spent so long in loaf form that the bakery union is asking questions. She wakes up only to confirm that yes, the floor is still down there.

**Medium, Dog, traits = dramatic, clingy**
> Bruno doesn't have separation anxiety — *you* have separation anxiety. He's just exploiting it. The Oscar for "Most Heartbreaking Sigh by a Golden Retriever" goes to: Bruno.

**Savage, Cat, traits = aggressive, suspicious**
> Luna isn't a pet. She's a hostile takeover with whiskers. Every time you blink she audits your soul, finds it lacking, and bills you for the inconvenience.

### Appendix C: Glossary

- **Archetype**: a comedic personality category assigned to each pet
- **Vibe tags**: free-form mood descriptors used for filtering and search
- **Roast level**: severity dial (Cute / Medium / Savage)
- **Short ID**: the URL slug for sharing a roast (`/r/abc123`)

---

## Motto

> **Every pet is cute.
> Some just deserve a little roasting.**
