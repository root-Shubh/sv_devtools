// Generators: random strings, passwords, Lorem Ipsum, sample JSON and SQL INSERTs.
// Random values come from Node's crypto module.
import { randomInt, randomUUID } from "crypto";

const pick = (chars: string): string => chars[randomInt(chars.length)];

export const CHARSETS = {
  alnum: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  hex: "0123456789abcdef"
} as const;

export function randomString(length: number, charset: string): string {
  if (charset.length === 0) throw new RangeError("Charset is empty.");
  const n = Math.min(10000, Math.max(1, Math.floor(length)));
  let out = "";
  for (let i = 0; i < n; i++) out += pick(charset);
  return out;
}

export interface PasswordOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
}

const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/";

// Guarantees at least one character from each enabled class, then shuffles.
export function generatePassword(options: PasswordOptions): string | { error: string } {
  const classes = [
    options.upper && CHARSETS.alpha.slice(0, 26),
    options.lower && CHARSETS.alpha.slice(26),
    options.digits && CHARSETS.digits,
    options.symbols && SYMBOLS
  ].filter((c): c is string => typeof c === "string");
  if (classes.length === 0) return { error: "Enable at least one character type." };
  const length = Math.floor(options.length);
  if (length < classes.length) return { error: `Length must be at least ${classes.length} for these options.` };
  if (length > 256) return { error: "Length must be 256 or less." };

  const all = classes.join("");
  const chars = classes.map(pick);
  while (chars.length < length) chars.push(pick(all));
  // Fisher-Yates shuffle so the guaranteed characters are not always first.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

const LOREM = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua " +
  "ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure " +
  "dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident"
).split(" ");

// Deterministic Lorem Ipsum: starts with the classic opening words, then cycles the list.
export function loremIpsum(words: number): string {
  const n = Math.min(5000, Math.max(1, Math.floor(words)));
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(LOREM[i % LOREM.length]);
  const text = out.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

export type FieldType = "int" | "float" | "string" | "bool" | "date" | "uuid";

// Spec like "id:int, name:string, active:bool". Returns an array of sample objects.
export function sampleJson(spec: string, rows: number): { ok: true; text: string } | { ok: false; message: string } {
  const fields = spec
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [name, type = "string"] = s.split(":").map((x) => x.trim());
      return { name, type: type as FieldType };
    });
  const valid: FieldType[] = ["int", "float", "string", "bool", "date", "uuid"];
  if (fields.length === 0) return { ok: false, message: "Describe at least one field, e.g. id:int, name:string." };
  const bad = fields.find((f) => !valid.includes(f.type) || !/^[A-Za-z_][\w]*$/.test(f.name));
  if (bad) return { ok: false, message: `Unsupported field "${bad.name}:${bad.type}". Types: ${valid.join(", ")}.` };

  const make = (type: FieldType, i: number): unknown => {
    switch (type) {
      case "int":
        return randomInt(0, 10000);
      case "float":
        return Number((randomInt(0, 100000) / 100).toFixed(2));
      case "bool":
        return randomInt(2) === 1;
      case "date":
        return new Date(Date.UTC(2020, 0, 1) + randomInt(0, 1500) * 86400000).toISOString().slice(0, 10);
      case "uuid":
        return randomUUID();
      default:
        return randomString(8, CHARSETS.alpha) + i;
    }
  };
  const count = Math.min(1000, Math.max(1, Math.floor(rows)));
  const data = Array.from({ length: count }, (_, i) =>
    Object.fromEntries(fields.map((f) => [f.name, make(f.type, i)]))
  );
  return { ok: true, text: JSON.stringify(data, null, 2) };
}

// SQL INSERT statements from an array of JSON objects. Strings are quoted and escaped.
export function sqlInserts(table: string, json: string): { ok: true; text: string } | { ok: false; message: string } {
  if (!/^[A-Za-z_][\w.]*$/.test(table)) return { ok: false, message: "Table name must be a simple identifier." };
  let rows: unknown;
  try {
    rows = JSON.parse(json);
  } catch (err) {
    return { ok: false, message: `Invalid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  if (!Array.isArray(rows) || !rows.every((r) => typeof r === "object" && r !== null && !Array.isArray(r))) {
    return { ok: false, message: "JSON must be an array of objects." };
  }
  const columns: string[] = [];
  for (const r of rows as Record<string, unknown>[])
    for (const k of Object.keys(r)) if (!columns.includes(k)) columns.push(k);
  if (columns.length === 0) return { ok: false, message: "Objects have no fields." };
  const literal = (v: unknown): string => {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
    const text = typeof v === "string" ? v : JSON.stringify(v);
    return `'${text.replace(/'/g, "''")}'`;
  };
  const head = `INSERT INTO ${table} (${columns.join(", ")}) VALUES`;
  const lines = (rows as Record<string, unknown>[]).map((r) => `  (${columns.map((c) => literal(r[c])).join(", ")})`);
  return { ok: true, text: lines.length ? `${head}\n${lines.join(",\n")};` : "" };
}
