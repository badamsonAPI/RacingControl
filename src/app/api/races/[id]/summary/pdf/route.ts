import { NextResponse } from "next/server";

import { NotFoundError } from "@/lib/openf1";
import {
  fetchRaceSummary,
  resolveDriverName,
  type RaceSummary,
} from "@/lib/openf1-summary";
import { createRaceSummaryPdf, type RaceSummaryPdfData } from "@/lib/pdf";

export const runtime = "nodejs";

type Params = {
  params: { id: string };
};

function buildPdfData(summary: RaceSummary): RaceSummaryPdfData {
  const driverMap = new Map(summary.drivers.map((driver) => [driver.id, driver]));

  return {
    race: {
      id: summary.race.id,
      name: summary.race.name,
      season: summary.race.season,
      round: summary.race.round,
      circuit: summary.race.circuit,
      location: summary.race.location,
      startedAt: summary.race.startedAt,
      completedAt: summary.race.completedAt,
    },
    sessions: summary.sessions.map((session) => ({
      id: session.id,
      name: session.name,
      sessionType: session.sessionType,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    })),
    drivers: summary.drivers.map((driver) => ({
      id: driver.id,
      fullName: `${driver.firstName} ${driver.lastName}`.trim(),
      code: driver.code,
      number: driver.number,
      country: driver.country ?? "",
      teamName: driver.team?.name ?? null,
    })),
    stints: summary.stints
      .map((stint) => ({
        id: stint.id,
        driverName: resolveDriverName(driverMap, stint.driverId),
        stintNumber: stint.stintNumber,
        compound: stint.compound,
        startLap: stint.startLap,
        endLap: stint.endLap ?? null,
      }))
      .filter((entry) => entry.driverName.length > 0),
    pitStops: summary.pitStops.map((stop) => ({
      id: stop.id,
      driverName: resolveDriverName(driverMap, stop.driverId),
      lapNumber: stop.lapNumber,
      durationSeconds: stop.durationSeconds,
      stopTime: stop.stopTime,
      reason: stop.reason,
    })),
    metrics: {
      totalLaps: summary.metrics.totalLaps,
      fastestLapSeconds: summary.metrics.fastestLapSeconds,
      averageLapSeconds: summary.metrics.averageLapSeconds,
      driverAverages: summary.metrics.driverAverages.map((average) => ({
        driverId: average.driverId,
        driverName: resolveDriverName(driverMap, average.driverId),
        lapCount: average.lapCount,
        averageLapSeconds: average.averageLapSeconds,
        bestLapSeconds: average.bestLapSeconds,
      })),
    },
  };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const summary = await fetchRaceSummary(params.id);
    const pdfData = buildPdfData(summary);
    const pdfBytes = await createRaceSummaryPdf(pdfData);

    const safeFilename = summary.race.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `${safeFilename || "race"}-summary.pdf`;

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const message =
      error instanceof Error ? error.message : "Unable to generate race summary";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
