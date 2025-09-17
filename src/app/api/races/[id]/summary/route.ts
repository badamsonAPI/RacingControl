import { NextResponse } from "next/server";

import { NotFoundError } from "@/lib/openf1";
import {
  fetchRaceSummary,
  type RaceSummaryOptions,
  type SessionType,
} from "@/lib/openf1-summary";

type Params = {
  params: { id: string };
};

const SESSION_TYPE_LOOKUP: Record<string, SessionType> = {
  practice: "practice",
  fp1: "practice",
  fp2: "practice",
  fp3: "practice",
  qualifying: "qualifying",
  quali: "qualifying",
  q: "qualifying",
  race: "race",
  grandprix: "race",
};

function parseSessionTypes(searchParams: URLSearchParams):
  | RaceSummaryOptions["sessionTypes"]
  | undefined {
  const collected: string[] = [];
  const singleValue = searchParams.get("sessionTypes");
  if (singleValue) {
    collected.push(...singleValue.split(","));
  }

  collected.push(...searchParams.getAll("session_type"));
  collected.push(...searchParams.getAll("sessionType"));

  const normalized = Array.from(
    new Set(
      collected
        .map((value) => value.trim().toLowerCase())
        .map((key) => SESSION_TYPE_LOOKUP[key])
        .filter((value): value is SessionType => Boolean(value)),
    ),
  );

  return normalized.length > 0 ? normalized : undefined;
}

export async function GET(request: Request, { params }: Params) {
  const url = new URL(request.url);
  const sessionTypes = parseSessionTypes(url.searchParams);

  try {
    const summary = await fetchRaceSummary(params.id, {
      ...(sessionTypes ? { sessionTypes } : {}),
    });

    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const message =
      error instanceof Error ? error.message : "Unable to fetch race summary";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
