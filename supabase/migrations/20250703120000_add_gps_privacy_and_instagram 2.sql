-- Add Instagram handle and location privacy to profiles
alter table if exists public.profiles 
  add column if not exists instagram text,
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists privacy_fuzz_location boolean default true;

-- Add spatial index for coordinates
create index if not exists idx_profiles_lat_lng on public.profiles(lat, lng);
create index if not exists idx_games_lat_lng on public.games(lat, lng);

-- RPC function to get total onboarded players count (for community proof)
create or replace function public.get_onboarded_users_count()
returns integer as $$
declare
  total_count integer;
begin
  select count(*) into total_count from public.profiles;
  -- Return at least a vibrant base count if starting fresh, or exact count
  return greatest(total_count, 1);
end;
$$ language plpgsql security definer;

-- Allow public read access to the RPC
grant execute on function public.get_onboarded_users_count() to public, anon, authenticated;
