import {
  NotFoundError,
  coerceNumber,
  combineDateAndTime,
  fetchOpenF1,
  slugify,
  type OpenF1Driver,
  type OpenF1Lap,
  type OpenF1PitStop,
  type OpenF1Race,
  type OpenF1Session,
  type OpenF1Stint,
  type QueryValue,
} from "./openf1";
import {
  getFirstDefined,
  pickBoolean,
  pickNumber,
  pickString,
  toSecondsString,
} from "./openf1-utils";
import {
  normalizeDriver,
  normalizeLap,
  type NormalizedDriver,
  type NormalizedLap,
} from "./openf1-normalizers";

export type SessionType = "practice" | "qualifying" | "race";

export type RaceSummaryDriver = NormalizedDriver;

export type RaceSummarySession = {
  id: string;
  raceId: string;
  sessionType: SessionType;
  name: string;
  startedAt: string;
  endedAt: string | null;
};

export type RaceSummaryStint = {
  id: string;
  sessionId: string;
  driverId: string;
  stintNumber: number;
  compound: string;
  startLap: number;
  endLap: number | null;
};

export type RaceSummaryPitStop = {
  id: string;
  sessionId: string;
  driverId: string;
  lapNumber: number;
  durationSeconds: number | null;
  rawDuration: string | null;
  stopTime: string | null;
  reason: string | null;
};

export type RaceSummaryLap = NormalizedLap;

export type SummaryMetrics = {
  totalLaps: number;
  fastestLapSeconds: number | null;
  averageLapSeconds: number | null;
  driverAverages: Array<{
    driverId: string;
    lapCount: number;
    averageLapSeconds: number | null;
    bestLapSeconds: number | null;
  }>;
};

export type RaceSummary = {
  race: {
    id: string;
    season: number;
    round: number;
    name: string;
    circuit: string;
    location: string;
    startedAt: string;
    completedAt: string | null;
  };
  sessions: RaceSummarySession[];
  drivers: RaceSummaryDriver[];
  stints: RaceSummaryStint[];
  pitStops: RaceSummaryPitStop[];
  laps: RaceSummaryLap[];
  metrics: SummaryMetrics;
};

export type RaceSummaryOptions = {
  sessionTypes?: SessionType[];
};

function resolveSessionType(session: OpenF1Session): SessionType {
  const typeCandidate = pickString(session as Record<string, unknown>, [
    "session_type",
  ]);
  const nameCandidate = pickString(session as Record<string, unknown>, [
    "session_name",
  ]);
  const combined = (typeCandidate ?? nameCandidate ?? "").toLowerCase();

  if (combined.includes("practice") || combined.startsWith("fp")) {
    return "practice";
  }

  if (combined.includes("qual") || combined.startsWith("q")) {
    return "qualifying";
  }

  return "race";
}

