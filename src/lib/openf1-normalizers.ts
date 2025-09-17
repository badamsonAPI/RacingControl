import { coerceNumber, slugify, type OpenF1Driver, type OpenF1Lap } from "./openf1";
import {
  getFirstDefined,
  pickBoolean,
  pickNumber,
  pickString,
  toSecondsString,
} from "./openf1-utils";

export type NormalizedDriver = {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  number: number;
  country: string | null;
  teamId: string | null;
  team: {
    id: string;
    name: string;
    base: string | null;
    principal: string | null;
  } | null;
};

export type NormalizedLap = {
  sessionId: string;
  driverId: string;
  lapNumber: number;
  lapTimeSeconds: number | null;
  rawLapTime: string | null;
  sector1Seconds: number | null;
  sector2Seconds: number | null;
  sector3Seconds: number | null;
  rawSector1: string | null;
  rawSector2: string | null;
  rawSector3: string | null;
  position: number | null;
  isPit: boolean;
};

export function normalizeDriver(driver: OpenF1Driver): NormalizedDriver {
  const number = getFirstDefined(coerceNumber(driver.driver_number), 0);
  const code =
    pickString(driver as Record<string, unknown>, ["name_acronym", "code"]) ??
    String(number).padStart(2, "0");

  const explicitFirstName = pickString(driver as Record<string, unknown>, [
    "first_name",
  ]);
  const explicitLastName = pickString(driver as Record<string, unknown>, [
    "last_name",
  ]);
  const fullName = pickString(driver as Record<string, unknown>, [
    "full_name",
    "broadcast_name",
  ]);

  let firstName = explicitFirstName;
  let lastName = explicitLastName;

  if (!firstName || !lastName) {
    const fallback = fullName ?? code;
    const tokens = fallback.split(/\s+/).filter(Boolean);
    if (!firstName && tokens.length > 0) {
      firstName = tokens[0];
    }
    if (!lastName && tokens.length > 1) {
      lastName = tokens[tokens.length - 1];
    }
    if (!lastName) {
      lastName = firstName ?? fallback;
    }
    if (!firstName) {
      firstName = lastName;
    }
  }

  const country =
    pickString(driver as Record<string, unknown>, ["country_code", "nationality"]) ??
    null;

  const teamName = pickString(driver as Record<string, unknown>, ["team_name"]);
  const teamId = teamName ? `team-${slugify(teamName)}` : null;

  return {
    id: String(number),
    firstName: firstName ?? code,
    lastName: lastName ?? code,
    code,
    number,
    country,
    teamId,
    team: teamId
      ? {
          id: teamId,
          name: teamName ?? teamId,
          base: null,
          principal: null,
        }
      : null,
  };
}

export function normalizeLap(sessionKey: string, lap: OpenF1Lap): NormalizedLap {
  const driverNumber = getFirstDefined(
    coerceNumber(lap.driver_number),
    0,
  );
  const lapNumber = getFirstDefined(
    pickNumber(lap as Record<string, unknown>, ["lap_number"]),
    0,
  );
  const lapTimeSeconds = pickNumber(lap as Record<string, unknown>, [
    "lap_duration",
    "duration",
    "lap_time",
  ]);
  const sector1Seconds = pickNumber(lap as Record<string, unknown>, [
    "sector1_duration",
    "sector1",
  ]);
  const sector2Seconds = pickNumber(lap as Record<string, unknown>, [
    "sector2_duration",
    "sector2",
  ]);
  const sector3Seconds = pickNumber(lap as Record<string, unknown>, [
    "sector3_duration",
    "sector3",
  ]);
  const position = pickNumber(lap as Record<string, unknown>, [
    "position",
    "lap_position",
    "driver_position",
  ]);
  const isPit = getFirstDefined(
    pickBoolean(lap as Record<string, unknown>, [
      "is_pit_out_lap",
      "pit_out",
      "pit_in",
    ]),
    false,
  );

  return {
    sessionId: sessionKey,
    driverId: String(driverNumber),
    lapNumber,
    lapTimeSeconds,
    rawLapTime: toSecondsString(lapTimeSeconds),
    sector1Seconds,
    sector2Seconds,
    sector3Seconds,
    rawSector1: toSecondsString(sector1Seconds),
    rawSector2: toSecondsString(sector2Seconds),
    rawSector3: toSecondsString(sector3Seconds),
    position,
    isPit,
  };
}
