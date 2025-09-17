import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getDriverById,
  getLapsForDriver,
  getPitStopsForDriver,
  getStintsForDriver,
  races,
  sessions,
  teams,
  drivers,
} from "@/lib/data";
import {
  formatDateTime,
  formatPitDuration,
  formatSessionType,
} from "@/lib/format";

export function generateStaticParams() {
  return drivers.map((driver) => ({ id: driver.id }));
}

export default function DriverDetailPage({ params }: { params: { id: string } }) {
  const driver = getDriverById(params.id);

  if (!driver) {
    notFound();
  }

  const team = teams.find((teamItem) => teamItem.id === driver.teamId) ?? null;
  const stints = getStintsForDriver(driver.id);
  const pitStops = getPitStopsForDriver(driver.id);
  const laps = getLapsForDriver(driver.id);

  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const raceById = new Map(races.map((race) => [race.id, race]));

  const relatedRaceIds = new Set<string>();
  [...stints, ...pitStops, ...laps].forEach((item) => {
    const session = sessionById.get(item.sessionId);
    if (session) {
      relatedRaceIds.add(session.raceId);
    }
  });

  const relatedRaces = Array.from(relatedRaceIds)
    .map((raceId) => raceById.get(raceId))
    .filter((race): race is NonNullable<typeof race> => Boolean(race));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Driver</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              #{driver.number} {driver.firstName} {driver.lastName}
            </h1>
            <p className="text-sm text-slate-400">{driver.country}</p>
          </div>
          <div className="flex gap-3 text-sm text-slate-200">
            {team && (
              <Link
                className="rounded-md border border-white/10 px-4 py-2 font-semibold transition hover:border-primary hover:text-primary"
                href={`/teams/${team.id}`}
              >
                View team
              </Link>
            )}
            {relatedRaces.map((race) => (
              <Link
                key={race.id}
                className="rounded-md border border-white/10 px-4 py-2 font-semibold transition hover:border-primary hover:text-primary"
                href={`/races/${race.id}`}
              >
                {race.name}
              </Link>
            ))}
          </div>
        </div>
        <table className="mt-6 w-full text-sm">
          <tbody className="divide-y divide-white/10 text-slate-300">
            <tr>
              <th className="py-2 pr-4 text-left font-medium text-slate-400">Code</th>
              <td className="py-2">{driver.code}</td>
            </tr>
            <tr>
              <th className="py-2 pr-4 text-left font-medium text-slate-400">Team</th>
              <td className="py-2">
                {team ? (
                  <Link className="hover:underline" href={`/teams/${team.id}`}>
                    {team.name}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
            </tr>
            <tr>
              <th className="py-2 pr-4 text-left font-medium text-slate-400">Base</th>
              <td className="py-2">{team ? team.base : "—"}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-lg font-semibold text-white">Race stints</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="pb-2">Session</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Stint</th>
              <th className="pb-2">Compound</th>
              <th className="pb-2">Start lap</th>
              <th className="pb-2">End lap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {stints.map((stint) => {
              const session = sessionById.get(stint.sessionId);
              return (
                <tr key={stint.id}>
                  <td className="py-3 font-medium text-white">{session ? session.name : "Unknown"}</td>
                  <td className="py-3">{session ? formatSessionType(session.sessionType) : "—"}</td>
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
              <th className="pb-2">Session</th>
              <th className="pb-2">Lap</th>
              <th className="pb-2">Duration</th>
              <th className="pb-2">Timestamp (UTC)</th>
              <th className="pb-2">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {pitStops.map((stop) => {
              const session = sessionById.get(stop.sessionId);
              return (
                <tr key={stop.id}>
                  <td className="py-3 font-medium text-white">{session ? session.name : "Unknown"}</td>
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

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-lg font-semibold text-white">Race laps (sample)</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="pb-2">Lap</th>
              <th className="pb-2">Lap time</th>
              <th className="pb-2">Sector 1</th>
              <th className="pb-2">Sector 2</th>
              <th className="pb-2">Sector 3</th>
              <th className="pb-2">Position</th>
              <th className="pb-2">Pit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {laps.map((lap) => (
              <tr key={`${lap.sessionId}-${lap.lapNumber}`}>
                <td className="py-3 font-medium text-white">{lap.lapNumber}</td>
                <td className="py-3">{lap.lapTime}</td>
                <td className="py-3">{lap.sector1}</td>
                <td className="py-3">{lap.sector2}</td>
                <td className="py-3">{lap.sector3}</td>
                <td className="py-3">{lap.position}</td>
                <td className="py-3">{lap.isPit ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
