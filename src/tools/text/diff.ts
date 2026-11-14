// Line-based diff. Pure logic, no VS Code dependency.

export type DiffKind = "equal" | "added" | "removed";

export interface DiffLine {
  kind: DiffKind;
  text: string;
  leftLine?: number; // 1-based line number on the left side, when present
  rightLine?: number; // 1-based line number on the right side, when present
}

export interface DiffOptions {
  ignoreWhitespace?: boolean; // collapse runs of whitespace and trim ends before comparing
  ignoreCase?: boolean;
}

// Above this many lines per side, the O(n*m) table is too large; callers get a clear error.
export const MAX_LINES = 5000;

function normalize(line: string, options: DiffOptions): string {
  let value = line;
  if (options.ignoreWhitespace) {
    value = value.replace(/\s+/g, " ").trim();
  }
  if (options.ignoreCase) {
    value = value.toLowerCase();
  }
  return value;
}

export function diffLines(left: string, right: string, options: DiffOptions = {}): DiffLine[] {
  const a = left === "" ? [] : left.split(/\r?\n/);
  const b = right === "" ? [] : right.split(/\r?\n/);
  if (a.length > MAX_LINES || b.length > MAX_LINES) {
    throw new RangeError(`Input too large: more than ${MAX_LINES} lines per side.`);
  }

  const na = a.map((l) => normalize(l, options));
  const nb = b.map((l) => normalize(l, options));

  // Longest common subsequence table, built from the end so we can walk forward.
  const n = na.length;
  const m = nb.length;
  const table: Uint32Array[] = [];
  for (let i = 0; i <= n; i++) table.push(new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] = na[i] === nb[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
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

export function diffSummary(lines: DiffLine[]): { added: number; removed: number; equal: number } {
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
