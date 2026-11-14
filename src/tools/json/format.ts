// JSON formatting, minifying and validation. Pure logic, no VS Code dependency.

export type JsonResult =
  | { ok: true; text: string }
  | { ok: false; message: string; line?: number; column?: number };

// Converts a character offset into a 1-based line and column.
export function positionToLineColumn(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

export function validateJson(text: string): JsonResult {
  if (text.trim() === "") {
    return { ok: false, message: "Input is empty." };
  }
  try {
    JSON.parse(text);
    return { ok: true, text };
  } catch (err) {
    const raw = err instanceof Error ? err.message : "Invalid JSON.";
    // Node reports "... at position N" (or "in JSON at position N" in older versions).
    const match = /position (\d+)/.exec(raw);
    if (match) {
      const { line, column } = positionToLineColumn(text, Number(match[1]));
      return { ok: false, message: `Invalid JSON at line ${line}, column ${column}: ${raw}`, line, column };
    }
    return { ok: false, message: `Invalid JSON: ${raw}` };
  }
}

export function formatJson(text: string, indent: number | "\t" = 2): JsonResult {
  const v = validateJson(text);
  if (!v.ok) return v;
  return { ok: true, text: JSON.stringify(JSON.parse(text), null, indent) };
}

export function minifyJson(text: string): JsonResult {
  const v = validateJson(text);
  if (!v.ok) return v;
  return { ok: true, text: JSON.stringify(JSON.parse(text)) };
}
