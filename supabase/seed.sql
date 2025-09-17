-- Seed data for the 2024 Australian Grand Prix weekend
-- Teams
insert into public.teams (id, name, base, principal)
values
  ('a1111111-1111-4111-8111-111111111111', 'Southern Cross Racing', 'Melbourne, Australia', 'Ava Thompson'),
  ('b2222222-2222-4222-8222-222222222222', 'Harbour Lights Motorsport', 'Sydney, Australia', 'Leo Martin')
on conflict (id) do nothing;

-- Drivers
insert into public.drivers (id, first_name, last_name, code, number, country, team_id)
values
  ('d3333333-3333-4333-8333-333333333333', 'Mia', 'Hayes', 'HAY', 11, 'Australia', 'a1111111-1111-4111-8111-111111111111'),
  ('d4444444-4444-4444-8444-444444444444', 'Isla', 'Patel', 'PAT', 12, 'New Zealand', 'a1111111-1111-4111-8111-111111111111'),
  ('d5555555-5555-4555-8555-555555555555', 'Noah', 'Silva', 'SIL', 21, 'Brazil', 'b2222222-2222-4222-8222-222222222222'),
  ('d6666666-6666-4666-8666-666666666666', 'Elias', 'Bennett', 'BEN', 22, 'United Kingdom', 'b2222222-2222-4222-8222-222222222222')
on conflict (id) do nothing;

-- Race
insert into public.races (id, season, round, name, circuit, location, started_at, completed_at)
values
  (
    'r7777777-7777-4777-8777-777777777777',
    2024,
    3,
    'Australian Grand Prix',
    'Albert Park Circuit',
    'Melbourne, Australia',
    '2024-03-24T05:00:00Z',
    '2024-03-24T07:00:00Z'
  )
on conflict (id) do nothing;

-- Sessions
insert into public.sessions (id, race_id, session_type, name, started_at, ended_at)
values
  (
    's8888888-8888-4888-8888-888888888881',
    'r7777777-7777-4777-8777-777777777777',
    'practice',
    'Free Practice 1',
    '2024-03-22T01:30:00Z',
    '2024-03-22T03:00:00Z'
  ),
  (
    's8888888-8888-4888-8888-888888888882',
    'r7777777-7777-4777-8777-777777777777',
    'qualifying',
    'Qualifying',
    '2024-03-23T05:00:00Z',
    '2024-03-23T06:00:00Z'
  ),
  (
    's8888888-8888-4888-8888-888888888883',
    'r7777777-7777-4777-8777-777777777777',
    'race',
    'Grand Prix',
    '2024-03-24T05:00:00Z',
    '2024-03-24T07:00:00Z'
  )
on conflict (id) do nothing;

-- Race stints (race session only)
insert into public.stints (id, session_id, driver_id, stint_number, compound, start_lap, end_lap)
values
  ('t9999999-1111-4111-9111-999999999991', 's8888888-8888-4888-8888-888888888883', 'd3333333-3333-4333-8333-333333333333', 1, 'Medium', 1, 18),
  ('t9999999-1111-4111-9111-999999999992', 's8888888-8888-4888-8888-888888888883', 'd3333333-3333-4333-8333-333333333333', 2, 'Hard', 19, 58),
  ('t9999999-1111-4111-9111-999999999993', 's8888888-8888-4888-8888-888888888883', 'd4444444-4444-4444-8444-444444444444', 1, 'Soft', 1, 12),
  ('t9999999-1111-4111-9111-999999999994', 's8888888-8888-4888-8888-888888888883', 'd4444444-4444-4444-8444-444444444444', 2, 'Medium', 13, 40),
  ('t9999999-1111-4111-9111-999999999995', 's8888888-8888-4888-8888-888888888883', 'd4444444-4444-4444-8444-444444444444', 3, 'Soft', 41, 58),
  ('t9999999-1111-4111-9111-999999999996', 's8888888-8888-4888-8888-888888888883', 'd5555555-5555-4555-8555-555555555555', 1, 'Medium', 1, 20),
  ('t9999999-1111-4111-9111-999999999997', 's8888888-8888-4888-8888-888888888883', 'd5555555-5555-4555-8555-555555555555', 2, 'Hard', 21, 58),
  ('t9999999-1111-4111-9111-999999999998', 's8888888-8888-4888-8888-888888888883', 'd6666666-6666-4666-8666-666666666666', 1, 'Soft', 1, 10),
  ('t9999999-1111-4111-9111-999999999999', 's8888888-8888-4888-8888-888888888883', 'd6666666-6666-4666-8666-666666666666', 2, 'Medium', 11, 32),
  ('u9999999-1111-4111-9111-999999999991', 's8888888-8888-4888-8888-888888888883', 'd6666666-6666-4666-8666-666666666666', 3, 'Soft', 33, 58)
  on conflict (id) do nothing;

