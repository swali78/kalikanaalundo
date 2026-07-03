-- CIRCLE MVP Schema
-- Run after linking your project

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  age integer,
  gender text,
  city text,
  district text,
  avatar_url text,
  bio text,
  sports text[] default '{}',
  skill_level text check (skill_level in ('Beginner', 'Intermediate', 'Advanced')) default 'Beginner',
  availability text[] default '{}',
  rating numeric(3,2) default 5.0,
  games_played integer default 0,
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Games table
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  sport text not null,
  host_id uuid references public.profiles(id) on delete cascade not null,
  venue text not null,
  district text not null,
  date date not null,
  time text not null,
  duration integer not null default 60,
  skill_level text not null check (skill_level in ('Beginner', 'Intermediate', 'Advanced')),
  max_players integer not null default 4,
  current_players integer not null default 1,
  description text,
  entry_fee integer default 0,
  is_public boolean default true,
  beginner_friendly boolean default true,
  equipment_required text,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

-- Game participants (many-to-many)
create table if not exists public.game_participants (
  game_id uuid references public.games(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (game_id, user_id)
);

-- Communities
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sport text not null,
  district text not null,
  member_count integer default 1,
  description text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Community members
create table if not exists public.community_members (
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member',
  joined_at timestamptz default now(),
  primary key (community_id, user_id)
);

-- Chat messages (per game)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

-- Ratings
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete cascade,
  rater_id uuid references public.profiles(id) on delete cascade,
  rated_id uuid references public.profiles(id) on delete cascade,
  friendly integer check (friendly between 1 and 5),
  skill integer check (skill between 1 and 5),
  punctuality integer check (punctuality between 1 and 5),
  sportsmanship integer check (sportsmanship between 1 and 5),
  would_play_again boolean,
  overall integer check (overall between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique (game_id, rater_id, rated_id)
);

-- Indexes for performance
create index if not exists idx_games_district_date on public.games(district, date);
create index if not exists idx_games_sport on public.games(sport);
create index if not exists idx_messages_game on public.messages(game_id);
create index if not exists idx_participants_user on public.game_participants(user_id);

-- Row Level Security (RLS)

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_participants enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.messages enable row level security;
alter table public.ratings enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Games policies
create policy "Public games are viewable by everyone"
  on public.games for select using (is_public = true);

create policy "Hosts can create games"
  on public.games for insert with check (auth.uid() = host_id);

create policy "Hosts can update their games"
  on public.games for update using (auth.uid() = host_id);

create policy "Hosts can delete their games"
  on public.games for delete using (auth.uid() = host_id);

-- Game participants policies
create policy "Participants visible to game members"
  on public.game_participants for select using (
    exists (
      select 1 from public.games g 
      where g.id = game_id and (g.host_id = auth.uid() or g.id in (
        select game_id from public.game_participants where user_id = auth.uid()
      ))
    )
  );

create policy "Users can join public games"
  on public.game_participants for insert with check (
    auth.uid() = user_id and 
    exists (select 1 from public.games where id = game_id and is_public = true)
  );

create policy "Users can leave games they joined"
  on public.game_participants for delete using (auth.uid() = user_id);

-- Messages policies (only game participants can chat)
create policy "Messages visible to game participants"
  on public.messages for select using (
    exists (
      select 1 from public.game_participants gp 
      where gp.game_id = messages.game_id and gp.user_id = auth.uid()
    ) or exists (
      select 1 from public.games g where g.id = game_id and g.host_id = auth.uid()
    )
  );

create policy "Participants can send messages"
  on public.messages for insert with check (
    auth.uid() = user_id and (
      exists (
        select 1 from public.game_participants gp 
        where gp.game_id = messages.game_id and gp.user_id = auth.uid()
      ) or exists (
        select 1 from public.games g where g.id = game_id and g.host_id = auth.uid()
      )
    )
  );

-- Ratings policies
create policy "Ratings are public for reputation"
  on public.ratings for select using (true);

create policy "Users can rate players after games"
  on public.ratings for insert with check (auth.uid() = rater_id);

-- Communities policies (simple for MVP)
create policy "Communities are public"
  on public.communities for select using (true);

create policy "Anyone can create communities (MVP)"
  on public.communities for insert with check (true);

create policy "Community members are visible"
  on public.community_members for select using (true);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update game current_players count
create or replace function public.update_game_player_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.games 
    set current_players = current_players + 1 
    where id = new.game_id;
  elsif (tg_op = 'DELETE') then
    update public.games 
    set current_players = greatest(current_players - 1, 1)
    where id = old.game_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Triggers for player count
drop trigger if exists on_participant_change on public.game_participants;
create trigger on_participant_change
  after insert or delete on public.game_participants
  for each row execute procedure public.update_game_player_count();

-- Enable Realtime for key tables
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.game_participants;

-- Seed some initial communities (optional)
insert into public.communities (name, sport, district, description, member_count) values
  ('Kochi Badminton Club', 'Badminton', 'Ernakulam', 'Weekly games and tournaments for players of all levels in Kochi.', 284),
  ('Calicut Footballers', 'Football', 'Kozhikode', 'Casual 5 and 7-a-side matches around Calicut.', 156),
  ('Trivandrum Runners', 'Running', 'Thiruvananthapuram', 'Morning runs and weekend long runs. All paces welcome.', 421),
  ('Pickleball Kochi', 'Pickleball', 'Ernakulam', 'Growing community of pickleball players in Kochi.', 89)
on conflict do nothing;
