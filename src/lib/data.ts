export type Team = {
  id: string;
  name: string;
  base: string;
  principal: string;
};

export type Driver = {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  number: number;
  country: string;
  teamId: string;
};

export type Race = {
  id: string;
  season: number;
  round: number;
  name: string;
  circuit: string;
  location: string;
  startedAt: string;
  completedAt: string;
};

export type Session = {
  id: string;
  raceId: string;
  sessionType: "practice" | "qualifying" | "race";
  name: string;
  startedAt: string;
  endedAt: string;
};

export type Stint = {
  id: string;
  sessionId: string;
  driverId: string;
  stintNumber: number;
  compound: string;
  startLap: number;
  endLap: number;
};

export type PitStop = {
  id: string;
  sessionId: string;
  driverId: string;
  lapNumber: number;
  durationSeconds: number;
  stopTime: string;
  reason: string;
};

export type Lap = {
  sessionId: string;
  driverId: string;
  lapNumber: number;
  lapTime: string;
  sector1: string;
  sector2: string;
  sector3: string;
  position: number;
  isPit: boolean;
};

export const teams: Team[] = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    name: "Southern Cross Racing",
    base: "Melbourne, Australia",
    principal: "Ava Thompson",
  },
  {
    id: "b2222222-2222-4222-8222-222222222222",
    name: "Harbour Lights Motorsport",
    base: "Sydney, Australia",
    principal: "Leo Martin",
  },
];

export const drivers: Driver[] = [
  {
    id: "d3333333-3333-4333-8333-333333333333",
    firstName: "Mia",
    lastName: "Hayes",
    code: "HAY",
    number: 11,
    country: "Australia",
    teamId: "a1111111-1111-4111-8111-111111111111",
  },
  {
    id: "d4444444-4444-4444-8444-444444444444",
    firstName: "Isla",
    lastName: "Patel",
    code: "PAT",
    number: 12,
    country: "New Zealand",
    teamId: "a1111111-1111-4111-8111-111111111111",
  },
  {
    id: "d5555555-5555-4555-8555-555555555555",
    firstName: "Noah",
    lastName: "Silva",
    code: "SIL",
    number: 21,
    country: "Brazil",
    teamId: "b2222222-2222-4222-8222-222222222222",
  },
  {
    id: "d6666666-6666-4666-8666-666666666666",
    firstName: "Elias",
    lastName: "Bennett",
    code: "BEN",
    number: 22,
    country: "United Kingdom",
    teamId: "b2222222-2222-4222-8222-222222222222",
  },
];

export const races: Race[] = [
  {
    id: "r7777777-7777-4777-8777-777777777777",
    season: 2024,
    round: 3,
    name: "Australian Grand Prix",
    circuit: "Albert Park Circuit",
    location: "Melbourne, Australia",
    startedAt: "2024-03-24T05:00:00Z",
    completedAt: "2024-03-24T07:00:00Z",
  },
];

export const sessions: Session[] = [
  {
    id: "s8888888-8888-4888-8888-888888888881",
    raceId: "r7777777-7777-4777-8777-777777777777",
    sessionType: "practice",
    name: "Free Practice 1",
    startedAt: "2024-03-22T01:30:00Z",
    endedAt: "2024-03-22T03:00:00Z",
  },
  {
    id: "s8888888-8888-4888-8888-888888888882",
    raceId: "r7777777-7777-4777-8777-777777777777",
    sessionType: "qualifying",
    name: "Qualifying",
    startedAt: "2024-03-23T05:00:00Z",
    endedAt: "2024-03-23T06:00:00Z",
  },
  {
    id: "s8888888-8888-4888-8888-888888888883",
    raceId: "r7777777-7777-4777-8777-777777777777",
    sessionType: "race",
    name: "Grand Prix",
    startedAt: "2024-03-24T05:00:00Z",
    endedAt: "2024-03-24T07:00:00Z",
  },
];

