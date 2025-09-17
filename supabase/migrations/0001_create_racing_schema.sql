-- Enable UUID generation
create extension if not exists "uuid-ossp";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'session_type') then
    create type session_type as enum ('practice', 'qualifying', 'race');
  end if;
end
$$;

-- Teams participating in the championship
create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  base text,
  principal text,
  created_at timestamptz not null default now()
);

-- Drivers associated with a team
create table if not exists public.drivers (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  code text not null unique,
  number integer not null check (number > 0),
  country text not null,
  team_id uuid references public.teams(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint drivers_number_unique unique (number)
);

-- Race weekend metadata
create table if not exists public.races (
  id uuid primary key default uuid_generate_v4(),
  season integer not null,
  round integer not null,
  name text not null,
  circuit text not null,
  location text not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint races_season_round_unique unique (season, round)
);

-- Sessions (practice, qualifying, race) belonging to a race
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  race_id uuid not null references public.races(id) on delete cascade,
  session_type session_type not null,
  name text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint sessions_time_order check (ended_at is null or ended_at >= started_at),
  constraint sessions_unique_name_per_race unique (race_id, name)
);

-- Pit stops performed during a session
create table if not exists public.pitstops (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  lap_number integer not null check (lap_number > 0),
  duration interval not null check (duration > interval '0 seconds'),
  stop_time timestamptz,
  reason text,
  created_at timestamptz not null default now(),
  constraint pitstops_unique_per_lap unique (session_id, driver_id, lap_number)
);

-- Driver stints within a session
create table if not exists public.stints (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  stint_number integer not null check (stint_number > 0),
  compound text not null,
  start_lap integer not null check (start_lap > 0),
  end_lap integer check (end_lap is null or end_lap >= start_lap),
  total_laps integer generated always as (coalesce(end_lap, start_lap) - start_lap + 1) stored,
  created_at timestamptz not null default now(),
  constraint stints_unique_per_session unique (session_id, driver_id, stint_number)
);

-- Lap records for each driver and session
create table if not exists public.laps (
  id bigserial primary key,
  session_id uuid not null references public.sessions(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  lap_number integer not null check (lap_number > 0),
  lap_time interval,
  sector1 interval,
  sector2 interval,
  sector3 interval,
  position integer check (position is null or position > 0),
  is_pit boolean not null default false,
  created_at timestamptz not null default now(),
  constraint laps_unique_per_driver unique (session_id, driver_id, lap_number)
);

-- Helpful indexes for analytics queries
create index if not exists idx_sessions_race on public.sessions(race_id);
create index if not exists idx_stints_session_driver on public.stints(session_id, driver_id);
create index if not exists idx_laps_session_lap on public.laps(session_id, lap_number);
create index if not exists idx_pitstops_session_driver on public.pitstops(session_id, driver_id);
