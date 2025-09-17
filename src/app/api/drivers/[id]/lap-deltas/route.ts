import { NextResponse } from "next/server";

import { NotFoundError } from "@/lib/openf1";
import {
  fetchDriverLapDeltas,
  type DriverLapDeltaOptions,
} from "@/lib/openf1-driver";

type Params = {
  params: { id: string };
};

function parseNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}

function parseOptions(url: URL): DriverLapDeltaOptions {
  const { searchParams } = url;
  const year = parseNumber(searchParams.get("year"));
  const season = parseNumber(searchParams.get("season"));
  const raceKey =
    searchParams.get("race_key") ?? searchParams.get("raceKey") ?? undefined;
  const sessionKey =
    searchParams.get("session_key") ?? searchParams.get("sessionKey") ?? undefined;

  const options: DriverLapDeltaOptions = {};
  if (year !== undefined) {
    options.year = year;
  }
  if (season !== undefined) {
    options.season = season;
  }
  if (raceKey) {
    options.raceKey = raceKey;
  }
  if (sessionKey) {
    options.sessionKey = sessionKey;
  }

  return options;
}

export async function GET(request: Request, { params }: Params) {
  const url = new URL(request.url);
  const options = parseOptions(url);

  try {
    const data = await fetchDriverLapDeltas(params.id, options);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const message =
      error instanceof Error ? error.message : "Unable to fetch lap deltas";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
