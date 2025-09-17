import { NextRequest, NextResponse } from "next/server";

import { fetchOpenF1, type QueryValue } from "./openf1";

function buildQueryParams(request: NextRequest): Record<string, QueryValue> {
  const params = request.nextUrl.searchParams;
  const keys = Array.from(new Set(params.keys()));
  const result: Record<string, QueryValue> = {};

  for (const key of keys) {
    const values = params.getAll(key);

    if (values.length === 0) {
      continue;
    }

    if (values.length === 1) {
      result[key] = values[0];
      continue;
    }

    result[key] = values;
  }

  return result;
}

function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function createOpenF1ProxyRoute(resource: string) {
  return async function handler(request: NextRequest) {
    try {
      const query = buildQueryParams(request);
      const data = await fetchOpenF1<unknown>(resource, query, {
        next: { revalidate: 30 },
      });

      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      });
    } catch (error) {
      const message = normalizeError(error);
      return NextResponse.json(
        { error: message },
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }
  };
}
