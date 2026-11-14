// Unix timestamp conversions. Pure logic; timezone is passed in so tests are deterministic.

export type TsResult<T> = { ok: true; value: T } | { ok: false; message: string };

// Values of 1e11 and above are treated as milliseconds (1e11 s is year 5138; 1e11 ms is 1973).
export const MS_THRESHOLD = 1e11;

export function timestampToDate(input: string): TsResult<{ date: Date; unit: "seconds" | "milliseconds" }> {
  const trimmed = input.trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return { ok: false, message: "Enter a number of seconds or milliseconds." };
  const n = Number(trimmed);
  const unit = Math.abs(n) >= MS_THRESHOLD ? "milliseconds" : "seconds";
  const date = new Date(unit === "milliseconds" ? n : n * 1000);
  if (Number.isNaN(date.getTime())) return { ok: false, message: "Timestamp is out of range." };
  return { ok: true, value: { date, unit } };
}

export function dateToTimestamp(input: string): TsResult<{ seconds: number; milliseconds: number }> {
  const ms = Date.parse(input.trim());
  if (Number.isNaN(ms)) return { ok: false, message: "Could not parse that date. Try ISO 8601, e.g. 2026-11-14T10:30:00Z." };
  return { ok: true, value: { seconds: Math.floor(ms / 1000), milliseconds: ms } };
}

// "YYYY-MM-DD HH:mm:ss" in UTC, plus ISO 8601.
export function formatUtc(date: Date): { iso: string; readable: string } {
  const iso = date.toISOString();
  return { iso, readable: `${iso.slice(0, 10)} ${iso.slice(11, 19)} UTC` };
}

// Local time for a given IANA zone. Uses Intl so there is no extra dependency.
export function formatInZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")} (${timeZone})`;
}
