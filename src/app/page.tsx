import Link from "next/link";

import {
  getDriversForRace,
  getDriversForTeam,
  getSessionsForRace,
  races,
  teams,
} from "@/lib/data";
import { formatDateTime, formatSessionType } from "@/lib/format";

export default function Home() {
  const featuredRace = races[0];
  const raceSessions = getSessionsForRace(featuredRace.id);
  const raceDrivers = getDriversForRace(featuredRace.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 shadow-lg shadow-primary/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Featured weekend
            </p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              {featuredRace.name}
            </h1>
            <p className="max-w-2xl text-base text-slate-300">
              Explore the seeded data set for the 2024 Australian Grand Prix. Every table in the
              Supabase schema is represented below, giving you a starting point for timing, strategy,
              and operations tooling.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-200">
            <Link
              className="rounded-md bg-primary px-4 py-2 font-semibold text-white shadow shadow-primary/40 transition hover:bg-primary-dark"
              href={`/races/${featuredRace.id}`}
            >
              View race report
            </Link>
            <Link
              className="rounded-md border border-white/10 px-4 py-2 font-semibold text-slate-200 transition hover:border-primary hover:text-primary"
              href="/races"
            >
              Browse races
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">Race overview</h2>
          <table className="mt-4 w-full text-sm">
            <tbody className="divide-y divide-white/10 text-slate-300">
              <tr>
                <th className="py-2 pr-4 text-left font-medium text-slate-400">Season</th>
                <td className="py-2">{featuredRace.season}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-medium text-slate-400">Round</th>
                <td className="py-2">{featuredRace.round}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-medium text-slate-400">Circuit</th>
                <td className="py-2">{featuredRace.circuit}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-medium text-slate-400">Location</th>
                <td className="py-2">{featuredRace.location}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-medium text-slate-400">Start</th>
                <td className="py-2">{formatDateTime(featuredRace.startedAt)}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 text-left font-medium text-slate-400">Finish</th>
                <td className="py-2">{formatDateTime(featuredRace.completedAt)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">Sessions</h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2">Session</th>
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
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Teams &amp; driver lineup</h2>
            <p className="mt-1 text-sm text-slate-400">
              Jump into a team or driver page to inspect stints, pit stops, and lap data.
            </p>
          </div>
        </div>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="pb-2">Team</th>
              <th className="pb-2">Base</th>
              <th className="pb-2">Principal</th>
              <th className="pb-2">Drivers</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {teams.map((team) => {
              const teamDrivers = getDriversForTeam(team.id);
              return (
                <tr key={team.id}>
                  <td className="py-3 font-medium text-white">
                    <Link className="hover:underline" href={`/teams/${team.id}`}>
                      {team.name}
                    </Link>
                  </td>
                  <td className="py-3">{team.base}</td>
                  <td className="py-3">{team.principal}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      {teamDrivers.map((driver) => (
                        <Link
                          key={driver.id}
                          className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:border-primary hover:text-primary"
                          href={`/drivers/${driver.id}`}
                        >
                          #{driver.number} {driver.code}
                        </Link>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-lg font-semibold text-white">Drivers entered</h2>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="pb-2">Driver</th>
              <th className="pb-2">Code</th>
              <th className="pb-2">Number</th>
              <th className="pb-2">Country</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-300">
            {raceDrivers.map((driver) => (
              <tr key={driver.id}>
                <td className="py-3 font-medium text-white">
                  <Link className="hover:underline" href={`/drivers/${driver.id}`}>
                    {driver.firstName} {driver.lastName}
                  </Link>
                </td>
                <td className="py-3">{driver.code}</td>
                <td className="py-3">{driver.number}</td>
                <td className="py-3">{driver.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
