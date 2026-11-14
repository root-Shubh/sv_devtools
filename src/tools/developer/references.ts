// Developer references and small formatters: XML, escape visualiser, HTTP status codes, MIME types.
// Pure logic, no VS Code dependency.

// ---------- XML: tokenise, validate balance, and pretty-print ----------

export type XmlResult = { ok: true; text: string } | { ok: false; message: string };

// Tokens: tags (open, close, self-closing), declarations/comments/PIs, and text.
const TOKEN =
  /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<![\s\S]*?>|<\/\s*[A-Za-z_][\w.\-:]*\s*>|<[A-Za-z_][\w.\-:]*(?:\s[^<>]*)?\/?>|[^<]+|</g;

export function formatXml(xml: string, indent = "  "): XmlResult {
  const tokens = xml.match(TOKEN) ?? [];
  if (tokens.join("") !== xml) {
    return { ok: false, message: "Could not parse XML (check for unclosed '<' or stray characters)." };
  }
  const stack: string[] = [];
  const lines: string[] = [];
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

export function validateXml(xml: string): XmlResult {
  const r = formatXml(xml);
  return r.ok ? { ok: true, text: "Well-formed XML." } : r;
}

// ---------- Escape visualiser: show each character's code point and escaped form ----------

export function visualiseEscapes(text: string): string {
  const rows: string[] = [];
  const named: Record<string, string> = { "\n": "\\n", "\r": "\\r", "\t": "\\t", " ": "space" };
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    const label = named[ch] ?? (cp < 0x20 || cp === 0x7f ? "control" : ch);
    rows.push(
      `${JSON.stringify(ch).slice(1, -1).padEnd(8)} U+${cp.toString(16).toUpperCase().padStart(4, "0")}  ${label}`
    );
  }
  return rows.length ? rows.join("\n") : "(empty)";
}

// ---------- HTTP status codes ----------

export const HTTP_STATUS: readonly { code: number; name: string; meaning: string }[] = [
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

// ---------- MIME types ----------

export const MIME_TYPES: readonly { ext: string; mime: string; use: string }[] = [
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
