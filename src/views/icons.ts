// Codicon names used by the Tools view. Pure data so tests can check coverage.
import type { CategoryId } from "../tools/registry";

// Codicon names (built into VS Code, so they follow the theme).
export const CATEGORY_ICONS: Record<CategoryId, string> = {
  "text-diff": "diff",
  regex: "regex",
  "json-data": "file-code",
  encoding: "arrow-swap",
  generators: "wand",
  developer: "terminal"
};

export const TOOL_ICONS: Record<string, string> = {
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
