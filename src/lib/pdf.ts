import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

import {
  formatDateTime,
  formatLapTimeFromSeconds,
  formatPitDuration,
  formatSessionType,
} from "@/lib/format";

export type RaceSummaryPdfData = {
  race: {
    id: string;
    name: string;
    season: number;
    round: number;
    circuit: string;
    location: string;
    startedAt: string;
    completedAt: string | null;
  };
  sessions: Array<{
    id: string;
    name: string;
    sessionType: string;
    startedAt: string;
    endedAt: string | null;
  }>;
  drivers: Array<{
    id: string;
    fullName: string;
    code: string;
    number: number;
    country: string;
    teamName: string | null;
  }>;
  stints: Array<{
    id: string;
    driverName: string;
    stintNumber: number;
    compound: string;
    startLap: number;
    endLap: number | null;
  }>;
  pitStops: Array<{
    id: string;
    driverName: string;
    lapNumber: number;
    durationSeconds: number | null;
    stopTime: string | null;
    reason: string | null;
  }>;
  metrics: {
    totalLaps: number;
    fastestLapSeconds: number | null;
    averageLapSeconds: number | null;
    driverAverages: Array<{
      driverId: string;
      driverName: string;
      lapCount: number;
      averageLapSeconds: number | null;
      bestLapSeconds: number | null;
    }>;
  };
};

const PAGE_WIDTH = 595.28; // A4 portrait width at 72 DPI
const PAGE_HEIGHT = 841.89; // A4 portrait height at 72 DPI
const PAGE_SIZE: [number, number] = [PAGE_WIDTH, PAGE_HEIGHT];
const PAGE_MARGIN = 48;
const PAGE_BOTTOM_MARGIN = 48;

const TITLE_COLOR = rgb(0.1, 0.1, 0.1);
const TEXT_COLOR = rgb(0.2, 0.2, 0.2);
const MUTED_COLOR = rgb(0.45, 0.45, 0.45);

