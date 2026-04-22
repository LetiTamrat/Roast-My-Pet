-- Roast My Pet — initial schema
-- Run via Supabase SQL editor or `supabase db push`

-- USERS (optional, V1 anonymous-first)
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique,
  display_name  text,
  created_at    timestamptz not null default now()
);

-- ROASTS
create table if not exists public.roasts (
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
  source_image_path   text,
  image_hash          text,
  roast_text          text not null,
  archetype           text not null,
  archetype_emoji     text not null,
  vibe_tags           text[] not null default '{}',
  follow_up           text,
  visual_observation  text,
  is_public           boolean not null default false,
  is_flagged          boolean not null default false,
  regenerations       int not null default 0,
  model_used          text not null,
  generation_ms       int,
  owner_token         text not null,
  ip_hash             text,
  created_at          timestamptz not null default now()
);
create index if not exists roasts_short_id_idx on public.roasts (short_id);
create index if not exists roasts_public_recent_idx on public.roasts (is_public, created_at desc) where is_flagged = false;
create index if not exists roasts_archetype_idx on public.roasts (archetype);
create index if not exists roasts_image_hash_idx on public.roasts (image_hash);

-- MEME ASSETS
create table if not exists public.meme_assets (
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
create index if not exists meme_assets_roast_id_idx on public.meme_assets (roast_id);

-- SHARE EVENTS
create table if not exists public.share_events (
  id          bigserial primary key,
  roast_id    uuid not null references public.roasts(id) on delete cascade,
  channel     text not null,
  occurred_at timestamptz not null default now(),
  ip_hash     text,
  user_agent  text
);
create index if not exists share_events_roast_id_idx on public.share_events (roast_id);
create index if not exists share_events_occurred_idx on public.share_events (occurred_at desc);

-- REACTIONS
create table if not exists public.reactions (
  id         bigserial primary key,
  roast_id   uuid not null references public.roasts(id) on delete cascade,
  emoji      text not null,
  ip_hash    text not null,
  created_at timestamptz not null default now(),
  unique (roast_id, emoji, ip_hash)
);
create index if not exists reactions_roast_id_idx on public.reactions (roast_id);

-- FLAGS
create table if not exists public.flags (
  id               bigserial primary key,
  roast_id         uuid not null references public.roasts(id) on delete cascade,
  reason           text,
  reporter_ip_hash text,
  status           text not null default 'pending' check (status in ('pending','dismissed','removed')),
  created_at       timestamptz not null default now(),
  unique (roast_id, reporter_ip_hash)
);
create index if not exists flags_roast_id_idx on public.flags (roast_id);

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public)
  values ('pet-uploads', 'pet-uploads', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('memes', 'memes', true)
  on conflict (id) do nothing;

-- ROW LEVEL SECURITY
alter table public.roasts enable row level security;
alter table public.meme_assets enable row level security;
alter table public.share_events enable row level security;
alter table public.reactions enable row level security;
alter table public.flags enable row level security;

drop policy if exists "public reads public roasts" on public.roasts;
create policy "public reads public roasts" on public.roasts
  for select using (is_public = true and is_flagged = false);

drop policy if exists "public reads memes for public roasts" on public.meme_assets;
create policy "public reads memes for public roasts" on public.meme_assets
  for select using (
    exists (select 1 from public.roasts r
            where r.id = meme_assets.roast_id
              and r.is_public = true
              and r.is_flagged = false)
  );

-- Helper view: top roasts ranked by reaction count
create or replace view public.roast_reaction_counts as
  select r.id as roast_id, r.short_id, count(rx.id)::int as reaction_count
  from public.roasts r
  left join public.reactions rx on rx.roast_id = r.id
  where r.is_public = true and r.is_flagged = false
  group by r.id, r.short_id;
