"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

import { formatLapTimeFromSeconds, formatPitDuration } from "@/lib/format";

type LapTimePoint = {
  lapNumber: number;
  seconds: number;
};

type LapTimeDataset = {
  label: string;
  color: string;
  points: LapTimePoint[];
};

type StintPaceDatum = {
  label: string;
  seconds: number;
  color: string;
};

type PitStopDatum = {
  label: string;
  duration: number;
  delta: number;
  color: string;
};

type RaceChartsProps = {
  lapTimeDatasets: LapTimeDataset[];
  stintPaceData: StintPaceDatum[];
  pitStopData: PitStopDatum[];
};

const axisColor = "rgba(148, 163, 184, 0.7)";
const gridColor = "rgba(148, 163, 184, 0.15)";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
);

export function RaceCharts({
  lapTimeDatasets,
  stintPaceData,
  pitStopData,
}: RaceChartsProps) {
  const hasLapData = lapTimeDatasets.some((dataset) => dataset.points.length > 0);
  const hasStintData = stintPaceData.length > 0;
  const hasPitData = pitStopData.length > 0;

  const lapDistributionData = {
    datasets: lapTimeDatasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.points.map((point) => ({
        x: point.lapNumber,
        y: point.seconds,
      })),
      borderColor: dataset.color,
      backgroundColor: dataset.color,
      tension: 0.3,
      pointRadius: 3,
      fill: false,
      parsing: false as const,
    })),
  };

  const lapDistributionOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: axisColor,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            const seconds = context.parsed.y;
            return `${context.dataset.label}: ${formatLapTimeFromSeconds(seconds)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        ticks: {
          color: axisColor,
          stepSize: 1,
        },
        grid: {
          color: gridColor,
        },
        title: {
          display: true,
          text: "Lap",
          color: axisColor,
        },
      },
      y: {
        ticks: {
          color: axisColor,
          callback(value) {
            return formatLapTimeFromSeconds(Number(value));
          },
        },
        grid: {
          color: gridColor,
        },
        title: {
          display: true,
          text: "Lap time",
          color: axisColor,
        },
      },
    },
  };

  const stintPaceChartData = {
    labels: stintPaceData.map((entry) => entry.label),
    datasets: [
      {
        label: "Average lap time",
        data: stintPaceData.map((entry) => entry.seconds),
        backgroundColor: stintPaceData.map((entry) => entry.color),
        borderRadius: 6,
      },
    ],
  };

  const stintPaceOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: axisColor,
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            const value = context.parsed.x;
            return `Avg: ${formatLapTimeFromSeconds(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: axisColor,
          callback(value) {
            return formatLapTimeFromSeconds(Number(value));
          },
        },
        grid: {
          color: gridColor,
        },
        title: {
          display: true,
          text: "Average lap time",
          color: axisColor,
        },
      },
      y: {
        ticks: {
          color: axisColor,
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };

  const pitDeltaChartData = {
    labels: pitStopData.map((entry) => entry.label),
    datasets: [
      {
        label: "Δ vs. fastest stop",
        data: pitStopData.map((entry) => entry.delta),
        backgroundColor: pitStopData.map((entry) => entry.color),
        borderRadius: 6,
      },
    ],
  };

  const pitDeltaOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label(context) {
            const entry = pitStopData[context.dataIndex];
            if (!entry) {
              return context.formattedValue;
            }

            const deltaValue = entry.delta;
            const deltaLabel =
              deltaValue <= 0.0005
                ? "Fastest stop"
                : `Δ +${deltaValue.toFixed(2)}s`;

            return [
              `Duration: ${formatPitDuration(entry.duration)}`,
              deltaLabel,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: axisColor,
        },
        grid: {
          color: gridColor,
        },
        title: {
          display: true,
          text: "Stops",
          color: axisColor,
        },
      },
      y: {
        ticks: {
          color: axisColor,
          callback(value) {
            return `+${Number(value).toFixed(2)}s`;
          },
        },
        grid: {
          color: gridColor,
        },
        title: {
          display: true,
          text: "Delta vs. fastest stop",
          color: axisColor,
        },
      },
    },
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-black/30 p-4 lg:col-span-2">
        <h3 className="text-base font-semibold text-white">Lap time distribution</h3>
        <div className="mt-4 h-72">
          {hasLapData ? (
            <Line data={lapDistributionData} options={lapDistributionOptions} />
          ) : (
            <p className="text-sm text-slate-400">
              Lap telemetry is not available for this race.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <h3 className="text-base font-semibold text-white">Stint pace</h3>
        <div className="mt-4 h-72">
          {hasStintData ? (
            <Bar data={stintPaceChartData} options={stintPaceOptions} />
          ) : (
            <p className="text-sm text-slate-400">
              Stint pace requires lap data for each stint.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <h3 className="text-base font-semibold text-white">Pit delta</h3>
        <div className="mt-4 h-72">
          {hasPitData ? (
            <Bar data={pitDeltaChartData} options={pitDeltaOptions} />
          ) : (
            <p className="text-sm text-slate-400">
              No pit stop data recorded for this race.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RaceCharts;
