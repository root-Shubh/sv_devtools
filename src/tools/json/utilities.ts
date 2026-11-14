// JSON utilities: CSV conversion, JSONPath extraction, string escape/unescape. Pure logic.

type Json = unknown;
export type Result = { ok: true; text: string } | { ok: false; message: string };

const isObject = (v: Json): v is Record<string, Json> => typeof v === "object" && v !== null && !Array.isArray(v);

function csvCell(value: Json): string {
  if (value === undefined || value === null) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function jsonToCsv(json: string): Result {
  let value: Json;
  try {
    value = JSON.parse(json);
  } catch (err) {
    return { ok: false, message: `Invalid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  if (!Array.isArray(value) || !value.every(isObject)) {
    return { ok: false, message: "JSON must be an array of objects." };
  }
  const rows = value as Record<string, Json>[];
  const headers: string[] = [];
  for (const row of rows) {
    for (const k of Object.keys(row)) if (!headers.includes(k)) headers.push(k);
  }
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvCell(row[h])).join(","));
  }
  return { ok: true, text: lines.join("\n") };
}

// RFC 4180-style parser: quoted fields, escaped quotes, commas and newlines inside quotes.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r" && text[i + 1] === "\n") {
      // CRLF: the \n on the next iteration ends the row.
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

export function csvToJson(csv: string): Result {
  const rows = parseCsv(csv);
  if (rows.length === 0) return { ok: false, message: "CSV is empty." };
  const [headers, ...body] = rows;
  const objects = body.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
  return { ok: true, text: JSON.stringify(objects, null, 2) };
}

// Supports $, .key, ["key"], [index] and [*] (wildcard over arrays).
export function jsonPath(json: string, path: string): Result {
  let root: Json;
  try {
    root = JSON.parse(json);
  } catch (err) {
    return { ok: false, message: `Invalid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  if (!path.startsWith("$")) return { ok: false, message: "Path must start with $." };
  const tokens: (string | number | "*")[] = [];
  const re = /\.([A-Za-z_$][\w$]*)|\["((?:[^"\\]|\\.)*)"\]|\[(\d+|\*)\]/y;
  const rest = path.slice(1);
  let pos = 0;
  while (pos < rest.length) {
    re.lastIndex = pos;
    const m = re.exec(rest);
    if (!m) return { ok: false, message: `Unsupported path near "${rest.slice(pos)}".` };
    if (m[1] !== undefined) tokens.push(m[1]);
    else if (m[2] !== undefined) tokens.push(JSON.parse(`"${m[2]}"`));
    else tokens.push(m[3] === "*" ? "*" : Number(m[3]));
    pos = re.lastIndex;
  }
  let current: Json[] = [root];
  for (const token of tokens) {
    const next: Json[] = [];
    for (const node of current) {
      if (token === "*") {
        if (Array.isArray(node)) next.push(...node);
        else if (isObject(node)) next.push(...Object.values(node));
      } else if (typeof token === "number") {
        if (Array.isArray(node) && token < node.length) next.push(node[token]);
      } else if (isObject(node) && Object.prototype.hasOwnProperty.call(node, token)) {
        next.push(node[token]);
      }
    }
    current = next;
  }
  if (current.length === 0) return { ok: false, message: "No match." };
  return { ok: true, text: JSON.stringify(current.length === 1 ? current[0] : current, null, 2) };
}

export function escapeJsonString(text: string): string {
  return JSON.stringify(text).slice(1, -1);
}

export function unescapeJsonString(text: string): Result {
  try {
    return { ok: true, text: JSON.parse(`"${text}"`) };
  } catch {
    return { ok: false, message: "Not a valid escaped JSON string." };
  }
}