export const stints: Stint[] = [
  {
    id: "t9999999-1111-4111-9111-999999999991",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d3333333-3333-4333-8333-333333333333",
    stintNumber: 1,
    compound: "Medium",
    startLap: 1,
    endLap: 18,
  },
  {
    id: "t9999999-1111-4111-9111-999999999992",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d3333333-3333-4333-8333-333333333333",
    stintNumber: 2,
    compound: "Hard",
    startLap: 19,
    endLap: 58,
  },
  {
    id: "t9999999-1111-4111-9111-999999999993",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d4444444-4444-4444-8444-444444444444",
    stintNumber: 1,
    compound: "Soft",
    startLap: 1,
    endLap: 12,
  },
  {
    id: "t9999999-1111-4111-9111-999999999994",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d4444444-4444-4444-8444-444444444444",
    stintNumber: 2,
    compound: "Medium",
    startLap: 13,
    endLap: 40,
  },
  {
    id: "t9999999-1111-4111-9111-999999999995",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d4444444-4444-4444-8444-444444444444",
    stintNumber: 3,
    compound: "Soft",
    startLap: 41,
    endLap: 58,
  },
  {
    id: "t9999999-1111-4111-9111-999999999996",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d5555555-5555-4555-8555-555555555555",
    stintNumber: 1,
    compound: "Medium",
    startLap: 1,
    endLap: 20,
  },
  {
    id: "t9999999-1111-4111-9111-999999999997",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d5555555-5555-4555-8555-555555555555",
    stintNumber: 2,
    compound: "Hard",
    startLap: 21,
    endLap: 58,
  },
  {
    id: "t9999999-1111-4111-9111-999999999998",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d6666666-6666-4666-8666-666666666666",
    stintNumber: 1,
    compound: "Soft",
    startLap: 1,
    endLap: 10,
  },
  {
    id: "t9999999-1111-4111-9111-999999999999",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d6666666-6666-4666-8666-666666666666",
    stintNumber: 2,
    compound: "Medium",
    startLap: 11,
    endLap: 32,
  },
  {
    id: "u9999999-1111-4111-9111-999999999991",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d6666666-6666-4666-8666-666666666666",
    stintNumber: 3,
    compound: "Soft",
    startLap: 33,
    endLap: 58,
  },
];

export const pitStops: PitStop[] = [
  {
    id: "paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d3333333-3333-4333-8333-333333333333",
    lapNumber: 18,
    durationSeconds: 2.45,
    stopTime: "2024-03-24T06:02:00Z",
    reason: "Tyre change",
  },
  {
    id: "paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d4444444-4444-4444-8444-444444444444",
    lapNumber: 12,
    durationSeconds: 2.32,
    stopTime: "2024-03-24T06:00:30Z",
    reason: "Tyre change",
  },
  {
    id: "paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d4444444-4444-4444-8444-444444444444",
    lapNumber: 40,
    durationSeconds: 2.65,
    stopTime: "2024-03-24T06:40:10Z",
    reason: "Tyre change",
  },
  {
    id: "paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d5555555-5555-4555-8555-555555555555",
    lapNumber: 20,
    durationSeconds: 2.51,
    stopTime: "2024-03-24T06:05:20Z",
    reason: "Tyre change",
  },
  {
    id: "paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d6666666-6666-4666-8666-666666666666",
    lapNumber: 10,
    durationSeconds: 2.78,
    stopTime: "2024-03-24T05:58:40Z",
    reason: "Tyre change",
  },
  {
    id: "paaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6",
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d6666666-6666-4666-8666-666666666666",
    lapNumber: 32,
    durationSeconds: 2.91,
    stopTime: "2024-03-24T06:34:20Z",
    reason: "Tyre change",
  },
];

