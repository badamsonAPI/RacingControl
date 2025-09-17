const baseFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatDateTime(isoString: string) {
  return baseFormatter.format(new Date(isoString));
}

export function formatSessionType(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatPitDuration(seconds: number) {
  const fixed = seconds.toFixed(2);
  const trimmed = fixed.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  return `${trimmed}s`;
}

export function parseLapTime(lapTime: string) {
  const [minutes, seconds] = lapTime.split(":");
  const minutesNumber = Number(minutes);
  const secondsNumber = Number(seconds);

  if (Number.isNaN(minutesNumber) || Number.isNaN(secondsNumber)) {
    return NaN;
  }

  return minutesNumber * 60 + secondsNumber;
}

export function formatLapTimeFromSeconds(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds)) {
    return "—";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  const secondsString = seconds.toFixed(3).padStart(6, "0");

  return `${minutes}:${secondsString}`;
}
