// Regex matching logic. Pure, no VS Code dependency.
// Matching uses the JavaScript engine. Other engines (Python, Java) are approximated by
// warnings: the pattern may behave differently there.

export type Engine = "javascript" | "python" | "java";

export interface RegexRequest {
  pattern: string;
  flags: string; // any of g, i, m, s, u
  text: string;
}

export interface MatchResult {
  index: number;
  match: string;
  groups: (string | undefined)[];
  named: Record<string, string | undefined>;
}

export const MAX_MATCHES = 1000;
const ALLOWED_FLAGS = "gimsu";

export function validateFlags(flags: string): string | undefined {
  for (const f of flags) {
    if (!ALLOWED_FLAGS.includes(f)) return `Unknown flag "${f}". Allowed: ${ALLOWED_FLAGS}.`;
  }
  return undefined;
}

// Builds a RegExp, or returns a readable error (with the engine's message) if invalid.
export function compile(pattern: string, flags: string): { regex?: RegExp; error?: string } {
  const flagError = validateFlags(flags);
  if (flagError) return { error: flagError };
  // Always iterate with exec, so the global flag is required for multiple matches.
  const unique = Array.from(new Set(flags + "g")).join("");
  try {
    return { regex: new RegExp(pattern, unique) };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid regular expression." };
  }
}

export function findMatches(req: RegexRequest): { matches: MatchResult[]; error?: string; truncated: boolean } {
  const { regex, error } = compile(req.pattern, req.flags);
  if (!regex) return { matches: [], error, truncated: false };

  const matches: MatchResult[] = [];
  let m: RegExpExecArray | null;
  regex.lastIndex = 0;
  while ((m = regex.exec(req.text)) !== null) {
    if (matches.length >= MAX_MATCHES) {
      return { matches, truncated: true };
    }
    matches.push({
      index: m.index,
      match: m[0],
      groups: m.slice(1),
      named: { ...(m.groups ?? {}) }
    });
    // Avoid an infinite loop on zero-length matches.
    if (m[0].length === 0) regex.lastIndex++;
  }
  return { matches, truncated: false };
}

export function replacePreview(
  req: RegexRequest,
  replacement: string
): { result?: string; count: number; error?: string } {
  const { regex, error } = compile(req.pattern, req.flags);
  if (!regex) return { count: 0, error };
  let count = 0;
  const result = req.text.replace(regex, (...args) => {
    count++;
    return expandReplacement(replacement, args);
  });
  return { result, count };
}

// Expands $1, $<name>, $& in a replacement string for a single match.
function expandReplacement(template: string, args: unknown[]): string {
  const hasNamed = typeof args[args.length - 1] === "object";
  const groups = hasNamed ? (args[args.length - 1] as Record<string, string>) : undefined;
  const captures = args.slice(0, hasNamed ? -3 : -2) as (string | undefined)[];
  return template.replace(/\$(\$|&|\d{1,2}|<[^>]+>)/g, (token, key: string) => {
    if (key === "$") return "$";
    if (key === "&") return captures[0] ?? "";
    if (key.startsWith("<")) return groups?.[key.slice(1, -1)] ?? "";
    const n = Number(key);
    return n >= 1 && n < captures.length ? (captures[n] ?? "") : token;
  });
}

// Portability hints for the selected target engine. Empty when nothing is known to differ.
export function portabilityWarnings(pattern: string, flags: string, engine: Engine): string[] {
  const warnings: string[] = [];
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
