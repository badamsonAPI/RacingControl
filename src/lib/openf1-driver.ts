import {
  NotFoundError,
  coerceNumber,
  combineDateAndTime,
  fetchOpenF1,
  type OpenF1Driver,
  type OpenF1Lap,
  type OpenF1Session,
  type QueryValue,
} from "./openf1";
import {
  getFirstDefined,
  pickNumber,
  pickString,
} from "./openf1-utils";
import {
  normalizeDriver,
  normalizeLap,
  type NormalizedDriver,
} from "./openf1-normalizers";
import type { SessionType } from "./openf1-summary";

export type LapDelta = {
  lapNumber: number;
  lapTimeSeconds: number | null;
  rawLapTime: string | null;
  deltaToBestSeconds: number | null;
  deltaToPreviousSeconds: number | null;
  sector1Seconds: number | null;
  sector2Seconds: number | null;
  sector3Seconds: number | null;
  rawSector1: string | null;
  rawSector2: string | null;
  rawSector3: string | null;
  position: number | null;
  isPit: boolean;
};

export type SessionLapSummary = {
  sessionId: string;
  raceId: string | null;
  name: string;
  sessionType: SessionType;
  startedAt: string | null;
  bestLapSeconds: number | null;
  averageLapSeconds: number | null;
  laps: LapDelta[];
};

export type DriverLapDelta = {
  driver: NormalizedDriver;
  sessions: SessionLapSummary[];
};

