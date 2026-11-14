"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target2, all) => {
  for (var name in all)
    __defProp(target2, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ui/transform.ts
async function runTransform(label, transform, language = "plaintext") {
  const editor = vscode3.window.activeTextEditor;
  const useSelection = !!editor && !editor.selection.isEmpty;
  const range = editor ? useSelection ? editor.selection : new vscode3.Range(0, 0, editor.document.lineCount, 0) : void 0;
  const input = editor && range ? editor.document.getText(range) : "";
  let result;
  try {
    result = transform(input);
  } catch (err) {
    result = { ok: false, message: err instanceof Error ? err.message : "Transform failed." };
  }
  if (!result.ok) {
    void vscode3.window.showErrorMessage(`${label}: ${result.message}`);
    return;
  }
  const doc = await vscode3.workspace.openTextDocument({ content: result.text, language });
  await vscode3.window.showTextDocument(doc, { preview: true, viewColumn: vscode3.ViewColumn.Beside });
  if (editor && range) {
    const replace2 = "Replace source";
    const choice = await vscode3.window.showInformationMessage(`${label}: done.`, replace2);
    if (choice === replace2) {
      await editor.edit((b) => b.replace(range, result.text));
    }
  }
}
async function pickAction(placeHolder, actions) {
  const pick2 = await vscode3.window.showQuickPick(
    actions.map((a) => ({ label: a.label, action: a })),
    { placeHolder }
  );
  if (pick2) await pick2.action.run();
}
var vscode3;
var init_transform = __esm({
  "src/ui/transform.ts"() {
    "use strict";
    vscode3 = __toESM(require("vscode"));
  }
});

// src/tools/encoding/base64.ts
var base64_exports = {};
__export(base64_exports, {
  base64Decode: () => base64Decode,
  base64Encode: () => base64Encode
});
function base64Encode(text2) {
  return { ok: true, text: Buffer.from(text2, "utf8").toString("base64") };
}
function base64Decode(text2) {
  const normalized = text2.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (normalized.length === 0) return { ok: true, text: "" };
  if (!STRICT.test(normalized) || normalized.length % 4 === 1) {
    return { ok: false, message: "Input is not valid Base64." };
  }
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const decoded = Buffer.from(padded, "base64");
  const roundTrip = decoded.toString("utf8");
  if (roundTrip.includes("\uFFFD") && !Buffer.from(roundTrip, "utf8").equals(decoded)) {
    return { ok: false, message: "Decoded bytes are not valid UTF-8 text." };
  }
  return { ok: true, text: roundTrip };
}
var STRICT;
var init_base64 = __esm({
  "src/tools/encoding/base64.ts"() {
    "use strict";
    STRICT = /^[A-Za-z0-9+/]*={0,2}$/;
  }
});

// src/tools/encoding/url.ts
var url_exports = {};
__export(url_exports, {
  urlDecode: () => urlDecode,
  urlEncode: () => urlEncode
});
function urlEncode(text2, mode = "component") {
  return { ok: true, text: mode === "component" ? encodeURIComponent(text2) : encodeURI(text2) };
}
function urlDecode(text2, plusAsSpace = false) {
  const input = plusAsSpace ? text2.replace(/\+/g, " ") : text2;
  try {
    return { ok: true, text: decodeURIComponent(input) };
  } catch {
    return { ok: false, message: "Malformed percent-encoding (e.g. a lone % or invalid UTF-8 sequence)." };
  }
}
var init_url = __esm({
  "src/tools/encoding/url.ts"() {
    "use strict";
  }
});

// src/tools/encoding/conversion.ts
var conversion_exports = {};
__export(conversion_exports, {
  binaryToText: () => binaryToText,
  hexToText: () => hexToText,
  htmlDecode: () => htmlDecode,
  htmlEncode: () => htmlEncode,
  stringEscape: () => stringEscape,
  stringUnescape: () => stringUnescape,
  textToBinary: () => textToBinary,
  textToHex: () => textToHex,
  unicodeEscape: () => unicodeEscape,
  unicodeUnescape: () => unicodeUnescape
});
function htmlEncode(text2) {
  return { ok: true, text: text2.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]) };
}
function htmlDecode(text2) {
  const out = text2.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (whole, body) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (code < 0 || code > 1114111) return whole;
      return String.fromCodePoint(code);
    }
    return HTML_NAMED[body] ?? whole;
  });
  return { ok: true, text: out };
}
function unicodeEscape(text2) {
  let out = "";
  for (let i = 0; i < text2.length; i++) {
    const code = text2.charCodeAt(i);
    out += code < 128 ? text2[i] : "\\u" + code.toString(16).padStart(4, "0");
  }
  return { ok: true, text: out };
}
function unicodeUnescape(text2) {
  try {
    return {
      ok: true,
      text: text2.replace(
        /\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g,
        (_w, braced, four) => String.fromCodePoint(parseInt(braced ?? four, 16))
      )
    };
  } catch {
    return { ok: false, message: "Invalid Unicode escape." };
  }
}
function textToHex(text2) {
  return { ok: true, text: Array.from(utf8(text2), (b) => b.toString(16).padStart(2, "0")).join(" ") };
}
function hexToText(hex) {
  const cleaned = hex.replace(/0x/gi, "").replace(/[\s,]/g, "");
  if (cleaned === "") return { ok: true, text: "" };
  if (!/^[0-9a-fA-F]+$/.test(cleaned) || cleaned.length % 2 !== 0) {
    return { ok: false, message: "Hex input must be pairs of 0-9 and a-f." };
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(cleaned.substr(i * 2, 2), 16);
  return decodeUtf8(bytes);
}
function textToBinary(text2) {
  return { ok: true, text: Array.from(utf8(text2), (b) => b.toString(2).padStart(8, "0")).join(" ") };
}
function binaryToText(bits) {
  const cleaned = bits.replace(/[\s,]/g, "");
  if (cleaned === "") return { ok: true, text: "" };
  if (!/^[01]+$/.test(cleaned) || cleaned.length % 8 !== 0) {
    return { ok: false, message: "Binary input must be groups of 8 bits (0 and 1)." };
  }
  const bytes = new Uint8Array(cleaned.length / 8);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(cleaned.substr(i * 8, 8), 2);
  return decodeUtf8(bytes);
}
function decodeUtf8(bytes) {
  try {
    return { ok: true, text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, message: "Bytes are not valid UTF-8 text." };
  }
}
function stringEscape(text2) {
  return { ok: true, text: JSON.stringify(text2).slice(1, -1) };
}
function stringUnescape(text2) {
  try {
    const converted = text2.replace(/\\x([0-9a-fA-F]{2})/g, "\\u00$1");
    return { ok: true, text: JSON.parse(`"${converted}"`) };
  } catch {
    return { ok: false, message: "Not a valid escaped string." };
  }
}
var HTML_ESCAPES, HTML_NAMED, utf8;
var init_conversion = __esm({
  "src/tools/encoding/conversion.ts"() {
    "use strict";
    HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    HTML_NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\xA0" };
    utf8 = (text2) => new TextEncoder().encode(text2);
  }
});

// src/tools/json/format.ts
var format_exports = {};
__export(format_exports, {
  formatJson: () => formatJson,
  minifyJson: () => minifyJson,
  positionToLineColumn: () => positionToLineColumn,
  validateJson: () => validateJson
});
function positionToLineColumn(text2, offset) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset && i < text2.length; i++) {
    if (text2[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}
function validateJson(text2) {
  if (text2.trim() === "") {
    return { ok: false, message: "Input is empty." };
  }
  try {
    JSON.parse(text2);
    return { ok: true, text: text2 };
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Invalid JSON.";
    const match = /position (\d+)/.exec(raw);
    if (match) {
      const { line, column } = positionToLineColumn(text2, Number(match[1]));
      return { ok: false, message: `Invalid JSON at line ${line}, column ${column}: ${raw}`, line, column };
    }
    return { ok: false, message: `Invalid JSON: ${raw}` };
  }
}
function formatJson(text2, indent = 2) {
  const v = validateJson(text2);
  if (!v.ok) return v;
  return { ok: true, text: JSON.stringify(JSON.parse(text2), null, indent) };
}
function minifyJson(text2) {
  const v = validateJson(text2);
  if (!v.ok) return v;
  return { ok: true, text: JSON.stringify(JSON.parse(text2)) };
}
var init_format = __esm({
  "src/tools/json/format.ts"() {
    "use strict";
  }
});

// src/tools/developer/utilities.ts
var utilities_exports = {};
__export(utilities_exports, {
  describeCron: () => describeCron,
  formatSql: () => formatSql,
  hexToRgb: () => hexToRgb,
  nextRuns: () => nextRuns,
  parseCron: () => parseCron,
  permsFromOctal: () => permsFromOctal,
  permsFromSymbolic: () => permsFromSymbolic,
  rgbToHex: () => rgbToHex,
  rgbToHsl: () => rgbToHsl
});
function parseField(text2, f) {
  const out = /* @__PURE__ */ new Set();
  for (const part of text2.split(",")) {
    const [range, stepText] = part.split("/");
    const step = stepText === void 0 ? 1 : Number(stepText);
    if (!Number.isInteger(step) || step < 1) return `Invalid step in ${f.name}: "${part}".`;
    let lo;
    let hi;
    if (range === "*") {
      lo = f.min;
      hi = f.max;
    } else if (/^\d+-\d+$/.test(range)) {
      [lo, hi] = range.split("-").map(Number);
    } else if (/^\d+$/.test(range)) {
      lo = Number(range);
      hi = stepText === void 0 ? lo : f.max;
    } else {
      return `Unsupported ${f.name} value: "${part}".`;
    }
    if (lo < f.min || hi > f.max || lo > hi) return `${f.name} must be between ${f.min} and ${f.max}.`;
    for (let v = lo; v <= hi; v += step) out.add(v);
  }
  return out;
}
function parseCron(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return { ok: false, message: "Cron needs five fields: minute hour day month weekday." };
  const sets = parts.map((p, i) => parseField(p, FIELDS[i]));
  const err = sets.find((s) => typeof s === "string");
  if (err) return { ok: false, message: err };
  const [minute, hour, dom, month, dow] = sets;
  return {
    ok: true,
    value: { minute, hour, dom, month, dow, domStar: parts[2] === "*", dowStar: parts[4] === "*" }
  };
}
function dayMatches(spec, d) {
  const domOk = spec.dom.has(d.getDate());
  const dowOk = spec.dow.has(d.getDay());
  if (spec.domStar && spec.dowStar) return true;
  if (spec.domStar) return dowOk;
  if (spec.dowStar) return domOk;
  return domOk || dowOk;
}
function nextRuns(expr, from, count) {
  const parsed = parseCron(expr);
  if (!parsed.ok) return parsed;
  const spec = parsed.value;
  const runs = [];
  const t = new Date(from.getTime());
  t.setSeconds(0, 0);
  t.setMinutes(t.getMinutes() + 1);
  const limit = 4 * 366 * 24 * 60;
  for (let i = 0; i < limit && runs.length < count; i++) {
    if (spec.month.has(t.getMonth() + 1) && dayMatches(spec, t) && spec.hour.has(t.getHours()) && spec.minute.has(t.getMinutes())) {
      runs.push(new Date(t.getTime()));
    }
    t.setMinutes(t.getMinutes() + 1);
  }
  if (runs.length === 0) return { ok: false, message: "No matching time in the next four years." };
  return { ok: true, runs };
}
function describeCron(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "";
  const [m, h, dom, mon, dow] = parts;
  const time = m === "*" && h === "*" ? "Every minute" : m === "0" && h === "*" ? "At the start of every hour" : `At minute ${m} past hour ${h}`;
  const day = dom === "*" && dow === "*" ? "every day" : dom !== "*" ? `on day ${dom} of the month` : `on weekday(s) ${dow}`;
  const month = mon === "*" ? "" : ` in month(s) ${mon}`;
  return `${time}, ${day}${month}.`;
}
function permsFromOctal(octal) {
  if (!/^[0-7]{3,4}$/.test(octal)) return { ok: false, message: "Octal mode must be 3 or 4 digits (0-7)." };
  const digits = octal.slice(-3).split("").map(Number);
  const sym = (d) => (d & 4 ? "r" : "-") + (d & 2 ? "w" : "-") + (d & 1 ? "x" : "-");
  const symbolic = digits.map(sym).join("");
  return { ok: true, text: `-${symbolic}`, symbolic: `-${symbolic}` };
}
function permsFromSymbolic(symbolic) {
  const s = symbolic.replace(/^[-dl]/, "");
  if (!/^[rwx-]{9}$/.test(s)) return { ok: false, message: "Symbolic mode must be 9 characters like rwxr-xr--." };
  const digit = (t) => ((t[0] === "r" ? 4 : 0) + (t[1] === "w" ? 2 : 0) + (t[2] === "x" ? 1 : 0)).toString();
  return { ok: true, octal: digit(s.slice(0, 3)) + digit(s.slice(3, 6)) + digit(s.slice(6, 9)) };
}
function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return void 0;
  let h = m[1];
  if (h.length === 3)
    h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return { r: n >> 16 & 255, g: n >> 8 & 255, b: n & 255 };
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
}
function rgbToHsl(r, g, b) {
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
function formatSql(sql) {
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
        (k) => sql.substr(i, k.length).toUpperCase() === k && (i === 0 || !/\w/.test(sql[i - 1])) && !/\w/.test(sql[i + k.length] ?? "")
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
  return out.replace(/[ \t]+,/g, ",").replace(/^\n/, "").replace(/[ \t]+\n/g, "\n");
}
var FIELDS, CLAUSES, JOINS;
var init_utilities = __esm({
  "src/tools/developer/utilities.ts"() {
    "use strict";
    FIELDS = [
      { min: 0, max: 59, name: "minute" },
      { min: 0, max: 23, name: "hour" },
      { min: 1, max: 31, name: "day of month" },
      { min: 1, max: 12, name: "month" },
      { min: 0, max: 6, name: "day of week (0 = Sunday)" }
    ];
    CLAUSES = [
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
    JOINS = ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN", "JOIN"];
  }
});

// src/tools/developer/references.ts
var references_exports = {};
__export(references_exports, {
  HTTP_STATUS: () => HTTP_STATUS,
  MIME_TYPES: () => MIME_TYPES,
  formatXml: () => formatXml,
  validateXml: () => validateXml,
  visualiseEscapes: () => visualiseEscapes
});
function formatXml(xml, indent = "  ") {
  const tokens = xml.match(TOKEN) ?? [];
  if (tokens.join("") !== xml) {
    return { ok: false, message: "Could not parse XML (check for unclosed '<' or stray characters)." };
  }
  const stack = [];
  const lines = [];
  let depth = 0;
  for (const raw of tokens) {
    const token = raw.trim();
    if (token === "") continue;
    if (token.startsWith("</")) {
      const name = token.slice(2, -1).trim();
      const open = stack.pop();
      if (open !== name)
        return { ok: false, message: `Mismatched closing tag </${name}>${open ? ` (expected </${open}>)` : ""}.` };
      depth--;
      lines.push(indent.repeat(depth) + token);
    } else if (token.startsWith("<") && !token.startsWith("<!") && !token.startsWith("<?") && !token.endsWith("/>")) {
      const name = /^<([^\s>]+)/.exec(token)?.[1] ?? "";
      lines.push(indent.repeat(depth) + token);
      stack.push(name);
      depth++;
    } else if (token.startsWith("<")) {
      lines.push(indent.repeat(depth) + token);
    } else {
      lines.push(indent.repeat(depth) + token);
    }
  }
  if (stack.length > 0) return { ok: false, message: `Unclosed tag <${stack[stack.length - 1]}>.` };
  return { ok: true, text: lines.join("\n") };
}
function validateXml(xml) {
  const r = formatXml(xml);
  return r.ok ? { ok: true, text: "Well-formed XML." } : r;
}
function visualiseEscapes(text2) {
  const rows = [];
  const named = { "\n": "\\n", "\r": "\\r", "	": "\\t", " ": "space" };
  for (const ch of text2) {
    const cp = ch.codePointAt(0) ?? 0;
    const label = named[ch] ?? (cp < 32 || cp === 127 ? "control" : ch);
    rows.push(
      `${JSON.stringify(ch).slice(1, -1).padEnd(8)} U+${cp.toString(16).toUpperCase().padStart(4, "0")}  ${label}`
    );
  }
  return rows.length ? rows.join("\n") : "(empty)";
}
var TOKEN, HTTP_STATUS, MIME_TYPES;
var init_references = __esm({
  "src/tools/developer/references.ts"() {
    "use strict";
    TOKEN = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<![\s\S]*?>|<\/\s*[A-Za-z_][\w.\-:]*\s*>|<[A-Za-z_][\w.\-:]*(?:\s[^<>]*)?\/?>|[^<]+|</g;
    HTTP_STATUS = [
      { code: 200, name: "OK", meaning: "Request succeeded." },
      { code: 201, name: "Created", meaning: "A resource was created." },
      { code: 204, name: "No Content", meaning: "Success with no response body." },
      { code: 301, name: "Moved Permanently", meaning: "Resource has a new permanent URL." },
      { code: 302, name: "Found", meaning: "Temporary redirect." },
      { code: 304, name: "Not Modified", meaning: "Cached copy is still valid." },
      { code: 400, name: "Bad Request", meaning: "Malformed request." },
      { code: 401, name: "Unauthorized", meaning: "Authentication required or failed." },
      { code: 403, name: "Forbidden", meaning: "Authenticated but not allowed." },
      { code: 404, name: "Not Found", meaning: "No resource at this URL." },
      { code: 405, name: "Method Not Allowed", meaning: "HTTP method not supported for this URL." },
      { code: 409, name: "Conflict", meaning: "Request conflicts with current state." },
      { code: 415, name: "Unsupported Media Type", meaning: "Content-Type not accepted." },
      { code: 422, name: "Unprocessable Content", meaning: "Valid syntax but semantic errors." },
      { code: 429, name: "Too Many Requests", meaning: "Rate limit exceeded." },
      { code: 500, name: "Internal Server Error", meaning: "Unexpected server failure." },
      { code: 502, name: "Bad Gateway", meaning: "Upstream server returned an invalid response." },
      { code: 503, name: "Service Unavailable", meaning: "Temporarily unavailable." },
      { code: 504, name: "Gateway Timeout", meaning: "Upstream server did not respond in time." }
    ];
    MIME_TYPES = [
      { ext: ".json", mime: "application/json", use: "JSON data" },
      { ext: ".xml", mime: "application/xml", use: "XML documents" },
      { ext: ".html", mime: "text/html", use: "Web pages" },
      { ext: ".css", mime: "text/css", use: "Stylesheets" },
      { ext: ".js", mime: "text/javascript", use: "JavaScript (modern)" },
      { ext: ".txt", mime: "text/plain", use: "Plain text" },
      { ext: ".md", mime: "text/markdown", use: "Markdown" },
      { ext: ".csv", mime: "text/csv", use: "Comma-separated values" },
      { ext: ".png", mime: "image/png", use: "PNG images" },
      { ext: ".jpg", mime: "image/jpeg", use: "JPEG images" },
      { ext: ".svg", mime: "image/svg+xml", use: "SVG vector images" },
      { ext: ".pdf", mime: "application/pdf", use: "PDF documents" },
      { ext: ".zip", mime: "application/zip", use: "ZIP archives" },
      { ext: ".gz", mime: "application/gzip", use: "gzip compressed data" },
      { ext: ".ts", mime: "video/mp2t", use: "MPEG transport stream (note: .ts is also TypeScript)" },
      { ext: ".wasm", mime: "application/wasm", use: "WebAssembly modules" }
    ];
  }
});

// src/tools/text/textUtils.ts
var textUtils_exports = {};
__export(textUtils_exports, {
  convertLineEndings: () => convertLineEndings,
  countStats: () => countStats,
  findReplace: () => findReplace,
  removeDuplicateLines: () => removeDuplicateLines,
  removeEmptyLines: () => removeEmptyLines,
  reverseLines: () => reverseLines,
  sortLines: () => sortLines,
  trimLines: () => trimLines
});
function removeDuplicateLines(text2, ignoreCase = false) {
  const seen = /* @__PURE__ */ new Set();
  return splitLines(text2).filter((line) => {
    const key = ignoreCase ? line.toLowerCase() : line;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).join("\n");
}
function sortLines(text2, options = {}) {
  const cmp = (a, b) => {
    const x = options.ignoreCase ? a.toLowerCase() : a;
    const y = options.ignoreCase ? b.toLowerCase() : b;
    return x < y ? -1 : x > y ? 1 : 0;
  };
  const sorted = splitLines(text2).sort(cmp);
  return (options.descending ? sorted.reverse() : sorted).join("\n");
}
function reverseLines(text2) {
  return splitLines(text2).reverse().join("\n");
}
function trimLines(text2) {
  return splitLines(text2).map((l) => l.trim()).join("\n");
}
function removeEmptyLines(text2) {
  return splitLines(text2).filter((l) => l.trim() !== "").join("\n");
}
function findReplace(text2, find, replacement, options = {}) {
  if (find === "") return { text: text2, count: 0, error: "Search text is empty." };
  const flags = "g" + (options.ignoreCase ? "i" : "");
  const source2 = options.useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let re;
  try {
    re = new RegExp(source2, flags);
  } catch (err) {
    return { text: text2, count: 0, error: err instanceof Error ? err.message : "Invalid pattern." };
  }
  let count = 0;
  const out = text2.replace(re, (...args) => {
    count++;
    return options.useRegex ? replacement.replace(/\$(\d)/g, (_, n) => args[Number(n)] ?? "") : replacement;
  });
  return { text: out, count };
}
function convertLineEndings(text2, to) {
  const lf = text2.replace(/\r\n/g, "\n");
  return to === "crlf" ? lf.replace(/\n/g, "\r\n") : lf;
}
function countStats(text2) {
  const trimmed = text2.trim();
  return {
    characters: [...text2].length,
    words: trimmed === "" ? 0 : trimmed.split(/\s+/).length,
    lines: text2 === "" ? 0 : text2.split(/\r?\n/).length
  };
}
var splitLines;
var init_textUtils = __esm({
  "src/tools/text/textUtils.ts"() {
    "use strict";
    splitLines = (text2) => text2.split(/\r?\n/);
  }
});

// src/tools/generators/hash.ts
var hash_exports = {};
__export(hash_exports, {
  HASH_ALGORITHMS: () => HASH_ALGORITHMS,
  hashAll: () => hashAll,
  hashText: () => hashText
});
function hashText(text2, algorithm) {
  return (0, import_crypto.createHash)(algorithm).update(text2, "utf8").digest("hex");
}
function hashAll(text2) {
  return {
    md5: hashText(text2, "md5"),
    sha1: hashText(text2, "sha1"),
    sha256: hashText(text2, "sha256"),
    sha512: hashText(text2, "sha512")
  };
}
var import_crypto, HASH_ALGORITHMS;
var init_hash = __esm({
  "src/tools/generators/hash.ts"() {
    "use strict";
    import_crypto = require("crypto");
    HASH_ALGORITHMS = ["md5", "sha1", "sha256", "sha512"];
  }
});

// src/tools/json/parse.ts
function isBlank(text2) {
  return text2.trim() === "";
}
var EMPTY_INPUT_MESSAGE;
var init_parse = __esm({
  "src/tools/json/parse.ts"() {
    "use strict";
    EMPTY_INPUT_MESSAGE = "Nothing to process. Select text, or open a document that contains it.";
  }
});

// src/tools/json/utilities.ts
var utilities_exports2 = {};
__export(utilities_exports2, {
  csvToJson: () => csvToJson,
  escapeJsonString: () => escapeJsonString,
  jsonPath: () => jsonPath,
  jsonToCsv: () => jsonToCsv,
  parseCsv: () => parseCsv,
  unescapeJsonString: () => unescapeJsonString
});
function csvCell(value) {
  if (value === void 0 || value === null) return "";
  const text2 = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text2) ? `"${text2.replace(/"/g, '""')}"` : text2;
}
function jsonToCsv(json) {
  if (isBlank(json)) return { ok: false, message: EMPTY_INPUT_MESSAGE };
  let value;
  try {
    value = JSON.parse(json);
  } catch (err) {
    return { ok: false, message: `Invalid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  if (!Array.isArray(value) || !value.every(isObject)) {
    return { ok: false, message: "JSON must be an array of objects." };
  }
  const rows = value;
  const headers = [];
  for (const row of rows) {
    for (const k of Object.keys(row)) if (!headers.includes(k)) headers.push(k);
  }
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => csvCell(row[h])).join(","));
  }
  return { ok: true, text: lines.join("\n") };
}
function parseCsv(text2) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text2.length; i++) {
    const c = text2[i];
    if (quoted) {
      if (c === '"' && text2[i + 1] === '"') {
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
    } else if (c === "\r" && text2[i + 1] === "\n") {
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
function csvToJson(csv) {
  const rows = parseCsv(csv);
  if (rows.length === 0) return { ok: false, message: "CSV is empty." };
  const [headers, ...body] = rows;
  const objects = body.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
  return { ok: true, text: JSON.stringify(objects, null, 2) };
}
function jsonPath(json, path) {
  if (isBlank(json)) return { ok: false, message: EMPTY_INPUT_MESSAGE };
  let root;
  try {
    root = JSON.parse(json);
  } catch (err) {
    return { ok: false, message: `Invalid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  if (!path.startsWith("$")) return { ok: false, message: "Path must start with $." };
  const tokens = [];
  const re = /\.([A-Za-z_$][\w$]*)|\["((?:[^"\\]|\\.)*)"\]|\[(\d+|\*)\]/y;
  const rest = path.slice(1);
  let pos = 0;
  while (pos < rest.length) {
    re.lastIndex = pos;
    const m = re.exec(rest);
    if (!m) return { ok: false, message: `Unsupported path near "${rest.slice(pos)}".` };
    if (m[1] !== void 0) tokens.push(m[1]);
    else if (m[2] !== void 0) tokens.push(JSON.parse(`"${m[2]}"`));
    else tokens.push(m[3] === "*" ? "*" : Number(m[3]));
    pos = re.lastIndex;
  }
  let current = [root];
  for (const token of tokens) {
    const next = [];
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
function escapeJsonString(text2) {
  return JSON.stringify(text2).slice(1, -1);
}
function unescapeJsonString(text2) {
  try {
    return { ok: true, text: JSON.parse(`"${text2}"`) };
  } catch {
    return { ok: false, message: "Not a valid escaped JSON string." };
  }
}
var isObject;
var init_utilities2 = __esm({
  "src/tools/json/utilities.ts"() {
    "use strict";
    init_parse();
    isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
  }
});

// src/tools/text/codeLiteral.ts
var codeLiteral_exports = {};
__export(codeLiteral_exports, {
  toStringLiteral: () => toStringLiteral
});
function toStringLiteral(text2, lang) {
  let out = "";
  for (const ch of text2) {
    const cp = ch.codePointAt(0) ?? 0;
    switch (ch) {
      case "\\":
        out += "\\\\";
        break;
      case '"':
        out += '\\"';
        break;
      case "\n":
        out += "\\n";
        break;
      case "\r":
        out += "\\r";
        break;
      case "	":
        out += "\\t";
        break;
      default:
        if (cp < 32 || cp === 127) {
          out += "\\u" + cp.toString(16).padStart(4, "0");
        } else if (lang === "python" && cp > 65535) {
          out += "\\U" + cp.toString(16).padStart(8, "0");
        } else if (cp > 126 && lang !== "python") {
          out += cp > 65535 ? surrogatePair(cp) : "\\u" + cp.toString(16).padStart(4, "0");
        } else {
          out += ch;
        }
    }
  }
  return `"${out}"`;
}
function surrogatePair(cp) {
  const v = cp - 65536;
  const hi = 55296 + (v >> 10);
  const lo = 56320 + (v & 1023);
  return "\\u" + hi.toString(16) + "\\u" + lo.toString(16);
}
var init_codeLiteral = __esm({
  "src/tools/text/codeLiteral.ts"() {
    "use strict";
  }
});

// src/tools/text/diff.ts
function normalize(line, options) {
  let value = line;
  if (options.ignoreWhitespace) {
    value = value.replace(/\s+/g, " ").trim();
  }
  if (options.ignoreCase) {
    value = value.toLowerCase();
  }
  return value;
}
function diffLines(left2, right2, options = {}) {
  const a = left2 === "" ? [] : left2.split(/\r?\n/);
  const b = right2 === "" ? [] : right2.split(/\r?\n/);
  if (a.length > MAX_LINES || b.length > MAX_LINES) {
    throw new RangeError(`Input too large: more than ${MAX_LINES} lines per side.`);
  }
  const na = a.map((l) => normalize(l, options));
  const nb = b.map((l) => normalize(l, options));
  const n = na.length;
  const m = nb.length;
  const table = [];
  for (let i2 = 0; i2 <= n; i2++) table.push(new Uint32Array(m + 1));
  for (let i2 = n - 1; i2 >= 0; i2--) {
    for (let j2 = m - 1; j2 >= 0; j2--) {
      table[i2][j2] = na[i2] === nb[j2] ? table[i2 + 1][j2 + 1] + 1 : Math.max(table[i2 + 1][j2], table[i2][j2 + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (na[i] === nb[j]) {
      out.push({ kind: "equal", text: a[i], leftLine: i + 1, rightLine: j + 1 });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      out.push({ kind: "removed", text: a[i], leftLine: i + 1 });
      i++;
    } else {
      out.push({ kind: "added", text: b[j], rightLine: j + 1 });
      j++;
    }
  }
  while (i < n) {
    out.push({ kind: "removed", text: a[i], leftLine: i + 1 });
    i++;
  }
  while (j < m) {
    out.push({ kind: "added", text: b[j], rightLine: j + 1 });
    j++;
  }
  return out;
}
function diffSummary(lines) {
  let added = 0;
  let removed = 0;
  let equal = 0;
  for (const line of lines) {
    if (line.kind === "added") added++;
    else if (line.kind === "removed") removed++;
    else equal++;
  }
  return { added, removed, equal };
}
function unifiedDiff(left2, right2, options = {}, context = 3) {
  const lines = diffLines(left2, right2, options);
  const changed = lines.map((l, i) => l.kind !== "equal" ? i : -1).filter((i) => i >= 0);
  if (changed.length === 0) return "";
  const keep = /* @__PURE__ */ new Set();
  for (const i of changed) {
    for (let k = Math.max(0, i - context); k <= Math.min(lines.length - 1, i + context); k++) keep.add(k);
  }
  const out = ["--- left", "+++ right"];
  let prev = -2;
  for (let i = 0; i < lines.length; i++) {
    if (!keep.has(i)) continue;
    if (i !== prev + 1) {
      const l2 = lines[i].leftLine ?? "?";
      const r = lines[i].rightLine ?? "?";
      out.push(`@@ -${l2} +${r} @@`);
    }
    const l = lines[i];
    out.push((l.kind === "added" ? "+" : l.kind === "removed" ? "-" : " ") + l.text);
    prev = i;
  }
  return out.join("\n");
}
var MAX_LINES;
var init_diff = __esm({
  "src/tools/text/diff.ts"() {
    "use strict";
    MAX_LINES = 5e3;
  }
});

// src/tools/text/quickDiff.ts
var quickDiff_exports = {};
__export(quickDiff_exports, {
  openDiff: () => openDiff,
  run: () => run,
  selectionVsClipboard: () => selectionVsClipboard,
  tool: () => tool,
  twoFiles: () => twoFiles,
  twoSelections: () => twoSelections
});
async function selectionVsClipboard() {
  const editor = vscode4.window.activeTextEditor;
  const selected = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
  if (!selected) {
    void vscode4.window.showInformationMessage("Select some text first.");
    return;
  }
  const clip = await vscode4.env.clipboard.readText();
  await openDiff(selected, clip, "Selection vs Clipboard");
}
async function twoSelections() {
  const editor = vscode4.window.activeTextEditor;
  const selected = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
  if (!selected) {
    void vscode4.window.showInformationMessage("Select some text first.");
    return;
  }
  if (firstSelection === void 0) {
    firstSelection = selected;
    void vscode4.window.showInformationMessage(
      "First selection saved. Select the second block and run Quick Diff again."
    );
    return;
  }
  const first = firstSelection;
  firstSelection = void 0;
  await openDiff(first, selected, "Selection A vs Selection B");
}
async function twoFiles() {
  const pick2 = () => vscode4.window.showOpenDialog({ canSelectMany: false, openLabel: "Select file" });
  const a = await pick2();
  if (!a?.[0]) return;
  const b = await pick2();
  if (!b?.[0]) return;
  await vscode4.commands.executeCommand("vscode.diff", a[0], b[0], "File vs File");
}
async function openDiff(left2, right2, title) {
  const leftDoc = await vscode4.workspace.openTextDocument({ content: left2, language: "plaintext" });
  const rightDoc = await vscode4.workspace.openTextDocument({ content: right2, language: "plaintext" });
  await vscode4.commands.executeCommand("vscode.diff", leftDoc.uri, rightDoc.uri, title);
  const unified = unifiedDiff(left2, right2);
  if (unified) {
    const doc = await vscode4.workspace.openTextDocument({ content: unified, language: "diff" });
    await vscode4.window.showTextDocument(doc, { preview: true, viewColumn: vscode4.ViewColumn.Beside });
  } else {
    void vscode4.window.showInformationMessage("The two texts are identical.");
  }
}
async function run() {
  const pick2 = await vscode4.window.showQuickPick(
    [
      { label: "Selection vs Clipboard", id: "clip" },
      { label: "Two Selections", id: "sel" },
      { label: "Two Files", id: "files" }
    ],
    { placeHolder: "Quick Diff mode" }
  );
  if (!pick2) return;
  if (pick2.id === "clip") await selectionVsClipboard();
  else if (pick2.id === "sel") await twoSelections();
  else await twoFiles();
}
var vscode4, firstSelection, tool;
var init_quickDiff = __esm({
  "src/tools/text/quickDiff.ts"() {
    "use strict";
    vscode4 = __toESM(require("vscode"));
    init_diff();
    tool = { run };
  }
});

// src/tools/regex/playground.ts
function validateFlags(flags) {
  for (const f of flags) {
    if (!ALLOWED_FLAGS.includes(f)) return `Unknown flag "${f}". Allowed: ${ALLOWED_FLAGS}.`;
  }
  return void 0;
}
function compile(pattern, flags) {
  const flagError = validateFlags(flags);
  if (flagError) return { error: flagError };
  const unique = Array.from(new Set(flags + "g")).join("");
  try {
    return { regex: new RegExp(pattern, unique) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid regular expression." };
  }
}
function findMatches(req) {
  const { regex, error } = compile(req.pattern, req.flags);
  if (!regex) return { matches: [], error, truncated: false };
  const matches = [];
  let m;
  regex.lastIndex = 0;
  while ((m = regex.exec(req.text)) !== null) {
    if (matches.length >= MAX_MATCHES) {
      return { matches, truncated: true };
    }
    matches.push({
      index: m.index,
      match: m[0],
      groups: m.slice(1),
      named: { ...m.groups ?? {} }
    });
    if (m[0].length === 0) regex.lastIndex++;
  }
  return { matches, truncated: false };
}
function replacePreview(req, replacement) {
  const { regex, error } = compile(req.pattern, req.flags);
  if (!regex) return { count: 0, error };
  let count = 0;
  const result = req.text.replace(regex, (...args) => {
    count++;
    return expandReplacement(replacement, args);
  });
  return { result, count };
}
function expandReplacement(template, args) {
  const hasNamed = typeof args[args.length - 1] === "object";
  const groups = hasNamed ? args[args.length - 1] : void 0;
  const captures = args.slice(0, hasNamed ? -3 : -2);
  return template.replace(/\$(\$|&|\d{1,2}|<[^>]+>)/g, (token, key) => {
    if (key === "$") return "$";
    if (key === "&") return captures[0] ?? "";
    if (key.startsWith("<")) return groups?.[key.slice(1, -1)] ?? "";
    const n = Number(key);
    return n >= 1 && n < captures.length ? captures[n] ?? "" : token;
  });
}
function portabilityWarnings(pattern, flags, engine) {
  const warnings = [];
  if (engine === "python" && /\(\?<[A-Za-z_]/.test(pattern)) {
    warnings.push("Python uses (?P<name>...) for named groups; (?<name>...) is not valid there.");
  }
  if (engine === "java" && flags.includes("u")) {
    warnings.push("The u flag has no direct Java equivalent; Unicode classes behave differently.");
  }
  if (engine !== "javascript" && /\\[pP]\{/.test(pattern)) {
    warnings.push("\\p{...} Unicode properties may not be supported in this engine.");
  }
  if (engine !== "javascript" && /\(\?[=!<]/.test(pattern) && /\(\?<[=!]/.test(pattern)) {
    warnings.push("Lookbehind support and length rules differ between engines.");
  }
  if (engine !== "javascript" && /\\[dw]/.test(pattern) && flags.includes("u")) {
    warnings.push("\\d and \\w may match different characters with Unicode handling.");
  }
  return warnings;
}
var MAX_MATCHES, ALLOWED_FLAGS;
var init_playground = __esm({
  "src/tools/regex/playground.ts"() {
    "use strict";
    MAX_MATCHES = 1e3;
    ALLOWED_FLAGS = "gimsu";
  }
});

// src/tools/regex/regexTool.ts
var regexTool_exports = {};
__export(regexTool_exports, {
  copyRegex: () => copyRegex,
  onDocumentChanged: () => onDocumentChanged,
  replace: () => replace,
  run: () => run2,
  tool: () => tool2,
  usePattern: () => usePattern
});
function highlight(editor) {
  const text2 = editor.document.getText();
  const { matches, error, truncated } = findMatches({ pattern: state.pattern, flags: state.flags, text: text2 });
  if (error) {
    editor.setDecorations(matchDecoration, []);
    return;
  }
  const ranges = matches.map(
    (m) => new vscode5.Range(editor.document.positionAt(m.index), editor.document.positionAt(m.index + m.match.length))
  );
  editor.setDecorations(matchDecoration, ranges);
  if (truncated) {
    void vscode5.window.setStatusBarMessage("Regex Playground: showing the first 1000 matches.", 5e3);
  }
}
async function pickEngine() {
  const picked = await vscode5.window.showQuickPick(
    [
      { label: "JavaScript", engine: "javascript", description: "Used for matching in this tool" },
      { label: "Python", engine: "python", description: "Warnings only" },
      { label: "Java", engine: "java", description: "Warnings only" }
    ],
    { placeHolder: "Target regex engine" }
  );
  return picked?.engine;
}
async function pickFlags(current) {
  const options = [
    { label: "i", description: "case-insensitive" },
    { label: "m", description: "multiline (^ and $ match line boundaries)" },
    { label: "s", description: "dotAll (. matches newlines)" },
    { label: "u", description: "Unicode" }
  ];
  const picked = await vscode5.window.showQuickPick(
    options.map((o) => ({ ...o, picked: current.includes(o.label) })),
    { canPickMany: true, placeHolder: "Flags (g is always on)" }
  );
  return picked?.map((p) => p.label).join("");
}
async function ensureDocument(seed) {
  if (!state.doc || state.doc.isClosed) {
    state.doc = await vscode5.workspace.openTextDocument({ content: seed, language: "plaintext" });
  }
  const editor = await vscode5.window.showTextDocument(state.doc, { preview: false, preserveFocus: true });
  return editor;
}
async function run2() {
  const active = vscode5.window.activeTextEditor;
  const seed = active?.selection && !active.selection.isEmpty ? active.document.getText(active.selection) : "";
  const pattern = await vscode5.window.showInputBox({
    prompt: "Regex pattern (without slashes)",
    value: state.pattern,
    placeHolder: "e.g. \\d{3}-\\d{4}"
  });
  if (pattern === void 0) return;
  state.pattern = pattern;
  const flags = await pickFlags(state.flags);
  if (flags === void 0) return;
  state.flags = flags;
  const engine = await pickEngine();
  if (!engine) return;
  state.engine = engine;
  const editor = await ensureDocument(seed);
  highlight(editor);
  const warnings = portabilityWarnings(state.pattern, state.flags, state.engine);
  const { matches, error } = findMatches({
    pattern: state.pattern,
    flags: state.flags,
    text: editor.document.getText()
  });
  if (error) {
    void vscode5.window.showErrorMessage(`Regex error: ${error}`);
  } else {
    const groupInfo = matches[0] && matches[0].groups.length > 0 ? ` First match groups: ${JSON.stringify(matches[0].groups)}.` : "";
    void vscode5.window.showInformationMessage(`${matches.length} match(es).${groupInfo}`);
  }
  if (warnings.length > 0) {
    void vscode5.window.showWarningMessage(`Engine note (${state.engine}): ${warnings.join(" ")}`);
  }
}
function onDocumentChanged(event) {
  if (!state.doc || event.document !== state.doc) return;
  for (const editor of vscode5.window.visibleTextEditors) {
    if (editor.document === state.doc) highlight(editor);
  }
}
async function replace() {
  if (!state.pattern) {
    void vscode5.window.showInformationMessage("Run Regex Playground first to set a pattern.");
    return;
  }
  const replacement = await vscode5.window.showInputBox({
    prompt: "Replacement ($1, $<name>, $& supported)",
    placeHolder: "$2 $1"
  });
  if (replacement === void 0 || !state.doc) return;
  const text2 = state.doc.getText();
  const { result, count, error } = replacePreview({ pattern: state.pattern, flags: state.flags, text: text2 }, replacement);
  if (error) {
    void vscode5.window.showErrorMessage(`Regex error: ${error}`);
    return;
  }
  const preview = await vscode5.workspace.openTextDocument({ content: result ?? "", language: "plaintext" });
  await vscode5.window.showTextDocument(preview, { preview: true });
  void vscode5.window.showInformationMessage(`Replace preview: ${count} replacement(s).`);
}
async function copyRegex() {
  if (!state.pattern) {
    void vscode5.window.showInformationMessage("No regex to copy yet.");
    return;
  }
  const literal = `/${state.pattern}/${state.flags}`;
  await vscode5.env.clipboard.writeText(literal);
  void vscode5.window.showInformationMessage(`Copied ${literal}`);
}
async function usePattern(pattern, flags) {
  state.pattern = pattern;
  state.flags = flags;
  const editor = await ensureDocument(state.doc ? state.doc.getText() : "");
  highlight(editor);
}
var vscode5, matchDecoration, state, tool2;
var init_regexTool = __esm({
  "src/tools/regex/regexTool.ts"() {
    "use strict";
    vscode5 = __toESM(require("vscode"));
    init_playground();
    matchDecoration = vscode5.window.createTextEditorDecorationType({
      backgroundColor: new vscode5.ThemeColor("editor.findMatchHighlightBackground"),
      border: "1px solid",
      borderColor: new vscode5.ThemeColor("editor.findMatchBorder")
    });
    state = {
      pattern: "",
      flags: "",
      engine: "javascript"
    };
    tool2 = { run: run2 };
  }
});

// src/tools/encoding/dataUri.ts
var dataUri_exports = {};
__export(dataUri_exports, {
  IMAGE_MIME: () => IMAGE_MIME,
  MAX_IMAGE_BYTES: () => MAX_IMAGE_BYTES,
  formatBytes: () => formatBytes,
  mimeForExtension: () => mimeForExtension,
  toDataUri: () => toDataUri
});
function mimeForExtension(ext) {
  return IMAGE_MIME[ext.toLowerCase()];
}
function toDataUri(bytes, mime) {
  if (bytes.length > MAX_IMAGE_BYTES) {
    return { ok: false, message: `Image is ${Math.round(bytes.length / 1024)} KB; the limit is 2 MB.` };
  }
  return { ok: true, text: `data:${mime};base64,${Buffer.from(bytes).toString("base64")}` };
}
function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
var IMAGE_MIME, MAX_IMAGE_BYTES;
var init_dataUri = __esm({
  "src/tools/encoding/dataUri.ts"() {
    "use strict";
    IMAGE_MIME = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".bmp": "image/bmp",
      ".ico": "image/x-icon"
    };
    MAX_IMAGE_BYTES = 2 * 1024 * 1024;
  }
});

// src/tools/text/diffTool.ts
var diffTool_exports = {};
__export(diffTool_exports, {
  clear: () => clear,
  copyDifferences: () => copyDifferences,
  formatDifferences: () => formatDifferences,
  run: () => run3,
  summarize: () => summarize,
  swap: () => swap,
  tool: () => tool3
});
async function openPair(leftText, rightText) {
  left = await vscode8.workspace.openTextDocument({ content: leftText, language: "plaintext" });
  right = await vscode8.workspace.openTextDocument({ content: rightText, language: "plaintext" });
  await vscode8.commands.executeCommand("vscode.diff", left.uri, right.uri, "Text Diff");
}
async function pickOptions() {
  const items = [
    { label: "Ignore whitespace", picked: false, key: "ignoreWhitespace" },
    { label: "Ignore case", picked: false, key: "ignoreCase" }
  ];
  const picked = await vscode8.window.showQuickPick(items, {
    canPickMany: true,
    placeHolder: "Diff options (optional)"
  });
  if (!picked) {
    return void 0;
  }
  return {
    ignoreWhitespace: picked.some((p) => p.key === "ignoreWhitespace"),
    ignoreCase: picked.some((p) => p.key === "ignoreCase")
  };
}
function formatDifferences(lines) {
  return lines.filter((l) => l.kind !== "equal").map((l) => l.kind === "added" ? `+ ${l.text}` : `- ${l.text}`).join("\n");
}
async function run3() {
  const seed = vscode8.window.activeTextEditor?.document.getText(vscode8.window.activeTextEditor.selection) ?? "";
  await openPair(seed, "");
  void vscode8.window.showInformationMessage(
    "Paste text into both sides to compare. Use Dev Tool: Swap Diff Sides or Clear Diff Inputs as needed."
  );
}
async function swap() {
  if (!left || !right) {
    void vscode8.window.showInformationMessage("Open a Text Diff first.");
    return;
  }
  await openPair(right.getText(), left.getText());
}
async function clear() {
  if (!left || !right) {
    void vscode8.window.showInformationMessage("Open a Text Diff first.");
    return;
  }
  await openPair("", "");
}
async function summarize() {
  if (!left || !right) {
    void vscode8.window.showInformationMessage("Open a Text Diff first.");
    return;
  }
  const options = await pickOptions();
  if (!options) {
    return;
  }
  try {
    const lines = diffLines(left.getText(), right.getText(), options);
    const s = diffSummary(lines);
    void vscode8.window.showInformationMessage(`+${s.added} added, -${s.removed} removed, ${s.equal} unchanged.`);
  } catch (err) {
    void vscode8.window.showErrorMessage(err instanceof Error ? err.message : "Diff failed.");
  }
}
async function copyDifferences() {
  if (!left || !right) {
    void vscode8.window.showInformationMessage("Open a Text Diff first.");
    return;
  }
  const options = await pickOptions();
  if (!options) {
    return;
  }
  try {
    const text2 = formatDifferences(diffLines(left.getText(), right.getText(), options));
    await vscode8.env.clipboard.writeText(text2);
    void vscode8.window.showInformationMessage(text2 ? "Differences copied to clipboard." : "No differences to copy.");
  } catch (err) {
    void vscode8.window.showErrorMessage(err instanceof Error ? err.message : "Diff failed.");
  }
}
var vscode8, left, right, tool3;
var init_diffTool = __esm({
  "src/tools/text/diffTool.ts"() {
    "use strict";
    vscode8 = __toESM(require("vscode"));
    init_diff();
    tool3 = { run: run3 };
  }
});

// src/tools/regex/library.ts
var LIBRARY;
var init_library = __esm({
  "src/tools/regex/library.ts"() {
    "use strict";
    LIBRARY = [
      {
        id: "email",
        label: "Email address",
        pattern: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
        flags: "",
        valid: ["a.b@example.com", "user+tag@sub.domain.org"],
        invalid: ["plain", "a@b", "@x.com"]
      },
      {
        id: "phone",
        label: "Phone number (international, loose)",
        pattern: "^\\+?[0-9][0-9 ()-]{6,18}[0-9]$",
        flags: "",
        valid: ["+1 (555) 123-4567", "020 7946 0958"],
        invalid: ["12", "abc-def-ghij"]
      },
      {
        id: "url",
        label: "HTTP(S) URL",
        pattern: "^https?:\\/\\/[^\\s/$.?#][^\\s]*$",
        flags: "i",
        valid: ["https://example.com", "http://a.b/path?x=1"],
        invalid: ["ftp://x.com", "example.com", "https://"]
      },
      {
        id: "ipv4",
        label: "IPv4 address",
        pattern: "^((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)$",
        flags: "",
        valid: ["192.168.0.1", "0.0.0.0", "255.255.255.255"],
        invalid: ["256.1.1.1", "1.2.3", "a.b.c.d"]
      },
      {
        id: "date-iso",
        label: "Date (YYYY-MM-DD)",
        pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$",
        flags: "",
        valid: ["2026-11-14", "1999-01-31"],
        invalid: ["2026-13-01", "14/11/2026", "2026-00-10"]
      },
      {
        id: "uuid",
        label: "UUID (any version)",
        pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        flags: "",
        valid: ["123e4567-e89b-12d3-a456-426614174000"],
        invalid: ["123e4567e89b12d3a456426614174000", "xyz"]
      },
      {
        id: "integer",
        label: "Integer (optional sign)",
        pattern: "^[+-]?\\d+$",
        flags: "",
        valid: ["0", "-42", "+7"],
        invalid: ["1.5", "", "abc"]
      },
      {
        id: "decimal",
        label: "Decimal number",
        pattern: "^[+-]?(\\d+\\.?\\d*|\\.\\d+)$",
        flags: "",
        valid: ["3.14", "-0.5", ".5", "10"],
        invalid: ["1.2.3", "abc", "--1"]
      },
      {
        id: "alphanumeric",
        label: "Alphanumeric only",
        pattern: "^[A-Za-z0-9]+$",
        flags: "",
        valid: ["abc123", "ABC"],
        invalid: ["abc 123", "a_b", ""]
      },
      {
        id: "whitespace-trim",
        label: "Leading or trailing whitespace",
        pattern: "^\\s+|\\s+$",
        flags: "",
        valid: [" x", "x "],
        invalid: ["x", "x y"]
      },
      {
        id: "html-tag",
        label: "HTML tag (simple)",
        pattern: "<\\/?[A-Za-z][A-Za-z0-9-]*(\\s[^>]*)?\\/?>",
        flags: "",
        valid: ["<div>", "</p>", "<br/>", '<a href="x">'],
        invalid: ["plain text", "<>", "< div>"]
      },
      {
        id: "strong-password",
        label: "Password: 8+ chars with upper, lower, digit and symbol",
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
        flags: "",
        valid: ["Passw0rd!", "Abcdef1#"],
        invalid: ["password", "PASSWORD1!", "Ab1!"]
      },
      {
        id: "hex-color",
        label: "Hex colour (#RGB or #RRGGBB)",
        pattern: "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$",
        flags: "",
        valid: ["#fff", "#A1B2C3"],
        invalid: ["#ffff", "fff", "#GGG"]
      }
    ];
  }
});

// src/tools/regex/libraryTool.ts
var libraryTool_exports = {};
__export(libraryTool_exports, {
  run: () => run4,
  tool: () => tool4
});
async function run4() {
  const pick2 = await vscode9.window.showQuickPick(
    LIBRARY.map((p) => ({ label: p.label, description: `/${p.pattern}/${p.flags}`, id: p.id })),
    { placeHolder: "Choose a pattern (engine: JavaScript; check notes for other engines)", matchOnDescription: true }
  );
  if (!pick2) return;
  const entry = LIBRARY.find((p) => p.id === pick2.id);
  if (entry) await usePattern(entry.pattern, entry.flags);
}
var vscode9, tool4;
var init_libraryTool = __esm({
  "src/tools/regex/libraryTool.ts"() {
    "use strict";
    vscode9 = __toESM(require("vscode"));
    init_library();
    init_regexTool();
    tool4 = { run: run4 };
  }
});

// src/tools/json/jsonTool.ts
var jsonTool_exports = {};
__export(jsonTool_exports, {
  run: () => run5,
  tool: () => tool5
});
function source() {
  const editor = vscode10.window.activeTextEditor;
  if (editor && !editor.selection.isEmpty) {
    return { text: editor.document.getText(editor.selection), editor, range: editor.selection };
  }
  if (editor) {
    return { text: editor.document.getText(), editor, range: new vscode10.Range(0, 0, editor.document.lineCount, 0) };
  }
  return { text: "" };
}
async function show2(result, label) {
  if (!result.ok) {
    void vscode10.window.showErrorMessage(result.message);
    return;
  }
  const { editor, range } = source();
  const doc = await vscode10.workspace.openTextDocument({ content: result.text, language: "json" });
  await vscode10.window.showTextDocument(doc, { preview: true, viewColumn: vscode10.ViewColumn.Beside });
  const replaceLabel = "Replace source";
  const choice = await vscode10.window.showInformationMessage(`${label}: done.`, replaceLabel);
  if (choice === replaceLabel && editor && range) {
    await editor.edit((b) => b.replace(range, result.text));
  }
}
async function run5() {
  const pick2 = await vscode10.window.showQuickPick(
    [
      { label: "Format", id: "format" },
      { label: "Minify", id: "minify" },
      { label: "Validate", id: "validate" }
    ],
    { placeHolder: "JSON action" }
  );
  if (!pick2) return;
  const { text: text2 } = source();
  if (pick2.id === "validate") {
    const r = validateJson(text2);
    void vscode10.window.showInformationMessage(r.ok ? "Valid JSON." : r.message);
    return;
  }
  const result = pick2.id === "format" ? formatJson(text2) : minifyJson(text2);
  await show2(result, pick2.label);
}
var vscode10, tool5;
var init_jsonTool = __esm({
  "src/tools/json/jsonTool.ts"() {
    "use strict";
    vscode10 = __toESM(require("vscode"));
    init_format();
    tool5 = { run: run5 };
  }
});

// src/tools/json/compare.ts
function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function childPath(base, key) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${base}.${key}` : `${base}[${JSON.stringify(key)}]`;
}
function compareJson(a, b, options = {}, path = "$") {
  const changes = [];
  if (Array.isArray(a) && Array.isArray(b)) {
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) changes.push({ kind: "added", path: p, to: b[i] });
      else if (i >= b.length) changes.push({ kind: "removed", path: p, from: a[i] });
      else changes.push(...compareJson(a[i], b[i], options, p));
    }
    return changes;
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (options.orderSensitive && aKeys.join("\0") !== bKeys.join("\0")) {
      changes.push({ kind: "changed", path: `${path} (key order)`, from: aKeys, to: bKeys });
    }
    const keys = /* @__PURE__ */ new Set([...aKeys, ...bKeys]);
    for (const key of keys) {
      const p = childPath(path, key);
      const inA = Object.prototype.hasOwnProperty.call(a, key);
      const inB = Object.prototype.hasOwnProperty.call(b, key);
      if (!inA) changes.push({ kind: "added", path: p, to: b[key] });
      else if (!inB) changes.push({ kind: "removed", path: p, from: a[key] });
      else changes.push(...compareJson(a[key], b[key], options, p));
    }
    return changes;
  }
  if (!Object.is(a, b)) {
    changes.push({ kind: "changed", path, from: a, to: b });
  }
  return changes;
}
function compareJsonText(a, b, options = {}) {
  if (isBlank(a)) return { error: "Left side is empty. " + EMPTY_INPUT_MESSAGE };
  if (isBlank(b)) return { error: "Right side is empty. " + EMPTY_INPUT_MESSAGE };
  let left2;
  let right2;
  try {
    left2 = JSON.parse(a);
  } catch (err) {
    return { error: `Left side is not valid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  try {
    right2 = JSON.parse(b);
  } catch (err) {
    return { error: `Right side is not valid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  return { changes: compareJson(left2, right2, options) };
}
var init_compare = __esm({
  "src/tools/json/compare.ts"() {
    "use strict";
    init_parse();
  }
});

// src/tools/json/compareTool.ts
var compareTool_exports = {};
__export(compareTool_exports, {
  run: () => run6,
  tool: () => tool6
});
async function run6() {
  const left2 = await vscode11.window.showInputBox({ prompt: "Left JSON (paste or leave blank to use selection)" });
  if (left2 === void 0) return;
  const right2 = await vscode11.window.showInputBox({ prompt: "Right JSON" });
  if (right2 === void 0) return;
  const orderPick = await vscode11.window.showQuickPick(["Ignore key order (default)", "Key order matters"], {
    placeHolder: "Comparison mode"
  });
  if (!orderPick) return;
  const result = compareJsonText(left2, right2, { orderSensitive: orderPick.startsWith("Key order matters") });
  if (result.error) {
    void vscode11.window.showErrorMessage(result.error);
    return;
  }
  const changes = result.changes ?? [];
  if (changes.length === 0) {
    void vscode11.window.showInformationMessage("The JSON documents are equal.");
    return;
  }
  const lines = changes.map((c) => {
    if (c.kind === "added") return `+ ${c.path}: ${JSON.stringify(c.to)}`;
    if (c.kind === "removed") return `- ${c.path}: ${JSON.stringify(c.from)}`;
    return `~ ${c.path}: ${JSON.stringify(c.from)} -> ${JSON.stringify(c.to)}`;
  });
  const doc = await vscode11.workspace.openTextDocument({ content: lines.join("\n"), language: "plaintext" });
  await vscode11.window.showTextDocument(doc, { preview: true, viewColumn: vscode11.ViewColumn.Beside });
}
var vscode11, tool6;
var init_compareTool = __esm({
  "src/tools/json/compareTool.ts"() {
    "use strict";
    vscode11 = __toESM(require("vscode"));
    init_compare();
    tool6 = { run: run6 };
  }
});

// src/tools/encoding/base64Tool.ts
var base64Tool_exports = {};
__export(base64Tool_exports, {
  run: () => run7,
  tool: () => tool7
});
async function run7() {
  await pickAction("Base64", [
    { label: "Encode", run: () => runTransform("Base64 encode", base64Encode) },
    { label: "Decode", run: () => runTransform("Base64 decode", base64Decode) }
  ]);
}
var tool7;
var init_base64Tool = __esm({
  "src/tools/encoding/base64Tool.ts"() {
    "use strict";
    init_transform();
    init_base64();
    tool7 = { run: run7 };
  }
});

// src/tools/encoding/urlTool.ts
var urlTool_exports = {};
__export(urlTool_exports, {
  run: () => run8,
  tool: () => tool8
});
async function run8() {
  await pickAction("URL encode/decode", [
    { label: "Encode (query value)", run: () => runTransform("URL encode", (t) => urlEncode(t, "component")) },
    { label: "Encode (whole URL)", run: () => runTransform("URL encode", (t) => urlEncode(t, "full")) },
    { label: "Decode", run: () => runTransform("URL decode", (t) => urlDecode(t)) },
    { label: "Decode (form data, + as space)", run: () => runTransform("URL decode", (t) => urlDecode(t, true)) }
  ]);
}
var tool8;
var init_urlTool = __esm({
  "src/tools/encoding/urlTool.ts"() {
    "use strict";
    init_transform();
    init_url();
    tool8 = { run: run8 };
  }
});

// src/tools/generators/uuid.ts
function generateUuids(options, source2 = import_crypto2.randomUUID) {
  const count = Math.min(MAX_UUID_COUNT, Math.max(1, Math.floor(options.count)));
  const out = [];
  for (let i = 0; i < count; i++) {
    let id = source2().toLowerCase();
    if (options.noDashes) id = id.replace(/-/g, "");
    if (options.uppercase) id = id.toUpperCase();
    out.push(id);
  }
  return out;
}
var import_crypto2, MAX_UUID_COUNT;
var init_uuid = __esm({
  "src/tools/generators/uuid.ts"() {
    "use strict";
    import_crypto2 = require("crypto");
    MAX_UUID_COUNT = 100;
  }
});

// src/tools/generators/uuidTool.ts
var uuidTool_exports = {};
__export(uuidTool_exports, {
  run: () => run9,
  tool: () => tool9
});
async function run9() {
  const countPick = await vscode12.window.showQuickPick(["1", "5", "10", "25", "100"], {
    placeHolder: "How many UUIDs?"
  });
  if (!countPick) return;
  const format = await vscode12.window.showQuickPick(
    ["Lowercase, with dashes", "Uppercase, with dashes", "Lowercase, no dashes"],
    { placeHolder: "Format" }
  );
  if (!format) return;
  const ids = generateUuids({
    count: Number(countPick),
    uppercase: format.startsWith("Uppercase"),
    noDashes: format.endsWith("no dashes")
  });
  const text2 = ids.join("\n");
  await vscode12.env.clipboard.writeText(text2);
  const doc = await vscode12.workspace.openTextDocument({ content: text2, language: "plaintext" });
  await vscode12.window.showTextDocument(doc, { preview: true, viewColumn: vscode12.ViewColumn.Beside });
  void vscode12.window.showInformationMessage(`${ids.length} UUID(s) generated and copied.`);
}
var vscode12, tool9;
var init_uuidTool = __esm({
  "src/tools/generators/uuidTool.ts"() {
    "use strict";
    vscode12 = __toESM(require("vscode"));
    init_uuid();
    tool9 = { run: run9 };
  }
});

// src/tools/generators/hashTool.ts
var hashTool_exports = {};
__export(hashTool_exports, {
  run: () => run10,
  tool: () => tool10
});
async function run10() {
  const algos = ["md5", "sha1", "sha256", "sha512"];
  await pickAction("Hash", [
    {
      label: "All algorithms",
      run: () => runTransform("Hashes", (t) => ({
        ok: true,
        text: Object.entries(hashAll(t)).map(([k, v]) => `${k}: ${v}`).join("\n")
      }))
    },
    ...algos.map((a) => ({
      label: a.toUpperCase(),
      run: () => runTransform(a.toUpperCase(), (t) => ({ ok: true, text: hashText(t, a) }))
    }))
  ]);
}
var tool10;
var init_hashTool = __esm({
  "src/tools/generators/hashTool.ts"() {
    "use strict";
    init_transform();
    init_hash();
    tool10 = { run: run10 };
  }
});

// src/tools/text/textUtilsTool.ts
var textUtilsTool_exports = {};
__export(textUtilsTool_exports, {
  run: () => run11,
  tool: () => tool11
});
async function run11() {
  await pickAction("Text utilities", [
    {
      label: "Remove duplicate lines",
      run: () => runTransform("Dedupe", (x) => ({ ok: true, text: removeDuplicateLines(x) }))
    },
    { label: "Sort lines (A-Z)", run: () => runTransform("Sort", (x) => ({ ok: true, text: sortLines(x) })) },
    {
      label: "Sort lines (Z-A)",
      run: () => runTransform("Sort", (x) => ({ ok: true, text: sortLines(x, { descending: true }) }))
    },
    { label: "Reverse lines", run: () => runTransform("Reverse", (x) => ({ ok: true, text: reverseLines(x) })) },
    {
      label: "Trim whitespace on each line",
      run: () => runTransform("Trim", (x) => ({ ok: true, text: trimLines(x) }))
    },
    {
      label: "Remove empty lines",
      run: () => runTransform("Remove empty lines", (x) => ({ ok: true, text: removeEmptyLines(x) }))
    },
    {
      label: "Convert line endings to LF",
      run: () => runTransform("Line endings", (x) => ({ ok: true, text: convertLineEndings(x, "lf") }))
    },
    {
      label: "Convert line endings to CRLF",
      run: () => runTransform("Line endings", (x) => ({ ok: true, text: convertLineEndings(x, "crlf") }))
    },
    { label: "Find and replace", run: findAndReplace },
    { label: "Count characters, words and lines", run: countStats2 }
  ]);
}
async function findAndReplace() {
  const find = await vscode13.window.showInputBox({ prompt: "Find" });
  if (find === void 0 || find === "") return;
  const replacement = await vscode13.window.showInputBox({ prompt: "Replace with" });
  if (replacement === void 0) return;
  const mode = await vscode13.window.showQuickPick(["Literal", "Regex", "Literal, ignore case"], {
    placeHolder: "Match mode"
  });
  if (!mode) return;
  await runTransform("Find and replace", (x) => {
    const r = findReplace(x, find, replacement, {
      useRegex: mode === "Regex",
      ignoreCase: mode.endsWith("ignore case")
    });
    return r.error ? { ok: false, message: r.error } : { ok: true, text: `${r.text}` };
  });
}
async function countStats2() {
  const editor = vscode13.window.activeTextEditor;
  const text2 = editor ? editor.document.getText(editor.selection.isEmpty ? void 0 : editor.selection) : "";
  const s = countStats(text2);
  void vscode13.window.showInformationMessage(`Characters: ${s.characters}, words: ${s.words}, lines: ${s.lines}`);
}
var vscode13, tool11;
var init_textUtilsTool = __esm({
  "src/tools/text/textUtilsTool.ts"() {
    "use strict";
    vscode13 = __toESM(require("vscode"));
    init_transform();
    init_textUtils();
    tool11 = { run: run11 };
  }
});

// src/tools/json/toTs.ts
function unionOf(types) {
  const unique = [...new Set(types)];
  return unique.length === 0 ? "unknown" : unique.join(" | ");
}
function jsonToTypeScript(json, rootName = "Root") {
  if (json.trim() === "") {
    return { ok: false, message: "Nothing to convert. Select JSON, or open a document that contains JSON." };
  }
  let value;
  try {
    value = JSON.parse(json);
  } catch (err) {
    return { ok: false, message: `Invalid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  const gen = new Gen();
  const type = gen.typeOf(value, pascal(rootName) || "Root");
  if (!isObject2(value)) {
    return { ok: true, text: `export type ${pascal(rootName) || "Root"} = ${type};` };
  }
  return { ok: true, text: gen.output() };
}
var pascal, keyText, isObject2, Gen;
var init_toTs = __esm({
  "src/tools/json/toTs.ts"() {
    "use strict";
    pascal = (s) => {
      const parts = s.split(/[^A-Za-z0-9]+/).filter(Boolean);
      const name = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
      return /^[A-Za-z_$]/.test(name) ? name : `T${name}`;
    };
    keyText = (k) => /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
    isObject2 = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
    Gen = class {
      interfaces = [];
      used = /* @__PURE__ */ new Map();
      // Gives each generated interface a unique name.
      uniqueName(base) {
        const n = this.used.get(base) ?? 0;
        this.used.set(base, n + 1);
        return n === 0 ? base : `${base}${n + 1}`;
      }
      typeOf(value, hint) {
        if (value === null) return "null";
        if (Array.isArray(value)) {
          if (value.length === 0) return "unknown[]";
          const singular = /s$/i.test(hint) && hint.length > 1 ? hint.slice(0, -1) : hint + "Item";
          const element = this.typeOfMany(value, singular);
          return element.includes("|") ? `(${element})[]` : `${element}[]`;
        }
        if (isObject2(value)) return this.objectType(value, hint);
        if (typeof value === "string") return "string";
        if (typeof value === "number") return "number";
        if (typeof value === "boolean") return "boolean";
        return "unknown";
      }
      // Types for a list of values; objects are merged into one interface.
      typeOfMany(values, hint) {
        const objects = values.filter(isObject2);
        const others = values.filter((v) => !isObject2(v));
        const parts = [];
        if (objects.length > 0) parts.push(this.mergedObjectType(objects, hint));
        for (const v of others) parts.push(this.typeOf(v, hint));
        return unionOf(parts);
      }
      objectType(obj, hint) {
        return this.mergedObjectType([obj], hint);
      }
      mergedObjectType(objects, hint) {
        const name = this.uniqueName(pascal(hint));
        const keys = [];
        for (const o of objects) for (const k of Object.keys(o)) if (!keys.includes(k)) keys.push(k);
        const lines = [];
        for (const k of keys) {
          const present = objects.filter((o) => Object.prototype.hasOwnProperty.call(o, k));
          const optional = present.length < objects.length ? "?" : "";
          const values = present.map((o) => o[k]);
          const type = this.typeOfMany(values, pascal(k) || "Field");
          lines.push(`  ${keyText(k)}${optional}: ${type};`);
        }
        this.interfaces.push(`export interface ${name} {
${lines.join("\n")}
}`);
        return name;
      }
      output() {
        return this.interfaces.slice().reverse().join("\n\n");
      }
    };
  }
});

// src/tools/json/toTsTool.ts
var toTsTool_exports = {};
__export(toTsTool_exports, {
  run: () => run12,
  tool: () => tool12
});
async function run12() {
  await runTransform("JSON to TypeScript", (x) => jsonToTypeScript(x, "Root"), "typescript");
}
var tool12;
var init_toTsTool = __esm({
  "src/tools/json/toTsTool.ts"() {
    "use strict";
    init_transform();
    init_toTs();
    tool12 = { run: run12 };
  }
});

// src/tools/encoding/conversionTool.ts
var conversionTool_exports = {};
__export(conversionTool_exports, {
  run: () => run13,
  tool: () => tool13
});
async function run13() {
  await pickAction("Encoding and conversion", [
    { label: "HTML entities: encode", run: () => runTransform("HTML encode", htmlEncode, "html") },
    { label: "HTML entities: decode", run: () => runTransform("HTML decode", htmlDecode, "html") },
    { label: "Unicode: escape to \\uXXXX", run: () => runTransform("Unicode escape", unicodeEscape) },
    { label: "Unicode: unescape \\uXXXX", run: () => runTransform("Unicode unescape", unicodeUnescape) },
    { label: "Text to hex", run: () => runTransform("Text to hex", textToHex) },
    { label: "Hex to text", run: () => runTransform("Hex to text", hexToText) },
    { label: "Text to binary", run: () => runTransform("Text to binary", textToBinary) },
    { label: "Binary to text", run: () => runTransform("Binary to text", binaryToText) },
    { label: "String escape", run: () => runTransform("String escape", stringEscape) },
    { label: "String unescape", run: () => runTransform("String unescape", stringUnescape) }
  ]);
}
var tool13;
var init_conversionTool = __esm({
  "src/tools/encoding/conversionTool.ts"() {
    "use strict";
    init_transform();
    init_conversion();
    tool13 = { run: run13 };
  }
});

// src/tools/generators/generators.ts
function randomString(length, charset) {
  if (charset.length === 0) throw new RangeError("Charset is empty.");
  const n = Math.min(1e4, Math.max(1, Math.floor(length)));
  let out = "";
  for (let i = 0; i < n; i++) out += pick(charset);
  return out;
}
function generatePassword(options) {
  const classes = [
    options.upper && CHARSETS.alpha.slice(0, 26),
    options.lower && CHARSETS.alpha.slice(26),
    options.digits && CHARSETS.digits,
    options.symbols && SYMBOLS
  ].filter((c) => typeof c === "string");
  if (classes.length === 0) return { error: "Enable at least one character type." };
  const length = Math.floor(options.length);
  if (length < classes.length) return { error: `Length must be at least ${classes.length} for these options.` };
  if (length > 256) return { error: "Length must be 256 or less." };
  const all = classes.join("");
  const chars = classes.map(pick);
  while (chars.length < length) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = (0, import_crypto3.randomInt)(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
function loremIpsum(words) {
  const n = Math.min(5e3, Math.max(1, Math.floor(words)));
  const out = [];
  for (let i = 0; i < n; i++) out.push(LOREM[i % LOREM.length]);
  const text2 = out.join(" ");
  return text2.charAt(0).toUpperCase() + text2.slice(1) + ".";
}
function sampleJson(spec, rows) {
  const fields = spec.split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
    const [name, type = "string"] = s.split(":").map((x) => x.trim());
    return { name, type };
  });
  const valid = ["int", "float", "string", "bool", "date", "uuid"];
  if (fields.length === 0) return { ok: false, message: "Describe at least one field, e.g. id:int, name:string." };
  const bad = fields.find((f) => !valid.includes(f.type) || !/^[A-Za-z_][\w]*$/.test(f.name));
  if (bad) return { ok: false, message: `Unsupported field "${bad.name}:${bad.type}". Types: ${valid.join(", ")}.` };
  const make = (type, i) => {
    switch (type) {
      case "int":
        return (0, import_crypto3.randomInt)(0, 1e4);
      case "float":
        return Number(((0, import_crypto3.randomInt)(0, 1e5) / 100).toFixed(2));
      case "bool":
        return (0, import_crypto3.randomInt)(2) === 1;
      case "date":
        return new Date(Date.UTC(2020, 0, 1) + (0, import_crypto3.randomInt)(0, 1500) * 864e5).toISOString().slice(0, 10);
      case "uuid":
        return (0, import_crypto3.randomUUID)();
      default:
        return randomString(8, CHARSETS.alpha) + i;
    }
  };
  const count = Math.min(1e3, Math.max(1, Math.floor(rows)));
  const data = Array.from(
    { length: count },
    (_, i) => Object.fromEntries(fields.map((f) => [f.name, make(f.type, i)]))
  );
  return { ok: true, text: JSON.stringify(data, null, 2) };
}
function sqlInserts(table, json) {
  if (isBlank(json)) return { ok: false, message: EMPTY_INPUT_MESSAGE };
  if (!/^[A-Za-z_][\w.]*$/.test(table)) return { ok: false, message: "Table name must be a simple identifier." };
  let rows;
  try {
    rows = JSON.parse(json);
  } catch (err) {
    return { ok: false, message: `Invalid JSON: ${err instanceof Error ? err.message : ""}` };
  }
  if (!Array.isArray(rows) || !rows.every((r) => typeof r === "object" && r !== null && !Array.isArray(r))) {
    return { ok: false, message: "JSON must be an array of objects." };
  }
  const columns = [];
  for (const r of rows)
    for (const k of Object.keys(r)) if (!columns.includes(k)) columns.push(k);
  if (columns.length === 0) return { ok: false, message: "Objects have no fields." };
  const literal = (v) => {
    if (v === null || v === void 0) return "NULL";
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
    const text2 = typeof v === "string" ? v : JSON.stringify(v);
    return `'${text2.replace(/'/g, "''")}'`;
  };
  const head = `INSERT INTO ${table} (${columns.join(", ")}) VALUES`;
  const lines = rows.map((r) => `  (${columns.map((c) => literal(r[c])).join(", ")})`);
  return { ok: true, text: lines.length ? `${head}
${lines.join(",\n")};` : "" };
}
var import_crypto3, pick, CHARSETS, SYMBOLS, LOREM;
var init_generators = __esm({
  "src/tools/generators/generators.ts"() {
    "use strict";
    init_parse();
    import_crypto3 = require("crypto");
    pick = (chars) => chars[(0, import_crypto3.randomInt)(chars.length)];
    CHARSETS = {
      alnum: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      digits: "0123456789",
      hex: "0123456789abcdef"
    };
    SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/";
    LOREM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident".split(" ");
  }
});

// src/tools/generators/ulid.ts
var ulid_exports = {};
__export(ulid_exports, {
  decodeUlidTime: () => decodeUlidTime,
  encodeUlid: () => encodeUlid,
  generateUlids: () => generateUlids
});
function encodeUlid(timeMs, random) {
  if (!Number.isInteger(timeMs) || timeMs < 0 || timeMs > 281474976710655) {
    throw new RangeError("Timestamp must be a whole number of milliseconds from 0 to 2^48-1.");
  }
  if (random.length !== 10) throw new RangeError("Randomness must be 10 bytes.");
  let out = "";
  let t = timeMs;
  const timeChars = [];
  for (let i = 0; i < 10; i++) {
    timeChars.unshift(ALPHABET[t % 32]);
    t = Math.floor(t / 32);
  }
  out += timeChars.join("");
  let bits = 0;
  let bitCount = 0;
  for (const byte of random) {
    bits = bits << 8 | byte;
    bitCount += 8;
    while (bitCount >= 5) {
      bitCount -= 5;
      out += ALPHABET[bits >> bitCount & 31];
    }
    bits &= (1 << bitCount) - 1;
  }
  return out;
}
function generateUlids(count, now = Date.now(), source2 = (n) => (0, import_crypto4.randomBytes)(n)) {
  const n = Math.min(100, Math.max(1, Math.floor(count)));
  return Array.from({ length: n }, () => encodeUlid(now, source2(10)));
}
function decodeUlidTime(ulid) {
  if (!/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(ulid)) return void 0;
  let t = 0;
  for (const ch of ulid.slice(0, 10).toUpperCase()) t = t * 32 + ALPHABET.indexOf(ch);
  return t;
}
var import_crypto4, ALPHABET;
var init_ulid = __esm({
  "src/tools/generators/ulid.ts"() {
    "use strict";
    import_crypto4 = require("crypto");
    ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  }
});

// src/tools/generators/generatorsTool.ts
var generatorsTool_exports = {};
__export(generatorsTool_exports, {
  run: () => run14,
  tool: () => tool14
});
async function output(text2, label) {
  await vscode14.env.clipboard.writeText(text2);
  const doc = await vscode14.workspace.openTextDocument({ content: text2, language: "plaintext" });
  await vscode14.window.showTextDocument(doc, { preview: true, viewColumn: vscode14.ViewColumn.Beside });
  void vscode14.window.showInformationMessage(`${label} copied to clipboard.`);
}
async function askNumber(prompt, fallback) {
  const v = await vscode14.window.showInputBox({
    prompt,
    value: fallback,
    validateInput: (x) => /^\d+$/.test(x) ? void 0 : "Enter a whole number"
  });
  return v === void 0 ? void 0 : Number(v);
}
async function randomStringFlow() {
  const length = await askNumber("Length", "24");
  if (length === void 0) return;
  const set = await vscode14.window.showQuickPick(
    [
      { label: "Letters and digits", value: CHARSETS.alnum },
      { label: "Letters only", value: CHARSETS.alpha },
      { label: "Digits only", value: CHARSETS.digits },
      { label: "Hex", value: CHARSETS.hex }
    ],
    { placeHolder: "Character set" }
  );
  if (!set) return;
  await output(randomString(length, set.value), "Random string");
}
async function passwordFlow() {
  const length = await askNumber("Password length", "16");
  if (length === void 0) return;
  const picks = await vscode14.window.showQuickPick(
    [
      { label: "Uppercase", picked: true },
      { label: "Lowercase", picked: true },
      { label: "Digits", picked: true },
      { label: "Symbols", picked: true }
    ],
    { canPickMany: true, placeHolder: "Character types" }
  );
  if (!picks) return;
  const has = (l) => picks.some((p) => p.label === l);
  const result = generatePassword({
    length,
    upper: has("Uppercase"),
    lower: has("Lowercase"),
    digits: has("Digits"),
    symbols: has("Symbols")
  });
  if (typeof result === "object") {
    void vscode14.window.showErrorMessage(result.error);
    return;
  }
  await output(result, "Password");
}
async function loremFlow() {
  const words = await askNumber("Number of words", "50");
  if (words === void 0) return;
  await output(loremIpsum(words), "Lorem Ipsum");
}
async function sampleJsonFlow() {
  const spec = await vscode14.window.showInputBox({
    prompt: "Fields as name:type (types: int, float, string, bool, date, uuid)",
    value: "id:int, name:string, active:bool, created:date"
  });
  if (!spec) return;
  const rows = await askNumber("Number of objects", "5");
  if (rows === void 0) return;
  const r = sampleJson(spec, rows);
  if (!r.ok) return void vscode14.window.showErrorMessage(r.message);
  await output(r.text, "Sample JSON");
}
async function ulidFlow() {
  const count = await askNumber("How many ULIDs?", "1");
  if (count === void 0) return;
  const { generateUlids: generateUlids2 } = await Promise.resolve().then(() => (init_ulid(), ulid_exports));
  await output(generateUlids2(count).join("\n"), "ULID");
}
async function sqlFlow() {
  const editor = vscode14.window.activeTextEditor;
  const source2 = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
  const json = source2 || await vscode14.window.showInputBox({ prompt: "JSON array of objects (or select it in the editor first)" });
  if (!json) return;
  const table = await vscode14.window.showInputBox({ prompt: "Table name", value: "my_table" });
  if (!table) return;
  const r = sqlInserts(table, json);
  if (!r.ok) return void vscode14.window.showErrorMessage(r.message);
  await output(r.text, "SQL INSERT");
}
async function run14() {
  const pick2 = await vscode14.window.showQuickPick(
    [
      { label: "Random string", run: randomStringFlow },
      { label: "Password", run: passwordFlow },
      { label: "Lorem Ipsum", run: loremFlow },
      { label: "Sample JSON", run: sampleJsonFlow },
      { label: "ULID (sortable unique ID)", run: ulidFlow },
      { label: "SQL INSERT from JSON", run: sqlFlow }
    ],
    { placeHolder: "Generator" }
  );
  if (pick2) await pick2.run();
}
var vscode14, tool14;
var init_generatorsTool = __esm({
  "src/tools/generators/generatorsTool.ts"() {
    "use strict";
    vscode14 = __toESM(require("vscode"));
    init_generators();
    tool14 = { run: run14 };
  }
});

// src/tools/developer/referencesTool.ts
var referencesTool_exports = {};
__export(referencesTool_exports, {
  run: () => run15,
  tool: () => tool15
});
async function showList(title, lines) {
  const doc = await vscode15.workspace.openTextDocument({
    content: `${title}

${lines.join("\n")}`,
    language: "plaintext"
  });
  await vscode15.window.showTextDocument(doc, { preview: true, viewColumn: vscode15.ViewColumn.Beside });
}
async function markdownPreview() {
  const editor = vscode15.window.activeTextEditor;
  const text2 = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : editor?.document.getText() ?? "";
  const doc = await vscode15.workspace.openTextDocument({ content: text2, language: "markdown" });
  await vscode15.commands.executeCommand("markdown.showPreviewToSide", doc.uri);
}
async function escapes() {
  const editor = vscode15.window.activeTextEditor;
  const text2 = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : await vscode15.window.showInputBox({ prompt: "Text to visualise" });
  if (text2 === void 0) return;
  await showList("Escape visualiser (char, code point, meaning)", [visualiseEscapes(text2)]);
}
async function httpStatus() {
  const pick2 = await vscode15.window.showQuickPick(
    HTTP_STATUS.map((s) => ({ label: `${s.code} ${s.name}`, description: s.meaning })),
    { placeHolder: "HTTP status codes", matchOnDescription: true }
  );
  if (!pick2) return;
  await showList(
    "HTTP status codes",
    HTTP_STATUS.map((s) => `${s.code}  ${s.name.padEnd(24)} ${s.meaning}`)
  );
}
async function mimeTypes() {
  await showList(
    "Common MIME types",
    MIME_TYPES.map((m) => `${m.ext.padEnd(8)} ${m.mime.padEnd(36)} ${m.use}`)
  );
}
async function run15() {
  await pickAction("Developer references", [
    { label: "XML: format and validate", run: () => runTransform("XML", (x) => formatXml(x), "xml") },
    { label: "Markdown preview", run: markdownPreview },
    { label: "Escape visualiser", run: escapes },
    { label: "HTTP status codes", run: httpStatus },
    { label: "MIME types", run: mimeTypes }
  ]);
}
var vscode15, tool15;
var init_referencesTool = __esm({
  "src/tools/developer/referencesTool.ts"() {
    "use strict";
    vscode15 = __toESM(require("vscode"));
    init_references();
    init_transform();
    tool15 = { run: run15 };
  }
});

// src/tools/developer/utilitiesTool.ts
var utilitiesTool_exports = {};
__export(utilitiesTool_exports, {
  run: () => run16,
  tool: () => tool16
});
async function show3(lines) {
  const doc = await vscode16.workspace.openTextDocument({ content: lines.join("\n"), language: "plaintext" });
  await vscode16.window.showTextDocument(doc, { preview: true, viewColumn: vscode16.ViewColumn.Beside });
}
async function cron() {
  const expr = await vscode16.window.showInputBox({ prompt: "Cron expression (5 fields)", value: "0 9 * * 1-5" });
  if (!expr) return;
  const runs = nextRuns(expr, /* @__PURE__ */ new Date(), 5);
  if (!runs.ok) return void vscode16.window.showErrorMessage(runs.message);
  await show3([
    `Expression: ${expr}`,
    `Meaning: ${describeCron(expr)}`,
    "Next runs (local time):",
    ...runs.runs.map((r) => `  ${r.toString()}`)
  ]);
}
async function permissions() {
  const input = await vscode16.window.showInputBox({ prompt: "Octal (755) or symbolic (rwxr-xr-x)" });
  if (!input) return;
  const octal = permsFromOctal(input.trim());
  if (octal.ok) return void await show3([`Octal: ${input.trim()}`, `Symbolic: ${octal.symbolic}`]);
  const sym = permsFromSymbolic(input.trim());
  if (sym.ok) return void await show3([`Symbolic: ${input.trim()}`, `Octal: ${sym.octal}`]);
  void vscode16.window.showErrorMessage("Enter an octal mode like 755 or a symbolic mode like rwxr-xr-x.");
}
async function colour() {
  const input = await vscode16.window.showInputBox({ prompt: "Colour as HEX, e.g. #1A2B3C" });
  if (!input) return;
  const rgb = hexToRgb(input);
  if (!rgb) return void vscode16.window.showErrorMessage("Enter a 3 or 6 digit hex colour.");
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  await show3([
    `HEX: ${rgbToHex(rgb.r, rgb.g, rgb.b)}`,
    `RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    `HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
  ]);
}
async function run16() {
  await pickAction("Developer utilities", [
    { label: "Cron helper", run: cron },
    { label: "Unix permissions", run: permissions },
    { label: "Colour converter (HEX to RGB/HSL)", run: colour },
    {
      label: "SQL formatter",
      run: () => runTransform("SQL format", (x) => ({ ok: true, text: formatSql(x) }), "sql")
    }
  ]);
}
var vscode16, tool16;
var init_utilitiesTool = __esm({
  "src/tools/developer/utilitiesTool.ts"() {
    "use strict";
    vscode16 = __toESM(require("vscode"));
    init_utilities();
    init_transform();
    tool16 = { run: run16 };
  }
});

// src/tools/developer/jwt.ts
function decodeSegment(segment) {
  const b64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
  const json = Buffer.from(padded, "base64").toString("utf8");
  const value = JSON.parse(json);
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("JWT segment is not a JSON object.");
  }
  return value;
}
function decodeJwt(token, now = /* @__PURE__ */ new Date()) {
  const parts = token.trim().replace(/^Bearer\s+/i, "").split(".");
  if (parts.length !== 3) return { ok: false, message: "A JWT has three dot-separated parts." };
  try {
    const header = decodeSegment(parts[0]);
    const payload = decodeSegment(parts[1]);
    const notes = ["Signature NOT verified. Decoding only shows what the token claims."];
    const nowSec = Math.floor(now.getTime() / 1e3);
    const exp = payload.exp;
    const nbf = payload.nbf;
    if (typeof exp === "number" && exp < nowSec) notes.push(`Expired at ${new Date(exp * 1e3).toISOString()}.`);
    if (typeof nbf === "number" && nbf > nowSec) notes.push(`Not valid before ${new Date(nbf * 1e3).toISOString()}.`);
    if (header.alg === "none") notes.push('Header uses alg "none": the token is unsigned.');
    return { ok: true, value: { header, payload, signature: parts[2], notes } };
  } catch (err) {
    return { ok: false, message: `Could not decode: ${err instanceof Error ? err.message : "invalid token."}` };
  }
}
function claimDates(payload) {
  const out = {};
  for (const key of ["iat", "nbf", "exp"]) {
    const v = payload[key];
    if (typeof v === "number") out[key] = new Date(v * 1e3).toISOString();
  }
  return out;
}
var init_jwt = __esm({
  "src/tools/developer/jwt.ts"() {
    "use strict";
  }
});

// src/tools/developer/jwtVerify.ts
var jwtVerify_exports = {};
__export(jwtVerify_exports, {
  verifyJwtHmac: () => verifyJwtHmac
});
function b64urlToBuffer(s) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64 + "=".repeat((4 - b64.length % 4) % 4), "base64");
}
function verifyJwtHmac(token, secret) {
  const parts = token.trim().replace(/^Bearer\s+/i, "").split(".");
  if (parts.length !== 3) return { ok: false, message: "A JWT has three dot-separated parts." };
  if (secret === "") return { ok: false, message: "Enter the secret to verify the signature." };
  let alg;
  try {
    alg = JSON.parse(b64urlToBuffer(parts[0]).toString("utf8")).alg;
  } catch {
    return { ok: false, message: "The header is not valid JSON." };
  }
  if (typeof alg !== "string") return { ok: false, message: "The header has no alg field." };
  const digest = HMAC[alg];
  if (!digest) {
    return {
      ok: false,
      message: alg === "none" ? 'This token is unsigned (alg "none"), so there is nothing to verify.' : `Only HMAC algorithms (HS256, HS384, HS512) can be checked with a secret. This token uses ${alg}.`
    };
  }
  const expected = (0, import_crypto5.createHmac)(digest, secret).update(`${parts[0]}.${parts[1]}`, "utf8").digest();
  const actual = b64urlToBuffer(parts[2]);
  const valid = expected.length === actual.length && (0, import_crypto5.timingSafeEqual)(expected, actual);
  return {
    ok: true,
    valid,
    alg,
    message: valid ? `Signature is valid (${alg}).` : `Signature does NOT match this secret (${alg}).`
  };
}
var import_crypto5, HMAC;
var init_jwtVerify = __esm({
  "src/tools/developer/jwtVerify.ts"() {
    "use strict";
    import_crypto5 = require("crypto");
    HMAC = { HS256: "sha256", HS384: "sha384", HS512: "sha512" };
  }
});

// src/tools/developer/jwtTool.ts
var jwtTool_exports = {};
__export(jwtTool_exports, {
  run: () => run17,
  tool: () => tool17
});
async function run17() {
  const editor = vscode17.window.activeTextEditor;
  const selected = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
  const token = selected || await vscode17.window.showInputBox({ prompt: "Paste a JWT (decoded locally, signature not verified)" });
  if (!token) return;
  const r = decodeJwt(token);
  if (!r.ok) {
    void vscode17.window.showErrorMessage(r.message);
    return;
  }
  let verification = [];
  const choice = await vscode17.window.showQuickPick(["Skip verification", "Verify with a secret (HMAC)"], {
    placeHolder: "Verify the signature too?"
  });
  if (choice?.startsWith("Verify")) {
    const secret = await vscode17.window.showInputBox({
      prompt: "Secret (used once for this check, not saved)",
      password: true
    });
    if (secret) {
      const { verifyJwtHmac: verifyJwtHmac2 } = await Promise.resolve().then(() => (init_jwtVerify(), jwtVerify_exports));
      const v = verifyJwtHmac2(token, secret);
      verification = ["== Signature check ==", v.ok ? (v.valid ? "\u2714 " : "\u2718 ") + v.message : `! ${v.message}`, ""];
    }
  }
  const lines = [
    ...verification,
    "== Notes ==",
    ...r.value.notes.map((n) => `! ${n}`),
    "",
    "== Header ==",
    JSON.stringify(r.value.header, null, 2),
    "",
    "== Payload ==",
    JSON.stringify(r.value.payload, null, 2),
    "",
    "== Time claims (UTC) ==",
    ...Object.entries(claimDates(r.value.payload)).map(([k, v]) => `${k}: ${v}`),
    "",
    "== Signature (not verified) ==",
    r.value.signature
  ];
  const doc = await vscode17.workspace.openTextDocument({ content: lines.join("\n"), language: "json" });
  await vscode17.window.showTextDocument(doc, { preview: true, viewColumn: vscode17.ViewColumn.Beside });
}
var vscode17, tool17;
var init_jwtTool = __esm({
  "src/tools/developer/jwtTool.ts"() {
    "use strict";
    vscode17 = __toESM(require("vscode"));
    init_jwt();
    tool17 = { run: run17 };
  }
});

// src/tools/encoding/timestamps.ts
function timestampToDate(input) {
  const trimmed = input.trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return { ok: false, message: "Enter a number of seconds or milliseconds." };
  const n = Number(trimmed);
  const unit = Math.abs(n) >= MS_THRESHOLD ? "milliseconds" : "seconds";
  const date = new Date(unit === "milliseconds" ? n : n * 1e3);
  if (Number.isNaN(date.getTime())) return { ok: false, message: "Timestamp is out of range." };
  return { ok: true, value: { date, unit } };
}
function dateToTimestamp(input) {
  const ms = Date.parse(input.trim());
  if (Number.isNaN(ms))
    return { ok: false, message: "Could not parse that date. Try ISO 8601, e.g. 2026-11-14T10:30:00Z." };
  return { ok: true, value: { seconds: Math.floor(ms / 1e3), milliseconds: ms } };
}
function formatUtc(date) {
  const iso = date.toISOString();
  return { iso, readable: `${iso.slice(0, 10)} ${iso.slice(11, 19)} UTC` };
}
function formatInZone(date, timeZone) {
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
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")} (${timeZone})`;
}
var MS_THRESHOLD;
var init_timestamps = __esm({
  "src/tools/encoding/timestamps.ts"() {
    "use strict";
    MS_THRESHOLD = 1e11;
  }
});

// src/tools/encoding/timestampsTool.ts
var timestampsTool_exports = {};
__export(timestampsTool_exports, {
  run: () => run18,
  tool: () => tool18
});
async function inputOrSelection(prompt) {
  const editor = vscode18.window.activeTextEditor;
  if (editor && !editor.selection.isEmpty) return editor.document.getText(editor.selection);
  return vscode18.window.showInputBox({ prompt });
}
async function showResult(lines) {
  const doc = await vscode18.workspace.openTextDocument({ content: lines.join("\n"), language: "plaintext" });
  await vscode18.window.showTextDocument(doc, { preview: true, viewColumn: vscode18.ViewColumn.Beside });
}
async function run18() {
  const pick2 = await vscode18.window.showQuickPick(
    [
      { label: "Timestamp to date", id: "toDate" },
      { label: "Date to timestamp", id: "toTs" },
      { label: "Current time", id: "now" }
    ],
    { placeHolder: "Timestamp converter" }
  );
  if (!pick2) return;
  if (pick2.id === "now") {
    const now = /* @__PURE__ */ new Date();
    await showResult([
      `Seconds: ${Math.floor(now.getTime() / 1e3)}`,
      `Milliseconds: ${now.getTime()}`,
      `UTC: ${formatUtc(now).readable}`,
      `Local: ${formatInZone(now, Intl.DateTimeFormat().resolvedOptions().timeZone)}`
    ]);
    return;
  }
  const input = await inputOrSelection(
    pick2.id === "toDate" ? "Unix seconds or milliseconds" : "Date (ISO 8601 recommended)"
  );
  if (input === void 0) return;
  if (pick2.id === "toDate") {
    const r = timestampToDate(input);
    if (!r.ok) return void vscode18.window.showErrorMessage(r.message);
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const f = formatUtc(r.value.date);
    await showResult([
      `Input unit: ${r.value.unit}`,
      `ISO 8601: ${f.iso}`,
      `UTC: ${f.readable}`,
      `Local: ${formatInZone(r.value.date, zone)}`
    ]);
  } else {
    const r = dateToTimestamp(input);
    if (!r.ok) return void vscode18.window.showErrorMessage(r.message);
    await showResult([`Seconds: ${r.value.seconds}`, `Milliseconds: ${r.value.milliseconds}`]);
  }
}
var vscode18, tool18;
var init_timestampsTool = __esm({
  "src/tools/encoding/timestampsTool.ts"() {
    "use strict";
    vscode18 = __toESM(require("vscode"));
    init_timestamps();
    tool18 = { run: run18 };
  }
});

// src/tools/json/utilitiesTool.ts
var utilitiesTool_exports2 = {};
__export(utilitiesTool_exports2, {
  run: () => run19,
  tool: () => tool19
});
async function run19() {
  await pickAction("JSON utilities", [
    { label: "JSON to CSV", run: () => runTransform("JSON to CSV", jsonToCsv, "csv") },
    { label: "CSV to JSON", run: () => runTransform("CSV to JSON", csvToJson, "json") },
    {
      label: "JSONPath extract",
      run: async () => {
        const path = await vscode19.window.showInputBox({ prompt: "JSONPath, e.g. $.users[*].name" });
        if (!path) return;
        await runTransform("JSONPath", (x) => jsonPath(x, path), "json");
      }
    },
    {
      label: "Escape as JSON string",
      run: () => runTransform("Escape", (x) => ({ ok: true, text: escapeJsonString(x) }))
    },
    { label: "Unescape JSON string", run: () => runTransform("Unescape", unescapeJsonString) }
  ]);
}
var vscode19, tool19;
var init_utilitiesTool2 = __esm({
  "src/tools/json/utilitiesTool.ts"() {
    "use strict";
    vscode19 = __toESM(require("vscode"));
    init_transform();
    init_utilities2();
    tool19 = { run: run19 };
  }
});

// src/workbench/transforms.ts
function findTransform(id) {
  return TRANSFORMS.find((t) => t.id === id);
}
function runTransform2(id, input) {
  const t = findTransform(id);
  if (!t) return { ok: false, message: `Unknown transform: ${id}` };
  if (input.length > MAX_OUTPUT_CHARS)
    return { ok: false, message: "Input is too large for the workbench (over 2 million characters)." };
  try {
    return t.run(input);
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Transform failed." };
  }
}
var plain, TRANSFORMS, MAX_OUTPUT_CHARS;
var init_transforms = __esm({
  "src/workbench/transforms.ts"() {
    "use strict";
    init_base64();
    init_url();
    init_conversion();
    init_format();
    init_utilities2();
    init_utilities();
    init_references();
    init_textUtils();
    init_hash();
    plain = (fn) => (x) => ({ ok: true, text: fn(x) });
    TRANSFORMS = [
      { id: "base64-encode", label: "Base64 encode", group: "Encode", run: base64Encode },
      { id: "base64-decode", label: "Base64 decode", group: "Encode", run: base64Decode },
      { id: "url-encode", label: "URL encode (component)", group: "Encode", run: (x) => urlEncode(x, "component") },
      { id: "url-decode", label: "URL decode", group: "Encode", run: (x) => urlDecode(x) },
      { id: "html-encode", label: "HTML entities encode", group: "Encode", run: htmlEncode },
      { id: "html-decode", label: "HTML entities decode", group: "Encode", run: htmlDecode },
      { id: "hex-encode", label: "Text to hex", group: "Encode", run: textToHex },
      { id: "hex-decode", label: "Hex to text", group: "Encode", run: hexToText },
      { id: "json-format", label: "JSON format", group: "Format", run: (x) => formatJson(x) },
      { id: "json-minify", label: "JSON minify", group: "Format", run: (x) => minifyJson(x) },
      {
        id: "json-validate",
        label: "JSON validate",
        group: "Format",
        run: (x) => {
          const r = validateJson(x);
          return r.ok ? { ok: true, text: "Valid JSON." } : { ok: false, message: r.message };
        }
      },
      { id: "sql-format", label: "SQL format", group: "Format", run: plain(formatSql) },
      { id: "xml-format", label: "XML format and validate", group: "Format", run: (x) => formatXml(x) },
      { id: "sort-lines", label: "Sort lines", group: "Text", run: plain((x) => sortLines(x)) },
      { id: "reverse-lines", label: "Reverse lines", group: "Text", run: plain(reverseLines) },
      { id: "dedupe-lines", label: "Remove duplicate lines", group: "Text", run: plain((x) => removeDuplicateLines(x)) },
      { id: "trim-lines", label: "Trim each line", group: "Text", run: plain(trimLines) },
      { id: "remove-empty-lines", label: "Remove empty lines", group: "Text", run: plain(removeEmptyLines) },
      { id: "uppercase", label: "Uppercase", group: "Text", run: plain((x) => x.toUpperCase()) },
      { id: "lowercase", label: "Lowercase", group: "Text", run: plain((x) => x.toLowerCase()) },
      { id: "sha256", label: "SHA-256", group: "Hash", run: plain((x) => hashText(x, "sha256")) },
      { id: "md5", label: "MD5", group: "Hash", run: plain((x) => hashText(x, "md5")) },
      { id: "sha512", label: "SHA-512", group: "Hash", run: plain((x) => hashText(x, "sha512")) },
      { id: "json-escape", label: "Escape as JSON string", group: "Escape", run: plain(escapeJsonString) },
      { id: "json-unescape", label: "Unescape JSON string", group: "Escape", run: (x) => unescapeJsonString(x) },
      {
        id: "count",
        label: "Count characters, words and lines",
        group: "Inspect",
        run: plain((x) => {
          const s = countStats(x);
          return `Characters: ${s.characters}
Words: ${s.words}
Lines: ${s.lines}`;
        })
      }
    ];
    MAX_OUTPUT_CHARS = 2e6;
  }
});

// src/workbench/html.ts
function jsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
function buildWorkbenchHtml(o) {
  const groups = [...new Set(o.transforms.map((t) => t.group))];
  const options = groups.map((g) => {
    const items = o.transforms.filter((t) => t.group === g).map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.label)}</option>`).join("");
    return `<optgroup label="${escapeHtml(g)}">${items}</optgroup>`;
  }).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${o.cspSource} 'nonce-${o.nonce}'; script-src 'nonce-${o.nonce}';">
<title>Dev Tool Workbench</title>
<style nonce="${o.nonce}">
  :root { color-scheme: light dark; }
  body {
    margin: 0; padding: 12px 16px 16px;
    font-family: var(--vscode-font-family); font-size: var(--vscode-font-size);
    color: var(--vscode-foreground); background: var(--vscode-editor-background);
  }
  header { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
  h1 { font-size: 1.05em; font-weight: 600; margin: 0 auto 0 0; }
  select, button, textarea {
    font: inherit; border-radius: 3px;
  }
  select {
    min-width: 220px; padding: 4px 6px;
    color: var(--vscode-dropdown-foreground); background: var(--vscode-dropdown-background);
    border: 1px solid var(--vscode-dropdown-border);
  }
  button {
    padding: 4px 12px; cursor: pointer; border: 1px solid transparent;
    color: var(--vscode-button-foreground); background: var(--vscode-button-background);
  }
  button:hover { background: var(--vscode-button-hoverBackground); }
  button.secondary {
    color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground);
  }
  button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
  button:focus-visible, select:focus-visible, textarea:focus-visible {
    outline: 1px solid var(--vscode-focusBorder); outline-offset: 2px;
  }
  .panes { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 640px) { .panes { grid-template-columns: 1fr; } }
  .pane { display: flex; flex-direction: column; min-width: 0; }
  .pane-title {
    display: flex; justify-content: space-between; align-items: baseline;
    font-size: 0.9em; color: var(--vscode-descriptionForeground); margin-bottom: 4px;
  }
  textarea, pre {
    flex: 1; min-height: 320px; margin: 0; padding: 8px; box-sizing: border-box;
    font-family: var(--vscode-editor-font-family); font-size: var(--vscode-editor-font-size);
    color: var(--vscode-input-foreground); background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, transparent);
    white-space: pre-wrap; word-break: break-word; overflow: auto;
  }
  textarea { resize: vertical; }
  pre.output { color: var(--vscode-editor-foreground); }
  pre.output.error { color: var(--vscode-errorForeground); }
  .status { min-height: 1.4em; margin-top: 8px; font-size: 0.9em; color: var(--vscode-descriptionForeground); }
  .status.error { color: var(--vscode-errorForeground); }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .hint { color: var(--vscode-descriptionForeground); font-size: 0.85em; }
</style>
</head>
<body>
<header>
  <h1>Dev Tool Workbench</h1>
  <label for="tool" class="hint">Tool</label>
  <select id="tool" aria-label="Tool">${options}</select>
  <button id="swap" class="secondary" type="button" title="Move output into input">Swap</button>
  <button id="clear" class="secondary" type="button">Clear</button>
</header>

<div class="panes">
  <section class="pane" aria-labelledby="in-title">
    <div class="pane-title"><span id="in-title">Input</span><span class="hint" id="in-count">0 chars</span></div>
    <textarea id="input" spellcheck="false" aria-describedby="hint" placeholder="Paste or type text here. Output updates as you type."></textarea>
  </section>
  <section class="pane" aria-labelledby="out-title">
    <div class="pane-title"><span id="out-title">Output</span><span class="hint" id="out-count"></span></div>
    <pre id="output" class="output" aria-live="polite" tabindex="0"></pre>
  </section>
</div>

<div class="actions">
  <button id="copy" type="button">Copy output</button>
  <button id="replace" class="secondary" type="button">Replace selection in editor</button>
</div>
<div id="status" class="status" role="status"></div>
<p id="hint" class="hint">Tip: pick a tool, then type or paste. Replacing changes the editor only when you click the button.</p>

<script nonce="${o.nonce}">
(function () {
  var vscode = acquireVsCodeApi();
  var tool = document.getElementById('tool');
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var status = document.getElementById('status');
  var inCount = document.getElementById('in-count');
  var outCount = document.getElementById('out-count');
  var latest = { ok: true, text: '' };
  var timer = null;

  function setStatus(message, isError) {
    status.textContent = message || '';
    status.className = 'status' + (isError ? ' error' : '');
  }

  function render(result) {
    latest = result;
    if (result.ok) {
      output.textContent = result.text;
      output.className = 'output';
      outCount.textContent = result.text ? result.text.length + ' chars' : '';
      setStatus('');
    } else {
      output.textContent = '';
      output.className = 'output error';
      outCount.textContent = '';
      setStatus(result.message, true);
    }
  }

  function request() {
    inCount.textContent = input.value.length + ' chars';
    clearTimeout(timer);
    timer = setTimeout(function () {
      vscode.postMessage({ type: 'transform', id: tool.value, input: input.value });
    }, 150);
  }

  input.addEventListener('input', request);
  tool.addEventListener('change', request);

  document.getElementById('swap').addEventListener('click', function () {
    if (!latest.ok) { setStatus('Nothing to swap: the output is an error.', true); return; }
    input.value = latest.text;
    request();
  });

  document.getElementById('clear').addEventListener('click', function () {
    input.value = '';
    request();
    input.focus();
  });

  document.getElementById('copy').addEventListener('click', function () {
    if (!latest.ok || !latest.text) { setStatus('Nothing to copy yet.', true); return; }
    vscode.postMessage({ type: 'copy', text: latest.text });
  });

  document.getElementById('replace').addEventListener('click', function () {
    if (!latest.ok) { setStatus('Fix the error before replacing.', true); return; }
    vscode.postMessage({ type: 'replace', text: latest.text });
  });

  window.addEventListener('message', function (event) {
    var msg = event.data;
    if (msg.type === 'result') render(msg.result);
    if (msg.type === 'status') setStatus(msg.message, !!msg.error);
    if (msg.type === 'init') { input.value = msg.input; request(); }
  });

  // Initial state from the extension.
  input.value = ${jsonForScript(o.initialInput)};
  inCount.textContent = input.value.length + ' chars';
  request();
  input.focus();
})();
</script>
</body>
</html>`;
}
var escapeHtml;
var init_html = __esm({
  "src/workbench/html.ts"() {
    "use strict";
    escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
});

// src/ui/workbench.ts
var workbench_exports = {};
__export(workbench_exports, {
  openWorkbench: () => openWorkbench
});
function selectedText(editor) {
  return editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
}
function nonce() {
  return (0, import_crypto6.randomBytes)(16).toString("base64");
}
async function onMessage(msg) {
  if (!panel) return;
  switch (msg.type) {
    case "transform": {
      const result = runTransform2(msg.id ?? "", msg.input ?? "");
      void panel.webview.postMessage({ type: "result", result });
      return;
    }
    case "copy": {
      await vscode20.env.clipboard.writeText(msg.text ?? "");
      void panel.webview.postMessage({ type: "status", message: "Copied to clipboard." });
      return;
    }
    case "replace": {
      const editor = target && vscode20.window.visibleTextEditors.includes(target) ? target : void 0;
      if (!editor || editor.selection.isEmpty) {
        void panel.webview.postMessage({
          type: "status",
          message: "Select text in an editor first, then open the Workbench from that editor to replace it.",
          error: true
        });
        return;
      }
      const ok = await editor.edit((b) => b.replace(editor.selection, msg.text ?? ""));
      void panel.webview.postMessage({
        type: "status",
        message: ok ? "Selection replaced." : "The editor did not accept the change.",
        error: !ok
      });
      return;
    }
  }
}
function openWorkbench(context) {
  const active = vscode20.window.activeTextEditor;
  target = active;
  const seed = selectedText(active);
  if (panel) {
    panel.reveal(vscode20.ViewColumn.Beside, true);
    void panel.webview.postMessage({ type: "init", input: seed });
    return;
  }
  panel = vscode20.window.createWebviewPanel("devtool.workbench", "Dev Tool Workbench", vscode20.ViewColumn.Beside, {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: []
  });
  const n = nonce();
  panel.webview.html = buildWorkbenchHtml({
    nonce: n,
    cspSource: panel.webview.cspSource,
    transforms: TRANSFORMS.map((t) => ({ id: t.id, label: t.label, group: t.group })),
    initialInput: seed
  });
  panel.webview.onDidReceiveMessage((msg) => void onMessage(msg), void 0, context.subscriptions);
  panel.onDidDispose(
    () => {
      panel = void 0;
      target = void 0;
    },
    void 0,
    context.subscriptions
  );
}
var vscode20, import_crypto6, panel, target;
var init_workbench = __esm({
  "src/ui/workbench.ts"() {
    "use strict";
    vscode20 = __toESM(require("vscode"));
    import_crypto6 = require("crypto");
    init_transforms();
    init_html();
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode21 = __toESM(require("vscode"));

// src/views/toolTree.ts
var vscode = __toESM(require("vscode"));

// src/tools/registry.ts
var CATEGORIES = [
  { id: "text-diff", label: "Text & Diff" },
  { id: "regex", label: "Regex" },
  { id: "json-data", label: "JSON & Data" },
  { id: "encoding", label: "Encoding & Conversion" },
  { id: "generators", label: "Generators" },
  { id: "developer", label: "Developer Utilities" }
];
var TOOLS = [
  {
    id: "text-diff",
    label: "Text Diff Comparator",
    category: "text-diff",
    description: "Compare two texts side by side"
  },
  {
    id: "quick-diff",
    label: "Quick Diff",
    category: "text-diff",
    description: "Diff selection vs clipboard, blocks or files"
  },
  {
    id: "text-utilities",
    label: "Text Utilities",
    category: "text-diff",
    description: "Dedupe, sort, trim, find/replace and more"
  },
  {
    id: "regex-playground",
    label: "Regex Playground",
    category: "regex",
    description: "Live matches, groups and replace preview"
  },
  { id: "regex-library", label: "Regex Library", category: "regex", description: "Common ready-to-use patterns" },
  {
    id: "json-format",
    label: "JSON Formatter",
    category: "json-data",
    description: "Format, minify and validate JSON"
  },
  { id: "json-compare", label: "JSON Comparator", category: "json-data", description: "Compare two JSON documents" },
  {
    id: "json-to-ts",
    label: "JSON to TypeScript",
    category: "json-data",
    description: "Generate interfaces from JSON"
  },
  { id: "json-utilities", label: "JSON Utilities", category: "json-data", description: "JSON/CSV, JSONPath, escape" },
  { id: "base64", label: "Base64", category: "encoding", description: "Encode and decode Base64" },
  { id: "url-encode", label: "URL Encode/Decode", category: "encoding", description: "Percent-encoding" },
  {
    id: "encoding-conversion",
    label: "Encoding & Conversion",
    category: "encoding",
    description: "HTML entities, Unicode, hex, binary, string escapes"
  },
  { id: "timestamps", label: "Timestamp Converter", category: "encoding", description: "Unix time and dates" },
  { id: "uuid", label: "UUID v4 Generator", category: "generators", description: "Random UUIDs" },
  {
    id: "generators",
    label: "Generators",
    category: "generators",
    description: "Random strings, passwords, Lorem Ipsum, sample JSON, SQL INSERT"
  },
  { id: "hash", label: "Hash Generator", category: "generators", description: "MD5, SHA-1, SHA-256, SHA-512" },
  {
    id: "developer-utilities",
    label: "Cron, Permissions, Colour, SQL",
    category: "developer",
    description: "Cron helper, Unix permissions, colour converter, SQL formatter"
  },
  {
    id: "developer-references",
    label: "References and XML",
    category: "developer",
    description: "XML format and validate, Markdown preview, escape visualiser, HTTP status, MIME types"
  },
  {
    id: "jwt-decode",
    label: "JWT Decoder",
    category: "developer",
    description: "Decode header and payload (no signature check)"
  }
];

// src/views/icons.ts
var CATEGORY_ICONS = {
  "text-diff": "diff",
  regex: "regex",
  "json-data": "file-code",
  encoding: "arrow-swap",
  generators: "wand",
  developer: "terminal"
};
var TOOL_ICONS = {
  "text-diff": "diff",
  "quick-diff": "git-compare",
  "text-utilities": "list-unordered",
  "regex-playground": "play",
  "regex-library": "book",
  "json-format": "file-code",
  "json-compare": "git-compare",
  "json-to-ts": "symbol-interface",
  "json-utilities": "table",
  base64: "lock",
  "url-encode": "link",
  "encoding-conversion": "symbol-key",
  timestamps: "clock",
  uuid: "key",
  hash: "shield",
  generators: "wand",
  "developer-utilities": "tools",
  "developer-references": "book",
  "jwt-decode": "verified"
};

// src/views/toolTree.ts
var ToolTreeProvider = class {
  constructor(state2) {
    this.state = state2;
  }
  state;
  changed = new vscode.EventEmitter();
  onDidChangeTreeData = this.changed.event;
  getTreeItem(node) {
    if (node.kind === "section") {
      const icon = node.id === "favorites" ? "star-full" : "history";
      const item2 = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.Expanded);
      item2.iconPath = new vscode.ThemeIcon(icon);
      item2.description = `${node.count}`;
      item2.contextValue = "devtool.section";
      return item2;
    }
    if (node.kind === "category") {
      const item2 = new vscode.TreeItem(node.label, vscode.TreeItemCollapsibleState.Expanded);
      item2.iconPath = new vscode.ThemeIcon(CATEGORY_ICONS[node.id]);
      item2.description = `${node.count} ${node.count === 1 ? "tool" : "tools"}`;
      item2.contextValue = "devtool.category";
      return item2;
    }
    const favorite = this.state.isFavorite(node.tool.id);
    const item = new vscode.TreeItem(node.tool.label, vscode.TreeItemCollapsibleState.None);
    item.description = favorite ? `\u2605 ${node.tool.description}` : node.tool.description;
    item.iconPath = new vscode.ThemeIcon(TOOL_ICONS[node.tool.id] ?? "symbol-misc");
    const tip = new vscode.MarkdownString(void 0, true);
    tip.appendMarkdown(`**${node.tool.label}**

${node.tool.description}

`);
    tip.appendMarkdown(
      favorite ? "\u2605 Favourite. Use *Toggle Favorite* to remove.\n\n" : "Click to open. Use the star to pin it."
    );
    item.tooltip = tip;
    item.accessibilityInformation = {
      label: `${node.tool.label}. ${node.tool.description}.${favorite ? " Favourite." : ""}`,
      role: "button"
    };
    item.contextValue = favorite ? "devtool.tool.favorite" : "devtool.tool";
    item.command = { command: "devtool.openTool", title: "Open Tool", arguments: [node.tool.id] };
    return item;
  }
  getChildren(node) {
    if (!node) {
      const sections = [];
      const favorites = this.toolsFor(this.state.getFavorites());
      if (favorites.length > 0) {
        sections.push({ kind: "section", id: "favorites", label: "Favourites", count: favorites.length });
      }
      const recent = this.toolsFor(this.state.getRecent());
      if (recent.length > 0) {
        sections.push({ kind: "section", id: "recent", label: "Recently Used", count: recent.length });
      }
      const categories = CATEGORIES.map((c) => ({
        kind: "category",
        id: c.id,
        label: c.label,
        count: TOOLS.filter((t) => t.category === c.id).length
      }));
      return [...sections, ...categories];
    }
    if (node.kind === "section") {
      const ids = node.id === "favorites" ? this.state.getFavorites() : this.state.getRecent();
      return this.toolsFor(ids).map((tool20) => ({ kind: "tool", tool: tool20 }));
    }
    if (node.kind === "category") {
      return TOOLS.filter((t) => t.category === node.id).map((tool20) => ({ kind: "tool", tool: tool20 }));
    }
    return [];
  }
  refresh() {
    this.changed.fire(void 0);
  }
  dispose() {
    this.changed.dispose();
  }
  toolsFor(ids) {
    return ids.map((id) => TOOLS.find((t) => t.id === id)).filter((t) => t !== void 0);
  }
};

// src/views/searchTools.ts
var vscode2 = __toESM(require("vscode"));
function filterTools(query, tools = TOOLS) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return [...tools];
  }
  return tools.filter((tool20) => {
    const category = CATEGORIES.find((c) => c.id === tool20.category)?.label ?? "";
    const haystack = `${tool20.label} ${tool20.description} ${category}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
async function searchTools() {
  const picker = vscode2.window.createQuickPick();
  picker.placeholder = "Search Dev Tool utilities";
  picker.matchOnDescription = true;
  const toItems = (query) => filterTools(query).map((tool20) => ({
    label: tool20.label,
    description: CATEGORIES.find((c) => c.id === tool20.category)?.label,
    detail: tool20.description,
    toolId: tool20.id
  }));
  picker.items = toItems("");
  picker.onDidChangeValue((value) => {
    picker.items = toItems(value);
  });
  return new Promise((resolve) => {
    picker.onDidAccept(() => {
      const selected = picker.selectedItems[0];
      resolve(selected?.toolId);
      picker.hide();
    });
    picker.onDidHide(() => {
      resolve(void 0);
      picker.dispose();
    });
    picker.show();
  });
}

// src/state/toolState.ts
var FAVORITES_KEY = "devtool.favorites";
var RECENT_KEY = "devtool.recent";
var MAX_RECENT = 5;
var ToolState = class {
  constructor(store) {
    this.store = store;
  }
  store;
  getFavorites() {
    return this.store.get(FAVORITES_KEY, []);
  }
  isFavorite(toolId) {
    return this.getFavorites().includes(toolId);
  }
  toggleFavorite(toolId) {
    const current = this.getFavorites();
    const next = current.includes(toolId) ? current.filter((id) => id !== toolId) : [...current, toolId];
    return this.store.update(FAVORITES_KEY, next);
  }
  getRecent() {
    return this.store.get(RECENT_KEY, []);
  }
  // Clears favourites and recent tools. Used by the "Clear Favourites and Recent Tools" command.
  async reset() {
    await this.store.update(FAVORITES_KEY, []);
    await this.store.update(RECENT_KEY, []);
  }
  markUsed(toolId) {
    const next = [toolId, ...this.getRecent().filter((id) => id !== toolId)].slice(0, MAX_RECENT);
    return this.store.update(RECENT_KEY, next);
  }
};

// src/tools/loader.ts
var loaders = /* @__PURE__ */ new Map();
var cache = /* @__PURE__ */ new Map();
function registerTool(toolId, loader) {
  loaders.set(toolId, loader);
}
function loadTool(toolId) {
  const loader = loaders.get(toolId);
  if (!loader) {
    return void 0;
  }
  let pending = cache.get(toolId);
  if (!pending) {
    pending = loader();
    cache.set(toolId, pending);
    pending.catch(() => cache.delete(toolId));
  }
  return pending;
}

// src/ui/contextActions.ts
var vscode6 = __toESM(require("vscode"));
init_transform();
var text = (fn) => (x) => ({ ok: true, text: fn(x) });
var contextActions = {
  // Encode and decode
  base64Encode: async () => {
    const m = await Promise.resolve().then(() => (init_base64(), base64_exports));
    await runTransform("Base64 encode", m.base64Encode);
  },
  base64Decode: async () => {
    const m = await Promise.resolve().then(() => (init_base64(), base64_exports));
    await runTransform("Base64 decode", m.base64Decode);
  },
  urlEncodeComponent: async () => {
    const m = await Promise.resolve().then(() => (init_url(), url_exports));
    await runTransform("URL encode", (x) => m.urlEncode(x, "component"));
  },
  urlDecode: async () => {
    const m = await Promise.resolve().then(() => (init_url(), url_exports));
    await runTransform("URL decode", (x) => m.urlDecode(x));
  },
  htmlEncode: async () => {
    const m = await Promise.resolve().then(() => (init_conversion(), conversion_exports));
    await runTransform("HTML encode", m.htmlEncode, "html");
  },
  htmlDecode: async () => {
    const m = await Promise.resolve().then(() => (init_conversion(), conversion_exports));
    await runTransform("HTML decode", m.htmlDecode, "html");
  },
  textToHex: async () => {
    const m = await Promise.resolve().then(() => (init_conversion(), conversion_exports));
    await runTransform("Text to hex", m.textToHex);
  },
  hexToText: async () => {
    const m = await Promise.resolve().then(() => (init_conversion(), conversion_exports));
    await runTransform("Hex to text", m.hexToText);
  },
  // Format
  formatJson: async () => {
    const m = await Promise.resolve().then(() => (init_format(), format_exports));
    await runTransform("Format JSON", (x) => m.formatJson(x), "json");
  },
  minifyJson: async () => {
    const m = await Promise.resolve().then(() => (init_format(), format_exports));
    await runTransform("Minify JSON", (x) => m.minifyJson(x), "json");
  },
  formatSql: async () => {
    const m = await Promise.resolve().then(() => (init_utilities(), utilities_exports));
    await runTransform("Format SQL", text(m.formatSql), "sql");
  },
  formatXml: async () => {
    const m = await Promise.resolve().then(() => (init_references(), references_exports));
    await runTransform("Format XML", (x) => m.formatXml(x), "xml");
  },
  // Text
  sortLines: async () => {
    const m = await Promise.resolve().then(() => (init_textUtils(), textUtils_exports));
    await runTransform(
      "Sort lines",
      text((x) => m.sortLines(x))
    );
  },
  dedupeLines: async () => {
    const m = await Promise.resolve().then(() => (init_textUtils(), textUtils_exports));
    await runTransform("Remove duplicate lines", text(m.removeDuplicateLines));
  },
  trimLines: async () => {
    const m = await Promise.resolve().then(() => (init_textUtils(), textUtils_exports));
    await runTransform("Trim lines", text(m.trimLines));
  },
  removeEmptyLines: async () => {
    const m = await Promise.resolve().then(() => (init_textUtils(), textUtils_exports));
    await runTransform("Remove empty lines", text(m.removeEmptyLines));
  },
  uppercase: async () => runTransform("Uppercase", (x) => ({ ok: true, text: x.toUpperCase() })),
  lowercase: async () => runTransform("Lowercase", (x) => ({ ok: true, text: x.toLowerCase() })),
  countStats: async () => {
    const editor = vscode6.window.activeTextEditor;
    const selected = editor && !editor.selection.isEmpty ? editor.document.getText(editor.selection) : "";
    const m = await Promise.resolve().then(() => (init_textUtils(), textUtils_exports));
    const s = m.countStats(selected);
    void vscode6.window.showInformationMessage(
      `Selection: ${s.characters} characters, ${s.words} words, ${s.lines} lines.`
    );
  },
  // Hashes
  sha256: async () => {
    const m = await Promise.resolve().then(() => (init_hash(), hash_exports));
    await runTransform("SHA-256", (x) => ({ ok: true, text: m.hashText(x, "sha256") }));
  },
  md5: async () => {
    const m = await Promise.resolve().then(() => (init_hash(), hash_exports));
    await runTransform("MD5", (x) => ({ ok: true, text: m.hashText(x, "md5") }));
  },
  // Escapes
  jsonEscape: async () => {
    const m = await Promise.resolve().then(() => (init_utilities2(), utilities_exports2));
    await runTransform("Escape as JSON string", (x) => ({ ok: true, text: m.escapeJsonString(x) }));
  },
  jsonUnescape: async () => {
    const m = await Promise.resolve().then(() => (init_utilities2(), utilities_exports2));
    await runTransform("Unescape JSON string", (x) => m.unescapeJsonString(x));
  },
  // String literals for code
  literalJava: async () => {
    const m = await Promise.resolve().then(() => (init_codeLiteral(), codeLiteral_exports));
    await runTransform(
      "Java string literal",
      text((x) => m.toStringLiteral(x, "java"))
    );
  },
  literalCSharp: async () => {
    const m = await Promise.resolve().then(() => (init_codeLiteral(), codeLiteral_exports));
    await runTransform(
      "C# string literal",
      text((x) => m.toStringLiteral(x, "csharp"))
    );
  },
  literalPython: async () => {
    const m = await Promise.resolve().then(() => (init_codeLiteral(), codeLiteral_exports));
    await runTransform(
      "Python string literal",
      text((x) => m.toStringLiteral(x, "python"))
    );
  },
  // Compare and regex
  compareWithClipboard: async () => {
    const quick = await Promise.resolve().then(() => (init_quickDiff(), quickDiff_exports));
    await quick.selectionVsClipboard();
  },
  openRegex: async () => {
    const regex = await Promise.resolve().then(() => (init_regexTool(), regexTool_exports));
    await regex.run();
  }
};
function registerContextActions(context) {
  for (const [name, action] of Object.entries(contextActions)) {
    context.subscriptions.push(vscode6.commands.registerCommand(`devtool.ctx.${name}`, action));
  }
}

// src/ui/fileActions.ts
var vscode7 = __toESM(require("vscode"));
var fs = __toESM(require("fs/promises"));
var MAX_FILE_BYTES = 5 * 1024 * 1024;
async function readFileText(uri) {
  const stat2 = await fs.stat(uri.fsPath);
  if (stat2.size > MAX_FILE_BYTES) {
    void vscode7.window.showErrorMessage(
      `File is larger than 5 MB (${Math.round(stat2.size / 1024 / 1024)} MB). Dev Tool does not process it.`
    );
    return void 0;
  }
  const text2 = await fs.readFile(uri.fsPath, "utf8");
  if (text2.includes("\0")) {
    void vscode7.window.showErrorMessage("This looks like a binary file. Dev Tool works on text files.");
    return void 0;
  }
  return text2;
}
async function show(title, text2, language = "plaintext") {
  const doc = await vscode7.workspace.openTextDocument({ content: text2, language });
  await vscode7.window.showTextDocument(doc, { preview: true, viewColumn: vscode7.ViewColumn.Beside });
  void vscode7.window.showInformationMessage(`${title}: done.`);
}
function targetOf(uri) {
  return uri ?? vscode7.window.activeTextEditor?.document.uri;
}
var fileActions = {
  sha256: async (uri) => {
    const target2 = targetOf(uri);
    if (!target2) return;
    const text2 = await readFileText(target2);
    if (text2 === void 0) return;
    const { hashText: hashText2 } = await Promise.resolve().then(() => (init_hash(), hash_exports));
    await show("SHA-256", `${hashText2(text2, "sha256")}  ${target2.fsPath}`);
  },
  base64: async (uri) => {
    const target2 = targetOf(uri);
    if (!target2) return;
    const text2 = await readFileText(target2);
    if (text2 === void 0) return;
    const { base64Encode: base64Encode2 } = await Promise.resolve().then(() => (init_base64(), base64_exports));
    const r = base64Encode2(text2);
    if (r.ok) await show("Base64", r.text);
  },
  jsonValidate: async (uri) => {
    const target2 = targetOf(uri);
    if (!target2) return;
    const text2 = await readFileText(target2);
    if (text2 === void 0) return;
    const { validateJson: validateJson2 } = await Promise.resolve().then(() => (init_format(), format_exports));
    const r = validateJson2(text2);
    void (r.ok ? vscode7.window.showInformationMessage("Valid JSON.") : vscode7.window.showErrorMessage(r.message));
  },
  jsonFormat: async (uri) => {
    const target2 = targetOf(uri);
    if (!target2) return;
    const text2 = await readFileText(target2);
    if (text2 === void 0) return;
    const { formatJson: formatJson2 } = await Promise.resolve().then(() => (init_format(), format_exports));
    const r = formatJson2(text2);
    if (r.ok) await show("Format JSON", r.text, "json");
    else void vscode7.window.showErrorMessage(r.message);
  },
  dataUri,
  stats: async (uri) => {
    const target2 = targetOf(uri);
    if (!target2) return;
    const text2 = await readFileText(target2);
    if (text2 === void 0) return;
    const { countStats: countStats3 } = await Promise.resolve().then(() => (init_textUtils(), textUtils_exports));
    const s = countStats3(text2);
    await show(
      "File statistics",
      `File: ${target2.fsPath}
Characters: ${s.characters}
Words: ${s.words}
Lines: ${s.lines}`
    );
  }
};
async function dataUri(uri) {
  const target2 = targetOf(uri);
  if (!target2) return;
  const ext = target2.fsPath.slice(target2.fsPath.lastIndexOf("."));
  const { mimeForExtension: mimeForExtension2, toDataUri: toDataUri2, formatBytes: formatBytes2 } = await Promise.resolve().then(() => (init_dataUri(), dataUri_exports));
  const mime = mimeForExtension2(ext);
  if (!mime)
    return void vscode7.window.showErrorMessage("Not a supported image type (PNG, JPEG, GIF, WebP, SVG, BMP, ICO).");
  const stat2 = await fs.stat(target2.fsPath);
  if (stat2.size > 2 * 1024 * 1024)
    return void vscode7.window.showErrorMessage(`Image is ${formatBytes2(stat2.size)}; the limit is 2 MB.`);
  const r = toDataUri2(await fs.readFile(target2.fsPath), mime);
  if (!r.ok) return void vscode7.window.showErrorMessage(r.message);
  await show(`Data URI (${formatBytes2(stat2.size)})`, r.text);
}
function registerFileActions(context) {
  for (const [name, action] of Object.entries(fileActions)) {
    context.subscriptions.push(vscode7.commands.registerCommand(`devtool.file.${name}`, action));
  }
}

// src/extension.ts
function activate(context) {
  registerTool("text-diff", async () => (await Promise.resolve().then(() => (init_diffTool(), diffTool_exports))).tool);
  registerTool("quick-diff", async () => (await Promise.resolve().then(() => (init_quickDiff(), quickDiff_exports))).tool);
  const quick = () => Promise.resolve().then(() => (init_quickDiff(), quickDiff_exports));
  registerTool("regex-playground", async () => (await Promise.resolve().then(() => (init_regexTool(), regexTool_exports))).tool);
  registerTool("regex-library", async () => (await Promise.resolve().then(() => (init_libraryTool(), libraryTool_exports))).tool);
  registerTool("json-format", async () => (await Promise.resolve().then(() => (init_jsonTool(), jsonTool_exports))).tool);
  registerTool("json-compare", async () => (await Promise.resolve().then(() => (init_compareTool(), compareTool_exports))).tool);
  registerTool("base64", async () => (await Promise.resolve().then(() => (init_base64Tool(), base64Tool_exports))).tool);
  registerTool("url-encode", async () => (await Promise.resolve().then(() => (init_urlTool(), urlTool_exports))).tool);
  registerTool("uuid", async () => (await Promise.resolve().then(() => (init_uuidTool(), uuidTool_exports))).tool);
  registerTool("hash", async () => (await Promise.resolve().then(() => (init_hashTool(), hashTool_exports))).tool);
  registerTool("text-utilities", async () => (await Promise.resolve().then(() => (init_textUtilsTool(), textUtilsTool_exports))).tool);
  registerTool("json-to-ts", async () => (await Promise.resolve().then(() => (init_toTsTool(), toTsTool_exports))).tool);
  registerTool("encoding-conversion", async () => (await Promise.resolve().then(() => (init_conversionTool(), conversionTool_exports))).tool);
  registerTool("generators", async () => (await Promise.resolve().then(() => (init_generatorsTool(), generatorsTool_exports))).tool);
  registerContextActions(context);
  registerFileActions(context);
  registerTool("developer-references", async () => (await Promise.resolve().then(() => (init_referencesTool(), referencesTool_exports))).tool);
  registerTool("developer-utilities", async () => (await Promise.resolve().then(() => (init_utilitiesTool(), utilitiesTool_exports))).tool);
  registerTool("jwt-decode", async () => (await Promise.resolve().then(() => (init_jwtTool(), jwtTool_exports))).tool);
  registerTool("timestamps", async () => (await Promise.resolve().then(() => (init_timestampsTool(), timestampsTool_exports))).tool);
  registerTool("json-utilities", async () => (await Promise.resolve().then(() => (init_utilitiesTool2(), utilitiesTool_exports2))).tool);
  context.subscriptions.push(
    vscode21.commands.registerCommand("devtool.jsonFormat", async () => (await Promise.resolve().then(() => (init_jsonTool(), jsonTool_exports))).run())
  );
  const regex = () => Promise.resolve().then(() => (init_regexTool(), regexTool_exports));
  context.subscriptions.push(
    vscode21.workspace.onDidChangeTextDocument(async (e) => (await regex()).onDocumentChanged(e))
  );
  const diff = () => Promise.resolve().then(() => (init_diffTool(), diffTool_exports));
  const state2 = new ToolState(context.globalState);
  const tree = new ToolTreeProvider(state2);
  const view = vscode21.window.createTreeView("devtool.tools", {
    treeDataProvider: tree,
    showCollapseAll: true
  });
  const openTool = async (toolId) => {
    const tool20 = TOOLS.find((t) => t.id === toolId);
    if (!tool20) {
      void vscode21.window.showInformationMessage(`Unknown tool: ${toolId}`);
      return;
    }
    const loading = loadTool(tool20.id);
    if (!loading) {
      void vscode21.window.showErrorMessage(`${tool20.label} has no loader registered.`);
      return;
    }
    await state2.markUsed(toolId);
    tree.refresh();
    try {
      const module2 = await loading;
      await module2.run();
    } catch (err) {
      void vscode21.window.showErrorMessage(`${tool20.label} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  context.subscriptions.push(
    tree,
    view,
    vscode21.commands.registerCommand("devtool.openTool", openTool),
    vscode21.commands.registerCommand("devtool.searchTools", async () => {
      const toolId = await searchTools();
      if (toolId) {
        await openTool(toolId);
      }
    }),
    vscode21.commands.registerCommand("devtool.regexReplace", async () => (await regex()).replace()),
    vscode21.commands.registerCommand("devtool.regexCopy", async () => (await regex()).copyRegex()),
    vscode21.commands.registerCommand("devtool.quickClipboard", async () => (await quick()).selectionVsClipboard()),
    vscode21.commands.registerCommand("devtool.quickTwoSelections", async () => (await quick()).twoSelections()),
    vscode21.commands.registerCommand("devtool.quickFiles", async () => (await quick()).twoFiles()),
    vscode21.commands.registerCommand("devtool.diffSwap", async () => (await diff()).swap()),
    vscode21.commands.registerCommand("devtool.diffClear", async () => (await diff()).clear()),
    vscode21.commands.registerCommand("devtool.diffSummary", async () => (await diff()).summarize()),
    vscode21.commands.registerCommand("devtool.diffCopy", async () => (await diff()).copyDifferences()),
    vscode21.commands.registerCommand("devtool.toggleFavorite", async (node) => {
      const toolId = node?.tool?.id;
      if (toolId) {
        await state2.toggleFavorite(toolId);
        tree.refresh();
      }
    }),
    vscode21.commands.registerCommand(
      "devtool.showTools",
      () => vscode21.commands.executeCommand("workbench.view.extension.devtool")
    ),
    vscode21.commands.registerCommand("devtool.refreshTools", () => tree.refresh()),
    vscode21.commands.registerCommand("devtool.clearState", async () => {
      await state2.reset();
      tree.refresh();
      void vscode21.window.showInformationMessage("Dev Tool: favourites and recently used tools cleared.");
    }),
    vscode21.commands.registerCommand(
      "devtool.reloadWindow",
      () => (
        // Reloading the window restarts every extension, including Dev Tool.
        vscode21.commands.executeCommand("workbench.action.reloadWindow")
      )
    ),
    vscode21.commands.registerCommand(
      "devtool.openWorkbench",
      async () => (await Promise.resolve().then(() => (init_workbench(), workbench_exports))).openWorkbench(context)
    ),
    vscode21.commands.registerCommand(
      "devtool.version",
      () => vscode21.window.showInformationMessage(`Dev Tool version ${String(context.extension.packageJSON.version)}`)
    )
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