function resolveRaceLocation(race: OpenF1Race): string {
  const parts = [
    pickString(race as Record<string, unknown>, ["location"]),
    pickString(race as Record<string, unknown>, ["country"]),
  ].filter((part): part is string => typeof part === "string" && part.length > 0);

  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts[0]}, ${parts[1]}`;
}

function ensureSessionTime(value: string | null, fallback: string): string {
  return value ?? fallback;
}

function normalizeStint(sessionKey: string, stint: OpenF1Stint, index: number): RaceSummaryStint {
  const driverNumber = getFirstDefined(
    coerceNumber(stint.driver_number),
    0,
  );
  const stintNumber = getFirstDefined(
    pickNumber(stint as Record<string, unknown>, ["stint", "stint_number"]),
    index + 1,
  );
  const compound =
    pickString(stint as Record<string, unknown>, ["compound"]) ?? "Unknown";
  const startLap = getFirstDefined(
    pickNumber(stint as Record<string, unknown>, ["lap_start", "start_lap"]),
    0,
  );
  const endLap = pickNumber(stint as Record<string, unknown>, ["lap_end", "end_lap"]);

  return {
    id: `${sessionKey}-${driverNumber}-${stintNumber}`,
    sessionId: sessionKey,
    driverId: String(driverNumber),
    stintNumber,
    compound,
    startLap,
    endLap,
  };
}

function normalizePitStop(
  sessionKey: string,
  pitStop: OpenF1PitStop,
  index: number,
): RaceSummaryPitStop {
  const driverNumber = getFirstDefined(
    coerceNumber(pitStop.driver_number),
    0,
  );
  const lapNumber = getFirstDefined(
    pickNumber(pitStop as Record<string, unknown>, ["lap_number"]),
    index + 1,
  );
  const durationSeconds = pickNumber(pitStop as Record<string, unknown>, [
    "pit_duration",
    "duration",
    "pit_total",
    "total",
  ]);
  const rawDuration = toSecondsString(durationSeconds);
  const stopTime = pickString(pitStop as Record<string, unknown>, [
    "pit_time",
    "time",
    "stopped",
  ]);
  const reason = pickString(pitStop as Record<string, unknown>, ["reason"]);

  return {
    id: `${sessionKey}-${driverNumber}-${lapNumber}-${index}`,
    sessionId: sessionKey,
    driverId: String(driverNumber),
    lapNumber,
    durationSeconds,
    rawDuration,
    stopTime,
    reason,
  };
}

function calculateMetrics(laps: RaceSummaryLap[]): SummaryMetrics {
  const lapTimeValues = laps
    .map((lap) => lap.lapTimeSeconds)
    .filter((value): value is number => typeof value === "number");

  const fastestLapSeconds =
    lapTimeValues.length > 0 ? Math.min(...lapTimeValues) : null;

  const averageLapSeconds =
    lapTimeValues.length > 0
      ? lapTimeValues.reduce((total, value) => total + value, 0) /
        lapTimeValues.length
      : null;

  const lapsByDriver = new Map<string, number[]>();
  for (const lap of laps) {
    if (typeof lap.lapTimeSeconds === "number") {
      const entry = lapsByDriver.get(lap.driverId);
      if (entry) {
        entry.push(lap.lapTimeSeconds);
      } else {
        lapsByDriver.set(lap.driverId, [lap.lapTimeSeconds]);
      }
    }
  }

  const driverAverages = Array.from(lapsByDriver.entries()).map(
    ([driverId, values]) => {
      const lapCount = values.length;
      const bestLapSeconds = Math.min(...values);
      const averageSeconds =
        lapCount > 0
          ? values.reduce((total, value) => total + value, 0) / lapCount
          : null;

      return {
        driverId,
        lapCount,
        averageLapSeconds: averageSeconds,
        bestLapSeconds,
      };
    },
  );

  return {
    totalLaps: laps.length,
    fastestLapSeconds,
    averageLapSeconds,
    driverAverages,
  };
}

async function fetchResource<T>(
  resource: string,
  params: Record<string, QueryValue>,
): Promise<T[]> {
  return fetchOpenF1<T[]>(resource, params, { next: { revalidate: 120 } });
}

export async function fetchRaceSummary(
  raceKey: string,
  options: RaceSummaryOptions = {},
): Promise<RaceSummary> {
  const raceKeyNumber = Number(raceKey);
  const raceParams: Record<string, QueryValue> = Number.isFinite(raceKeyNumber)
    ? { race_key: raceKeyNumber }
    : { race_key: raceKey };

  const races = await fetchResource<OpenF1Race>("races", raceParams);
  const race = races[0];

  if (!race) {
    throw new NotFoundError(`Race with key ${raceKey} was not found`);
  }

  const sessions = await fetchResource<OpenF1Session>("sessions", raceParams);
  const sessionSummaries: RaceSummarySession[] = [];
  const sessionKeyList: string[] = [];

  const raceStartFallback = combineDateAndTime(
    race.start_date ?? null,
    race.start_time ?? null,
  );
  const raceEndFallback = combineDateAndTime(
    race.end_date ?? null,
    race.end_time ?? null,
  );

  const allowedSessionTypes = options.sessionTypes;

  for (const session of sessions) {
    const sessionKey = String(session.session_key);
    const sessionType = resolveSessionType(session);

    if (Array.isArray(allowedSessionTypes) && allowedSessionTypes.length > 0) {
      if (!allowedSessionTypes.includes(sessionType)) {
        continue;
      }
    }

    const startedAt = combineDateAndTime(session.start_date, session.start_time);
    const endedAt = combineDateAndTime(session.end_date, session.end_time);
    const name =
      pickString(session as Record<string, unknown>, ["session_name"]) ??
      `Session ${sessionKey}`;

    sessionSummaries.push({
      id: sessionKey,
      raceId: String(race.race_key),
      sessionType,
      name,
      startedAt: ensureSessionTime(
        startedAt,
        ensureSessionTime(raceStartFallback, new Date(0).toISOString()),
      ),
      endedAt: endedAt ?? raceEndFallback ?? null,
    });
    sessionKeyList.push(sessionKey);
  }

  sessionSummaries.sort((a, b) => a.startedAt.localeCompare(b.startedAt));

  const stintsResponses = await Promise.all(
    sessionKeyList.map((sessionKey) =>
      fetchResource<OpenF1Stint>("stints", { session_key: sessionKey }),
    ),
  );
  const pitStopResponses = await Promise.all(
    sessionKeyList.map((sessionKey) =>
      fetchResource<OpenF1PitStop>("pit", { session_key: sessionKey }),
    ),
  );
  const lapResponses = await Promise.all(
    sessionKeyList.map((sessionKey) =>
      fetchResource<OpenF1Lap>("laps", { session_key: sessionKey }),
    ),
  );

  const stints: RaceSummaryStint[] = [];
  const pitStops: RaceSummaryPitStop[] = [];
  const laps: RaceSummaryLap[] = [];
  const driverNumbers = new Set<string>();

  sessionKeyList.forEach((sessionKey, index) => {
    const stintsForSession = stintsResponses[index] ?? [];
    stintsForSession.forEach((stint, stintIndex) => {
      const normalized = normalizeStint(sessionKey, stint, stintIndex);
      stints.push(normalized);
      driverNumbers.add(normalized.driverId);
    });

    const pitStopsForSession = pitStopResponses[index] ?? [];
    pitStopsForSession.forEach((pitStop, pitIndex) => {
      const normalized = normalizePitStop(sessionKey, pitStop, pitIndex);
      pitStops.push(normalized);
      driverNumbers.add(normalized.driverId);
    });

    const lapsForSession = lapResponses[index] ?? [];
    lapsForSession.forEach((lap) => {
      const normalized = normalizeLap(sessionKey, lap);
      laps.push(normalized);
      driverNumbers.add(normalized.driverId);
    });
  });

  const driverResponses = await Promise.all(
    sessionKeyList.map((sessionKey) =>
      fetchResource<OpenF1Driver>("drivers", { session_key: sessionKey }),
    ),
  );

  const driverMap = new Map<string, RaceSummaryDriver>();
  driverResponses.forEach((drivers) => {
    drivers.forEach((driver) => {
      const normalized = normalizeDriver(driver);
      if (!driverMap.has(normalized.id)) {
        driverMap.set(normalized.id, normalized);
      }
    });
  });

  // Ensure every driver present in timing data has an entry.
  driverNumbers.forEach((driverId) => {
    if (!driverMap.has(driverId)) {
      driverMap.set(driverId, {
        id: driverId,
        firstName: driverId,
        lastName: driverId,
        code: driverId,
        number: Number(driverId) || 0,
        country: null,
        teamId: null,
        team: null,
      });
    }
  });

  const drivers = Array.from(driverMap.values()).sort((a, b) => a.number - b.number);

  const metrics = calculateMetrics(laps);

  const raceName =
    pickString(race as Record<string, unknown>, ["grand_prix", "event_name"]) ??
    `Race ${race.race_key}`;
  const raceCircuit =
    pickString(race as Record<string, unknown>, ["circuit"]) ?? "";
  const raceLocation = resolveRaceLocation(race);

  const season = getFirstDefined(coerceNumber(race.year), 0);
  const round = getFirstDefined(coerceNumber(race.round), 0);

  const raceStartedAt = ensureSessionTime(
    raceStartFallback,
    sessionSummaries[0]?.startedAt ?? new Date(0).toISOString(),
  );
  const lastSession =
    sessionSummaries.length > 0
      ? sessionSummaries[sessionSummaries.length - 1]
      : null;
  const raceCompletedAt = raceEndFallback ?? lastSession?.endedAt ?? null;

  return {
    race: {
      id: String(race.race_key),
      season,
      round,
      name: raceName,
      circuit: raceCircuit,
      location: raceLocation,
      startedAt: raceStartedAt,
      completedAt: raceCompletedAt,
    },
    sessions: sessionSummaries,
    drivers,
    stints,
    pitStops,
    laps,
    metrics,
  };
}

export function resolveDriverName(
  drivers: Map<string, RaceSummaryDriver>,
  driverId: string,
): string {
  const driver = drivers.get(driverId);
  if (!driver) {
    return driverId;
  }
  return `${driver.firstName} ${driver.lastName}`.trim();
}

