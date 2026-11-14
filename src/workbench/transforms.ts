// Transforms offered by the Workbench panel. Pure functions: text in, text or error out.
// No VS Code imports, so every transform is unit tested.

import { base64Encode, base64Decode } from "../tools/encoding/base64";
import { urlEncode, urlDecode } from "../tools/encoding/url";
import { htmlEncode, htmlDecode, textToHex, hexToText } from "../tools/encoding/conversion";
import { formatJson, minifyJson, validateJson } from "../tools/json/format";
import { escapeJsonString, unescapeJsonString } from "../tools/json/utilities";
import { formatSql } from "../tools/developer/utilities";
import { formatXml as formatXmlStrict } from "../tools/developer/references";
import {
  removeDuplicateLines,
  sortLines,
  trimLines,
  reverseLines,
  removeEmptyLines,
  countStats
} from "../tools/text/textUtils";
import { hashText } from "../tools/generators/hash";

export type TransformResult = { ok: true; text: string } | { ok: false; message: string };
export type Group = "Encode" | "Format" | "Text" | "Hash" | "Escape" | "Inspect";

export interface Transform {
  id: string;
  label: string;
  group: Group;
  run: (input: string) => TransformResult;
}

const plain =
  (fn: (x: string) => string) =>
  (x: string): TransformResult => ({ ok: true, text: fn(x) });

export const TRANSFORMS: readonly Transform[] = [
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
  { id: "xml-format", label: "XML format and validate", group: "Format", run: (x) => formatXmlStrict(x) },

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
      return `Characters: ${s.characters}\nWords: ${s.words}\nLines: ${s.lines}`;
    })
  }
];

export function findTransform(id: string): Transform | undefined {
  return TRANSFORMS.find((t) => t.id === id);
}

// Keeps the output readable for very large results in the webview.
export const MAX_OUTPUT_CHARS = 2_000_000;

export function runTransform(id: string, input: string): TransformResult {
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
