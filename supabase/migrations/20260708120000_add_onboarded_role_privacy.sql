-- Add explicit onboarding/role/privacy columns to profiles.
-- The app previously tried to write these (and lat/lng) but the columns never
-- existed, so every profile upsert failed with 400. The live table stores
-- coordinates in latitude/longitude, so no lat/lng columns are added here.
alter table if exists public.profiles
  add column if not exists onboarded boolean not null default false,
  add column if not exists role text not null default 'player',
  add column if not exists privacy_fuzz_location boolean not null default true,
  add column if not exists instagram text;

-- Backfill: any real registered player (not the seed demo row) counts as
-- onboarded — historical signups lost their city/sports to the upsert bug,
-- so completeness can't be used as the backfill criterion.
update public.profiles
set onboarded = true
where id <> 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  and name is not null
  and length(trim(name)) > 0;

-- Fast counts for the "players onboarded" community-proof counters.
create index if not exists idx_profiles_onboarded on public.profiles(onboarded);

-- Everyone (including anonymous visitors) can browse player profiles.
-- Recreate the read policy to make it explicitly public.
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to public
  using (true);

-- RPC used as a cheap public counter (matches SUPABASE.md / 20250703 intent).
create or replace function public.get_onboarded_users_count()
returns integer as $$
declare
  total_count integer;
begin
  select count(*) into total_count
  from public.profiles
  where onboarded = true;
  return total_count;
end;
$$ language plpgsql security definer;

grant execute on function public.get_onboarded_users_count() to public, anon, authenticated;