export type DriverLapDeltaOptions = {
  year?: number;
  season?: number;
  raceKey?: string;
  sessionKey?: string;
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

async function fetchResource<T>(
  resource: string,
  params: Record<string, QueryValue>,
): Promise<T[]> {
  return fetchOpenF1<T[]>(resource, params, { next: { revalidate: 60 } });
}

function mergeOptions(
  driverNumberParam: string,
  options: DriverLapDeltaOptions,
): {
  driverFilter: string | number;
  filters: Record<string, QueryValue>;
} {
  const numericDriver = Number(driverNumberParam);
  const driverFilter = Number.isFinite(numericDriver)
    ? numericDriver
    : driverNumberParam;

  const filters: Record<string, QueryValue> = {
    driver_number: driverFilter,
  };

  if (options.sessionKey) {
    filters.session_key = options.sessionKey;
  }

  if (options.raceKey) {
    filters.race_key = options.raceKey;
  }

  const season = options.year ?? options.season;
  if (season !== undefined) {
    filters.year = season;
  }

  return { driverFilter, filters };
}

function createFallbackDriver(driverId: string): NormalizedDriver {
  const number = Number(driverId);
  return {
    id: driverId,
    firstName: driverId,
    lastName: driverId,
    code: Number.isFinite(number) ? String(number).padStart(2, "0") : driverId,
    number: Number.isFinite(number) ? number : 0,
    country: null,
    teamId: null,
    team: null,
  };
}

function createLapDeltaFromNormalized(lap: ReturnType<typeof normalizeLap>): LapDelta {
  return {
    lapNumber: lap.lapNumber,
    lapTimeSeconds: lap.lapTimeSeconds,
    rawLapTime: lap.rawLapTime,
    deltaToBestSeconds: null,
    deltaToPreviousSeconds: null,
    sector1Seconds: lap.sector1Seconds,
    sector2Seconds: lap.sector2Seconds,
    sector3Seconds: lap.sector3Seconds,
    rawSector1: lap.rawSector1,
    rawSector2: lap.rawSector2,
    rawSector3: lap.rawSector3,
    position: lap.position,
    isPit: lap.isPit,
  };
}

function finalizeSessionMetrics(summary: SessionLapSummary) {
  summary.laps.sort((a, b) => a.lapNumber - b.lapNumber);

  const validLapTimes = summary.laps
    .map((lap) => lap.lapTimeSeconds)
    .filter((value): value is number => typeof value === "number");

  const bestLapSeconds =
    validLapTimes.length > 0 ? Math.min(...validLapTimes) : null;

  const averageLapSeconds =
    validLapTimes.length > 0
      ? validLapTimes.reduce((total, value) => total + value, 0) /
        validLapTimes.length
      : null;

  summary.bestLapSeconds = bestLapSeconds;
  summary.averageLapSeconds = averageLapSeconds;

  for (let index = 0; index < summary.laps.length; index += 1) {
    const lap = summary.laps[index];
    const currentSeconds = lap.lapTimeSeconds;

    if (typeof currentSeconds === "number" && bestLapSeconds !== null) {
      lap.deltaToBestSeconds = currentSeconds - bestLapSeconds;
    } else {
      lap.deltaToBestSeconds = null;
    }

    if (typeof currentSeconds === "number") {
      let previousSeconds: number | null = null;
      for (let previousIndex = index - 1; previousIndex >= 0; previousIndex -= 1) {
        const previousLap = summary.laps[previousIndex];
        if (typeof previousLap.lapTimeSeconds === "number") {
          previousSeconds = previousLap.lapTimeSeconds;
          break;
        }
      }

      lap.deltaToPreviousSeconds =
        previousSeconds !== null ? currentSeconds - previousSeconds : null;
    } else {
      lap.deltaToPreviousSeconds = null;
    }
  }
}

export async function fetchDriverLapDeltas(
  driverId: string,
  options: DriverLapDeltaOptions = {},
): Promise<DriverLapDelta> {
  const { driverFilter, filters } = mergeOptions(driverId, options);

  const driverParams: Record<string, QueryValue> = { ...filters };
  const lapParams: Record<string, QueryValue> = { ...filters };

  const [driverEntries, lapEntries] = await Promise.all([
    fetchResource<OpenF1Driver>("drivers", driverParams),
    fetchResource<OpenF1Lap>("laps", lapParams),
  ]);

  const preferredDriverEntry = driverEntries.find((entry) => {
    if (options.sessionKey) {
      return coerceNumber(entry.session_key) === coerceNumber(options.sessionKey);
    }
    if (options.raceKey) {
      return coerceNumber(entry.race_key) === coerceNumber(options.raceKey);
    }
    return true;
  }) ?? driverEntries[0];

  const normalizedDriver = preferredDriverEntry
    ? normalizeDriver(preferredDriverEntry)
    : createFallbackDriver(String(driverFilter));

  const sessionKeys = new Set<string>();
  lapEntries.forEach((lap) => {
    const sessionKey = coerceNumber(lap.session_key);
    if (sessionKey !== null) {
      sessionKeys.add(String(sessionKey));
    }
  });

  if (sessionKeys.size === 0 && lapEntries.length === 0 && !preferredDriverEntry) {
    throw new NotFoundError(`Driver ${driverId} has no lap data available`);
  }

  const sessionDetails = await Promise.all(
    Array.from(sessionKeys).map((sessionKey) =>
      fetchResource<OpenF1Session>("sessions", { session_key: sessionKey }).then(
        (entries) => entries[0] ?? null,
      ),
    ),
  );

  const sessionInfoByKey = new Map<string, OpenF1Session | null>();
  Array.from(sessionKeys).forEach((key, index) => {
    sessionInfoByKey.set(key, sessionDetails[index] ?? null);
  });

  const summaries = new Map<string, SessionLapSummary>();

  lapEntries.forEach((lap) => {
    const sessionKeyNumber = coerceNumber(lap.session_key);
    if (sessionKeyNumber === null) {
      return;
    }
    const sessionKey = String(sessionKeyNumber);
    let summary = summaries.get(sessionKey);
    if (!summary) {
      const sessionInfo = sessionInfoByKey.get(sessionKey);
      const sessionType = sessionInfo
        ? resolveSessionType(sessionInfo)
        : (options.sessionKey ? "race" : "practice");
      const startedAt = sessionInfo
        ? combineDateAndTime(sessionInfo.start_date, sessionInfo.start_time)
        : null;
      summary = {
        sessionId: sessionKey,
        raceId: sessionInfo ? coerceNumber(sessionInfo.race_key)?.toString() ?? null : null,
        name:
          pickString(sessionInfo as Record<string, unknown>, ["session_name"]) ??
          `Session ${sessionKey}`,
        sessionType,
        startedAt,
        bestLapSeconds: null,
        averageLapSeconds: null,
        laps: [],
      };
      summaries.set(sessionKey, summary);
    }

    const normalizedLap = normalizeLap(sessionKey, lap);
    summary.laps.push(createLapDeltaFromNormalized(normalizedLap));
  });

  const sessionSummaries = Array.from(summaries.values()).sort((a, b) => {
    if (a.startedAt && b.startedAt) {
      return a.startedAt.localeCompare(b.startedAt);
    }
    if (a.startedAt) {
      return -1;
    }
    if (b.startedAt) {
      return 1;
    }
    return a.sessionId.localeCompare(b.sessionId);
  });

  sessionSummaries.forEach((summary) => finalizeSessionMetrics(summary));

  return {
    driver: normalizedDriver,
    sessions: sessionSummaries,
  };
}
