const OPENF1_DEFAULT_BASE_URL = "https://api.openf1.org/v1";

export type QueryValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>
  | null
  | undefined;

export type FetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
  };
};

function resolveBaseUrl() {
  const envUrl = process.env.OPENF1_BASE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return OPENF1_DEFAULT_BASE_URL;
}

function buildUrl(resource: string, params: Record<string, QueryValue>) {
  const baseUrl = resolveBaseUrl();
  const normalizedResource = resource.startsWith("http")
    ? resource
    : `${baseUrl}/${resource.replace(/^\//, "")}`;
  const url = new URL(normalizedResource);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry === undefined || entry === null) {
          return;
        }
        url.searchParams.append(key, String(entry));
      });
      continue;
    }

    url.searchParams.append(key, String(value));
  }

  return url;
}

export async function fetchOpenF1<T>(
  resource: string,
  params: Record<string, QueryValue> = {},
  init: FetchOptions = {},
): Promise<T> {
  const url = buildUrl(resource, params);
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    next: init.next ?? { revalidate: 300 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `OpenF1 request failed (${response.status} ${response.statusText}): ${body}`,
    );
  }

  return (await response.json()) as T;
}

export type OpenF1Race = {
  race_key: number;
  year?: number | null;
  round?: number | null;
  grand_prix?: string | null;
  location?: string | null;
  country?: string | null;
  circuit?: string | null;
  start_date?: string | null;
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  session_name?: string | null;
  event_name?: string | null;
};

export type OpenF1Session = {
  session_key: number;
  race_key?: number | null;
  year?: number | null;
  round?: number | null;
  location?: string | null;
  country?: string | null;
  session_name?: string | null;
  session_type?: string | null;
  start_date?: string | null;
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
};

export type OpenF1Driver = {
  driver_number?: number | string | null;
  session_key?: number | null;
  race_key?: number | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  broadcast_name?: string | null;
  name_acronym?: string | null;
  team_name?: string | null;
  team_colour?: string | null;
  country_code?: string | null;
  nationality?: string | null;
};

export type OpenF1Stint = {
  stint?: number | null;
  stint_number?: number | null;
  session_key?: number | null;
  driver_number?: number | string | null;
  compound?: string | null;
  tyre_life?: number | null;
  lap_start?: number | null;
  lap_end?: number | null;
  start_lap?: number | null;
  end_lap?: number | null;
};

export type OpenF1PitStop = {
  pit_stop_number?: number | null;
  session_key?: number | null;
  driver_number?: number | string | null;
  lap_number?: number | null;
  pit_time?: string | null;
  time?: string | null;
  stopped?: string | null;
  duration?: number | string | null;
  pit_duration?: number | string | null;
  total?: number | string | null;
  pit_total?: number | string | null;
  reason?: string | null;
};

export type OpenF1Lap = {
  session_key?: number | null;
  race_key?: number | null;
  driver_number?: number | string | null;
  lap_number?: number | null;
  position?: number | null;
  lap_position?: number | null;
  driver_position?: number | null;
  lap_time?: number | string | null;
  lap_duration?: number | string | null;
  duration?: number | string | null;
  sector1?: number | string | null;
  sector1_duration?: number | string | null;
  sector2?: number | string | null;
  sector2_duration?: number | string | null;
  sector3?: number | string | null;
  sector3_duration?: number | string | null;
  pit_out?: boolean | string | number | null;
  pit_in?: boolean | string | number | null;
  is_pit_out_lap?: boolean | string | number | null;
};

export type OpenF1RaceControlMessage = {
  session_key?: number | null;
  race_key?: number | null;
  driver_number?: number | string | null;
  lap_number?: number | null;
  flag?: string | null;
  message?: string | null;
  category?: string | null;
  timestamp?: string | null;
};

export type OpenF1WeatherSample = {
  session_key?: number | null;
  race_key?: number | null;
  air_temperature?: number | null;
  track_temperature?: number | null;
  humidity?: number | null;
  pressure?: number | null;
  rainfall?: number | null;
  time?: string | null;
};

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
}

export function coerceString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

export function coerceBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["y", "yes", "true", "1"].includes(normalized)) {
      return true;
    }
    if (["n", "no", "false", "0"].includes(normalized)) {
      return false;
    }
  }

  return null;
}

export function combineDateAndTime(
  dateValue: string | null | undefined,
  timeValue: string | null | undefined,
): string | null {
  const date = coerceString(dateValue);
  if (!date) {
    return null;
  }

  const time = coerceString(timeValue) ?? "00:00:00";

  const isoCandidate = `${date}T${time}`;
  const timestamp = Date.parse(isoCandidate);
  if (Number.isNaN(timestamp)) {
    const fallback = Date.parse(`${date} ${time}`);
    if (Number.isNaN(fallback)) {
      return null;
    }
    return new Date(fallback).toISOString();
  }

  return new Date(timestamp).toISOString();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