export const laps: Lap[] = [
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d3333333-3333-4333-8333-333333333333",
    lapNumber: 1,
    lapTime: "1:25.312",
    sector1: "28.456",
    sector2: "27.932",
    sector3: "28.924",
    position: 2,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d3333333-3333-4333-8333-333333333333",
    lapNumber: 2,
    lapTime: "1:24.998",
    sector1: "28.392",
    sector2: "27.801",
    sector3: "28.805",
    position: 2,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d3333333-3333-4333-8333-333333333333",
    lapNumber: 3,
    lapTime: "1:25.104",
    sector1: "28.410",
    sector2: "27.865",
    sector3: "28.829",
    position: 2,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d3333333-3333-4333-8333-333333333333",
    lapNumber: 4,
    lapTime: "1:25.287",
    sector1: "28.500",
    sector2: "27.901",
    sector3: "28.886",
    position: 2,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d3333333-3333-4333-8333-333333333333",
    lapNumber: 5,
    lapTime: "1:25.642",
    sector1: "28.670",
    sector2: "27.950",
    sector3: "29.022",
    position: 2,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d4444444-4444-4444-8444-444444444444",
    lapNumber: 1,
    lapTime: "1:25.954",
    sector1: "28.601",
    sector2: "28.041",
    sector3: "29.312",
    position: 4,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d4444444-4444-4444-8444-444444444444",
    lapNumber: 2,
    lapTime: "1:25.832",
    sector1: "28.534",
    sector2: "27.990",
    sector3: "29.308",
    position: 4,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d4444444-4444-4444-8444-444444444444",
    lapNumber: 3,
    lapTime: "1:25.910",
    sector1: "28.612",
    sector2: "28.005",
    sector3: "29.293",
    position: 4,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d4444444-4444-4444-8444-444444444444",
    lapNumber: 4,
    lapTime: "1:26.130",
    sector1: "28.734",
    sector2: "28.142",
    sector3: "29.254",
    position: 5,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d4444444-4444-4444-8444-444444444444",
    lapNumber: 5,
    lapTime: "1:26.482",
    sector1: "28.903",
    sector2: "28.300",
    sector3: "29.279",
    position: 5,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d5555555-5555-4555-8555-555555555555",
    lapNumber: 1,
    lapTime: "1:24.998",
    sector1: "28.310",
    sector2: "27.720",
    sector3: "28.968",
    position: 1,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d5555555-5555-4555-8555-555555555555",
    lapNumber: 2,
    lapTime: "1:24.812",
    sector1: "28.245",
    sector2: "27.684",
    sector3: "28.883",
    position: 1,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d5555555-5555-4555-8555-555555555555",
    lapNumber: 3,
    lapTime: "1:24.935",
    sector1: "28.301",
    sector2: "27.732",
    sector3: "28.902",
    position: 1,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d5555555-5555-4555-8555-555555555555",
    lapNumber: 4,
    lapTime: "1:25.044",
    sector1: "28.340",
    sector2: "27.760",
    sector3: "28.944",
    position: 1,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d5555555-5555-4555-8555-555555555555",
    lapNumber: 5,
    lapTime: "1:25.398",
    sector1: "28.520",
    sector2: "27.880",
    sector3: "28.998",
    position: 1,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d6666666-6666-4666-8666-666666666666",
    lapNumber: 1,
    lapTime: "1:26.444",
    sector1: "28.812",
    sector2: "28.180",
    sector3: "29.452",
    position: 6,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d6666666-6666-4666-8666-666666666666",
    lapNumber: 2,
    lapTime: "1:26.390",
    sector1: "28.784",
    sector2: "28.152",
    sector3: "29.454",
    position: 6,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d6666666-6666-4666-8666-666666666666",
    lapNumber: 3,
    lapTime: "1:26.285",
    sector1: "28.730",
    sector2: "28.110",
    sector3: "29.445",
    position: 6,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d6666666-6666-4666-8666-666666666666",
    lapNumber: 4,
    lapTime: "1:26.610",
    sector1: "28.890",
    sector2: "28.260",
    sector3: "29.460",
    position: 7,
    isPit: false,
  },
  {
    sessionId: "s8888888-8888-4888-8888-888888888883",
    driverId: "d6666666-6666-4666-8666-666666666666",
    lapNumber: 5,
    lapTime: "1:26.982",
    sector1: "29.050",
    sector2: "28.420",
    sector3: "29.512",
    position: 7,
    isPit: false,
  },
];

export function getTeamById(id: string) {
  return teams.find((team) => team.id === id);
}

export function getDriverById(id: string) {
  return drivers.find((driver) => driver.id === id);
}

export function getRaceById(id: string) {
  return races.find((race) => race.id === id);
}

export function getSessionsForRace(raceId: string) {
  return sessions.filter((session) => session.raceId === raceId);
}

export function getStintsForDriver(driverId: string) {
  return stints.filter((stint) => stint.driverId === driverId);
}

export function getPitStopsForDriver(driverId: string) {
  return pitStops.filter((stop) => stop.driverId === driverId);
}

export function getLapsForDriver(driverId: string) {
  return laps.filter((lap) => lap.driverId === driverId);
}

export function getLapsForRace(raceId: string) {
  const raceSessions = getSessionsForRace(raceId);
  const sessionIds = new Set(raceSessions.map((session) => session.id));
  return laps.filter((lap) => sessionIds.has(lap.sessionId));
}

export function getDriversForTeam(teamId: string) {
  return drivers.filter((driver) => driver.teamId === teamId);
}

export function getDriversForRace(raceId: string) {
  const raceSessions = getSessionsForRace(raceId);
  const sessionIds = new Set(raceSessions.map((session) => session.id));
  const driverIds = new Set(
    stints
      .filter((stint) => sessionIds.has(stint.sessionId))
      .map((stint) => stint.driverId),
  );
  return drivers.filter((driver) => driverIds.has(driver.id));
}

export function getPitStopsForRace(raceId: string) {
  const raceSessions = getSessionsForRace(raceId);
  const sessionIds = new Set(raceSessions.map((session) => session.id));
  return pitStops.filter((stop) => sessionIds.has(stop.sessionId));
}

export function getStintsForRace(raceId: string) {
  const raceSessions = getSessionsForRace(raceId);
  const sessionIds = new Set(raceSessions.map((session) => session.id));
  return stints.filter((stint) => sessionIds.has(stint.sessionId));
}
