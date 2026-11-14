// Line and text utilities. Pure logic, no VS Code dependency.

const splitLines = (text: string): string[] => text.split(/\r?\n/);

export function removeDuplicateLines(text: string, ignoreCase = false): string {
  const seen = new Set<string>();
  return splitLines(text)
    .filter((line) => {
      const key = ignoreCase ? line.toLowerCase() : line;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join("\n");
}

export function sortLines(text: string, options: { descending?: boolean; ignoreCase?: boolean } = {}): string {
  const cmp = (a: string, b: string) => {
    const x = options.ignoreCase ? a.toLowerCase() : a;
    const y = options.ignoreCase ? b.toLowerCase() : b;
    return x < y ? -1 : x > y ? 1 : 0;
  };
  const sorted = splitLines(text).sort(cmp);
  return (options.descending ? sorted.reverse() : sorted).join("\n");
}

export function reverseLines(text: string): string {
  return splitLines(text).reverse().join("\n");
}

export function trimLines(text: string): string {
  return splitLines(text).map((l) => l.trim()).join("\n");
}

export function removeEmptyLines(text: string): string {
  return splitLines(text).filter((l) => l.trim() !== "").join("\n");
}

export type FindOptions = { useRegex?: boolean; ignoreCase?: boolean };

// Literal by default. Returns the count of replacements too, so the UI can report it.
export function findReplace(text: string, find: string, replacement: string, options: FindOptions = {}): { text: string; count: number; error?: string } {
  if (find === "") return { text, count: 0, error: "Search text is empty." };
  const flags = "g" + (options.ignoreCase ? "i" : "");
  const source = options.useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let re: RegExp;
  try {
    re = new RegExp(source, flags);
  } catch (err) {
    return { text, count: 0, error: err instanceof Error ? err.message : "Invalid pattern." };
  }
  let count = 0;
  const out = text.replace(re, (...args) => {
    count++;
    return options.useRegex ? replacement.replace(/\$(\d)/g, (_, n) => (args[Number(n)] ?? "")) : replacement;
  });
  return { text: out, count };
}

export function convertLineEndings(text: string, to: "lf" | "crlf"): string {
  const lf = text.replace(/\r\n/g, "\n");
  return to === "crlf" ? lf.replace(/\n/g, "\r\n") : lf;
}

export function countStats(text: string): { characters: number; words: number; lines: number } {
  const trimmed = text.trim();
  return {
    characters: [...text].length,
    words: trimmed === "" ? 0 : trimmed.split(/\s+/).length,
    lines: text === "" ? 0 : text.split(/\r?\n/).length
  };
}
