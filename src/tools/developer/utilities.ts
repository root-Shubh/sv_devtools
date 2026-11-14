// Developer utilities: cron, Unix permissions, colour conversion, SQL formatting. Pure logic.

// ---------- Cron (5 fields: minute hour day-of-month month day-of-week) ----------

type Field = { min: number; max: number; name: string };
const FIELDS: Field[] = [
  { min: 0, max: 59, name: "minute" },
  { min: 0, max: 23, name: "hour" },
  { min: 1, max: 31, name: "day of month" },
  { min: 1, max: 12, name: "month" },
  { min: 0, max: 6, name: "day of week (0 = Sunday)" }
];

// Returns the set of allowed values for one field, or an error.
function parseField(text: string, f: Field): Set<number> | string {
  const out = new Set<number>();
  for (const part of text.split(",")) {
    const [range, stepText] = part.split("/");
    const step = stepText === undefined ? 1 : Number(stepText);
    if (!Number.isInteger(step) || step < 1) return `Invalid step in ${f.name}: "${part}".`;
    let lo: number;
    let hi: number;
    if (range === "*") {
      lo = f.min;
      hi = f.max;
    } else if (/^\d+-\d+$/.test(range)) {
      [lo, hi] = range.split("-").map(Number);
    } else if (/^\d+$/.test(range)) {
      lo = Number(range);
      hi = stepText === undefined ? lo : f.max;
    } else {
      return `Unsupported ${f.name} value: "${part}".`;
    }
    if (lo < f.min || hi > f.max || lo > hi) return `${f.name} must be between ${f.min} and ${f.max}.`;
    for (let v = lo; v <= hi; v += step) out.add(v);
  }
  return out;
}

export interface CronSpec {
  minute: Set<number>;
  hour: Set<number>;
  dom: Set<number>;
  month: Set<number>;
  dow: Set<number>;
  domStar: boolean;
  dowStar: boolean;
}

export function parseCron(expr: string): { ok: true; value: CronSpec } | { ok: false; message: string } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return { ok: false, message: "Cron needs five fields: minute hour day month weekday." };
  const sets = parts.map((p, i) => parseField(p, FIELDS[i]));
  const err = sets.find((s): s is string => typeof s === "string");
  if (err) return { ok: false, message: err };
  const [minute, hour, dom, month, dow] = sets as Set<number>[];
  return {
    ok: true,
    value: { minute, hour, dom, month, dow, domStar: parts[2] === "*", dowStar: parts[4] === "*" }
  };
}

// Standard cron rule: if both day fields are restricted, a match on either counts.
function dayMatches(spec: CronSpec, d: Date): boolean {
  const domOk = spec.dom.has(d.getDate());
  const dowOk = spec.dow.has(d.getDay());
  if (spec.domStar && spec.dowStar) return true;
  if (spec.domStar) return dowOk;
  if (spec.dowStar) return domOk;
  return domOk || dowOk;
}

export function nextRuns(
  expr: string,
  from: Date,
  count: number
): { ok: true; runs: Date[] } | { ok: false; message: string } {
  const parsed = parseCron(expr);
  if (!parsed.ok) return parsed;
  const spec = parsed.value;
  const runs: Date[] = [];
  const t = new Date(from.getTime());
  t.setSeconds(0, 0);
  t.setMinutes(t.getMinutes() + 1);
  // Search up to about four years of minutes; stop early once enough runs are found.
  const limit = 4 * 366 * 24 * 60;
  for (let i = 0; i < limit && runs.length < count; i++) {
    if (
      spec.month.has(t.getMonth() + 1) &&
      dayMatches(spec, t) &&
      spec.hour.has(t.getHours()) &&
      spec.minute.has(t.getMinutes())
    ) {
      runs.push(new Date(t.getTime()));
    }
    t.setMinutes(t.getMinutes() + 1);
  }
  if (runs.length === 0) return { ok: false, message: "No matching time in the next four years." };
  return { ok: true, runs };
}

export function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "";
  const [m, h, dom, mon, dow] = parts;
  const time =
    m === "*" && h === "*"
      ? "Every minute"
      : m === "0" && h === "*"
        ? "At the start of every hour"
        : `At minute ${m} past hour ${h}`;
  const day =
    dom === "*" && dow === "*" ? "every day" : dom !== "*" ? `on day ${dom} of the month` : `on weekday(s) ${dow}`;
  const month = mon === "*" ? "" : ` in month(s) ${mon}`;
  return `${time}, ${day}${month}.`;
}

// ---------- Unix permissions ----------

export function permsFromOctal(
  octal: string
): { ok: true; text: string; symbolic: string } | { ok: false; message: string } {
  if (!/^[0-7]{3,4}$/.test(octal)) return { ok: false, message: "Octal mode must be 3 or 4 digits (0-7)." };
  const digits = octal.slice(-3).split("").map(Number);
  const sym = (d: number) => (d & 4 ? "r" : "-") + (d & 2 ? "w" : "-") + (d & 1 ? "x" : "-");
  const symbolic = digits.map(sym).join("");
  return { ok: true, text: `-${symbolic}`, symbolic: `-${symbolic}` };
}

export function permsFromSymbolic(symbolic: string): { ok: true; octal: string } | { ok: false; message: string } {
  const s = symbolic.replace(/^[-dl]/, "");
  if (!/^[rwx-]{9}$/.test(s)) return { ok: false, message: "Symbolic mode must be 9 characters like rwxr-xr--." };
  const digit = (t: string) => ((t[0] === "r" ? 4 : 0) + (t[1] === "w" ? 2 : 0) + (t[2] === "x" ? 1 : 0)).toString();
  return { ok: true, octal: digit(s.slice(0, 3)) + digit(s.slice(3, 6)) + digit(s.slice(6, 9)) };
}

// ---------- Colours ----------

export function hexToRgb(hex: string): { r: number; g: number; b: number } | undefined {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return undefined;
  let h = m[1];
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// ---------- SQL formatting (basic: keywords upper-cased, clause per line) ----------

const CLAUSES = [
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM"
];
const JOINS = ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN", "JOIN"];

// Splits on keywords outside string literals. Not a full SQL parser: intended for simple statements.
export function formatSql(sql: string): string {
  const keywords = [...CLAUSES, ...JOINS, "AND", "OR", "ON"].sort((a, b) => b.length - a.length);
  let out = "";
  let i = 0;
  let inString = false;
  while (i < sql.length) {
    const ch = sql[i];
    if (ch === "'") {
      inString = !inString;
      out += ch;
      i++;
      continue;
    }
    if (!inString) {
      const hit = keywords.find(
        (k) =>
          sql.substr(i, k.length).toUpperCase() === k &&
          (i === 0 || !/\w/.test(sql[i - 1])) &&
          !/\w/.test(sql[i + k.length] ?? "")
      );
      if (hit) {
        const trimmed = out.replace(/\s+$/, "");
        const indent = hit === "AND" || hit === "OR" || hit === "ON" ? "  " : "";
        const lead = trimmed.length === 0 ? "" : "\n";
        out = trimmed + lead + indent + hit;
        i += hit.length;
        continue;
      }
    }
    out += ch;
    i++;
  }
  return out
    .replace(/[ \t]+,/g, ",")
    .replace(/^\n/, "")
    .replace(/[ \t]+\n/g, "\n");
}
