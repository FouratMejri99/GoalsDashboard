-- Goals Dashboard — Supabase schema
--
-- Run this once in your project's SQL editor (Supabase dashboard ->
-- SQL Editor -> New query -> paste -> Run). Safe to re-run: every
-- statement is guarded with IF NOT EXISTS / OR REPLACE / DROP-then-CREATE.
--
-- Tables are all scoped to auth.uid() via Row Level Security, so each
-- signed-in user only ever sees their own rows — no server-side code needed.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles — one row per user, mirrors a slice of auth.users
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- settings — one row per user: the goals the Dashboard measures against
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  goal_name text not null default '',
  calorie_goal numeric not null default 2200,
  protein_goal numeric not null default 160,
  carbs_goal numeric not null default 220,
  fat_goal numeric not null default 70,
  start_weight_kg numeric,
  weight_goal_kg numeric,
  workouts_per_week_goal numeric not null default 4,
  weekly_minutes_goal numeric not null default 240,
  sleep_goal_hours numeric not null default 8,
  target_bedtime text not null default '23:00',
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "Settings are viewable by owner" on public.settings;
create policy "Settings are viewable by owner"
  on public.settings for select
  using (auth.uid() = user_id);

drop policy if exists "Settings are insertable by owner" on public.settings;
create policy "Settings are insertable by owner"
  on public.settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Settings are editable by owner" on public.settings;
create policy "Settings are editable by owner"
  on public.settings for update
  using (auth.uid() = user_id);

drop policy if exists "Settings are deletable by owner" on public.settings;
create policy "Settings are deletable by owner"
  on public.settings for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- meal_entries — the Meals log
-- ---------------------------------------------------------------------
create table if not exists public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  time time,
  meal_type text not null,
  name text not null,
  calories numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  weight_kg numeric,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists meal_entries_user_date_idx on public.meal_entries (user_id, date);

alter table public.meal_entries enable row level security;

drop policy if exists "Meal entries are CRUD by owner" on public.meal_entries;
create policy "Meal entries are CRUD by owner"
  on public.meal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- workouts — the Workouts log (one row per exercise per session)
-- ---------------------------------------------------------------------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  time time,
  exercise text not null,
  muscle_group text not null,
  sets numeric not null default 0,
  reps numeric not null default 0,
  weight_kg numeric not null default 0,
  duration_min numeric,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_date_idx on public.workouts (user_id, date);

alter table public.workouts enable row level security;

drop policy if exists "Workouts are CRUD by owner" on public.workouts;
create policy "Workouts are CRUD by owner"
  on public.workouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- sleep_entries — the Sleep log (one row per night)
-- ---------------------------------------------------------------------
create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  bed_time time not null,
  wake_time time not null,
  quality text not null default 'Good',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sleep_entries_user_date_idx on public.sleep_entries (user_id, date);

alter table public.sleep_entries enable row level security;

drop policy if exists "Sleep entries are CRUD by owner" on public.sleep_entries;
create policy "Sleep entries are CRUD by owner"
  on public.sleep_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- New-user bootstrap: on signup, create a profile row and a default
-- settings row so the app never has to special-case "no settings yet".
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  insert into public.settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
