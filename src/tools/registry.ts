// Tool metadata only. Business logic for each tool lives in its own module and is loaded lazily.
export type CategoryId =
  | "text-diff"
  | "regex"
  | "json-data"
  | "encoding"
  | "generators"
  | "developer";

export interface Category {
  id: CategoryId;
  label: string;
}

export interface ToolDefinition {
  id: string;
  label: string;
  category: CategoryId;
  description: string;
}

export const CATEGORIES: readonly Category[] = [
  { id: "text-diff", label: "Text & Diff" },
  { id: "regex", label: "Regex" },
  { id: "json-data", label: "JSON & Data" },
  { id: "encoding", label: "Encoding & Conversion" },
  { id: "generators", label: "Generators" },
  { id: "developer", label: "Developer Utilities" }
];

// Phase 1 registers the tool list only; implementations arrive in later phases.
export const TOOLS: readonly ToolDefinition[] = [
  { id: "text-diff", label: "Text Diff Comparator", category: "text-diff", description: "Compare two texts side by side" },
  { id: "quick-diff", label: "Quick Diff", category: "text-diff", description: "Diff selection vs clipboard, blocks or files" },
  { id: "text-utilities", label: "Text Utilities", category: "text-diff", description: "Dedupe, sort, trim, find/replace and more" },
  { id: "regex-playground", label: "Regex Playground", category: "regex", description: "Live matches, groups and replace preview" },
  { id: "regex-library", label: "Regex Library", category: "regex", description: "Common ready-to-use patterns" },
  { id: "json-format", label: "JSON Formatter", category: "json-data", description: "Format, minify and validate JSON" },
  { id: "json-compare", label: "JSON Comparator", category: "json-data", description: "Compare two JSON documents" },
  { id: "json-to-ts", label: "JSON to TypeScript", category: "json-data", description: "Generate interfaces from JSON" },
  { id: "json-utilities", label: "JSON Utilities", category: "json-data", description: "JSON/CSV, JSONPath, escape" },
  { id: "base64", label: "Base64", category: "encoding", description: "Encode and decode Base64" },
  { id: "url-encode", label: "URL Encode/Decode", category: "encoding", description: "Percent-encoding" },
  { id: "encoding-conversion", label: "Encoding & Conversion", category: "encoding", description: "HTML entities, Unicode, hex, binary, string escapes" },
  { id: "timestamps", label: "Timestamp Converter", category: "encoding", description: "Unix time and dates" },
  { id: "uuid", label: "UUID v4 Generator", category: "generators", description: "Random UUIDs" },
  { id: "generators", label: "Generators", category: "generators", description: "Random strings, passwords, Lorem Ipsum, sample JSON, SQL INSERT" },
  { id: "hash", label: "Hash Generator", category: "generators", description: "MD5, SHA-1, SHA-256, SHA-512" },
  { id: "developer-utilities", label: "Cron, Permissions, Colour, SQL", category: "developer", description: "Cron helper, Unix permissions, colour converter, SQL formatter" },
  { id: "jwt-decode", label: "JWT Decoder", category: "developer", description: "Decode header and payload (no signature check)" }
];