-- Pit stops for the race
insert into public.pitstops (id, session_id, driver_id, lap_number, duration, stop_time, reason)
values
  ('paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 's8888888-8888-4888-8888-888888888883', 'd3333333-3333-4333-8333-333333333333', 18, interval '2.45 seconds', '2024-03-24T06:02:00Z', 'Tyre change'),
  ('paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 's8888888-8888-4888-8888-888888888883', 'd4444444-4444-4444-8444-444444444444', 12, interval '2.32 seconds', '2024-03-24T06:00:30Z', 'Tyre change'),
  ('paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 's8888888-8888-4888-8888-888888888883', 'd4444444-4444-4444-8444-444444444444', 40, interval '2.65 seconds', '2024-03-24T06:40:10Z', 'Tyre change'),
  ('paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 's8888888-8888-4888-8888-888888888883', 'd5555555-5555-4555-8555-555555555555', 20, interval '2.51 seconds', '2024-03-24T06:05:20Z', 'Tyre change'),
  ('paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 's8888888-8888-4888-8888-888888888883', 'd6666666-6666-4666-8666-666666666666', 10, interval '2.78 seconds', '2024-03-24T05:58:40Z', 'Tyre change'),
  ('paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 's8888888-8888-4888-8888-888888888883', 'd6666666-6666-4666-8666-666666666666', 32, interval '2.91 seconds', '2024-03-24T06:34:20Z', 'Tyre change')
  on conflict (id) do nothing;

-- A sample of laps for the opening phase of the race (first five laps per driver)
insert into public.laps (session_id, driver_id, lap_number, lap_time, sector1, sector2, sector3, position, is_pit)
values
  ('s8888888-8888-4888-8888-888888888883', 'd3333333-3333-4333-8333-333333333333', 1, interval '1 minute 25.312 seconds', interval '28.456 seconds', interval '27.932 seconds', interval '28.924 seconds', 2, false),
  ('s8888888-8888-4888-8888-888888888883', 'd3333333-3333-4333-8333-333333333333', 2, interval '1 minute 24.998 seconds', interval '28.392 seconds', interval '27.801 seconds', interval '28.805 seconds', 2, false),
  ('s8888888-8888-4888-8888-888888888883', 'd3333333-3333-4333-8333-333333333333', 3, interval '1 minute 25.104 seconds', interval '28.410 seconds', interval '27.865 seconds', interval '28.829 seconds', 2, false),
  ('s8888888-8888-4888-8888-888888888883', 'd3333333-3333-4333-8333-333333333333', 4, interval '1 minute 25.287 seconds', interval '28.500 seconds', interval '27.901 seconds', interval '28.886 seconds', 2, false),
  ('s8888888-8888-4888-8888-888888888883', 'd3333333-3333-4333-8333-333333333333', 5, interval '1 minute 25.642 seconds', interval '28.670 seconds', interval '27.950 seconds', interval '29.022 seconds', 2, false),

  ('s8888888-8888-4888-8888-888888888883', 'd4444444-4444-4444-8444-444444444444', 1, interval '1 minute 25.954 seconds', interval '28.601 seconds', interval '28.041 seconds', interval '29.312 seconds', 4, false),
  ('s8888888-8888-4888-8888-888888888883', 'd4444444-4444-4444-8444-444444444444', 2, interval '1 minute 25.832 seconds', interval '28.534 seconds', interval '27.990 seconds', interval '29.308 seconds', 4, false),
  ('s8888888-8888-4888-8888-888888888883', 'd4444444-4444-4444-8444-444444444444', 3, interval '1 minute 25.910 seconds', interval '28.612 seconds', interval '28.005 seconds', interval '29.293 seconds', 4, false),
  ('s8888888-8888-4888-8888-888888888883', 'd4444444-4444-4444-8444-444444444444', 4, interval '1 minute 26.130 seconds', interval '28.734 seconds', interval '28.142 seconds', interval '29.254 seconds', 5, false),
  ('s8888888-8888-4888-8888-888888888883', 'd4444444-4444-4444-8444-444444444444', 5, interval '1 minute 26.482 seconds', interval '28.903 seconds', interval '28.300 seconds', interval '29.279 seconds', 5, false),

  ('s8888888-8888-4888-8888-888888888883', 'd5555555-5555-4555-8555-555555555555', 1, interval '1 minute 24.998 seconds', interval '28.310 seconds', interval '27.720 seconds', interval '28.968 seconds', 1, false),
  ('s8888888-8888-4888-8888-888888888883', 'd5555555-5555-4555-8555-555555555555', 2, interval '1 minute 24.812 seconds', interval '28.245 seconds', interval '27.684 seconds', interval '28.883 seconds', 1, false),
  ('s8888888-8888-4888-8888-888888888883', 'd5555555-5555-4555-8555-555555555555', 3, interval '1 minute 24.935 seconds', interval '28.301 seconds', interval '27.732 seconds', interval '28.902 seconds', 1, false),
  ('s8888888-8888-4888-8888-888888888883', 'd5555555-5555-4555-8555-555555555555', 4, interval '1 minute 25.044 seconds', interval '28.340 seconds', interval '27.760 seconds', interval '28.944 seconds', 1, false),
  ('s8888888-8888-4888-8888-888888888883', 'd5555555-5555-4555-8555-555555555555', 5, interval '1 minute 25.398 seconds', interval '28.520 seconds', interval '27.880 seconds', interval '28.998 seconds', 1, false),

  ('s8888888-8888-4888-8888-888888888883', 'd6666666-6666-4666-8666-666666666666', 1, interval '1 minute 26.444 seconds', interval '28.812 seconds', interval '28.180 seconds', interval '29.452 seconds', 6, false),
  ('s8888888-8888-4888-8888-888888888883', 'd6666666-6666-4666-8666-666666666666', 2, interval '1 minute 26.390 seconds', interval '28.784 seconds', interval '28.152 seconds', interval '29.454 seconds', 6, false),
  ('s8888888-8888-4888-8888-888888888883', 'd6666666-6666-4666-8666-666666666666', 3, interval '1 minute 26.285 seconds', interval '28.730 seconds', interval '28.110 seconds', interval '29.445 seconds', 6, false),
  ('s8888888-8888-4888-8888-888888888883', 'd6666666-6666-4666-8666-666666666666', 4, interval '1 minute 26.610 seconds', interval '28.890 seconds', interval '28.260 seconds', interval '29.460 seconds', 7, false),
  ('s8888888-8888-4888-8888-888888888883', 'd6666666-6666-4666-8666-666666666666', 5, interval '1 minute 26.982 seconds', interval '29.050 seconds', interval '28.420 seconds', interval '29.512 seconds', 7, false)
  on conflict do nothing;
