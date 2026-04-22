-- Roast My Pet — auth, profiles, and roast ownership
-- Run after 0001_initial_schema.sql.

create extension if not exists citext;

-- Repoint roasts.user_id FK from unused public.users to auth.users
alter table public.roasts drop constraint if exists roasts_user_id_fkey;
drop table if exists public.users;
alter table public.roasts
  add constraint roasts_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      citext unique not null
                check (char_length(username) between 3 and 24
                       and username ~ '^[a-z0-9_]+$'),
  display_name  text,
  avatar_url    text,
  bio           text check (char_length(bio) <= 280),
  role          text not null default 'user' check (role in ('user','admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists profiles_username_idx on public.profiles (username);

-- Auto-create a profile row when a new auth user is inserted.
-- Retries up to 5 times to resolve username collisions.
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
declare
  base text;
  cand text;
  i int := 0;
begin
  base := regexp_replace(lower(split_part(new.email,'@',1)),'[^a-z0-9_]','','g');
  if char_length(base) < 3 then
    base := 'pet'||substr(md5(new.id::text),1,4);
  end if;
  cand := left(base,20);
  loop
    begin
      insert into public.profiles (id, username, display_name)
      values (new.id, cand,
              coalesce(new.raw_user_meta_data->>'full_name',
                       new.raw_user_meta_data->>'name',
                       base));
      exit;
    exception when unique_violation then
      i := i + 1;
      if i > 5 then raise; end if;
      cand := left(base,18) || '_' || substr(md5(random()::text),1,4);
    end;
  end loop;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role='admin'
  );
$$;

alter table public.profiles enable row level security;
drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read"  on public.profiles for select using (true);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update"  on public.profiles for update using (id = auth.uid());

-- Owner policies on roasts (in addition to the public read from 0001)
drop policy if exists "owners select own roasts" on public.roasts;
create policy "owners select own roasts" on public.roasts
  for select using (user_id = auth.uid());
drop policy if exists "owners update own roasts" on public.roasts;
create policy "owners update own roasts" on public.roasts
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
drop policy if exists "owners delete own roasts" on public.roasts;
create policy "owners delete own roasts" on public.roasts
  for delete using (user_id = auth.uid() or public.is_admin());

drop policy if exists "owners select own memes" on public.meme_assets;
create policy "owners select own memes" on public.meme_assets
  for select using (exists (
    select 1 from public.roasts r
    where r.id = meme_assets.roast_id and r.user_id = auth.uid()
  ));

-- Avatars storage bucket
insert into storage.buckets (id, name, public)
  values ('avatars','avatars',true)
  on conflict (id) do nothing;

drop policy if exists "avatar public read" on storage.objects;
create policy "avatar public read" on storage.objects
  for select using (bucket_id='avatars');
drop policy if exists "avatar owner write" on storage.objects;
create policy "avatar owner write" on storage.objects
  for insert with check (
    bucket_id='avatars'
    and (auth.uid()::text = (storage.foldername(name))[1])
  );
drop policy if exists "avatar owner update" on storage.objects;
create policy "avatar owner update" on storage.objects
  for update using (
    bucket_id='avatars'
    and (auth.uid()::text = (storage.foldername(name))[1])
  );
