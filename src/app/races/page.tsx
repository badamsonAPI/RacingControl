import Link from "next/link";

import { races } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export default function RacesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Schedule</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Race weekends</h1>
        <p className="max-w-2xl text-sm text-slate-400">
          The seed data currently includes the 2024 Australian Grand Prix. Use this list to navigate to
          detailed reports for each weekend as you expand the data set.
        </p>
      </div>

      <table className="mt-8 w-full rounded-2xl border border-white/10 bg-white/[0.03] text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-5 py-3">Season</th>
            <th className="px-5 py-3">Round</th>
            <th className="px-5 py-3">Race</th>
            <th className="px-5 py-3">Circuit</th>
            <th className="px-5 py-3">Location</th>
            <th className="px-5 py-3">Start</th>
            <th className="px-5 py-3">Finish</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-slate-300">
          {races.map((race) => (
            <tr key={race.id} className="transition hover:bg-white/[0.06]">
              <td className="px-5 py-4">{race.season}</td>
              <td className="px-5 py-4">{race.round}</td>
              <td className="px-5 py-4 font-medium text-white">
                <Link className="hover:underline" href={`/races/${race.id}`}>
                  {race.name}
                </Link>
              </td>
              <td className="px-5 py-4">{race.circuit}</td>
              <td className="px-5 py-4">{race.location}</td>
              <td className="px-5 py-4">{formatDateTime(race.startedAt)}</td>
              <td className="px-5 py-4">{formatDateTime(race.completedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