function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  const words = text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return [];
  }

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine.length > 0 ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, fontSize);

    if (width <= maxWidth || currentLine.length === 0) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;

    if (font.widthOfTextAtSize(currentLine, fontSize) > maxWidth) {
      lines.push(currentLine);
      currentLine = "";
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

export async function createRaceSummaryPdf(data: RaceSummaryPdfData) {
  const pdf = await PDFDocument.create();
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage(PAGE_SIZE);
  let cursorY = PAGE_HEIGHT - PAGE_MARGIN;

  const contentWidth = PAGE_WIDTH - PAGE_MARGIN * 2;

  function ensureSpace(lineCount: number, lineHeight: number) {
    const requiredHeight = lineCount * lineHeight;
    if (cursorY - requiredHeight < PAGE_BOTTOM_MARGIN) {
      page = pdf.addPage(PAGE_SIZE);
      cursorY = PAGE_HEIGHT - PAGE_MARGIN;
    }
  }

  function addGap(amount = 10) {
    if (cursorY - amount < PAGE_BOTTOM_MARGIN) {
      page = pdf.addPage(PAGE_SIZE);
      cursorY = PAGE_HEIGHT - PAGE_MARGIN;
    } else {
      cursorY -= amount;
    }
  }

  function drawParagraph(
    text: string,
    options: {
      size?: number;
      font?: PDFFont;
      color?: ReturnType<typeof rgb>;
      lineHeight?: number;
    } = {},
  ) {
    if (!text) {
      return;
    }

    const {
      size = 12,
      font = regularFont,
      color = TEXT_COLOR,
      lineHeight = size + 4,
    } = options;

    const lines = wrapText(text, font, size, contentWidth);
    if (lines.length === 0) {
      return;
    }

    ensureSpace(lines.length, lineHeight);

    for (const line of lines) {
      page.drawText(line, {
        x: PAGE_MARGIN,
        y: cursorY,
        size,
        font,
        color,
      });
      cursorY -= lineHeight;
    }
  }

  function drawBulletItem(
    text: string,
    options: {
      size?: number;
      font?: PDFFont;
      color?: ReturnType<typeof rgb>;
      lineHeight?: number;
    } = {},
  ) {
    if (!text) {
      return;
    }

    const {
      size = 12,
      font = regularFont,
      color = TEXT_COLOR,
      lineHeight = size + 4,
    } = options;

    const bulletSymbol = "•";
    const bulletWidth = font.widthOfTextAtSize(`${bulletSymbol} `, size);
    const lines = wrapText(text, font, size, contentWidth - bulletWidth);

    if (lines.length === 0) {
      return;
    }

    ensureSpace(lines.length, lineHeight);

    page.drawText(bulletSymbol, {
      x: PAGE_MARGIN,
      y: cursorY,
      size,
      font: boldFont,
      color,
    });

    page.drawText(lines[0], {
      x: PAGE_MARGIN + bulletWidth,
      y: cursorY,
      size,
      font,
      color,
    });
    cursorY -= lineHeight;

    for (let index = 1; index < lines.length; index += 1) {
      page.drawText(lines[index], {
        x: PAGE_MARGIN + bulletWidth,
        y: cursorY,
        size,
        font,
        color,
      });
      cursorY -= lineHeight;
    }

    addGap(2);
  }

  function drawSectionHeading(text: string) {
    const size = 14;
    const lineHeight = size + 4;
    const lines = wrapText(text, boldFont, size, contentWidth);

    if (lines.length === 0) {
      return;
    }

    ensureSpace(lines.length, lineHeight);

    for (const line of lines) {
      page.drawText(line, {
        x: PAGE_MARGIN,
        y: cursorY,
        size,
        font: boldFont,
        color: TITLE_COLOR,
      });
      cursorY -= lineHeight;
    }

    addGap(4);
  }

  function drawTitle(text: string) {
    const size = 22;
    const lineHeight = size + 6;
    const lines = wrapText(text, boldFont, size, contentWidth);

    if (lines.length === 0) {
      return;
    }

    ensureSpace(lines.length, lineHeight);

    for (const line of lines) {
      page.drawText(line, {
        x: PAGE_MARGIN,
        y: cursorY,
        size,
        font: boldFont,
        color: TITLE_COLOR,
      });
      cursorY -= lineHeight;
    }

    addGap(6);
  }

  function formatLap(seconds: number | null) {
    return typeof seconds === "number"
      ? formatLapTimeFromSeconds(seconds)
      : "—";
  }

  drawTitle(data.race.name);
  drawParagraph(`Season ${data.race.season} • Round ${data.race.round}`, {
    color: MUTED_COLOR,
  });
  drawParagraph(`${data.race.circuit} — ${data.race.location}`);
  drawParagraph(`Start: ${formatDateTime(data.race.startedAt)}`);
  if (data.race.completedAt) {
    drawParagraph(`Finish: ${formatDateTime(data.race.completedAt)}`);
  }
  addGap(12);

  drawSectionHeading("Overview");
  drawParagraph(`Total laps recorded: ${data.metrics.totalLaps}`);
  drawParagraph(`Fastest lap: ${formatLap(data.metrics.fastestLapSeconds)}`);
  drawParagraph(`Average lap: ${formatLap(data.metrics.averageLapSeconds)}`);

  if (data.metrics.driverAverages.length > 0) {
    addGap(6);
    drawParagraph("Driver pace highlights", { font: boldFont });
    data.metrics.driverAverages.forEach((entry) => {
      const average = formatLap(entry.averageLapSeconds);
      const best = formatLap(entry.bestLapSeconds);
      drawBulletItem(
        `${entry.driverName} — ${entry.lapCount} laps, best ${best}, average ${average}`,
      );
    });
  }

  addGap(12);

  drawSectionHeading("Sessions");
  if (data.sessions.length === 0) {
    drawParagraph("No sessions recorded.");
  } else {
    data.sessions.forEach((session) => {
      const start = formatDateTime(session.startedAt);
      const end = session.endedAt ? formatDateTime(session.endedAt) : null;
      const type = formatSessionType(session.sessionType);
      const range = end ? `${start} – ${end}` : start;
      drawBulletItem(`${session.name} (${type}) — ${range}`);
    });
  }

  addGap(12);

  drawSectionHeading("Entry list");
  if (data.drivers.length === 0) {
    drawParagraph("No drivers recorded.");
  } else {
    data.drivers.forEach((driver) => {
      const team = driver.teamName ?? "Independent";
      drawBulletItem(
        `${driver.fullName} (#${driver.number} ${driver.code}) — ${team} • ${driver.country}`,
      );
    });
  }

  addGap(12);

  drawSectionHeading("Stints");
  if (data.stints.length === 0) {
    drawParagraph("No stints recorded.");
  } else {
    data.stints.forEach((stint) => {
      const range =
        typeof stint.endLap === "number"
          ? `${stint.startLap}-${stint.endLap}`
          : `${stint.startLap} to finish`;
      drawBulletItem(
        `${stint.driverName} — Stint ${stint.stintNumber} on ${stint.compound} (Laps ${range})`,
      );
    });
  }

  addGap(12);

  drawSectionHeading("Pit stops");
  if (data.pitStops.length === 0) {
    drawParagraph("No pit stops recorded.");
  } else {
    data.pitStops.forEach((stop) => {
      const duration =
        typeof stop.durationSeconds === "number"
          ? formatPitDuration(stop.durationSeconds)
          : "—";
      const timestamp = stop.stopTime
        ? ` at ${formatDateTime(stop.stopTime)}`
        : "";
      const reason = stop.reason ? ` (${stop.reason})` : "";
      drawBulletItem(
        `${stop.driverName} — Lap ${stop.lapNumber}, ${duration}${timestamp}${reason}`,
      );
    });
  }

  return pdf.save();
}
