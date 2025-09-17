import Link from "next/link";
import { notFound } from "next/navigation";

import {
  drivers,
  getDriversForRace,
  getLapsForRace,
  getPitStopsForRace,
  getRaceById,
  getSessionsForRace,
  getStintsForRace,
  races,
  teams,
} from "@/lib/data";
import {
  formatDateTime,
  formatPitDuration,
  formatSessionType,
  parseLapTime,
} from "@/lib/format";
import RaceCharts from "@/components/race-charts";

export function generateStaticParams() {
  return races.map((race) => ({ id: race.id }));
}

export default function RaceDetailPage({ params }: { params: { id: string } }) {
  const race = getRaceById(params.id);

  if (!race) {
    notFound();
  }

  const raceSessions = getSessionsForRace(race.id);
  const raceDrivers = getDriversForRace(race.id);
  const raceStints = getStintsForRace(race.id);
  const racePitStops = getPitStopsForRace(race.id);
  const raceLaps = getLapsForRace(race.id);

  const pdfFilename = `${race.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const driverById = new Map(drivers.map((driver) => [driver.id, driver]));
  const teamById = new Map(teams.map((team) => [team.id, team]));

  const colorPalette = [
    "#38bdf8",
    "#f97316",
    "#34d399",
    "#f472b6",
    "#a855f7",
    "#facc15",
  ];

  const driverColors = new Map<string, string>();
  raceDrivers.forEach((driver, index) => {
    driverColors.set(driver.id, colorPalette[index % colorPalette.length]);
  });

  const lapSeries = raceDrivers.map((driver) => {
    const driverLaps = raceLaps
      .filter((lap) => lap.driverId === driver.id)
      .sort((a, b) => a.lapNumber - b.lapNumber);

    const points = driverLaps
      .map((lap) => {
        const seconds = parseLapTime(lap.lapTime);
        if (Number.isNaN(seconds)) {
          return null;
        }

        return {
          lapNumber: lap.lapNumber,
          seconds,
        };
      })
      .filter(
        (point): point is { lapNumber: number; seconds: number } =>
          point !== null,
      );

    return {
      driverId: driver.id,
      label: `${driver.firstName} ${driver.lastName}`,
      color: driverColors.get(driver.id) ?? colorPalette[0],
      points,
    };
  });

  const lapPointsByDriver = new Map(
    lapSeries.map((series) => [series.driverId, series.points]),
  );

  const stintPaceData = raceStints
    .map((stint) => {
      const driver = driverById.get(stint.driverId);
      if (!driver) {
        return null;
      }

      const stintPoints = (lapPointsByDriver.get(stint.driverId) ?? []).filter(
        (point) =>
          point.lapNumber >= stint.startLap && point.lapNumber <= stint.endLap,
      );

      if (stintPoints.length === 0) {
        return null;
      }

      const averageSeconds =
        stintPoints.reduce((total, point) => total + point.seconds, 0) /
        stintPoints.length;

      return {
        label: `${driver.firstName} ${driver.lastName} — Stint ${stint.stintNumber} (${stint.compound})`,
        seconds: averageSeconds,
        color: driverColors.get(stint.driverId) ?? colorPalette[0],
      };
    })
    .filter(
      (entry): entry is { label: string; seconds: number; color: string } =>
        entry !== null,
    );

  const fastestPitStopDuration =
    racePitStops.length > 0
      ? Math.min(...racePitStops.map((stop) => stop.durationSeconds))
      : null;

  const pitStopEntries =
    fastestPitStopDuration === null
      ? []
      : racePitStops
          .map((stop) => {
            const driver = driverById.get(stop.driverId);
            if (!driver) {
              return null;
            }

            return {
              label: `${driver.firstName} ${driver.lastName} (Lap ${stop.lapNumber})`,
              duration: stop.durationSeconds,
              delta: stop.durationSeconds - fastestPitStopDuration,
              color: driverColors.get(stop.driverId) ?? colorPalette[0],
            };
          })
          .filter(
            (
              entry,
            ): entry is {
              label: string;
              duration: number;
              delta: number;
              color: string;
            } => entry !== null,
          );

  const lapTimeDatasets = lapSeries.map(({ driverId: _driverId, ...rest }) => rest);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Race weekend</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">{race.name}</h1>
            <p className="text-sm text-slate-400">
              {race.circuit} &bull; {race.location}
            </p>
          </div>
          <div className="flex gap-3 text-sm text-slate-200">
            <a
              className="rounded-md border border-white/10 px-4 py-2 font-semibold transition hover:border-primary hover:text-primary"
              download={`${pdfFilename || "race"}-summary.pdf`}
              href={`/api/races/${race.id}/summary/pdf`}
            >
              Download PDF
            </a>
            <Link
              className="rounded-md border border-white/10 px-4 py-2 font-semibold transition hover:border-primary hover:text-primary"
              href="/races"
            >
              Back to races
            </Link>
          </div>
        </div>
        <table className="mt-6 w-full text-sm">
          <tbody className="divide-y divide-white/10 text-slate-300">
            <tr>
              <th className="py-2 pr-4 text-left font-medium text-slate-400">Season</th>
              <td className="py-2">{race.season}</td>
            </tr>
            <tr>
              <th className="py-2 pr-4 text-left font-medium text-slate-400">Round</th>
              <td className="py-2">{race.round}</td>
            </tr>
            <tr>
              <th className="py-2 pr-4 text-left font-medium text-slate-400">Start</th>
              <td className="py-2">{formatDateTime(race.startedAt)}</td>
            </tr>
            <tr>
              <th className="py-2 pr-4 text-left font-medium text-slate-400">Finish</th>
              <td className="py-2">{formatDateTime(race.completedAt)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-lg font-semibold text-white">Sessions</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="pb-2">Name</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Start</th>
              <th className="pb-2">End</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {raceSessions.map((session) => (
              <tr key={session.id}>
                <td className="py-2 font-medium text-white">{session.name}</td>
                <td className="py-2">{formatSessionType(session.sessionType)}</td>
                <td className="py-2">{formatDateTime(session.startedAt)}</td>
                <td className="py-2">{formatDateTime(session.endedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-lg font-semibold text-white">Race visualisations</h2>
        <RaceCharts
          lapTimeDatasets={lapTimeDatasets}
          stintPaceData={stintPaceData}
          pitStopData={pitStopEntries}
        />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-lg font-semibold text-white">Entry list</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="pb-2">Driver</th>
              <th className="pb-2">Team</th>
              <th className="pb-2">Code</th>
              <th className="pb-2">Number</th>
              <th className="pb-2">Country</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {raceDrivers.map((driver) => {
              const team = teamById.get(driver.teamId);
              return (
                <tr key={driver.id}>
                  <td className="py-3 font-medium text-white">
                    <Link className="hover:underline" href={`/drivers/${driver.id}`}>
                      {driver.firstName} {driver.lastName}
                    </Link>
                  </td>
                  <td className="py-3">
                    {team ? (
                      <Link className="hover:underline" href={`/teams/${team.id}`}>
                        {team.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3">{driver.code}</td>
                  <td className="py-3">{driver.number}</td>
                  <td className="py-3">{driver.country}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-lg font-semibold text-white">Race stints</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="pb-2">Driver</th>
              <th className="pb-2">Stint</th>
              <th className="pb-2">Compound</th>
              <th className="pb-2">Start lap</th>
              <th className="pb-2">End lap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {raceStints.map((stint) => {
              const driver = driverById.get(stint.driverId);
              if (!driver) {
                return null;
              }

              return (
                <tr key={stint.id}>
                  <td className="py-3 font-medium text-white">
                    <Link className="hover:underline" href={`/drivers/${driver.id}`}>
                      {driver.firstName} {driver.lastName}
                    </Link>
                  </td>
                  <td className="py-3">{stint.stintNumber}</td>
                  <td className="py-3">{stint.compound}</td>
                  <td className="py-3">{stint.startLap}</td>
                  <td className="py-3">{stint.endLap}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-lg font-semibold text-white">Pit stops</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="pb-2">Driver</th>
              <th className="pb-2">Lap</th>
              <th className="pb-2">Duration</th>
              <th className="pb-2">Timestamp (UTC)</th>
              <th className="pb-2">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {racePitStops.map((stop) => {
              const driver = driverById.get(stop.driverId);
              if (!driver) {
                return null;
              }

              return (
                <tr key={stop.id}>
                  <td className="py-3 font-medium text-white">
                    <Link className="hover:underline" href={`/drivers/${driver.id}`}>
                      {driver.firstName} {driver.lastName}
                    </Link>
                  </td>
                  <td className="py-3">{stop.lapNumber}</td>
                  <td className="py-3">{formatPitDuration(stop.durationSeconds)}</td>
                  <td className="py-3">{formatDateTime(stop.stopTime)}</td>
                  <td className="py-3">{stop.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
